import { curriculum, getCurriculumDay } from '../data';
import { Button, ThemeToggle, useTheme } from './ui';

const navigation = [
  ['How It Works', '#how-it-works'],
  ['Features', '#features'],
  ['Curriculum', '#curriculum'],
  ['For Organizers', '#organizers'],
  ['About', '#about'],
] as const;

const valueSignals = [
  { value: '31 Days', label: 'Structured Journey', icon: 'calendar' },
  { value: 'Adaptive', label: 'AI Interviewing', icon: 'path' },
  { value: 'Evidence-Based', label: 'Feedback', icon: 'evidence' },
  { value: 'Safe & Reliable', label: 'Graceful AI Fallbacks', icon: 'shield' },
] as const;

const steps = [
  {
    title: 'Curriculum-Aligned',
    description: 'A structured 31-day AI engineering curriculum provides the context for each interview.',
  },
  {
    title: 'Learning-Aware',
    description: 'Candidate mission history identifies potential strengths, difficult topics, and areas worth validating.',
  },
  {
    title: 'Adaptive Interview',
    description: 'Every response is assessed live, so the interviewer can follow up, deepen, or change topics.',
  },
  {
    title: 'Evidence & Feedback',
    description: 'Interview evidence and learning history become grounded strengths, gaps, and actionable next steps.',
  },
] as const;

const features = [
  {
    icon: 'path',
    title: 'Adaptive Questioning',
    description: 'Questions evolve with each response instead of following a fixed questionnaire.',
  },
  {
    icon: 'why',
    title: 'Why This Question?',
    description: 'See the structured signal behind each topic or follow-up without exposing hidden model reasoning.',
  },
  {
    icon: 'compare',
    title: 'Learning Signal Validation',
    description: 'Historical learning difficulty is compared with current interview performance.',
  },
  {
    icon: 'evidence',
    title: 'Evidence-Linked Feedback',
    description: 'Strengths and areas to improve trace back to evidence observed during the interview.',
  },
  {
    icon: 'levels',
    title: 'Dynamic Difficulty',
    description: 'Strong answers go deeper; partial answers trigger focused follow-ups and reinforcement.',
  },
  {
    icon: 'shield',
    title: 'Reliable AI Fallback',
    description: 'A bounded Gemini model chain and deterministic fallback keep the interview functional during temporary limits.',
  },
] as const;

const audiences = [
  {
    eyebrow: 'For candidates',
    title: 'An interview grounded in your journey.',
    items: [
      'Personalized to the actual learning journey',
      'Follow-ups respond to what the candidate says',
      'Feedback explains demonstrated strengths and gaps',
      'Recommendations connect back to the curriculum',
    ],
  },
  {
    eyebrow: 'For organizers',
    title: 'A consistent, evidence-aware assessment.',
    items: [
      'Consistent interview structure',
      'Minimum curriculum coverage enforced by code',
      'Evidence-backed candidate evaluation',
      'Graceful fallback, persistence, and structured feedback',
    ],
  },
] as const;

const reliabilitySignals = [
  ['Server-side secrets', 'shield'],
  ['Validated AI output', 'check'],
  ['Persistent sessions', 'database'],
  ['Graceful fallback', 'refresh'],
] as const;

export function Landing({ onStart }: { onStart: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const currentYear = new Date().getFullYear();
  const retrievalTitle = getCurriculumDay(10)?.title ?? 'The Retrieval & Matching Engine';

  const startInterview = () => {
    window.scrollTo({ top: 0 });
    onStart();
  };

  return (
    <div id="top" className="min-h-screen overflow-x-hidden bg-ink-50 text-ink-900">
      <header className="sticky top-0 z-50 border-b border-ink-200 bg-surface/95 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:h-[72px] xl:px-12">
          <a href="#top" className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2" aria-label="Interview Agent home">
            <BrandMark />
            <span className="text-sm font-semibold tracking-tight text-ink-900 sm:text-base">Interview Agent</span>
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Landing page navigation">
            {navigation.map(([label, href]) => (
              <a key={href} href={href} className="rounded-lg px-3 py-2 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle theme={theme} onToggle={toggleTheme} compact />
            <Button onClick={startInterview} size="sm">Start an Interview <span aria-hidden="true">→</span></Button>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle theme={theme} onToggle={toggleTheme} compact />
            <details className="group relative">
              <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 [&::-webkit-details-marker]:hidden" aria-label="Open navigation menu">
                <MenuIcon />
              </summary>
              <div className="absolute right-0 top-12 w-64 rounded-2xl border border-ink-200 bg-surface p-2 shadow-soft">
                <nav className="flex flex-col" aria-label="Mobile landing page navigation">
                  {navigation.map(([label, href]) => (
                    <a key={href} href={href} className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                      {label}
                    </a>
                  ))}
                </nav>
                <Button onClick={startInterview} className="mt-2 w-full" size="sm">Start an Interview <span aria-hidden="true">→</span></Button>
              </div>
            </details>
          </div>
        </div>
      </header>

      <main>
        <section className="relative border-b border-ink-100">
          <div className="mx-auto grid max-w-[1440px] items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)] lg:gap-12 lg:py-24 xl:gap-20 xl:px-12 xl:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-700">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                31-day AI-powered interviews
              </span>
              <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-ink-900 sm:text-6xl lg:text-[64px] xl:text-[72px]">
                Adaptive Interviews.<br />
                Real Learning.<br />
                <span className="text-accent-600">Proven Growth.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-ink-500 sm:text-lg sm:leading-8">
                The Interview Agent conducts adaptive, curriculum-aligned technical interviews across a 31-day AI engineering journey—validating strengths, probing gaps, and delivering evidence-backed feedback.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button onClick={startInterview} size="lg">Start an Interview <span aria-hidden="true">→</span></Button>
                <a href="#how-it-works" className="inline-flex items-center justify-center rounded-xl border border-ink-200 bg-surface px-6 py-3 text-base font-medium text-ink-700 transition-all hover:-translate-y-0.5 hover:border-ink-300 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2">
                  See How It Works
                </a>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-5 border-t border-ink-200 pt-7 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {valueSignals.map((signal) => (
                  <div key={signal.label} className="min-w-0">
                    <LineIcon kind={signal.icon} className="h-4 w-4 text-accent-600" />
                    <p className="mt-2 text-xs font-semibold text-ink-800">{signal.value}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-ink-400">{signal.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <ProductPreview />
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 border-b border-ink-100 bg-surface">
          <div className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 sm:py-24 xl:px-12 xl:py-28">
            <SectionHeading eyebrow="How it works" title="A 31-Day Adaptive Interview Journey" subtitle="Personalized. Adaptive. Evidence-backed." />
            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {steps.map((step, index) => (
                <article key={step.title} className="relative rounded-2xl border border-ink-200 bg-ink-50 p-6">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-50 text-xs font-semibold text-accent-700">{index + 1}</span>
                  <h3 className="mt-6 text-lg font-semibold text-ink-900">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-ink-500">{step.description}</p>
                  {index < steps.length - 1 && <span className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-ink-200 bg-surface text-xs text-ink-400 xl:flex" aria-hidden="true">→</span>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-20 border-b border-ink-100">
          <div className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 sm:py-24 xl:px-12 xl:py-28">
            <SectionHeading eyebrow="Product intelligence" title="Built to interview the journey, not just the résumé." />
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <article key={feature.title} className="rounded-2xl border border-ink-200 bg-surface p-6 shadow-card transition-transform duration-200 hover:-translate-y-0.5 sm:p-7">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                    <LineIcon kind={feature.icon} className="h-5 w-5" />
                  </div>
                  <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-400">Feature {index + 1}</p>
                  <h3 className="mt-2 text-lg font-semibold text-ink-900">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-ink-500">{feature.description}</p>
                  {index === 2 && <SignalValidationMini />}
                  {index === 5 && (
                    <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-ink-500">
                      <span className="rounded-md bg-ink-100 px-2 py-1">Primary Gemini</span><span>→</span>
                      <span className="rounded-md bg-ink-100 px-2 py-1">Flash-Lite</span><span>→</span>
                      <span className="rounded-md bg-ink-100 px-2 py-1">Deterministic</span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="curriculum" className="scroll-mt-20 border-b border-ink-100 bg-surface">
          <div className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 sm:py-24 xl:px-12 xl:py-28">
            <SectionHeading eyebrow="Curriculum" title="31 days of AI engineering context" subtitle="Eight modules provide the shared structure behind every interview." />
            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-4">
              {curriculum.modules.map((module) => (
                <article key={module.n} className="min-h-44 bg-surface p-6">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm font-semibold text-accent-600">{String(module.n).padStart(2, '0')}</span>
                    <span className="rounded-full bg-ink-50 px-2.5 py-1 text-[10px] font-medium text-ink-500">Days {module.days[0]}–{module.days[1]}</span>
                  </div>
                  <h3 className="mt-8 max-w-[220px] text-base font-semibold leading-6 text-ink-900">{module.title}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-ink-100">
          <div className="mx-auto max-w-[1120px] px-5 py-20 text-center sm:px-8 sm:py-28 xl:px-12 xl:py-32">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600">The learning-aware difference</p>
            <h2 className="mx-auto mt-6 max-w-4xl text-3xl font-semibold leading-tight tracking-[-0.04em] text-ink-900 sm:text-5xl">
              Learning history tells us where to look.<br />
              <span className="text-ink-500">The interview tells us what they know now.</span>
            </h2>
            <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-ink-200 bg-surface p-6 text-left shadow-card sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-600">Illustrative scenario · Day 10</p>
                  <h3 className="mt-2 text-lg font-semibold text-ink-900">{retrievalTitle}</h3>
                </div>
                <span className="self-start rounded-full bg-ink-50 px-3 py-1.5 text-xs font-medium text-ink-500 sm:self-auto">Curriculum-grounded</span>
              </div>
              <div className="mt-7 grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
                <SignalStage label="Learning journey" value="Passed after 4 attempts" />
                <FlowArrow />
                <SignalStage label="Live interview" value="Strong understanding demonstrated" />
                <FlowArrow />
                <SignalStage label="Current signal" value="✓ Improvement Validated" positive />
              </div>
            </div>
          </div>
        </section>

        <section id="organizers" className="scroll-mt-20 border-b border-ink-100 bg-surface">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-24 xl:px-12 xl:py-28">
            <SectionHeading eyebrow="Candidates & organizers" title="Designed for both sides of the interview." />
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {audiences.map((audience) => (
                <article key={audience.eyebrow} className="rounded-3xl border border-ink-200 bg-ink-50 p-7 sm:p-9">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-600">{audience.eyebrow}</p>
                  <h3 className="mt-4 max-w-md text-2xl font-semibold tracking-[-0.03em] text-ink-900">{audience.title}</h3>
                  <ul className="mt-8 space-y-4">
                    {audience.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-6 text-ink-600">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-50 text-[10px] font-bold text-accent-700" aria-hidden="true">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-ink-100">
          <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 sm:py-20 xl:px-12">
            <div className="rounded-3xl border border-ink-200 bg-accent-50/60 p-7 sm:p-10">
              <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">Built for dependable interviews</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-ink-900">Safe. Private. Reliable.</h2>
                  <p className="mt-4 max-w-lg text-sm leading-7 text-ink-500">
                    Server-side AI credentials, persistent interview sessions, validated structured model responses, bounded retries, and deterministic fallback keep the interview experience reliable.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {reliabilitySignals.map(([label, icon]) => (
                    <div key={label} className="rounded-2xl border border-accent-100 bg-surface p-4">
                      <LineIcon kind={icon} className="h-4 w-4 text-accent-600" />
                      <p className="mt-4 text-xs font-semibold text-ink-800">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-20 bg-surface">
          <div className="mx-auto max-w-[1000px] px-5 py-20 text-center sm:px-8 sm:py-24 xl:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-600">About</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-ink-900">Built for ViCODATHON&apos;s Interview Agent challenge.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-ink-500">
              A personalized technical interviewer that combines curriculum history with live answer assessment to create interviews that evolve with the candidate. Powered by Gemini with session persistence through Supabase.
            </p>
          </div>
        </section>

        <section className="border-y border-ink-100 bg-ink-50">
          <div className="mx-auto max-w-[1000px] px-5 py-20 text-center sm:px-8 sm:py-24">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-ink-900 sm:text-4xl">Ready to see the interview adapt?</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-ink-500">Start with a candidate learning profile and watch the questions evolve based on every answer.</p>
            <Button onClick={startInterview} className="mt-8" size="lg">Start an Interview <span aria-hidden="true">→</span></Button>
          </div>
        </section>
      </main>

      <footer className="bg-surface">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-5 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 xl:px-12">
          <div className="flex items-center gap-3">
            <BrandMark small />
            <div>
              <p className="text-sm font-semibold text-ink-900">Interview Agent</p>
              <p className="mt-0.5 text-xs text-ink-400">Adaptive technical interviewing based on real learning signals.</p>
            </div>
          </div>
          <p className="text-xs text-ink-400">© {currentYear} Interview Agent</p>
        </div>
      </footer>
    </div>
  );
}

function ProductPreview() {
  const path = [
    ['Day 1', 'Environment setup', 'complete'],
    ['Day 3', 'React & GitHub', 'complete'],
    ['Day 8', 'Vector databases', 'active'],
    ['Day 10', 'Retrieval engine', 'upcoming'],
    ['Day 13', 'Function calling', 'upcoming'],
  ] as const;

  return (
    <figure className="landing-preview-enter relative mx-auto w-full max-w-[720px]">
      <div className="absolute -inset-6 -z-10 rounded-[40px] bg-accent-50/60 blur-2xl" aria-hidden="true" />
      <div className="overflow-hidden rounded-3xl border border-ink-200 bg-surface shadow-soft">
        <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-600">Interview in progress</span>
          </div>
          <span className="rounded-full bg-ink-50 px-2.5 py-1 text-[10px] font-medium text-ink-500">Static product preview</span>
        </div>

        <div className="grid sm:grid-cols-[minmax(0,1fr)_168px]">
          <div className="min-w-0 p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-accent-600">Day 8</span>
              <span className="h-1 w-1 rounded-full bg-ink-300" />
              <span className="text-ink-500">Vector Databases Overview</span>
            </div>
            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-400">Question</p>
            <blockquote className="mt-3 text-lg font-semibold leading-7 tracking-[-0.02em] text-ink-900 sm:text-xl sm:leading-8">
              “You mentioned that Pinecone is managed and easier to scale, while ChromaDB is suited for local development. What trade-offs would you consider around privacy and latency?”
            </blockquote>
            <div className="mt-7 rounded-xl border border-ink-200 bg-ink-50 p-4 text-sm leading-6 text-ink-400">
              Explain your reasoning and any production constraints you would evaluate…
            </div>
            <div className="mt-4 flex justify-end">
              <span className="inline-flex rounded-xl bg-action px-4 py-2.5 text-xs font-medium text-white">Submit Answer</span>
            </div>
          </div>

          <aside className="border-t border-ink-200 bg-ink-50/70 p-5 sm:border-l sm:border-t-0" aria-label="Preview interview path">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-400">Interview path</p>
            <div className="mt-5 space-y-1">
              {path.map(([day, topic, status]) => (
                <div key={day} className={`rounded-xl border p-3 ${status === 'active' ? 'border-accent-200 bg-accent-50' : 'border-transparent'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${status === 'complete' ? 'bg-emerald-500' : status === 'active' ? 'bg-accent-500' : 'bg-ink-200'}`} />
                    <span className={`text-[10px] font-semibold ${status === 'active' ? 'text-accent-700' : 'text-ink-500'}`}>{day}</span>
                  </div>
                  <p className="mt-1.5 pl-4 text-[10px] leading-4 text-ink-400">{topic}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
      <figcaption className="sr-only">A static preview of the Interview Agent live interview interface. It does not accept input or call the interview API.</figcaption>
    </figure>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-ink-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-7 text-ink-500">{subtitle}</p>}
    </div>
  );
}

function SignalValidationMini() {
  return (
    <div className="mt-5 grid grid-cols-3 gap-2 border-t border-ink-100 pt-5">
      <div><p className="text-[9px] uppercase tracking-wide text-ink-400">Historical</p><p className="mt-1 text-xs font-medium text-ink-700">4 attempts</p></div>
      <div><p className="text-[9px] uppercase tracking-wide text-ink-400">Live</p><p className="mt-1 text-xs font-medium text-ink-700">Strong</p></div>
      <div><p className="text-[9px] uppercase tracking-wide text-ink-400">Signal</p><p className="mt-1 text-xs font-medium text-emerald-700">Validated</p></div>
    </div>
  );
}

function SignalStage({ label, value, positive = false }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${positive ? 'border-emerald-500 bg-emerald-50' : 'border-ink-200 bg-ink-50'}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-400">{label}</p>
      <p className={`mt-2 text-sm font-semibold leading-5 ${positive ? 'text-emerald-700' : 'text-ink-800'}`}>{value}</p>
    </div>
  );
}

function FlowArrow() {
  return <span className="flex items-center justify-center text-ink-300 max-md:rotate-90" aria-hidden="true">→</span>;
}

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`flex ${small ? 'h-8 w-8' : 'h-9 w-9'} shrink-0 items-center justify-center rounded-xl bg-action text-white`} aria-hidden="true">
      <svg className={small ? 'h-4 w-4' : 'h-[18px] w-[18px]'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.75l1.5 5.1a3.8 3.8 0 002.58 2.58l5.17 1.57-5.17 1.57a3.8 3.8 0 00-2.58 2.58L12 21.25l-1.5-5.1a3.8 3.8 0 00-2.58-2.58L2.75 12l5.17-1.57a3.8 3.8 0 002.58-2.58L12 2.75z" />
      </svg>
    </span>
  );
}

function MenuIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function LineIcon({ kind, className }: { kind: string; className: string }) {
  const paths: Record<string, React.ReactNode> = {
    calendar: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M7 3v4M17 3v4M3.5 9.5h17" /></>,
    path: <><circle cx="5" cy="6" r="2" /><circle cx="19" cy="18" r="2" /><path d="M7 6h4a3 3 0 013 3v6a3 3 0 003 3" /></>,
    evidence: <><path d="M7 3.5h8l3 3V20H7z" /><path d="M15 3.5V7h3M10 11h5M10 15h5" /></>,
    shield: <path d="M12 3l7 3v5c0 4.4-2.8 7.7-7 10-4.2-2.3-7-5.6-7-10V6l7-3z" />,
    why: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 114.4 1.3c-.7.9-2.2 1.3-2.2 2.7M12 17h.01" /></>,
    compare: <><path d="M5 7h11M13 4l3 3-3 3M19 17H8M11 14l-3 3 3 3" /></>,
    levels: <><path d="M5 19V12M12 19V8M19 19V4" /><path d="M3 19h18" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="M8 12l2.5 2.5L16 9" /></>,
    database: <><ellipse cx="12" cy="5.5" rx="7" ry="3" /><path d="M5 5.5v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6M5 11.5v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></>,
    refresh: <><path d="M19 7v5h-5M5 17v-5h5" /><path d="M17.5 9A6.5 6.5 0 006.2 7M6.5 15A6.5 6.5 0 0017.8 17" /></>,
  };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}
