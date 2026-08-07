import type { Candidate, Curriculum, Mission } from './types';
import candidatesData from '../data/raw/candidates_(1).json';
import curriculumData from '../data/raw/curriculum.json';

export const candidates = candidatesData.candidates as Candidate[];
export const curriculum = curriculumData as Curriculum;

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function getCurriculumDay(day: number) {
  return curriculum.days.find((d) => d.day === day);
}

export interface ProfileEntry {
  day: number;
  title: string;
  reason: string;
}

export interface CandidateProfile {
  strong: ProfileEntry[];
  probing: ProfileEntry[];
  skipped: ProfileEntry[];
}

export function deriveProfile(candidate: Candidate): CandidateProfile {
  const strong: ProfileEntry[] = [];
  const probing: ProfileEntry[] = [];
  const skipped: ProfileEntry[] = [];

  for (const m of candidate.missions) {
    const attempts = m.attempts ?? 0;
    if (m.skipped) {
      skipped.push({ day: m.day, title: m.title, reason: 'Skipped' });
    } else if (m.passed === false) {
      probing.push({ day: m.day, title: m.title, reason: `Failed after ${attempts} attempt${attempts !== 1 ? 's' : ''}` });
    } else if (m.passed === true) {
      if (attempts <= 2) {
        strong.push({ day: m.day, title: m.title, reason: `Passed first try` });
      } else {
        probing.push({ day: m.day, title: m.title, reason: `Passed after ${attempts} attempts` });
      }
    }
  }

  return { strong, probing, skipped };
}

export function getDayStatus(candidate: Candidate, day: number): 'passed' | 'warning' | 'failed' | 'skipped' | 'none' {
  const mission = candidate.missions.find((m) => m.day === day);
  if (!mission) return 'none';
  if (mission.skipped) return 'skipped';
  if (mission.passed === false) return 'failed';
  if (mission.passed === true) {
    const attempts = mission.attempts ?? 1;
    return attempts > 3 ? 'warning' : 'passed';
  }
  return 'none';
}
