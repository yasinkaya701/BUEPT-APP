import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

const INITIAL_TASKS = [
    { id: '1', title: 'Submit Essay Draft 1', course: 'ENG 101', due: 'Today, 23:59', status: 'pending', type: 'writing' },
    { id: '2', title: 'Listen to Lecture 4', course: 'ECON 202', due: 'Tomorrow', status: 'pending', type: 'listening' },
    { id: '3', title: 'Read Chapter 3', course: 'HIST 105', due: 'Next Week', status: 'completed', type: 'reading' }
];

export default function AssignmentsScreen({ navigation }) {
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [activeTab, setActiveTab] = useState('pending'); // pending or completed

    const handleComplete = (id) => {
        Alert.alert("Confirm Submission", "Are you sure you want to mark this assignment as completed and submit it?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Submit",
                onPress: () => {
                    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
                }
            }
        ]);
    };

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const compTasks = tasks.filter(t => t.status === 'completed');
    const displayList = activeTab === 'pending' ? pendingTasks : compTasks;

    const getIcon = (type) => {
        if (type === 'writing') return 'pencil';
        if (type === 'listening') return 'headset';
        if (type === 'reading') return 'book';
        return 'document-text';
    };

    return (
        <Screen contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Assignments</Text>
                    <Text style={styles.pageSub}>Instructor Tasks</Text>
                </View>
            </View>

            <View style={styles.tabWrap}>
                <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'pending' && styles.tabBtnActive]}
                    onPress={() => setActiveTab('pending')}
                >
                    <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>To Do ({pendingTasks.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'completed' && styles.tabBtnActive]}
                    onPress={() => setActiveTab('completed')}
                >
                    <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>Completed ({compTasks.length})</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {displayList.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="checkmark-done-circle-outline" size={64} color={colors.secondary} />
                        <Text style={styles.emptyText}>No assignments found in this view.</Text>
                    </View>
                ) : (
                    displayList.map((task) => (
                        <Card key={task.id} style={styles.taskCard}>
                            <View style={styles.iconCol}>
                                <Ionicons name={getIcon(task.type)} size={24} color={activeTab === 'completed' ? colors.success : colors.primary} />
                            </View>
                            <View style={styles.textCol}>
                                <Text style={styles.taskTitle}>{task.title}</Text>
                                <View style={styles.metaRow}>
                                    <View style={styles.courseBadge}>
                                        <Text style={styles.courseText}>{task.course}</Text>
                                    </View>
                                    <Text style={[styles.dueText, activeTab === 'pending' && task.due.includes('Today') && { color: colors.error }]}>
                                        {activeTab === 'completed' ? 'Done' : `Due: ${task.due}`}
                                    </Text>
                                </View>
                            </View>

                            {activeTab === 'pending' && (
                                <TouchableOpacity style={styles.submitBtn} onPress={() => handleComplete(task.id)}>
                                    <Ionicons name="checkmark" size={20} color="#fff" />
                                </TouchableOpacity>
                            )}
                            {activeTab === 'completed' && (
                                <View style={styles.doneMark}>
                                    <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                                </View>
                            )}
                        </Card>
                    ))
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.sm, paddingHorizontal: spacing.xl },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
    pageTitle: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
    pageSub: { fontSize: typography.xsmall, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },

    tabWrap: { flexDirection: 'row', paddingHorizontal: spacing.xl, marginBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', backgroundColor: '#fff', paddingBottom: spacing.sm, gap: spacing.md },
    tabBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.03)' },
    tabBtnActive: { backgroundColor: colors.primaryDark },
    tabText: { fontSize: 13, fontWeight: '800', color: colors.muted },
    tabTextActive: { color: '#fff' },

    scroll: { paddingHorizontal: spacing.xl },

    taskCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderRadius: radius.lg, backgroundColor: '#fff', marginBottom: spacing.md, ...shadow.slight },
    iconCol: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.03)', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
    textCol: { flex: 1 },
    taskTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    courseBadge: { backgroundColor: colors.primarySoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    courseText: { fontSize: 10, fontWeight: '900', color: colors.primaryDark },
    dueText: { fontSize: 12, fontWeight: '700', color: colors.muted },

    submitBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.success, justifyContent: 'center', alignItems: 'center', ...shadow.sm },
    doneMark: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

    emptyState: { alignItems: 'center', paddingVertical: 80 },
    emptyText: { marginTop: spacing.md, color: colors.muted, fontWeight: '600', fontSize: 14 }
});
