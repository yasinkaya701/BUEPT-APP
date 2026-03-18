export function getAiSourceMeta(source = '') {
  const key = String(source || '').trim().toLowerCase();

  if (key === 'openai') {
    return {
      label: 'OpenAI Live',
      detail: 'Live model output with current backend generation.',
      tone: 'live',
    };
  }

  if (key === 'online' || key === 'api-ready' || key === 'online-ready' || key === 'ai-video-endpoint') {
    return {
      label: 'Live Endpoint',
      detail: 'Online endpoint available for live AI generation.',
      tone: 'live',
    };
  }

  if (key === 'hybrid') {
    return {
      label: 'Hybrid Mode',
      detail: 'Uses live AI when possible and falls back to local logic when needed.',
      tone: 'hybrid',
    };
  }

  if (key.includes('fallback')) {
    return {
      label: 'Fallback Engine',
      detail: 'Live generation was unavailable, so a local fallback built the result.',
      tone: 'warn',
    };
  }

  if (key.startsWith('local') || key === 'offline') {
    return {
      label: 'Local Engine',
      detail: 'Runs fully on-device or on the local app backend.',
      tone: 'local',
    };
  }

  return {
    label: source ? source : 'AI Engine',
    detail: 'AI generation source detected.',
    tone: 'local',
  };
}
