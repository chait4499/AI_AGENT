import { useMemo, useState } from 'react';
import type { Candidate } from '../types';
import { candidates, getInitials } from '../data';
import { Avatar, LearningJourney } from './ui';

export function Selection({ onSelect }: { onSelect: (c: Candidate) => void }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return candidates;
    return candidates.filter(
      (c) =>
        c.member.name.toLowerCase().includes(q) ||
        c.member.jobRole.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-[1350px] px-5 py-10 sm:px-8 sm:py-14 xl:px-10">
          <p className="text-sm font-semibold text-accent-600">AI Engineering Cohort</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink-900 sm:text-4xl">Choose a candidate</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink-500">
            Select a learning profile to start a personalized technical interview.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[1350px] px-5 py-8 sm:px-8 sm:py-10 xl:px-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-ink-800">
            {filtered.length === candidates.length
              ? `${candidates.length} candidates`
              : `${filtered.length} of ${candidates.length} candidates`}
          </h2>
          <div className="relative w-full sm:max-w-sm">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or role…"
              aria-label="Search candidates by name or role"
              className="w-full rounded-xl border border-ink-200 bg-white py-3 pl-10 pr-4 text-sm text-ink-900 shadow-sm outline-none transition placeholder:text-ink-400 focus:border-accent-400 focus:ring-4 focus:ring-accent-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <CandidateCard key={c.member.id} candidate={c} onSelect={onSelect} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white py-16 text-center text-sm text-ink-500">
            No candidates match your search.
          </div>
        )}
      </main>
    </div>
  );
}

function CandidateCard({ candidate, onSelect }: { candidate: Candidate; onSelect: (c: Candidate) => void }) {
  const m = candidate.member;
  return (
    <button
      type="button"
      onClick={() => onSelect(candidate)}
      className="group flex min-h-[248px] w-full flex-col rounded-2xl border border-ink-200 bg-white p-5 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-300 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 sm:p-6"
    >
      <div className="flex w-full items-start gap-4">
        <Avatar initials={getInitials(m.name)} name={m.name} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-ink-900">{m.name}</h3>
          <p className="mt-1 truncate text-sm text-ink-600">{m.jobRole}</p>
          <p className="mt-1 text-sm text-ink-400">{m.yearsExperience} years experience</p>
        </div>
        <span className="mt-1 text-xl text-ink-300 transition-transform group-hover:translate-x-1 group-hover:text-accent-600" aria-hidden="true">→</span>
      </div>

      <div className="my-5 h-px w-full bg-ink-100" />

      <div className="grid w-full grid-cols-2 gap-6">
        <div>
          <p className="text-lg font-semibold text-ink-900"><span className="text-emerald-600">✓</span> {candidate.signals.missionsCompleted} <span className="text-sm font-medium text-ink-400">/ 31</span></p>
          <p className="mt-0.5 text-xs text-ink-500">missions</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-ink-900"><span className="text-amber-500">⚡</span> {candidate.signals.missionsFirstTry}</p>
          <p className="mt-0.5 text-xs text-ink-500">first-try</p>
        </div>
      </div>

      <div className="mt-auto w-full pt-5">
        <LearningJourney candidate={candidate} />
      </div>
    </button>
  );
}
