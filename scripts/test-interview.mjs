import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'interview-agent-test-'));
const bundledHandler = join(temporaryDirectory, 'interview-api.mjs');
execFileSync(join(projectRoot, 'node_modules/.bin/esbuild'), [
  join(projectRoot, 'api/interview.ts'),
  '--bundle',
  '--platform=node',
  '--format=esm',
  `--outfile=${bundledHandler}`,
]);

const candidatesData = JSON.parse(readFileSync(join(projectRoot, 'data/raw/candidates_(1).json'), 'utf8'));
const curriculumData = JSON.parse(readFileSync(join(projectRoot, 'data/raw/curriculum.json'), 'utf8'));
const { default: handler } = await import(pathToFileURL(bundledHandler).href);

class TestResponse {
  statusCode = 200;
  body = undefined;

  status(code) {
    this.statusCode = code;
    return this;
  }

  setHeader() {}

  json(body) {
    this.body = body;
  }
}

async function request(body, method = 'POST') {
  const response = new TestResponse();
  await handler({ method, body }, response);
  return response;
}

function assertCurriculumQuestion(response) {
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.done, false);
  assert.ok(response.body.question);
  const day = curriculumData.days.find((entry) => entry.day === response.body.question.day);
  assert.ok(day, `Day ${response.body.question.day} must exist in the curriculum.`);
  assert.ok(day.objectives.some((objective) => response.body.reply.includes(objective)));
}

const originalEnvironment = {
  nodeEnv: process.env.NODE_ENV,
  vercelEnv: process.env.VERCEL_ENV,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
process.env.NODE_ENV = 'development';
delete process.env.VERCEL_ENV;

try {
  const sessionA = `test-a-${Date.now()}`;
  const sessionB = `test-b-${Date.now()}`;

  assert.equal((await request({ candidate: candidatesData.candidates[0] })).statusCode, 400);
  assert.equal((await request({ sessionId: 'missing-candidate' })).statusCode, 400);
  assert.equal((await request({ sessionId: 'unknown', message: 'answer' })).statusCode, 404);
  assert.equal((await request({ sessionId: 'unknown', message: '   ' })).statusCode, 400);

  const startA = await request({ sessionId: sessionA, candidate: candidatesData.candidates[0] });
  const startB = await request({ sessionId: sessionB, candidate: candidatesData.candidates[1] });
  assertCurriculumQuestion(startA);
  assertCurriculumQuestion(startB);
  assert.equal(startA.body.questionCount, 1);
  assert.equal(startB.body.questionCount, 1);

  const askedDays = [startA.body.question.day];
  let responseA = startA;
  for (let answerNumber = 1; answerNumber <= 8; answerNumber += 1) {
    responseA = await request({ sessionId: sessionA, message: `Answer ${answerNumber}` });
    if (answerNumber < 8) {
      assertCurriculumQuestion(responseA);
      askedDays.push(responseA.body.question.day);
      assert.equal(responseA.body.questionCount, answerNumber + 1);
    }
  }

  assert.equal(askedDays.length, 8);
  assert.ok(new Set(askedDays).size >= 4);
  assert.equal(responseA.statusCode, 200);
  assert.equal(responseA.body.reply, 'Interview completed.');
  assert.equal(responseA.body.done, true);
  assert.equal(responseA.body.questionCount, 8);
  assert.ok(responseA.body.coveredDays.length >= 4);
  assert.equal(typeof responseA.body.feedback.summary, 'string');
  assert.ok(Array.isArray(responseA.body.feedback.strengths));
  assert.ok(Array.isArray(responseA.body.feedback.gaps));
  assert.ok(Array.isArray(responseA.body.feedback.next));

  const continueB = await request({ sessionId: sessionB, message: 'Independent answer' });
  assertCurriculumQuestion(continueB);
  assert.equal(continueB.body.questionCount, 2);

  process.env.NODE_ENV = 'production';
  const storageFailure = await request({ sessionId: 'production-without-storage', candidate: candidatesData.candidates[0] });
  assert.equal(storageFailure.statusCode, 500);
  assert.deepEqual(storageFailure.body, { error: 'Production session storage is not configured.' });

  console.log('Interview API session tests passed.');
} finally {
  if (originalEnvironment.nodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalEnvironment.nodeEnv;
  if (originalEnvironment.vercelEnv === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = originalEnvironment.vercelEnv;
  if (originalEnvironment.supabaseUrl === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = originalEnvironment.supabaseUrl;
  if (originalEnvironment.supabaseKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = originalEnvironment.supabaseKey;
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
