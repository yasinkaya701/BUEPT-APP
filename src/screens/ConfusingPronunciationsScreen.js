import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { speakText } from '../hooks/useTts';
import { colors, spacing, typography } from '../theme/tokens';
import confusingPairs from '../../data/confusing_pronunciations.json';

function WordPairCard({ item }) {
    const speakA = () => speakText(item.pair[0]);
    const speakB = () => speakText(item.pair[1]);

    return (
        <Card style={styles.card}>
            <View style={styles.pairRow}>
                {/* Word A */}
                <View style={styles.wordSide}>
                    <TouchableOpacity onPress={speakA} style={styles.wordSpeakBtn}>
                        <Text style={styles.wordTitle}>{item.pair[0]}</Text>
                        <Text style={styles.speakIcon}>🔊</Text>
                    </TouchableOpacity>
                    <Text style={styles.phonetic}>{item.phonetics[0]}</Text>
                    <Text style={styles.definitionText}>{item.definitions[0]}</Text>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Word B */}
                <View style={styles.wordSide}>
                    <TouchableOpacity onPress={speakB} style={styles.wordSpeakBtn}>
                        <Text style={styles.wordTitle}>{item.pair[1]}</Text>
                        <Text style={styles.speakIcon}>🔊</Text>
                    </TouchableOpacity>
                    <Text style={styles.phonetic}>{item.phonetics[1]}</Text>
                    <Text style={styles.definitionText}>{item.definitions[1]}</Text>
                </View>
            </View>
        </Card>
    );
}

export default function ConfusingPronunciationsScreen() {
    return (
        <Screen contentStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.h1}>🗣 Confusing Pairs</Text>
                <Text style={styles.sub}>
                    Listen and repeat carefully. Some sound identical, others have subtle differences!
                </Text>
            </View>

            <FlatList
                data={confusingPairs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <WordPairCard item={item} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: spacing.md,
    },
    header: {
        marginBottom: spacing.lg,
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
        lineHeight: 18,
    },
    listContent: {
        paddingBottom: spacing.xxl,
    },
    card: {
        marginBottom: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.surface,
    },
    pairRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    wordSide: {
        flex: 1,
        alignItems: 'flex-start',
    },
    divider: {
        width: 1,
        backgroundColor: colors.secondary,
        marginHorizontal: spacing.md,
    },
    wordSpeakBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: 4,
    },
    wordTitle: {
        fontSize: typography.h3,
        fontFamily: typography.fontHeadline,
        color: colors.primary,
    },
    speakIcon: {
        fontSize: 18,
    },
    phonetic: {
        fontSize: 12,
        color: '#A8C0FF',
        fontFamily: 'Courier',
        marginBottom: spacing.xs,
    },
    definitionText: {
        fontSize: typography.small,
        color: colors.text,
        lineHeight: 18,
    },
});
