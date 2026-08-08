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
