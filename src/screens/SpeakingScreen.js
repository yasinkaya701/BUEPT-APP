import React, { useMemo, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput
} from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import Chip from '../components/Chip';
import { colors, spacing, typography } from '../theme/tokens';
import prompts from '../../data/speaking_prompts.json';
import { useAppState } from '../context/AppState';

const LEVELS = ['All', 'P1', 'P2', 'P3', 'P4'];
const LEVEL_LABELS = { All: 'All', P1: 'P1 (A1)', P2: 'P2 (A2)', P3: 'P3 (B1)', P4: 'P4 (B2)' };
const CATEGORIES = ['All', 'Personal', 'Education', 'Technology', 'Environment', 'Society', 'Academic', 'Health'];

const TYPE_COLORS = {
    description: '#4CAF50',
    comparison: '#2196F3',
    discussion: '#FF9800',
    argument: '#9C27B0',
    'problem-solution': '#F44336',
    'cause-effect': '#00BCD4',
    critical: '#795548',
};

const LEVEL_COLORS = {
    P1: '#4CAF50',
    P2: '#2196F3',
    P3: '#FF9800',
    P4: '#9C27B0',
};

function PromptCard({ item, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[item.level] }]}>
                        <Text style={styles.levelText}>{LEVEL_LABELS[item.level] || item.level}</Text>
                    </View>
                    <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[item.type] || '#607D8B' }]}>
                        <Text style={styles.typeText}>{item.type}</Text>
                    </View>
                    <View style={styles.timeBadge}>
                        <Text style={styles.timeText}>⏱ {item.time}</Text>
                    </View>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardPrompt} numberOfLines={2}>{item.prompt}</Text>
                <View style={styles.cardFooter}>
                    <Text style={styles.categoryText}>📁 {item.category}</Text>
                    <Text style={styles.tapHint}>Tap to practice →</Text>
                </View>
            </Card>
        </TouchableOpacity>
    );
}

export default function SpeakingScreen({ navigation }) {
    const [level, setLevel] = useState('All');
    const [category, setCategory] = useState('All');
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const { mockHistory } = useAppState();

    const filtered = useMemo(() => {
        return prompts.filter(p => {
            const matchLevel = level === 'All' || p.level === level;
            const matchCat = category === 'All' || p.category === category;
            const matchType = typeFilter === 'All' || p.type === typeFilter;
            const q = query.trim().toLowerCase();
            const matchQuery = !q || `${p.title} ${p.prompt} ${p.category} ${p.type}`.toLowerCase().includes(q);
            return matchLevel && matchCat && matchType && matchQuery;
        });
    }, [level, category, query, typeFilter]);

    const typeOptions = useMemo(() => ['All', ...Array.from(new Set(prompts.map((p) => p.type).filter(Boolean)))], []);
    const speakingAttemptCount = useMemo(
        () => mockHistory.filter((m) => m?.result?.speaking != null).length,
        [mockHistory]
    );
    const featuredPrompt = useMemo(() => {
        const pool = filtered.length ? filtered : prompts;
        const idx = Math.abs((new Date().getDate() * 37) % pool.length);
        return pool[idx];
    }, [filtered]);

    const stats = useMemo(() => {
        const total = prompts.length;
        const byLevel = {};
        LEVELS.slice(1).forEach(l => {
            byLevel[l] = prompts.filter(p => p.level === l).length;
        });
        return { total, byLevel };
    }, []);

    return (
        <Screen scroll contentStyle={styles.content}>
            <Text style={styles.h1}>🎤 Speaking Practice</Text>

            {/* Stats Banner */}
            <Card style={styles.statsBanner}>
                <Text style={styles.statsTitle}>BUEPT Speaking Tasks</Text>
                <View style={styles.statsRow}>
                    {LEVELS.slice(1).map(l => (
                        <View key={l} style={styles.statItem}>
                            <Text style={[styles.statNum, { color: LEVEL_COLORS[l] }]}>{stats.byLevel[l]}</Text>
                            <Text style={styles.statLabel}>{LEVEL_LABELS[l]}</Text>
                        </View>
                    ))}
                    <View style={styles.statItem}>
                        <Text style={[styles.statNum, { color: colors.primary }]}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                </View>
            </Card>

            <Card style={styles.missionCard}>
                <Text style={styles.missionTitle}>Speaking Mission</Text>
                <Text style={styles.missionBody}>This week: 3 speaking sessions + 1 AI partner conversation.</Text>
                <Text style={styles.missionMeta}>Recorded attempts: {speakingAttemptCount}</Text>
                <View style={styles.filterRow}>
                    <Button label="AI Partner" variant="secondary" onPress={() => navigation.navigate('AISpeakingPartner')} />
                    <Button label="Mock Interview" variant="secondary" onPress={() => navigation.navigate('SpeakingMockInterview')} />
                    <Button label="Start Featured" onPress={() => featuredPrompt && navigation.navigate('SpeakingDetail', { prompt: featuredPrompt })} />
                </View>
            </Card>

            {/* Tips */}
            <Card style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>💡 Speaking Tips</Text>
                <Text style={styles.tip}>• Read the question aloud using TTS before answering</Text>
                <Text style={styles.tip}>• Use the model answer as a reference — don't memorise it</Text>
                <Text style={styles.tip}>• Record yourself and listen back for self-assessment</Text>
                <Text style={styles.tip}>• Focus on fluency first, accuracy second</Text>
            </Card>

            {/* Confusing Pronunciations Module Link */}
            <TouchableOpacity onPress={() => navigation.navigate('ConfusingPronunciations')} activeOpacity={0.85}>
                <Card style={styles.pronunciationCard}>
                    <Text style={styles.pronunciationIcon}>🗣</Text>
                    <View style={styles.pronunciationTextContainer}>
                        <Text style={styles.pronunciationTitle}>Confusing Pronunciations</Text>
                        <Text style={styles.pronunciationSub}>Practice tricky word pairs (e.g. desert / dessert)</Text>
                    </View>
                    <Text style={styles.pronunciationArrow}>→</Text>
                </Card>
            </TouchableOpacity>

            {/* Level Filter */}
            <Text style={styles.filterLabel}>Level</Text>
            <View style={styles.filterRow}>
                {LEVELS.map(l => (
                    <Chip
                        key={l}
                        label={LEVEL_LABELS[l]}
                        active={level === l}
                        onPress={() => setLevel(l)}
                    />
                ))}
            </View>

            {/* Category Filter */}
            <Text style={styles.filterLabel}>Category</Text>
            <View style={styles.filterRow}>
                {CATEGORIES.map(c => (
                    <Chip
                        key={c}
                        label={c}
                        active={category === c}
                        onPress={() => setCategory(c)}
                    />
                ))}
            </View>

            <Text style={styles.filterLabel}>Question Type</Text>
            <View style={styles.filterRow}>
                {typeOptions.map((t) => (
                    <Chip key={t} label={t} active={typeFilter === t} onPress={() => setTypeFilter(t)} />
                ))}
            </View>

            <Text style={styles.filterLabel}>Search</Text>
            <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search speaking tasks..."
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
            />

            {/* Results count */}
            <Text style={styles.resultCount}>{filtered.length} task{filtered.length !== 1 ? 's' : ''} found</Text>

            {featuredPrompt && (
                <Card style={styles.featuredCard}>
                    <Text style={styles.featuredLabel}>Featured Prompt</Text>
                    <Text style={styles.featuredTitle}>{featuredPrompt.title}</Text>
                    <Text style={styles.featuredText} numberOfLines={2}>{featuredPrompt.prompt}</Text>
                    <Button label="Practice Now" onPress={() => navigation.navigate('SpeakingDetail', { prompt: featuredPrompt })} />
                </Card>
            )}

            {/* Prompt List */}
            {filtered.map(item => (
                <PromptCard
                    key={item.id}
                    item={item}
                    onPress={() => navigation.navigate('SpeakingDetail', { prompt: item })}
                />
            ))}
        </Screen>
    );
}

const styles = StyleSheet.create({
    content: { paddingBottom: spacing.xl },
    h1: {
        fontSize: typography.h1,
        fontFamily: typography.fontHeadline,
        color: colors.text,
        marginBottom: spacing.md,
    },
    statsBanner: {
        marginBottom: spacing.md,
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    statsTitle: {
        color: '#fff',
        fontSize: typography.body,
        fontFamily: typography.fontHeadline,
        marginBottom: spacing.sm,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: { alignItems: 'center' },
    statNum: {
        fontSize: typography.h2,
        fontFamily: typography.fontHeadline,
        color: '#fff',
    },
    statLabel: {
        fontSize: typography.small,
        color: '#DDE8FF',
        marginTop: 2,
    },
    missionCard: {
        marginBottom: spacing.md,
        backgroundColor: '#0F172A',
        borderColor: '#1E3A8A',
    },
    missionTitle: {
        fontSize: typography.h3,
        fontFamily: typography.fontHeadline,
        color: '#93C5FD',
        marginBottom: spacing.xs,
    },
    missionBody: {
        fontSize: typography.small,
        color: '#DBEAFE',
        marginBottom: spacing.xs,
    },
    missionMeta: {
        fontSize: typography.xsmall,
        color: '#94A3B8',
        marginBottom: spacing.sm,
    },
    tipsCard: { marginBottom: spacing.md },
    tipsTitle: {
        fontSize: typography.body,
        fontFamily: typography.fontHeadline,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    tip: {
        fontSize: typography.small,
        color: colors.muted,
        marginBottom: 4,
    },
    filterLabel: {
        fontSize: typography.small,
        color: colors.muted,
        marginBottom: spacing.xs,
        fontFamily: typography.fontHeadline,
    },
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    pronunciationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        backgroundColor: colors.surface,
        borderColor: colors.primary,
        borderWidth: 1,
    },
    pronunciationIcon: {
        fontSize: 32,
        marginRight: spacing.sm,
    },
    pronunciationTextContainer: {
        flex: 1,
    },
    pronunciationTitle: {
        fontSize: typography.body,
        fontFamily: typography.fontHeadline,
        color: colors.primary,
    },
    pronunciationSub: {
        fontSize: typography.small,
        color: colors.muted,
        marginTop: 2,
    },
    pronunciationArrow: {
        fontSize: typography.h2,
        color: colors.primary,
        fontFamily: typography.fontHeadline,
    },
    resultCount: {
        fontSize: typography.small,
        color: colors.muted,
        marginBottom: spacing.sm,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: 10,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        color: colors.text,
        marginBottom: spacing.md,
    },
    featuredCard: {
        marginBottom: spacing.md,
        borderColor: '#BFDBFE',
        backgroundColor: '#EFF6FF',
    },
    featuredLabel: {
        fontSize: typography.xsmall,
        color: '#1D4ED8',
        textTransform: 'uppercase',
        marginBottom: 4,
        fontFamily: typography.fontHeadline,
    },
    featuredTitle: {
        fontSize: typography.body,
        color: colors.text,
        fontFamily: typography.fontHeadline,
        marginBottom: 4,
    },
    featuredText: {
        fontSize: typography.small,
        color: colors.muted,
        marginBottom: spacing.sm,
    },
    card: { marginBottom: spacing.md },
    cardHeader: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginBottom: spacing.sm,
        flexWrap: 'wrap',
    },
    levelBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 999,
    },
    levelText: {
        color: '#fff',
        fontSize: typography.small,
        fontFamily: typography.fontHeadline,
    },
    typeBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 999,
    },
    typeText: {
        color: '#fff',
        fontSize: typography.small,
        fontFamily: typography.fontHeadline,
    },
    timeBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 999,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.secondary,
    },
    timeText: {
        fontSize: typography.small,
        color: colors.muted,
    },
    cardTitle: {
        fontSize: typography.h3,
        fontFamily: typography.fontHeadline,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    cardPrompt: {
        fontSize: typography.body,
        color: colors.muted,
        marginBottom: spacing.sm,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryText: {
        fontSize: typography.small,
        color: colors.muted,
    },
    tapHint: {
        fontSize: typography.small,
        color: colors.primary,
        fontFamily: typography.fontHeadline,
    },
});
