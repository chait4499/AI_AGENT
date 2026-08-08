import curriculumData from '../data/raw/curriculum.json' with { type: 'json' };
import type { ApiResponse, Candidate, Curriculum, CurriculumDay, Difficulty, Feedback, Turn } from '../src/types.ts';

export const MIN_INTERVIEW_QUESTIONS = 8;
export const MAX_INTERVIEW_QUESTIONS = 12;
const MAX_TARGET_DAYS = 6;
const MAX_CONSECUTIVE_QUESTIONS_PER_DAY = 3;
const curriculum = curriculumData as Curriculum;

export type AssessmentQuality = 'weak' | 'partial' | 'good' | 'strong';
export type AdaptiveAction = 'follow_up' | 'new_topic' | 'finish';
export type AdaptiveDifficulty = 'foundation' | 'standard' | 'advanced' | 'deep';

export interface AssessmentObservation {
  day: number;
  quality: AssessmentQuality;
  conceptsUnderstood: string[];
  conceptsMissing: string[];
  note: string;
}

export interface AdaptiveTurn {
  assessment: Omit<AssessmentObservation, 'day'>;
  decision: {
    action: AdaptiveAction;
    day: number;
    difficulty: AdaptiveDifficulty;
  };
  reply: string;
}

export interface AdaptiveInterviewAI {
  assess(state: SessionState, latestAnswer: string): Promise<AdaptiveTurn | null>;
  feedback(state: SessionState): Promise<Feedback | null>;
}

export interface SessionState {
  sessionId: string;
  candidate: Candidate;
  transcript: Turn[];
  questionCount: number;
  coveredDays: number[];
  currentDay: number;
  currentTopic: string;
  askedQuestions: string[];
  targetDays: number[];
  observations: AssessmentObservation[];
  done: boolean;
}

const ROLE_RELEVANT_DAYS: Array<{ terms: string[]; days: number[] }> = [
  { terms: ['ai', 'data'], days: [4, 5, 7, 8, 9, 10, 11, 12, 13, 25, 26, 30] },
  { terms: ['backend', 'software', 'mobile', 'developer', 'engineer'], days: [3, 4, 10, 13, 16, 18, 20, 23, 27, 28, 30, 31] },
  { terms: ['devops', 'support', 'infrastructure', 'operations'], days: [1, 2, 16, 18, 24, 27, 28, 29, 30] },
  { terms: ['business', 'marketing', 'hr', 'research', 'ux'], days: [3, 5, 12, 17, 19, 20, 25, 26, 27, 31] },
];

const DEFAULT_TECHNICAL_DAYS = [7, 10, 12, 13, 16, 18, 22, 23, 27, 28, 30, 31];

function curriculumDay(day: number): CurriculumDay | undefined {
  return curriculum.days.find((entry) => entry.day === day);
}

function addUniqueDays(target: number[], days: number[], skippedDays: Set<number>) {
  for (const day of days) {
    if (target.length >= MAX_TARGET_DAYS) return;
    if (!skippedDays.has(day) && curriculumDay(day) && !target.includes(day)) target.push(day);
  }
}

export function selectTargetDays(candidate: Candidate): number[] {
  const skippedDays = new Set(candidate.missions.filter((mission) => mission.skipped === true).map((mission) => mission.day));
  const failedDays = candidate.missions
    .filter((mission) => !mission.skipped && mission.passed === false)
    .sort((a, b) => (b.attempts ?? 0) - (a.attempts ?? 0) || a.day - b.day)
    .map((mission) => mission.day);
  const probingDays = candidate.missions
    .filter((mission) => !mission.skipped && mission.passed === true && (mission.attempts ?? 0) >= 3)
    .sort((a, b) => (b.attempts ?? 0) - (a.attempts ?? 0) || a.day - b.day)
    .map((mission) => mission.day);
  const strongDays = candidate.missions
    .filter((mission) => !mission.skipped && mission.passed === true && mission.attempts === 1)
    .sort((a, b) => a.day - b.day)
    .map((mission) => mission.day);
  const normalizedRole = candidate.member.jobRole.toLowerCase();
  const roleDays = ROLE_RELEVANT_DAYS
    .filter(({ terms }) => terms.some((term) => normalizedRole.includes(term)))
    .flatMap(({ days }) => days);
  const experienceDays = candidate.member.yearsExperience >= 7
    ? [25, 26, 27, 28, 29, 30, 31]
    : candidate.member.yearsExperience <= 1
      ? [1, 3, 7, 12, 16, 18]
      : [10, 13, 16, 20, 22, 23, 28];

  const selected: number[] = [];
  addUniqueDays(selected, failedDays, skippedDays);
  addUniqueDays(selected, probingDays, skippedDays);
  addUniqueDays(selected, strongDays, skippedDays);
  addUniqueDays(selected, roleDays, skippedDays);
  addUniqueDays(selected, experienceDays, skippedDays);
  addUniqueDays(selected, DEFAULT_TECHNICAL_DAYS, skippedDays);
  addUniqueDays(selected, curriculum.days.map((day) => day.day), skippedDays);
  return selected;
}

function difficultyFor(day: CurriculumDay): Difficulty {
  switch (day.type) {
    case 'SETUP': return 'Foundational';
    case 'LEARN':
    case 'AI_CORE': return 'Standard';
    case 'BUILD': return 'Advanced';
    default: return 'Deep';
  }
}

function displayDifficulty(difficulty: AdaptiveDifficulty): Difficulty {
  switch (difficulty) {
    case 'foundation': return 'Foundational';
    case 'advanced': return 'Advanced';
    case 'deep': return 'Deep';
    default: return 'Standard';
  }
}

function buildQuestion(dayNumber: number, transcript: Turn[]): { content: string; day: CurriculumDay; difficulty: Difficulty } {
  const day = curriculumDay(dayNumber);
  if (!day) throw new Error(`Curriculum day ${dayNumber} was not found.`);
  const priorQuestionsForDay = transcript.filter((turn) => turn.role === 'interviewer' && turn.day === dayNumber).length;
  const objective = day.objectives[priorQuestionsForDay % day.objectives.length];
  const content = `Day ${day.day}, ${day.title}, includes this objective: “${objective}”. Explain how you would approach it in practice, including one key design decision and one way you would verify the result.`;
  return { content, day, difficulty: difficultyFor(day) };
}

function responseForQuestion(state: SessionState, question: Turn): ApiResponse {
  return {
    reply: question.content,
    done: false,
    question: {
      day: question.day as number,
      topic: question.topic as string,
      difficulty: question.difficulty as Difficulty,
    },
    questionCount: state.questionCount,
    coveredDays: state.coveredDays,
  };
}

export function initializeSession(sessionId: string, candidate: Candidate): { state: SessionState; response: ApiResponse } {
  const targetDays = selectTargetDays(candidate);
  if (targetDays.length < 4) throw new Error('At least four curriculum days are required to start an interview.');

  const first = buildQuestion(targetDays[0], []);
  const firstTurn: Turn = {
    role: 'interviewer',
    content: first.content,
    day: first.day.day,
    topic: first.day.title,
    difficulty: first.difficulty,
  };
  const state: SessionState = {
    sessionId,
    candidate,
    transcript: [firstTurn],
    questionCount: 1,
    coveredDays: [first.day.day],
    currentDay: first.day.day,
    currentTopic: first.day.title,
    askedQuestions: [first.content],
    targetDays,
    observations: [],
    done: false,
  };
  return { state, response: responseForQuestion(state, firstTurn) };
}

function formatAttempts(attempts: number | undefined): string {
  return attempts === undefined ? '' : ` after ${attempts} attempt${attempts === 1 ? '' : 's'}`;
}

function buildFallbackFeedback(state: SessionState): Feedback {
  const { candidate } = state;
  const strong = candidate.missions.filter((mission) => !mission.skipped && mission.passed === true && mission.attempts === 1);
  const probing = candidate.missions.filter(
    (mission) => !mission.skipped && (mission.passed === false || (mission.passed === true && (mission.attempts ?? 0) >= 3)),
  );
  const skipped = candidate.missions.filter((mission) => mission.skipped === true);
  const strengths = [
    `Cohort records report ${candidate.signals.missionsFirstTry} first-try passes.`,
    `Cohort records report ${candidate.signals.missionsCompleted} completed missions.`,
    ...strong.slice(0, 3).map((mission) => `Day ${mission.day}, ${mission.title}, was passed on the first try.`),
  ].slice(0, 5);
  const gaps = (probing.length > 0
    ? probing.slice(0, 5).map((mission) => mission.passed === false
      ? `Day ${mission.day}, ${mission.title}, was not passed${formatAttempts(mission.attempts)}.`
      : `Day ${mission.day}, ${mission.title}, was passed after ${mission.attempts} attempts and remains a probing topic.`)
    : ['The supplied mission history lists no failed or three-plus-attempt missions.']);
  if (gaps.length < 2) gaps.push('Answer-based knowledge gaps could not be assessed because automated assessment was unavailable.');
  const next = probing.slice(0, 2).map((mission) => `Revisit Day ${mission.day}, ${mission.title}, based on the supplied learning history.`);
  if (skipped.length > 0) {
    next.push(`Decide whether to revisit explicitly skipped mission${skipped.length === 1 ? '' : 's'}: ${skipped.map((mission) => `Day ${mission.day}`).join(', ')}.`);
  }
  next.push(`Review the transcript for the covered curriculum days: ${state.coveredDays.map((day) => `Day ${day}`).join(', ')}.`);
  next.push('Review the interview transcript when answer-based assessment is available.');

  return {
    summary: `${candidate.member.name} completed ${state.questionCount} questions across ${state.coveredDays.length} curriculum days. Automated answer assessment was unavailable, so this fallback feedback uses supplied learning-history facts only.`,
    strengths,
    gaps: gaps.slice(0, 5),
    next: next.slice(0, 5),
  };
}

function consecutiveQuestionsForCurrentDay(state: SessionState): number {
  let count = 0;
  for (let index = state.transcript.length - 1; index >= 0; index -= 1) {
    const turn = state.transcript[index];
    if (turn.role !== 'interviewer') continue;
    if (turn.day !== state.currentDay) break;
    count += 1;
  }
  return count;
}

function nextTargetDay(state: SessionState): number {
  const uncovered = state.targetDays.find((day) => !state.coveredDays.includes(day));
  if (uncovered !== undefined) return uncovered;
  const currentIndex = state.targetDays.indexOf(state.currentDay);
  return state.targetDays[(currentIndex + 1 + state.targetDays.length) % state.targetDays.length];
}

function deterministicNextQuestion(state: SessionState): Turn {
  const next = buildQuestion(nextTargetDay(state), state.transcript);
  return {
    role: 'interviewer',
    content: next.content,
    day: next.day.day,
    topic: next.day.title,
    difficulty: next.difficulty,
  };
}

function adaptiveNextQuestion(state: SessionState, adaptive: AdaptiveTurn): Turn | null {
  if (!adaptive.reply || state.askedQuestions.includes(adaptive.reply)) return null;

  if (adaptive.decision.action === 'follow_up') {
    if (consecutiveQuestionsForCurrentDay(state) >= MAX_CONSECUTIVE_QUESTIONS_PER_DAY) return null;
    return {
      role: 'interviewer',
      content: adaptive.reply,
      day: state.currentDay,
      topic: state.currentTopic,
      difficulty: displayDifficulty(adaptive.decision.difficulty),
    };
  }

  if (adaptive.decision.action === 'new_topic') {
    const day = curriculumDay(adaptive.decision.day);
    if (!day || !state.targetDays.includes(day.day) || day.day === state.currentDay) return null;
    return {
      role: 'interviewer',
      content: adaptive.reply,
      day: day.day,
      topic: day.title,
      difficulty: displayDifficulty(adaptive.decision.difficulty),
    };
  }

  return null;
}

async function safeAssessment(ai: AdaptiveInterviewAI | null, state: SessionState, message: string): Promise<AdaptiveTurn | null> {
  if (!ai) return null;
  try {
    return await ai.assess(state, message);
  } catch {
    return null;
  }
}

async function finishSession(state: SessionState, ai: AdaptiveInterviewAI | null): Promise<{ state: SessionState; response: ApiResponse }> {
  state.done = true;
  let feedback: Feedback | null = null;
  if (ai) {
    try {
      feedback = await ai.feedback(state);
    } catch {
      feedback = null;
    }
  }
  return {
    state,
    response: {
      reply: 'Interview completed.',
      done: true,
      feedback: feedback ?? buildFallbackFeedback(state),
    },
  };
}

export async function continueSession(
  state: SessionState,
  message: string,
  ai: AdaptiveInterviewAI | null = null,
): Promise<{ state: SessionState; response: ApiResponse }> {
  const updated: SessionState = {
    ...state,
    transcript: [...state.transcript, { role: 'candidate', content: message }],
    observations: Array.isArray(state.observations) ? [...state.observations] : [],
  };
  const adaptive = await safeAssessment(ai, updated, message);

  if (adaptive) {
    updated.observations.push({ day: updated.currentDay, ...adaptive.assessment });
  }

  const minimumMet = updated.questionCount >= MIN_INTERVIEW_QUESTIONS && updated.coveredDays.length >= 4;
  const modelRequestedFinish = adaptive?.decision.action === 'finish';
  const fallbackShouldFinish = !adaptive && minimumMet;
  const maximumReached = updated.questionCount >= MAX_INTERVIEW_QUESTIONS && minimumMet;
  if ((modelRequestedFinish && minimumMet) || fallbackShouldFinish || maximumReached) {
    return finishSession(updated, ai);
  }

  const nextTurn = adaptive
    ? adaptiveNextQuestion(updated, adaptive) ?? deterministicNextQuestion(updated)
    : deterministicNextQuestion(updated);
  updated.transcript = [...updated.transcript, nextTurn];
  updated.questionCount += 1;
  updated.coveredDays = Array.from(new Set([...updated.coveredDays, nextTurn.day as number]));
  updated.currentDay = nextTurn.day as number;
  updated.currentTopic = nextTurn.topic as string;
  updated.askedQuestions = [...updated.askedQuestions, nextTurn.content];

  return { state: updated, response: responseForQuestion(updated, nextTurn) };
}
