import test from 'node:test';
import assert from 'node:assert/strict';
import { mapWithConcurrency, fetchWithRetry, retryAsync } from '../src/lib/helpers.js';

test('mapWithConcurrency never exceeds the limit and keeps order', async () => {
  let active = 0;
  let peak = 0;
  const out = await mapWithConcurrency([1, 2, 3, 4, 5, 6, 7], 2, async (n) => {
    active++;
    peak = Math.max(peak, active);
    await new Promise((r) => setTimeout(r, 5));
    active--;
    return n * 2;
  });
  assert.deepEqual(out, [2, 4, 6, 8, 10, 12, 14]);
  assert.equal(peak, 2);
});

test('fetchWithRetry retries 429 then succeeds', async () => {
  let calls = 0;
  const fakeFetch = async () => {
    calls++;
    return calls < 3 ? { ok: false, status: 429 } : { ok: true, status: 200 };
  };
  const res = await fetchWithRetry('x', {}, { retries: 3, baseDelayMs: 1, fetchImpl: fakeFetch });
  assert.equal(res.ok, true);
  assert.equal(calls, 3);
});

test('fetchWithRetry returns last 429 after exhausting retries', async () => {
  let calls = 0;
  const fakeFetch = async () => { calls++; return { ok: false, status: 429 }; };
  const res = await fetchWithRetry('x', {}, { retries: 2, baseDelayMs: 1, fetchImpl: fakeFetch });
  assert.equal(res.status, 429);
  assert.equal(calls, 3);
});

test('fetchWithRetry does not retry a 400', async () => {
  let calls = 0;
  const fakeFetch = async () => { calls++; return { ok: false, status: 400 }; };
  await fetchWithRetry('x', {}, { retries: 3, baseDelayMs: 1, fetchImpl: fakeFetch });
  assert.equal(calls, 1);
});

test('fetchWithRetry retries when fetch throws (e.g. CORS-blocked n8n error)', async () => {
  let calls = 0;
  const fakeFetch = async () => {
    calls++;
    if (calls < 3) throw new TypeError('Failed to fetch');
    return { ok: true, status: 200 };
  };
  const res = await fetchWithRetry('x', {}, { retries: 3, baseDelayMs: 1, fetchImpl: fakeFetch });
  assert.equal(res.ok, true);
  assert.equal(calls, 3);
});

test('fetchWithRetry rethrows after exhausting retries on thrown errors', async () => {
  const fakeFetch = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(
    fetchWithRetry('x', {}, { retries: 1, baseDelayMs: 1, fetchImpl: fakeFetch }),
    /Failed to fetch/
  );
});

test('retryAsync retries when the callback throws (e.g. bad JSON body)', async () => {
  let calls = 0;
  const out = await retryAsync(async () => {
    calls++;
    if (calls < 2) throw new SyntaxError('Unexpected end of JSON input');
    return 'ok';
  }, { retries: 3, baseDelayMs: 1 });
  assert.equal(out, 'ok');
  assert.equal(calls, 2);
});
