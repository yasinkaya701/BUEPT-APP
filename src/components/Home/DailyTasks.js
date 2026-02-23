import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../Card';
import Button from '../Button';
import { colors, spacing, typography } from '../../theme/tokens';

export default function DailyTasks({ adaptive, navigation }) {
    return (
        <Card style={styles.card}>
            <Text style={styles.h3}>Daily Tasks</Text>

            <View style={styles.checkRow}>
                <Text style={styles.checkItem}>• {adaptive.daily.reading}</Text>
                <Button label="Start" variant="secondary" onPress={() => navigation.navigate('Reading')} style={styles.btnShadow} />
            </View>
            <View style={styles.separator} />

            <View style={styles.checkRow}>
                <Text style={styles.checkItem}>• {adaptive.daily.listening}</Text>
                <Button label="Start" variant="secondary" onPress={() => navigation.navigate('Listening')} style={styles.btnShadow} />
            </View>
            <View style={styles.separator} />

            <View style={styles.checkRow}>
                <Text style={styles.checkItem}>• {adaptive.daily.grammar}</Text>
                <Button label="Start" variant="secondary" onPress={() => navigation.navigate('Grammar')} style={styles.btnShadow} />
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
        marginBottom: spacing.md,
        letterSpacing: -0.3,
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
        paddingVertical: spacing.xs,
    },
    checkItem: {
        flex: 1,
        fontSize: typography.body,
        fontFamily: typography.fontBody,
        color: colors.text,
        lineHeight: 22,
    },
    separator: {
        height: 1,
        backgroundColor: colors.secondary,
        marginVertical: spacing.sm,
    },
    btnShadow: {
        minWidth: 90, // Make tiny "Start" buttons more compact
        height: 44,
    }
});
