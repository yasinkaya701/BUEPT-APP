import { getDictionaryCount, getDictionarySample } from './dictionary';
import { speakEnglish } from './ttsEnglish';

import { resolveApiEndpoint } from './runtimeApi';

const HEALTH_ENDPOINT = resolveApiEndpoint('BUEPT_HEALTH_API_URL', '/api/health');

async function checkApiHealth() {
  if (!HEALTH_ENDPOINT) throw new Error('API endpoint not configured');
  const res = await fetch(HEALTH_ENDPOINT);
  if (!res.ok) throw new Error(`API health failed (${res.status})`);
  const data = await res.json().catch(() => ({}));
  return data?.status || 'ok';
}

async function checkDictionary() {
  const count = getDictionaryCount();
  const sample = getDictionarySample(5);
  if (!count || !sample?.length) throw new Error('Dictionary empty');
  return `${count} entries`;
}

async function checkTts() {
  await speakEnglish('BUEPT diagnostic check', { rate: 0.48 });
  return 'TTS ok';
}

export async function runDiagnostics() {
  const checks = [
    { id: 'api', label: 'API /health', fn: checkApiHealth },
    { id: 'dict', label: 'Dictionary load', fn: checkDictionary },
    { id: 'tts', label: 'Text-to-speech', fn: checkTts },
  ];

  const results = [];
  for (const item of checks) {
    try {
      const detail = await item.fn();
      results.push({ id: item.id, label: item.label, ok: true, detail });
    } catch (error) {
      results.push({ id: item.id, label: item.label, ok: false, detail: String(error?.message || error) });
    }
  }
  return results;
}
