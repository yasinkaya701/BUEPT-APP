/**
 * Smart Web Search Utility for BUEPT AI
 * - On web platform: uses local server proxy (/api/search) to bypass CORS
 * - On mobile/native: calls DuckDuckGo API directly
 */

import { Platform } from 'react-native';

const WEB_PROXY_URL = 'http://localhost:8088/api/search';
const DUCKDUCKGO_URL = 'https://api.duckduckgo.com/';

export async function performWebSearch(query) {
  const safeQuery = String(query || '').trim();
  if (!safeQuery) return 'No query provided.';

  try {
    let context = '';

    if (Platform.OS === 'web') {
      // Use server-side proxy to avoid CORS on web
      const res = await fetch(`${WEB_PROXY_URL}?q=${encodeURIComponent(safeQuery)}`);
      if (res.ok) {
        const data = await res.json();
        context = data.context || '';
      }
    } else {
      // Mobile: direct DuckDuckGo call (no CORS restriction on native)
      const res = await fetch(`${DUCKDUCKGO_URL}?q=${encodeURIComponent(safeQuery)}&format=json&no_html=1&skip_disambig=1`);
      const data = await res.json();
      if (data.AbstractText) context += `Abstract: ${data.AbstractText}\n`;
      if (data.Answer) context += `Answer: ${data.Answer}\n`;
      if (Array.isArray(data.RelatedTopics) && data.RelatedTopics.length > 0) {
        context += 'Related:\n';
        data.RelatedTopics.slice(0, 4).forEach(topic => {
          if (topic.Text) context += `- ${topic.Text}\n`;
        });
      }
    }

    if (!context) {
      return 'No specific real-time results found for this query, but use your internal knowledge to provide the most recent information possible.';
    }

    return `REAL-TIME WEB SEARCH RESULTS:\n${context.trim()}`;
  } catch (error) {
    console.warn('Web search failed:', error);
    return 'The search system is currently busy. Answer using your best internal knowledge.';
  }
}
