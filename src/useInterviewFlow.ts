import { useCallback, useState } from 'react';
import type { Candidate, Difficulty, Feedback, InterviewState, Turn, View } from './types';
import { curriculum } from './data';

const MOCK_QUESTIONS: { day: number; topic: string; question: string; difficulty: Difficulty }[] = [
  {
    day: 7,
    topic: 'Embeddings Explained',
    question: 'You completed the Embeddings mission on your first try. Can you explain how text is converted into vector embeddings and why similar concepts cluster together in vector space?',
    difficulty: 'Standard',
  },
  {
    day: 10,
    topic: 'Retrieval & Matching Engine',
    question: 'Your retrieval engine mission was solid. Walk me through how you would design a query router that decides between SQL lookup, vector search, and hybrid retrieval. What signals would drive that decision?',
    difficulty: 'Advanced',
  },
  {
    day: 12,
    topic: 'Prompt Engineering Fundamentals',
    question: 'You needed several attempts on Prompt Engineering Fundamentals. Compare zero-shot, few-shot, and chain-of-thought prompting — when would you reach for each, and what are the tradeoffs in accuracy versus token cost?',
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
    question: 'You worked on multi-agent orchestration with CrewAI. In what scenarios does a multi-agent architecture outperform a single agent? Can you give a concrete healthcare example where delegation to a specialist agent is worth the overhead?',
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
    question: 'You deployed the chatbot to Kubernetes. Walk me through how you would configure health checks, environment variables, and rolling updates for the FastAPI backend. What would your deployment strategy look like?',
    difficulty: 'Deep',
  },
  {
    day: 31,
    topic: 'Capstone Project & Final Demo',
    question: 'For your capstone, you demonstrated a full enterprise healthcare chatbot. If you had to add a new feature — say, a multilingual interface — how would you integrate it end-to-end across retrieval, the LLM layer, and the frontend without breaking existing functionality?',
    difficulty: 'Deep',
  },
];

const MOCK_FEEDBACK: Feedback = {
  summary:
    'Sarah demonstrated strong foundational understanding of embeddings and retrieval, and a solid grasp of multi-agent orchestration. She struggled initially with prompt engineering concepts but showed improvement. Her deployment and capstone work indicate production-readiness, though deeper exploration of fine-tuning tradeoffs would round out her skill set.',
  strengths: [
    'Strong first-principles understanding of embeddings and vector search',
    'Practical experience with multi-agent orchestration and MCP',
    'Production deployment experience with Docker and Kubernetes',
    'Clear communication when explaining architecture tradeoffs',
  ],
  gaps: [
    'Prompt engineering fundamentals required multiple attempts — revisit few-shot and chain-of-thought patterns',
    'Limited exposure to fine-tuning concepts (LoRA/QLoRA) — skipped those modules',
    'Could deepen knowledge of evaluation metrics for RAG pipelines',
  ],
  next: [
    'Build a side project that compares few-shot vs chain-of-thought prompting on a fixed dataset',
    'Take an online course on parameter-efficient fine-tuning (LoRA, QLoRA)',
    'Implement an automated evaluation pipeline for your existing RAG chatbot',
    'Contribute to an open-source agent framework to deepen orchestration skills',
  ],
};

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
              feedback: MOCK_FEEDBACK,
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
