import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Complex curriculum state payload
const CURRICULUM_DATA = {
    1: {
        theme: "Introduction to Academic Writing",
        tasks: [
            { id: 'w1_1', title: 'Read: Cause & Effect Basics', type: 'reading', status: 'completed' },
            { id: 'w1_2', title: 'Submit Draft 1', type: 'writing', status: 'pending' }
        ]
    },
    2: {
        theme: "Advanced Syntactical Structures",
        tasks: [
            { id: 'w2_1', title: 'Grammar Quiz: Relative Clauses', type: 'quiz', status: 'in_progress' },
            { id: 'w2_2', title: 'Listen: Climate Change Lecture', type: 'listening', status: 'pending' },
            { id: 'w2_3', title: 'Submit Final Essay 1', type: 'writing', status: 'pending' }
        ]
    },
    3: {
        theme: "Argumentative Debates",
        tasks: [
            { id: 'w3_1', title: 'Live Class: Group Debate Prep', type: 'live', status: 'pending' },
            { id: 'w3_2', title: 'Read: Pro vs Con Articles', type: 'reading', status: 'pending' }
        ]
    }
};

export default function CurriculumSyncScreen({ navigation }) {
    const [selectedWeek, setSelectedWeek] = useState(2); // Default to current week
    const currentPayload = CURRICULUM_DATA[selectedWeek];

    const getIconForType = (type) => {
        switch (type) {
            case 'reading': return 'book';
            case 'writing': return 'pencil';
            case 'quiz': return 'help-circle';
            case 'listening': return 'headset';
            case 'live': return 'videocam';
            default: return 'document-text';
        }
    };

    const getColorForStatus = (status) => {
        if (status === 'completed') return colors.success;
        if (status === 'in_progress') return '#f39c12';
        return colors.muted;
    };

    return (
        <Screen contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Instructor Sync</Text>
                    <Text style={styles.pageSub}>Classroom Curriculum Tracker</Text>
                </View>
            </View>

            <View style={styles.weekScrollerWrap}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekScroller}>
                    {[1, 2, 3, 4, 5, 6, 7].map(week => (
                        <TouchableOpacity
                            key={week}
                            style={[styles.weekPill, selectedWeek === week && styles.weekPillActive]}
                            onPress={() => setSelectedWeek(week)}
                        >
                            <Text style={[styles.weekPillText, selectedWeek === week && styles.weekPillTextActive]}>W{week}</Text>
                            {week === 2 && <View style={styles.currentDot} />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {!currentPayload ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={64} color={colors.secondary} />
                        <Text style={styles.emptyTitle}>No Data Synced</Text>
                        <Text style={styles.emptyDesc}>The instructor has not uploaded the payload for Week {selectedWeek} yet.</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.themeHero}>
                            <Text style={styles.themeLabel}>Week {selectedWeek} Module Theme:</Text>
                            <Text style={styles.themeVal}>{currentPayload.theme}</Text>
                        </View>

                        <Text style={styles.sectionHeader}>Mandatory Assignments ({currentPayload.tasks.length})</Text>

                        {currentPayload.tasks.map((task) => (
                            <Card key={task.id} style={styles.taskCard}>
                                <View style={styles.taskIconWrap}>
                                    <Ionicons name={getIconForType(task.type)} size={20} color={colors.primary} />
                                </View>
                                <View style={styles.taskTextWrap}>
                                    <Text style={styles.taskTitle}>{task.title}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        <View style={[styles.statusDot, { backgroundColor: getColorForStatus(task.status) }]} />
                                        <Text style={[styles.statusText, { color: getColorForStatus(task.status) }]}>
                                            {task.status.replace('_', ' ').toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                            </Card>
                        ))}
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.lg, paddingHorizontal: spacing.xl },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
    pageTitle: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
    pageSub: { fontSize: typography.xsmall, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },

    weekScrollerWrap: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', backgroundColor: '#fff', paddingBottom: spacing.md },
    weekScroller: { paddingHorizontal: spacing.xl, gap: spacing.sm },
    weekPill: { width: 50, height: 60, borderRadius: radius.lg, backgroundColor: 'rgba(0,0,0,0.02)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    weekPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    weekPillText: { fontSize: 16, fontWeight: '800', color: colors.text },
    weekPillTextActive: { color: '#fff' },
    currentDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.error, position: 'absolute', top: 6, right: 6 },

    scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },

    themeHero: { backgroundColor: colors.primarySoft, padding: spacing.xl, borderRadius: radius.xl, marginBottom: spacing.xxl, borderWidth: 1, borderColor: 'rgba(52, 152, 219, 0.2)' },
    themeLabel: { fontSize: 12, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', marginBottom: 4 },
    themeVal: { fontSize: 24, fontWeight: '900', color: colors.primaryDark, fontFamily: typography.fontHeadline, lineHeight: 30 },

    sectionHeader: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
    taskCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.md, backgroundColor: '#fff', ...shadow.slight },
    taskIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.03)', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
    taskTextWrap: { flex: 1 },
    taskTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    statusText: { fontSize: 10, fontWeight: '800' },

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
    emptyTitle: { fontSize: typography.h3, fontWeight: '800', color: colors.muted, marginTop: spacing.md, marginBottom: spacing.xs },
    emptyDesc: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 20, paddingHorizontal: spacing.xl }
});
