import type { ApiRequest, Candidate } from '../src/types.js';
import { continueSession, initializeSession } from '../server/interviewEngine.js';
import { getGeminiClient } from '../server/gemini.js';
import { getSessionStore, StorageError } from '../server/sessionStore.js';

interface RequestLike {
  method?: string;
  body?: unknown;
}

interface ResponseLike {
  status(code: number): ResponseLike;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
}

function parseBody(body: unknown): unknown {
  if (typeof body !== 'string') return body;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function isCandidate(value: unknown): value is Candidate {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Candidate>;
  return Boolean(
    candidate.member
      && typeof candidate.member.id === 'string'
      && typeof candidate.member.name === 'string'
      && typeof candidate.member.jobRole === 'string'
      && Array.isArray(candidate.missions)
      && candidate.signals
      && typeof candidate.signals.missionsFirstTry === 'number',
  );
}

function error(res: ResponseLike, status: number, message: string) {
  return res.status(status).json({ error: message });
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return error(res, 405, 'Method not allowed. Use POST.');

  const body = parseBody(req.body);
  if (!body || typeof body !== 'object') return error(res, 400, 'Request body must be valid JSON.');

  const { sessionId, candidate, message } = body as Partial<ApiRequest>;
  if (typeof sessionId !== 'string' || !sessionId.trim()) {
    return error(res, 400, 'sessionId is required.');
  }

  try {
    const store = getSessionStore();

    if (candidate !== undefined) {
      if (!isCandidate(candidate)) return error(res, 400, 'A valid candidate is required to start an interview.');
      const initialized = initializeSession(sessionId, candidate);
      await store.save(initialized.state);
      return res.status(200).json(initialized.response);
    }

    if (message === undefined) return error(res, 400, 'A start request requires candidate data.');
    if (typeof message !== 'string' || !message.trim()) return error(res, 400, 'message must not be blank.');

    const existing = await store.get(sessionId);
    if (!existing) return error(res, 404, 'Interview session not found.');
    if (existing.done) return error(res, 409, 'Interview session is already complete.');

    const continued = await continueSession(existing, message.trim(), getGeminiClient());
    await store.save(continued.state);
    return res.status(200).json(continued.response);
  } catch (caught) {
    if (caught instanceof StorageError) return error(res, 500, caught.message);
    return error(res, 500, 'Unable to process the interview request.');
  }
}
