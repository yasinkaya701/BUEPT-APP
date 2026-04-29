/**
 * Unit tests for vocabHelpers.js
 */

import {
  escapeRegExp,
  seededShuffle,
  normalizeWordKey,
  getLevelWeight,
  normalizeSentence,
  hasConnector,
  buildVocabChallenge,
  formatTopicLabel,
} from '../src/utils/vocabHelpers';

// Mock dependencies
jest.mock('../src/utils/dictionary', () => ({
  buildFallbackEntry: jest.fn(),
  getDictionaryCount: jest.fn(() => 0),
  getDictionarySample: jest.fn(() => []),
  getDictionarySlice: jest.fn(() => []),
  getVerbForms: jest.fn(() => null),
  getWordEntry: jest.fn(() => null),
  getWordFamily: jest.fn(() => null),
}));

jest.mock('../src/utils/ttsEnglish', () => ({
  speakEnglish: jest.fn(),
}));

describe('escapeRegExp', () => {
  it('escapes special regex characters', () => {
    expect(escapeRegExp('a.b*c')).toBe('a\\.b\\*c');
  });

  it('handles empty string', () => {
    expect(escapeRegExp('')).toBe('');
  });
});

describe('normalizeWordKey', () => {
  it('trims and lowercases', () => {
    expect(normalizeWordKey('  Hello World  ')).toBe('hello world');
  });
  it('returns empty string for null/undefined', () => {
    expect(normalizeWordKey(null)).toBe('');
    expect(normalizeWordKey(undefined)).toBe('');
  });
});

describe('getLevelWeight', () => {
  it('returns correct weights', () => {
    expect(getLevelWeight('A1')).toBe(1);
    expect(getLevelWeight('B2')).toBe(4);
    expect(getLevelWeight('C1')).toBe(5);
    expect(getLevelWeight('Z1')).toBe(0);
  });

  it('is case-insensitive', () => {
    expect(getLevelWeight('b1')).toBe(3);
  });
});

describe('normalizeSentence', () => {
  it('capitalizes first letter and adds period', () => {
    expect(normalizeSentence('hello world')).toBe('Hello world.');
  });

  it('does not add period if punctuation exists', () => {
    expect(normalizeSentence('hello!')).toBe('Hello!');
  });

  it('trims whitespace', () => {
    expect(normalizeSentence('  hello  ')).toBe('Hello.');
  });

  it('returns empty string for empty input', () => {
    expect(normalizeSentence('')).toBe('');
  });
});

describe('hasConnector', () => {
  it('returns true when connector is present', () => {
    expect(hasConnector('However, this is fine.')).toBe(true);
    expect(hasConnector('For example, this works.')).toBe(true);
    expect(hasConnector('Moreover, we see that')).toBe(true);
  });

  it('returns false when no connector', () => {
    expect(hasConnector('This is a simple sentence.')).toBe(false);
  });
});

describe('formatTopicLabel', () => {
  it('capitalizes each word', () => {
    expect(formatTopicLabel('academic_writing')).toBe('Academic Writing');
    expect(formatTopicLabel('test-english')).toBe('Test English');
  });

  it('handles "all" case', () => {
    expect(formatTopicLabel('all')).toBe('All');
  });

  it('returns Unknown for empty string', () => {
    expect(formatTopicLabel('')).toBe('Unknown');
  });
});

describe('seededShuffle', () => {
  it('returns same order for same seed', () => {
    const list = ['a', 'b', 'c', 'd', 'e'];
    const r1 = seededShuffle(list, 42);
    const r2 = seededShuffle(list, 42);
    expect(r1).toEqual(r2);
  });

  it('returns different order for different seed (usually)', () => {
    const list = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const r1 = seededShuffle(list, 1);
    const r2 = seededShuffle(list, 999);
    expect(r1).not.toEqual(r2);
  });

  it('does not mutate original list', () => {
    const list = ['a', 'b', 'c'];
    seededShuffle(list, 1);
    expect(list).toEqual(['a', 'b', 'c']);
  });

  it('handles empty list', () => {
    expect(seededShuffle([], 1)).toEqual([]);
  });
});

describe('buildVocabChallenge', () => {
  it('returns null for pool with less than 4 items', () => {
    const pool = [
      { word: 'a', def: 'def a' },
      { word: 'b', def: 'def b' },
    ];
    expect(buildVocabChallenge(pool, 1)).toBeNull();
  });

  it('returns a challenge object for valid pool', () => {
    const pool = [
      { word: 'apple', def: 'a fruit' },
      { word: 'bank', def: 'financial institution' },
      { word: 'car', def: 'a vehicle' },
      { word: 'dog', def: 'a pet' },
      { word: 'egg', def: 'food item' },
    ];
    const result = buildVocabChallenge(pool, 1);
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('word');
    expect(result).toHaveProperty('options');
    expect(result).toHaveProperty('correctIndex');
    expect(result.options).toHaveLength(4);
    expect(result.correctIndex).toBeGreaterThanOrEqual(0);
  });

  it('is deterministic with same seed', () => {
    const pool = [
      { word: 'apple', def: 'a fruit' },
      { word: 'bank', def: 'financial institution' },
      { word: 'car', def: 'a vehicle' },
      { word: 'dog', def: 'a pet' },
      { word: 'egg', def: 'food item' },
    ];
    const r1 = buildVocabChallenge(pool, 42);
    const r2 = buildVocabChallenge(pool, 42);
    expect(r1).toEqual(r2);
  });
});
