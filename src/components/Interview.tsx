import { useState } from 'react';
import type { Candidate, InterviewState } from '../types';
import { getInitials } from '../data';
import { Avatar, Badge, Button, Card, Divider, Spinner } from './ui';

export function Interview({
  candidate,
  state,
  loading,
  totalQuestions,
  onSubmit,
  onExit,
}: {
  candidate: Candidate;
  state: InterviewState;
  loading: boolean;
  totalQuestions: number;
  onSubmit: (answer: string) => void;
  onExit: () => void;
}) {
  const [answer, setAnswer] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);

  const currentTurn = state.turns[state.turns.length - 1];
  const isCandidateTurn = currentTurn?.role === 'candidate';
  const questionTurn = isCandidateTurn ? null : currentTurn;

  const transcript = state.turns;

  const handleSubmit = () => {
    if (!answer.trim() || loading) return;
    onSubmit(answer.trim());
    setAnswer('');
  };

  const questionNumber = state.currentIndex + 1;

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="text-sm font-medium text-ink-500 hover:text-ink-900">
              ← Exit
            </button>
            <Divider />
            <span className="text-sm font-semibold text-ink-900">Live Interview</span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar initials={getInitials(candidate.member.name)} name={candidate.member.name} />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-ink-800">{candidate.member.name}</p>
              <p className="text-xs text-ink-400">{candidate.member.jobRole}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-6 py-6">
        {/* Main area */}
        <div className="flex-1">
          {questionTurn ? (
            <Card className="p-8">
              <div className="flex items-center gap-2">
                <Badge color="indigo">AI Interviewer</Badge>
                <Badge color="gray">Day {questionTurn.day}</Badge>
                <Badge color="gray">{questionTurn.topic}</Badge>
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink-400">
                  Question {questionNumber} of {totalQuestions}
                </div>
                <p className="mt-3 text-xl font-medium leading-relaxed text-ink-900">
                  {questionTurn.content}
                </p>
                <div className="mt-4">
                  <Badge color={difficultyColor(questionTurn.difficulty ?? 'Standard')}>{questionTurn.difficulty}</Badge>
                </div>
              </div>
              <Divider />
              <div className="mt-5">
                <label className="text-sm font-medium text-ink-700">Your Answer</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSubmit();
                    }
                  }}
                  placeholder="Type your answer here… (Cmd/Ctrl + Enter to submit)"
                  rows={6}
                  className="mt-2 w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400"
                />
                <div className="mt-3 flex items-center justify-between">
                  {loading ? <Spinner /> : <span className="text-xs text-ink-400">Take your time — think before answering.</span>}
                  <Button onClick={handleSubmit} disabled={!answer.trim() || loading} size="md">
                    Submit Answer
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex h-full items-center justify-center p-8">
              <Spinner />
            </Card>
          )}
        </div>

        {/* Side panel */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <SidePanel
            state={state}
            totalQuestions={totalQuestions}
            transcript={transcript}
            loading={loading}
          />
        </aside>
      </div>

      {/* Mobile transcript toggle */}
      <div className="border-t border-ink-200 bg-white lg:hidden">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full px-6 py-3 text-left text-sm font-medium text-ink-600"
        >
          {showTranscript ? 'Hide' : 'Show'} transcript & progress
        </button>
        {showTranscript && (
          <div className="border-t border-ink-100 px-6 py-4">
            <SidePanel
              state={state}
              totalQuestions={totalQuestions}
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
  state,
  totalQuestions,
  transcript,
  loading,
}: {
  state: InterviewState;
  totalQuestions: number;
  transcript: { role: string; content: string; day?: number; topic?: string }[];
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Progress</h3>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-500">Question</span>
            <span className="font-medium text-ink-900">{state.currentIndex + 1} / {totalQuestions}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-500">Difficulty</span>
            <Badge color={difficultyColor(state.difficulty)}>{state.difficulty}</Badge>
          </div>
          <div>
            <div className="mb-1.5 text-sm text-ink-500">Covered days</div>
            <div className="flex flex-wrap gap-1">
              {state.coveredDays.map((d) => (
                <Badge key={d} color="indigo">Day {d}</Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Transcript</h3>
        <div className="mt-3 max-h-80 space-y-3 overflow-y-auto">
          {transcript.length === 0 && (
            <p className="text-xs text-ink-400">No questions yet.</p>
          )}
          {transcript.map((t, i) => (
            <div key={i} className={t.role === 'interviewer' ? 'border-l-2 border-accent-300 pl-2.5' : 'border-l-2 border-ink-200 pl-2.5'}>
              <div className="text-xs font-medium text-ink-400">
                {t.role === 'interviewer' ? `Interviewer${t.topic ? ` · ${t.topic}` : ''}` : 'Candidate'}
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-600 line-clamp-3">{t.content}</p>
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

function difficultyColor(d: string): 'gray' | 'indigo' | 'green' | 'amber' {
  switch (d) {
    case 'Foundational':
      return 'gray';
    case 'Standard':
      return 'indigo';
    case 'Advanced':
      return 'green';
    case 'Deep':
      return 'amber';
    default:
      return 'gray';
  }
}
