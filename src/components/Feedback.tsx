import type { Candidate, Feedback } from '../types';
import { getInitials } from '../data';
import { Avatar, Button, Card, Divider } from './ui';

export function FeedbackView({
  candidate,
  feedback,
  onReset,
}: {
  candidate: Candidate;
  feedback: Feedback;
  onReset: () => void;
}) {
  const m = candidate.member;

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <button onClick={onReset} className="text-sm font-medium text-ink-500 hover:text-ink-900">
            ← New interview
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Interview Complete</h1>
        </div>

        <Card className="mt-6 p-5">
          <div className="flex items-center gap-3">
            <Avatar initials={getInitials(m.name)} name={m.name} />
            <div>
              <p className="text-sm font-semibold text-ink-900">{m.name}</p>
              <p className="text-xs text-ink-500">{m.jobRole} · {m.yearsExperience}y experience</p>
            </div>
          </div>
        </Card>

        <Card className="mt-4 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Summary</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-700">{feedback.summary}</p>
        </Card>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <FeedbackList title="Strengths" items={feedback.strengths} icon="check" color="green" />
          <FeedbackList title="Knowledge Gaps" items={feedback.gaps} icon="alert" color="amber" />
        </div>

        <Card className="mt-4 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Recommended Next Steps</h2>
          <ol className="mt-3 space-y-2.5">
            {feedback.next.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-50 text-xs font-semibold text-accent-600">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-ink-700">{step}</span>
              </li>
            ))}
          </ol>
        </Card>

        <div className="mt-8 flex justify-center">
          <Button onClick={onReset} size="lg">
            Start New Interview
          </Button>
        </div>
      </main>
    </div>
  );
}

function FeedbackList({
  title,
  items,
  icon,
  color,
}: {
  title: string;
  items: string[];
  icon: 'check' | 'alert';
  color: 'green' | 'amber';
}) {
  const iconColor = color === 'green' ? 'text-emerald-500' : 'text-amber-500';
  return (
    <Card className="p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">{title}</h2>
      <Divider />
      <ul className="mt-3 space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            {icon === 'check' ? (
              <svg className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.071 19h13.858c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <span className="text-sm leading-relaxed text-ink-700">{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
