import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

const INITIAL_THREADS = [
    {
        id: '1',
        author: 'EconPrepper',
        faculty: 'Economics',
        title: 'Has anyone passed the proficiency without taking prep class?',
        content: "I'm planning to skip the prep year entirely. What materials should I focus on for the listening section?",
        likes: 14,
        replies: 3,
        time: '2h ago',
        hasLiked: false
    },
    {
        id: '2',
        author: 'EngStud24',
        faculty: 'Engineering',
        title: 'Need a study buddy for Advanced C1 Writing',
        content: "Hey, I struggle with Cause & Effect essays. Anyone want to exchange essays and grade them together?",
        likes: 8,
        replies: 5,
        time: '5h ago',
        hasLiked: true
    }
];

export default function DiscussionForumsScreen({ navigation }) {
    const [threads, setThreads] = useState(INITIAL_THREADS);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handlePost = () => {
        if (!newTitle.trim() || !newContent.trim()) {
            Alert.alert("Error", "Please fill in both title and content.");
            return;
        }

        const newThread = {
            id: Date.now().toString(),
            author: 'You',
            faculty: 'Your Department',
            title: newTitle.trim(),
            content: newContent.trim(),
            likes: 0,
            replies: 0,
            time: 'Just now',
            hasLiked: false
        };

        setThreads([newThread, ...threads]); // Add to top
        setNewTitle('');
        setNewContent('');
        setIsPosting(false);
    };

    const toggleLike = (id) => {
        setThreads(threads.map(t => {
            if (t.id === id) {
                return {
                    ...t,
                    hasLiked: !t.hasLiked,
                    likes: t.hasLiked ? t.likes - 1 : t.likes + 1
                };
            }
            return t;
        }));
    };

    return (
        <Screen scroll contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View style={styles.flexFill}>
                    <Text style={styles.pageTitle}>Academic Forums</Text>
                    <Text style={styles.pageSub}>English-Only Community</Text>
                </View>
                <TouchableOpacity onPress={() => setIsPosting(!isPosting)} style={styles.createBtn}>
                    <Ionicons name={isPosting ? "close" : "create-outline"} size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView style={styles.flexFill} enabled={Platform.OS !== 'web'} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    {isPosting && (
                        <Card style={styles.postComposer} glow>
                            <Text style={styles.composerHead}>Create New Thread</Text>
                            <TextInput
                                style={styles.titleInput}
                                placeholder="Thread Title..."
                                value={newTitle}
                                onChangeText={setNewTitle}
                                maxLength={60}
                            />
                            <TextInput
                                style={styles.contentInput}
                                placeholder="What would you like to discuss? (English only)..."
                                value={newContent}
                                onChangeText={setNewContent}
                                multiline
                                textAlignVertical="top"
                            />
                            <TouchableOpacity style={styles.submitBtn} onPress={handlePost}>
                                <Text style={styles.submitBtnText}>Publish Post</Text>
                                <Ionicons name="paper-plane" size={16} color="#fff" style={styles.submitIcon} />
                            </TouchableOpacity>
                        </Card>
                    )}

                    {threads.map((thread) => (
                        <Card key={thread.id} style={styles.threadCard}>
                            <View style={styles.threadMeta}>
                                <View style={styles.authorBadge}>
                                    <Ionicons name="person-circle" size={18} color={colors.primary} />
                                    <Text style={styles.authorText}>{thread.author}</Text>
                                </View>
                                <Text style={styles.timeText}>{thread.time}</Text>
                            </View>

                            <Text style={styles.threadTitle}>{thread.title}</Text>
                            <Text style={styles.threadContent}>{thread.content}</Text>

                            <View style={styles.threadActions}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, thread.hasLiked && styles.actionBtnActive]}
                                    onPress={() => toggleLike(thread.id)}
                                >
                                    <Ionicons name={thread.hasLiked ? "heart" : "heart-outline"} size={16} color={thread.hasLiked ? colors.error : colors.muted} />
                                    <Text style={[styles.actionVal, thread.hasLiked && styles.actionValActive]}>{thread.likes}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionBtn}>
                                    <Ionicons name="chatbubble-outline" size={16} color={colors.muted} />
                                    <Text style={styles.actionVal}>{thread.replies} Replies</Text>
                                </TouchableOpacity>
                            </View>
                        </Card>
                    ))}

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.lg, paddingHorizontal: spacing.xl },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
    pageTitle: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
    pageSub: { fontSize: typography.xsmall, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },
    createBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadow.sm },

    scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },

    postComposer: { padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.xl, backgroundColor: '#fff', borderWidth: 2, borderColor: colors.primarySoft },
    composerHead: { fontSize: 13, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', marginBottom: spacing.md },
    titleInput: { backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: radius.md, padding: spacing.md, fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
    contentInput: { backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: radius.md, padding: spacing.md, fontSize: 14, color: colors.text, height: 120, marginBottom: spacing.md },
    submitBtn: { backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: spacing.md, borderRadius: radius.md },
    submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

    threadCard: { padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.md, backgroundColor: '#fff', ...shadow.slight },
    threadMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    authorBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
    authorText: { fontSize: 11, fontWeight: '800', color: colors.primaryDark, marginLeft: 4 },
    timeText: { fontSize: 11, color: colors.muted, fontWeight: '600' },
    threadTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.xs, lineHeight: 24 },
    threadContent: { fontSize: 14, color: colors.text, lineHeight: 20, opacity: 0.8, marginBottom: spacing.md },

    threadActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: spacing.md, gap: spacing.md },
    actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.02)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
    actionBtnActive: { backgroundColor: 'rgba(231,76,60,0.1)' },
    actionVal: { fontSize: 13, fontWeight: '700', color: colors.muted, marginLeft: 6 },
    actionValActive: { color: colors.error },

    flexFill: { flex: 1 },
    submitIcon: { marginLeft: 8 },
    bottomSpacer: { height: 60 }
});
