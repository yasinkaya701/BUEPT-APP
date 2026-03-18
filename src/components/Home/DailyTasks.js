import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Card from '../Card';
import Button from '../Button';
import { colors, spacing, typography, radius } from '../../theme/tokens';

const TASKS_META = [
    { key: 'reading', icon: 'book-outline', route: 'Reading', color: '#1D4ED8' },
    { key: 'listening', icon: 'headset-outline', route: 'Listening', color: '#166534' },
    { key: 'grammar', icon: 'create-outline', route: 'Grammar', color: '#9A3412' },
];

export default function DailyTasks({ adaptive, navigation }) {
    return (
        <Card style={styles.card}>
            <Text style={styles.h3}>Daily Tasks</Text>
            <Text style={styles.body}>Complete these three core tasks today.</Text>
            {TASKS_META.map((item) => (
                <View key={item.key} style={styles.taskCard}>
                    <View style={styles.checkRow}>
                        <View style={[styles.iconWrap, { backgroundColor: `${item.color}18` }]}>
                            <Ionicons name={item.icon} size={16} color={item.color} />
                        </View>
                        <Text style={styles.checkItem}>{adaptive.daily[item.key]}</Text>
                        <Button label="Start" variant="secondary" onPress={() => navigation.navigate(item.route)} style={styles.btnShadow} />
                    </View>
                </View>
            ))}
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
    body: {
        fontSize: typography.small,
        color: colors.muted,
        marginBottom: spacing.sm,
    },
    taskCard: {
        borderWidth: 1,
        borderColor: colors.secondary,
        borderRadius: radius.md,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        marginBottom: spacing.xs,
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    iconWrap: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkItem: {
        flex: 1,
        fontSize: typography.small,
        fontFamily: typography.fontBody,
        color: colors.text,
        lineHeight: 20,
    },
    btnShadow: {
        minWidth: 84,
        height: 40,
    }
});
