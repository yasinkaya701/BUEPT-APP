import React, { useMemo, useState } from 'react';
import { Text, StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import Card from './Card';
import { colors, spacing, typography } from '../theme/tokens';

function countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  return tokens.length;
}

export default function OpenEndedPracticeCard({
  title = 'Open-Ended Practice',
  prompts = [],
  placeholder = 'Write your answer here...',
  idealClusters = null,
}) {
  const [responses, setResponses] = useState({});
  const [verifiedLines, setVerifiedLines] = useState({});

  // Extremely basic stop-word filter for dynamic keyword extraction
  const stopWords = new Set(['about', 'above', 'after', 'again', 'against', 'these', 'those', 'which', 'where', 'their', 'there', 'would', 'could', 'should']);

  const extractKeywords = (text) => {
    if (!text) return [];
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    return [...new Set(words.filter(w => w.length > 4 && !stopWords.has(w)))].slice(0, 5);
  };

  const verifyResponse = (index, prompt, response) => {
    if (!response || response.trim().length === 0) return;
    const userWords = response.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    
    let matchCount = 0;
    const matched = [];
    const missed = [];
    let keywords = [];

    // Use AI Semantic Cluster matching if provided
    if (idealClusters && Array.isArray(idealClusters) && idealClusters.length > 0) {
        idealClusters.forEach(cluster => {
           let hit = false;
           for(let kw of cluster) {
              if (userWords.some(uw => uw.includes(kw) || kw.includes(uw))) {
                 hit = true;
                 matched.push(kw);
                 break;
              }
           }
           if (!hit) {
              missed.push(cluster[0]); // Report the primary concept missed
           }
        });
        keywords = idealClusters.map(c => c[0]);
        matchCount = matched.length;
    } else {
        // Fallback backward compatibility metric
        keywords = extractKeywords(prompt) || ['important', 'detail', 'example'];
        keywords.forEach(kw => {
          if (userWords.some(uw => uw.includes(kw) || kw.includes(uw))) {
            matchCount++;
            matched.push(kw);
          } else {
            missed.push(kw);
          }
        });
    }

    const wc = countWords(response);
    let lengthScore = Math.min(100, (wc / 25) * 100); 
    let keywordScore = keywords.length > 0 ? (matchCount / keywords.length) * 100 : 100;
    
    const finalScore = Math.round((lengthScore * 0.3) + (keywordScore * 0.7));
    
    setVerifiedLines(prev => ({
      ...prev,
      [index]: {
        score: finalScore,
        matched,
        missed,
        model: `A high-scoring BUEPT answer utilizes semantic variants of these concepts: ${keywords.join(', ')}. Ensure your structural depth accurately hits these topic clusters.`
      }
    }));
  };

  const normalizedPrompts = useMemo(
    () => (Array.isArray(prompts) ? prompts.filter(Boolean).slice(0, 4) : []),
    [prompts]
  );

  if (!normalizedPrompts.length) return null;

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Write short paragraph answers. No single correct option.</Text>

      {normalizedPrompts.map((prompt, index) => {
        const response = responses[index] || '';
        return (
          <View key={`${index}-${prompt}`} style={styles.block}>
            <Text style={styles.question}>{index + 1}. {prompt}</Text>
            <TextInput
              multiline
              value={response}
              onChangeText={(text) => setResponses((prev) => ({ ...prev, [index]: text }))}
              placeholder={placeholder}
              placeholderTextColor={colors.muted}
              style={styles.input}
              textAlignVertical="top"
            />
            <View style={styles.metaRow}>
              <Text style={styles.wordCount}>Words: {countWords(response)}</Text>
              <View style={styles.actionRow}>
                {response.length > 0 && (
                  <>
                    {!verifiedLines[index] && (
                      <TouchableOpacity onPress={() => verifyResponse(index, prompt, response)} style={styles.verifyBtn}>
                        <Text style={styles.verifyText}>Verify</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => { setResponses((p) => ({ ...p, [index]: '' })); setVerifiedLines(p => ({ ...p, [index]: null })); }} style={styles.clearBtn}>
                      <Text style={styles.clearText}>Clear</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
            {verifiedLines[index] && (
              <View style={styles.feedbackBox}>
                <View style={styles.feedbackHeader}>
                  <Text style={styles.scoreText}>Score: {verifiedLines[index].score}%</Text>
                  <Text style={styles.strengthText}>
                    {verifiedLines[index].score > 70 ? 'Strong Answer' : 'Needs More Detail'}
                  </Text>
                </View>
                <Text style={styles.feedbackLabel}>Keywords Hit:</Text>
                <Text style={styles.matchedText}>{verifiedLines[index].matched.join(', ') || 'None'}</Text>
                {verifiedLines[index].missed.length > 0 && (
                  <>
                    <Text style={[styles.feedbackLabel, { marginTop: spacing.xs }]}>Missed Concepts:</Text>
                    <Text style={styles.missedText}>{verifiedLines[index].missed.join(', ')}</Text>
                  </>
                )}
                <Text style={styles.feedbackLabel}>AI Model Tip:</Text>
                <Text style={styles.modelText}>{verifiedLines[index].model}</Text>
              </View>
            )}
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  block: {
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  question: {
    fontSize: typography.body,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  input: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: typography.body,
    backgroundColor: '#fff',
  },
  metaRow: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordCount: {
    fontSize: 11,
    color: colors.muted,
  },
  clearText: {
    fontSize: 12,
    color: colors.primary,
    fontFamily: typography.fontHeadline,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  verifyBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifyText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  feedbackBox: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  scoreText: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    color: colors.primaryDark,
  },
  strengthText: {
    fontSize: 12,
    color: '#0369A1',
    fontWeight: 'bold',
  },
  feedbackLabel: {
    fontSize: 11,
    fontFamily: typography.fontHeadline,
    color: colors.muted,
    marginTop: 4,
  },
  matchedText: {
    fontSize: 12,
    color: '#15803D',
  },
  missedText: {
    fontSize: 12,
    color: '#B91C1C',
  },
  modelText: {
    fontSize: 12,
    color: colors.text,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
