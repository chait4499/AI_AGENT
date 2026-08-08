export interface Member {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
}

export interface Mission {
  day: number;
  title: string;
  passed?: boolean;
  skipped?: boolean;
  attempts?: number;
}

export interface Signals {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
}

export interface Candidate {
  member: Member;
  missions: Mission[];
  signals: Signals;
}

export interface CurriculumDay {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
}

export interface CurriculumModule {
  n: number;
  title: string;
  days: number[];
}

export interface Curriculum {
  cohort: string;
  modules: CurriculumModule[];
  days: CurriculumDay[];
}

export type View = 'selection' | 'brief' | 'interview' | 'feedback';

export type Difficulty = 'Foundational' | 'Standard' | 'Advanced' | 'Deep';

export interface Turn {
  role: 'interviewer' | 'candidate';
  content: string;
  day?: number;
  topic?: string;
  difficulty?: Difficulty;
}

export interface Feedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

export type AssessmentQuality = 'weak' | 'partial' | 'good' | 'strong';

export interface AssessmentEvidence {
  day: number;
  quality: AssessmentQuality;
  conceptsUnderstood: string[];
  conceptsMissing: string[];
}

export interface InterviewObservation extends AssessmentEvidence {
  answer: string;
  questionNumber: number;
  topic: string;
  difficulty: Difficulty;
}

export interface InterviewState {
  sessionId: string;
  candidate: Candidate;
  turns: Turn[];
  currentIndex: number;
  coveredDays: number[];
  difficulty: Difficulty;
  observations: InterviewObservation[];
  done: boolean;
  feedback: Feedback | null;
}

export interface ApiRequest {
  sessionId: string;
  candidate?: Candidate;
  message?: string;
}

export interface ApiResponse {
  reply: string;
  done: boolean;
  feedback?: Feedback;
  question?: {
    day: number;
    topic: string;
    difficulty: Difficulty;
  };
  questionCount?: number;
  coveredDays?: number[];
  observation?: AssessmentEvidence;
}
