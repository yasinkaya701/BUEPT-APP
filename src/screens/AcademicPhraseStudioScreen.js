
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { executeDirectAiChat } from '../utils/runtimeApi';

const PHRASES = [
  {
    category: "Argumentation & Nuance",
    phrases: [
      { text: "It is ostensibly the case that...", level: "C1", meaning: "Appears to be true but might have hidden complexity.", example: "It is ostensibly the case that economic growth leads to happiness, yet statistics suggest otherwise." },
      { text: "The overarching consensus among scholars is...", level: "C2", meaning: "Most experts agree on this general point.", example: "The overarching consensus among scholars is that climate change requires immediate global intervention." },
      { text: "This phenomenon is fundamentally rooted in...", level: "C1", meaning: "Explaining the core cause of something.", example: "This phenomenon is fundamentally rooted in deep-seated social inequalities." }
    ]
  },
  {
    category: "Counter-Argumentation",
    phrases: [
      { text: "Notwithstanding the validity of this claim...", level: "C2", meaning: "Accepting a point but presenting a stronger opposing one.", example: "Notwithstanding the validity of this claim, the long-term risks remain unacceptably high." },
      { text: "While this perspective carries significant weight, it fails to account for...", level: "C1", meaning: "Criticizing a popular but incomplete view.", example: "While this perspective carries significant weight, it fails to account for the psychological impact on workers." }
    ]
  },
  {
    category: "Emphasis & Significance",
    phrases: [
      { text: "It is of paramount importance to recognize that...", level: "C1", meaning: "Highlighting the most critical part of an argument.", example: "It is of paramount importance to recognize that education is a basic human right." },
      { text: "This leads to a pivotal shift in how we perceive...", level: "C2", meaning: "Showing a major change in understanding.", example: "This discovery leads to a pivotal shift in how we perceive renewable energy storage." }
    ]
  }
];

export default function AcademicPhraseStudioScreen() {
  const [selectedPhrase, setSelectedPhrase] = useState(null);
  const [userSentence, setUserSentence] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkSentence = async () => {
    if (!userSentence.trim() || !selectedPhrase) return;
    setLoading(true);
    setFeedback(null);
    try {
      const reply = await executeDirectAiChat({
        systemPrompt: `You are an Academic Writing Coach. The student is practicing a specific academic phrase: "${selectedPhrase.text}". 
        Evaluate their sentence for:
        1. Correct usage of the phrase.
        2. Grammatical accuracy.
        3. Academic register.
        Provide a score out of 10 and a brief improvement tip.`,
        messages: [{ role: 'user', content: `Student's sentence: "${userSentence}"` }]
      });
      setFeedback(reply);
    } catch (e) {
      setFeedback(`Error checking sentence: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Academic Phrase Studio" scroll>
      <View style={styles.container}>
        <Text style={styles.h1}>Kalıp Çalışma</Text>
        <Text style={styles.sub}>Master advanced C1/C2 structures to boost your BUEPT and IELTS scores.</Text>

        {!selectedPhrase ? (
          PHRASES.map((cat, i) => (
            <View key={i} style={styles.categoryBlock}>
              <Text style={styles.categoryTitle}>{cat.category}</Text>
              {cat.phrases.map((p, j) => (
                <TouchableOpacity key={j} style={styles.phraseCard} onPress={() => setSelectedPhrase(p)}>
                  <View style={styles.phraseHead}>
                    <Text style={styles.phraseText}>{p.text}</Text>
                    <View style={styles.levelBadge}><Text style={styles.levelText}>{p.level}</Text></View>
                  </View>
                  <Text style={styles.meaning}>{p.meaning}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))
        ) : (
          <View>
            <TouchableOpacity style={styles.backBtn} onPress={() => { setSelectedPhrase(null); setUserSentence(''); setFeedback(null); }}>
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
              <Text style={styles.backBtnText}>Back to Library</Text>
            </TouchableOpacity>

            <Card style={styles.activeCard}>
              <Text style={styles.activePhrase}>{selectedPhrase.text}</Text>
              <Text style={styles.meaning}>{selectedPhrase.meaning}</Text>
              <View style={styles.exampleBox}>
                <Text style={styles.exampleTitle}>Example Usage:</Text>
                <Text style={styles.exampleText}>{selectedPhrase.example}</Text>
              </View>
            </Card>

            <Card style={styles.practiceCard}>
              <Text style={styles.h3}>Your Practice</Text>
              <Text style={styles.sub}>Write your own academic sentence using the phrase above:</Text>
              <TextInput
                style={styles.input}
                multiline
                placeholder="Type your sentence here..."
                value={userSentence}
                onChangeText={setUserSentence}
              />
              <Button 
                label={loading ? "Analyzing..." : "Check with AI Coach"} 
                onPress={checkSentence} 
                disabled={loading || !userSentence.trim()} 
              />
            </Card>

            {feedback && (
              <Card style={styles.feedbackCard}>
                <View style={styles.feedbackHeader}>
                  <Ionicons name="school" size={24} color={colors.primary} />
                  <Text style={styles.h3}>Coach Feedback</Text>
                </View>
                <Text style={styles.feedbackText}>{feedback}</Text>
              </Card>
            )}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  h1: { fontSize: 28, fontFamily: typography.fontHeadline, color: colors.text, marginBottom: spacing.xs },
  sub: { fontSize: 14, color: colors.muted, marginBottom: spacing.xl },
  categoryBlock: { marginBottom: spacing.xl },
  categoryTitle: { fontSize: 18, fontWeight: '800', color: colors.primary, marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 1 },
  phraseCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    ...shadow.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phraseHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  phraseText: { fontSize: 17, fontWeight: '700', color: colors.text, flex: 1 },
  levelBadge: { backgroundColor: colors.primarySoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  levelText: { fontSize: 10, fontWeight: '900', color: colors.primaryDark },
  meaning: { fontSize: 14, color: colors.muted, fontStyle: 'italic' },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  backBtnText: { marginLeft: 8, color: colors.primary, fontWeight: '600' },
  activeCard: { padding: spacing.xl, marginBottom: spacing.lg, borderLeftWidth: 5, borderLeftColor: colors.primary },
  activePhrase: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8 },
  exampleBox: { marginTop: spacing.lg, padding: spacing.md, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm },
  exampleTitle: { fontSize: 12, fontWeight: '800', color: colors.muted, marginBottom: 4, textTransform: 'uppercase' },
  exampleText: { fontSize: 15, color: colors.text, lineHeight: 22 },
  practiceCard: { padding: spacing.lg, marginBottom: spacing.lg },
  h3: { fontSize: 18, fontWeight: '800', marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedbackCard: { padding: spacing.lg, backgroundColor: '#F0F7FF', borderColor: '#CDE4FF' },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.md },
  feedbackText: { fontSize: 15, color: colors.text, lineHeight: 22 },
});
