import React from 'react';
import { Platform } from 'react-native';
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
        // flex: 1 ensures every stack screen fills its container so ScrollViews get a fixed height
        cardStyle: { flex: 1, minHeight: 0, backgroundColor: Platform.OS === 'web' ? colors.bg : 'transparent' },
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
      <Stack.Screen name="Splash" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-SplashAnimationScreen" */ '../screens/SplashAnimationScreen'))} options={{ headerShown: false }} />
      <Stack.Screen name="Landing" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-LandingScreen" */ '../screens/LandingScreen'))} options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-OnboardingScreen" */ '../screens/OnboardingScreen'))} options={{ headerShown: false }} />

      {userToken == null ? (
        // No token found, user isn't signed in
        <>
          <Stack.Screen name="Login" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-LoginScreen" */ '../screens/LoginScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-SignupScreen" */ '../screens/SignupScreen'))} options={{ headerShown: false }} />
        </>
      ) : (
        // User is signed in
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="Reading" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-ReadingScreen" */ '../screens/ReadingScreen'))} options={{ title: 'Reading' }} />
          <Stack.Screen name="ReadingDetail" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-ReadingDetailScreen" */ '../screens/ReadingDetailScreen'))} options={{ title: 'Reading Practice' }} />
          <Stack.Screen name="Listening" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-ListeningScreen" */ '../screens/ListeningScreen'))} options={{ title: 'Listening' }} />
          <Stack.Screen name="ListeningDetail" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-ListeningDetailScreen" */ '../screens/ListeningDetailScreen'))} options={{ title: 'Listening Practice' }} />
          <Stack.Screen name="Grammar" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-GrammarScreen" */ '../screens/GrammarScreen'))} options={{ title: 'Grammar' }} />
          <Stack.Screen name="GrammarDetail" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-GrammarDetailScreen" */ '../screens/GrammarDetailScreen'))} options={{ title: 'Grammar Practice' }} />
          <Stack.Screen name="GrammarDrill" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-GrammarDrillScreen" */ '../screens/GrammarDrillScreen'))} options={{ title: 'Adaptive Drill' }} />
          <Stack.Screen name="GrammarSectionExam" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-GrammarSectionExamScreen" */ '../screens/GrammarSectionExamScreen'))} options={{ title: 'Grammar Section Exam' }} />
          <Stack.Screen name="VocabQuiz" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-VocabQuizScreen" */ '../screens/VocabQuizScreen'))} options={{ title: 'Vocab Quiz' }} />
          <Stack.Screen name="VocabPractice" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-VocabPracticeScreen" */ '../screens/VocabPracticeScreen'))} options={{ title: 'Vocab Practice' }} />
          <Stack.Screen name="VocabSynonymQuiz" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-VocabSynonymQuizScreen" */ '../screens/VocabSynonymQuizScreen'))} options={{ title: 'Synonym Match' }} />
          <Stack.Screen name="VocabClozeQuiz" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-VocabClozeQuizScreen" */ '../screens/VocabClozeQuizScreen'))} options={{ title: 'Fill in the Blank' }} />
          <Stack.Screen name="VocabCollocationQuiz" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-VocabCollocationQuizScreen" */ '../screens/VocabCollocationQuizScreen'))} options={{ title: 'Collocation Quiz' }} />
          <Stack.Screen name="VocabFlashcard" component={VocabFlashcardScreen} options={({ route }) => ({ title: route.params?.title || 'Flashcards' })} />
          <Stack.Screen name="FlashcardHome" component={FlashcardHomeScreen} options={{ title: 'Flashcard Library' }} />
          <Stack.Screen name="CreateFlashcardDeck" component={CreateFlashcardDeckScreen} options={{ presentation: 'modal', title: 'New Deck' }} />
          <Stack.Screen name="WebViewer" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-WebViewerScreen" */ '../screens/WebViewerScreen'))} options={{ title: 'Resource' }} />
          <Stack.Screen name="Exams" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-ExamsScreen" */ '../screens/ExamsScreen'))} options={{ title: 'Exams' }} />
          <Stack.Screen name="ExamDetail" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-ExamDetailScreen" */ '../screens/ExamDetailScreen'))} options={{ title: 'BUEPT Practice' }} />
          <Stack.Screen name="Resources" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-ResourcesScreen" */ '../screens/ResourcesScreen'))} options={{ title: 'General Resources' }} />
          <Stack.Screen name="ReadingHistory" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-GenericHistoryScreen" */ '../screens/GenericHistoryScreen'))} options={{ title: 'Reading History' }} initialParams={{ type: 'reading' }} />
          <Stack.Screen name="ListeningHistory" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-GenericHistoryScreen" */ '../screens/GenericHistoryScreen'))} options={{ title: 'Listening History' }} initialParams={{ type: 'listening' }} />
          <Stack.Screen name="GrammarHistory" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-GenericHistoryScreen" */ '../screens/GenericHistoryScreen'))} options={{ title: 'Grammar History' }} initialParams={{ type: 'grammar' }} />
          <Stack.Screen name="WritingEditor" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-WritingEditorScreen" */ '../screens/WritingEditorScreen'))} options={{ title: 'Writing Studio' }} />
          <Stack.Screen name="Feedback" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-FeedbackScreen" */ '../screens/FeedbackScreen'))} options={{ title: 'Writing Feedback' }} />
          <Stack.Screen name="History" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-GenericHistoryScreen" */ '../screens/GenericHistoryScreen'))} options={{ title: 'Writing History' }} initialParams={{ type: 'writing' }} />
          <Stack.Screen name="Mock" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-MockScreen" */ '../screens/MockScreen'))} options={{ title: 'Mock Exam' }} />
          <Stack.Screen name="MockResult" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-MockResultScreen" */ '../screens/MockResultScreen'))} options={{ title: 'Mock Result' }} />
          <Stack.Screen name="Favorites" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-FavoritesScreen" */ '../screens/FavoritesScreen'))} options={{ title: 'Favorites' }} />
          <Stack.Screen name="Drafts" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-DraftsScreen" */ '../screens/DraftsScreen'))} options={{ title: 'Drafts' }} />
          <Stack.Screen name="DraftRestore" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-DraftRestoreScreen" */ '../screens/DraftRestoreScreen'))} options={{ title: 'Restore Draft' }} />
          <Stack.Screen name="MockHistory" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-GenericHistoryScreen" */ '../screens/GenericHistoryScreen'))} options={{ title: 'Mock History' }} initialParams={{ type: 'mock' }} />
          <Stack.Screen name="Review" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-ReviewScreen" */ '../screens/ReviewScreen'))} options={{ title: 'Daily Review' }} />
          <Stack.Screen name="StudyPlan" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-StudyPlanScreen" */ '../screens/StudyPlanScreen'))} options={{ title: 'Study Plan' }} />
          <Stack.Screen name="Analytics" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-AnalyticsScreen" */ '../screens/AnalyticsScreen'))} options={{ title: 'Analytics' }} />
          <Stack.Screen name="OnlineFeedback" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-OnlineFeedbackScreen" */ '../screens/OnlineFeedbackScreen'))} options={{ title: 'Online Feedback' }} />
          <Stack.Screen name="Chatbot" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-ChatbotScreen" */ '../screens/ChatbotScreen'))} options={{ title: 'BUEPT Chat Coach' }} />
          <Stack.Screen name="MistakeCoach" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-MistakeCoachScreen" */ '../screens/MistakeCoachScreen'))} options={{ title: 'Mistake Coach' }} />
          <Stack.Screen name="SpeakingDetail" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-SpeakingDetailScreen" */ '../screens/SpeakingDetailScreen'))} options={{ title: 'Speaking Practice' }} />
          <Stack.Screen name="SpeakingMockInterview" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-SpeakingMockInterviewScreen" */ '../screens/SpeakingMockInterviewScreen'))} options={{ title: 'Mock Interview' }} />
          <Stack.Screen name="Progress" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-ProgressScreen" */ '../screens/ProgressScreen'))} options={{ title: 'Progress' }} />
          <Stack.Screen name="SynonymFinder" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-SynonymFinderScreen" */ '../screens/SynonymFinderScreen'))} options={{ title: 'Synonym Finder' }} />
          <Stack.Screen name="Essay" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-EssayScreen" */ '../screens/EssayScreen'))} options={{ title: 'Essay Writing' }} />
          <Stack.Screen name="ErrorStats" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-ErrorStatsScreen" */ '../screens/ErrorStatsScreen'))} options={{ title: 'Error Statistics' }} />
          <Stack.Screen name="Developer" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-DeveloperScreen" */ '../screens/DeveloperScreen'))} options={{ title: 'Developer' }} />
          <Stack.Screen name="ConfusingPronunciations" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-ConfusingPronunciationsScreen" */ '../screens/ConfusingPronunciationsScreen'))} options={{ title: 'Confusing Pronunciations' }} />
          <Stack.Screen name="DemoFeatures" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-DemoFeaturesScreen" */ '../screens/DemoFeaturesScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="PhotoVocabCapture" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-PhotoVocabCaptureScreen" */ '../screens/PhotoVocabCaptureScreen'))} options={{ title: 'Photo Vocabulary OCR' }} />
          <Stack.Screen name="PlacementTest" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-PlacementTestScreen" */ '../screens/PlacementTestScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="AcademicWriting" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-AcademicWritingScreen" */ '../screens/AcademicWritingScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="TerminologyDictionary" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-TerminologyDictionaryScreen" */ '../screens/TerminologyDictionaryScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="AISpeakingPartner" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-AISpeakingPartnerScreen" */ '../screens/AISpeakingPartnerScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="CampusSocial" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-CampusSocialScreen" */ '../screens/CampusSocialScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="Assignments" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-AssignmentsScreen" */ '../screens/AssignmentsScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="LectureListeningLab" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-LectureListeningLabScreen" */ '../screens/LectureListeningLabScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="AdvancedReading" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-AdvancedReadingScreen" */ '../screens/AdvancedReadingScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="DiscussionForums" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-DiscussionForumsScreen" */ '../screens/DiscussionForumsScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="CurriculumSync" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-CurriculumSyncScreen" */ '../screens/CurriculumSyncScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="ClassScheduleCalendar" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-ClassScheduleCalendarScreen" */ '../screens/ClassScheduleCalendarScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="BogaziciHub" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-BogaziciHubScreen" */ '../screens/BogaziciHubScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="LiveClasses" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-LiveClassesScreen" */ '../screens/LiveClassesScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="WeakPointAnalysis" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-WeakPointAnalysisScreen" */ '../screens/WeakPointAnalysisScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="EssayEvaluation" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-EssayEvaluationScreen" */ '../screens/EssayEvaluationScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="ProficiencyMock" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-ProficiencyMockScreen" */ '../screens/ProficiencyMockScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="MicroLearning" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-MicroLearningScreen" */ '../screens/MicroLearningScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="RealLifeModules" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-RealLifeModulesScreen" */ '../screens/RealLifeModulesScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="PlagiarismChecker" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-PlagiarismCheckerScreen" */ '../screens/PlagiarismCheckerScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="LanguageExchangeMatching" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-LanguageExchangeMatchingScreen" */ '../screens/LanguageExchangeMatchingScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="InteractiveVocabulary" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-InteractiveVocabularyScreen" */ '../screens/InteractiveVocabularyScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="EmailTemplateDesigner" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-EmailTemplateDesignerScreen" */ '../screens/EmailTemplateDesignerScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="AIPresentationPrep" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-AIPresentationPrepScreen" */ '../screens/AIPresentationPrepScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="AILessonVideoStudio" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-AILessonVideoStudioScreen" */ '../screens/AILessonVideoStudioScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="VideoLessonPlayer" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-VideoLessonPlayerScreen" */ '../screens/VideoLessonPlayerScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="Podcast" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-PodcastScreen" */ '../screens/PodcastScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="AcademicPhraseStudio" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-AcademicPhraseStudioScreen" */ '../screens/AcademicPhraseStudioScreen'))} options={{ title: 'Academic Phrase Studio' }} />
          <Stack.Screen name="AIMockGenerator" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-AIMockGeneratorScreen" */ '../screens/AIMockGeneratorScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="AIMockExam" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-AIMockExamScreen" */ '../screens/AIMockExamScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="OfficialSim" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-OfficialSimScreen" */ '../screens/OfficialSimScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="BUSEPTScorePredictor" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-BUSEPTScorePredictorScreen" */ '../screens/BUSEPTScorePredictorScreen'))} options={{ headerShown: false }} />
          <Stack.Screen name="ParaphraseStudio" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-ParaphraseStudioScreen" */ '../screens/ParaphraseStudioScreen'))} options={{ title: 'Paraphrase Studio' }} />
          <Stack.Screen name="EssayBank" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-EssayBankScreen" */ '../screens/EssayBankScreen'))} options={{ title: 'Essay Bank' }} />
          <Stack.Screen name="PassageReader" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-PassageReaderScreen" */ '../screens/PassageReaderScreen'))} options={{ title: 'Passage Reader' }} />
          <Stack.Screen name="TodayBoard" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-TodayBoardScreen" */ '../screens/TodayBoardScreen'))} options={{ title: "Today's Board" }} />
          <Stack.Screen name="BadgeCase" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-BadgeCaseScreen" */ '../screens/BadgeCaseScreen'))} options={{ title: 'Badge Case' }} />
          <Stack.Screen name="LevelCard" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-LevelCardScreen" */ '../screens/LevelCardScreen'))} options={{ title: 'XP Ladder' }} />
          <Stack.Screen name="XPTimeline" getComponent={() => React.lazy(() => import(/* webpackChunkName: "screen-XPTimelineScreen" */ '../screens/XPTimelineScreen'))} options={{ title: 'XP Timeline' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
