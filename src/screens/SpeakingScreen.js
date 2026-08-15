import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput, useWindowDimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, shadow, radius } from '../theme/tokens';
import prompts from '../../data/speaking_prompts.json';
import { useAppState } from '../context/AppState';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { buildSpeakingSnapshot, evaluateSpeakingModel } from '../utils/speakingModel';
import { useSpeechRecognition, scoreTranscriptCoverage, estimateFluency } from '../hooks/useSpeechRecognition';
import { loadSpeakingPartnerSessions } from '../utils/appStorage';
import SkillHeader from '../components/ui/SkillHeader';
import MetricRail, { MetricTile } from '../components/ui/MetricRail';
import SectionHeader from '../components/ui/SectionHeader';
import FilterBar, { FilterChip } from '../components/ui/FilterBar';
import ScoreRing from '../components/ui/ScoreRing';

const LEVELS = ['ALL', 'P1', 'P2', 'P3', 'P4'];
const LEVEL_LABELS = { ALL: 'All Levels', P1: 'P1 (A1)', P2: 'P2 (A2)', P3: 'P3 (B1)', P4: 'P4 (B2)' };

// (MetricTile / FilterChip now shared from src/components/ui)

export default function SpeakingScreen({ navigation }) {
    const { width } = useWindowDimensions();
    const isWide = width >= 960;
    
    const [levelFilter, setLevelFilter] = useState('ALL');
    const [queryInput, setQueryInput] = useState('');
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    
    const [aiSessions, setAiSessions] = useState([]);
    const [micTargets, setMicTargets] = useState(['Describe your hometown and why you like living there.', 'Explain one benefit of studying abroad.']);
    const [micScore, setMicScore] = useState(null);
    const { mockHistory } = useAppState();

    const micRecognition = useSpeechRecognition({
      onTranscript: (text, interimText) => {
        setMicInterim(interimText);
        if (!text) return;
      },
    });
    const [micInterim, setMicInterim] = useState('');

    const micListeningSecRef = useRef(0);
    const micTimerRef = useRef(null);

    const micStart = useCallback(() => {
      const started = micRecognition.start();
      if (started) {
        setMicInterim('');
        setMicScore(null);
        micListeningSecRef.current = 0;
        micTimerRef.current = setInterval(() => {
          micListeningSecRef.current += 1;
        }, 1000);
      }
    }, [micRecognition]);

    const micStop = useCallback(() => {
      micRecognition.stop();
      if (micTimerRef.current) clearInterval(micTimerRef.current);
      if (micRecognition.transcript) {
        const coverage = scoreTranscriptCoverage(micRecognition.transcript, micTargets);
        const fluency = estimateFluency(micRecognition.transcript, micListeningSecRef.current);
        const scoring = evaluateSpeakingModel({ fluency, accuracy: coverage, elapsedSec: micListeningSecRef.current });
        setMicScore({ coverage, fluency, ...scoring });
      }
    }, [micRecognition, micTargets]);

    useFocusEffect(
      React.useCallback(() => {
        let active = true;
        loadSpeakingPartnerSessions().then((items) => {
          if (active) setAiSessions(Array.isArray(items) ? items : []);
        });
        return () => {
          active = false;
        };
      }, [])
    );

    useEffect(() => {
        const handle = setTimeout(() => {
            setQuery(queryInput);
        }, 120);
        return () => clearTimeout(handle);
    }, [queryInput]);

    const filtered = useMemo(() => {
        return prompts.filter(p => {
            const matchLevel = levelFilter === 'ALL' || p.level === levelFilter;
            const matchType = typeFilter === 'ALL' || p.type === typeFilter;
            const q = query.trim().toLowerCase();
            const matchQuery = !q || `${p.title} ${p.prompt} ${p.category} ${p.type}`.toLowerCase().includes(q);
            return matchLevel && matchType && matchQuery;
        });
    }, [levelFilter, query, typeFilter]);

    const typeOptions = useMemo(() => ['ALL', ...Array.from(new Set(prompts.map((p) => p.type).filter(Boolean)))], []);
    
    const speakingAttemptCount = useMemo(
        () => mockHistory.filter((m) => m?.result?.speaking != null).length + aiSessions.length,
        [aiSessions.length, mockHistory]
    );

    const speakingSnapshot = useMemo(() => {
        const speakingScores = mockHistory
            .map((m) => Number(m?.result?.speaking))
            .filter((v) => Number.isFinite(v));
        const aiScores = aiSessions
            .map((item) => Number(item?.overall))
            .filter((value) => Number.isFinite(value));
        const mergedScores = [...speakingScores, ...aiScores];
        const avg = mergedScores.length
            ? Math.round(mergedScores.reduce((a, b) => a + b, 0) / mergedScores.length)
            : 0;
        return buildSpeakingSnapshot({
            accuracy: avg,
            weeklyPct: Math.min(100, Math.round((speakingAttemptCount / 7) * 100)),
            attempts: speakingAttemptCount,
        });
    }, [aiSessions, mockHistory, speakingAttemptCount]);

    const latestAiSession = aiSessions[0] || null;

    const featuredPrompt = useMemo(() => {
        const pool = filtered.length ? filtered : prompts;
        // Deterministic daily pick
        const idx = Math.abs((new Date().getDate() * 37) % pool.length);
        return pool[idx] || null;
    }, [filtered]);
    
    const resetFilters = useCallback(() => {
        setLevelFilter('ALL');
        setTypeFilter('ALL');
        setQueryInput('');
        setQuery('');
    }, []);

    const renderItem = ({ item }) => {
        return (
            <View style={styles.taskItemWrap}>
                <TouchableOpacity 
                    accessibilityRole="button" 
                    activeOpacity={0.9} 
                    onPress={() => navigation.navigate('SpeakingDetail', { prompt: item })} 
                    style={styles.taskRow}
                >
                    <View style={styles.taskRowBody}>
                        <View style={styles.taskRowHeader}>
                            <Text style={styles.taskRowTitle}>{item.title || item.topic || 'Untitled Prompt'}</Text>
                            <Text style={styles.taskRowOpen}>Practice</Text>
                        </View>
                        <Text style={styles.taskRowMeta}>{item.level || 'All'} · {item.time || '2 min'} · {item.category || 'General'}</Text>
                        
                        <View style={styles.taskBadgeRow}>
                            <FilterChip label={item.type || 'discussion'} active={false} onPress={() => navigation.navigate('SpeakingDetail', { prompt: item })} />
                        </View>
                        <Text style={styles.taskExplainLine} numberOfLines={2}>
                            {item.prompt || (Array.isArray(item.prompts) ? item.prompts[0] : 'No prompt text available')}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    const renderEmpty = () => (
        <Card style={styles.card}>
            <Text style={styles.emptyTitle}>No prompts match current filters</Text>
            <Text style={styles.emptySub}>Try resetting level/type filters or clear the search text.</Text>
            <Button label="Reset Filters" variant="secondary" onPress={resetFilters} />
        </Card>
    );

    return (
        <Screen scroll contentStyle={styles.container}>
            <View style={styles.headerSpacer}>
            <SkillHeader
              skill="speaking"
              icon="mic-outline"
              eyebrow="Speaking Studio"
              title="Speaking"
              description="Prompt-driven speaking practice with AI feedback and quick mode filters."
              rightValue={`${prompts.length}`}
              rightLabel="Topics"
            />
            <Card style={styles.heroCard} glow>
                <View style={styles.heroTopRow}>
                    <View style={styles.heroIconWrap}>
                        <Ionicons name="mic-outline" size={24} color="#BFDBFE" />
                    </View>
                    <View style={styles.heroCopy}>
                        <Text style={styles.heroEyebrow}>Speaking Studio</Text>
                        <Text style={styles.heroTitle}>Choose a prompt, speak, and get AI reviews.</Text>
                        <Text style={styles.heroBody}>One tap to start practice, then return to targeted prompts.</Text>
                    </View>
                    <View style={styles.heroCounter}>
                        <Text style={styles.heroCounterValue}>{prompts.length}</Text>
                        <Text style={styles.heroCounterLabel}>Topics</Text>
                    </View>
                </View>

                <View style={styles.heroActionRow}>
                    <Button
                        label="Start Speaking"
                        icon="mic-outline"
                        onPress={() => navigation.navigate('AISpeakingPartner', { initialMode: 'academic' })}
                    />
                    <Button 
                        label="Full Mock Interview" 
                        variant="secondary" 
                        icon="chatbubbles-outline" 
                        onPress={() => navigation.navigate('SpeakingMockInterview')} 
                    />
                </View>
            </Card>

            {/* Live microphone scoring — real speech recognition on the web */}
            <Card style={styles.card}>
                <SectionHeader
                  icon="mic"
                  title="Live Speaking Score"
                  description={micRecognition.isAvailable
                    ? 'Tap the microphone, read the target sentences out loud, and stop when done to get a real fluency and coverage score.'
                    : 'Microphone scoring works in web browsers. Open the app in a desktop browser (or use "Start Speaking" below).'}
                  accent={micRecognition.isListening ? colors.error : colors.skill.speaking}
                  style={styles.cardInner}
                />
                <View style={styles.cardInner}>
                <View style={styles.targetBox}>
                    <Text style={styles.targetLabel}>Target sentences</Text>
                    {micTargets.map((t) => (
                        <Text key={t} style={styles.targetLine}>◦ {t}</Text>
                    ))}
                    <Button label="Shuffle Targets" variant="ghost" onPress={() => {
                        const pool = prompts.slice().sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                        const idx = Math.floor(Math.random() * Math.max(1, pool.length - 2));
                        setMicTargets([pool[idx]?.prompt || micTargets[0], pool[(idx + 1) % pool.length]?.prompt || micTargets[1]]);
                    }} />
                </View>
                {micRecognition.error ? <Text style={styles.micError}>{micRecognition.error}</Text> : null}
                <View style={styles.micButtonRow}>
                    {micRecognition.isListening ? (
                        <Button label="Stop & Score" variant="errorGhost" icon="stop-outline" onPress={micStop} />
                    ) : (
                        <Button label="Start Recording" variant="primary" icon="mic-outline" onPress={micStart} />
                    )}
                </View>
                {(micRecognition.transcript || micInterim) ? (
                    <View style={styles.micTranscriptBox}>
                        <Text style={styles.micTranscriptText}>{micRecognition.transcript}{micInterim ? ` ${micInterim}` : ''}</Text>
                    </View>
                ) : null}
                {micScore ? (
                    <View style={styles.micResultBox}>
                        <Text style={styles.micResultTitle}>Score: {micScore.overall}% · {micScore.band}</Text>
                        <Text style={styles.micResultSub}>Target coverage {micScore.coverage}% · {micScore.fluency.wpm} wpm · {micScore.fluency.fillerCount} fillers · {Math.floor(micScore.fluency.sentenceCount || 0)} sentences</Text>
                        {micScore.actions.slice(0, 2).map((a) => (
                            <Text key={a} style={styles.micActionLine}>→ {a}</Text>
                        ))}
                    </View>
                ) : null}
                </View>
            </Card>

            <MetricRail>
                <MetricTile value={speakingSnapshot.overall != null ? `${speakingSnapshot.overall}%` : '--'} label="Accuracy" accent="blue" />
                <MetricTile value={String(speakingAttemptCount)} label="Attempts" accent="teal" />
                <MetricTile value={String(aiSessions.length)} label="AI sessions" accent="amber" />
            </MetricRail>

            <Card style={styles.partnerCard}>
                <SectionHeader
                  icon="chatbubbles-outline"
                  title="AI Speaking Partner"
                  description="Start a guided speaking round and get evaluated."
                  accent={colors.skill.speaking}
                  style={styles.cardInner}
                />
                <View style={styles.cardInner}>

                <View style={styles.partnerMetaRow}>
                    {latestAiSession ? (
                        <ScoreRing value={latestAiSession.overall} size={56} stroke={6} />
                    ) : null}
                    <View style={styles.partnerMetaPill}>
                        <Text style={styles.partnerMetaLabel}>Latest AI Score</Text>
                        <Text style={styles.partnerMetaValue}>{latestAiSession ? `${latestAiSession.overall}% · ${latestAiSession.band || ''}`.trim() : 'No AI session yet'}</Text>
                    </View>
                </View>

                <View style={styles.quickStartRow}>
                    <Button label="Opinion" variant="secondary" onPress={() => navigation.navigate('AISpeakingPartner', { initialMode: 'opinion' })} />
                    <Button label="Comparison" variant="secondary" onPress={() => navigation.navigate('AISpeakingPartner', { initialMode: 'comparison' })} />
                    <Button label="Academic" onPress={() => navigation.navigate('AISpeakingPartner', { initialMode: 'academic' })} />
                </View>
                </View>
            </Card>

            <TouchableOpacity onPress={() => navigation.navigate('ConfusingPronunciations')} activeOpacity={0.85}>
                <Card style={styles.pronunciationCard}>
                    <View style={styles.pronunciationIconWrap}>
                        <Ionicons name="volume-high-outline" size={20} color="#D97706" />
                    </View>
                    <View style={styles.pronunciationTextContainer}>
                        <Text style={styles.pronunciationTitle}>Confusing Pronunciations</Text>
                        <Text style={styles.pronunciationSub}>Practice tricky word pairs (e.g. desert / dessert)</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color={colors.muted} />
                </Card>
            </TouchableOpacity>

            <Card style={styles.card}>
                <SectionHeader
                  icon="menu-outline"
                  title="Prompt Library"
                  description="Filter the speaking prompt bank by level and response type."
                  accent={colors.skill.speaking}
                  style={styles.cardInner}
                />
                <View style={styles.cardInner}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={18} color={colors.muted} />
                    <TextInput
                        style={styles.searchInput}
                        value={queryInput}
                        onChangeText={setQueryInput}
                        placeholder="Search prompts, categories..."
                        placeholderTextColor={colors.muted}
                        autoCapitalize="none"
                    />
                    {queryInput.length > 0 ? (
                        <TouchableOpacity onPress={() => setQueryInput('')}>
                            <Ionicons name="close-circle" size={17} color={colors.muted} />
                        </TouchableOpacity>
                    ) : null}
                </View>

                <FilterBar label="Level" scroll>
                    {LEVELS.map(lv => (
                        <FilterChip key={lv} label={LEVEL_LABELS[lv]} active={levelFilter === lv} onPress={() => setLevelFilter(lv)} />
                    ))}
                </FilterBar>

                <FilterBar label="Type">
                    {typeOptions.map(t => (
                        <FilterChip key={t} label={t === 'ALL' ? 'All Types' : String(t).replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} active={typeFilter === t} onPress={() => setTypeFilter(t)} />
                    ))}
                </FilterBar>

                {featuredPrompt && (
                    <View style={styles.featuredContainer}>
                        <Text style={styles.featuredLabel}>Featured Prompt:</Text>
                        <TouchableOpacity style={styles.featuredBox} onPress={() => navigation.navigate('SpeakingDetail', { prompt: featuredPrompt })}>
                            <Text style={styles.featuredBoxTitle}>{featuredPrompt.title}</Text>
                        </TouchableOpacity>
                    </View>
                )}
                </View>
            </Card>

            <View style={styles.listHeaderRow}>
                <Text style={styles.listHeaderTitle}>{filtered.length} Prompts Visible</Text>
            </View>

            {filtered.length === 0 ? renderEmpty() : (
                <View style={[styles.listContent, isWide && styles.listContentWide]}>
                    <View style={isWide ? styles.columnWrapper : null}>
                        {filtered.map(item => (
                            <View key={item.id} style={[styles.itemWrap, isWide && styles.itemWrapWide]}>
                                {renderItem({ item })}
                            </View>
                        ))}
                    </View>
                </View>
            )}
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: spacing.xl,
    },
    headerSpacer: {
        paddingTop: spacing.md,
    },

    listContent: {
        paddingBottom: spacing.xxl + 84,
        paddingHorizontal: spacing.lg,
    },
    listContentWide: {
        paddingHorizontal: spacing.xl,
    },
    columnWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    itemWrap: {
        marginBottom: 12,
    },
    itemWrapWide: {
        width: '48%',
    },
    
    // Hero Widget
    heroCard: {
        backgroundColor: '#172554',
        borderColor: '#172554',
        borderWidth: 1,
        borderRadius: 16,
        padding: spacing.xl,
        marginBottom: spacing.md,
        ...shadow.md,
    },
    heroTopRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    heroIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroCopy: {
        flex: 1,
    },
    heroEyebrow: {
        fontSize: typography.xsmall,
        fontFamily: typography.fontHeadline,
        color: '#BFDBFE',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.xs,
    },
    heroTitle: {
        fontSize: typography.h2,
        fontFamily: typography.fontHeadline,
        color: '#FFFFFF',
        marginBottom: spacing.xs,
    },
    heroBody: {
        fontSize: typography.small,
        color: '#DBEAFE',
        lineHeight: 20,
    },
    heroCounter: {
        minWidth: 90,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        borderRadius: radius.lg,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        alignItems: 'center',
    },
    heroCounterValue: {
        fontSize: 28,
        lineHeight: 32,
        color: '#FFFFFF',
        fontFamily: typography.fontHeadline,
    },
    heroCounterLabel: {
        marginTop: 2,
        fontSize: typography.xsmall,
        color: '#BFDBFE',
        textTransform: 'uppercase',
    },
    heroActionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    actionFlexBtn: {
        flex: 1,
    },
    

    cardInner: {
        paddingHorizontal: spacing.sm,
        paddingBottom: spacing.sm,
    },








    // AI Partner Card
    partnerCard: {
        marginBottom: spacing.md,
        backgroundColor: '#F0F9FF',
        borderColor: '#BAE6FD',
        borderWidth: 1,
        borderRadius: 16,
        padding: spacing.lg,
        ...shadow.sm,
    },



    partnerMetaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    partnerMetaPill: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: '#E0F2FE',
    },
    partnerMetaLabel: {
        fontSize: 11,
        color: '#64748B',
        textTransform: 'uppercase',
        fontWeight: '700',
        marginBottom: 4,
    },
    partnerMetaValue: {
        fontSize: 18,
        fontFamily: typography.fontHeadline,
        color: '#0369A1',
        fontWeight: '800',
    },
    quickStartRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        flexWrap: 'wrap',
    },

    // Pronunciation Highlight
    pronunciationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        backgroundColor: '#FFFBEB',
        borderColor: '#FEF3C7',
        borderWidth: 1,
        borderRadius: 16,
        padding: spacing.md,
        ...shadow.sm,
    },
    pronunciationIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    pronunciationTextContainer: {
        flex: 1,
    },
    pronunciationTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#92400E',
    },
    pronunciationSub: {
        fontSize: 13,
        color: '#B45309',
        marginTop: 2,
    },

    card: {
        marginBottom: spacing.lg,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderColor: '#E2E8F0',
        borderWidth: 1,
        padding: spacing.lg,
        ...shadow.sm,
    },


    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: spacing.md,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        marginBottom: spacing.md,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
        color: '#0F172A',
        padding: 0,
    },
    
    // Chips 
    chipScroll: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    chipScrollTop: {
        marginTop: 8,
    },







    featuredContainer: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    featuredLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 8,
    },
    featuredBox: {
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    featuredBoxTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0F172A',
    },

    listHeaderRow: {
        marginBottom: spacing.sm,
        paddingHorizontal: 4,
    },
    listHeaderTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textOnDarkMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Task Item
    taskItemWrap: {
        flexGrow: 1,
        flexBasis: 280,
        minWidth: 0,
        marginBottom: spacing.md,
    },
    taskRow: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        minHeight: 188,
        ...shadow.sm,
        overflow: 'hidden',
    },
    taskRowBody: {
        padding: spacing.lg,
    },
    taskRowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    taskRowTitle: {
        flex: 1,
        fontSize: 16,
        fontFamily: typography.fontHeadline,
        fontWeight: '700',
        color: '#0F172A',
        marginRight: 12,
    },
    taskRowOpen: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1D4ED8',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        overflow: 'hidden',
    },
    taskRowMeta: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 12,
    },
    taskBadgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 10,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeBlue: { backgroundColor: '#EFF6FF' },
    badgeBlueText: { color: '#1D4ED8' },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    taskExplainLine: {
        fontSize: 13,
        color: '#475569',
        fontStyle: 'italic',
        lineHeight: 20,
    },

    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 8,
    },
    emptySub: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 16,
    },
    targetBox: {
        marginTop: 12,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
    },
    targetLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 6,
    },
    targetLine: {
        fontSize: 14,
        color: '#0F172A',
        lineHeight: 20,
        marginBottom: 4,
    },
    micError: {
        marginTop: 8,
        fontSize: 13,
        color: '#DC2626',
        lineHeight: 18,
    },
    micButtonRow: {
        marginTop: 12,
        alignItems: 'flex-start',
    },
    micTranscriptBox: {
        marginTop: 12,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        maxHeight: 160,
    },
    micTranscriptText: {
        fontSize: 14,
        color: '#334155',
        lineHeight: 20,
    },
    micResultBox: {
        marginTop: 12,
        padding: 14,
        borderRadius: 12,
        backgroundColor: colors.primarySoft || '#EFF6FF',
    },
    micResultTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1D4ED8',
        marginBottom: 4,
    },
    micResultSub: {
        fontSize: 13,
        color: '#334155',
        lineHeight: 19,
        marginBottom: 6,
    },
    micActionLine: {
        fontSize: 13,
        color: '#1E293B',
        lineHeight: 19,
    }
});
