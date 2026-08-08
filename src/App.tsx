import { useInterviewFlow } from './useInterviewFlow';
import { Selection } from './components/Selection';
import { Brief } from './components/Brief';
import { Interview } from './components/Interview';
import { FeedbackView } from './components/Feedback';
import { AppShell } from './components/ui';

export default function App() {
  const flow = useInterviewFlow();
  let content;

  if (flow.view === 'selection') {
    content = <Selection onSelect={flow.selectCandidate} />;
  } else if (flow.view === 'brief' && flow.candidate) {
    content = (
      <Brief
        candidate={flow.candidate}
        onStart={flow.startInterview}
        onBack={flow.reset}
        loading={flow.loading}
        error={flow.error}
      />
    );
  } else if (flow.view === 'interview' && flow.candidate && flow.state) {
    content = (
      <Interview
        candidate={flow.candidate}
        state={flow.state}
        loading={flow.loading}
        error={flow.error}
        onSubmit={flow.submitAnswer}
        onExit={flow.reset}
      />
    );
  } else if (flow.view === 'feedback' && flow.candidate && flow.state?.feedback) {
    content = (
      <FeedbackView
        candidate={flow.candidate}
        feedback={flow.state.feedback}
        onReset={flow.reset}
      />
    );
  } else {
    content = <Selection onSelect={flow.selectCandidate} />;
  }

  return (
    <AppShell candidatesActive={flow.view === 'selection'} onCandidates={flow.reset}>
      {content}
    </AppShell>
  );
}
