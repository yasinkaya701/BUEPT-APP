const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const HOST = '0.0.0.0';
const PORT = process.env.PORT ? Number(process.env.PORT) : 8088;
const ROOT = __dirname;

const APK_FILES = {
  debug: path.join(ROOT, 'BUEPTApp', 'BUEPT-App-for-Julide-Ozturk-debug.apk'),
  release: path.join(ROOT, 'BUEPTApp', 'BUEPT-App-for-Julide-Ozturk-release.apk'),
};

function sendJson(res, code, payload) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(payload, null, 2));
}

function sendFile(res, filePath, contentType) {
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    sendJson(res, 500, { ok: false, error: 'FILE_READ_ERROR' });
  });
  res.writeHead(200, { 'Content-Type': contentType });
  stream.pipe(res);
}

function sha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

async function getApkMeta(kind) {
  const filePath = APK_FILES[kind];
  if (!filePath || !fs.existsSync(filePath)) return null;
  const stat = fs.statSync(filePath);
  const checksum = await sha256(filePath);
  return {
    kind,
    fileName: path.basename(filePath),
    bytes: stat.size,
    sha256: checksum,
    downloadUrl: `/download/${kind}`,
  };
}

function htmlPage() {
  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>BUEPT App API</title>
  <style>
    body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; margin: 24px; background:#0b1020; color:#e8edff; }
    .box { max-width: 760px; margin: 0 auto; background: #141b34; border: 1px solid #263157; border-radius: 14px; padding: 20px; }
    h1 { margin: 0 0 12px; }
    a.btn { display:inline-block; margin:8px 8px 0 0; padding:10px 14px; border-radius:10px; text-decoration:none; color:#0b1020; background:#7dd3fc; font-weight:700; }
    code { background:#0f1630; padding:2px 6px; border-radius:6px; }
    pre { white-space: pre-wrap; background:#0f1630; padding:12px; border-radius:10px; border:1px solid #263157; }
  </style>
</head>
<body>
  <div class="box">
    <h1>BUEPT App API</h1>
    <p>API endpointleri:</p>
    <ul>
      <li><code>/api/status</code></li>
      <li><code>/api/apks</code></li>
      <li><code>/download/release</code></li>
      <li><code>/download/debug</code></li>
    </ul>
    <a class="btn" href="/download/release">Release APK indir</a>
    <a class="btn" href="/download/debug">Debug APK indir</a>
    <p id="meta"></p>
    <pre id="json">Yukleniyor...</pre>
  </div>
  <script>
    fetch('/api/apks').then(r => r.json()).then(d => {
      document.getElementById('json').textContent = JSON.stringify(d, null, 2);
    }).catch(() => {
      document.getElementById('json').textContent = 'API okunamadi.';
    });
  </script>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url || '', true);
  const pathname = parsed.pathname || '/';

  if (pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlPage());
    return;
  }

  if (pathname === '/api/status') {
    sendJson(res, 200, {
      ok: true,
      service: 'buept-web-api',
      now: new Date().toISOString(),
    });
    return;
  }

  if (pathname === '/api/apks') {
    const [release, debug] = await Promise.all([getApkMeta('release'), getApkMeta('debug')]);
    sendJson(res, 200, {
      ok: true,
      app: 'BUEPTApp',
      apks: [release, debug].filter(Boolean),
    });
    return;
  }

  if (pathname === '/download/release' || pathname === '/download/debug') {
    const kind = pathname.endsWith('release') ? 'release' : 'debug';
    const filePath = APK_FILES[kind];
    if (!fs.existsSync(filePath)) {
      sendJson(res, 404, { ok: false, error: 'APK_NOT_FOUND', kind });
      return;
    }
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    sendFile(res, filePath, 'application/vnd.android.package-archive');
    return;
  }

  sendJson(res, 404, { ok: false, error: 'NOT_FOUND' });
});

server.listen(PORT, HOST, () => {
  console.log(`BUEPT web API running: http://${HOST}:${PORT}`);
});

