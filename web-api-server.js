'use strict';

const http = require('http');
const { requestHandler } = require('./server/app');

const PORT = Number(process.env.PORT || process.env.BUEPT_API_PORT || 8088);

if (require.main === module) {
  const server = http.createServer((req, res) => {
    Promise.resolve(requestHandler(req, res)).catch(() => {
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      if (!res.writableEnded) res.end(JSON.stringify({ error: 'INTERNAL_ERROR' }));
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    // Intentionally no secrets/config values in logs.
    console.log(`BUEPT API listening on http://0.0.0.0:${PORT}`);
  });
}

module.exports = {
  requestHandler,
};
