import curriculumData from '../data/raw/curriculum.json' with { type: 'json' };
import type { ApiResponse, Candidate, Curriculum, CurriculumDay, Difficulty, Feedback, Turn } from '../src/types.ts';

export const INTERVIEW_QUESTION_COUNT = 8;
const MAX_TARGET_DAYS = 6;
const curriculum = curriculumData as Curriculum;

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
  done: boolean;
}

const ROLE_RELEVANT_DAYS: Array<{ terms: string[]; days: number[] }> = [
  {
    terms: ['ai', 'data'],
    days: [4, 5, 7, 8, 9, 10, 11, 12, 13, 25, 26, 30],
  },
  {
    terms: ['backend', 'software', 'mobile', 'developer', 'engineer'],
    days: [3, 4, 10, 13, 16, 18, 20, 23, 27, 28, 30, 31],
  },
  {
    terms: ['devops', 'support', 'infrastructure', 'operations'],
    days: [1, 2, 16, 18, 24, 27, 28, 29, 30],
  },
  {
    terms: ['business', 'marketing', 'hr', 'research', 'ux'],
    days: [3, 5, 12, 17, 19, 20, 25, 26, 27, 31],
  },
];

const DEFAULT_TECHNICAL_DAYS = [7, 10, 12, 13, 16, 18, 22, 23, 27, 28, 30, 31];

function curriculumDay(day: number): CurriculumDay | undefined {
  return curriculum.days.find((entry) => entry.day === day);
}

function addUniqueDays(target: number[], days: number[], skippedDays: Set<number>) {
  for (const day of days) {
    if (target.length >= MAX_TARGET_DAYS) return;
    if (!skippedDays.has(day) && curriculumDay(day) && !target.includes(day)) {
      target.push(day);
    }
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
    case 'SETUP':
      return 'Foundational';
    case 'LEARN':
    case 'AI_CORE':
      return 'Standard';
    case 'BUILD':
      return 'Advanced';
    default:
      return 'Deep';
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
  if (targetDays.length < 4) {
    throw new Error('At least four curriculum days are required to start an interview.');
  }

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
    done: false,
  };

  return { state, response: responseForQuestion(state, firstTurn) };
}

function formatAttempts(attempts: number | undefined): string {
  return attempts === undefined ? '' : ` after ${attempts} attempt${attempts === 1 ? '' : 's'}`;
}

function buildFeedback(state: SessionState): Feedback {
  const { candidate } = state;
  const strong = candidate.missions.filter(
    (mission) => !mission.skipped && mission.passed === true && mission.attempts === 1,
  );
  const probing = candidate.missions.filter(
    (mission) => !mission.skipped && (mission.passed === false || (mission.passed === true && (mission.attempts ?? 0) >= 3)),
  );
  const skipped = candidate.missions.filter((mission) => mission.skipped === true);

  const strengths = [
    `Cohort records report ${candidate.signals.missionsFirstTry} first-try passes.`,
    ...strong.slice(0, 3).map((mission) => `Day ${mission.day}, ${mission.title}, was passed on the first try.`),
  ];
  const gaps = probing.length > 0
    ? probing.slice(0, 5).map((mission) => mission.passed === false
      ? `Day ${mission.day}, ${mission.title}, was not passed${formatAttempts(mission.attempts)}.`
      : `Day ${mission.day}, ${mission.title}, was passed after ${mission.attempts} attempts and remains a probing topic.`)
    : ['The supplied mission history lists no failed or three-plus-attempt missions.'];
  const next = probing.slice(0, 2).map((mission) => `Revisit Day ${mission.day}, ${mission.title}, based on the supplied learning history.`);

  if (skipped.length > 0) {
    next.push(`Decide whether to revisit explicitly skipped mission${skipped.length === 1 ? '' : 's'}: ${skipped.map((mission) => `Day ${mission.day}`).join(', ')}.`);
  }
  next.push('Use the future AI evaluation step to assess the interview answers themselves.');

  return {
    summary: `${candidate.member.name} completed ${state.questionCount} deterministic questions across ${state.coveredDays.length} curriculum days. This pre-AI feedback uses supplied learning-history facts only and does not evaluate answer quality.`,
    strengths,
    gaps,
    next,
  };
}

export function continueSession(state: SessionState, message: string): { state: SessionState; response: ApiResponse } {
  const updated: SessionState = {
    ...state,
    transcript: [...state.transcript, { role: 'candidate', content: message }],
  };

  if (updated.questionCount >= INTERVIEW_QUESTION_COUNT && updated.coveredDays.length >= 4) {
    updated.done = true;
    return {
      state: updated,
      response: {
        reply: 'Interview completed.',
        done: true,
        feedback: buildFeedback(updated),
        questionCount: updated.questionCount,
        coveredDays: updated.coveredDays,
      },
    };
  }

  const nextDay = updated.targetDays[updated.questionCount % updated.targetDays.length];
  const next = buildQuestion(nextDay, updated.transcript);
  const nextTurn: Turn = {
    role: 'interviewer',
    content: next.content,
    day: next.day.day,
    topic: next.day.title,
    difficulty: next.difficulty,
  };

  updated.transcript = [...updated.transcript, nextTurn];
  updated.questionCount += 1;
  updated.coveredDays = Array.from(new Set([...updated.coveredDays, next.day.day]));
  updated.currentDay = next.day.day;
  updated.currentTopic = next.day.title;
  updated.askedQuestions = [...updated.askedQuestions, next.content];

  return { state: updated, response: responseForQuestion(updated, nextTurn) };
}
