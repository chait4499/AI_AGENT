import { useInterviewFlow } from './useInterviewFlow';
import { Selection } from './components/Selection';
import { Brief } from './components/Brief';
import { Interview } from './components/Interview';
import { FeedbackView } from './components/Feedback';

export default function App() {
  const flow = useInterviewFlow();

  if (flow.view === 'selection') {
    return <Selection onSelect={flow.selectCandidate} />;
  }

  if (flow.view === 'brief' && flow.candidate) {
    return (
      <Brief
        candidate={flow.candidate}
        onStart={flow.startInterview}
        onBack={flow.reset}
      />
    );
  }

  if (flow.view === 'interview' && flow.candidate && flow.state) {
    return (
      <Interview
        candidate={flow.candidate}
        state={flow.state}
        loading={flow.loading}
        totalQuestions={flow.totalQuestions}
        onSubmit={flow.submitAnswer}
        onExit={flow.reset}
      />
    );
  }

  if (flow.view === 'feedback' && flow.candidate && flow.state?.feedback) {
    return (
      <FeedbackView
        candidate={flow.candidate}
        feedback={flow.state.feedback}
        onReset={flow.reset}
      />
    );
  }

  return <Selection onSelect={flow.selectCandidate} />;
}
