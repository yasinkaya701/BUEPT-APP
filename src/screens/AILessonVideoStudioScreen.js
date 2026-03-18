import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme/tokens';
import { generateVideoLesson, isVideoLessonApiConfigured } from '../utils/videoLessonAI';
import { useTts } from '../hooks/useTts';
import { getAiSourceMeta } from '../utils/aiWorkspace';

const LEVELS = ['A2', 'B1', 'B2', 'C1'];
const DURATIONS = [3, 4, 6, 8];
const TOPIC_SUGGESTIONS = [
  'BUEPT paraphrase strategy',
  'Essay cohesion and coherence',
  'Inference questions in academic reading',
  'How to organize a speaking answer',
  'Listening signposts in short lectures',
];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function totalDurationSec(scenes = []) {
  return scenes.reduce((sum, s) => sum + (s.durationSec || 0), 0);
}

export default function AILessonVideoStudioScreen({ navigation, route }) {
  const [topic, setTopic] = useState('Essay Cohesion and Coherence');
  const [level, setLevel] = useState('B1');
  const [durationMin, setDurationMin] = useState(4);
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [sceneElapsedSec, setSceneElapsedSec] = useState(0);
  const [totalElapsedSec, setTotalElapsedSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [error, setError] = useState('');

  const tickRef = useRef(null);
  const { speakWord, stopAll } = useTts();

  const scenes = useMemo(() => lesson?.scenes || [], [lesson]);
  const sourceMeta = useMemo(() => getAiSourceMeta(lesson?.source || (isVideoLessonApiConfigured() ? 'online-ready' : 'local-storyboard')), [lesson?.source]);
  const totalSec = useMemo(() => totalDurationSec(scenes), [scenes]);
  const currentScene = scenes[sceneIndex] || null;
  const currentSceneDuration = currentScene?.durationSec || 1;
  const sceneProgress = clamp((sceneElapsedSec / currentSceneDuration) * 100, 0, 100);
  const totalProgress = totalSec ? clamp((totalElapsedSec / totalSec) * 100, 0, 100) : 0;
  const lessonMinutes = useMemo(() => Math.max(1, Math.round(totalSec / 60)), [totalSec]);

  useEffect(() => () => {
    if (tickRef.current) clearInterval(tickRef.current);
    stopAll();
  }, [stopAll]);

  useEffect(() => {
    if (!isPlaying || !currentScene) return;

    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setSceneElapsedSec((prev) => {
        const next = prev + 1;
        if (next >= currentSceneDuration) {
          setSceneIndex((idx) => {
            const nextIdx = idx + 1;
            if (nextIdx >= scenes.length) {
              setIsPlaying(false);
              return idx;
            }
            return nextIdx;
          });
          return 0;
        }
        return next;
      });
      setTotalElapsedSec((prev) => {
        if (prev >= totalSec) return totalSec;
        return prev + 1;
      });
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [isPlaying, currentScene, currentSceneDuration, scenes.length, totalSec]);

  useEffect(() => {
    if (!isPlaying || !voiceOn || !currentScene?.narration) return;
    speakWord(currentScene.narration);
  }, [isPlaying, voiceOn, currentScene, speakWord]);

  useEffect(() => {
    const incomingTopic = String(route?.params?.topic || '').trim();
    if (incomingTopic) setTopic(incomingTopic);
  }, [route?.params?.topic]);

  const resetPlayback = () => {
    setSceneIndex(0);
    setSceneElapsedSec(0);
    setTotalElapsedSec(0);
    setIsPlaying(false);
    stopAll();
  };

  const buildLesson = async () => {
    const normalizedTopic = topic.trim();
    if (!normalizedTopic) {
      setError('Topic is required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const generated = await generateVideoLesson({
        topic: normalizedTopic,
        level,
        durationMin,
      });
      setLesson(generated);
      setSceneIndex(0);
      setSceneElapsedSec(0);
      setTotalElapsedSec(0);
      setIsPlaying(false);
      stopAll();
    } catch (e) {
      setError('Video lesson generation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const onPlayPause = () => {
    if (!lesson || !scenes.length) return;
    if (isPlaying) {
      setIsPlaying(false);
      stopAll();
      return;
    }
    setIsPlaying(true);
  };

  const jumpToScene = (index) => {
    const next = clamp(index, 0, scenes.length - 1);
    setSceneIndex(next);
    setSceneElapsedSec(0);
    const elapsedBefore = scenes.slice(0, next).reduce((sum, s) => sum + (s.durationSec || 0), 0);
    setTotalElapsedSec(elapsedBefore);
    stopAll();
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.primaryDark} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.h1}>AI Lesson Video Studio</Text>
          <Text style={styles.sub}>Lesson storyboard, narration, and optional video endpoint</Text>
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={styles.label}>Topic</Text>
        <TextInput
          value={topic}
          onChangeText={setTopic}
          style={styles.input}
          placeholder="e.g. Paraphrase strategy for BUEPT"
          placeholderTextColor={colors.muted}
        />

        <Text style={styles.label}>Level</Text>
        <View style={styles.pillRow}>
          {LEVELS.map((item) => {
            const active = item === level;
            return (
              <TouchableOpacity key={item} style={[styles.pill, active && styles.pillActive]} onPress={() => setLevel(item)}>
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Length (minutes)</Text>
        <View style={styles.pillRow}>
          {DURATIONS.map((item) => {
            const active = item === durationMin;
            return (
              <TouchableOpacity key={item} style={[styles.pill, active && styles.pillActive]} onPress={() => setDurationMin(item)}>
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{item}m</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.hint}>
          Source: {isVideoLessonApiConfigured() ? 'Live lesson endpoint' : 'Local storyboard engine'}
        </Text>
        <View style={styles.pillRow}>
          {TOPIC_SUGGESTIONS.map((item) => (
            <TouchableOpacity key={item} style={styles.suggestionChip} onPress={() => setTopic(item)}>
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          label={loading ? 'Generating...' : 'Generate AI Lesson Video'}
          onPress={buildLesson}
          disabled={loading}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Card>

      {loading && (
        <Card style={styles.loadingCard}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Building scenes, narration, and checkpoints...</Text>
        </Card>
      )}

      {lesson && currentScene && (
        <>
          <Card style={styles.metaCard}>
            <View style={styles.metaHeader}>
              <View>
                <Text style={styles.metaTitle}>{sourceMeta.label}</Text>
                <Text style={styles.metaBody}>{sourceMeta.detail}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>{lesson.source}</Text>
              </View>
            </View>
            {lesson.diagnostic ? <Text style={styles.metaDiagnostic}>{lesson.diagnostic}</Text> : null}
            <View style={styles.metaGrid}>
              <View style={styles.metaTile}>
                <Text style={styles.metaTileLabel}>Scenes</Text>
                <Text style={styles.metaTileValue}>{scenes.length}</Text>
              </View>
              <View style={styles.metaTile}>
                <Text style={styles.metaTileLabel}>Runtime</Text>
                <Text style={styles.metaTileValue}>{lessonMinutes} min</Text>
              </View>
              <View style={styles.metaTile}>
                <Text style={styles.metaTileLabel}>Level</Text>
                <Text style={styles.metaTileValue}>{level}</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.videoCard}>
            <View style={styles.videoHeader}>
              <Text style={styles.videoTitle}>{lesson.title}</Text>
              <Text style={styles.sourceTag}>{lesson.source}</Text>
            </View>
            <Text style={styles.videoSummary}>{lesson.summary}</Text>

            <View style={styles.progressWrap}>
              <Text style={styles.progressLabel}>Total Progress {Math.round(totalProgress)}%</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${totalProgress}%` }]} />
              </View>
            </View>

            <View style={styles.sceneBoard}>
              <Text style={styles.sceneTop}>Scene {sceneIndex + 1} / {scenes.length}</Text>
              <Text style={styles.sceneHeading}>{currentScene.heading}</Text>
              {currentScene.bullets.map((point) => (
                <Text key={point} style={styles.scenePoint}>• {point}</Text>
              ))}

              <View style={styles.progressWrap}>
                <Text style={styles.progressLabel}>Scene Progress {Math.round(sceneProgress)}%</Text>
                <View style={styles.progressTrackScene}>
                  <View style={[styles.progressFillScene, { width: `${sceneProgress}%` }]} />
                </View>
              </View>
            </View>

            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.controlBtn} onPress={() => jumpToScene(sceneIndex - 1)}>
                <Ionicons name="play-skip-back" size={20} color={colors.primaryDark} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlMain} onPress={onPlayPause}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="#fff" />
                <Text style={styles.controlMainText}>{isPlaying ? 'Pause' : 'Play'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlBtn} onPress={() => jumpToScene(sceneIndex + 1)}>
                <Ionicons name="play-skip-forward" size={20} color={colors.primaryDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.softBtn} onPress={() => setVoiceOn((v) => !v)}>
                <Ionicons name={voiceOn ? 'volume-high' : 'volume-mute'} size={18} color={colors.primaryDark} />
                <Text style={styles.softBtnText}>{voiceOn ? 'Voice On' : 'Voice Off'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.softBtn} onPress={resetPlayback}>
                <Ionicons name="refresh" size={18} color={colors.primaryDark} />
                <Text style={styles.softBtnText}>Restart</Text>
              </TouchableOpacity>
            </View>

            {lesson.video?.videoUrl ? (
              <View style={styles.videoLaunchWrap}>
                <Text style={styles.videoMeta}>
                  Video: {lesson.video.generated ? 'Generated video URL' : 'Storyboard only'} • {lesson.video.provider}
                </Text>
                <Button
                  label="Watch Lesson Video"
                  onPress={() => navigation.navigate('VideoLessonPlayer', {
                    title: lesson.video.title || lesson.title,
                    videoUrl: lesson.video.videoUrl,
                    posterUrl: lesson.video.posterUrl,
                    provider: lesson.video.provider,
                    scenes: lesson.scenes || [],
                  })}
                />
              </View>
            ) : null}
          </Card>

          <Card style={styles.card}>
            <Text style={styles.blockTitle}>Lesson Goals</Text>
            {(lesson.learningGoals || []).map((item) => (
              <Text key={item} style={styles.scenePoint}>• {item}</Text>
            ))}
            <Text style={[styles.blockTitle, styles.blockTitleGap]}>Key Terms</Text>
            <View style={styles.termRow}>
              {(lesson.keyTerms || []).map((term) => (
                <View key={term} style={styles.termChip}>
                  <Text style={styles.termText}>{term}</Text>
                </View>
              ))}
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.blockTitle}>Narration + Checkpoint</Text>
            <Text style={styles.narration}>{currentScene.narration}</Text>
            <View style={styles.quizBox}>
              <Text style={styles.quizLabel}>Quick Check</Text>
              <Text style={styles.quizText}>{currentScene.quiz}</Text>
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.blockTitle}>Practice Queue</Text>
            {(lesson.practiceTasks || []).map((item, index) => (
              <Text key={`${index}-${item}`} style={styles.scenePoint}>• {item}</Text>
            ))}
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  headerTextWrap: {
    flex: 1,
  },
  h1: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted,
  },
  card: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  pillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  pillText: {
    fontSize: typography.small,
    color: colors.muted,
    fontFamily: typography.fontHeadline,
  },
  pillTextActive: {
    color: colors.primaryDark,
  },
  suggestionChip: {
    borderWidth: 1,
    borderColor: '#D7E4FA',
    borderRadius: 999,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 8,
    backgroundColor: '#F8FBFF',
  },
  suggestionText: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  hint: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  error: {
    marginTop: spacing.xs,
    color: colors.error,
    fontSize: typography.small,
  },
  loadingCard: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metaCard: {
    marginBottom: spacing.md,
    backgroundColor: '#FBFDFF',
    borderColor: '#D6E3F8',
  },
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  metaTitle: {
    fontSize: typography.body,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  metaBody: {
    fontSize: typography.small,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 18,
  },
  metaBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#D6E3F8',
  },
  metaBadgeText: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
  },
  metaDiagnostic: {
    fontSize: typography.small,
    color: colors.warning,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metaTile: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D7E4FA',
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  metaTileLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
    fontFamily: typography.fontHeadline,
    marginBottom: 4,
  },
  metaTileValue: {
    fontSize: typography.body,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  loadingText: {
    fontSize: typography.small,
    color: colors.muted,
  },
  videoCard: {
    marginBottom: spacing.md,
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FBFF',
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: spacing.sm,
  },
  videoTitle: {
    flex: 1,
    fontSize: typography.h3,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  sourceTag: {
    fontSize: typography.xsmall,
    color: '#1E40AF',
    textTransform: 'uppercase',
    fontFamily: typography.fontHeadline,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  videoSummary: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  progressWrap: {
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginBottom: 4,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  sceneBoard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  sceneTop: {
    fontSize: typography.xsmall,
    color: '#4338CA',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sceneHeading: {
    fontSize: typography.body,
    color: '#1E1B4B',
    fontFamily: typography.fontHeadline,
    marginBottom: 6,
  },
  scenePoint: {
    fontSize: typography.small,
    color: '#3730A3',
    marginBottom: 2,
  },
  blockTitleGap: {
    marginTop: spacing.md,
  },
  termRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  termChip: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
  },
  termText: {
    fontSize: typography.small,
    color: '#1D4ED8',
    fontFamily: typography.fontHeadline,
  },
  progressTrackScene: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#C7D2FE',
    overflow: 'hidden',
  },
  progressFillScene: {
    height: '100%',
    backgroundColor: '#4F46E5',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlMain: {
    minWidth: 130,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.md,
  },
  controlMainText: {
    fontSize: typography.small,
    color: '#fff',
    fontFamily: typography.fontHeadline,
  },
  softBtn: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
  },
  softBtnText: {
    fontSize: typography.small,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  blockTitle: {
    fontSize: typography.h3,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm,
  },
  narration: {
    fontSize: typography.small,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  quizBox: {
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    padding: spacing.sm,
  },
  quizLabel: {
    fontSize: typography.xsmall,
    color: '#92400E',
    textTransform: 'uppercase',
    marginBottom: 2,
    fontFamily: typography.fontHeadline,
  },
  quizText: {
    fontSize: typography.small,
    color: '#78350F',
  },
  videoLaunchWrap: {
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  videoMeta: {
    fontSize: typography.xsmall,
    color: colors.muted,
  },
});
