# AI Usage Evidence

This project was built through a transparent AI-assisted workflow using Bolt, ChatGPT, and OpenAI Codex, with GitHub serving as the implementation and version-history audit trail.

**Development progression:** `Bolt` → `ChatGPT` → `Codex` → `GitHub verification`

The evidence is designed to distinguish product ideation, planning, repository implementation, and independent version history. It does not present GitHub itself as an AI tool.

## 1. Bolt — Initial Product & Frontend Prototype

Bolt was used during the earliest vibe-coding phase to establish the React, TypeScript, and Vite experience. That prototype created the first complete journey:

`Candidate Selection` → `Candidate Brief` → `Mock Interview` → `Feedback`

It also established the initial use of organizer-provided candidate and curriculum data and demonstrated learning-aware personalization before the real interview backend existed.

### Historical transparency

The exact early Bolt transcripts were not retained at the time. Prompts 01–02 in [`PROMPTS.md`](PROMPTS.md) are therefore explicitly marked **historical reconstructions** based on the early application state and Git history. They are contextual records, not verbatim original transcripts.

## 2. ChatGPT — Planning, Architecture & Debugging

ChatGPT acted as the planning, architecture, debugging, and test-design partner across the project. Its work included:

- interpreting the challenge requirements and shaping the product strategy;
- planning the serverless API, interview state model, adaptive interview strategy, and feedback contract;
- reviewing candidate-data classification and historical-signal correctness;
- planning the direct Gemini integration and structured response strategy;
- designing manual adaptive-interview scenarios;
- helping diagnose Supabase configuration, Gemini quota and fallback behavior, and Vercel production issues; and
- preparing precise implementation prompts for Codex.

ChatGPT did not directly edit repository files. Supporting ChatGPT transcript can be supplied separately if requested; no public transcript URL is claimed here.

## 3. OpenAI Codex — Repository Implementation

OpenAI Codex was used in VS Code as the repository-level coding agent. It inspected the existing implementation, changed files, ran tests and builds, reviewed diffs, and recorded implementation results.

The preserved Codex work covers:

- candidate learning-history correctness;
- the `POST /api/interview` contract and session engine;
- Supabase session persistence and secret-key handling;
- Gemini answer assessment and adaptive questioning;
- feedback evidence and reliability;
- bounded retries and the fallback-model strategy;
- interface redesign and the Evidence & Adaptation experience;
- light and dark themes;
- the public landing page; and
- Vercel production module-resolution fixes.

Later development entries in [`PROMPTS.md`](PROMPTS.md) preserve the full prompt together with an implementation summary, files changed, and test/build results. This creates a direct, reviewable link between agent instructions and repository outcomes.

## 4. GitHub — Independent Implementation Trail

Git history provides independent evidence that the application was implemented incrementally. Commits show the progression from the early frontend through candidate-data corrections, API and storage foundations, Gemini adaptation, reliability improvements, evidence-focused UI, theme and landing-page work, and production fixes.

- **Repository:** [github.com/chait4499/AI_AGENT](https://github.com/chait4499/AI_AGENT)
- **AI Usage Log:** [PROMPTS.md](https://github.com/chait4499/AI_AGENT/blob/main/PROMPTS.md)
- **Live Demo:** [ai-agent-blond-one.vercel.app](https://ai-agent-blond-one.vercel.app)

## Evidence Chain

| Evidence | Purpose |
| --- | --- |
| [`PROMPTS.md`](PROMPTS.md) | Primary chronological AI usage log |
| ChatGPT conversation/transcript | Planning, architecture, testing, and debugging evidence; available separately if requested |
| Codex prompts | Repository implementation-agent instructions |
| GitHub commits | Independent, incremental implementation verification |
| [Public repository](https://github.com/chait4499/AI_AGENT) | Source-code and history review |
| [Live Vercel deployment](https://ai-agent-blond-one.vercel.app) | Working project result |

Together, the evidence chain can be read as:

`documented prompt` → `changed files` → `tests/build` → `Git commit` → `public implementation`

## Transparency Note

- AI-assisted development was used intentionally throughout the project.
- The earliest Bolt prompts were not originally retained.
- Reconstructed entries are clearly labeled and are not represented as verbatim transcripts.
- Later Codex prompts were logged sequentially with implementation and validation notes.
- ChatGPT supported planning and diagnosis but is not claimed to have directly changed the repository.
- GitHub is treated as the implementation audit trail, not as an AI tool.
- Secrets, tokens, passwords, and local environment values are excluded from the public logs.

For the full chronological record, see [`PROMPTS.md`](PROMPTS.md).
