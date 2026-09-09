import readingTasks from '../../data/reading_tasks.json';
import grammarTasks from '../../data/grammar_tasks.json';
import testEnglishGrammarTasks from '../../data/test_english_grammar_tasks.json';

export const DEV_SMOKE_TEST_ENABLED = false;
export const DEV_SMOKE_TEST_STEP_DELAY_MS = 1400;
export const DEV_SMOKE_TEST_REPORT_KEY = '@buept_smoke_report_v2';

const firstReadingTaskId = readingTasks?.[0]?.id;
const firstGrammarTaskId = grammarTasks?.[0]?.id || testEnglishGrammarTasks?.[0]?.id;

export const V2_TAB_ROUTES = ['Today', 'Practice', 'MockHub', 'ProgressHub', 'Profile'];

export const DEV_SMOKE_TEST_STEPS = [
  { type: 'tab', screen: 'Today', label: 'Tab: Today' },
  { type: 'tab', screen: 'Practice', label: 'Tab: Practice' },
  { type: 'stack', name: 'Reading', label: 'Reading Overview' },
  {
    type: 'stack',
    name: 'ReadingDetail',
    params: { taskId: firstReadingTaskId },
    label: 'Reading Detail',
    enabled: Boolean(firstReadingTaskId),
    action: { target: 'ReadingDetail', type: 'answer_and_check' },
  },
  { type: 'stack', name: 'Grammar', label: 'Grammar Overview' },
  {
    type: 'stack',
    name: 'GrammarDetail',
    params: { taskId: firstGrammarTaskId },
    label: 'Grammar Detail',
    enabled: Boolean(firstGrammarTaskId),
    action: { target: 'GrammarDetail', type: 'answer_and_check' },
  },
  { type: 'stack', name: 'Writing', label: 'Writing Overview' },
  { type: 'stack', name: 'Vocab', label: 'Vocabulary Overview' },
  { type: 'stack', name: 'FlashcardHome', label: 'Flashcard Hub' },
  { type: 'stack', name: 'VocabFlashcard', params: { initialWords: [] }, label: 'Flashcard Session', backAfterMs: 700 },
  { type: 'stack', name: 'CreateFlashcardDeck', label: 'Create Flashcard Deck', backAfterMs: 700 },
  { type: 'stack', name: 'SynonymFinder', label: 'Synonym Finder', action: { target: 'SynonymFinder', type: 'search', word: 'significant' }, backAfterMs: 700 },
  { type: 'stack', name: 'Listening', label: 'Listening Overview' },
  { type: 'stack', name: 'Speaking', label: 'Speaking Practice' },
  { type: 'stack', name: 'AISpeakingPartner', label: 'AI Speaking Partner' },
  { type: 'tab', screen: 'MockHub', label: 'Tab: Mock' },
  { type: 'stack', name: 'Exams', label: 'Exam Bank' },
  { type: 'stack', name: 'PlacementTest', label: 'Placement Test' },
  { type: 'tab', screen: 'ProgressHub', label: 'Tab: Progress' },
  { type: 'tab', screen: 'Profile', label: 'Tab: Profile' },
].filter((step) => step.enabled !== false);
