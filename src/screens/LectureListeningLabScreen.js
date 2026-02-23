import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { speakEnglish, stopEnglishTts } from '../utils/ttsEnglish';

// Simulated lecture transcript
const LECTURE_SCRIPT = "Welcome everyone to Introduction to Macroeconomics. Today we're going to discuss the concept of inflation. Now, inflation is defined as a general increase in prices and a fall in the purchasing value of money. It's essentially what happens when the money supply grows faster than the rate of economic output. As a fundamental principle, central banks attempt to limit inflation, aiming to keep the economy running smoothly. Take out your notes, because we will look at three historic examples...";

/** Safe TTS stop */
const safeTtsStop = () => { stopEnglishTts(); };

export default function LectureListeningLabScreen({ navigation }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); // 0 to 100
    const [notes, setNotes] = useState('');
    const durationSec = 45; // Simulated 45 second audio
    const timerRef = useRef(null);
    const progressRef = useRef(0);

    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
            safeTtsStop();
        };
    }, []);

    const togglePlay = () => {
        if (isPlaying) {
            // PAUSE
            clearInterval(timerRef.current);
            safeTtsStop();
            setIsPlaying(false);
        } else {
            // PLAY
            setIsPlaying(true);
            if (progressRef.current >= 100) {
                progressRef.current = 0;
                setProgress(0);
            }
            speakEnglish(LECTURE_SCRIPT, { rate: 0.45 });

            timerRef.current = setInterval(() => {
                progressRef.current += (100 / durationSec) * 0.5; // Update every 500ms
                if (progressRef.current >= 100) {
                    clearInterval(timerRef.current);
                    setIsPlaying(false);
                    progressRef.current = 100;
                }
                setProgress(Math.min(progressRef.current, 100));
            }, 500);
        }
    };

    const handleScrub = (e) => {
        const x = e.nativeEvent.locationX;
        const totalWidth = e.currentTarget.offsetWidth || 300; // rough boundary fallback
        const newProg = Math.max(0, Math.min(100, (x / totalWidth) * 100));
        progressRef.current = newProg;
        setProgress(newProg);
        if (isPlaying) {
            safeTtsStop();
            speakEnglish("Seeking...", { rate: 0.5 }); // Syncing TTS midway is complex without native modules, so simulated seek state
        }
    };

    const formatTime = (percent) => {
        const secs = Math.floor((percent / 100) * durationSec);
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <Screen contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Listening Lab</Text>
                    <Text style={styles.pageSub}>Econ 101 Lecture</Text>
                </View>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    <Card style={styles.playerCard} glow>
                        <View style={styles.coverBox}>
                            <Ionicons name="mic" size={48} color="#fff" />
                        </View>
                        <Text style={styles.trackTitle}>Prof. Davis: Macroeconomics</Text>
                        <Text style={styles.trackSub}>Module 3: Inflation Metrics</Text>

                        {/* Scrubber */}
                        <View style={styles.scrubberRow}>
                            <Text style={styles.timeText}>{formatTime(progress)}</Text>
                            <TouchableOpacity style={styles.progressBarBg} onPress={handleScrub} activeOpacity={0.8}>
                                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                                <View style={[styles.progressKnob, { left: `${progress}%` }]} />
                            </TouchableOpacity>
                            <Text style={styles.timeText}>{formatTime(100)}</Text>
                        </View>

                        {/* Controls */}
                        <View style={styles.controlsRow}>
                            <TouchableOpacity style={styles.sideBtn} onPress={() => { progressRef.current = Math.max(0, progressRef.current - 15); setProgress(progressRef.current) }}>
                                <Ionicons name="play-back" size={24} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
                                <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#fff" style={{ marginLeft: isPlaying ? 0 : 4 }} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.sideBtn} onPress={() => { progressRef.current = Math.min(100, progressRef.current + 15); setProgress(progressRef.current) }}>
                                <Ionicons name="play-forward" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </Card>

                    <Text style={styles.sectionTitle}>Cornell Notes</Text>
                    <Card style={styles.notesCard}>
                        <View style={styles.notesHeader}>
                            <View style={styles.cueCol}>
                                <Text style={styles.notesLabel}>CUES / VOCAB</Text>
                            </View>
                            <View style={styles.notesCol}>
                                <Text style={styles.notesLabel}>MAIN NOTES</Text>
                            </View>
                        </View>
                        <View style={styles.notesBody}>
                            <TextInput
                                style={[styles.textArea, styles.cueTextArea]}
                                multiline
                                placeholder="- Inflation\n- CPI"
                                textAlignVertical="top"
                            />
                            <View style={styles.vDivider} />
                            <TextInput
                                style={[styles.textArea, styles.mainTextArea]}
                                multiline
                                placeholder="Take detailed notes here while the audio plays. Focus on bullet points..."
                                value={notes}
                                onChangeText={setNotes}
                                textAlignVertical="top"
                            />
                        </View>
                    </Card>

                    <View style={{ height: 40 }} />
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

    scroll: { paddingHorizontal: spacing.xl },

    playerCard: { padding: spacing.xl, alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.xl, marginBottom: spacing.lg },
    coverBox: { width: 120, height: 120, borderRadius: radius.lg, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md, ...shadow.slight },
    trackTitle: { fontSize: 18, fontWeight: '800', color: colors.primaryDark, marginBottom: 4 },
    trackSub: { fontSize: 13, color: colors.muted, fontWeight: '600', marginBottom: spacing.xl },

    scrubberRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: spacing.xl, gap: spacing.sm },
    timeText: { fontSize: 11, color: colors.muted, fontFamily: 'Courier', fontWeight: '800', width: 35, textAlign: 'center' },
    progressBarBg: { flex: 1, height: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3, justifyContent: 'center' },
    progressBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3, position: 'absolute' },
    progressKnob: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primary, position: 'absolute', marginLeft: -7, ...shadow.slight },

    controlsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxl },
    playBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadow.md },
    sideBtn: { padding: spacing.sm },

    sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
    notesCard: { padding: 0, overflow: 'hidden', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.secondary },
    notesHeader: { flexDirection: 'row', backgroundColor: colors.primarySoft, borderBottomWidth: 1, borderBottomColor: colors.secondary },
    cueCol: { flex: 1, padding: spacing.sm, borderRightWidth: 1, borderRightColor: colors.secondary },
    notesCol: { flex: 2, padding: spacing.sm },
    notesLabel: { fontSize: 11, fontWeight: '800', color: colors.primary, textAlign: 'center' },

    notesBody: { flexDirection: 'row', height: 300, backgroundColor: '#fff' },
    vDivider: { width: 1, backgroundColor: colors.secondary },
    textArea: { padding: spacing.md, fontSize: 14, color: colors.text, lineHeight: 22 },
    cueTextArea: { flex: 1 },
    mainTextArea: { flex: 2 }
});
