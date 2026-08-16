/**
 * AIMockGeneratorScreen.js — AI Mock Exam Generator for BUEPT
 *
 * Generates exam-faithful mock exams with the Gemini API, modeled on the
 * official YADYOK sample exam (2026): Selective + Careful Listening,
 * Reading I (Search) + Reading II (Careful), and the two-essay Test of Writing.
 * Supports levels P1-P4 and per-section or full-exam generation.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius } from '../theme/tokens';
import {
  generateAiMock,
  loadMockBank,
  saveMockBank,
  MOCK_LEVELS,
  MOCK_SECTIONS,
  getMockSections,
  isAiAccessAvailable,
} from '../utils/aiMockGenerator';
import { getOfflineMocks } from '../data/offlineMocks';
import { getOdtuMocks } from '../data/offlineMocksOdtu';
import { useAppState } from '../context/AppState';
import { useUniversity } from '../context/UniversityContext';

export default function AIMockGeneratorScreen({ navigation }) {
  const { addXp } = useAppState();
  const { university, uniKey } = useUniversity();
  const isOdtu = uniKey === 'odtu';
  const offlineExams = isOdtu ? getOdtuMocks() : getOfflineMocks();
  const [level, setLevel] = useState('P3');
  const [section, setSection] = useState('full');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [bank, setBank] = useState([]);
  const [accessReady, setAccessReady] = useState(false);
  const [viewing, setViewing] = useState(null);

  const refreshBank = useCallback(async () => {
    setBank(await loadMockBank());
  }, []);

  useEffect(() => {
    setAccessReady(isAiAccessAvailable());
    refreshBank();
  }, [refreshBank]);

  const handleGenerate = async () => {
    if (!accessReady) {
      setError('Gemini API key is not configured. Open Settings → AI Access to add your key first.');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const { exam } = await generateAiMock({ section, level, uni: uniKey });
      if (section === 'full' || section === 'writing') {
        // Writing is graded separately by the existing AI grading flow
        exam.writingGenerated = true;
      }
      await saveMockBank([exam]);
      setGeneratedExam(exam);
      await refreshBank();
      if (addXp) addXp(10);
    } catch (e) {
      setError(e?.message || 'Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleView = (exam) => {
    setViewing(exam);
    setGeneratedExam(exam);
  };

  const examQuestionCounts = (exam) => {
    const counts = [];
    if (exam.listening) {
      const s = exam.listening.selective?.questions?.length || 0;
      const c = exam.listening.careful?.questions?.length || 0;
      counts.push(`Listening: ${s} selective + ${c} careful`);
    }
    if (exam.reading) {
      const s = exam.reading.search?.questions?.length || 0;
      const c = exam.reading.careful?.questions?.length || 0;
      counts.push(`Reading: ${s} search + ${c} careful`);
    }
    if (exam.noteTaking) {
      counts.push(`Note-Taking: ${exam.noteTaking.lecture?.questions?.length || 0} MC items`);
    }
    if (exam.writing) counts.push(`Writing: ${exam.writing.essays.length} essays`);
    return counts;
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      <View style={styles.header}>
        <Button
          label=""
          variant="ghost"
          style={styles.backBtn}
          icon="arrow-back"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>AI Mock Generator</Text>
      </View>

      {viewing ? (
        <ExamPreview
          exam={viewing}
          onBack={() => setViewing(null)}
          onStart={() => {
            navigation.navigate('AIMockExam', { exam: viewing });
          }}
        />
      ) : (
        <>
          {!accessReady && (
            <Card style={styles.warnCard}>
              <Text style={styles.warnTitle}>AI access not configured</Text>
              <Text style={styles.warnBody}>
                Open Settings → AI Access and add a Gemini API key to generate unlimited official-format mock exams.
              </Text>
            </Card>
          )}

          <Card style={styles.card}>
            <Text style={styles.sectionLabel}>Offline Mock Bank — no AI key required</Text>
            <Text style={styles.levelNote}>
              {isOdtu
                ? 'Eight full METU-format mocks (L1–L4): Listening, dense Reading, Note-Taking, one essay and a Speaking block with AI microphone scoring — the real EPE/İYS sections. Starts instantly.'
                : 'Four full official-format BUSEPT mocks (P1–P4): Selective + Careful Listening, Reading I/II and two essays — the real exam\'s three scored parts (no speaking section on BUSEPT). Starts instantly.'}
            </Text>
            <View style={styles.optionRow}>
              {offlineExams.map((exam) => (
                <Button
                  key={exam.meta.id}
                  label={exam.meta.level}
                  variant="secondary"
                  icon="play"
                  onPress={() => navigation.navigate('AIMockExam', { exam })}
                />
              ))}
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionLabel}>Exam Level</Text>
            <View style={styles.optionRow}>
              {MOCK_LEVELS.map((l) => (
                <Button
                  key={l.key}
                  label={l.key}
                  variant={level === l.key ? 'primary' : 'secondary'}
                  onPress={() => setLevel(l.key)}
                />
              ))}
            </View>
            <Text style={styles.levelNote}>{MOCK_LEVELS.find((l) => l.key === level)?.label}</Text>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionLabel}>What to Generate</Text>
            <View style={styles.optionRow}>
              {getMockSections(uniKey).map((s) => (
                <Button
                  key={s.key}
                  label={s.label}
                  variant={section === s.key ? 'primary' : 'secondary'}
                  onPress={() => setSection(s.key)}
                />
              ))}
            </View>
            <Text style={styles.levelNote}>
              {isOdtu
                ? 'Full mock follows the official METU order: Listening → Reading (the dominant section) → Note-Taking → Writing (+ Speaking practice).'
                : 'Full mock follows the official BUSEPT order: Selective Listening → Careful Listening → Reading I → Reading II → Writing.'}
            </Text>
          </Card>

          <Button
            label={generating ? 'Generating exam…' : isOdtu ? 'Generate ODTÜ-EPE Mock' : 'Generate BUSEPT Mock'}
            icon="sparkles-outline"
            disabled={generating || !accessReady}
            onPress={handleGenerate}
            style={styles.generateBtn}
          />

          {generating && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>
                The AI is writing a {isOdtu ? 'METU-format' : 'YADYOK-format'} exam… (up to 2 minutes)
              </Text>
            </View>
          )}

          {error && (
            <Card style={styles.warnCard}>
              <Text style={styles.warnTitle}>Generation failed</Text>
              <Text style={styles.warnBody}>{error}</Text>
            </Card>
          )}

          {generatedExam && !viewing && (
            <Card style={styles.newExamCard}>
              <Text style={styles.newExamLabel}>✨ New mock ready</Text>
              <Text style={styles.newExamTitle}>{bank[0]?.listening?.selective?.title || bank[0]?.reading?.search?.title || 'AI BUSEPT Mock'}</Text>
              <View style={styles.newExamMeta}>
                {['P1', 'P2', 'P3', 'P4'].includes(bank[0]?.level) && (
                  <Text style={styles.newExamPill}>{bank[0].level}</Text>
                )}
                <Text style={styles.newExamPill}>{getMockSections(uniKey).find((s) => s.key === bank[0]?.section)?.label}</Text>
              </View>
              <Button label="Open Exam" onPress={() => handleView(bank[0])} />
            </Card>
          )}

          <Text style={styles.bankLabel}>Your Generated Mocks ({bank.length})</Text>
          {bank.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>No generated mocks yet. Generate your first official-format exam above.</Text>
            </Card>
          ) : (
            bank.map((exam, idx) => (
              <Card key={exam.id} style={styles.bankCard}>
                <View style={styles.bankHead}>
                  <Text style={styles.bankTitle}>
                    {exam.listening?.selective?.title || exam.reading?.search?.title || 'AI BUSEPT Mock'}
                  </Text>
                  <View style={styles.bankPills}>
                    <Text style={styles.bankPill}>{exam.level}</Text>
                    <Text style={styles.bankPill}>{getMockSections(uniKey).find((s) => s.key === exam.section)?.label}</Text>
                  </View>
                </View>
                {examQuestionCounts(exam).map((c) => (
                  <Text key={c} style={styles.bankCount}>{c}</Text>
                ))}
                <Text style={styles.bankDate}>{new Date(exam.generatedAt).toLocaleString()}</Text>
                <Button label="View &amp; Start" variant="secondary" onPress={() => handleView(exam)} />
              </Card>
            ))
          )}
        </>
      )}
    </Screen>
  );
}

function ExamPreview({ exam, onBack, onStart }) {
  const isOdtu = (exam?.university || exam?.meta?.university) === 'odtu';
  const sectionEntries = [];
  if (isOdtu) {
    // Official METU order: While Listening → Careful Reading → Note-Taking → Independent Writing (+ Speaking Day-2 practice).
    if (exam.listening?.selective) {
      sectionEntries.push({
        key: 'lis-sel',
        icon: '🎧',
        title: exam.listening.selective.title,
        sub: `While Listening • ${exam.listening.selective.questions.length} questions • 1.5 pts each • ~25 min`,
      });
    }
    if (exam.reading?.search) {
      sectionEntries.push({
        key: 'rea-search',
        icon: '📖',
        title: exam.reading.search.title,
        sub: `Careful Reading • ${exam.reading.search.questions.length} questions • 32 pts • 60 min`,
      });
    }
    if (exam.noteTaking?.lecture) {
      sectionEntries.push({
        key: 'note',
        icon: '📝',
        title: exam.noteTaking.lecture.title,
        sub: `Note-Taking • lecture once (~8 min) then ${exam.noteTaking.lecture.questions.length} MC items • 1.5 pts each • ~15 min`,
      });
    } else if (exam.listening?.careful) {
      sectionEntries.push({
        key: 'note',
        icon: '📝',
        title: exam.listening.careful.title,
        sub: `Note-Taking • lecture once (~8 min) then ${exam.listening.careful.questions.length} MC items • 1.5 pts each • ~15 min`,
      });
    }
    if (exam.writing) {
      exam.writing.essays.forEach((e, i) => {
        sectionEntries.push({
          key: `wri-${i}`,
          icon: '✍️',
          title: 'Independent Writing',
          sub: `${e.topic.slice(0, 90)}${e.topic.length > 90 ? '…' : ''} • one essay • ~220 words • 20 pts • 35 min`,
        });
      });
    }
    if (exam.bonusPractice?.speaking) {
      sectionEntries.push({
        key: 'spk',
        icon: '🎤',
        title: exam.bonusPractice.speaking.title,
        sub: `Speaking practice (Day-2 interview block, ~8 min) • ${exam.bonusPractice.speaking.questions?.length || 0} questions`,
      });
    }
  } else if (exam.listening?.selective) {
    if (exam.listening?.selective) {
      sectionEntries.push({
        key: 'lis-sel',
        icon: '🎧',
        title: exam.listening.selective.title,
        sub: `Selective Listening • ${exam.listening.selective.questions.length} questions • preview 3 min + check 3 min`,
      });
    }
    if (exam.listening?.careful) {
      sectionEntries.push({
        key: 'lis-car',
        icon: '📝',
        title: exam.listening.careful.title,
        sub: `Careful Listening (note-taking) • ${exam.listening.careful.questions.length} questions • answer 15 min`,
      });
    }
    if (exam.reading?.search) {
      sectionEntries.push({
        key: 'rea-search',
        icon: '🔍',
        title: exam.reading.search.title,
        sub: `Reading I (Search) • ${exam.reading.search.questions.length} questions • ${exam.reading.search.timeMinutes} min`,
      });
    }
    if (exam.reading?.careful) {
      sectionEntries.push({
        key: 'rea-care',
        icon: '📖',
        title: exam.reading.careful.title,
        sub: `Reading II (Careful) • ${exam.reading.careful.questions.length} questions • ${exam.reading.careful.timeMinutes} min`,
      });
    }
    if (exam.writing) {
      exam.writing.essays.forEach((e, i) => {
        sectionEntries.push({
          key: `wri-${i}`,
          icon: '✍️',
          title: `Writing Task ${i + 1}`,
          sub: `${e.topic.slice(0, 90)}${e.topic.length > 90 ? '…' : ''} • ~${e.wordTarget} words • ${e.timeMinutes} min`,
        });
      });
    }
  }
  return (
    <>
      <View style={styles.header}>
        <Button label="" variant="ghost" style={styles.backBtn} icon="arrow-back" onPress={onBack} />
        <Text style={styles.headerTitle}>Exam Preview</Text>
      </View>
      <Card style={styles.rulesCard}>
        <Text style={styles.rulesHead}>{isOdtu ? 'Official ODTÜ-EPE Rules (METU SFL)' : 'Official BUEPT Rules (YADYOK)'}</Text>
        {isOdtu ? (
          <>
            <Text style={styles.ruleItem}>• Total 100 pts: Listening 24 + Reading 32 + Note-Taking 9 + Writing 20 + Speaking 15. Pass mark is 60; 85+ exempts later English courses.</Text>
            <Text style={styles.ruleItem}>• The exam STARTS with listening — arrive early; late arrivals are not admitted.</Text>
            <Text style={styles.ruleItem}>• Writing: ONE independent essay of about 220 words, hand-written on paper in 35 minutes.</Text>
            <Text style={styles.ruleItem}>• Speaking is a separate Day-2 interview (~8 min): 4 unprepared questions plus 1 prepared broader-perspective question.</Text>
          </>
        ) : (
          <>
            <Text style={styles.ruleItem}>• Listening texts are read ONCE only. Keep your answers short and precise — extra information is to your disadvantage.</Text>
            <Text style={styles.ruleItem}>• Writing: write 2 essays; show university-level written English, not only short simple sentences.</Text>
            <Text style={styles.ruleItem}>• Pass mark: 60/100. Grade S (satisfactory) or F (fail). There is NO speaking section on BUSEPT.</Text>
          </>
        )}
      </Card>
      {sectionEntries.map((s) => (
        <Card key={s.key} style={styles.sectionCard}>
          <Text style={styles.sectionIcon}>{s.icon}</Text>
          <Text style={styles.sectionTitle}>{s.title}</Text>
          <Text style={styles.sectionSub}>{s.sub}</Text>
        </Card>
      ))}
      <Button label="Start Exam" icon="play" onPress={onStart} style={styles.startBtn} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  backBtn: { marginRight: spacing.md },
  headerTitle: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
    fontWeight: '800',
    flex: 1,
  },
  card: { marginHorizontal: spacing.xl, marginBottom: spacing.md },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  levelNote: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  generateBtn: { marginHorizontal: spacing.xl, marginVertical: spacing.md },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  loadingText: { marginLeft: spacing.sm, color: colors.primaryDark, fontSize: 13, fontWeight: '700' },
  warnCard: { marginHorizontal: spacing.xl, marginBottom: spacing.md, backgroundColor: colors.errorLight, borderColor: colors.error },
  warnTitle: { fontSize: 14, fontWeight: '800', color: colors.error, marginBottom: 4 },
  warnBody: { fontSize: 13, color: colors.text, lineHeight: 19 },
  newExamCard: { marginHorizontal: spacing.xl, marginBottom: spacing.md, backgroundColor: colors.successLight },
  newExamLabel: { fontSize: 12, fontWeight: '800', color: colors.success, textTransform: 'uppercase' },
  newExamTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginVertical: spacing.xs, lineHeight: 22 },
  newExamMeta: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  newExamPill: {
    fontSize: 11,
    fontWeight: '800',
    backgroundColor: colors.primarySoft,
    color: colors.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  bankLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  bankCard: { marginHorizontal: spacing.xl, marginBottom: spacing.sm },
  bankHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bankTitle: { fontSize: 15, fontWeight: '800', color: colors.text, flex: 1, marginRight: spacing.sm, lineHeight: 21 },
  bankPills: { flexDirection: 'row', gap: spacing.xs },
  bankPill: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  bankCount: { fontSize: 12, color: colors.muted, marginTop: 2, lineHeight: 17 },
  bankDate: { fontSize: 11, color: colors.muted, marginTop: spacing.xs, marginBottom: spacing.sm },
  emptyText: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  rulesCard: { marginHorizontal: spacing.xl, padding: spacing.lg, marginBottom: spacing.md },
  rulesHead: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', color: colors.primaryDark, marginBottom: spacing.sm },
  ruleItem: { fontSize: 13, color: colors.text, lineHeight: 19, marginBottom: spacing.xs },
  sectionCard: { marginHorizontal: spacing.xl, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'flex-start' },
  sectionIcon: { fontSize: 22, marginRight: spacing.md },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text, flex: 1, lineHeight: 21 },
  sectionSub: { fontSize: 12, color: colors.muted, lineHeight: 17, marginTop: 2 },
  startBtn: { marginHorizontal: spacing.xl, marginVertical: spacing.md },
});
