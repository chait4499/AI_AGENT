import type { Candidate, Difficulty, InterviewObservation, Mission, Turn } from './types';

export type AdaptationLabel = 'PROBE' | 'VALIDATE' | 'FOLLOW-UP' | 'DEEPEN' | 'NEW TOPIC';
export type ValidationStatus = 'STRENGTH CONFIRMED' | 'IMPROVEMENT VALIDATED' | 'NEEDS REINFORCEMENT' | 'CURRENTLY INCONCLUSIVE';

export interface InterviewPathItem {
  questionNumber: number;
  day: number;
  topic: string;
  label?: AdaptationLabel;
}

export interface SignalValidation {
  day: number;
  topic: string;
  history: string;
  live: string;
  status: ValidationStatus;
}

export interface EvidenceLink {
  day: number;
  topic: string;
  questionNumber: number;
  excerpt: string;
}

function missionFor(candidate: Candidate, day: number): Mission | undefined {
  return candidate.missions.find((mission) => mission.day === day);
}

function historicalLabel(candidate: Candidate, day: number): 'PROBE' | 'VALIDATE' | undefined {
  const mission = missionFor(candidate, day);
  if (!mission || mission.skipped) return undefined;
  if (mission.passed === false || (mission.passed === true && (mission.attempts ?? 0) >= 3)) return 'PROBE';
  if (mission.passed === true && mission.attempts === 1) return 'VALIDATE';
  return undefined;
}

function difficultyRank(difficulty: Difficulty | undefined): number {
  return ['Foundational', 'Standard', 'Advanced', 'Deep'].indexOf(difficulty ?? 'Standard');
}

function interviewerTurns(turns: Turn[]): Turn[] {
  return turns.filter((turn) => turn.role === 'interviewer' && turn.day !== undefined && turn.topic);
}

export function buildInterviewPath(
  candidate: Candidate,
  turns: Turn[],
  observations: InterviewObservation[],
): InterviewPathItem[] {
  const questions = interviewerTurns(turns);
  return questions.map((question, index) => {
    const questionNumber = index + 1;
    if (index === 0) {
      return {
        questionNumber,
        day: question.day as number,
        topic: question.topic as string,
        label: historicalLabel(candidate, question.day as number),
      };
    }

    const previous = questions[index - 1];
    const observation = observations.find((entry) => entry.questionNumber === questionNumber - 1);
    let label: AdaptationLabel | undefined;
    if (question.day !== previous.day) {
      label = 'NEW TOPIC';
    } else if (observation?.quality === 'weak' || observation?.quality === 'partial') {
      label = 'FOLLOW-UP';
    } else if (
      (observation?.quality === 'good' || observation?.quality === 'strong')
      && difficultyRank(question.difficulty) > difficultyRank(previous.difficulty)
    ) {
      label = 'DEEPEN';
    }

    return {
      questionNumber,
      day: question.day as number,
      topic: question.topic as string,
      label,
    };
  });
}

export function explainCurrentQuestion(
  candidate: Candidate,
  turns: Turn[],
  observations: InterviewObservation[],
): string | null {
  const questions = interviewerTurns(turns);
  const current = questions[questions.length - 1];
  if (!current) return null;

  if (questions.length > 1) {
    const previous = questions[questions.length - 2];
    const observation = observations.find((entry) => entry.questionNumber === questions.length - 1);
    if (current.day !== previous.day) {
      return 'The interview is expanding coverage to another relevant curriculum area.';
    }
    if (observation?.quality === 'weak' || observation?.quality === 'partial') {
      const missing = observation.conceptsMissing[0];
      return missing
        ? `The previous response was incomplete on ${missing}, so this follow-up probes that gap.`
        : 'The previous response was incomplete, so this follow-up probes the remaining gap.';
    }
    if (
      (observation?.quality === 'good' || observation?.quality === 'strong')
      && difficultyRank(current.difficulty) > difficultyRank(previous.difficulty)
    ) {
      return 'The previous response demonstrated the fundamentals, so the interview is increasing the depth.';
    }
    return null;
  }

  const mission = missionFor(candidate, current.day as number);
  const label = historicalLabel(candidate, current.day as number);
  if (label === 'PROBE') {
    return mission?.passed === false
      ? `Day ${current.day} was not passed in the learning journey, so the interview is checking current understanding.`
      : `Day ${current.day} required multiple learning attempts, so the interview is validating current understanding.`;
  }
  if (label === 'VALIDATE') {
    return `Day ${current.day} was completed on the first attempt, so the interview is validating this as a potential strength.`;
  }
  return null;
}

function historyDescription(mission: Mission | undefined): string {
  if (!mission) return 'No recorded mission';
  if (mission.skipped) return 'Explicitly skipped';
  if (mission.passed === false) return mission.attempts === undefined ? 'Not passed' : `Not passed · ${mission.attempts} attempts`;
  if (mission.passed === true && mission.attempts === 1) return 'First-try pass';
  if (mission.passed === true && mission.attempts !== undefined) return `${mission.attempts} attempts`;
  return 'Recorded mission';
}

function liveDescription(quality: InterviewObservation['quality']): string {
  return `${quality.charAt(0).toUpperCase()}${quality.slice(1)}`;
}

export function buildSignalValidations(
  candidate: Candidate,
  observations: InterviewObservation[],
): SignalValidation[] {
  const latestByDay = new Map<number, InterviewObservation>();
  for (const observation of observations) latestByDay.set(observation.day, observation);

  return [...latestByDay.values()].flatMap((observation) => {
    const mission = missionFor(candidate, observation.day);
    const isCurrentGap = observation.quality === 'weak' || observation.quality === 'partial';
    const isCurrentStrength = observation.quality === 'good' || observation.quality === 'strong';
    const isHistoricalStrength = mission?.passed === true && mission.attempts === 1 && !mission.skipped;
    const isHistoricalDifficulty = mission && !mission.skipped
      && (mission.passed === false || (mission.passed === true && (mission.attempts ?? 0) >= 3));

    let status: ValidationStatus | undefined;
    if (isCurrentGap) status = 'NEEDS REINFORCEMENT';
    else if (isCurrentStrength && observation.conceptsMissing.length > 0 && (isHistoricalStrength || isHistoricalDifficulty)) {
      status = 'CURRENTLY INCONCLUSIVE';
    } else if (isCurrentStrength && isHistoricalStrength) status = 'STRENGTH CONFIRMED';
    else if (isCurrentStrength && isHistoricalDifficulty) status = 'IMPROVEMENT VALIDATED';
    if (!status) return [];

    return [{
      day: observation.day,
      topic: observation.topic,
      history: historyDescription(mission),
      live: liveDescription(observation.quality),
      status,
    }];
  });
}

const ignoredWords = new Set([
  'about', 'after', 'answer', 'candidate', 'clearly', 'could', 'demonstrated', 'did', 'explain', 'explained',
  'from', 'have', 'into', 'needed', 'response', 'should', 'that', 'their', 'this', 'through', 'using', 'with',
]);

function meaningfulWords(text: string): Set<string> {
  return new Set(
    text.toLowerCase().match(/[a-z0-9]+/g)?.filter((word) => word.length >= 4 && !ignoredWords.has(word)) ?? [],
  );
}

function excerpt(answer: string): string {
  const normalized = answer.replace(/\s+/g, ' ').trim();
  if (normalized.length <= 260) return normalized;
  const shortened = normalized.slice(0, 257);
  const wordBoundary = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, wordBoundary > 180 ? wordBoundary : 257)}…`;
}

export function findFeedbackEvidence(
  feedbackItem: string,
  kind: 'strength' | 'gap',
  observations: InterviewObservation[],
): EvidenceLink | null {
  const eligible = observations.filter((observation) => kind === 'strength'
    ? observation.quality === 'good' || observation.quality === 'strong'
    : observation.quality === 'weak' || observation.quality === 'partial' || observation.conceptsMissing.length > 0);
  const dayMatch = feedbackItem.match(/\bday\s*(\d{1,2})\b/i);
  if (dayMatch) {
    const day = Number(dayMatch[1]);
    const direct = [...eligible].reverse().find((observation) => observation.day === day);
    return direct ? {
      day: direct.day,
      topic: direct.topic,
      questionNumber: direct.questionNumber,
      excerpt: excerpt(direct.answer),
    } : null;
  }

  const feedbackWords = meaningfulWords(feedbackItem);
  const ranked = eligible.map((observation) => {
    const concepts = kind === 'strength' ? observation.conceptsUnderstood : observation.conceptsMissing;
    const conceptText = concepts.join(' ').toLowerCase();
    const conceptWords = meaningfulWords(conceptText);
    const sharedWords = [...feedbackWords].filter((word) => conceptWords.has(word)).length;
    const phraseMatch = concepts.some((concept) => concept.length >= 6 && feedbackItem.toLowerCase().includes(concept.toLowerCase()));
    return { observation, score: sharedWords + (phraseMatch ? 3 : 0) };
  }).sort((a, b) => b.score - a.score || b.observation.questionNumber - a.observation.questionNumber);

  const best = ranked[0];
  if (!best || best.score < 2 || (ranked[1] && ranked[1].score === best.score)) return null;
  return {
    day: best.observation.day,
    topic: best.observation.topic,
    questionNumber: best.observation.questionNumber,
    excerpt: excerpt(best.observation.answer),
  };
}
