/**
 * Central AI message formatting utilities.
 * All AI providers (Ollama, OpenAI, Gemini) use these helpers to ensure
 * consistent role mapping, deduplication, and clean message arrays.
 */

/**
 * Formats a chat history array from the app's internal format
 * (role: 'user' | 'ai', text: string)
 * into the standard API format
 * (role: 'user' | 'assistant', content: string)
 *
 * @param {Array} history - Array of { role, text } or { role, content } messages
 * @returns {Array} - Array of { role: 'user'|'assistant', content: string }
 */
export function formatMessagesForAI(history = []) {
  if (!Array.isArray(history)) return [];

  return history
    .map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: String(m.text || m.content || '').trim(),
    }))
    .filter(m => m.content.length > 0); // Remove empty messages
}

/**
 * Appends a new user message to a formatted history array,
 * preventing duplicates if the last message is identical.
 *
 * @param {Array} formattedHistory - Already formatted messages (from formatMessagesForAI)
 * @param {string} newMessage - The new user message to append
 * @returns {Array} - Full messages array ready to send to AI
 */
export function appendUserMessage(formattedHistory = [], newMessage = '') {
  const msg = String(newMessage || '').trim();
  if (!msg) return formattedHistory;

  const last = formattedHistory[formattedHistory.length - 1];
  // Don't duplicate if the last message is already this exact content
  if (last && last.role === 'user' && last.content === msg) {
    return formattedHistory;
  }

  return [...formattedHistory, { role: 'user', content: msg }];
}

/**
 * Validates that a messages array alternates roles correctly (user/assistant/user...)
 * and fixes any consecutive same-role messages by merging content.
 *
 * @param {Array} messages - Array of { role, content }
 * @returns {Array} - Cleaned and validated messages
 */
export function sanitizeMessageRoles(messages = []) {
  if (!Array.isArray(messages) || messages.length === 0) return [];

  const result = [];
  for (const msg of messages) {
    const role = msg.role === 'assistant' ? 'assistant' : 'user';
    const content = String(msg.content || '').trim();
    if (!content) continue;

    const last = result[result.length - 1];
    if (last && last.role === role) {
      // Merge consecutive same-role messages
      last.content += '\n' + content;
    } else {
      result.push({ role, content });
    }
  }
  return result;
}

/**
 * Full pipeline: format history + append new message + sanitize roles.
 * This is the recommended function to use before any AI API call.
 *
 * @param {Array} history - Raw history from app state
 * @param {string} newMessage - New user message
 * @returns {Array} - Clean, API-ready messages array
 */
export function buildAIMessages(history = [], newMessage = '') {
  const formatted = formatMessagesForAI(history);
  const withNew = appendUserMessage(formatted, newMessage);
  return sanitizeMessageRoles(withNew);
}
