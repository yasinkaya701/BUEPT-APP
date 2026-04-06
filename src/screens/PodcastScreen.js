import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Tts from 'react-native-tts';
import Screen from '../components/Screen';
import { colors, spacing, typography, shadow } from '../theme/tokens';

const { width } = Dimensions.get('window');

const PODCAST_TEXT = `Welcome to the daily Boğaziçi Prep Podcast. Today we are looking at the impact of artificial intelligence on traditional academic integrity. As universities worldwide adapt to the presence of advanced language models, the debate centers not only on plagiarism, but on how human learning might evolve. Can a student truly synthesize knowledge if a machine drafts the essay? Proponents argue that AI acts as an advanced tutor, freeing students to focus on higher-level critical thinking. Critics, however, warn of a fundamental degradation in core writing skills. In this episode, we will explore both perspectives and provide key vocabulary for your proficiency exam. Stay tuned.`;

export default function PodcastScreen({ navigation }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Fake progress animation for the UI
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Setup TTS callbacks
    const onStart = () => setIsPlaying(true);
    const onFinish = () => {
      setIsPlaying(false);
      setProgress(0);
      progressAnim.setValue(0);
    };
    const onCancel = () => setIsPlaying(false);

    Tts.addEventListener('tts-start', onStart);
    Tts.addEventListener('tts-finish', onFinish);
    Tts.addEventListener('tts-cancel', onCancel);

    return () => {
      Tts.stop();
      Tts.removeEventListener('tts-start', onStart);
      Tts.removeEventListener('tts-finish', onFinish);
      Tts.removeEventListener('tts-cancel', onCancel);
    };
  }, [progressAnim]);

  useEffect(() => {
    if (isPlaying) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 35000, // Approx length of the text
        useNativeDriver: false,
      }).start();
      
      const interval = setInterval(() => {
        setProgress(p => Math.min(100, p + (100 / 35)));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      progressAnim.stopAnimation();
    }
  }, [isPlaying, progressAnim]);

  const togglePlayback = () => {
    if (isPlaying) {
      Tts.stop();
      setIsPlaying(false);
      progressAnim.stopAnimation();
    } else {
      Tts.speak(PODCAST_TEXT, {
        iosVoiceId: 'com.apple.ttsbundle.Samantha-compact',
        rate: 0.48, // a bit slower for listening practice
        pitch: 1.0,
      });
      setIsPlaying(true);
    }
  };

  const formatTime = (percent) => {
    const totalSecs = 35; // assumed
    const current = Math.floor((percent / 100) * totalSecs);
    return `00:${current.toString().padStart(2, '0')}`;
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Album Art */}
      <View style={styles.artContainer}>
        <View style={styles.albumArt}>
          <Ionicons name="headset-outline" size={80} color="#FFFFFF" />
          <Text style={styles.albumText}>BÜ</Text>
        </View>
      </View>

      {/* Titles */}
      <View style={styles.infoContainer}>
        <View>
          <Text style={styles.episodeTitle}>AI & Academic Integrity</Text>
          <Text style={styles.podcastAuthor}>Boğaziçi Prep Daily</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, {
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%']
            })
          }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(progress)}</Text>
          <Text style={styles.timeText}>-00:{Math.max(0, 35 - Math.floor((progress/100)*35)).toString().padStart(2,'0')}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.secondaryBtn}>
          <Ionicons name="play-skip-back" size={32} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playBtn} onPress={togglePlayback}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="#FFFFFF" style={isPlaying ? null : styles.playIconOffset} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn}>
          <Ionicons name="play-skip-forward" size={32} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Transcript View */}
      <View style={styles.transcriptSection}>
        <Text style={styles.transcriptHeading}>Live Transcript</Text>
        <ScrollView style={styles.transcriptScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.transcriptText}>{PODCAST_TEXT}</Text>
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 12,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  artContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  albumArt: {
    width: width - 80,
    height: width - 80,
    borderRadius: 24,
    backgroundColor: '#172554', // Deep Boğaziçi blue
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
    shadowColor: '#172554',
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  albumText: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    fontSize: 24,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    fontFamily: typography.fontHeadline,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  episodeTitle: {
    fontSize: 24,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  podcastAuthor: {
    fontSize: 16,
    color: '#6366F1', // indigo
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1', // indigo accent
    borderRadius: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: colors.muted,
    fontFamily: typography.fontBody,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 40,
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
    shadowColor: '#6366F1',
    shadowOpacity: 0.5,
  },
  playIconOffset: {
    marginLeft: 4,
  },
  secondaryBtn: {
    padding: spacing.sm,
  },
  transcriptSection: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  transcriptHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  transcriptScroll: {
    flex: 1,
  },
  transcriptText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#334155',
  },
});
