import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../Card';
import Button from '../Button';
import { colors, spacing, typography, radius } from '../../theme/tokens';
import { useAppState } from '../../context/AppState';
import { levelFromXP } from '../../utils/gamification';

export default function HeroWidget({ adaptive, navigation }) {
    const { xp } = useAppState();
    const userLevel = levelFromXP(xp || 0);

    // Calculate specific progress inside the current level
    const prevLevelXp = userLevel > 1 ? Math.pow(userLevel - 1, 2) * 50 : 0;
    const nextLevelXp = Math.pow(userLevel, 2) * 50;
    const currentLevelProgress = Math.max(0, xp - prevLevelXp);
    const requiredForNext = nextLevelXp - prevLevelXp;
    let progressPct = Math.min(100, Math.round((currentLevelProgress / requiredForNext) * 100));
    if (isNaN(progressPct)) progressPct = 0;

    return (
        <Card style={styles.hero} glow>
            <View style={styles.heroGlow1} />
            <View style={styles.heroGlow2} />

            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.heroLabel}>Daily Plan</Text>
                    <Text style={styles.heroTitle}>{adaptive.focusTitle}</Text>
                </View>

                {/* Level / Gamification Banner */}
                <View style={styles.levelRow}>
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>Lv. {userLevel}</Text>
                    </View>
                    <View style={styles.xpCol}>
                        <View style={styles.xpBarContainer}>
                            <View style={[styles.xpBarFill, { width: `${progressPct}%` }]} />
                        </View>
                        <Text style={styles.xpText}>{xp} XP</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.heroBody}>
                {adaptive.focusAction}
            </Text>

            <View style={styles.heroRow}>
                <Button
                    label="Open Plan"
                    variant="secondary"
                    onPress={() => navigation.navigate('StudyPlan')}
                    style={styles.btnShadow}
                />
                <Button
                    label="Progress"
                    onPress={() => navigation.navigate('Progress')}
                    style={styles.btnShadow}
                />
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    hero: {
        marginBottom: spacing.lg,
        marginTop: spacing.xs,
        borderRadius: 28,
        backgroundColor: colors.primary,
        padding: spacing.xl,
        paddingVertical: spacing.xxl,
        overflow: 'hidden',
        borderWidth: 0,
    },
    heroGlow1: {
        position: 'absolute',
        right: -40,
        top: -40,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: colors.accent,
        opacity: 0.45,
    },
    heroGlow2: {
        position: 'absolute',
        left: -20,
        bottom: -60,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.success,
        opacity: 0.3,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    heroLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: typography.small,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: spacing.xs,
        fontFamily: typography.fontHeadline,
        fontWeight: '700',
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: typography.h1,
        fontFamily: typography.fontHeadline,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    heroBody: {
        color: colors.primaryLight,
        fontSize: typography.body,
        marginBottom: spacing.xl,
        lineHeight: 22,
    },
    heroRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    btnShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },

    // Gamification Styles
    levelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: spacing.xs,
        paddingRight: spacing.md,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    levelBadge: {
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: radius.pill,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
    },
    levelText: {
        color: '#fff',
        fontFamily: typography.fontHeadline,
        fontWeight: '800',
        fontSize: 14,
    },
    xpCol: {
        justifyContent: 'center',
    },
    xpBarContainer: {
        width: 50,
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 2,
    },
    xpBarFill: {
        height: '100%',
        backgroundColor: colors.successLight,
        borderRadius: 3,
    },
    xpText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 10,
        fontFamily: typography.fontHeadline,
        fontWeight: '600',
    }
});
