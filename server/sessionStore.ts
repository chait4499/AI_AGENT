import type { SessionState } from './interviewEngine.ts';

declare const process: { env: Record<string, string | undefined> };

interface SessionStore {
  get(sessionId: string): Promise<SessionState | null>;
  save(state: SessionState): Promise<void>;
}

export class StorageError extends Error {}

const localSessions = new Map<string, SessionState>();

class LocalDevelopmentSessionStore implements SessionStore {
  async get(sessionId: string) {
    return localSessions.get(sessionId) ?? null;
  }

  async save(state: SessionState) {
    localSessions.set(state.sessionId, structuredClone(state));
  }
}

class SupabaseSessionStore implements SessionStore {
  private readonly url: string;
  private readonly serviceRoleKey: string;

  constructor(url: string, serviceRoleKey: string) {
    this.url = url;
    this.serviceRoleKey = serviceRoleKey;
  }

  private get headers() {
    return {
      apikey: this.serviceRoleKey,
      Authorization: `Bearer ${this.serviceRoleKey}`,
      'Content-Type': 'application/json',
    };
  }

  async get(sessionId: string): Promise<SessionState | null> {
    const url = `${this.url}/rest/v1/interview_sessions?session_id=eq.${encodeURIComponent(sessionId)}&select=state&limit=1`;
    let response: Response;
    try {
      response = await fetch(url, { headers: this.headers });
    } catch {
      throw new StorageError('Unable to reach session storage.');
    }
    if (!response.ok) throw new StorageError('Unable to read interview session.');

    const rows = await response.json() as Array<{ state: SessionState }>;
    return rows[0]?.state ?? null;
  }

  async save(state: SessionState): Promise<void> {
    let response: Response;
    try {
      response = await fetch(`${this.url}/rest/v1/interview_sessions`, {
        method: 'POST',
        headers: {
          ...this.headers,
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({
          session_id: state.sessionId,
          state,
          updated_at: new Date().toISOString(),
        }),
      });
    } catch {
      throw new StorageError('Unable to reach session storage.');
    }
    if (!response.ok) throw new StorageError('Unable to save interview session.');
  }
}

export function getSessionStore(): SessionStore {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serviceRoleKey) return new SupabaseSessionStore(url, serviceRoleKey);

  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  if (isProduction) {
    throw new StorageError('Production session storage is not configured.');
  }

  // Development-only fallback. State is process-local and may disappear between restarts.
  return new LocalDevelopmentSessionStore();
}
