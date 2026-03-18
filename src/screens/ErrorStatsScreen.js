import React, { useMemo, useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import { speakText } from '../hooks/useTts';

export default function ErrorStatsScreen({ navigation }) {
    const { errorWords, grammarErrors, clearErrorWords, clearGrammarErrors } = useAppState();
    const [activeTab, setActiveTab] = useState('words'); // 'words' | 'grammar'

    // Sort error words by frequency
    const sortedWords = useMemo(() => {
        return Object.keys(errorWords)
            .map(word => ({ word, count: errorWords[word] }))
            .sort((a, b) => b.count - a.count);
    }, [errorWords]);

    // Sort grammar errors by frequency
    const sortedGrammar = useMemo(() => {
        return Object.keys(grammarErrors)
            .map(id => ({ id, ...grammarErrors[id] }))
            .sort((a, b) => b.count - a.count);
    }, [grammarErrors]);

    return (
        <Screen scroll contentStyle={styles.container}>
            <Text style={styles.h1}>Error Statistics</Text>
            <Text style={styles.sub}>Review your common mistakes to improve faster</Text>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'words' && styles.tabBtnActive]}
                    onPress={() => setActiveTab('words')}
                >
                    <Text style={[styles.tabText, activeTab === 'words' && styles.tabTextActive]}>
                        Vocabulary ({sortedWords.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'grammar' && styles.tabBtnActive]}
                    onPress={() => setActiveTab('grammar')}
                >
                    <Text style={[styles.tabText, activeTab === 'grammar' && styles.tabTextActive]}>
                        Grammar ({sortedGrammar.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
                {activeTab === 'words' && (
                    <>
                        {sortedWords.length === 0 ? (
                            <Card style={styles.emptyCard}>
                                <Text style={styles.emptyText}>No vocabulary errors recorded yet. Practice in Vocab Quiz!</Text>
                                <Button label="Practice Vocab" onPress={() => navigation.navigate('VocabPractice')} />
                            </Card>
                        ) : (
                            <>
                                <View style={styles.clearRow}>
                                    <Button variant="ghost" label="Clear Vocab Errors" onPress={clearErrorWords} />
                                </View>
                                {sortedWords.map(item => (
                                    <View key={item.word} style={styles.listItem}>
                                        <View style={styles.wordInfo}>
                                            <Text style={styles.wordText}>{item.word}</Text>
                                            <Text style={styles.countText}>{item.count} mistakes</Text>
                                        </View>
                                        <View style={styles.actionRow}>
                                            <TouchableOpacity onPress={() => speakText(item.word)} style={styles.iconBtn}>
                                                <Text style={styles.iconText}>🔊</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => navigation.navigate('SynonymFinder')} style={styles.iconBtn}>
                                                <Text style={styles.iconText}>🔍</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </>
                        )}
                    </>
                )}

                {activeTab === 'grammar' && (
                    <>
                        {sortedGrammar.length === 0 ? (
                            <Card style={styles.emptyCard}>
                                <Text style={styles.emptyText}>No grammar errors recorded yet. Practice in Grammar!</Text>
                                <Button label="Practice Grammar" onPress={() => navigation.navigate('Grammar')} />
                            </Card>
                        ) : (
                            <>
                                <View style={styles.clearRow}>
                                    <Button variant="ghost" label="Clear Grammar Errors" onPress={clearGrammarErrors} />
                                </View>
                                {sortedGrammar.map(item => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.listItem}
                                        onPress={() => navigation.navigate('GrammarDetail', { taskId: item.id })}
                                    >
                                        <View style={styles.wordInfo}>
                                            <Text style={styles.wordText} numberOfLines={2}>{item.title}</Text>
                                            <Text style={styles.countText}>{item.count} mistakes</Text>
                                        </View>
                                        <Text style={styles.arrowIcon}>→</Text>
                                    </TouchableOpacity>
                                ))}
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: spacing.md,
    },
    h1: {
        fontSize: typography.h1,
        fontFamily: typography.fontHeadline,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    sub: {
        fontSize: typography.small,
        color: colors.muted,
        marginBottom: spacing.md,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        padding: 4,
        borderRadius: 12,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.secondary,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabBtnActive: {
        backgroundColor: colors.primary,
    },
    tabText: {
        fontSize: typography.small,
        fontFamily: typography.fontHeadline,
        color: colors.text,
    },
    tabTextActive: {
        color: '#fff',
    },
    listContainer: {
        flex: 1,
    },
    emptyCard: {
        alignItems: 'center',
        padding: spacing.xl,
        marginTop: spacing.lg,
    },
    emptyText: {
        fontSize: typography.body,
        color: colors.muted,
        textAlign: 'center',
        marginBottom: spacing.md,
        lineHeight: 22,
    },
    clearRow: {
        alignItems: 'flex-end',
        marginBottom: spacing.sm,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: 14,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.secondary,
    },
    wordInfo: {
        flex: 1,
        marginRight: spacing.sm,
    },
    wordText: {
        fontSize: typography.h3,
        fontFamily: typography.fontHeadline,
        color: '#B71C1C', // red hue for errors
        marginBottom: 2,
    },
    countText: {
        fontSize: typography.small,
        color: colors.muted,
    },
    actionRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    iconBtn: {
        padding: 6,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    iconText: {
        fontSize: 18,
    },
    arrowIcon: {
        fontSize: 20,
        color: colors.muted,
    },
});
