import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import { colors, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import VocabFlashcardScreen from '../screens/VocabFlashcardScreen';
import FlashcardHomeScreen from '../screens/FlashcardHomeScreen';
import CreateFlashcardDeckScreen from '../screens/CreateFlashcardDeckScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { userToken } = useAppState();

  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { fontFamily: typography.fontHeadline, fontSize: typography.h3, color: colors.text },
        headerTintColor: colors.primary,
        animationEnabled: true,
        gestureEnabled: true,
        gestureResponseDistance: { horizontal: 32 },
        cardStyle: { backgroundColor: 'transparent' },
        animationTypeForReplace: 'push',
        detachPreviousScreen: true,
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      {/* 
        We use a Splash as the absolute initial route for animation. 
        It decides internally to navigate to either Login or MainTabs based on token, 
        but we also structurally split the stack just to be safe.
      */}
      <Stack.Screen name="Splash" getComponent={() => require('../screens/SplashAnimationScreen').default} options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding" getComponent={() => require('../screens/OnboardingScreen').default} options={{ headerShown: false }} />

      {userToken == null ? (
        // No token found, user isn't signed in
        <>
          <Stack.Screen name="Login" getComponent={() => require('../screens/LoginScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" getComponent={() => require('../screens/SignupScreen').default} options={{ headerShown: false }} />
        </>
      ) : (
        // User is signed in
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="Reading" getComponent={() => require('../screens/ReadingScreen').default} options={{ title: 'Reading' }} />
          <Stack.Screen name="ReadingDetail" getComponent={() => require('../screens/ReadingDetailScreen').default} options={{ title: 'Reading Practice' }} />
          <Stack.Screen name="Listening" getComponent={() => require('../screens/ListeningScreen').default} options={{ title: 'Listening' }} />
          <Stack.Screen name="ListeningDetail" getComponent={() => require('../screens/ListeningDetailScreen').default} options={{ title: 'Listening Practice' }} />
          <Stack.Screen name="Grammar" getComponent={() => require('../screens/GrammarScreen').default} options={{ title: 'Grammar' }} />
          <Stack.Screen name="GrammarDetail" getComponent={() => require('../screens/GrammarDetailScreen').default} options={{ title: 'Grammar Practice' }} />
          <Stack.Screen name="GrammarSectionExam" getComponent={() => require('../screens/GrammarSectionExamScreen').default} options={{ title: 'Grammar Section Exam' }} />
          <Stack.Screen name="VocabQuiz" getComponent={() => require('../screens/VocabQuizScreen').default} options={{ title: 'Vocab Quiz' }} />
          <Stack.Screen name="VocabPractice" getComponent={() => require('../screens/VocabPracticeScreen').default} options={{ title: 'Vocab Practice' }} />
          <Stack.Screen name="VocabSynonymQuiz" getComponent={() => require('../screens/VocabSynonymQuizScreen').default} options={{ title: 'Synonym Match' }} />
          <Stack.Screen name="VocabClozeQuiz" getComponent={() => require('../screens/VocabClozeQuizScreen').default} options={{ title: 'Fill in the Blank' }} />
          <Stack.Screen name="VocabCollocationQuiz" getComponent={() => require('../screens/VocabCollocationQuizScreen').default} options={{ title: 'Collocation Quiz' }} />
          <Stack.Screen name="VocabFlashcard" component={VocabFlashcardScreen} options={({ route }) => ({ title: route.params?.title || 'Flashcards' })} />
          <Stack.Screen name="FlashcardHome" component={FlashcardHomeScreen} options={{ title: 'Flashcard Library' }} />
          <Stack.Screen name="CreateFlashcardDeck" component={CreateFlashcardDeckScreen} options={{ presentation: 'modal', title: 'New Deck' }} />
          <Stack.Screen name="WebViewer" getComponent={() => require('../screens/WebViewerScreen').default} options={{ title: 'Resource' }} />
          <Stack.Screen name="Exams" getComponent={() => require('../screens/ExamsScreen').default} options={{ title: 'Exams' }} />
          <Stack.Screen name="ExamDetail" getComponent={() => require('../screens/ExamDetailScreen').default} options={{ title: 'BUEPT Practice' }} />
          <Stack.Screen name="Resources" getComponent={() => require('../screens/ResourcesScreen').default} options={{ title: 'General Resources' }} />
          <Stack.Screen name="ReadingHistory" getComponent={() => require('../screens/ReadingHistoryScreen').default} options={{ title: 'Reading History' }} />
          <Stack.Screen name="ListeningHistory" getComponent={() => require('../screens/ListeningHistoryScreen').default} options={{ title: 'Listening History' }} />
          <Stack.Screen name="GrammarHistory" getComponent={() => require('../screens/GrammarHistoryScreen').default} options={{ title: 'Grammar History' }} />
          <Stack.Screen name="WritingEditor" getComponent={() => require('../screens/WritingEditorScreen').default} options={{ title: 'Writing Studio' }} />
          <Stack.Screen name="Feedback" getComponent={() => require('../screens/FeedbackScreen').default} options={{ title: 'Writing Feedback' }} />
          <Stack.Screen name="History" getComponent={() => require('../screens/HistoryScreen').default} options={{ title: 'Writing History' }} />
          <Stack.Screen name="Mock" getComponent={() => require('../screens/MockScreen').default} options={{ title: 'Mock Exam' }} />
          <Stack.Screen name="MockResult" getComponent={() => require('../screens/MockResultScreen').default} options={{ title: 'Mock Result' }} />
          <Stack.Screen name="Favorites" getComponent={() => require('../screens/FavoritesScreen').default} options={{ title: 'Favorites' }} />
          <Stack.Screen name="Drafts" getComponent={() => require('../screens/DraftsScreen').default} options={{ title: 'Drafts' }} />
          <Stack.Screen name="DraftRestore" getComponent={() => require('../screens/DraftRestoreScreen').default} options={{ title: 'Restore Draft' }} />
          <Stack.Screen name="MockHistory" getComponent={() => require('../screens/MockHistoryScreen').default} options={{ title: 'Mock History' }} />
          <Stack.Screen name="Review" getComponent={() => require('../screens/ReviewScreen').default} options={{ title: 'Daily Review' }} />
          <Stack.Screen name="StudyPlan" getComponent={() => require('../screens/StudyPlanScreen').default} options={{ title: 'Study Plan' }} />
          <Stack.Screen name="Analytics" getComponent={() => require('../screens/AnalyticsScreen').default} options={{ title: 'Analytics' }} />
          <Stack.Screen name="OnlineFeedback" getComponent={() => require('../screens/OnlineFeedbackScreen').default} options={{ title: 'Online Feedback' }} />
          <Stack.Screen name="Chatbot" getComponent={() => require('../screens/ChatbotScreen').default} options={{ title: 'BUEPT Chat Coach' }} />
          <Stack.Screen name="MistakeCoach" getComponent={() => require('../screens/MistakeCoachScreen').default} options={{ title: 'Mistake Coach' }} />
          <Stack.Screen name="SpeakingDetail" getComponent={() => require('../screens/SpeakingDetailScreen').default} options={{ title: 'Speaking Practice' }} />
          <Stack.Screen name="SpeakingMockInterview" getComponent={() => require('../screens/SpeakingMockInterviewScreen').default} options={{ title: 'Mock Interview' }} />
          <Stack.Screen name="Progress" getComponent={() => require('../screens/ProgressScreen').default} options={{ title: 'Progress' }} />
          <Stack.Screen name="SynonymFinder" getComponent={() => require('../screens/SynonymFinderScreen').default} options={{ title: 'Synonym Finder' }} />
          <Stack.Screen name="Essay" getComponent={() => require('../screens/EssayScreen').default} options={{ title: 'Essay Writing' }} />
          <Stack.Screen name="ErrorStats" getComponent={() => require('../screens/ErrorStatsScreen').default} options={{ title: 'Error Statistics' }} />
          <Stack.Screen name="Developer" getComponent={() => require('../screens/DeveloperScreen').default} options={{ title: 'Developer' }} />
          <Stack.Screen name="ConfusingPronunciations" getComponent={() => require('../screens/ConfusingPronunciationsScreen').default} options={{ title: 'Confusing Pronunciations' }} />
          <Stack.Screen name="DemoFeatures" getComponent={() => require('../screens/DemoFeaturesScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="PhotoVocabCapture" getComponent={() => require('../screens/PhotoVocabCaptureScreen').default} options={{ title: 'Photo Vocabulary OCR' }} />
          <Stack.Screen name="PlacementTest" getComponent={() => require('../screens/PlacementTestScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="AcademicWriting" getComponent={() => require('../screens/AcademicWritingScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="TerminologyDictionary" getComponent={() => require('../screens/TerminologyDictionaryScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="AISpeakingPartner" getComponent={() => require('../screens/AISpeakingPartnerScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="CampusSocial" getComponent={() => require('../screens/CampusSocialScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="Assignments" getComponent={() => require('../screens/AssignmentsScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="LectureListeningLab" getComponent={() => require('../screens/LectureListeningLabScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="AdvancedReading" getComponent={() => require('../screens/AdvancedReadingScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="DiscussionForums" getComponent={() => require('../screens/DiscussionForumsScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="CurriculumSync" getComponent={() => require('../screens/CurriculumSyncScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="ClassScheduleCalendar" getComponent={() => require('../screens/ClassScheduleCalendarScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="BogaziciHub" getComponent={() => require('../screens/BogaziciHubScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="LiveClasses" getComponent={() => require('../screens/LiveClassesScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="WeakPointAnalysis" getComponent={() => require('../screens/WeakPointAnalysisScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="EssayEvaluation" getComponent={() => require('../screens/EssayEvaluationScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="ProficiencyMock" getComponent={() => require('../screens/ProficiencyMockScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="MicroLearning" getComponent={() => require('../screens/MicroLearningScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="RealLifeModules" getComponent={() => require('../screens/RealLifeModulesScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="PlagiarismChecker" getComponent={() => require('../screens/PlagiarismCheckerScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="LanguageExchangeMatching" getComponent={() => require('../screens/LanguageExchangeMatchingScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="InteractiveVocabulary" getComponent={() => require('../screens/InteractiveVocabularyScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="EmailTemplateDesigner" getComponent={() => require('../screens/EmailTemplateDesignerScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="AIPresentationPrep" getComponent={() => require('../screens/AIPresentationPrepScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="AILessonVideoStudio" getComponent={() => require('../screens/AILessonVideoStudioScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="VideoLessonPlayer" getComponent={() => require('../screens/VideoLessonPlayerScreen').default} options={{ headerShown: false }} />
          <Stack.Screen name="Podcast" getComponent={() => require('../screens/PodcastScreen').default} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}
