Prompt 04 — Real API and Session Foundation
Tool: Codex
Purpose: Replace mocked interview progression with the required POST /api/interview contract and session-based backend.

Full prompt:

PROMPT 04 — Real API + Session Foundation

We are continuing the existing Interview Agent hackathon project.

Inspect the current repository first. Do not rebuild or redesign the existing UI.

GOAL

Replace the current mocked interview progression with a real backend API and session-based interview engine, while keeping question generation deterministic for now.

Do NOT integrate Gemini yet.

The required public API contract is:

POST /api/interview

START REQUEST

{
  "sessionId": "abc-123",
  "candidate": { ...candidate object... }
}

START RESPONSE

{
  "reply": "...",
  "done": false
}

SUBSEQUENT REQUEST

{
  "sessionId": "abc-123",
  "message": "candidate answer"
}

NORMAL RESPONSE

{
  "reply": "...",
  "done": false
}

FINAL RESPONSE

{
  "reply": "Interview completed.",
  "done": true,
  "feedback": {
    "summary": "...",
    "strengths": [],
    "gaps": [],
    "next": []
  }
}

TECHNICAL APPROACH

Keep this simple.

Use a Vercel-compatible serverless endpoint at:

api/interview.ts

so deployment can expose:

https://our-domain.com/api/interview

Use one simple session-state model keyed by sessionId.

For reliable production persistence, use one Supabase table:

interview_sessions

with approximately:

- session_id text primary key
- state jsonb
- created_at
- updated_at

Add a small SQL/schema file documenting the table.

Use server-side environment variables only:

SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY

Never expose the service-role key to frontend code.

If Supabase environment variables are unavailable during local development, a small in-memory fallback is acceptable ONLY for local development.

Clearly separate that fallback from production storage.

INTERVIEW STATE

Store only what is needed:

- sessionId
- candidate
- transcript
- questionCount
- coveredDays
- currentDay
- currentTopic
- askedQuestions
- targetDays
- done

Do not create a complicated agent framework.

INITIALIZATION

When a request contains:

sessionId + candidate

1. Validate the request.
2. Analyze the candidate's supplied mission history.
3. Select at least 4 relevant curriculum days.

Prioritize:
- failed missions
- passed missions with 3+ attempts
- genuine first-try strengths
- role/experience-relevant technical topics

Do not treat unlisted curriculum days as failed.

Do not generate all 8 question texts in advance.

Only select target curriculum days/topics.

Generate the first deterministic question from the relevant curriculum objectives.

QUESTION FLOW

For this task, questions may still be deterministic/template-based.

However every question must map to a real curriculum day.

Maintain:

questionCount
coveredDays

The interview must NEVER finish unless:

questionCount >= 8

AND

coveredDays contains at least 4 unique curriculum days.

Ask approximately 8 questions for now.

Do not pretend the deterministic engine evaluates candidate answers intelligently yet.

That comes in the Gemini task next.

FEEDBACK

At completion return the exact required structure:

feedback.summary
feedback.strengths[]
feedback.gaps[]
feedback.next[]

For this pre-Gemini version:

- use the selected candidate's real learning-history signals
- do not fabricate conclusions based on their interview answers
- clearly keep feedback conservative and factual

FRONTEND INTEGRATION

Update the existing interview flow so the frontend now calls:

POST /api/interview

instead of advancing through the local mocked question array.

On Start Interview:

generate a sessionId
send candidate + sessionId

On answer submission:

send sessionId + message

Use the API's reply as the next current question.

When done === true:

show the existing Feedback screen using the returned feedback object.

Preserve the current visual design.

Do not redesign Candidate Selection, Brief, Interview or Feedback screens.

ERROR HANDLING

Handle:

- missing sessionId
- start request without candidate
- message request for nonexistent session
- blank answer
- storage failure

Return JSON errors rather than HTML crashes.

Do not add authentication.

DO NOT ADD

- Gemini
- OpenAI
- Breeth
- LangChain
- LangGraph
- CrewAI
- RAG
- vector databases
- voice/video
- user accounts
- unnecessary dependencies
- unrelated UI changes

ORGANIZER DATA

Do not modify:

data/raw/candidates_(1).json
data/raw/curriculum.json

TESTING

After implementation:

1. Run the existing TypeScript/build checks.
2. Verify a session can:
   - initialize
   - continue using the same sessionId
   - reach at least 8 questions
   - cover at least 4 unique curriculum days
   - return done:true with the required feedback shape
3. Verify two different sessionIds do not share state.

AI USAGE LOG

After implementation and successful testing:

Append this FULL user prompt to PROMPTS.md as:

Prompt 04 — Real API and Session Foundation
Tool: Codex
Purpose: Replace mocked interview progression with the required POST /api/interview contract and session-based backend.

Include:
- full prompt
- concise implementation summary
- files changed
- tests/build result

Never overwrite or delete previous PROMPTS.md entries.

Never write secrets, tokens, keys or environment-variable values into PROMPTS.md.

GIT

Only after the build/tests pass:

1. Run git status.
2. Review that only intended project files and PROMPTS.md changed.
3. Commit with:

Implement interview API and session foundation

4. Push to origin/main.

If Git push requires unexpected authentication/configuration changes, stop and report it instead of modifying Git settings.

FINAL RESPONSE

Report only:

- files changed
- architecture used
- whether /api/interview contract works
- how session persistence works
- tests performed and results
- any environment variables I still need to configure
- commit hash / push status

Do not start Gemini integration in this task.

Implementation summary:
- Added a deterministic, curriculum-backed interview engine with candidate-history and role/experience-based target-day selection.
- Added a Vercel-compatible POST /api/interview handler with validation, conservative factual feedback, and JSON error responses.
- Added Supabase REST persistence with an explicitly development-only in-memory fallback.
- Replaced the frontend's local mock progression with API-driven session progression while preserving the existing screens.

Files changed:
- api/interview.ts
- server/interviewEngine.ts
- server/sessionStore.ts
- supabase/interview_sessions.sql
- scripts/test-interview.mjs
- src/App.tsx
- src/components/Brief.tsx
- src/components/Interview.tsx
- src/types.ts
- src/useInterviewFlow.ts
- package.json
- tsconfig.json
- PROMPTS.md

Tests/build result:
- npm run test:interview — passed session initialization, continuation, eight-question/four-day completion, feedback shape, validation errors, storage failure, and session isolation checks.
- npm run build — passed TypeScript and Vite production build.

Prompt 05 — Supabase Secret Key Security Migration
Tool: Codex

Full prompt:

Security fix only. Do not refactor or change application behavior.

The current Supabase session store uses the legacy SUPABASE_SERVICE_ROLE_KEY and sends it in both the `apikey` and `Authorization: Bearer` headers.

We want to migrate to Supabase's new server-side secret key.

Make the smallest possible change:

1. Use environment variable:
   SUPABASE_SECRET_KEY

2. For Supabase REST requests using the new sb_secret_ key, send it in:
   apikey: <secret key>

3. Do NOT send the sb_secret_ key as:
   Authorization: Bearer <secret key>

4. Keep SUPABASE_URL unchanged.

5. Do not modify interview logic, UI, database schema, organizer data, or dependencies.

6. Update any tests/environment assumptions affected by this change.

7. Run build and interview tests.

8. Append this full prompt to PROMPTS.md as:
   Prompt 05 — Supabase Secret Key Security Migration
   Tool: Codex

Include a short implementation and test summary.

9. After tests pass, commit with:
   Migrate Supabase session storage to secret key

Push to origin/main.

Never put the actual API key or any environment-variable value into PROMPTS.md, source code, logs, or Git.

Report the files changed, tests, commit hash, and push status.

Implementation summary:
- Replaced the legacy service-role environment-variable lookup with SUPABASE_SECRET_KEY.
- Supabase REST requests now send the server-side secret only in the apikey header and omit Authorization.
- Updated interview tests to verify the new environment-variable assumption, apikey header, omitted Authorization header, and ignored legacy key.

Tests/build result:
- npm run test:interview — passed, including Supabase secret-key header coverage and existing session behavior checks.
- npm run build — passed TypeScript and Vite production build.

Prompt 06 — Gemini Adaptive Interviewer and Real Feedback
Tool: Codex

Purpose:
Integrate Gemini for adaptive answer assessment, intelligent follow-ups, dynamic difficulty and interview-grounded final feedback.

Full prompt:

PROMPT 06 — Gemini Adaptive Interviewer + Real Feedback

We are continuing the existing Interview Agent hackathon project.

IMPORTANT:
Inspect the current repository and preserve the working architecture.

The project already has:
- working React frontend
- candidate selection
- candidate brief
- POST /api/interview
- Supabase session persistence
- deterministic 8-question interview
- minimum 4 curriculum-day enforcement
- deterministic fallback feedback
- tests
- working Vercel local environment

Do NOT redesign or rebuild the application.

GOAL

Replace the deterministic interview intelligence with Gemini-powered adaptive interviewing while preserving the existing API contract, state persistence, hard requirements, and deterministic fallback.

The interview must feel like a real technical interview rather than a scripted questionnaire.

--------------------------------------------------
GEMINI CONFIGURATION
--------------------------------------------------

Use server-side environment variable:

GEMINI_API_KEY

Never expose it to frontend code.

Never print the key.

Never write it to:
- PROMPTS.md
- source files
- tests
- Git history
- logs

Keep the Gemini model name isolated/configurable in one place.

Prefer a fast, cost-efficient Gemini Flash model suitable for multi-turn structured generation.

If appropriate, support:

GEMINI_MODEL

as an optional environment variable so the model can be changed without editing application logic.

Do not add a heavy AI framework.

Use the Gemini API directly with the minimum dependencies required.

--------------------------------------------------
CORE INTERVIEW LOOP
--------------------------------------------------

Each candidate answer should now drive the next interview decision.

For every answer:

1. Load the current InterviewSession from Supabase.
2. Give Gemini relevant context:
   - candidate role
   - years of experience
   - education
   - mission history
   - first-try missions
   - high-attempt missions
   - failed missions
   - explicitly skipped missions
   - relevant curriculum objectives
   - current question
   - previous transcript
   - curriculum days already covered
   - question count
   - current difficulty
   - previous assessment observations

3. Ask Gemini to evaluate the latest answer.

4. Ask Gemini to decide whether to:
   - ask a focused follow-up on the current topic
   - move to a new curriculum topic
   - deepen the difficulty
   - reduce difficulty
   - finish the interview

5. Generate the next question dynamically from that decision.

Do NOT generate all questions at initialization.

--------------------------------------------------
STRUCTURED GEMINI OUTPUT
--------------------------------------------------

Require structured JSON.

Use a schema conceptually similar to:

{
  "assessment": {
    "quality": "weak | partial | good | strong",
    "conceptsUnderstood": ["..."],
    "conceptsMissing": ["..."],
    "note": "short evidence-based observation"
  },
  "decision": {
    "action": "follow_up | new_topic | finish",
    "day": 12,
    "difficulty": "foundation | standard | advanced | deep"
  },
  "reply": "next interviewer question"
}

Validate Gemini output before using it.

Never blindly trust model-generated values.

The server code remains authoritative for:
- question count
- covered curriculum days
- candidate identity
- session state
- completion rules

--------------------------------------------------
FOLLOW-UP BEHAVIOR
--------------------------------------------------

This is the most important product behavior.

If the answer is weak or incomplete:

Ask a focused follow-up targeting the missing concept.

Example:

Question:
How do embeddings help retrieval?

Candidate:
"They convert text into numbers."

Bad next question:
"What is MCP?"

Good next question:
"What property of those numerical vectors allows semantically similar text to be retrieved even when the exact words differ?"

If the answer is strong:

Increase depth using:
- trade-offs
- architecture decisions
- failure modes
- scale
- reliability
- production consequences

Example:

Candidate gives a strong explanation of vector search.

Possible follow-up:
"When would hybrid retrieval outperform pure vector search, and what signals would you use to route between them?"

--------------------------------------------------
CANDIDATE PERSONALIZATION
--------------------------------------------------

Difficulty and question style must depend on:

- yearsExperience
- jobRole
- learning history
- latest interview performance

Examples:

Senior/experienced technical candidate:
- architecture
- production trade-offs
- system design
- failure modes
- scalability

Junior candidate:
- fundamentals
- simpler implementation scenarios
- progressive difficulty

Do not ask obviously beginner questions to very senior candidates unless their answers demonstrate a genuine foundational gap.

Do not punish candidates permanently because of historical high-attempt missions.

Historical mission performance should determine what to probe initially.

Actual interview answers should become the stronger signal as the interview progresses.

--------------------------------------------------
CURRICULUM GROUNDING
--------------------------------------------------

Every substantive interview question must map internally to a real curriculum day from the supplied curriculum JSON.

Use the actual:
- title
- objectives
- tools

Do not fabricate curriculum content.

Do not modify organizer-provided JSON files.

Follow-up questions may remain on the same curriculum day when appropriate.

--------------------------------------------------
COMPLETION RULES
--------------------------------------------------

KEEP THE EXISTING HARD SERVER RULES.

Gemini must NOT be allowed to finish unless:

questionCount >= 8

AND

coveredDays contains at least 4 unique curriculum days.

If Gemini returns:

action = "finish"

before those conditions are satisfied:

ignore the finish request and continue interviewing.

Aim for roughly 8–12 substantive questions.

Do not force exactly 8 if a useful follow-up is needed.

Prevent endless loops:
- cap repeated follow-ups on the same concept/topic reasonably
- move forward if the interview is stuck

--------------------------------------------------
CONVERSATIONAL CONTEXT
--------------------------------------------------

Gemini should naturally use previous answers where useful.

Example:

"Earlier you said you would use Pinecone because you wanted a managed service. How would that choice affect your deployment and monitoring strategy?"

But:

- never claim the candidate said something they did not say
- never invent interview evidence
- do not unnecessarily repeat prior answers

--------------------------------------------------
INTERVIEWER STYLE
--------------------------------------------------

The interviewer should be:

- professional
- concise
- technically credible
- neutral
- conversational

Avoid:

- excessive praise
- "Great answer!" after every response
- giving away the correct answer before probing
- long lectures
- multiple unrelated questions in one turn
- generic chatbot language

Ask one primary question at a time.

--------------------------------------------------
REAL FINAL FEEDBACK
--------------------------------------------------

Replace deterministic pre-AI feedback with feedback grounded in the actual interview.

Required public response remains exactly:

{
  "reply": "Interview completed.",
  "done": true,
  "feedback": {
    "summary": "...",
    "strengths": [],
    "gaps": [],
    "next": []
  }
}

Generate feedback from:
- interview answers
- answer assessments
- learning history
- curriculum topics covered

SUMMARY

Should give a concise overall assessment.

STRENGTHS

2–5 specific strengths demonstrated in the interview.

Example:
"Explained the trade-off between dense retrieval and metadata filtering clearly."

Do not use generic claims unsupported by transcript evidence.

GAPS

2–5 specific gaps.

Example:
"Could explain vector similarity but struggled to describe how chunk size affects retrieval quality."

NEXT

2–5 actionable recommendations.

When possible connect recommendations to real curriculum days/topics.

Do not fabricate numeric scores or percentages.

--------------------------------------------------
FAILURE / FALLBACK BEHAVIOR
--------------------------------------------------

The interview must not die if Gemini fails.

Handle:

- Gemini timeout
- network error
- invalid JSON
- empty output
- malformed structured response
- rate limit
- temporary API failure

Suggested strategy:

1. Safely retry Gemini once when appropriate.
2. If still unsuccessful, use the existing deterministic curriculum-based question generator.
3. Preserve the interview session.
4. Continue rather than crash.

For final feedback failure:

fall back to conservative learning-history-based feedback rather than returning an error.

Do NOT expose raw Gemini errors or secrets to the user.

--------------------------------------------------
FRONTEND
--------------------------------------------------

Preserve the existing UI.

Update only what is necessary to display real backend state.

Current UI should continue showing:

- question number
- difficulty
- covered curriculum days
- current question
- transcript
- answer input
- feedback screen

Do not redesign the pages.

If the new backend can return more than 8 questions, change UI wording/progress only if necessary so it does not falsely imply the interview always ends exactly at 8.

For example:
"Question 8"
instead of misleading "8 / 8" if the interview can continue.

Keep this change minimal.

--------------------------------------------------
SESSION STATE
--------------------------------------------------

Persist useful AI observations in the existing session state.

Add only what is needed, for example:

observations: [
  {
    day: 7,
    quality: "partial",
    conceptsUnderstood: [...],
    conceptsMissing: [...],
    note: "..."
  }
]

Keep it simple.

Do not introduce vector memory, Breeth, RAG, or long-term accounts.

--------------------------------------------------
TESTING
--------------------------------------------------

Extend tests without requiring every test to make a real paid/external Gemini call.

Use mocking/stubbing for most automated Gemini tests.

Verify at minimum:

1. Gemini weak answer -> focused follow-up.
2. Gemini strong answer -> deeper question.
3. new_topic changes curriculum topic.
4. follow_up can remain on the same curriculum day.
5. premature finish is rejected before:
   - 8 questions
   - 4 unique days
6. valid finish works after minimum requirements.
7. malformed Gemini output triggers fallback.
8. Gemini network/API failure triggers fallback.
9. session state persists assessments/observations.
10. two sessionIds remain isolated.
11. final feedback has exactly:
    - summary:string
    - strengths:string[]
    - gaps:string[]
    - next:string[]
12. final feedback is generated from interview evidence rather than hardcoded candidate text.

Run:
- interview tests
- TypeScript/build checks

If practical, add one optional/manual real-Gemini smoke-test path that is not required for normal automated tests.

--------------------------------------------------
DO NOT ADD
--------------------------------------------------

Do not add:

- OpenAI
- Anthropic
- LangChain
- LangGraph
- CrewAI
- Breeth
- vector databases
- RAG
- authentication
- user accounts
- voice
- video
- recruiter dashboard
- unrelated UI features
- unnecessary dependencies

--------------------------------------------------
AI USAGE LOG
--------------------------------------------------

After implementation and successful tests:

Append this ENTIRE user prompt to PROMPTS.md as:

Prompt 06 — Gemini Adaptive Interviewer and Real Feedback
Tool: Codex

Purpose:
Integrate Gemini for adaptive answer assessment, intelligent follow-ups, dynamic difficulty and interview-grounded final feedback.

Include:
- complete prompt
- concise implementation summary
- files changed
- tests performed
- build result
- note that Gemini secrets are supplied only through environment variables

Never overwrite previous log entries.

Never include:
- GEMINI_API_KEY
- SUPABASE_SECRET_KEY
- any secret/token value

--------------------------------------------------
GIT
--------------------------------------------------

After tests/build pass:

1. Review git status.
2. Ensure .env.local and all secrets are excluded.
3. Commit intended code changes + PROMPTS.md.
4. Use commit message:

Integrate adaptive Gemini interviewer

5. Push to origin/main.

If push requires unexpected Git configuration/authentication changes, stop and report instead.

--------------------------------------------------
FINAL RESPONSE
--------------------------------------------------

Return a concise report containing:

- files changed
- Gemini architecture
- adaptive interview behavior implemented
- feedback behavior implemented
- fallback behavior
- tests and build results
- environment variables required
- commit hash
- push status
- any remaining risks or manual test steps

Do not begin deployment configuration or unrelated polishing in this task.

Implementation summary:
- Added a server-only direct Gemini REST adapter using structured JSON output, strict validation, a timeout, one safe retry, and deterministic fallback.
- Added adaptive answer assessment, focused follow-ups, curriculum topic changes, dynamic difficulty, persisted observations, hard 8-question/4-day minimums, and a 12-question ceiling.
- Added interview-evidence final feedback with conservative learning-history feedback when Gemini is unavailable or invalid.
- Updated progress wording so interviews can continue beyond eight questions without showing a misleading fixed total.

Files changed:
- api/interview.ts
- server/gemini.ts
- server/interviewEngine.ts
- scripts/test-interview.mjs
- src/App.tsx
- src/components/Interview.tsx
- src/useInterviewFlow.ts
- PROMPTS.md

Tests performed:
- npm run test:interview — passed adaptive decisions, completion enforcement, observation persistence, structured-output and network fallbacks, final feedback, session isolation, and existing storage checks.
- npm run build — passed TypeScript and Vite production build.

Gemini secrets are supplied only through server-side environment variables; no secret values were added to source, tests, logs, PROMPTS.md, or Git.

## Prompt 07 — Interviewer Tone, Evidence Weighting, and Gemini Default Fix

Tool: Codex

Full prompt:

PROMPT 07 — Interviewer Tone, Evidence Weighting, and Gemini Default Fix

This is a focused polish task for the existing Interview Agent.

Do NOT redesign, refactor broadly, change the API contract, database architecture, or interview flow.

The real Gemini adaptive interview is now working correctly.

We manually tested a full interview and identified three specific issues.

--------------------------------------------------
1. INTERVIEWER TONE
--------------------------------------------------

Reduce excessive praise and AI-tutor language.

The interviewer currently says phrases like:
- "excellent"
- "spot-on"
- "robust"
- "highly robust"
- "exceptional"

too frequently.

Make the interviewer sound like a professional technical interviewer.

Prefer neutral transitions such as:
- "Let's go deeper on that."
- "Let's move to..."
- "You mentioned X. How would..."
- "Let's test that in a production scenario."
- "Now consider..."

Do not praise every correct answer.

Brief acknowledgement is acceptable occasionally when genuinely useful, but the default tone should be neutral, concise, technically credible, and evaluative.

Do not change question quality or adaptive behavior.

--------------------------------------------------
2. LIVE INTERVIEW EVIDENCE MUST OUTWEIGH LEARNING HISTORY
--------------------------------------------------

Fix final feedback weighting.

Historical mission attempts should primarily determine what the interviewer probes initially.

Once the candidate demonstrates current understanding during the interview, historical difficulty must NOT automatically be reported as a current knowledge gap.

Priority should be:

1. actual interview answers and assessments
2. current observed strengths/gaps
3. historical learning journey as supporting context

Example:

BAD:
"Historical learning gap on Day 10 because it required 4 attempts."

when the candidate subsequently gave a strong Day 10 answer during the interview.

BETTER:
"Day 10 historically required multiple attempts, but the candidate demonstrated improved understanding during the interview through a sound hybrid retrieval and reranking strategy."

Historical attempts alone must not create a Knowledge Gap.

A gap should normally require current interview evidence such as:
- weak assessment
- partial assessment
- missing concepts
- inability to answer a follow-up
- unresolved misconception

Learning history may contextualize that gap.

Likewise, if a historical weak area is demonstrated strongly in the interview, it may become evidence of progress rather than remain a gap.

Do not invent evidence.

--------------------------------------------------
3. FEEDBACK TONE
--------------------------------------------------

Make final feedback professional and calibrated.

Avoid inflated labels like:
- exceptional
- outstanding
- excellent
- highly capable

unless strongly justified, and generally prefer specific evidence over adjectives.

BAD:
"Excellent design for high-concurrency systems."

BETTER:
"Designed a stateless FastAPI architecture using Redis-backed session state, bounded context, and concurrency controls."

Strengths should say WHAT the candidate demonstrated.

Gaps should say WHAT was missing or incomplete.

Next steps should follow directly from observed gaps where possible.

--------------------------------------------------
4. GEMINI DEFAULT MODEL
--------------------------------------------------

The current default gemini-2.5-flash is unavailable to new Gemini API users.

Change the default model to:

gemini-3.5-flash

Continue supporting:

GEMINI_MODEL

as an environment override.

Do not alter API authentication or Gemini architecture.

--------------------------------------------------
5. PRESERVE EVERYTHING ELSE
--------------------------------------------------

Keep:
- adaptive follow-ups
- dynamic difficulty
- curriculum grounding
- Supabase persistence
- minimum 8 questions
- minimum 4 unique curriculum days
- maximum/interview loop protections
- deterministic fallback
- structured Gemini validation
- exact public /api/interview contract

Do not add dependencies or features.

--------------------------------------------------
6. TESTS
--------------------------------------------------

Add/update focused tests verifying:

1. historical high attempts alone do not produce a current gap when the candidate demonstrates strong understanding in the interview.
2. a weak/partial current answer can still produce a gap.
3. feedback strengths are grounded in observed interview evidence.
4. interviewer instructions discourage repetitive praise.
5. default Gemini model is gemini-3.5-flash.
6. GEMINI_MODEL still overrides the default.

Run:
npm run test:interview
npm run build

--------------------------------------------------
7. PROMPTS LOG
--------------------------------------------------

Append this entire prompt to PROMPTS.md as:

Prompt 07 — Interviewer Tone, Evidence Weighting, and Gemini Default Fix
Tool: Codex

Include concise implementation and test results.

Never include API keys or secrets.

Do not overwrite prior entries.

--------------------------------------------------
8. GIT
--------------------------------------------------

After tests pass:

Confirm .env.local and secrets are not staged.

Commit with:

Polish adaptive interview feedback

Push to origin/main.

--------------------------------------------------
FINAL REPORT
--------------------------------------------------

Report:
- files changed
- tone changes
- feedback evidence-weighting changes
- Gemini default-model change
- tests/build
- commit hash
- push result

Do not begin deployment or add unrelated features.

Implementation summary:
- Made interviewer instructions neutral and concise, discouraged repetitive praise, and calibrated final-feedback language around specific evidence.
- Made current interview observations authoritative in Gemini and deterministic fallback feedback; learning history now supplies context but cannot independently create a current gap.
- Changed the Gemini default model to `gemini-3.5-flash` while preserving the `GEMINI_MODEL` override.
- Added focused regression coverage for evidence weighting, observed strengths/gaps, tone instructions, and default/override model selection.

Files changed:
- server/gemini.ts
- server/interviewEngine.ts
- scripts/test-interview.mjs
- PROMPTS.md

Tests performed:
- `npm run test:interview` — passed.
- `npm run build` — passed TypeScript and Vite production build.

No API keys, environment-variable values, or other secrets were added to source, tests, logs, PROMPTS.md, or Git.

## Prompt 08 — Modern Interview Agent Interface

Tool: Codex

Purpose:
Redesign the application presentation into a modern, clean, ABTalks-inspired AI interview product without modifying working interview intelligence.

Full prompt:

PROMPT 08 — Modern Interview Agent UI Redesign

We are polishing the existing Interview Agent hackathon project.

IMPORTANT:
The backend and interview intelligence are already working correctly.

Do NOT modify:
- Gemini integration
- Supabase persistence
- /api/interview contract
- interview session logic
- candidate-learning interpretation
- adaptive follow-up logic
- completion rules
- feedback intelligence
- organizer-provided curriculum/candidate JSON
- tests unrelated to presentation

This task is UI/UX only.

==================================================
DESIGN DIRECTION
==================================================

Redesign the application into a modern, clean, polished AI product.

Visual inspiration:

- ABTalks editorial cleanliness
- Linear / Vercel-quality SaaS polish
- modern vibe-coded AI product
- professional hiring/education tool

Do NOT copy ABTalks branding, logo, or exact assets.

Use:
- light mode
- off-white / very light gray page background
- white surfaces
- strong near-black typography
- restrained violet/purple primary accent
- green for positive learning signals
- amber for high-attempt/probing signals
- red only when genuinely representing failure
- subtle borders
- very soft shadows
- generous whitespace
- consistent rounded corners
- strong typography hierarchy

Avoid:
- gradients everywhere
- glassmorphism
- neon AI aesthetics
- excessive shadows
- tiny text
- excessive pill badges
- generic Bootstrap/admin-panel appearance

The finished app should feel intentionally designed rather than template-generated.

==================================================
GLOBAL LAYOUT
==================================================

On desktop:

Use a compact persistent left sidebar.

Approximate structure:

┌─────────────────┬─────────────────────────────────────┐
│ Interview Agent │                                     │
│                 │        Current page                  │
│ Candidates      │                                     │
│                 │                                     │
│ AI Cohort       │                                     │
│ 31-day journey  │                                     │
└─────────────────┴─────────────────────────────────────┘

Sidebar should be approximately 220–250px wide.

Keep it MINIMAL.

Do NOT add fake navigation/functionality such as:
- Add Candidate
- Settings
- Theme toggle
- Interview History
- Dashboard analytics
- recruiter management

unless such functionality already exists and works.

Primary navigation can simply contain:
Candidates

During other screens provide relevant back-navigation/context rather than fake sections.

The main content should use the available desktop width well.

Target content max width around 1200–1350px depending on page.

Responsive:
- 3 candidate columns on wide desktop
- 2 columns on medium screens
- 1 column on narrow/mobile
- sidebar may collapse appropriately on small widths

==================================================
SCREEN 1 — CANDIDATE SELECTION
==================================================

Current page feels too small and sparse.

Create a strong header:

Choose a candidate

Subtitle:
Select a learning profile to start a personalized technical interview.

Then:

20 candidates                         [ Search by name or role... ]

Candidate cards:

Use 3 columns on wide screens.

Each card should prominently show:

[avatar] Candidate Name             →
         Role
         X years experience

-------------------------------------

✓ 29 / 31             ⚡ 10
  missions               first-try

[31-day learning journey visualization]

Cards should:
- be larger than current cards
- have good padding
- clearly appear clickable
- subtle border
- slight hover lift/border change
- cursor pointer
- arrow on right
- strong candidate name
- readable secondary text

Avatar around 44–48px.

Do not make all information tiny gray text.

==================================================
31-DAY LEARNING JOURNEY STRIP
==================================================

This is an important visual differentiator.

Every candidate card should show a compact 31-day progress strip based on REAL candidate data.

It must not be decorative or fabricated.

Represent actual learning states with the project's existing interpretation:

Green:
passed on first attempt

Amber:
passed after multiple attempts

Red:
failed mission

Gray:
no recorded mission / neutral state

Skipped:
visually distinct from normal unrecorded state if explicit skipped data exists

Do not treat unlisted days as failed.

Do not change data interpretation logic.

The strip should be visually compact and elegant.

==================================================
SCREEN 2 — CANDIDATE LEARNING PROFILE
==================================================

Create a spacious professional layout.

Top:

← Candidates

Candidate identity hero:

[Avatar] Alex Turner
         Backend Software Engineer
         5 years experience · B.Tech Computer Science

Primary action:
Start Interview →

Then three larger metric blocks:

29
Missions completed
of 31

22
Active days

10
First-try passes

==================================================
LEARNING JOURNEY
==================================================

Add a prominent section:

Learning journey
31-day AI Engineering Cohort

Display the complete 31-day strip larger than on candidate cards.

Include a small clean legend.

Then show the existing candidate interpretation in clean columns/cards:

VALIDATE STRENGTHS

Day 16
Chatbot Backend & API Integration
Passed first try


PROBE

Day 12
Prompt Engineering Fundamentals
Passed after 5 attempts


SKIPPED

Only explicitly skipped missions.

Do not mislabel data.

Use terminology that feels interview-oriented:

Validate
Probe
Skipped

instead of overly verbose descriptions.

==================================================
INTERVIEWER BRIEF
==================================================

Keep the existing briefing concept, but style it as a clean informational callout.

Example:

Interviewer brief

Questions will prioritize areas that required multiple attempts,
validate first-try strengths, and adapt based on live responses.

Keep concise.

==================================================
SCREEN 3 — LIVE INTERVIEW
==================================================

This is the core product screen.

Keep the existing functionality but make the question visually dominant.

Top bar:

← Exit

LIVE INTERVIEW

Alex Turner
Backend Software Engineer

Main layout approximately:

70–75% question area
25–30% context/sidebar

Question card:

AI INTERVIEWER             DAY 13

QUESTION 4

How would you recover from a tool call whose
arguments fail schema validation?

Function Calling & Structured Outputs

Difficulty: Advanced


Your answer

[ large clean textarea ]

                                  Submit answer →

Do NOT use lots of tiny badges.

Question typography should be large enough to be the focal point.

==================================================
INTERVIEW SIDEBAR
==================================================

Keep compact information such as:

PROGRESS

Question 4
Advanced

Covered curriculum
12  13  16


CONVERSATION

Compact transcript

The transcript should:
- remain scrollable
- be secondary to the question
- visually distinguish interviewer/candidate turns
- not look like generic chat bubbles

If interview length can exceed 8 questions, do NOT show misleading fixed text such as:

4 / 8

Prefer:

Question 4

and optionally:
Minimum 8 questions

Only if useful.

==================================================
LOADING STATE
==================================================

When waiting for Gemini after answer submission:

Show a polished loading state.

Examples:
- disabled Submit button
- subtle spinner
- "Analyzing response…"

Do not alter backend timing/behavior.

==================================================
SCREEN 4 — INTERVIEW FEEDBACK
==================================================

Make this look like a professional interview report.

Header:

✓ Interview complete

Alex Turner
Backend Software Engineer · 5 years experience

Then:

OVERALL ASSESSMENT

[summary text in strong readable card]

Then two balanced columns:

STRENGTHS                       AREAS TO STRENGTHEN

✓ specific evidence             △ specific evidence
✓ specific evidence             △ specific evidence
✓ specific evidence             △ specific evidence

Then:

RECOMMENDED NEXT STEPS

01  Recommendation
02  Recommendation
03  Recommendation

Keep the backend-provided content exactly as returned.

Do not fabricate additional scores.

Do not add percentage scores or rating bars.

Primary footer action:

Start new interview

==================================================
TYPOGRAPHY
==================================================

Improve typography substantially.

Use existing font setup if reasonable.

Otherwise prefer a modern system/font stack already available without adding unnecessary dependencies.

Approximate hierarchy:

Page title:
32–40px
strong weight

Section title:
18–22px

Candidate name:
16–18px
semibold

Question:
24–30px depending on viewport

Body:
14–16px

Metadata:
12–14px

Avoid excessive uppercase text.

Use uppercase only for small labels such as:

LIVE INTERVIEW
PROGRESS
STRENGTHS

with restrained letter spacing.

==================================================
COLOR / COMPONENT SYSTEM
==================================================

Create/reuse consistent design tokens where practical.

Suggested conceptual palette:

background:
#F7F7F8 / similar warm-light neutral

surface:
#FFFFFF

primary text:
near-black

secondary text:
neutral gray

primary accent:
restrained violet

positive:
green

attention/probe:
amber

danger/failure:
red

Do not mechanically use these exact colors if the current project has suitable variables.
Choose a coherent accessible palette.

Buttons:

Primary:
violet background
white text
medium rounded corners
clear hover state

Secondary:
white/neutral
border

==================================================
INTERACTION POLISH
==================================================

Add subtle professional interactions:

- candidate-card hover
- button hover
- focus-visible states
- input/textarea focus ring
- smooth but restrained transitions

No excessive animations.

==================================================
ACCESSIBILITY
==================================================

Maintain readable contrast.

Ensure:
- keyboard focus states
- buttons remain buttons
- clickable candidate cards remain keyboard accessible
- form labels are preserved
- responsive layout does not hide important content

==================================================
IMPORTANT FUNCTIONAL CONSTRAINT
==================================================

This task MUST remain presentation-only.

Do not alter any interview decisions or candidate logic.

Before making changes, inspect how props/state flow between components.

Preserve existing behavior.

Do not convert working components into unnecessary architecture.

Keep implementation simple enough for the hackathon Live Steer challenge.

==================================================
TESTING
==================================================

After implementation run:

npm run test:interview

npm run build

Also inspect for obvious TypeScript/React errors.

Do not alter tests merely to make failures disappear.

==================================================
AI USAGE LOG
==================================================

Append this ENTIRE prompt to PROMPTS.md as:

Prompt 08 — Modern Interview Agent Interface
Tool: Codex

Purpose:
Redesign the application presentation into a modern, clean, ABTalks-inspired AI interview product without modifying working interview intelligence.

Include:
- full prompt
- concise implementation summary
- files changed
- test results
- build result

Do not overwrite previous entries.

Never include:
- API keys
- Supabase secrets
- Gemini secrets
- environment variable values

==================================================
GIT
==================================================

Before committing:

Verify .env.local is ignored and unstaged.

Review git diff to ensure Gemini/API/Supabase/interview intelligence were not unintentionally modified.

After tests/build pass commit with:

Polish Interview Agent interface

Push to origin/main.

==================================================
FINAL RESPONSE
==================================================

Report:

- UI files changed
- selection-screen improvements
- candidate-profile improvements
- interview-screen improvements
- feedback-screen improvements
- responsive behavior
- whether any backend/logic files changed
- test result
- build result
- commit hash
- push status

Do not implement deployment in this task.

Implementation summary:
- Added a compact responsive application sidebar and a cohesive light visual system with restrained violet accents, stronger typography, soft borders, and accessible interaction states.
- Expanded candidate selection into a responsive 3/2/1-column layout with search, richer cards, and organizer-data-backed 31-day journey strips.
- Reworked the candidate profile, live interview, loading state, transcript context, and final feedback report without changing state flow or backend-returned content.
- Rendered first-attempt passes green, multiple-attempt passes amber, failures red, unrecorded days gray, and explicit skips with a distinct striped treatment.

Files changed:
- src/App.tsx
- src/components/Brief.tsx
- src/components/Feedback.tsx
- src/components/Interview.tsx
- src/components/Selection.tsx
- src/components/ui.tsx
- src/data.ts
- src/index.css
- PROMPTS.md

Tests performed:
- `npm run test:interview` — passed.
- `npm run build` — passed TypeScript and Vite production build.
- Browser-based visual QA could not run because no browser surface was available; responsive and accessibility behavior was reviewed in source.

No backend, Gemini, Supabase, API-contract, session-flow, organizer-data, interview-intelligence, dependency, or unrelated test files were changed. No secret values were added to source, logs, PROMPTS.md, or Git.

## Prompt 09 — Evidence and Adaptation Layer

Tool: Codex

Purpose:
Make candidate personalization, adaptive interviewing, and feedback evidence visible and explainable without changing core interview intelligence.

Full prompt:

PROMPT 09 — Evidence & Adaptation Layer

We are doing one final product-enhancement pass on the existing Interview Agent before deployment.

The current project already has:
- polished modern UI
- candidate learning profiles
- 31-day learning journey visualization
- Gemini-powered adaptive technical interviewing
- intelligent follow-ups
- dynamic difficulty
- Supabase session persistence
- interview-grounded final feedback
- minimum 8 questions
- minimum 4 curriculum days
- deterministic fallback
- working tests/build

IMPORTANT:
Do NOT redesign the application again.
Do NOT add broad new features.

This task should make the existing personalization and adaptivity VISIBLE and EXPLAINABLE to judges.

The product thesis is:

"Learning history tells us where to look.
The interview tells us what they know now."

==================================================
GOAL
==================================================

Add a lightweight Evidence & Adaptation Layer that clearly shows:

1. why a topic/question was selected
2. how the interview adapted
3. how historical learning signals compare with live interview evidence
4. what evidence supports final strengths/gaps

Do this WITHOUT exposing hidden chain-of-thought or private model reasoning.

Use only structured signals already available or safely derived from:
- candidate mission history
- curriculum day
- question metadata
- assessment quality
- concepts understood/missing
- transcript
- interview observations

==================================================
1. "WHY THIS QUESTION?" DURING INTERVIEW
==================================================

On the Live Interview screen, add a subtle expandable element near the question metadata:

Why this question? ▾

It should reveal a SHORT deterministic explanation based on structured state.

Examples:

Historical probe:
"Day 12 required multiple learning attempts, so the interview is validating current understanding."

First-try validation:
"Day 16 was completed on the first attempt, so the interview is validating this as a potential strength."

Adaptive follow-up:
"The previous response was incomplete on evaluation methodology, so this follow-up probes that gap."

Depth increase:
"The previous response demonstrated the fundamentals, so the interview is increasing the depth."

New topic:
"The interview is expanding coverage to another relevant curriculum area."

Do NOT expose:
- chain-of-thought
- internal Gemini prompt
- hidden reasoning
- confidence tokens
- raw model output

Keep explanations concise and professional.

If the current architecture does not expose enough structured state to produce an accurate explanation, implement the smallest safe internal metadata addition necessary.

CRITICAL:
Do not break the organizer-required POST /api/interview contract.

Required fields and behavior must remain compatible.

Avoid changing the external response shape unless the current app already supports optional presentation metadata safely.

Prefer deriving explanations from existing client/session state when possible.

==================================================
2. ADAPTIVE INTERVIEW PATH
==================================================

Improve the interview sidebar so judges can see the adaptation path.

Add a compact section:

INTERVIEW PATH

Example:

Day 12 · Prompt Engineering
Probe

↓ Follow-up

Day 12 · Prompt Evaluation
Deepen

↓ New topic

Day 13 · Function Calling
Validate

↓ New topic

Day 16 · Chatbot Backend
Validate

The visualization should remain compact.

Possible transition labels:

PROBE
VALIDATE
FOLLOW-UP
DEEPEN
NEW TOPIC

Do not fabricate labels.

Derive them from structured interview state.

Examples:

FOLLOW-UP:
same curriculum day after weak/partial answer

DEEPEN:
same curriculum day after good/strong answer with higher difficulty

NEW TOPIC:
curriculum day changes

PROBE:
historically difficult area being tested

VALIDATE:
historical strength being checked

If a transition cannot be confidently categorized, omit the label rather than guessing.

Do not make this a large flowchart.

Keep it visually consistent with the current clean UI.

==================================================
3. LEARNING JOURNEY → LIVE INTERVIEW VALIDATION
==================================================

On the final Feedback screen, add a new section:

LEARNING SIGNAL VALIDATION

This should compare historical learning signals with CURRENT interview evidence.

Example:

DAY 10
Retrieval & Matching Engine

Learning journey
4 attempts

Live interview
Strong

Current signal
✓ Improvement validated


Another example:

DAY 12
Prompt Engineering

Learning journey
5 attempts

Live interview
Partial

Current signal
△ Needs reinforcement


Another:

DAY 16
Chatbot Backend

Learning journey
First-try pass

Live interview
Strong

Current signal
✓ Strength confirmed

Only include curriculum days that were actually covered in the interview and have enough evidence.

Use actual observations/assessments.

Never infer "Strong" solely from historical learning data.

==================================================
VALIDATION STATUS RULES
==================================================

Use deterministic presentation logic based on current interview observations.

Historical performance must NOT override current interview evidence.

Possible statuses:

STRENGTH CONFIRMED
Use when:
- historical first-try/strong signal exists
- AND live answer evidence is good/strong

IMPROVEMENT VALIDATED
Use when:
- historically difficult/high-attempt/failed area
- AND current live evidence is good/strong

NEEDS REINFORCEMENT
Use when:
- current interview evidence remains weak/partial
- regardless of historical success

CURRENTLY INCONCLUSIVE
Use only when:
- evidence is genuinely mixed or insufficient

Do not create fake numeric scores.

Do not show percentages.

==================================================
4. EVIDENCE-LINKED FEEDBACK
==================================================

Where reasonably possible, make feedback strengths and gaps traceable to the interview evidence.

For each strength/gap, provide a subtle:

View evidence

interaction.

When expanded, show a concise relevant excerpt or supporting interview turn.

Example:

Strength
Designed a stateless FastAPI architecture using Redis-backed state and concurrency controls.

Day 16 · Question 4
View evidence ▾

Candidate evidence:
"I'd keep FastAPI stateless and store conversation history in an external session store..."

IMPORTANT:
Do not fabricate mappings.

Only link evidence when there is a reliable connection to:
- curriculum day
- observation
- transcript turn
- concept

If an existing feedback string cannot safely be mapped to a specific response, leave it without an evidence link.

Do NOT ask Gemini to regenerate feedback just to create UI mappings if avoidable.

Prefer the structured observations already stored during the interview.

==================================================
5. PRODUCT COPY
==================================================

Add this product idea somewhere subtle and appropriate, likely candidate profile or feedback:

Learning history tells us where to look.
The interview tells us what they know now.

Do not repeat it everywhere.

Keep the product copy concise.

==================================================
6. VISUAL STYLE
==================================================

Preserve the current Prompt 08 design system.

The new UI should feel native to the existing interface.

Use:
- subtle bordered panels
- small status labels
- restrained green/amber/red
- clear hierarchy
- compact disclosure interactions
- clean typography

Avoid:
- giant charts
- complex dashboards
- excessive animation
- gamification
- numeric scoring
- decorative AI graphics

==================================================
7. DATA INTEGRITY
==================================================

This is critical.

Do NOT:
- treat unlisted missions as failed
- treat historical attempts as current gaps
- fabricate assessment evidence
- invent transcript quotes
- invent curriculum days
- invent candidate performance
- modify organizer candidate JSON
- modify organizer curriculum JSON

Live interview evidence has priority over historical learning difficulty.

==================================================
8. API / BACKEND SAFETY
==================================================

Preserve:
- POST /api/interview
- sessionId behavior
- required start request
- required continuation request
- done:false behavior
- done:true feedback object
- exact required feedback keys:
  summary
  strengths
  gaps
  next

Do not introduce breaking API changes.

If internal metadata is needed for UI explainability, implement it in the smallest backwards-compatible way possible.

Do not add another database.

Do not add RAG.

Do not add Breeth.

Do not add new external services.

Do not alter Gemini authentication/model configuration.

==================================================
9. LIVE STEER SIMPLICITY
==================================================

Keep implementation understandable and modular.

This project may be modified live during judging.

Avoid:
- unnecessary abstractions
- large state-management libraries
- complex event systems
- new frameworks

Use the current architecture.

==================================================
10. TESTING
==================================================

Add focused tests for new deterministic logic where appropriate.

Verify:

1. historically difficult + current strong => Improvement validated
2. historical strength + current strong => Strength confirmed
3. current weak/partial => Needs reinforcement
4. history alone cannot create a current gap/status
5. unrecorded days are not considered failures
6. evidence excerpts come from actual transcript content
7. no fabricated evidence mapping
8. same-day weak/partial response can display FOLLOW-UP
9. same-day strong response with increased depth can display DEEPEN where state supports it
10. curriculum-day change can display NEW TOPIC
11. required /api/interview behavior remains intact

Run:

npm run test:interview
npm run build

Do not alter tests merely to hide failures.

==================================================
11. PROMPTS.md
==================================================

Append this ENTIRE prompt to PROMPTS.md as:

Prompt 09 — Evidence and Adaptation Layer
Tool: Codex

Purpose:
Make candidate personalization, adaptive interviewing, and feedback evidence visible and explainable without changing core interview intelligence.

Include:
- full prompt
- implementation summary
- files changed
- tests
- build result

Never overwrite previous entries.

Never include:
- GEMINI_API_KEY
- SUPABASE_SECRET_KEY
- API secrets
- environment-variable values

==================================================
12. GIT
==================================================

Before committing:

- inspect git diff
- confirm .env.local is ignored
- confirm no secrets are staged
- confirm organizer data is unchanged
- confirm Gemini/Supabase behavior was not unintentionally altered

If tests/build pass, commit with:

Add interview evidence and adaptation insights

Push to origin/main.

==================================================
FINAL RESPONSE
==================================================

Report:

- files changed
- Why This Question implementation
- interview-path implementation
- learning-signal validation implementation
- evidence-link implementation
- whether API/backend behavior changed
- tests
- build
- commit hash
- push status
- any limitations where evidence was intentionally omitted rather than fabricated

Do NOT deploy in this task.

Do NOT add any additional features beyond this scope.

Implementation summary:
- Added a safe optional assessment-observation field to interview responses and collected it in existing client session state without exposing prompts, internal notes, or raw model output.
- Added deterministic helpers for concise question explanations, PROBE/VALIDATE/FOLLOW-UP/DEEPEN/NEW TOPIC path labels, learning-signal validation, and conservative transcript-evidence matching.
- Added expandable Why this question and View evidence interactions, a compact Interview path sidebar, learning-signal validation on the report, and the product-thesis copy on the candidate profile.
- Omitted explanations and evidence links whenever the available structured signals could not support them reliably.

Files changed:
- server/interviewEngine.ts
- scripts/test-interview.mjs
- src/App.tsx
- src/components/Brief.tsx
- src/components/Feedback.tsx
- src/components/Interview.tsx
- src/evidence.ts
- src/types.ts
- src/useInterviewFlow.ts
- PROMPTS.md

Tests performed:
- `npm run test:interview` — passed existing API/adaptive tests plus deterministic evidence, validation-status, excerpt-integrity, and path-label coverage.
- `npm run build` — passed TypeScript and Vite production build.

The POST request contract and required feedback keys remain unchanged. The response may include optional safe observation metadata when a current assessment exists. Gemini authentication/model behavior, Supabase persistence, organizer data, and secret handling were not changed.

## Prompt 10 — Fix Gemini Final Feedback Fallback

Tool: Codex

Full prompt:

PROMPT 10 — Fix Gemini Final Feedback Fallback

This is a focused production reliability bug fix.

The adaptive Gemini interview itself is working correctly.

Manual test results for Ethan Brooks:
- Gemini answer assessment works.
- observations are persisted correctly.
- adaptive FOLLOW-UP works.
- DEEPEN / NEW TOPIC behavior works.
- 8 questions across 6 curriculum days completed.
- Evidence & Adaptation UI works.

However, on interview completion, Gemini-generated final feedback fails and the application falls back to deterministic feedback.

The UI currently displays fallback copy such as:

"This fallback prioritizes available interview observations..."

and:

"Automated feedback generation was unavailable..."

The completed session contains valid Gemini observations for all interview turns, but no generated feedback is stored in session state.

DO NOT change interview intelligence, UI design, candidate logic, Supabase architecture, API contract, or organizer data.

==================================================
1. FIND THE ACTUAL ROOT CAUSE
==================================================

Inspect the final-feedback path in:
- server/gemini.ts
- interview completion logic
- api/interview.ts
- any feedback validation/parsing code

Determine precisely why Gemini final feedback falls back while per-answer Gemini assessment succeeds.

Check specifically for:
- timeout
- malformed JSON
- structured-output validation failure
- response parsing assumptions
- finish reason / empty content
- excessive prompt size
- model response format differences
- gemini-3.5-flash compatibility

Do not guess and patch blindly.

==================================================
2. IMPROVE FINAL FEEDBACK RELIABILITY
==================================================

Keep the existing interview-turn timeout behavior unless necessary.

For FINAL FEEDBACK generation, allow a more appropriate timeout because the request includes:
- transcript
- observations
- candidate learning history
- covered curriculum
- evidence

If the current shared timeout is 12 seconds, do not assume that is sufficient for final feedback.

Use a separate final-feedback timeout, reasonably around 25–30 seconds.

Do not make normal interview turns unnecessarily slower.

Keep bounded retry behavior.

==================================================
3. STRUCTURED RESPONSE ROBUSTNESS
==================================================

Final feedback must still ultimately satisfy exactly:

{
  "summary": string,
  "strengths": string[],
  "gaps": string[],
  "next": string[]
}

Validate the result.

But make parsing resilient to common Gemini JSON response variations where safe.

Examples:
- surrounding markdown fences
- leading/trailing whitespace
- otherwise valid JSON that can be safely extracted

Do NOT accept structurally invalid feedback.

Do NOT fabricate values merely to satisfy validation.

If Gemini returns usable structured data, do not fall back unnecessarily.

==================================================
4. SAFE DEVELOPMENT LOGGING
==================================================

The current failure is silent in local development.

Add concise DEVELOPMENT-ONLY server logging for Gemini failures.

For example:

[Gemini] final feedback failed: timeout
[Gemini] invalid final feedback JSON
[Gemini] final feedback validation failed

Never log:
- GEMINI_API_KEY
- SUPABASE_SECRET_KEY
- authorization headers
- full candidate answers
- full Gemini prompts
- sensitive environment variables

Production users should still receive the graceful fallback without raw errors.

This logging is only to make future fallback causes diagnosable.

==================================================
5. DO NOT DISCARD EXISTING OBSERVATIONS
==================================================

The current stored observations are excellent and must continue to drive final feedback.

Current live observations should outweigh historical mission attempts.

Example manual-test evidence included:

Day 3:
partial:
missing CORS and CORSMiddleware

then later Day 3:
strong:
correctly demonstrated CORS, CORSMiddleware, allowed origins and security implications

Final feedback should recognize that the gap was resolved rather than report CORS as a current weakness.

Similarly:
Day 8 had an initial strong fundamental answer with ANN/indexing concepts still missing,
followed by a strong deepening response that resolved ANN/HNSW/IVF/recall trade-offs.

Use the latest/current evidence appropriately.

==================================================
6. OPTIONAL SESSION STORAGE
==================================================

If final feedback currently exists only in the API response, consider persisting the successfully generated feedback into session state as well.

This is optional but desirable for:
- debugging
- reproducibility
- refresh/review behavior

Do this only if it is a small backwards-compatible change.

Do NOT alter the required public API response.

==================================================
7. TESTS
==================================================

Add focused tests verifying:

1. successful Gemini final feedback is returned instead of fallback.
2. final feedback has exactly:
   summary:string
   strengths:string[]
   gaps:string[]
   next:string[]
3. malformed Gemini feedback still falls back safely.
4. final-feedback timeout uses the larger dedicated timeout.
5. normal interview assessment timeout behavior remains unchanged.
6. markdown-fenced but otherwise valid JSON can be parsed safely if applicable.
7. resolved gaps are not incorrectly reported as current gaps.
8. development logging contains no secrets.
9. /api/interview contract remains unchanged.

Run:

npm run test:interview
npm run build

==================================================
8. MANUAL SMOKE-TEST SUPPORT
==================================================

If practical, add a minimal optional way to exercise the final-feedback Gemini function using mocked/session fixture data without changing production behavior.

Do NOT make real Gemini calls part of the normal automated test suite.

==================================================
9. PROMPTS.md
==================================================

Append this entire prompt as:

Prompt 10 — Fix Gemini Final Feedback Fallback
Tool: Codex

Include:
- diagnosed root cause
- implementation
- files changed
- tests
- build result

Do not overwrite previous prompts.
Never include secrets.

==================================================
10. GIT
==================================================

Before commit:
- verify .env.local remains ignored
- verify no secrets are staged
- verify organizer data is untouched
- inspect diff for unrelated changes

After tests/build pass:

Commit:
Fix Gemini final feedback reliability

Push to origin/main.

==================================================
FINAL REPORT
==================================================

Report:
- exact root cause
- files changed
- timeout/parsing changes if any
- logging added
- whether successful feedback is persisted
- tests
- build
- commit hash
- push status

Do not deploy.
Do not add unrelated features.

Diagnosed root cause:
- A sanitized reproduction using the stored Ethan Brooks session received HTTP 429 `RESOURCE_EXHAUSTED` with Gemini `RetryInfo` requesting a 4-second delay.
- The client retried immediately, so the bounded second attempt was also rejected and silently returned `null`, triggering deterministic fallback. The observed failure completed before the old 12-second deadline, so timeout was not the triggering cause.

Implementation summary:
- Added a dedicated 30-second final-feedback timeout while retaining the 12-second assessment timeout.
- Added bounded 429 retry delay handling for `Retry-After` and Gemini `RetryInfo`, plus development-only static failure diagnostics.
- Added safe parsing for whitespace, Markdown-fenced JSON, and extractable JSON objects while retaining exact structural validation.
- Allowed zero current gaps without fabrication, emphasized latest same-day observations, and persisted the returned final feedback in session state.
- Sustained upstream quota exhaustion still uses the existing graceful deterministic fallback.

Files changed:
- server/gemini.ts
- server/interviewEngine.ts
- scripts/test-interview.mjs
- PROMPTS.md

Tests performed:
- `npm run test:interview` — passed final-feedback success/fallback, exact shape, dedicated timeouts, fenced JSON, rate-limit recovery, resolved-gap, safe logging, API, adaptive interview, and storage coverage.
- `npm run build` — passed TypeScript and Vite production build.
- A sanitized real-fixture smoke test exercised the delayed retry; the provider quota remained exhausted on the bounded retry, so graceful fallback remained active.

No API keys, secret values, prompts, candidate answers, authorization headers, or sensitive environment-variable values were logged or committed.

## Prompt 11 — Gemini Flash-Lite Reliability Fallback

Tool: Codex

Full prompt:

PROMPT 11 — Add Gemini Flash-Lite Reliability Fallback

This is a focused pre-deployment reliability improvement.

Current state:
- Gemini adaptive interviewing works correctly when the primary model succeeds.
- Primary model: gemini-3.5-flash
- 429 RESOURCE_EXHAUSTED has occurred repeatedly during manual testing.
- Retry-After / Gemini RetryInfo handling is already implemented.
- Deterministic fallback works, but when Gemini remains unavailable the interview loses adaptivity and observations remain empty.

Goal:
Add a SECONDARY Gemini model fallback before falling back to deterministic behavior.

Do NOT redesign UI or alter interview intelligence.

==================================================
1. MODEL FALLBACK CHAIN
==================================================

Primary model remains:

gemini-3.5-flash

Secondary model:

gemini-3.5-flash-lite

Use the secondary model only when the primary Gemini request remains unavailable after the existing bounded retry behavior for temporary/retriable failures.

Desired chain:

primary Gemini request
↓
success => use result

temporary/retriable failure such as 429
↓
honor Retry-After / RetryInfo
↓
bounded retry primary
↓
still unavailable
↓
try gemini-3.5-flash-lite
↓
success => use result

secondary unavailable/invalid
↓
existing deterministic fallback

Do not call both models in parallel.

==================================================
2. APPLY TO BOTH AI PATHS
==================================================

Use this reliability chain for:

- answer assessment / next-question generation
- final feedback generation

Preserve their existing separate timeout behavior.

Normal assessment:
keep current timeout.

Final feedback:
keep current larger final-feedback timeout.

==================================================
3. MODEL CONFIGURATION
==================================================

Keep:

GEMINI_MODEL

as the primary-model override.

Add an optional environment variable:

GEMINI_FALLBACK_MODEL

Default fallback model:

gemini-3.5-flash-lite

Therefore defaults are conceptually:

primary:
GEMINI_MODEL || "gemini-3.5-flash"

fallback:
GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite"

Do not expose either to frontend code.

Do not log API keys.

==================================================
4. RETRY / FAILURE RULES
==================================================

Do not blindly switch models for every failure.

Use the fallback model for appropriate recoverable/model-availability failures such as:
- 429 rate/resource exhaustion after bounded retry
- 503 temporary service unavailable
- 404/model unavailable where switching models is appropriate
- timeout after bounded primary attempt where safe

For errors such as malformed application input or clear developer/request bugs, do not hide the issue by endlessly trying models.

Keep all retries bounded.

Avoid long delays that make interview turns unusable.

==================================================
5. STRUCTURED OUTPUT
==================================================

gemini-3.5-flash-lite supports structured outputs.

Reuse the same validated response schema and parsing logic.

Do not weaken validation just because the fallback model is used.

Assessment output must still satisfy the existing structured assessment contract.

Final feedback must still satisfy exactly:

{
  "summary": string,
  "strengths": string[],
  "gaps": string[],
  "next": string[]
}

==================================================
6. DEVELOPMENT LOGGING
==================================================

Extend existing safe development-only logging so we can diagnose model switching.

Safe examples:

[Gemini] primary model rate-limited; retrying after 4s
[Gemini] primary unavailable; trying fallback model
[Gemini] fallback model succeeded
[Gemini] fallback model failed: 429

Never log:
- API key
- prompts
- candidate full answers
- auth headers
- Supabase secrets
- environment values

==================================================
7. PRESERVE BEHAVIOR
==================================================

Do NOT change:
- candidate targeting
- adaptive decision rules
- curriculum grounding
- completion requirements
- Supabase persistence
- Evidence & Adaptation layer
- UI
- public POST /api/interview contract
- organizer data
- feedback evidence weighting

This is reliability only.

==================================================
8. TESTS
==================================================

Add focused mocked tests verifying:

1. primary success => fallback model is not called
2. primary 429 + successful bounded retry => fallback model is not called
3. primary remains 429 => fallback model is attempted
4. fallback succeeds => adaptive observation/question is used
5. primary unavailable + fallback unavailable => deterministic fallback still works
6. same behavior works for final feedback
7. fallback-model response still passes structured validation
8. GEMINI_FALLBACK_MODEL overrides default
9. default fallback model is gemini-3.5-flash-lite
10. secrets/prompts are not written to development logs
11. /api/interview contract remains unchanged

Run:

npm run test:interview
npm run build

==================================================
9. PROMPTS.md
==================================================

Append this entire prompt as:

Prompt 11 — Gemini Flash-Lite Reliability Fallback
Tool: Codex

Include:
- implementation summary
- files changed
- tests
- build result

Never overwrite prior entries.
Never include secrets.

==================================================
10. GIT
==================================================

Verify:
- .env.local ignored
- no secrets staged
- organizer data unchanged
- no unrelated files changed

Commit:

Add Gemini model fallback

Push to origin/main.

==================================================
FINAL REPORT
==================================================

Report:
- files changed
- fallback chain implemented
- retriable error behavior
- model configuration
- tests
- build
- commit hash
- push status

Do not deploy.
Do not add other features.

Implementation summary:
- Added a sequential primary-to-fallback Gemini chain for both adaptive answer assessment and final feedback.
- The primary model retains two bounded attempts and existing retry-delay handling. Flash-Lite receives one attempt only after eligible availability failures such as repeated 429/408/5xx, 404 model unavailability, timeout, or transport failure.
- Invalid JSON, schema-validation failures, and non-retriable request errors do not trigger model switching, and both models reuse the same schemas, parsers, and assessment/final-feedback timeouts.
- Added safe development-only logs for primary retries, fallback switching, fallback success, and terminal failure without model names, prompts, answers, headers, keys, or environment values.
- Added `GEMINI_FALLBACK_MODEL` with default `gemini-3.5-flash-lite`; `GEMINI_MODEL` remains the primary override.

Files changed:
- server/gemini.ts
- scripts/test-interview.mjs
- PROMPTS.md

Tests performed:
- `npm run test:interview` — passed primary-only success, primary retry recovery, Flash-Lite adaptive and feedback recovery, invalid fallback rejection, both-model fallback, environment override, safe logging, API contract, and existing interview/storage coverage.
- `npm run build` — passed TypeScript and Vite production build.
- A sanitized real-session smoke test returned validated feedback through the completed fallback chain in approximately 13 seconds.

No API keys, secret values, prompts, candidate answers, authorization headers, or environment-variable values were logged or committed.

## Prompt 12 — Light and Dark Theme Support

Tool: Codex

Purpose:
Add accessible persistent light/dark themes to the approved Interview Agent interface without modifying product intelligence.

Full prompt:

PROMPT 12 — Light and Dark Theme Support

This is the final UI polish task before production deployment.

The Interview Agent is feature-complete and the current light interface is approved.

GOAL:
Add a polished Light / Dark theme system without changing any product behavior, backend logic, interview intelligence, API behavior, or data.

Do NOT redesign the application again.

==================================================
1. THEME BEHAVIOR
==================================================

Support two user-facing themes:

- Light
- Dark

Keep the existing Prompt 08/09 visual identity.

Light mode should remain very close to the current approved design.

Dark mode should feel like the same product, not a separate redesign.

On first visit:
- use the browser/system `prefers-color-scheme` preference if no saved preference exists

After the user explicitly chooses a theme:
- persist that choice locally
- restore it on future visits

Use localStorage or the simplest existing browser mechanism.

Do not require authentication or backend persistence.

==================================================
2. THEME CONTROL
==================================================

Add one compact theme toggle.

Desktop:
place it unobtrusively near the bottom of the existing left sidebar.

Mobile:
place it in the existing mobile header/navigation area.

Keep it visually minimal.

Examples:
Sun icon / Moon icon
or
Light / Dark segmented control

Do not create a Settings page just for this.

Use accessible labels such as:
"Switch to dark mode"
"Switch to light mode"

Keyboard interaction must work.

==================================================
3. IMPLEMENTATION
==================================================

Prefer CSS custom properties/design tokens.

For example:

--bg
--surface
--surface-subtle
--text-primary
--text-secondary
--border
--accent
--accent-hover
--positive
--warning
--danger
--input-bg
--focus-ring

Apply the theme using a simple root attribute/class such as:

html[data-theme="dark"]

or equivalent.

Do not add a theme library or unnecessary dependency.

Audit the current UI for hardcoded colors that prevent dark mode from rendering correctly.

Only refactor color declarations needed for theme support.

==================================================
4. LIGHT THEME
==================================================

Preserve the approved visual direction:

- warm/light neutral background
- white cards
- near-black typography
- restrained violet accent
- subtle gray borders
- green positive signals
- amber probe signals
- red failure signals

Do not materially change spacing, layout, component sizes, or typography.

==================================================
5. DARK THEME
==================================================

Create a professional dark theme.

Avoid pure black everywhere.

Conceptual direction:

Background:
deep neutral charcoal

Primary surface:
slightly lighter charcoal

Secondary surface:
subtle elevated neutral

Primary text:
soft white / very light gray

Secondary text:
muted gray with good contrast

Borders:
subtle but visible dark-neutral borders

Accent:
retain the violet identity, tuned for dark-background contrast

Positive / warning / failure states:
remain distinguishable and accessible.

Candidate journey strips must remain readable in dark mode.

Ensure the following all work correctly:

- candidate cards
- sidebar
- search field
- candidate brief
- metrics
- 31-day journey visualization
- Validate / Probe / Skipped cards
- interviewer brief
- live interview question panel
- textarea
- interview path
- Why this question disclosure
- transcript
- loading state
- feedback report
- Strengths / Areas to Strengthen
- Learning Signal Validation
- View Evidence disclosures
- buttons
- focus states

==================================================
6. CONTRAST / ACCESSIBILITY
==================================================

Maintain good text contrast in both modes.

Do not rely only on color to communicate:

- passed
- multiple attempts
- failed
- skipped
- Probe
- Validate
- Strength Confirmed
- Improvement Validated
- Needs Reinforcement

Existing labels/icons should remain meaningful.

Inputs and textareas need visible:
- border
- placeholder
- text
- focus ring

Hover/focus states must work in both themes.

==================================================
7. PREVENT THEME FLASH
==================================================

Avoid an obvious white flash when a saved dark theme is loaded.

Use the simplest reliable approach compatible with the current Vite/React project.

Do not create complicated theme infrastructure.

==================================================
8. PRESERVE ALL PRODUCT LOGIC
==================================================

Do NOT modify:

- Gemini integration
- primary/fallback Gemini models
- Gemini retry behavior
- Supabase session persistence
- /api/interview contract
- adaptive follow-ups
- question targeting
- interview completion requirements
- observations
- feedback generation
- evidence/adaptation logic
- candidate mission interpretation
- organizer JSON
- session state schema unless absolutely unnecessary

This is UI/theme only.

==================================================
9. RESPONSIVENESS
==================================================

Verify theme control and both themes across:

- wide desktop
- laptop
- tablet/narrow layout
- mobile layout

Do not break the current 3/2/1 candidate-card responsive grid.

==================================================
10. TESTING
==================================================

Run:

npm run test:interview
npm run build

Also inspect for:
- TypeScript errors
- hardcoded light-only colors
- unreadable dark-mode states
- accidental backend changes

Do not modify interview tests simply to suppress failures.

==================================================
11. PROMPTS.md
==================================================

Append this ENTIRE prompt to PROMPTS.md as:

Prompt 12 — Light and Dark Theme Support
Tool: Codex

Purpose:
Add accessible persistent light/dark themes to the approved Interview Agent interface without modifying product intelligence.

Include:
- full prompt
- implementation summary
- files changed
- test result
- build result

Never overwrite prior prompt entries.

Never include:
- GEMINI_API_KEY
- SUPABASE_SECRET_KEY
- API keys
- environment-variable values

==================================================
12. GIT
==================================================

Before committing:

- verify .env.local remains ignored
- verify no secrets are staged
- verify backend/interview logic has not changed unintentionally
- verify organizer data is unchanged

After tests/build pass:

Commit with:

Add light and dark themes

Push to origin/main.

==================================================
FINAL REPORT
==================================================

Report:

- files changed
- theme implementation approach
- default/system preference behavior
- persistence behavior
- dark-theme visual changes
- theme-toggle location
- accessibility considerations
- whether any backend/AI files changed
- tests
- build
- commit hash
- push status

Do not deploy in this task.
Do not add any other features.

Implementation summary:
- Added light and dark design-token palettes using CSS custom properties selected by `html[data-theme='dark']`, while preserving existing component structure, spacing, typography, and responsive grids.
- Added an accessible native-button theme control at the bottom of the desktop sidebar and in the mobile header. The control uses sun/moon icons, keyboard interaction, and an action-specific accessible label.
- First visits follow `prefers-color-scheme`; explicit choices are saved locally and restored. A small pre-render script applies the resolved theme before the app and stylesheet load to prevent a saved dark theme from flashing light.
- Converted fixed white UI surfaces and status colors to theme-aware tokens, added dark-appropriate neutral/violet/status palettes and shadows, and kept journey status labels and skipped-pattern differentiation intact.
- No backend, Gemini, Supabase, interview intelligence, session schema, organizer data, or dependency changes were made.

Files changed:
- index.html
- src/components/Brief.tsx
- src/components/Feedback.tsx
- src/components/Interview.tsx
- src/components/Selection.tsx
- src/components/ui.tsx
- src/index.css
- tailwind.config.js
- PROMPTS.md

Tests performed:
- `npm run test:interview` — passed the existing Interview API, adaptive Gemini, evidence, fallback, and storage coverage without modifying tests.
- `npm run build` — passed TypeScript checking and the Vite production build.
- Static theme audit — confirmed theme-aware compiled surface/action classes, preserved 3/2/1 candidate-card responsive classes, no fixed light-only UI colors, and no backend or organizer-data diff.

No API keys, secret values, prompts, candidate answers, authorization headers, or environment-variable values were logged or committed.
