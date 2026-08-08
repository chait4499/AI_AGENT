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
