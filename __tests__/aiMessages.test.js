/**
 * Unit tests for aiMessages.js — AI message formatting utilities
 */

import { formatMessagesForAI, appendUserMessage, sanitizeMessageRoles, buildAIMessages } from '../src/utils/aiMessages';

describe('formatMessagesForAI', () => {
  it('converts "ai" role to "assistant"', () => {
    const input = [{ role: 'ai', text: 'Hello there!' }];
    const result = formatMessagesForAI(input);
    expect(result[0].role).toBe('assistant');
    expect(result[0].content).toBe('Hello there!');
  });

  it('keeps "user" role as is', () => {
    const input = [{ role: 'user', text: 'Hi' }];
    const result = formatMessagesForAI(input);
    expect(result[0].role).toBe('user');
  });

  it('uses "content" field if "text" is absent', () => {
    const input = [{ role: 'user', content: 'Test content' }];
    const result = formatMessagesForAI(input);
    expect(result[0].content).toBe('Test content');
  });

  it('filters out empty messages', () => {
    const input = [
      { role: 'user', text: '' },
      { role: 'ai', text: 'Response' },
    ];
    const result = formatMessagesForAI(input);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('Response');
  });

  it('returns empty array for non-array input', () => {
    expect(formatMessagesForAI(null)).toEqual([]);
    expect(formatMessagesForAI(undefined)).toEqual([]);
    expect(formatMessagesForAI('bad')).toEqual([]);
  });
});

describe('appendUserMessage', () => {
  it('appends new message to history', () => {
    const history = [{ role: 'assistant', content: 'Hello' }];
    const result = appendUserMessage(history, 'How are you?');
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({ role: 'user', content: 'How are you?' });
  });

  it('does not duplicate if last message is identical', () => {
    const history = [{ role: 'user', content: 'Same message' }];
    const result = appendUserMessage(history, 'Same message');
    expect(result).toHaveLength(1);
  });

  it('ignores empty new messages', () => {
    const history = [{ role: 'user', content: 'Hi' }];
    const result = appendUserMessage(history, '');
    expect(result).toHaveLength(1);
  });
});

describe('sanitizeMessageRoles', () => {
  it('merges consecutive same-role messages', () => {
    const input = [
      { role: 'user', content: 'First' },
      { role: 'user', content: 'Second' },
      { role: 'assistant', content: 'Response' },
    ];
    const result = sanitizeMessageRoles(input);
    expect(result).toHaveLength(2);
    expect(result[0].content).toBe('First\nSecond');
  });

  it('removes empty content messages', () => {
    const input = [
      { role: 'user', content: '' },
      { role: 'assistant', content: 'Reply' },
    ];
    const result = sanitizeMessageRoles(input);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('Reply');
  });
});

describe('buildAIMessages — full pipeline', () => {
  it('formats history and appends new message', () => {
    const history = [
      { role: 'user', text: 'Hello' },
      { role: 'ai', text: 'Hi there!' },
    ];
    const result = buildAIMessages(history, 'What is BUEPT?');
    expect(result).toHaveLength(3);
    expect(result[1].role).toBe('assistant');
    expect(result[2]).toEqual({ role: 'user', content: 'What is BUEPT?' });
  });

  it('handles empty history gracefully', () => {
    const result = buildAIMessages([], 'First message');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ role: 'user', content: 'First message' });
  });

  it('handles null/undefined history gracefully', () => {
    const result = buildAIMessages(null, 'Hello');
    expect(result).toHaveLength(1);
  });
});
