'use strict';

const http = require('http');
const assert = require('assert');
const { requestHandler } = require('./app');

async function main() {
  const server = http.createServer((req, res) => {
    Promise.resolve(requestHandler(req, res)).catch((error) => {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: error?.message || 'selftest failure' }));
    });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;

  try {
    const health = await fetch(`${base}/api/health`);
    assert.strictEqual(health.status, 200);
    const healthJson = await health.json();
    assert.strictEqual(healthJson.status, 'ok');
    assert.strictEqual(healthJson.syncEnabled, false);
    assert.ok(healthJson.requestId);

    const version = await fetch(`${base}/api/version`);
    assert.strictEqual(version.status, 200);

    const missingMessages = await fetch(`${base}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] }),
    });
    assert.strictEqual(missingMessages.status, 400);
    assert.strictEqual((await missingMessages.json()).error, 'INVALID_AI_REQUEST');

    const sync = await fetch(`${base}/api/sync/status`);
    assert.strictEqual(sync.status, 503);
    assert.strictEqual((await sync.json()).error, 'SYNC_DISABLED');

    const notFound = await fetch(`${base}/does-not-exist`);
    assert.strictEqual(notFound.status, 404);

    const malformed = await fetch(`${base}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{bad-json',
    });
    assert.strictEqual(malformed.status, 400);
    assert.strictEqual((await malformed.json()).error, 'INVALID_JSON');

    process.stdout.write('BUEPT API self-test passed.\n');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
