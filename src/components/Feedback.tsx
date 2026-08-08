import type { Candidate, Feedback, InterviewObservation } from '../types';
import { getInitials } from '../data';
import { buildSignalValidations, findFeedbackEvidence, type ValidationStatus } from '../evidence';
import { Avatar, Button, Card } from './ui';

export function FeedbackView({
  candidate,
  feedback,
  observations,
  onReset,
}: {
  candidate: Candidate;
  feedback: Feedback;
  observations: InterviewObservation[];
  onReset: () => void;
}) {
  const m = candidate.member;
  const validations = buildSignalValidations(candidate, observations);

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-[1150px] items-center justify-between px-5 py-4 sm:px-8 xl:px-10">
          <button onClick={onReset} className="rounded-lg px-2 py-2 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
            ← New interview
          </button>
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-400">Interview report</span>
        </div>
      </header>

      <main className="mx-auto max-w-[1150px] px-5 py-8 sm:px-8 sm:py-12 xl:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Interview complete
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-ink-900 sm:text-4xl">Technical interview report</h1>
          </div>
          <div className="flex items-center gap-3 sm:text-right">
            <Avatar initials={getInitials(m.name)} name={m.name} size="lg" />
            <div>
              <p className="text-base font-semibold text-ink-900">{m.name}</p>
              <p className="mt-1 text-sm text-ink-500">{m.jobRole} · {m.yearsExperience} years experience</p>
            </div>
          </div>
        </div>

        <Card className="mt-8 overflow-hidden border-accent-100">
          <div className="border-b border-accent-100 bg-accent-50/60 px-5 py-4 sm:px-7">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-accent-700">Overall assessment</h2>
          </div>
          <p className="px-5 py-6 text-base leading-8 text-ink-700 sm:px-7 sm:py-8 sm:text-lg">{feedback.summary}</p>
        </Card>

        {validations.length > 0 && (
          <Card className="mt-5 p-5 sm:p-7">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-400">Learning signal validation</h2>
              <p className="mt-2 text-sm leading-6 text-ink-500">Historical learning context compared with evidence observed in this interview.</p>
            </div>
            <div className="mt-6 divide-y divide-ink-100">
              {validations.map((validation) => (
                <div key={validation.day} className="grid gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1.4fr)_1fr_1fr_1.3fr] sm:items-center">
                  <div>
                    <p className="text-xs font-semibold text-accent-700">Day {validation.day}</p>
                    <p className="mt-1 text-sm font-medium leading-5 text-ink-800">{validation.topic}</p>
                  </div>
                  <ValidationDatum label="Learning journey" value={validation.history} />
                  <ValidationDatum label="Live interview" value={validation.live} />
                  <div>
                    <p className="text-[11px] font-medium text-ink-400">Current signal</p>
                    <ValidationBadge status={validation.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <FeedbackList title="Strengths" items={feedback.strengths} icon="check" color="green" kind="strength" observations={observations} />
          <FeedbackList title="Areas to strengthen" items={feedback.gaps} icon="alert" color="amber" kind="gap" observations={observations} />
        </div>

        <Card className="mt-5 p-5 sm:p-7">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-400">Recommended next steps</h2>
          <ol className="mt-6 divide-y divide-ink-100">
            {feedback.next.map((step, i) => (
              <li key={i} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                <span className="shrink-0 font-mono text-sm font-semibold text-accent-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm leading-6 text-ink-700 sm:text-[15px]">{step}</span>
              </li>
            ))}
          </ol>
        </Card>

        <div className="mt-8 flex justify-end border-t border-ink-200 pt-8">
          <Button onClick={onReset} size="lg">
            Start new interview <span aria-hidden="true">→</span>
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
  kind,
  observations,
}: {
  title: string;
  items: string[];
  icon: 'check' | 'alert';
  color: 'green' | 'amber';
  kind: 'strength' | 'gap';
  observations: InterviewObservation[];
}) {
  const palette = color === 'green'
    ? { icon: 'text-emerald-600', background: 'bg-emerald-50', border: 'border-t-emerald-500' }
    : { icon: 'text-amber-700', background: 'bg-amber-50', border: 'border-t-amber-400' };
  return (
    <Card className={`border-t-2 p-5 sm:p-7 ${palette.border}`}>
      <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-500">{title}</h2>
      <ul className="mt-6 space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            {icon === 'check' ? (
              <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${palette.background}`}>
              <svg className={`h-3.5 w-3.5 ${palette.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              </span>
            ) : (
              <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${palette.background} ${palette.icon}`} aria-hidden="true">△</span>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-sm leading-6 text-ink-700 sm:text-[15px]">{item}</span>
              <EvidenceDisclosure item={item} kind={kind} observations={observations} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ValidationDatum({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-ink-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink-700">{value}</p>
    </div>
  );
}

function ValidationBadge({ status }: { status: ValidationStatus }) {
  const styles: Record<ValidationStatus, string> = {
    'STRENGTH CONFIRMED': 'bg-emerald-50 text-emerald-700',
    'IMPROVEMENT VALIDATED': 'bg-emerald-50 text-emerald-700',
    'NEEDS REINFORCEMENT': 'bg-amber-50 text-amber-700',
    'CURRENTLY INCONCLUSIVE': 'bg-ink-100 text-ink-600',
  };
  const symbol = status === 'NEEDS REINFORCEMENT' ? '△' : status === 'CURRENTLY INCONCLUSIVE' ? '○' : '✓';
  return (
    <span className={`mt-1.5 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-semibold tracking-[0.08em] ${styles[status]}`}>
      <span aria-hidden="true">{symbol}</span> {status}
    </span>
  );
}

function EvidenceDisclosure({
  item,
  kind,
  observations,
}: {
  item: string;
  kind: 'strength' | 'gap';
  observations: InterviewObservation[];
}) {
  const evidence = findFeedbackEvidence(item, kind, observations);
  if (!evidence) return null;
  return (
    <details className="group mt-2 rounded-lg border border-ink-100 bg-ink-50 px-3 py-2">
      <summary className="cursor-pointer list-none text-xs font-medium text-accent-700 outline-none focus-visible:underline">
        View evidence <span className="inline-block text-ink-400 transition-transform group-open:rotate-180" aria-hidden="true">⌄</span>
      </summary>
      <div className="mt-2 border-t border-ink-200 pt-2">
        <p className="text-[11px] font-semibold text-ink-500">Day {evidence.day} · Question {evidence.questionNumber}</p>
        <p className="mt-1 text-[11px] text-ink-400">{evidence.topic}</p>
        <p className="mt-2 text-xs leading-5 text-ink-600"><span className="font-medium text-ink-700">Candidate evidence:</span> “{evidence.excerpt}”</p>
      </div>
    </details>
  );
}
