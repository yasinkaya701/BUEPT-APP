import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Animated, SafeAreaView, Modal, Switch, PanResponder, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, shadow } from '../theme/tokens';
import { getDictionarySample } from '../utils/dictionary';
import { useAppState } from '../context/AppState';
import { speakEnglish } from '../utils/ttsEnglish';
import academicWordlist from '../../data/academic_wordlist.json';

// Minimal shuffle helper
function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function VocabFlashcardScreen({ navigation, route }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const [deck, setDeck] = useState([]);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ known: 0, unknown: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [actionHistory, setActionHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  
  // Quizlet Preferences
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);
  const [flipTermDef, setFlipTermDef] = useState(false); 

  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { recordKnown, recordUnknown, rollbackVocabRecord, addUserWord, removeUserWord, vocabStats, userWords } = useAppState();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
          slideAnim.setValue(gestureState.dx);
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dx > 120) {
          Animated.timing(slideAnim, {
            toValue: width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => nextCard('known', true));
        } else if (gestureState.dx < -120) {
          Animated.timing(slideAnim, {
            toValue: -width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => nextCard('unknown', true));
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
            flipCard();
          }
        }
      },
    })
  ).current;

  // Load words with enrichment
  useEffect(() => {
    let base = route?.params?.initialWords || [];

    if (!base || base.length === 0) {
      // Pull from AWL if possible
      const pool = academicWordlist && academicWordlist.length > 0 
        ? academicWordlist.map(item => ({ 
            word: item.word, 
            def: item.definition, 
            level: item.level,
            collocations: item.collocations || [],
            example: item.example || ''
          }))
        : getDictionarySample(50).map(item => ({ word: item.word, def: item.simple_definition }));
      base = shuffle(pool).slice(0, 20);
    } else {
        base = base.map(w => {
            const wordStr = typeof w === 'string' ? w : w.word;
            const enriched = academicWordlist.find(awl => awl.word.toLowerCase() === wordStr.toLowerCase());
            return { 
                word: wordStr, 
                def: w.definition || w.simple_definition || w.def || enriched?.definition || 'Definition pending...',
                level: w.level || enriched?.level || 'B2',
                collocations: enriched?.collocations || [],
                example: enriched?.example || ''
            };
        });
    }

    setDeck(shuffle(base));
    setIndex(0);
    setSessionStats({ known: 0, unknown: 0 });
    setActionHistory([]);
    setStreak(0);
    setIsFlipped(false);
    flipAnim.setValue(0);
    slideAnim.setValue(0);
  }, [route?.params?.initialWords, flipAnim, slideAnim]);

  const currentCard = deck[index] || null;

  useEffect(() => {
      if (currentCard && autoPlayAudio && index < deck.length) {
          if (!flipTermDef) {
                speakEnglish(currentCard.word, { rate: 0.45 });
          }
      }
  }, [currentCard, autoPlayAudio, flipTermDef, index, deck.length]);

  const flipCard = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start(() => setIsFlipped(!isFlipped));
  };

  const nextCard = (status, skipAnimation = false) => {
    if (!currentCard) return;
    const normalizedWord = String(currentCard.word || '').trim().toLowerCase();
    const hadUserWordBefore = status === 'unknown'
      ? (Array.isArray(userWords) && userWords.some((item) => String(item?.word || '').toLowerCase() === normalizedWord))
      : false;
    setActionHistory((prev) => [
      ...prev,
      {
        cardIndex: index,
        status,
        word: normalizedWord,
        addedToNotebook: status === 'unknown' && !hadUserWordBefore,
      },
    ]);

    if (status === 'known') {
        setSessionStats(s => ({ ...s, known: s.known + 1 }));
        recordKnown(currentCard.word);
        setStreak((prev) => prev + 1);
    } else {
        setSessionStats(s => ({ ...s, unknown: s.unknown + 1 }));
        recordUnknown(currentCard.word);
        addUserWord(currentCard.word);
        setStreak(0);
    }

    const proceed = () => {
      if (index < deck.length - 1) {
        setIndex((prev) => prev + 1);
        setIsFlipped(false);
        flipAnim.setValue(0);
        slideAnim.setValue(0);
      } else {
        setIndex(index + 1);
        slideAnim.setValue(0);
      }
    };

    if (skipAnimation) {
      proceed();
    } else {
      Animated.timing(slideAnim, {
        toValue: status === 'known' ? width : -width,
        duration: 300,
        useNativeDriver: true,
      }).start(proceed);
    }
  };

  const undoLastAction = () => {
    if (actionHistory.length === 0) return;
    const last = actionHistory[actionHistory.length - 1];
    setActionHistory((prev) => prev.slice(0, -1));
    setSessionStats((prev) => ({
      known: last.status === 'known' ? Math.max(0, prev.known - 1) : prev.known,
      unknown: last.status === 'unknown' ? Math.max(0, prev.unknown - 1) : prev.unknown,
    }));
    if (last.word) rollbackVocabRecord(last.word, last.status);
    if (last.status === 'unknown' && last.addedToNotebook && last.word) {
      removeUserWord(last.word);
    }
    setIndex(Math.max(0, Number(last.cardIndex || 0)));
    setStreak(0);
    setIsFlipped(false);
    flipAnim.setValue(0);
    slideAnim.setValue(0);
  };

  const shuffleRemaining = () => {
    setDeck((prev) => {
      if (!Array.isArray(prev) || prev.length <= 2 || index >= prev.length - 2) return prev;
      const head = prev.slice(0, index + 1);
      const tail = shuffle(prev.slice(index + 1));
      return [...head, ...tail];
    });
  };

  const playVoice = (e) => {
    e?.stopPropagation();
    if (currentCard?.word) {
      speakEnglish(currentCard.word, { rate: 0.45 });
    }
  };

  const restartSession = () => {
    setDeck((prev) => shuffle(prev));
    setIndex(0);
    setSessionStats({ known: 0, unknown: 0 });
    setActionHistory([]);
    setStreak(0);
    setIsFlipped(false);
    flipAnim.setValue(0);
    slideAnim.setValue(0);
  };

  const frontAnimatedStyle = {
    opacity: flipAnim.interpolate({
      inputRange: [0, 0.5, 0.51, 1],
      outputRange: [1, 1, 0, 0],
    }),
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        })
      },
      {
        scale: flipAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0.95, 1],
        })
      }
    ],
    zIndex: isFlipped ? 1 : 2,
  };
  const backAnimatedStyle = {
    opacity: flipAnim.interpolate({
      inputRange: [0, 0.49, 0.5, 1],
      outputRange: [0, 0, 1, 1],
    }),
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['180deg', '360deg'],
        })
      },
      {
        scale: flipAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0.95, 1],
        })
      }
    ],
    zIndex: isFlipped ? 2 : 1,
  };
  const slideStyle = { transform: [{ translateX: slideAnim }] };
  const progress = deck.length > 0 ? Math.max(0, Math.min(100, ((index + 1) / deck.length) * 100)) : 0;
  const remaining = deck.length > 0 ? Math.max(0, deck.length - index - 1) : 0;

  if (index >= deck.length && deck.length > 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
        <View style={styles.endContainer}>
          <View style={styles.medalCircle}>
             <Ionicons name="trophy" size={80} color={colors.secondary} />
          </View>
          <Text style={styles.endTitle}>Study Session Over</Text>
          <View style={styles.statRow}>
             <View style={styles.statBox}>
                <Text style={styles.statVal}>{sessionStats.known}</Text>
                <Text style={styles.statLab}>Mastered</Text>
             </View>
             <View style={styles.statBox}>
                <Text style={styles.statVal}>{sessionStats.unknown}</Text>
                <Text style={styles.statLab}>Learning</Text>
             </View>
          </View>
          <TouchableOpacity style={styles.restartBtn} onPress={restartSession}>
              <Text style={styles.restartBtnText}>Restart Deck</Text>
          </TouchableOpacity>
          {actionHistory.length > 0 && (
            <TouchableOpacity style={styles.undoFromEndBtn} onPress={undoLastAction}>
              <Ionicons name="arrow-undo-outline" size={16} color="#E2E8F0" />
              <Text style={styles.undoFromEndText}>Undo last answer</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerPill}>
            <Text style={styles.headerTitle}>{index + 1} / {deck.length}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.settingsBtn} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
            <Ionicons name="options-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricPill}>
          <Ionicons name="flame-outline" size={14} color={colors.secondary} />
          <Text style={styles.metricPillText}>Streak: {streak}</Text>
        </View>
        <View style={styles.metricPill}>
          <Ionicons name="hourglass-outline" size={14} color={colors.secondary} />
          <Text style={styles.metricPillText}>Remaining: {remaining}</Text>
        </View>
        <View style={styles.metricPill}>
          <Ionicons name="shuffle-outline" size={14} color={colors.secondary} />
          <TouchableOpacity onPress={shuffleRemaining} disabled={remaining < 2}>
            <Text style={[styles.metricPillText, remaining < 2 && styles.metricPillTextMuted]}>Shuffle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.cardArea, isWide && styles.cardAreaWide]}>
        {currentCard && (
          <Animated.View style={[styles.cardContainer, slideStyle]} {...panResponder.panHandlers}>
            <View style={styles.touchableCard}>
                {/* FRONT */}
                <Animated.View style={[styles.cardFace, styles.cardFront, frontAnimatedStyle]}>
                    <View style={styles.cardHeader}>
                         <View style={styles.levelBadge}><Text style={styles.levelText}>{currentCard.level}</Text></View>
                         <TouchableOpacity onPress={playVoice} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}><Ionicons name="volume-medium-outline" size={26} color="#fff" /></TouchableOpacity>
                    </View>
                    <Text style={[styles.cardWord, (flipTermDef && currentCard.def.length > 50) && {fontSize: 22}]}>
                        {flipTermDef ? currentCard.def : currentCard.word}
                    </Text>
                    <Text style={styles.tapTip}>TAP TO FLIP</Text>
                </Animated.View>

                {/* BACK */}
                <Animated.View style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.backScroll}>
                        <Text style={styles.cardWordBack}>{currentCard?.word || ''}</Text>
                        <View style={styles.divider} />
                        <Text style={styles.cardDef}>{currentCard?.def || ''}</Text>
                        
                        {(currentCard?.collocations || []).length > 0 && (
                            <View style={styles.infoSection}>
                                <Text style={styles.sectionTitle}>COLLOCATIONS</Text>
                                <View style={styles.tagGrid}>
                                    {currentCard.collocations.map((c, i) => (
                                        <View key={i} style={styles.tag}><Text style={styles.tagText}>{c}</Text></View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {currentCard?.example && (
                            <View style={styles.infoSection}>
                                <Text style={styles.sectionTitle}>EXAMPLE</Text>
                                <Text style={styles.exampleText}>"{currentCard.example}"</Text>
                            </View>
                        )}

                        <View style={styles.statsContainer}>
                            <View style={styles.statPill}>
                                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                                <Text style={styles.statPillText}>Total Known: {(vocabStats && currentCard?.word) ? (vocabStats[currentCard.word.toLowerCase()]?.known || 0) : 0}</Text>
                            </View>
                            <View style={styles.statPill}>
                                <Ionicons name="close-circle" size={14} color="#EF4444" />
                                <Text style={styles.statPillText}>Total Unknown: {(vocabStats && currentCard?.word) ? (vocabStats[currentCard.word.toLowerCase()]?.unknown || 0) : 0}</Text>
                            </View>
                        </View>
                    </ScrollView>
                    <Text style={styles.tapTip}>TAP TO UNFLIP</Text>
                </Animated.View>
            </View>
          </Animated.View>
        )}
      </View>

      <View style={styles.controlRibbon}>
        <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.actionBtn, styles.actionBtnUnknown]} 
            onPress={() => nextCard('unknown')}
        >
            <Ionicons name="close-outline" size={32} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.actionBtn, styles.actionBtnUndo, actionHistory.length === 0 && styles.actionBtnDisabled]}
            onPress={undoLastAction}
            disabled={actionHistory.length === 0}
        >
            <Ionicons name="arrow-undo-outline" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.actionBtn, styles.actionBtnKnown]} 
            onPress={() => nextCard('known')}
        >
            <Ionicons name="checkmark-outline" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal visible={showSettings} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowSettings(false)}>
          <SafeAreaView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Flashcard Options</Text>
                  <TouchableOpacity onPress={() => setShowSettings(false)} style={styles.closeBtn}>
                      <Text style={styles.closeBtnText}>Done</Text>
                  </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalContent}>
                  <View style={styles.settingRow}>
                      <View style={styles.settingTextCol}>
                          <Text style={styles.settingTitle}>Auto-play Pronunciation</Text>
                          <Text style={styles.settingSub}>Play the English pronunciation automatically when moving to a new card.</Text>
                      </View>
                      <Switch value={autoPlayAudio} onValueChange={setAutoPlayAudio} trackColor={{ true: colors.secondary }} />
                  </View>
                  <View style={styles.settingRow}>
                      <View style={styles.settingTextCol}>
                          <Text style={styles.settingTitle}>Definition on Front</Text>
                          <Text style={styles.settingSub}>Swap so the definition is shown on the front, and you guess the English word.</Text>
                      </View>
                      <Switch value={flipTermDef} onValueChange={setFlipTermDef} trackColor={{ true: colors.secondary }} />
                  </View>
              </ScrollView>
          </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' }, // Deep Navy Premium
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerPill: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
    color: '#fff'
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  settingsBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: spacing.xl,
    borderRadius: 2,
    marginBottom: spacing.xl
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metricPillText: { color: '#E2E8F0', fontSize: 12, fontWeight: '700' },
  metricPillTextMuted: { color: 'rgba(226,232,240,0.45)' },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 2,
  },
  
  cardArea: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    perspective: 1200,
  },
  cardAreaWide: { paddingHorizontal: 120 },
  cardContainer: {
    width: '100%',
    height: '75%',
    maxHeight: 520,
  },
  touchableCard: {
    flex: 1,
    // preserve-3d enables correct 3D flip rendering on web
    transformStyle: 'preserve-3d',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: spacing.xl,
    // Critical: prevents the back showing through while the front is visible
    backfaceVisibility: 'hidden',
    ...shadow.md
  },
  cardFront: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBack: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)', // Slightly darker for back
  },
  backScroll: {
      paddingBottom: 40
  },
  cardHeader: {
      position: 'absolute',
      top: 24,
      left: 24,
      right: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
  },
  levelBadge: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8
  },
  levelText: { color: colors.secondary, fontWeight: '700', fontSize: 12 },
  
  cardWord: {
    fontSize: 42,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5
  },
  cardWordBack: {
    fontSize: 24,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
    color: colors.secondary,
    marginTop: 10
  },
  divider: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16
  },
  cardDef: {
    fontSize: 20,
    color: '#F1F5F9',
    lineHeight: 30,
    marginBottom: 24
  },
  infoSection: {
      marginTop: 20,
      borderTopWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
      paddingTop: 20
  },
  sectionTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: 'rgba(255,255,255,0.4)',
      letterSpacing: 2,
      marginBottom: 12
  },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)'
  },
  tagText: { color: '#CBD5E1', fontSize: 13, fontWeight: '500' },
  exampleText: {
      fontSize: 16,
      color: '#94A3B8',
      fontStyle: 'italic',
      lineHeight: 24
  },

  tapTip: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 3,
    fontWeight: '700'
  },
  
  controlRibbon: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 28,
      paddingVertical: 30,
  },
  actionBtn: {
      width: 72,
      height: 72,
      borderRadius: 36,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadow.lg
  },
  actionBtnUnknown: {
      backgroundColor: 'rgba(239, 68, 68, 0.9)', // Red
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.2)'
  },
  actionBtnKnown: {
      backgroundColor: 'rgba(16, 185, 129, 0.9)', // Green
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.2)'
  },
  actionBtnUndo: {
      backgroundColor: 'rgba(59, 130, 246, 0.9)',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.2)',
  },
  actionBtnDisabled: {
      opacity: 0.45,
  },

  endContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl
  },
  medalCircle: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: 'rgba(255,255,255,0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 30,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.1)'
  },
  endTitle: {
      fontSize: 32,
      fontFamily: typography.fontHeadline,
      fontWeight: '800',
      color: '#fff',
      marginBottom: 40
  },
  statRow: {
      flexDirection: 'row',
      gap: 30,
      marginBottom: 60
  },
  statBox: { alignItems: 'center' },
  statVal: { fontSize: 36, fontWeight: '800', color: '#fff' },
  statLab: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: '700', marginTop: 4 },
  
  restartBtn: {
      backgroundColor: colors.secondary,
      paddingHorizontal: 48,
      paddingVertical: 20,
      borderRadius: 20,
      ...shadow.lg
  },
  restartBtnText: { color: colors.textOnSecondary, fontSize: 18, fontWeight: '800' },
  undoFromEndBtn: {
      marginTop: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
      backgroundColor: 'rgba(255,255,255,0.04)',
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
  },
  undoFromEndText: {
      color: '#E2E8F0',
      fontWeight: '700',
      fontSize: 13,
  },
  
  // Settings Modal
  modalContainer: { flex: 1, backgroundColor: '#0F172A' },
  modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)'
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  closeBtn: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  closeBtnText: { color: colors.secondary, fontWeight: '700' },
  modalContent: { flex: 1, padding: 20 },
  settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(255,255,255,0.03)',
      padding: 20,
      borderRadius: 24,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)'
  },
  settingTextCol: { flex: 1, marginRight: 20 },
  settingTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 6 },
  settingSub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 18 },
  statsContainer: { flexDirection: 'row', gap: 12, marginTop: 40, paddingBottom: 20 },
  statPill: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, 
    backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  statPillText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
