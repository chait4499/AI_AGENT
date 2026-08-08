import type { Candidate } from '../types';
import { deriveProfile, getDayStatus, getInitials, getCurriculumDay } from '../data';
import { Avatar, Badge, Button, Card, Divider, StatCard } from './ui';

export function Brief({
  candidate,
  onStart,
  onBack,
}: {
  candidate: Candidate;
  onStart: () => void;
  onBack: () => void;
}) {
  const m = candidate.member;
  const profile = deriveProfile(candidate);

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <button onClick={onBack} className="text-sm font-medium text-ink-500 hover:text-ink-900">
            ← Back to candidates
          </button>
          <Button onClick={onStart} size="md">
            Start Interview
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center gap-4">
          <Avatar initials={getInitials(m.name)} name={m.name} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">{m.name}</h1>
            <p className="text-sm text-ink-500">
              {m.jobRole} · {m.yearsExperience} years experience
            </p>
            <p className="text-xs text-ink-400">{m.education}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatCard label="Missions Completed" value={candidate.signals.missionsCompleted} sublabel="out of 31" />
          <StatCard label="Commit Days" value={candidate.signals.commitDays} sublabel="days active" />
          <StatCard label="First-Try Passes" value={candidate.signals.missionsFirstTry} sublabel="missions" />
        </div>

        <Card className="mt-6 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Learning History</h2>
          <p className="mt-1 text-xs text-ink-400">31-day AI engineering cohort</p>
          <DayHeatmap candidate={candidate} />
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-500">
            <LegendDot color="bg-emerald-400" label="Passed" />
            <LegendDot color="bg-amber-400" label="High attempts" />
            <LegendDot color="bg-red-400" label="Failed" />
            <LegendDot color="bg-ink-200" label="Skipped" />
            <LegendDot color="bg-ink-100" label="Not listed" />
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <ProfileSection title="Strong Signals" entries={profile.strong} color="green" emptyText="No strong signals" />
          <ProfileSection title="Needs Probing" entries={profile.probing} color="amber" emptyText="No areas of concern" />
          <ProfileSection title="Skipped" entries={profile.skipped} color="gray" emptyText="No skipped missions" />
        </div>

        <Card className="mt-6 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-900">Interviewer Briefing</h3>
              <p className="mt-1 text-sm text-ink-500">
                The interviewer already understands this candidate before asking the first question. Questions will
                adapt to their learning history, probing areas that needed multiple attempts and validating strengths.
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-8 flex justify-end">
          <Button onClick={onStart} size="lg">
            Start Interview
          </Button>
        </div>
      </main>
    </div>
  );
}

function DayHeatmap({ candidate }: { candidate: Candidate }) {
  return (
    <div className="mt-4 grid grid-cols-[repeat(16,1fr)] gap-1 sm:grid-cols-[repeat(31,1fr)]">
      {Array.from({ length: 31 }, (_, i) => {
        const day = i + 1;
        const status = getDayStatus(candidate, day);
        const colors = {
          passed: 'bg-emerald-400',
          warning: 'bg-amber-400',
          failed: 'bg-red-400',
          skipped: 'bg-ink-200',
          none: 'bg-ink-100',
        };
        const cur = getCurriculumDay(day);
        return (
          <div
            key={day}
            className={`h-6 rounded ${colors[status]} transition-colors`}
            title={`Day ${day}${cur ? `: ${cur.title}` : ''}`}
          />
        );
      })}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded ${color}`} />
      {label}
    </div>
  );
}

function ProfileSection({
  title,
  entries,
  color,
  emptyText,
}: {
  title: string;
  entries: { day: number; title: string; reason: string }[];
  color: 'green' | 'amber' | 'gray';
  emptyText: string;
}) {
  const badgeColor = color === 'green' ? 'green' : color === 'amber' ? 'amber' : 'gray';
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
      <Divider />
      {entries.length === 0 ? (
        <p className="mt-3 text-xs text-ink-400">{emptyText}</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {entries.map((e) => (
            <li key={e.day} className="flex items-start gap-2">
              <Badge color={badgeColor as 'green' | 'amber' | 'gray'}>Day {e.day}</Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-800">{e.title}</p>
                <p className="text-xs text-ink-400">{e.reason}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
