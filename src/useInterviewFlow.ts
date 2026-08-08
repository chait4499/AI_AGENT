import { useCallback, useState } from 'react';
import type { Candidate, Difficulty, Feedback, InterviewState, Turn, View } from './types';
import { curriculum } from './data';

const MOCK_QUESTIONS: { day: number; topic: string; question: string; difficulty: Difficulty }[] = [
  {
    day: 7,
    topic: 'Embeddings Explained',
    question: 'Can you explain how text is converted into vector embeddings and why similar concepts cluster together in vector space?',
    difficulty: 'Standard',
  },
  {
    day: 10,
    topic: 'Retrieval & Matching Engine',
    question: 'Walk me through how you would design a query router that decides between SQL lookup, vector search, and hybrid retrieval. What signals would drive that decision?',
    difficulty: 'Advanced',
  },
  {
    day: 12,
    topic: 'Prompt Engineering Fundamentals',
    question: 'Compare zero-shot, few-shot, and chain-of-thought prompting — when would you reach for each, and what are the tradeoffs in accuracy versus token cost?',
    difficulty: 'Standard',
  },
  {
    day: 13,
    topic: 'Function Calling & Structured Outputs',
    question: 'How do you validate structured outputs from an LLM using something like Pydantic? What happens when the model returns a malformed tool call, and how would you handle that gracefully?',
    difficulty: 'Advanced',
  },
  {
    day: 22,
    topic: 'Multi-Agent Orchestration',
    question: 'In what scenarios does a multi-agent architecture outperform a single agent? Can you give a concrete healthcare example where delegation to a specialist agent is worth the overhead?',
    difficulty: 'Deep',
  },
  {
    day: 23,
    topic: 'Model Context Protocol (MCP)',
    question: 'Explain the purpose of the Model Context Protocol. How does exposing chatbot tools through MCP differ from a standard function-calling integration, and what are the benefits of the standardized interface?',
    difficulty: 'Advanced',
  },
  {
    day: 28,
    topic: 'Docker & Kubernetes Deployment',
    question: 'Walk me through how you would configure health checks, environment variables, and rolling updates for a FastAPI backend deployed to Kubernetes. What would your deployment strategy look like?',
    difficulty: 'Deep',
  },
  {
    day: 31,
    topic: 'Capstone Project & Final Demo',
    question: 'If you had to add a multilingual interface to an enterprise healthcare chatbot, how would you integrate it end-to-end across retrieval, the LLM layer, and the frontend without breaking existing functionality?',
    difficulty: 'Deep',
  },
];

function buildMockFeedback(candidate: Candidate): Feedback {
  return {
    summary: `${candidate.member.name} completed the mocked interview. This placeholder feedback does not evaluate the submitted answers; answer evaluation will be provided by the future AI backend.`,
    strengths: ['Answer-based strengths are not evaluated in this frontend mock.'],
    gaps: ['Answer-based knowledge gaps are not evaluated in this frontend mock.'],
    next: [
      'Review the interview transcript once answer evaluation is connected.',
    ],
  };
}

function buildMockTurns(): Turn[] {
  return MOCK_QUESTIONS.map((q) => ({
    role: 'interviewer' as const,
    content: q.question,
    day: q.day,
    topic: q.topic,
    difficulty: q.difficulty,
  }));
}

function generateSessionId(): string {
  return `mock-${Date.now().toString(36)}`;
}

export function useInterviewFlow() {
  const [view, setView] = useState<View>('selection');
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [state, setState] = useState<InterviewState | null>(null);
  const [loading, setLoading] = useState(false);

  const selectCandidate = useCallback((c: Candidate) => {
    setCandidate(c);
    setView('brief');
  }, []);

  const startInterview = useCallback(() => {
    if (!candidate) return;
    const turns = buildMockTurns();
    const first = MOCK_QUESTIONS[0];
    setState({
      sessionId: generateSessionId(),
      candidate,
      turns: [turns[0]],
      currentIndex: 0,
      coveredDays: [first.day],
      difficulty: first.difficulty,
      done: false,
      feedback: null,
    });
    setView('interview');
  }, [candidate]);

  const submitAnswer = useCallback(
    (answer: string) => {
      if (!state) return;
      setLoading(true);

      setTimeout(() => {
        setState((prev) => {
          if (!prev) return prev;
          const newTurns = [...prev.turns, { role: 'candidate' as const, content: answer }];
          const nextIndex = prev.currentIndex + 1;

          if (nextIndex >= MOCK_QUESTIONS.length) {
            setView('feedback');
            return {
              ...prev,
              turns: newTurns,
              done: true,
              feedback: buildMockFeedback(prev.candidate),
            };
          }

          const nextQ = MOCK_QUESTIONS[nextIndex];
          newTurns.push({
            role: 'interviewer' as const,
            content: nextQ.question,
            day: nextQ.day,
            topic: nextQ.topic,
            difficulty: nextQ.difficulty,
          });

          const coveredDays = Array.from(new Set([...prev.coveredDays, nextQ.day]));

          return {
            ...prev,
            turns: newTurns,
            currentIndex: nextIndex,
            coveredDays,
            difficulty: nextQ.difficulty,
          };
        });
        setLoading(false);
      }, 400);
    },
    [state],
  );

  const reset = useCallback(() => {
    setCandidate(null);
    setState(null);
    setView('selection');
  }, []);

  const currentQuestion = state && !state.done ? MOCK_QUESTIONS[state.currentIndex] : null;

  return {
    view,
    candidate,
    state,
    loading,
    currentQuestion,
    totalQuestions: MOCK_QUESTIONS.length,
    curriculum,
    selectCandidate,
    startInterview,
    submitAnswer,
    reset,
  };
}
