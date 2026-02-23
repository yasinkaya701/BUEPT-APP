import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import Voice from '@react-native-voice/voice';
import Screen from '../components/Screen';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { speakEnglish, stopEnglishTts } from '../utils/ttsEnglish';

export default function AISpeakingPartnerScreen({ navigation }) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [messages, setMessages] = useState([
        { id: '1', role: 'ai', text: 'Hello! I am your AI Speaking Partner. I will evaluate your fluency, coherence, and pronunciation. Ready?' }
    ]);
    const [micVol, setMicVol] = useState(0);
    const [aiTyping, setAiTyping] = useState(false);

    // Dynamic wave animation based on mic volume
    const waveAnims = useRef([new Animated.Value(1), new Animated.Value(1), new Animated.Value(1), new Animated.Value(1), new Animated.Value(1)]).current;

    useEffect(() => {
        if (!isListening) {
            waveAnims.forEach(anim => Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start());
            return;
        }

        const interval = setInterval(() => {
            waveAnims.forEach((anim, i) => {
                const target = 1 + (Math.random() * (micVol / 2));
                Animated.timing(anim, { toValue: target, duration: 100, useNativeDriver: true }).start();
            });
        }, 100);

        return () => clearInterval(interval);
    }, [micVol, isListening, waveAnims]);

    useEffect(() => {
        Voice.onSpeechStart = () => setIsListening(true);
        Voice.onSpeechEnd = () => setIsListening(false);
        Voice.onSpeechError = (e) => {
            console.log('Voice Error:', e);
            setIsListening(false);
        };
        Voice.onSpeechResults = (e) => {
            if (e.value && e.value.length > 0) {
                setTranscript(e.value[0]);
            }
        };
        Voice.onSpeechVolumeChanged = (e) => setMicVol(e.value);

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
            stopEnglishTts();
        };
    }, []);

    const toggleListening = async () => {
        if (isListening) {
            await Voice.stop();
            if (transcript.trim()) {
                handleUserMessage(transcript);
                setTranscript('');
            }
        } else {
            setTranscript('');
            try {
                await Voice.start('en-US');
            } catch (e) {
                console.error(e);
            }
        }
    };

    const analyzePronunciation = (txt) => {
        const lower = txt.toLowerCase();
        let feedback = "Excellent fluency!";
        if (lower.includes("think") || lower.includes("thought") || lower.includes("through")) {
            feedback = "Great effort. Watch your /θ/ (th) sound in words like 'think'. Make sure your tongue touches your upper teeth.";
        } else if (lower.includes("very") || lower.includes("well")) {
            feedback = "Good point. Be careful distinguishing the /v/ and /w/ sounds.";
        }
        return feedback;
    };

    const handleUserMessage = (text) => {
        const newMsg = { id: Date.now().toString(), role: 'user', text };
        setMessages(prev => [...prev, newMsg]);
        setAiTyping(true);

        // Mock AI response for demo
        setTimeout(() => {
            const aiReplyText = analyzePronunciation(text);
            const aiMsg = { id: (Date.now() + 1).toString(), role: 'ai', text: aiReplyText };
            setMessages(prev => [...prev, aiMsg]);
            setAiTyping(false);

            speakEnglish(aiReplyText, { rate: 0.48 });

            // Re-activate mic automatically after AI finishes speaking
            // Use a callback form to avoid stale closure on isListening
            setTimeout(() => {
                setIsListening(current => {
                    if (!current) {
                        // Trigger listening only if not already active
                        Voice.start('en-US').catch(e => console.error(e));
                    }
                    return current;
                });
            }, Math.max(3000, aiReplyText.length * 50));

        }, 1500);
    };

    return (
        <Screen contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <Text style={styles.title}>AI Speaking Partner</Text>
            </View>

            <ScrollView contentContainerStyle={styles.chatScroll} showsVerticalScrollIndicator={false}>
                {messages.map(m => (
                    <View key={m.id} style={[styles.bubbleWrap, m.role === 'user' ? styles.bubbleWrapUser : styles.bubbleWrapAI]}>
                        <View style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
                            {m.role === 'ai' && <Ionicons name="sparkles" size={14} color={colors.primary} style={{ marginBottom: 4 }} />}
                            <Text style={[styles.bubbleText, m.role === 'user' && styles.bubbleTextUser]}>
                                {m.text}
                            </Text>
                        </View>
                    </View>
                ))}

                {transcript ? (
                    <View style={[styles.bubbleWrap, styles.bubbleWrapUser]}>
                        <View style={[styles.bubble, styles.bubbleListening]}>
                            <Text style={[styles.bubbleText, styles.bubbleTextUser, { opacity: 0.7 }]}>{transcript}...</Text>
                        </View>
                    </View>
                ) : null}

                {aiTyping && (
                    <View style={[styles.bubbleWrap, styles.bubbleWrapAI]}>
                        <View style={[styles.bubble, styles.bubbleAI, { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }]}>
                            <Ionicons name="sparkles" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                            <Text style={[styles.bubbleText, { fontSize: 13, color: colors.muted, fontStyle: 'italic' }]}>Analyzing phonetics...</Text>
                        </View>
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.micStatusRow}>
                    {isListening ? (
                        <View style={styles.waveformContainer}>
                            {waveAnims.map((anim, idx) => (
                                <Animated.View key={idx} style={[styles.waveBar, { transform: [{ scaleY: anim }] }]} />
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.idleText}>Tap to start speaking</Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.micBtn, isListening && styles.micBtnActive]}
                    onPress={toggleListening}
                    activeOpacity={0.8}
                >
                    <Ionicons name={isListening ? "stop" : "mic"} size={32} color={isListening ? '#fff' : colors.primary} />
                </TouchableOpacity>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.sm, paddingHorizontal: spacing.xl },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
    title: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },

    chatScroll: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
    },
    bubbleWrap: {
        marginBottom: spacing.md,
        width: '100%'
    },
    bubbleWrapAI: { alignItems: 'flex-start' },
    bubbleWrapUser: { alignItems: 'flex-end' },
    bubble: {
        maxWidth: '85%',
        padding: spacing.md,
        borderRadius: radius.lg,
        ...shadow.elev1
    },
    bubbleAI: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
    },
    bubbleUser: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    bubbleListening: {
        backgroundColor: colors.primarySoft,
        borderWidth: 1,
        borderColor: colors.primary,
        borderBottomRightRadius: 4,
        ...shadow.none
    },
    bubbleText: {
        fontSize: typography.body,
        color: colors.text,
        lineHeight: 22,
    },
    bubbleTextUser: {
        color: '#fff',
    },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingVertical: spacing.xl,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)'
    },
    micBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadow.elev2
    },
    micBtnActive: {
        backgroundColor: colors.error,
    },
    micStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        height: 20
    },
    listeningText: {
        color: colors.success,
        fontFamily: typography.fontHeadline,
        fontWeight: '700',
        marginLeft: 8
    },
    idleText: {
        color: colors.muted,
        fontSize: typography.small,
        fontWeight: '600'
    },
    waveformContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 24,
    },
    waveBar: {
        width: 4,
        height: 12,
        backgroundColor: colors.success,
        marginHorizontal: 3,
        borderRadius: 2
    }
});
