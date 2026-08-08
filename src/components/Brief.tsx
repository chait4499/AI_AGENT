import type { Candidate } from '../types';
import { deriveProfile, getInitials } from '../data';
import { Avatar, Button, Card, LearningJourney, StatCard } from './ui';

export function Brief({
  candidate,
  onStart,
  onBack,
  loading,
  error,
}: {
  candidate: Candidate;
  onStart: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}) {
  const m = candidate.member;
  const profile = deriveProfile(candidate);

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-[1250px] items-center justify-between px-5 py-4 sm:px-8 xl:px-10">
          <button onClick={onBack} className="rounded-lg px-2 py-2 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
            ← Candidates
          </button>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">Candidate profile</span>
        </div>
      </header>

      <main className="mx-auto max-w-[1250px] px-5 py-8 sm:px-8 sm:py-10 xl:px-10 xl:py-12">
        {error && (
          <p className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>
        )}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <Avatar initials={getInitials(m.name)} name={m.name} size="xl" />
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-ink-900 sm:text-4xl">{m.name}</h1>
              <p className="mt-2 text-base font-medium text-ink-600">{m.jobRole}</p>
              <p className="mt-1 text-sm text-ink-400">{m.yearsExperience} years experience · {m.education}</p>
            </div>
          </div>
          <Button onClick={onStart} disabled={loading} size="lg" className="w-full sm:w-auto">
            {loading ? 'Starting…' : <>Start Interview <span aria-hidden="true">→</span></>}
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Missions completed" value={candidate.signals.missionsCompleted} sublabel="of 31" />
          <StatCard label="Active days" value={candidate.signals.commitDays} />
          <StatCard label="First-try passes" value={candidate.signals.missionsFirstTry} />
        </div>

        <Card className="mt-8 p-5 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink-900">Learning journey</h2>
              <p className="mt-1 text-sm text-ink-500">31-day AI Engineering Cohort</p>
            </div>
            <p className="text-xs text-ink-400">Hover a day for mission details</p>
          </div>
          <div className="mt-6">
            <LearningJourney candidate={candidate} size="large" />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink-100 pt-5 text-xs text-ink-500">
            <LegendDot color="bg-emerald-500" label="First attempt" />
            <LegendDot color="bg-amber-400" label="Multiple attempts" />
            <LegendDot color="bg-red-500" label="Failed" />
            <LegendDot color="journey-cell-skipped" label="Skipped" />
            <LegendDot color="bg-ink-200" label="No record" />
          </div>
        </Card>

        <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <ProfileSection title="Validate" eyebrow="Strengths" entries={profile.strong} color="green" emptyText="No first-try strengths recorded" />
          <ProfileSection title="Probe" eyebrow="Needs attention" entries={profile.probing} color="amber" emptyText="No probing areas recorded" />
          <ProfileSection title="Skipped" eyebrow="Explicitly skipped" entries={profile.skipped} color="gray" emptyText="No skipped missions" />
        </div>

        <Card className="mt-8 border-accent-100 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink-900">Interviewer brief</h3>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-ink-500">
                Questions will prioritize areas that required multiple attempts, validate first-try strengths, and adapt based on live responses.
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-8 flex justify-end border-t border-ink-200 pt-8">
          <Button onClick={onStart} disabled={loading} size="lg">
            {loading ? 'Starting…' : <>Start Interview <span aria-hidden="true">→</span></>}
          </Button>
        </div>
      </main>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-[3px] ${color}`} />
      {label}
    </div>
  );
}

function ProfileSection({
  title,
  eyebrow,
  entries,
  color,
  emptyText,
}: {
  title: string;
  eyebrow: string;
  entries: { day: number; title: string; reason: string }[];
  color: 'green' | 'amber' | 'gray';
  emptyText: string;
}) {
  const accents = {
    green: { border: 'border-t-emerald-500', day: 'text-emerald-700', dot: 'bg-emerald-500' },
    amber: { border: 'border-t-amber-400', day: 'text-amber-700', dot: 'bg-amber-400' },
    gray: { border: 'border-t-ink-300', day: 'text-ink-600', dot: 'bg-ink-400' },
  }[color];
  return (
    <Card className={`border-t-2 p-5 sm:p-6 ${accents.border}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">{eyebrow}</p>
      <h3 className="mt-2 text-lg font-semibold text-ink-900">{title}</h3>
      {entries.length === 0 ? (
        <p className="mt-5 text-sm text-ink-400">{emptyText}</p>
      ) : (
        <ul className="mt-5 divide-y divide-ink-100">
          {entries.map((e) => (
            <li key={e.day} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${accents.dot}`} />
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold ${accents.day}`}>Day {e.day}</p>
                <p className="mt-1 text-sm font-medium leading-5 text-ink-800">{e.title}</p>
                <p className="mt-1 text-xs leading-5 text-ink-400">{e.reason}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
