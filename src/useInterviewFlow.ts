import { useCallback, useState } from 'react';
import type { ApiRequest, ApiResponse, Candidate, InterviewState, Turn, View } from './types';

const TOTAL_QUESTIONS = 8;

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `interview-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

async function postInterview(body: ApiRequest): Promise<ApiResponse> {
  const response = await fetch('/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null) as (ApiResponse & { error?: string }) | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? 'The interview service is unavailable.');
  }
  if (!payload) throw new Error('The interview service returned an invalid response.');
  return payload;
}

function questionTurn(response: ApiResponse): Turn {
  if (!response.question) throw new Error('The interview service did not return question details.');
  return {
    role: 'interviewer',
    content: response.reply,
    day: response.question.day,
    topic: response.question.topic,
    difficulty: response.question.difficulty,
  };
}

export function useInterviewFlow() {
  const [view, setView] = useState<View>('selection');
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [state, setState] = useState<InterviewState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectCandidate = useCallback((selected: Candidate) => {
    setCandidate(selected);
    setError(null);
    setView('brief');
  }, []);

  const startInterview = useCallback(async () => {
    if (!candidate || loading) return;
    const sessionId = generateSessionId();
    setLoading(true);
    setError(null);

    try {
      const response = await postInterview({ sessionId, candidate });
      const firstTurn = questionTurn(response);
      setState({
        sessionId,
        candidate,
        turns: [firstTurn],
        currentIndex: (response.questionCount ?? 1) - 1,
        coveredDays: response.coveredDays ?? [firstTurn.day as number],
        difficulty: firstTurn.difficulty ?? 'Standard',
        done: false,
        feedback: null,
      });
      setView('interview');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to start the interview.');
    } finally {
      setLoading(false);
    }
  }, [candidate, loading]);

  const submitAnswer = useCallback(
    async (answer: string): Promise<boolean> => {
      if (!state || loading || !answer.trim()) return false;
      setLoading(true);
      setError(null);

      try {
        const response = await postInterview({ sessionId: state.sessionId, message: answer.trim() });
        const candidateTurn: Turn = { role: 'candidate', content: answer.trim() };

        if (response.done) {
          if (!response.feedback) throw new Error('The completed interview did not return feedback.');
          setState((previous) => previous ? {
            ...previous,
            turns: [...previous.turns, candidateTurn],
            currentIndex: (response.questionCount ?? previous.currentIndex + 1) - 1,
            coveredDays: response.coveredDays ?? previous.coveredDays,
            done: true,
            feedback: response.feedback as NonNullable<ApiResponse['feedback']>,
          } : previous);
          setView('feedback');
          return true;
        }

        const nextTurn = questionTurn(response);
        setState((previous) => previous ? {
          ...previous,
          turns: [...previous.turns, candidateTurn, nextTurn],
          currentIndex: (response.questionCount ?? previous.currentIndex + 2) - 1,
          coveredDays: response.coveredDays ?? previous.coveredDays,
          difficulty: nextTurn.difficulty ?? previous.difficulty,
        } : previous);
        return true;
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Unable to submit the answer.');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [state, loading],
  );

  const reset = useCallback(() => {
    setCandidate(null);
    setState(null);
    setError(null);
    setView('selection');
  }, []);

  return {
    view,
    candidate,
    state,
    loading,
    error,
    totalQuestions: TOTAL_QUESTIONS,
    selectCandidate,
    startInterview,
    submitAnswer,
    reset,
  };
}
