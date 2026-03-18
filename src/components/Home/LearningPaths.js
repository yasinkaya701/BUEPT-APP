import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Card from '../Card';
import { colors, spacing, typography, radius } from '../../theme/tokens';

const LEVELS = [
    { id: 'P1', label: 'P1 (A1)', title: 'Starter', icon: 'leaf-outline', bg: '#ECFDF3', color: '#166534' },
    { id: 'P2', label: 'P2 (A2)', title: 'Foundation', icon: 'trending-up-outline', bg: '#EFF6FF', color: '#1D4ED8' },
    { id: 'P3', label: 'P3 (B1)', title: 'Intermediate', icon: 'bar-chart-outline', bg: '#F5F3FF', color: '#5B21B6' },
    { id: 'P4', label: 'P4 (B2)', title: 'Advanced', icon: 'ribbon-outline', bg: '#FFF7ED', color: '#9A3412' },
];

export default function LearningPaths({ setLevel, navigation }) {
    return (
        <Card style={styles.card}>
            <Text style={styles.h3}>Learning Paths</Text>
            <Text style={styles.body}>Select your current level to open a tailored study plan.</Text>
            <View style={styles.row}>
                {LEVELS.map((level) => (
                    <TouchableOpacity
                        key={level.id}
                        style={[styles.levelCard, { backgroundColor: level.bg }]}
                        onPress={() => {
                            setLevel(level.id);
                            navigation.navigate('StudyPlan');
                        }}
                        activeOpacity={0.85}
                    >
                        <View style={styles.levelHead}>
                            <Ionicons name={level.icon} size={15} color={level.color} />
                            <Text style={[styles.levelTag, { color: level.color }]}>{level.title}</Text>
                        </View>
                        <Text style={styles.levelLabel}>{level.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.lg,
    },
    h3: {
        fontSize: typography.h3,
        fontFamily: typography.fontHeadline,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
        letterSpacing: -0.3,
    },
    body: {
        fontSize: typography.small,
        fontFamily: typography.fontBody,
        color: colors.muted,
        marginBottom: spacing.md,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    levelCard: {
        width: '48.5%',
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        gap: 6,
    },
    levelHead: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    levelTag: {
        fontSize: typography.xsmall,
        fontFamily: typography.fontHeadline,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    levelLabel: {
        fontSize: typography.small,
        color: colors.text,
        fontFamily: typography.fontHeadline,
    },
});
