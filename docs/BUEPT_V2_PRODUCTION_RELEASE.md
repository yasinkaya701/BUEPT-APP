# BUEPT V2 Production Release Checklist

## Release scope

Branch: `feat/buept-v2-production-rebuild`

Primary PR: #1 — BUEPT V2 production hardening and visual product rebuild.

The release is considered repository-ready only when all automated V2 quality gates pass on the final PR head.

## Product acceptance

- [x] Five-area shell: Today / Practice / Mock / Progress / Profile.
- [x] Desktop rail and mobile tab bar use the same primary information architecture.
- [x] BUEPT and ODTÜ branding are selected from the active build edition.
- [x] Real campus imagery is explicit and variant-safe.
- [x] Today is a decision surface rather than a feature directory.
- [x] Core skills enter through a shared V2 overview anatomy.
- [x] Vocabulary has a focused primary overview; the legacy large workspace is demoted to Vocabulary Lab.
- [x] Mock exam has a focused exam mode and unified answer grading.
- [x] Settings and AI access are student-facing; developer diagnostics are secondary.
- [x] Onboarding uses a five-step visual setup and is completed only after successful profile entry.

## Data and security acceptance

- [x] No committed client AI key is used by current source.
- [x] BYOK keys are not persisted by normal app storage.
- [x] AI provider selection has no silent cross-provider fallback.
- [x] Local profiles do not collect/store passwords.
- [x] Legacy stored local password fields are stripped on hydration.
- [x] Shared unauthenticated vocabulary cloud sync is disabled.
- [x] Hosted AI request sizes are bounded.
- [x] Hosted AI/search endpoints have per-client rate limiting.
- [x] Search proxy is routed through the configured API base rather than localhost.
- [x] Backend health/version endpoints exist.
- [ ] **External deployment action:** revoke/rotate the provider key exposed in older Git history.

That last item cannot be completed by a source-code change. A leaked credential remains compromised even after it is removed from the current branch.

## Required deployment configuration

At minimum:

```text
BUEPT_API_BASE_URL=<public API origin, when UI/API are separate>
BUEPT_ALLOWED_ORIGINS=<comma-separated web origins>
BUEPT_AI_PROVIDER=gemini|openai|anthropic
GEMINI_API_KEY=<server secret>          # when Gemini is selected
OPENAI_API_KEY=<server secret>          # when OpenAI is selected
ANTHROPIC_API_KEY=<server secret>       # when Anthropic is selected
```

Recommended optional controls:

```text
BUEPT_AI_RATE_LIMIT_PER_MINUTE=20
BUEPT_SEARCH_RATE_LIMIT_PER_MINUTE=30
BUEPT_AI_TIMEOUT_MS=22000
```

Do not expose provider secrets through `BUEPT_API_BASE_URL`, webpack DefinePlugin values, public runtime config, GitHub Pages variables or client storage.

## Automated release gate

The PR workflow must pass all of the following on the final SHA:

- Production dependency audit
- Backend syntax check
- Backend self-test
- ESLint
- Jest
- BUEPT web production build
- ODTÜ web production build

Local equivalent:

```bash
npm run ci:v2
```

## Post-merge deployment smoke

After deployment, verify:

1. `/api/health` reports `status: ok`.
2. Landing → Onboarding → local profile → Today works on a fresh browser profile.
3. Existing local profile → Continue → Today works.
4. Today → Practice → each core skill overview opens.
5. Mock → exam bank → focused exam → submit yields consistent aggregate/per-question grading.
6. Profile → AI access shows Hosted by default.
7. BYOK provider errors do not switch to another provider.
8. ODTÜ build contains no Boğaziçi branding in splash, login, navigation rail or landing.
9. Mobile tab bar contains exactly five primary areas.
10. Global chat is hidden during focused exam mode.

## Deliberate non-features in V2

- No cloud password/account authentication.
- No cloud vocabulary sync without user-scoped authentication.
- No claim that Speaking is an official scored BUSEPT section.
- No implicit demo login.
- No silent AI provider fallback.
