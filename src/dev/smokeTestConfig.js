import readingTasks from '../../data/reading_tasks.json';
import listeningTasks from '../../data/listening_tasks.json';
import grammarTasks from '../../data/grammar_tasks.json';
import testEnglishGrammarTasks from '../../data/test_english_grammar_tasks.json';

export const DEV_SMOKE_TEST_ENABLED = false;
export const DEV_SMOKE_TEST_STEP_DELAY_MS = 1400;

const firstReadingTaskId = readingTasks?.[0]?.id;
const firstListeningTaskId = listeningTasks?.[0]?.id;
const firstGrammarTaskId = grammarTasks?.[0]?.id || testEnglishGrammarTasks?.[0]?.id;

export const DEV_SMOKE_TEST_STEPS = [
  { type: 'tab', screen: 'Home', label: 'Tab: Home' },
  { type: 'tab', screen: 'Reading', label: 'Tab: Reading' },
  { type: 'stack', name: 'ReadingDetail', params: { taskId: firstReadingTaskId }, label: 'Reading Detail', enabled: Boolean(firstReadingTaskId) },
  { type: 'stack', name: 'ReadingHistory', label: 'Reading History' },
  { type: 'tab', screen: 'Grammar', label: 'Tab: Grammar' },
  { type: 'stack', name: 'GrammarDetail', params: { taskId: firstGrammarTaskId }, label: 'Grammar Detail', enabled: Boolean(firstGrammarTaskId) },
  { type: 'stack', name: 'GrammarHistory', label: 'Grammar History' },
  { type: 'tab', screen: 'Writing', label: 'Tab: Writing' },
  { type: 'stack', name: 'WritingEditor', label: 'Writing Editor' },
  { type: 'tab', screen: 'Vocab', label: 'Tab: Vocab' },
  { type: 'stack', name: 'SynonymFinder', label: 'Synonym Finder' },
  { type: 'stack', name: 'ConfusingPronunciations', label: 'Confusing Pronunciations' },
  { type: 'stack', name: 'InteractiveVocabulary', label: 'Interactive Vocabulary' },
  { type: 'stack', name: 'PhotoVocabCapture', label: 'Photo Vocab Capture' },
  { type: 'tab', screen: 'Listening', label: 'Tab: Listening' },
  { type: 'stack', name: 'ListeningDetail', params: { taskId: firstListeningTaskId }, label: 'Listening Detail', enabled: Boolean(firstListeningTaskId) },
  { type: 'stack', name: 'ListeningHistory', label: 'Listening History' },
  { type: 'stack', name: 'LectureListeningLab', label: 'Lecture Listening Lab' },
  { type: 'tab', screen: 'Speaking', label: 'Tab: Speaking' },
  { type: 'stack', name: 'AISpeakingPartner', label: 'AI Speaking Partner' },
  { type: 'stack', name: 'Chatbot', label: 'Chatbot' },
  { type: 'stack', name: 'Mock', label: 'Mock Exam' },
  { type: 'stack', name: 'Review', label: 'Review' },
  { type: 'stack', name: 'StudyPlan', label: 'Study Plan' },
  { type: 'stack', name: 'Analytics', label: 'Analytics' },
  { type: 'stack', name: 'Progress', label: 'Progress' },
  { type: 'stack', name: 'Resources', label: 'Resources' },
  { type: 'stack', name: 'Exams', label: 'Exams' },
  { type: 'stack', name: 'PlacementTest', label: 'Placement Test' },
  { type: 'stack', name: 'AcademicWriting', label: 'Academic Writing' },
  { type: 'stack', name: 'AIPresentationPrep', label: 'AI Presentation Prep' },
  { type: 'stack', name: 'AILessonVideoStudio', label: 'AI Lesson Video Studio' },
  { type: 'stack', name: 'ClassScheduleCalendar', label: 'Class Schedule Calendar' },
  { type: 'stack', name: 'BogaziciHub', label: 'Bogazici Hub' },
  { type: 'stack', name: 'WeakPointAnalysis', label: 'Weak Point Analysis' },
  { type: 'stack', name: 'ProficiencyMock', label: 'Proficiency Mock' },
  { type: 'stack', name: 'DemoFeatures', label: 'Demo Features' },
].filter((step) => step.enabled !== false);
