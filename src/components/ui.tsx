import type { ReactNode } from 'react';
import type { Candidate } from '../types';
import { getCurriculumDay, getDayStatus } from '../data';

export function AppShell({
  children,
  candidatesActive = false,
  onCandidates,
}: {
  children: ReactNode;
  candidatesActive?: boolean;
  onCandidates: () => void;
}) {
  return (
    <div className="min-h-screen bg-ink-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] flex-col border-r border-ink-200 bg-white px-4 py-5 lg:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-600 text-xs font-bold tracking-tight text-white">
            IA
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-ink-900">Interview Agent</p>
            <p className="text-xs text-ink-400">Adaptive assessment</p>
          </div>
        </div>

        <nav className="mt-10" aria-label="Primary navigation">
          <button
            type="button"
            onClick={onCandidates}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 ${
              candidatesActive
                ? 'bg-accent-50 text-accent-700'
                : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            Candidates
          </button>
        </nav>

        <div className="mt-auto rounded-2xl border border-ink-100 bg-ink-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">AI cohort</p>
          <p className="mt-2 text-sm font-medium text-ink-800">31-day journey</p>
          <p className="mt-1 text-xs leading-5 text-ink-500">Learning history meets live technical evidence.</p>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[236px]">
        <div className="flex h-16 items-center justify-between border-b border-ink-200 bg-white px-5 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-600 text-[11px] font-bold text-white">IA</div>
            <span className="text-sm font-semibold text-ink-900">Interview Agent</span>
          </div>
          <button
            type="button"
            onClick={onCandidates}
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            Candidates
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-ink-200 bg-white shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  const variants = {
    primary: 'bg-accent-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-accent-700 hover:shadow-md',
    secondary: 'border border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50',
    ghost: 'text-ink-600 hover:bg-ink-100',
  };
  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({ children, color = 'gray' }: { children: ReactNode; color?: 'gray' | 'green' | 'amber' | 'red' | 'indigo' }) {
  const colors = {
    gray: 'bg-ink-100 text-ink-600',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    indigo: 'bg-accent-50 text-accent-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center gap-2 text-ink-400">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-200 border-t-accent-500" />
      <span className="text-sm">Analyzing response…</span>
    </div>
  );
}

export function Divider() {
  return <div className="h-px bg-ink-100" />;
}

export function StatCard({ label, value, sublabel }: { label: string; value: ReactNode; sublabel?: string }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="text-3xl font-semibold tracking-tight text-ink-900">{value}</div>
      <div className="mt-3 text-sm font-medium text-ink-700">{label}</div>
      {sublabel && <div className="mt-0.5 text-sm text-ink-400">{sublabel}</div>}
    </Card>
  );
}

export function Avatar({ initials, name, size = 'md' }: { initials: string; name: string; size?: 'md' | 'lg' | 'xl' }) {
  const hue = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const sizes = {
    md: 'h-11 w-11 text-sm',
    lg: 'h-12 w-12 text-sm',
    xl: 'h-16 w-16 text-lg',
  };
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${sizes[size]}`}
      style={{ backgroundColor: `hsl(${hue}, 38%, 48%)` }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

export function LearningJourney({ candidate, size = 'compact' }: { candidate: Candidate; size?: 'compact' | 'large' }) {
  const colors = {
    passed: 'bg-emerald-500',
    warning: 'bg-amber-400',
    failed: 'bg-red-500',
    skipped: 'journey-cell-skipped',
    none: 'bg-ink-200',
  };
  const statusLabels = {
    passed: 'passed on the first attempt',
    warning: 'passed after multiple attempts',
    failed: 'failed',
    skipped: 'skipped',
    none: 'no recorded mission',
  };

  return (
    <div className="w-full" role="img" aria-label={`31-day learning journey for ${candidate.member.name}`}>
      <div className="grid grid-cols-[repeat(31,minmax(0,1fr))] gap-[3px] sm:gap-1">
        {Array.from({ length: 31 }, (_, index) => {
          const day = index + 1;
          const status = getDayStatus(candidate, day);
          const curriculumDay = getCurriculumDay(day);
          const label = `Day ${day}${curriculumDay ? `, ${curriculumDay.title}` : ''}: ${statusLabels[status]}`;
          return (
            <span
              key={day}
              className={`${size === 'large' ? 'h-7 rounded-md sm:h-9' : 'h-3 rounded-[3px]'} ${colors[status]}`}
              title={label}
              aria-label={label}
            />
          );
        })}
      </div>
      {size === 'large' && (
        <div className="mt-2 grid grid-cols-5 text-[11px] font-medium text-ink-400" aria-hidden="true">
          <span>Day 1</span>
          <span className="text-center">8</span>
          <span className="text-center">16</span>
          <span className="text-center">24</span>
          <span className="text-right">31</span>
        </div>
      )}
    </div>
  );
}
