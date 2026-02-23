import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../Card';
import Button from '../Button';
import { colors, spacing, typography } from '../../theme/tokens';

export default function LearningPaths({ setLevel, navigation }) {
    return (
        <Card style={styles.card}>
            <Text style={styles.h3}>Learning Paths</Text>
            <Text style={styles.body}>P1–P4 structured tracks with daily drills</Text>
            <View style={styles.row}>
                <Button label="P1 (A1)" variant="secondary" onPress={() => { setLevel('P1'); navigation.navigate('StudyPlan'); }} />
                <Button label="P2 (A2)" variant="secondary" onPress={() => { setLevel('P2'); navigation.navigate('StudyPlan'); }} />
                <Button label="P3 (B1)" variant="secondary" onPress={() => { setLevel('P3'); navigation.navigate('StudyPlan'); }} />
                <Button label="P4 (B2)" variant="secondary" onPress={() => { setLevel('P4'); navigation.navigate('StudyPlan'); }} />
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
});
