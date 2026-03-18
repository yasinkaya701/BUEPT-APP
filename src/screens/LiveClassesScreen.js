import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Screen from '../components/Screen';
import { colors, spacing, radius } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MOCK_CHAT_POOL = [
    { user: 'Ahmet', text: 'Can you explain the inversion rule again?' },
    { user: 'Selin', text: 'Yeah, I didn\'t get that part either.' },
    { user: 'ProfT', text: 'Sure, we will review inversion in 5 minutes.', isMod: true },
    { user: 'Deniz', text: 'Thanks!' },
    { user: 'Burak', text: 'Is this topic included in the midterm?' },
    { user: 'Zeynep', text: 'No, only up to relative clauses.' }
];

export default function LiveClassesScreen({ navigation }) {
    const [chat, setChat] = useState([
        { id: 'start', user: 'System', text: 'Welcome to Advanced Grammar Stream. Room is muted.', isMod: true }
    ]);
    const [myMsg, setMyMsg] = useState('');
    const scrollRef = useRef();
    const chatPoolIndex = useRef(0);

    // Simulate incoming chat messages
    useEffect(() => {
        const interval = setInterval(() => {
            if (chatPoolIndex.current < MOCK_CHAT_POOL.length) {
                const nextMsg = MOCK_CHAT_POOL[chatPoolIndex.current];
                setChat(prev => [...prev, { id: Date.now().toString(), ...nextMsg }]);
                chatPoolIndex.current += 1;
                // Auto scroll 
                setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
            }
        }, 3500); // New message every 3.5s

        return () => clearInterval(interval);
    }, []);

    const handleSend = () => {
        if (!myMsg.trim()) return;
        setChat(prev => [...prev, { id: Date.now().toString(), user: 'You', text: myMsg.trim() }]);
        setMyMsg('');
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    };

    return (
        <Screen scroll contentStyle={styles.container}>
            <View style={styles.videoPlayerFrame}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <Ionicons name="chevron-down" size={28} color="#fff" />
                </TouchableOpacity>
                <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE 2.4k</Text>
                </View>
                <Ionicons name="play-circle" size={80} color="rgba(255,255,255,0.4)" style={styles.mockPlayBtn} />
                <View style={styles.videoInfoOverlay}>
                    <Text style={styles.videoTitle}>Grammar Crash Course: Inversions</Text>
                    <Text style={styles.videoSub}>Prof. Dr. Sarah Jenkins</Text>
                </View>
            </View>

            <KeyboardAvoidingView style={styles.flexFill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatHeadText}>Live Discussion</Text>
                </View>

                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={styles.chatScroll}
                    showsVerticalScrollIndicator={false}
                >
                    {chat.map(msg => (
                        <View key={msg.id} style={styles.chatMsgRow}>
                            <Text style={[styles.chatUser, msg.isMod && { color: colors.success }, msg.user === 'You' && { color: colors.primary }]}>
                                {msg.user}
                                {msg.isMod && <Ionicons name="checkmark-circle" size={12} color={colors.success} />}
                            </Text>
                            <Text style={styles.chatText}>: {msg.text}</Text>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.inputArea}>
                    <TextInput
                        style={styles.input}
                        placeholder="Chat publicly..."
                        value={myMsg}
                        onChangeText={setMyMsg}
                        onSubmitEditing={handleSend}
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                        <Ionicons name="send" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    videoPlayerFrame: { width: '100%', height: 250, backgroundColor: '#2c3e50', justifyContent: 'center', alignItems: 'center' },
    closeBtn: { position: 'absolute', top: 40, left: 20, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    liveBadge: { position: 'absolute', top: 40, right: 20, backgroundColor: 'rgba(231,76,60,0.9)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', marginRight: 6 },
    liveText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    mockPlayBtn: { opacity: 0.5 },
    videoInfoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.md, backgroundColor: 'rgba(0,0,0,0.6)' },
    videoTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 2 },
    videoSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },

    chatHeader: { padding: spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    chatHeadText: { fontSize: 14, fontWeight: '800', color: colors.text, textTransform: 'uppercase' },

    chatScroll: { padding: spacing.md, flexGrow: 1, backgroundColor: '#fff' },
    chatMsgRow: { flexDirection: 'row', marginBottom: spacing.sm, flexWrap: 'wrap' },
    chatUser: { fontSize: 14, fontWeight: '800', color: colors.text },
    chatText: { fontSize: 14, color: 'rgba(0,0,0,0.8)', lineHeight: 20 },

    inputArea: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
    input: { flex: 1, backgroundColor: 'rgba(0,0,0,0.04)', paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.pill, fontSize: 14, color: colors.text },
    sendBtn: { padding: spacing.sm, marginLeft: spacing.xs },

    flexFill: { flex: 1 }
});
