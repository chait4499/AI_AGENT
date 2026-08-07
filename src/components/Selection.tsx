import { useMemo, useState } from 'react';
import type { Candidate } from '../types';
import { candidates, getInitials } from '../data';
import { Avatar, Badge, Card } from './ui';

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
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900">Interview Agent</h1>
          <p className="mt-2 text-base text-ink-500">
            Personalized technical interviews based on your learning journey.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
            {filtered.length} candidate{filtered.length !== 1 ? 's' : ''}
          </h2>
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or role…"
              className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((c) => (
            <CandidateCard key={c.member.id} candidate={c} onSelect={onSelect} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-ink-400">
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
      onClick={() => onSelect(candidate)}
      className="group flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4 text-left shadow-card transition-all hover:border-accent-300 hover:shadow-soft"
    >
      <Avatar initials={getInitials(m.name)} name={m.name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-ink-900">{m.name}</h3>
          <span className="text-xs text-ink-400">{m.yearsExperience}y exp</span>
        </div>
        <p className="mt-0.5 truncate text-sm text-ink-500">{m.jobRole}</p>
        <p className="mt-0.5 truncate text-xs text-ink-400">{m.education}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <Badge color="green">{candidate.signals.missionsCompleted} missions</Badge>
          <Badge color="indigo">{candidate.signals.missionsFirstTry} first-try</Badge>
        </div>
      </div>
    </button>
  );
}
