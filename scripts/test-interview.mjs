import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'interview-agent-test-'));
const bundledHandler = join(temporaryDirectory, 'interview-api.mjs');
const bundledEngine = join(temporaryDirectory, 'interview-engine.mjs');
const bundledGemini = join(temporaryDirectory, 'gemini.mjs');
const bundledEvidence = join(temporaryDirectory, 'evidence.mjs');
const esbuild = join(projectRoot, 'node_modules/.bin/esbuild');

for (const [entryPoint, output] of [
  [join(projectRoot, 'api/interview.ts'), bundledHandler],
  [join(projectRoot, 'server/interviewEngine.ts'), bundledEngine],
  [join(projectRoot, 'server/gemini.ts'), bundledGemini],
  [join(projectRoot, 'src/evidence.ts'), bundledEvidence],
]) {
  execFileSync(esbuild, [entryPoint, '--bundle', '--platform=node', '--format=esm', `--outfile=${output}`]);
}

const candidatesData = JSON.parse(readFileSync(join(projectRoot, 'data/raw/candidates_(1).json'), 'utf8'));
const curriculumData = JSON.parse(readFileSync(join(projectRoot, 'data/raw/curriculum.json'), 'utf8'));
const { default: handler } = await import(pathToFileURL(bundledHandler).href);
const {
  MAX_INTERVIEW_QUESTIONS,
  continueSession,
  initializeSession,
} = await import(pathToFileURL(bundledEngine).href);
const {
  DEFAULT_GEMINI_MODEL,
  GEMINI_ASSESSMENT_TIMEOUT_MS,
  GEMINI_FEEDBACK_TIMEOUT_MS,
  getGeminiClient,
} = await import(pathToFileURL(bundledGemini).href);
const {
  buildInterviewPath,
  buildSignalValidations,
  explainCurrentQuestion,
  findFeedbackEvidence,
} = await import(pathToFileURL(bundledEvidence).href);

class TestResponse {
  statusCode = 200;
  body = undefined;

  status(code) {
    this.statusCode = code;
    return this;
  }

  setHeader() {}

  json(body) {
    this.body = body;
  }
}

async function request(body, method = 'POST') {
  const response = new TestResponse();
  await handler({ method, body }, response);
  return response;
}

function curriculumDay(dayNumber) {
  return curriculumData.days.find((entry) => entry.day === dayNumber);
}

function assertQuestion(response, deterministic = false) {
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.done, false);
  assert.ok(response.body.question);
  const day = curriculumDay(response.body.question.day);
  assert.ok(day, `Day ${response.body.question.day} must exist in the curriculum.`);
  if (deterministic) {
    assert.ok(day.objectives.some((objective) => response.body.reply.includes(objective)));
  }
}

function adaptiveTurn({
  quality = 'partial',
  action = 'follow_up',
  day,
  difficulty = 'standard',
  reply = 'What specific technical detail would you add?',
  understood = ['basic concept'],
  missing = ['implementation detail'],
  note = 'The answer identified the concept but omitted an implementation detail.',
}) {
  return {
    assessment: {
      quality,
      conceptsUnderstood: understood,
      conceptsMissing: missing,
      note,
    },
    decision: { action, day, difficulty },
    reply,
  };
}

function mockAI(turn, feedback = null) {
  return {
    assess: async () => turn,
    feedback: async () => feedback,
  };
}

function geminiResponse(value) {
  return new Response(JSON.stringify({
    candidates: [{ content: { parts: [{ text: JSON.stringify(value) }] } }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

function geminiTextResponse(value) {
  return new Response(JSON.stringify({
    candidates: [{ content: { parts: [{ text: value }] }, finishReason: 'STOP' }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

function assertFeedbackShape(feedback) {
  assert.deepEqual(Object.keys(feedback).sort(), ['gaps', 'next', 'strengths', 'summary']);
  assert.equal(typeof feedback.summary, 'string');
  assert.ok(Array.isArray(feedback.strengths));
  assert.ok(Array.isArray(feedback.gaps));
  assert.ok(Array.isArray(feedback.next));
}

function eligibleForFinish(state) {
  return {
    ...state,
    questionCount: 8,
    coveredDays: state.targetDays.slice(0, 4),
  };
}

const originalEnvironment = {
  nodeEnv: process.env.NODE_ENV,
  vercelEnv: process.env.VERCEL_ENV,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
  legacySupabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL,
};
const originalFetch = globalThis.fetch;

delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SECRET_KEY;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
delete process.env.GEMINI_API_KEY;
delete process.env.GEMINI_MODEL;
process.env.NODE_ENV = 'development';
delete process.env.VERCEL_ENV;

try {
  const candidate = candidatesData.candidates[1];

  // Weak answers receive a focused follow-up on the same curriculum day.
  const weakStart = initializeSession('weak-answer', candidate).state;
  const weakReply = 'What property of the vectors enables semantic similarity retrieval?';
  const weak = await continueSession(weakStart, 'They convert text into numbers.', mockAI(adaptiveTurn({
    quality: 'weak',
    day: weakStart.currentDay,
    difficulty: 'foundation',
    reply: weakReply,
    understood: ['embeddings are numeric representations'],
    missing: ['semantic distance'],
    note: 'The answer mentioned numeric conversion but not semantic similarity.',
  })));
  assert.equal(weak.response.reply, weakReply);
  assert.equal(weak.response.question.day, weakStart.currentDay);
  assert.deepEqual(weak.response.observation, {
    day: weakStart.currentDay,
    quality: 'weak',
    conceptsUnderstood: ['embeddings are numeric representations'],
    conceptsMissing: ['semantic distance'],
  });
  assert.equal('note' in weak.response.observation, false);
  assert.equal(weak.state.observations[0].quality, 'weak');
  assert.deepEqual(weak.state.observations[0].conceptsMissing, ['semantic distance']);

  let previousObservationWasAvailable = false;
  await continueSession(weak.state, 'A more detailed second answer.', {
    assess: async (state) => {
      previousObservationWasAvailable = state.observations.some((observation) => observation.note.includes('semantic similarity'));
      return adaptiveTurn({
        action: 'new_topic',
        day: state.targetDays.find((day) => day !== state.currentDay),
        reply: 'How would you validate retrieval quality with a fixed evaluation set?',
      });
    },
    feedback: async () => null,
  });
  assert.equal(previousObservationWasAvailable, true);

  // Strong answers can deepen difficulty while remaining on the same topic.
  const strongStart = initializeSession('strong-answer', candidate).state;
  const deeperReply = 'How would you detect and mitigate embedding drift in production?';
  const strong = await continueSession(strongStart, 'A detailed answer with trade-offs.', mockAI(adaptiveTurn({
    quality: 'strong',
    day: strongStart.currentDay,
    difficulty: 'deep',
    reply: deeperReply,
    understood: ['architecture trade-offs', 'failure modes'],
    missing: [],
    note: 'The answer explained the architecture trade-offs and failure modes.',
  })));
  assert.equal(strong.response.reply, deeperReply);
  assert.equal(strong.response.question.difficulty, 'Deep');
  assert.equal(strong.response.question.day, strongStart.currentDay);

  // A valid new_topic decision changes to another selected curriculum day.
  const topicStart = initializeSession('new-topic', candidate).state;
  const nextDay = topicStart.targetDays.find((day) => day !== topicStart.currentDay);
  const topic = await continueSession(topicStart, 'Answer', mockAI(adaptiveTurn({
    action: 'new_topic',
    day: nextDay,
    difficulty: 'advanced',
    reply: 'How would you validate structured output before executing a tool call?',
  })));
  assert.equal(topic.response.question.day, nextDay);
  assert.equal(topic.state.currentTopic, curriculumDay(nextDay).title);

  // Repeated same-topic follow-ups are capped and forced onto a new target day.
  const stuckStart = initializeSession('stuck-topic', candidate).state;
  const repeatedQuestion = stuckStart.transcript[0];
  const stuckState = {
    ...stuckStart,
    questionCount: 3,
    transcript: [
      repeatedQuestion,
      { role: 'candidate', content: 'First answer' },
      { ...repeatedQuestion, content: 'Second question on the same topic' },
      { role: 'candidate', content: 'Second answer' },
      { ...repeatedQuestion, content: 'Third question on the same topic' },
    ],
    askedQuestions: [repeatedQuestion.content, 'Second question on the same topic', 'Third question on the same topic'],
  };
  const forcedForward = await continueSession(stuckState, 'Third answer', mockAI(adaptiveTurn({
    day: stuckState.currentDay,
    reply: 'A fourth same-topic follow-up that should be ignored?',
  })));
  assert.notEqual(forcedForward.response.question.day, stuckState.currentDay);
  assert.notEqual(forcedForward.response.reply, 'A fourth same-topic follow-up that should be ignored?');

  // Premature finish is rejected independently for question count and day coverage.
  const finishStart = initializeSession('premature-finish', candidate).state;
  const finishTurn = adaptiveTurn({ action: 'finish', day: finishStart.currentDay, reply: '' });
  const tooFewQuestions = await continueSession({
    ...finishStart,
    questionCount: 7,
    coveredDays: finishStart.targetDays.slice(0, 4),
  }, 'Answer seven', mockAI(finishTurn));
  assert.equal(tooFewQuestions.response.done, false);
  assert.equal(tooFewQuestions.state.questionCount, 8);

  const tooFewDays = await continueSession({
    ...finishStart,
    questionCount: 8,
    coveredDays: finishStart.targetDays.slice(0, 3),
  }, 'Eighth answer', mockAI(finishTurn));
  assert.equal(tooFewDays.response.done, false);
  assert.equal(tooFewDays.state.questionCount, 9);
  assert.ok(tooFewDays.state.coveredDays.length >= 4);

  // A valid finish uses interview-evidence feedback and returns exactly the public shape.
  const evidenceFeedback = {
    summary: 'The candidate connected retrieval design decisions to concrete failure modes.',
    strengths: [
      'Explained dense retrieval and metadata filtering trade-offs clearly.',
      'Identified monitoring signals for retrieval failures.',
    ],
    gaps: [
      'Did not explain how chunk overlap affects recall.',
      'Needed prompting to discuss reranking latency.',
    ],
    next: [
      'Revisit Day 10 retrieval evaluation objectives.',
      'Practice latency-aware reranking design scenarios.',
    ],
  };
  const validFinish = await continueSession(
    eligibleForFinish(initializeSession('valid-finish', candidate).state),
    'Final evidence-bearing answer',
    mockAI(finishTurn, evidenceFeedback),
  );
  assert.equal(validFinish.response.done, true);
  assert.deepEqual(Object.keys(validFinish.response.feedback).sort(), ['gaps', 'next', 'strengths', 'summary']);
  assert.deepEqual(validFinish.response.feedback, evidenceFeedback);
  assert.deepEqual(validFinish.state.feedback, evidenceFeedback);
  assert.ok(validFinish.state.observations.length > 0);

  // Current interview evidence outweighs historical attempts in deterministic fallback feedback.
  const historicalDifficultyState = {
    ...eligibleForFinish(initializeSession('historical-difficulty', candidate).state),
    currentDay: 10,
    currentTopic: curriculumDay(10).title,
  };
  const demonstratedProgress = await continueSession(
    historicalDifficultyState,
    'I would combine dense retrieval with metadata filters, then evaluate recall and reranking latency.',
    mockAI(adaptiveTurn({
      quality: 'strong',
      action: 'finish',
      day: 10,
      reply: '',
      understood: ['hybrid retrieval strategy', 'reranking trade-offs'],
      missing: [],
      note: 'The answer explained a retrieval strategy and its evaluation trade-offs.',
    })),
  );
  assert.match(demonstratedProgress.response.feedback.strengths.join(' '), /hybrid retrieval strategy/);
  assert.doesNotMatch(demonstratedProgress.response.feedback.gaps.join(' '), /Day 10|4 attempts/);

  const currentGap = await continueSession(
    { ...historicalDifficultyState, sessionId: 'current-gap' },
    'I would use embeddings.',
    mockAI(adaptiveTurn({
      quality: 'partial',
      action: 'finish',
      day: 10,
      reply: '',
      understood: ['dense retrieval'],
      missing: ['reranking failure modes'],
      note: 'The answer did not cover reranking failure modes.',
    })),
  );
  assert.match(currentGap.response.feedback.gaps.join(' '), /Day 10/);
  assert.match(currentGap.response.feedback.gaps.join(' '), /reranking failure modes/);

  // Evidence and adaptation presentation logic uses current observations, never history alone.
  const observedStrongDay10 = {
    day: 10,
    quality: 'strong',
    conceptsUnderstood: ['hybrid retrieval strategy', 'reranking trade-offs'],
    conceptsMissing: [],
    answer: 'I would combine dense retrieval with metadata filters, then evaluate recall and reranking latency.',
    questionNumber: 1,
    topic: curriculumDay(10).title,
    difficulty: 'Advanced',
  };
  const observedStrongDay16 = {
    day: 16,
    quality: 'good',
    conceptsUnderstood: ['stateless API design', 'external session state'],
    conceptsMissing: [],
    answer: 'I would keep the API stateless and store session state externally.',
    questionNumber: 2,
    topic: curriculumDay(16).title,
    difficulty: 'Advanced',
  };
  const observedPartialDay12 = {
    day: 12,
    quality: 'partial',
    conceptsUnderstood: ['prompt structure'],
    conceptsMissing: ['evaluation methodology'],
    answer: 'I would structure the prompt with clear instructions, but I have not defined the evaluation method.',
    questionNumber: 3,
    topic: curriculumDay(12).title,
    difficulty: 'Standard',
  };
  const validations = buildSignalValidations(candidate, [observedStrongDay10, observedStrongDay16, observedPartialDay12]);
  assert.equal(validations.find((entry) => entry.day === 10).status, 'IMPROVEMENT VALIDATED');
  assert.equal(validations.find((entry) => entry.day === 16).status, 'STRENGTH CONFIRMED');
  assert.equal(validations.find((entry) => entry.day === 12).status, 'NEEDS REINFORCEMENT');
  assert.deepEqual(buildSignalValidations(candidate, []), []);

  const unrecordedDay = curriculumData.days.find((day) => !candidate.missions.some((mission) => mission.day === day.day));
  assert.ok(unrecordedDay);
  const unrecordedValidation = buildSignalValidations(candidate, [{
    ...observedPartialDay12,
    day: unrecordedDay.day,
    topic: unrecordedDay.title,
  }]);
  assert.equal(unrecordedValidation[0].history, 'No recorded mission');
  assert.equal(unrecordedValidation[0].status, 'NEEDS REINFORCEMENT');

  const linkedEvidence = findFeedbackEvidence(
    'Demonstrated a hybrid retrieval strategy with reranking trade-offs.',
    'strength',
    [observedStrongDay10, observedStrongDay16],
  );
  assert.ok(linkedEvidence);
  assert.equal(linkedEvidence.excerpt, observedStrongDay10.answer);
  assert.equal(observedStrongDay10.answer.includes(linkedEvidence.excerpt), true);
  assert.equal(findFeedbackEvidence('Discussed unrelated deployment budgeting.', 'strength', [observedStrongDay10]), null);

  const followUpTurns = [
    { role: 'interviewer', content: 'How would you evaluate retrieval?', day: 10, topic: curriculumDay(10).title, difficulty: 'Standard' },
    { role: 'candidate', content: observedPartialDay12.answer },
    { role: 'interviewer', content: 'Which evaluation metric would you choose?', day: 10, topic: curriculumDay(10).title, difficulty: 'Standard' },
  ];
  const followUpObservation = { ...observedPartialDay12, day: 10, topic: curriculumDay(10).title, questionNumber: 1 };
  assert.equal(buildInterviewPath(candidate, followUpTurns, [followUpObservation])[1].label, 'FOLLOW-UP');
  assert.match(explainCurrentQuestion(candidate, followUpTurns, [followUpObservation]), /evaluation methodology/);

  const deepenTurns = [
    { role: 'interviewer', content: 'Explain retrieval fundamentals.', day: 10, topic: curriculumDay(10).title, difficulty: 'Standard' },
    { role: 'candidate', content: observedStrongDay10.answer },
    { role: 'interviewer', content: 'Now consider production failure modes.', day: 10, topic: curriculumDay(10).title, difficulty: 'Deep' },
  ];
  assert.equal(buildInterviewPath(candidate, deepenTurns, [observedStrongDay10])[1].label, 'DEEPEN');

  const newTopicTurns = [
    ...deepenTurns.slice(0, 2),
    { role: 'interviewer', content: 'How would you validate tool arguments?', day: 13, topic: curriculumDay(13).title, difficulty: 'Advanced' },
  ];
  assert.equal(buildInterviewPath(candidate, newTopicTurns, [observedStrongDay10])[1].label, 'NEW TOPIC');

  // The 12-question ceiling prevents endless model-requested follow-ups once hard minimums are met.
  const cappedState = {
    ...eligibleForFinish(initializeSession('capped', candidate).state),
    questionCount: MAX_INTERVIEW_QUESTIONS,
  };
  const capped = await continueSession(cappedState, 'Another answer', mockAI(adaptiveTurn({
    day: cappedState.currentDay,
    reply: 'Another follow-up?',
  }), evidenceFeedback));
  assert.equal(capped.response.done, true);
  assert.equal(capped.state.questionCount, MAX_INTERVIEW_QUESTIONS);

  // Existing API validation, deterministic fallback completion, and session isolation remain intact.
  const sessionA = `fallback-a-${Date.now()}`;
  const sessionB = `fallback-b-${Date.now()}`;
  assert.equal((await request({ candidate: candidatesData.candidates[0] })).statusCode, 400);
  assert.equal((await request({ sessionId: 'missing-candidate' })).statusCode, 400);
  assert.equal((await request({ sessionId: 'unknown', message: 'answer' })).statusCode, 404);
  assert.equal((await request({ sessionId: 'unknown', message: '   ' })).statusCode, 400);

  const startA = await request({ sessionId: sessionA, candidate: candidatesData.candidates[0] });
  const startB = await request({ sessionId: sessionB, candidate });
  assertQuestion(startA, true);
  assertQuestion(startB, true);
  let responseA = startA;
  let eighthQuestion = startA;
  for (let answerNumber = 1; answerNumber <= 8; answerNumber += 1) {
    responseA = await request({ sessionId: sessionA, message: `Answer ${answerNumber}` });
    if (answerNumber < 8) {
      assertQuestion(responseA, true);
      eighthQuestion = responseA;
    }
  }
  assert.equal(responseA.body.done, true);
  assert.equal(eighthQuestion.body.questionCount, 8);
  assert.ok(eighthQuestion.body.coveredDays.length >= 4);
  assert.deepEqual(Object.keys(responseA.body).sort(), ['done', 'feedback', 'reply']);
  assert.deepEqual(Object.keys(responseA.body.feedback).sort(), ['gaps', 'next', 'strengths', 'summary']);

  const continueB = await request({ sessionId: sessionB, message: 'Independent answer' });
  assertQuestion(continueB, true);
  assert.equal(continueB.body.questionCount, 2);

  // The real Gemini adapter accepts valid structured output without external calls.
  const adaptiveSession = `gemini-valid-${Date.now()}`;
  await request({ sessionId: adaptiveSession, candidate });
  const validGeminiTurn = adaptiveTurn({
    quality: 'weak',
    day: candidate.missions[0].day,
    difficulty: 'foundation',
    reply: 'Which distance metric would you choose here, and why?',
  });
  const geminiRequests = [];
  process.env.GEMINI_API_KEY = ['unit', 'test', 'gemini'].join('-');
  process.env.GEMINI_MODEL = 'gemini-test-override';
  globalThis.fetch = async (url, options) => {
    geminiRequests.push({ url, options });
    return geminiResponse(validGeminiTurn);
  };
  const adaptiveResponse = await request({ sessionId: adaptiveSession, message: 'It maps text to vectors.' });
  assertQuestion(adaptiveResponse);
  assert.equal(adaptiveResponse.body.reply, validGeminiTurn.reply);
  assert.equal(adaptiveResponse.body.observation.quality, 'weak');
  assert.equal('note' in adaptiveResponse.body.observation, false);
  assert.equal(geminiRequests.length, 1);
  assert.ok(geminiRequests[0].url.includes('gemini-test-override'));
  assert.ok(geminiRequests[0].options.headers['x-goog-api-key']);
  const assessmentRequest = JSON.parse(geminiRequests[0].options.body);
  const assessmentInstructions = assessmentRequest.contents[0].parts[0].text;
  assert.match(assessmentInstructions, /Default to neutral transitions/);
  assert.match(assessmentInstructions, /Avoid repetitive praise and inflated acknowledgements/);

  // The default model and feedback prompt preserve overrides while weighting current evidence first.
  assert.equal(DEFAULT_GEMINI_MODEL, 'gemini-3.5-flash');
  assert.equal(GEMINI_ASSESSMENT_TIMEOUT_MS, 12_000);
  assert.equal(GEMINI_FEEDBACK_TIMEOUT_MS, 30_000);
  assert.ok(GEMINI_FEEDBACK_TIMEOUT_MS > GEMINI_ASSESSMENT_TIMEOUT_MS);
  delete process.env.GEMINI_MODEL;
  const feedbackState = {
    ...historicalDifficultyState,
    observations: [
      {
        day: 10,
        quality: 'strong',
        conceptsUnderstood: ['hybrid retrieval strategy'],
        conceptsMissing: [],
        note: 'The answer demonstrated progress on retrieval design.',
      },
      {
        day: 12,
        quality: 'partial',
        conceptsUnderstood: ['prompt structure'],
        conceptsMissing: ['prompt evaluation criteria'],
        note: 'The answer omitted evaluation criteria.',
      },
    ],
  };
  const feedbackRequests = [];
  globalThis.fetch = async (url, options) => {
    feedbackRequests.push({ url, options });
    return geminiResponse(evidenceFeedback);
  };
  const geminiClient = getGeminiClient();
  assert.ok(geminiClient);
  assert.deepEqual(await geminiClient.feedback(feedbackState), evidenceFeedback);
  assert.equal(feedbackRequests.length, 1);
  assert.ok(feedbackRequests[0].url.includes('gemini-3.5-flash'));
  const feedbackRequest = JSON.parse(feedbackRequests[0].options.body);
  const feedbackInstructions = feedbackRequest.contents[0].parts[0].text;
  assert.match(feedbackInstructions, /Historical attempts or failure alone must never create a current gap/);
  assert.match(feedbackInstructions, /Strengths must state what the candidate demonstrated/);
  assert.match(feedbackInstructions, /progress_demonstrated/);
  assert.match(feedbackInstructions, /current_gap_evidence/);
  assert.match(feedbackInstructions, /latest observation represents current understanding/);

  // Common fenced JSON is parsed, while the validated public feedback shape remains exact.
  const fencedFeedback = {
    summary: 'The candidate demonstrated current understanding across the covered areas.',
    strengths: ['Explained the retrieval trade-off with current interview evidence.'],
    gaps: [],
    next: ['Continue practicing production retrieval evaluation.'],
  };
  globalThis.fetch = async () => geminiTextResponse(`\n\`\`\`json\n${JSON.stringify(fencedFeedback)}\n\`\`\`\n`);
  const parsedFencedFeedback = await geminiClient.feedback(feedbackState);
  assert.deepEqual(parsedFencedFeedback, fencedFeedback);
  assertFeedbackShape(parsedFencedFeedback);

  // A rate-limit retry honors Gemini retry metadata and can recover on the bounded second attempt.
  let rateLimitedCalls = 0;
  globalThis.fetch = async () => {
    rateLimitedCalls += 1;
    if (rateLimitedCalls === 1) {
      return new Response(JSON.stringify({
        error: {
          status: 'RESOURCE_EXHAUSTED',
          details: [{ '@type': 'type.googleapis.com/google.rpc.RetryInfo', retryDelay: '0s' }],
        },
      }), { status: 429, headers: { 'Content-Type': 'application/json' } });
    }
    return geminiResponse(evidenceFeedback);
  };
  assert.deepEqual(await geminiClient.feedback(feedbackState), evidenceFeedback);
  assert.equal(rateLimitedCalls, 2);

  // Successfully generated final feedback is returned and retained in session state.
  globalThis.fetch = async () => geminiResponse(evidenceFeedback);
  const generatedFinishState = eligibleForFinish(initializeSession('gemini-feedback-success', candidate).state);
  const generatedFinish = await continueSession(generatedFinishState, 'Final answer with evidence.', {
    assess: async () => adaptiveTurn({ action: 'finish', day: generatedFinishState.currentDay, reply: '' }),
    feedback: (state) => geminiClient.feedback(state),
  });
  assert.deepEqual(generatedFinish.response.feedback, evidenceFeedback);
  assert.deepEqual(generatedFinish.state.feedback, evidenceFeedback);
  assertFeedbackShape(generatedFinish.response.feedback);

  // Malformed final feedback logs only a safe diagnostic and falls back deterministically.
  const diagnosticLogs = [];
  const originalWarn = console.warn;
  console.warn = (...values) => diagnosticLogs.push(values.join(' '));
  const fakeGeminiSecret = ['sensitive', 'gemini', 'test', 'value'].join('-');
  process.env.GEMINI_API_KEY = fakeGeminiSecret;
  globalThis.fetch = async () => geminiTextResponse('not-json');
  const invalidFeedbackClient = getGeminiClient();
  const malformedFinishState = eligibleForFinish(initializeSession('gemini-feedback-malformed', candidate).state);
  const malformedFinal = await continueSession(malformedFinishState, 'Private candidate answer that must not be logged.', {
    assess: async () => adaptiveTurn({ action: 'finish', day: malformedFinishState.currentDay, reply: '' }),
    feedback: (state) => invalidFeedbackClient.feedback(state),
  });
  console.warn = originalWarn;
  assert.match(malformedFinal.response.feedback.summary, /fallback prioritizes available interview observations/);
  assert.deepEqual(malformedFinal.state.feedback, malformedFinal.response.feedback);
  assert.equal(diagnosticLogs.length, 1);
  assert.match(diagnosticLogs[0], /\[Gemini\] final feedback failed: invalid JSON/);
  assert.doesNotMatch(diagnosticLogs.join(' '), new RegExp(fakeGeminiSecret));
  assert.doesNotMatch(diagnosticLogs.join(' '), /Private candidate answer/);

  // A later strong observation resolves an earlier same-day gap in fallback feedback.
  const ethan = candidatesData.candidates.find((entry) => entry.member.name === 'Ethan Brooks');
  assert.ok(ethan);
  const resolvedState = {
    ...eligibleForFinish(initializeSession('resolved-gap', ethan).state),
    currentDay: 3,
    currentTopic: curriculumDay(3).title,
    observations: [{
      day: 3,
      quality: 'partial',
      conceptsUnderstood: ['browser-origin policy'],
      conceptsMissing: ['CORS', 'CORSMiddleware'],
      note: 'The answer omitted CORS configuration.',
    }],
  };
  const resolvedGap = await continueSession(resolvedState, 'Use CORSMiddleware with explicit allowed origins.', mockAI(adaptiveTurn({
    quality: 'strong',
    action: 'finish',
    day: 3,
    reply: '',
    understood: ['CORS', 'CORSMiddleware', 'allowed origins', 'security implications'],
    missing: [],
    note: 'The follow-up resolved the earlier CORS gap.',
  })));
  assert.match(resolvedGap.response.feedback.strengths.join(' '), /CORSMiddleware/);
  assert.doesNotMatch(resolvedGap.response.feedback.gaps.join(' '), /CORS|CORSMiddleware/);

  // Malformed structured output retries once, then falls back without losing the session.
  const malformedSession = `gemini-malformed-${Date.now()}`;
  globalThis.fetch = originalFetch;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_MODEL;
  await request({ sessionId: malformedSession, candidate });
  process.env.GEMINI_API_KEY = ['unit', 'test', 'gemini'].join('-');
  let malformedCalls = 0;
  globalThis.fetch = async () => {
    malformedCalls += 1;
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'not-json' }] } }] }), { status: 200 });
  };
  const malformedFallback = await request({ sessionId: malformedSession, message: 'Answer' });
  assertQuestion(malformedFallback, true);
  assert.equal(malformedCalls, 2);

  // Network failure retries once and uses the same deterministic fallback path.
  const networkSession = `gemini-network-${Date.now()}`;
  globalThis.fetch = originalFetch;
  delete process.env.GEMINI_API_KEY;
  await request({ sessionId: networkSession, candidate });
  process.env.GEMINI_API_KEY = ['unit', 'test', 'gemini'].join('-');
  let networkCalls = 0;
  globalThis.fetch = async () => {
    networkCalls += 1;
    throw new Error('Simulated network failure');
  };
  const networkFallback = await request({ sessionId: networkSession, message: 'Answer' });
  assertQuestion(networkFallback, true);
  assert.equal(networkCalls, 2);

  // Supabase still receives only its server-side secret through apikey.
  globalThis.fetch = originalFetch;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_MODEL;
  const testSecretKey = ['unit', 'test', 'secret'].join('-');
  let supabaseRequest;
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SECRET_KEY = testSecretKey;
  process.env.NODE_ENV = 'production';
  globalThis.fetch = async (_url, options) => {
    supabaseRequest = options;
    return new Response(null, { status: 201 });
  };
  const supabaseStart = await request({ sessionId: 'supabase-header-test', candidate: candidatesData.candidates[0] });
  assert.equal(supabaseStart.statusCode, 200);
  assert.equal(supabaseRequest.headers.apikey, testSecretKey);
  assert.equal('Authorization' in supabaseRequest.headers, false);

  globalThis.fetch = originalFetch;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SECRET_KEY;
  process.env.SUPABASE_SERVICE_ROLE_KEY = ['legacy', 'unused'].join('-');
  const storageFailure = await request({ sessionId: 'production-without-storage', candidate: candidatesData.candidates[0] });
  assert.equal(storageFailure.statusCode, 500);
  assert.deepEqual(storageFailure.body, { error: 'Production session storage is not configured.' });

  console.log('Interview API and adaptive Gemini tests passed.');
} finally {
  globalThis.fetch = originalFetch;
  for (const [name, value] of Object.entries({
    NODE_ENV: originalEnvironment.nodeEnv,
    VERCEL_ENV: originalEnvironment.vercelEnv,
    SUPABASE_URL: originalEnvironment.supabaseUrl,
    SUPABASE_SECRET_KEY: originalEnvironment.supabaseSecretKey,
    SUPABASE_SERVICE_ROLE_KEY: originalEnvironment.legacySupabaseKey,
    GEMINI_API_KEY: originalEnvironment.geminiApiKey,
    GEMINI_MODEL: originalEnvironment.geminiModel,
  })) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
