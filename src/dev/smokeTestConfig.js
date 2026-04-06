import readingTasks from '../../data/reading_tasks.json';
import grammarTasks from '../../data/grammar_tasks.json';
import testEnglishGrammarTasks from '../../data/test_english_grammar_tasks.json';

export const DEV_SMOKE_TEST_ENABLED = false;
export const DEV_SMOKE_TEST_STEP_DELAY_MS = 1400;
export const DEV_SMOKE_TEST_REPORT_KEY = '@buept_smoke_report_v1';

const firstReadingTaskId = readingTasks?.[0]?.id;
const firstGrammarTaskId = grammarTasks?.[0]?.id || testEnglishGrammarTasks?.[0]?.id;

export const DEV_SMOKE_TEST_STEPS = [
  { type: 'tab', screen: 'Home', label: 'Tab: Home' },
  { type: 'tab', screen: 'Reading', label: 'Tab: Reading' },
  {
    type: 'stack',
    name: 'ReadingDetail',
    params: { taskId: firstReadingTaskId },
    label: 'Reading Detail',
    enabled: Boolean(firstReadingTaskId),
    action: { target: 'ReadingDetail', type: 'answer_and_check' },
  },
  { type: 'tab', screen: 'Grammar', label: 'Tab: Grammar' },
  {
    type: 'stack',
    name: 'GrammarDetail',
    params: { taskId: firstGrammarTaskId },
    label: 'Grammar Detail',
    enabled: Boolean(firstGrammarTaskId),
    action: { target: 'GrammarDetail', type: 'answer_and_check' },
  },
  { type: 'tab', screen: 'Writing', label: 'Tab: Writing' },
  { type: 'tab', screen: 'Vocab', label: 'Tab: Vocab', action: { target: 'Vocab', type: 'dictionary_search', query: 'benefit' } },
  { type: 'stack', name: 'FlashcardHome', label: 'Flashcard Hub' },
  { type: 'stack', name: 'VocabFlashcard', params: { initialWords: [] }, label: 'Flashcard Session', backAfterMs: 700 },
  { type: 'stack', name: 'CreateFlashcardDeck', label: 'Create Flashcard Deck', backAfterMs: 700 },
  { type: 'stack', name: 'SynonymFinder', label: 'Synonym Finder', action: { target: 'SynonymFinder', type: 'search', word: 'significant' }, backAfterMs: 700 },
  { type: 'tab', screen: 'Listening', label: 'Tab: Listening' },
  { type: 'tab', screen: 'Speaking', label: 'Tab: Speaking' },
  { type: 'stack', name: 'AISpeakingPartner', label: 'AI Speaking Partner' },
  { type: 'stack', name: 'Mock', label: 'Mock Exam' },
  { type: 'stack', name: 'Exams', label: 'Exams' },
  { type: 'stack', name: 'PlacementTest', label: 'Placement Test' },
  { type: 'stack', name: 'BogaziciHub', label: 'Bogazici Hub' },
  { type: 'stack', name: 'DemoFeatures', label: 'Demo Features' },
].filter((step) => step.enabled !== false);
