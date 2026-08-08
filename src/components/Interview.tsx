import { useState } from 'react';
import type { Candidate, InterviewState } from '../types';
import { getInitials } from '../data';
import { buildInterviewPath, explainCurrentQuestion } from '../evidence';
import { Avatar, Button, Card, Spinner } from './ui';

export function Interview({
  candidate,
  state,
  loading,
  error,
  onSubmit,
  onExit,
}: {
  candidate: Candidate;
  state: InterviewState;
  loading: boolean;
  error: string | null;
  onSubmit: (answer: string) => Promise<boolean>;
  onExit: () => void;
}) {
  const [answer, setAnswer] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);

  const currentTurn = state.turns[state.turns.length - 1];
  const isCandidateTurn = currentTurn?.role === 'candidate';
  const questionTurn = isCandidateTurn ? null : currentTurn;

  const transcript = state.turns;
  const questionReason = explainCurrentQuestion(candidate, state.turns, state.observations);

  const handleSubmit = async () => {
    if (!answer.trim() || loading) return;
    const submitted = await onSubmit(answer.trim());
    if (submitted) setAnswer('');
  };

  const questionNumber = state.currentIndex + 1;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1300px] items-center justify-between px-5 py-4 sm:px-8 xl:px-10">
          <div className="flex items-center gap-4">
            <button onClick={onExit} className="rounded-lg px-2 py-2 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
              ← Exit
            </button>
            <span className="hidden h-5 w-px bg-ink-200 sm:block" />
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live interview
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Avatar initials={getInitials(candidate.member.name)} name={candidate.member.name} />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-ink-800">{candidate.member.name}</p>
              <p className="mt-0.5 text-xs text-ink-400">{candidate.member.jobRole}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1300px] flex-1 grid-cols-1 gap-5 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-7 xl:px-10">
        {/* Main area */}
        <main className="min-w-0">
          {questionTurn ? (
            <Card className="overflow-hidden" >
              <div className="flex flex-col gap-3 border-b border-ink-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-accent-600">AI interviewer</span>
                <span className="text-sm font-medium text-ink-500">Day {questionTurn.day}</span>
              </div>
              <div className="px-5 py-7 sm:px-8 sm:py-10 xl:px-10 xl:py-12">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
                  Question {questionNumber}
                </div>
                <h1 className="mt-5 max-w-4xl text-2xl font-semibold leading-[1.35] tracking-[-0.025em] text-ink-900 sm:text-[28px]">
                  {questionTurn.content}
                </h1>
                <div className="mt-6 flex flex-col gap-2 border-l-2 border-accent-300 pl-4 sm:flex-row sm:items-center sm:gap-3">
                  <span className="text-sm font-medium text-ink-700">{questionTurn.topic}</span>
                  <span className="hidden h-1 w-1 rounded-full bg-ink-300 sm:block" />
                  <span className="text-sm text-ink-500">Difficulty: {questionTurn.difficulty}</span>
                </div>
                {questionReason && (
                  <details className="group mt-6 max-w-2xl rounded-xl border border-ink-200 bg-ink-50/80 px-4 py-3">
                    <summary className="cursor-pointer list-none text-sm font-medium text-ink-600 outline-none transition-colors hover:text-accent-700 focus-visible:text-accent-700">
                      <span>Why this question?</span>
                      <span className="ml-2 inline-block text-ink-400 transition-transform group-open:rotate-180" aria-hidden="true">⌄</span>
                    </summary>
                    <p className="mt-3 border-t border-ink-200 pt-3 text-sm leading-6 text-ink-600">{questionReason}</p>
                  </details>
                )}
              </div>

              <div className="border-t border-ink-100 bg-ink-50/60 px-5 py-6 sm:px-8 sm:py-8 xl:px-10">
                <label htmlFor="interview-answer" className="text-sm font-semibold text-ink-800">Your answer</label>
                <textarea
                  id="interview-answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      void handleSubmit();
                    }
                  }}
                  placeholder="Explain your approach, key decisions, and trade-offs…"
                  rows={7}
                  disabled={loading}
                  className="mt-3 w-full rounded-xl border border-ink-200 bg-white px-4 py-4 text-[15px] leading-6 text-ink-900 shadow-sm outline-none transition placeholder:text-ink-400 focus:border-accent-400 focus:ring-4 focus:ring-accent-100 disabled:cursor-wait disabled:bg-ink-50"
                />
                {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {loading ? <Spinner /> : <span className="text-xs text-ink-400">⌘ / Ctrl + Enter to submit</span>}
                  <Button onClick={handleSubmit} disabled={!answer.trim() || loading} size="lg" className="w-full sm:w-auto">
                    {loading ? 'Analyzing…' : <>Submit answer <span aria-hidden="true">→</span></>}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex min-h-[420px] items-center justify-center p-8">
              <Spinner />
            </Card>
          )}
        </main>

        {/* Side panel */}
        <aside className="hidden lg:block">
          <SidePanel
            candidate={candidate}
            state={state}
            transcript={transcript}
            loading={loading}
          />
        </aside>
      </div>

      {/* Mobile transcript toggle */}
      <div className="border-t border-ink-200 bg-white lg:hidden">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full px-5 py-4 text-left text-sm font-medium text-ink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-500"
        >
          {showTranscript ? 'Hide' : 'Show'} transcript & progress
        </button>
        {showTranscript && (
          <div className="border-t border-ink-100 bg-ink-50 px-5 py-5">
            <SidePanel
              candidate={candidate}
              state={state}
              transcript={transcript}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SidePanel({
  candidate,
  state,
  transcript,
  loading,
}: {
  candidate: Candidate;
  state: InterviewState;
  transcript: { role: string; content: string; day?: number; topic?: string }[];
  loading: boolean;
}) {
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-400">Progress</h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-ink-50 p-3">
            <span className="text-xs text-ink-400">Question</span>
            <p className="mt-1 text-xl font-semibold text-ink-900">{state.currentIndex + 1}</p>
          </div>
          <div className="rounded-xl bg-ink-50 p-3">
            <span className="text-xs text-ink-400">Difficulty</span>
            <p className="mt-1 truncate text-sm font-semibold text-ink-900">{state.difficulty}</p>
          </div>
          <div className="col-span-2 border-t border-ink-100 pt-4">
            <div className="mb-2 text-xs font-medium text-ink-500">Covered curriculum</div>
            <div className="flex flex-wrap gap-1.5">
              {state.coveredDays.map((d) => (
                <span key={d} className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-accent-50 px-2 text-xs font-semibold text-accent-700">{d}</span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <InterviewPath candidate={candidate} state={state} />

      <Card className="p-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-400">Conversation</h2>
        <div className="mt-4 max-h-[430px] space-y-4 overflow-y-auto pr-1">
          {transcript.length === 0 && (
            <p className="text-xs text-ink-400">No questions yet.</p>
          )}
          {transcript.map((t, i) => (
            <div key={i} className={t.role === 'interviewer' ? 'border-l-2 border-accent-300 pl-3' : 'border-l-2 border-ink-300 pl-3'}>
              <div className={`text-[11px] font-semibold uppercase tracking-wide ${t.role === 'interviewer' ? 'text-accent-600' : 'text-ink-400'}`}>
                {t.role === 'interviewer' ? `Interviewer${t.topic ? ` · ${t.topic}` : ''}` : 'Candidate'}
              </div>
              <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-ink-600">{t.content}</p>
            </div>
          ))}
          {loading && (
            <div className="border-l-2 border-accent-200 pl-2.5">
              <div className="text-xs font-medium text-ink-400">Interviewer</div>
              <Spinner />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function InterviewPath({ candidate, state }: { candidate: Candidate; state: InterviewState }) {
  const path = buildInterviewPath(candidate, state.turns, state.observations).slice(-5);
  if (path.length === 0) return null;

  return (
    <Card className="p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-400">Interview path</h2>
      <ol className="mt-4">
        {path.map((item, index) => (
          <li key={item.questionNumber}>
            {index > 0 && item.label && (
              <div className="flex items-center gap-2 py-2 pl-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                <span aria-hidden="true">↓</span>
                {item.label}
              </div>
            )}
            <div className="rounded-xl border border-ink-100 bg-ink-50 px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-accent-700">Day {item.day}</span>
                {index === 0 && item.label && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">{item.label}</span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-600">{item.topic}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
