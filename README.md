# BUEPT-APP

BUEPT-APP is a React Native + React Native Web preparation workspace for university English proficiency study. The primary edition targets **Boğaziçi University BUSEPT**; a separately built **ODTÜ / METU EPE** edition shares the same product architecture while keeping exam rules and branding isolated at build time.

## BUEPT V2 product model

The V2 shell is intentionally small:

- **Today** — readiness, momentum and the next useful tasks.
- **Practice** — Reading, Listening, Writing, Grammar and Vocabulary.
- **Mock** — exam-bank entry, quick mocks, AI-generated mocks and history.
- **Progress** — skill trends, mock signal, history and learning record.
- **Profile** — account, privacy, AI access and advanced settings.

The core BUSEPT scored experience is centered on **Listening, Reading and Writing**. Grammar and vocabulary support those skills. Speaking remains available as additional language practice and is not represented as an official scored BUSEPT section.

V2 uses a clean light canvas by default and explicit real-campus photography on editorial surfaces. The web and native apps share the same information architecture and design system while retaining platform-appropriate navigation and interaction behavior.

## AI architecture

There are two explicit AI modes. The app never silently switches to another provider.

### Hosted BUEPT AI

Hosted mode is the default. Client applications call the BUEPT API, and provider credentials remain on the server.

Supported server providers are selected with environment configuration:

- `BUEPT_AI_PROVIDER=gemini` with `GEMINI_API_KEY`
- `BUEPT_AI_PROVIDER=openai` with `OPENAI_API_KEY`
- `BUEPT_AI_PROVIDER=anthropic` with `ANTHROPIC_API_KEY`

Optional model overrides:

- `BUEPT_GEMINI_MODEL`
- `BUEPT_OPENAI_MODEL`
- `BUEPT_ANTHROPIC_MODEL`

Hosted AI and search endpoints apply request-size limits and per-client rate limits. Tune them with:

- `BUEPT_AI_RATE_LIMIT_PER_MINUTE`
- `BUEPT_SEARCH_RATE_LIMIT_PER_MINUTE`
- `BUEPT_AI_TIMEOUT_MS`

### BYOK / local mode

A user may explicitly select Gemini, OpenAI, Claude/Anthropic or Ollama in **Profile → AI access**.

Provider credentials are session-only: normal app persistence deliberately removes API keys. BYOK requests go only to the provider the user selected. Ollama is supported for local inference; its endpoint and model are user-configurable.

## Local profile and privacy

This release uses a local learning profile, not cloud account authentication.

- The app does **not** collect or store a local password.
- Legacy plaintext password fields are removed during profile hydration.
- Learning history, vocabulary and progress remain local by default.
- Vocabulary cloud sync is disabled until authenticated user-scoped isolation exists.
- The app must not be described as having secure cloud accounts until real server-side authentication is implemented.

## Backend

The canonical backend lives in:

- `server/app.js` — request routing, CORS, validation, rate limiting and search.
- `server/providerRouter.js` — hosted AI provider routing.
- `web-api-server.js` — local Node HTTP adapter.
- `api/index.js` — Vercel adapter.
- `netlify/functions/api.js` — Netlify adapter.

Useful endpoints:

- `GET /api/health`
- `GET /api/version`
- `POST /api/ai/chat`
- `GET /api/search?q=...`

Cloud vocabulary sync endpoints intentionally return `SYNC_DISABLED`.

## Development

Requirements:

- Node.js 20+
- Xcode for iOS development
- Android Studio / Android SDK for Android development

Install dependencies:

```bash
npm ci
```

Start Metro:

```bash
npm start
```

Run native apps:

```bash
npm run ios
npm run android
```

Start React Native Web:

```bash
npm run web:rnw:start
```

Start the local API:

```bash
npm run api:start
```

## Production builds

BUEPT web:

```bash
npm run web:rnw:build:root
```

ODTÜ web:

```bash
npm run web:rnw:build:odtu
```

Both editions:

```bash
npm run web:rnw:build:all
```

Set `BUEPT_API_BASE_URL` when the web UI and API are deployed on different origins. `BUEPT_ALLOWED_ORIGINS` accepts a comma-separated list of allowed browser origins for the API.

## Quality gates

Run the same consolidated gate used for V2 development:

```bash
npm run ci:v2
```

The pull-request workflow separately verifies:

1. production dependency audit for critical vulnerabilities,
2. backend syntax,
3. backend contract self-test,
4. lint,
5. unit tests,
6. BUEPT production web build,
7. ODTÜ production web build.

The simulator smoke configuration is also locked to the five-area V2 navigation contract by unit tests.

## Security release requirement

A provider credential was present in older Git history. Removing it from current source does **not** revoke it. Before deploying V2, revoke/rotate that credential at the provider and configure the replacement only as a server-side deployment secret.

Never commit provider credentials to this repository.

## License

This project is an independent educational preparation tool. It is not an official service of Boğaziçi University, ODTÜ/METU, YADYÖK or either university's School of Foreign Languages.
