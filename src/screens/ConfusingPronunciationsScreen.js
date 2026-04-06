import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { useTts } from '../hooks/useTts';
import { colors, spacing, typography } from '../theme/tokens';
import confusingPairs from '../../data/confusing_pronunciations.json';

function WordPairCard({ item, practiceMode, speakText }) {
    const speakA = () => speakText(item.pair[0]);
    const speakB = () => speakText(item.pair[1]);
    const [revealed, setRevealed] = useState(!practiceMode);

    return (
        <Card style={styles.card}>
            <View style={styles.pairRow}>
                {/* Word A */}
                <View style={styles.wordSide}>
                    <TouchableOpacity onPress={speakA} style={styles.wordSpeakBtn}>
                        <Text style={styles.wordTitle}>{item.pair[0]}</Text>
                        <Text style={styles.speakIcon}>🔊</Text>
                    </TouchableOpacity>
                    {revealed ? (
                      <>
                        <Text style={styles.phonetic}>{item.phonetics[0]}</Text>
                        <Text style={styles.definitionText}>{item.definitions[0]}</Text>
                      </>
                    ) : (
                      <Text style={styles.hiddenText}>Tap reveal to see meaning</Text>
                    )}
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Word B */}
                <View style={styles.wordSide}>
                    <TouchableOpacity onPress={speakB} style={styles.wordSpeakBtn}>
                        <Text style={styles.wordTitle}>{item.pair[1]}</Text>
                        <Text style={styles.speakIcon}>🔊</Text>
                    </TouchableOpacity>
                    {revealed ? (
                      <>
                        <Text style={styles.phonetic}>{item.phonetics[1]}</Text>
                        <Text style={styles.definitionText}>{item.definitions[1]}</Text>
                      </>
                    ) : (
                      <Text style={styles.hiddenText}>Tap reveal to see meaning</Text>
                    )}
                </View>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={speakA} style={styles.actionBtn}>
                <Text style={styles.actionText}>Play A</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={speakB} style={styles.actionBtn}>
                <Text style={styles.actionText}>Play B</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setRevealed((v) => !v)} style={styles.actionBtnGhost}>
                <Text style={styles.actionTextGhost}>{revealed ? 'Hide' : 'Reveal'}</Text>
              </TouchableOpacity>
            </View>
        </Card>
    );
}

export default function ConfusingPronunciationsScreen() {
    const { speakWord: speakText } = useTts();
    const [query, setQuery] = useState('');
    const [practiceMode, setPracticeMode] = useState(true);
    const [quizSeed, setQuizSeed] = useState(1);
    const [quizChoice, setQuizChoice] = useState(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return confusingPairs;
      return confusingPairs.filter((item) => {
        const hay = `${item.pair.join(' ')} ${item.definitions.join(' ')}`.toLowerCase();
        return hay.includes(q);
      });
    }, [query]);
    const quizPair = useMemo(() => {
      const list = filtered.length ? filtered : confusingPairs;
      if (!list.length) return null;
      return list[Math.abs(quizSeed * 7) % list.length];
    }, [filtered, quizSeed]);
    const quizData = useMemo(() => {
      if (!quizPair) return null;
      const side = Math.abs(quizSeed) % 2;
      return {
        definition: quizPair.definitions[side],
        options: quizPair.pair,
        correctIndex: side,
      };
    }, [quizPair, quizSeed]);

    return (
        <Screen scroll contentStyle={styles.container}>
            <Card style={styles.heroCard} glow>
                <View style={styles.heroHeader}>
                    <View style={styles.heroCopy}>
                        <Text style={styles.heroEyebrow}>Pronunciation Tool</Text>
                        <Text style={styles.h1}>Confusing Pairs</Text>
                        <Text style={styles.sub}>
                            Listen, compare, and reveal meaning only when needed. This keeps the focus on sound discrimination first.
                        </Text>
                    </View>
                    <View style={styles.heroMetric}>
                        <Text style={styles.heroMetricValue}>{filtered.length}</Text>
                        <Text style={styles.heroMetricLabel}>Pairs</Text>
                    </View>
                </View>
                <View style={styles.heroModeRow}>
                    <Text style={styles.modeInfoLabel}>Mode</Text>
                    <TouchableOpacity
                        onPress={() => setPracticeMode((v) => !v)}
                        style={[styles.modeBtn, practiceMode && styles.modeBtnActive]}
                    >
                        <Text style={[styles.modeText, practiceMode && styles.modeTextActive]}>
                            {practiceMode ? 'Practice On' : 'Reveal On'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Card>

            <Card style={styles.controlsCard}>
              <Text style={styles.sectionTitle}>Find a Pair</Text>
              <TextInput
                style={styles.search}
                placeholder="Search word or meaning..."
                value={query}
                onChangeText={setQuery}
                placeholderTextColor={colors.muted}
              />
              <Text style={styles.resultsLabel}>{filtered.length} pair(s) visible</Text>
            </Card>
            <Card style={styles.quizCard}>
              <Text style={styles.quizTitle}>Quick Pronunciation Check</Text>
              {quizData ? (
                <>
                  <Text style={styles.quizPrompt}>Which word matches this meaning?</Text>
                  <Text style={styles.quizDef}>{quizData.definition}</Text>
                  <View style={styles.quizOptions}>
                    {quizData.options.map((opt, idx) => {
                      const selected = quizChoice === idx;
                      const correct = quizChecked && idx === quizData.correctIndex;
                      const wrong = quizChecked && selected && idx !== quizData.correctIndex;
                      return (
                        <TouchableOpacity
                          key={`${opt}-${idx}`}
                          style={[
                            styles.quizOption,
                            selected && styles.quizOptionSelected,
                            correct && styles.quizOptionCorrect,
                            wrong && styles.quizOptionWrong,
                          ]}
                          onPress={() => !quizChecked && setQuizChoice(idx)}
                        >
                          <Text style={styles.quizOptionText}>{opt}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => {
                        if (quizChoice == null) return;
                        setQuizChecked(true);
                      }}
                      style={styles.actionBtn}
                    >
                      <Text style={styles.actionText}>Check</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => { setQuizSeed((s) => s + 1); setQuizChoice(null); setQuizChecked(false); }}
                      style={styles.actionBtnGhost}
                    >
                      <Text style={styles.actionTextGhost}>Next</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <Text style={styles.hiddenText}>No quiz data.</Text>
              )}
            </Card>

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <WordPairCard item={item} practiceMode={practiceMode} speakText={speakText} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: spacing.md,
    },
    heroCard: {
        marginBottom: spacing.lg,
        backgroundColor: '#172554',
        borderColor: '#172554',
    },
    heroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    heroCopy: {
        flex: 1,
    },
    heroEyebrow: {
        fontSize: typography.xsmall,
        color: '#BFDBFE',
        fontFamily: typography.fontHeadline,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.xs,
    },
    heroMetric: {
        minWidth: 78,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
        backgroundColor: 'rgba(255,255,255,0.10)',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    heroMetricValue: {
        fontSize: typography.h3,
        color: '#FFFFFF',
        fontFamily: typography.fontHeadline,
    },
    heroMetricLabel: {
        marginTop: 2,
        fontSize: typography.xsmall,
        color: '#BFDBFE',
        textTransform: 'uppercase',
    },
    heroModeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    modeInfoLabel: {
        fontSize: typography.small,
        color: '#DBEAFE',
    },
    sectionTitle: {
        fontSize: typography.small,
        fontFamily: typography.fontHeadline,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    h1: {
        fontSize: typography.h1,
        fontFamily: typography.fontHeadline,
        color: '#FFFFFF',
        marginBottom: spacing.xs,
    },
    sub: {
        fontSize: typography.small,
        color: '#DBEAFE',
        lineHeight: 20,
    },
    listContent: {
        paddingBottom: spacing.xxl,
    },
    controlsCard: {
        marginBottom: spacing.md,
    },
    search: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.secondary,
        fontSize: typography.body,
        color: colors.text,
    },
    resultsLabel: {
        marginTop: spacing.sm,
        fontSize: typography.small,
        color: colors.muted,
    },
    modeBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.secondary,
        alignSelf: 'flex-start',
        backgroundColor: colors.surface,
    },
    modeBtnActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    modeText: {
        fontSize: 12,
        color: colors.primary,
        fontFamily: typography.fontHeadline,
    },
    modeTextActive: {
        color: '#fff',
    },
    card: {
        marginBottom: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.surface,
    },
    pairRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    wordSide: {
        flex: 1,
        alignItems: 'flex-start',
    },
    divider: {
        width: 1,
        backgroundColor: colors.secondary,
        marginHorizontal: spacing.md,
    },
    wordSpeakBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: 4,
    },
    wordTitle: {
        fontSize: typography.h3,
        fontFamily: typography.fontHeadline,
        color: colors.primary,
    },
    speakIcon: {
        fontSize: 18,
    },
    phonetic: {
        fontSize: 12,
        color: '#A8C0FF',
        fontFamily: 'Courier',
        marginBottom: spacing.xs,
    },
    definitionText: {
        fontSize: typography.small,
        color: colors.text,
        lineHeight: 18,
    },
    hiddenText: {
        fontSize: 12,
        color: colors.muted,
    },
    actionRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    actionBtn: {
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: colors.primarySoft,
    },
    actionText: {
        color: colors.primaryDark,
        fontSize: 12,
        fontFamily: typography.fontHeadline,
    },
    actionBtnGhost: {
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.secondary,
        backgroundColor: '#fff',
    },
    actionTextGhost: {
        color: colors.text,
        fontSize: 12,
        fontFamily: typography.fontHeadline,
    },
    quizCard: {
        marginBottom: spacing.md,
        padding: spacing.md,
        backgroundColor: '#F8FAFF',
        borderWidth: 1,
        borderColor: '#D9E6FF',
    },
    quizTitle: {
        fontSize: typography.small,
        fontFamily: typography.fontHeadline,
        color: colors.primaryDark,
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    quizPrompt: {
        fontSize: typography.small,
        color: colors.muted,
        marginBottom: 4,
    },
    quizDef: {
        fontSize: typography.body,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    quizOptions: {
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    quizOption: {
        borderWidth: 1,
        borderColor: colors.secondary,
        borderRadius: 10,
        padding: spacing.sm,
        backgroundColor: '#fff',
    },
    quizOptionSelected: {
        borderColor: colors.primary,
        backgroundColor: '#EEF4FF',
    },
    quizOptionCorrect: {
        borderColor: '#16A34A',
        backgroundColor: '#ECFDF3',
    },
    quizOptionWrong: {
        borderColor: '#DC2626',
        backgroundColor: '#FEF2F2',
    },
    quizOptionText: {
        fontSize: typography.small,
        color: colors.text,
    },
});
