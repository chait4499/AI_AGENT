import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-ink-200 bg-white shadow-card ${className}`}>
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
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-accent-600 text-white hover:bg-accent-700',
    secondary: 'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50',
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
      <span className="text-sm">Thinking…</span>
    </div>
  );
}

export function Divider() {
  return <div className="h-px bg-ink-100" />;
}

export function StatCard({ label, value, sublabel }: { label: string; value: ReactNode; sublabel?: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-ink-900">{value}</div>
      {sublabel && <div className="mt-0.5 text-xs text-ink-500">{sublabel}</div>}
    </Card>
  );
}

export function Avatar({ initials, name }: { initials: string; name: string }) {
  const hue = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
      style={{ backgroundColor: `hsl(${hue}, 45%, 55%)` }}
    >
      {initials}
    </div>
  );
}
