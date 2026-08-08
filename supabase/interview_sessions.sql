create table if not exists public.interview_sessions (
  session_id text primary key,
  state jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.interview_sessions enable row level security;

-- The serverless API uses SUPABASE_SECRET_KEY and does not expose this table
-- directly to browser clients. No anonymous or authenticated-user policies are added.
