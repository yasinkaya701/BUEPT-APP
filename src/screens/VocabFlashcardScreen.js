import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Animated, Easing, SafeAreaView, Modal, Switch, PanResponder } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import { getDictionarySample } from '../utils/dictionary';
import { useAppState } from '../context/AppState';
import { speakEnglish } from '../utils/ttsEnglish';
import testEnglishVocabItems from '../../data/test_english_vocab_items.json';

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
  
  // Quizlet Preferences
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);
  const [flipTermDef, setFlipTermDef] = useState(false); // If true, front is Definition

  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { recordKnown, recordUnknown, addUserWord } = useAppState();

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

  // Load words
  useEffect(() => {
    let base = route?.params?.initialWords || [];

    if (!base || base.length === 0) {
      // Fallback: Pull random 20 from testEnglish mapping or general dict
      const pool = testEnglishVocabItems && testEnglishVocabItems.length > 0 
        ? testEnglishVocabItems.map(item => ({ word: item.word, def: item.simple_definition, fromList: true }))
        : getDictionarySample(50).map(item => ({ word: item.word, def: item.simple_definition }));
      base = shuffle(pool).slice(0, 20);
    } else {
        base = base.map(w => {
            if (typeof w === 'string') return { word: w, def: 'Definition pending.' };
            return { word: w.word, def: w.definition || w.simple_definition || w.def || 'Definition pending...' };
        });
    }

    setDeck(shuffle(base));
    setIndex(0);
    setSessionStats({ known: 0, unknown: 0 });
    setIsFlipped(false);
    flipAnim.setValue(0);
    slideAnim.setValue(0);
    
    // We intentionally only run this when the screen is mounted/navigated to with new params
  }, [route?.params?.initialWords, flipAnim, slideAnim]);

  const currentCard = deck[index] || null;

  // Autoplay audio when card changes if preference is true
  useEffect(() => {
      if (currentCard && autoPlayAudio && index < deck.length) {
          if (!flipTermDef) {
               // Assuming the front is English if we aren't flipped
               speakEnglish(currentCard.word, { rate: 0.45 });
          }
      }
  }, [currentCard, autoPlayAudio, flipTermDef, index, deck.length]);

  const flipCard = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.timing(flipAnim, {
      toValue,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => setIsFlipped(!isFlipped));
  };

  const nextCard = (status, skipAnimation = false) => {
    if (!currentCard) return;

    // Track status internally and in context
    if (status === 'known') {
        setSessionStats(s => ({ ...s, known: s.known + 1 }));
        recordKnown(currentCard.word);
    } else {
        setSessionStats(s => ({ ...s, unknown: s.unknown + 1 }));
        recordUnknown(currentCard.word);
        // also save to their wordlist automatically if unknown
        addUserWord(currentCard.word);
    }

    const proceed = () => {
      if (index < deck.length - 1) {
        setIndex((prev) => prev + 1);
        setIsFlipped(false);
        flipAnim.setValue(0);
        slideAnim.setValue(0);
      } else {
        // End of deck
        setIndex(index + 1);
        slideAnim.setValue(0);
      }
    };

    if (skipAnimation) {
      proceed();
    } else {
      // Animate out (bottom buttons bypass panresponder logic)
      Animated.timing(slideAnim, {
        toValue: status === 'known' ? width : -width,
        duration: 300,
        useNativeDriver: true,
      }).start(proceed);
    }
  };

  const playVoice = (e) => {
    e?.stopPropagation();
    if (currentCard?.word) {
      speakEnglish(currentCard.word, { rate: 0.45 });
    }
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg']
  });

  const frontAnimatedStyle = { transform: [{ rotateY: frontInterpolate }] };
  const backAnimatedStyle = { transform: [{ rotateY: backInterpolate }] };
  const slideStyle = { transform: [{ translateX: slideAnim }] };

  if (index >= deck.length && deck.length > 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
        </View>
        <View style={styles.endContainer}>
          <Ionicons name="trophy-outline" size={64} color={colors.primary} style={{marginBottom: spacing.md}} />
          <Text style={styles.endTitle}>Deck Completed</Text>
          <Text style={styles.endStat}>Known: {sessionStats.known}</Text>
          <Text style={styles.endStat}>Still Learning: {sessionStats.unknown}</Text>
          <TouchableOpacity style={styles.restartBtn} onPress={() => { setIndex(0); setSessionStats({known: 0, unknown: 0}); setIsFlipped(false); flipAnim.setValue(0); }}>
              <Text style={styles.restartBtnText}>Study Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
            {index + 1} / {deck.length}
        </Text>
        <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(index / deck.length) * 100}%` }]} />
      </View>

      <View style={[styles.cardArea, isWide && styles.cardAreaWide]}>
        {currentCard && (
          <Animated.View style={[styles.cardContainer, slideStyle]} {...panResponder.panHandlers}>
            {/* FRONT OF CARD */}
            <View style={styles.touchableCard}>
                <Animated.View style={[styles.cardFace, styles.cardFront, frontAnimatedStyle]}>
                    <Text style={styles.cardWord}>{flipTermDef ? currentCard.def : currentCard.word}</Text>
                    <Text style={styles.tapTip}>Tap to flip, swipe Left/Right to mark</Text>
                    {!flipTermDef && (
                        <TouchableOpacity style={styles.speakerBtn} onPress={playVoice}>
                            <Ionicons name="volume-high" size={28} color={colors.primary} />
                        </TouchableOpacity>
                    )}
                </Animated.View>

                {/* BACK OF CARD */}
                <Animated.View style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}>
                    <Text style={styles.cardWordBack}>{flipTermDef ? currentCard.word : currentCard.word}</Text>
                    <View style={styles.divider} />
                    <Text style={styles.cardDef}>{flipTermDef ? currentCard.word : currentCard.def}</Text>
                    {flipTermDef && (
                        <TouchableOpacity style={[styles.speakerBtn, styles.speakerBtnInline]} onPress={playVoice}>
                            <Ionicons name="volume-high" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </View>
          </Animated.View>
        )}
      </View>

      <View style={styles.controlRibbon}>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnUnknown]} onPress={() => nextCard('unknown')}>
            <Ionicons name="close" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnKnown]} onPress={() => nextCard('known')}>
            <Ionicons name="checkmark" size={32} color="#fff" />
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
              <View style={styles.modalContent}>
                  <View style={styles.settingRow}>
                      <View style={styles.settingTextCol}>
                          <Text style={styles.settingTitle}>Auto-play Pronunciation</Text>
                          <Text style={styles.settingSub}>Play the English pronunciation automatically when moving to a new flashcard.</Text>
                      </View>
                      <Switch value={autoPlayAudio} onValueChange={setAutoPlayAudio} trackColor={{ true: colors.primary }} />
                  </View>
                  <View style={styles.settingRow}>
                      <View style={styles.settingTextCol}>
                          <Text style={styles.settingTitle}>Definition on Front</Text>
                          <Text style={styles.settingSub}>Swap so the definition is shown on the front, and you guess the English word.</Text>
                      </View>
                      <Switch value={flipTermDef} onValueChange={setFlipTermDef} trackColor={{ true: colors.primary }} />
                  </View>
              </View>
          </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center', alignItems: 'center'
  },
  settingsBtn: {
    width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center'
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: typography.fontHeadline,
    fontWeight: '700',
    color: colors.muted
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    marginHorizontal: spacing.xl,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.xl
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary
  },
  
  cardArea: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    perspective: 1000,
  },
  cardAreaWide: {
    paddingHorizontal: 120,
  },
  cardContainer: {
    width: '100%',
    height: '70%',
    maxHeight: 460,
  },
  touchableCard: {
      flex: 1,
      width: '100%',
      height: '100%'
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: radius.xl,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backfaceVisibility: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    ...shadow.md
  },
  cardFront: {
    zIndex: 2,
  },
  cardBack: {
    backgroundColor: '#FAFAFA'
  },
  cardWord: {
    fontSize: 36,
    fontFamily: typography.fontHeadline,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center'
  },
  speakerBtn: {
    position: 'absolute',
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center'
  },
  speakerBtnInline: {
    position: 'relative',
    bottom: 0,
    marginTop: 12,
  },
  tapTip: {
    position: 'absolute',
    top: 24,
    fontSize: 13,
    color: colors.muted,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1
  },
  
  cardWordBack: {
      fontSize: 22,
      fontFamily: typography.fontHeadline,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md
  },
  divider: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.primarySoft,
      marginBottom: spacing.lg
  },
  cardDef: {
      fontSize: 18,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 28,
  },

  controlRibbon: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.xxl,
      paddingVertical: spacing.xl,
      marginBottom: spacing.md
  },
  actionBtn: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadow.elev1
  },
  actionBtnUnknown: {
      backgroundColor: '#EF4444' // Error red
  },
  actionBtnKnown: {
      backgroundColor: '#10B981' // Success green
  },

  endContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl
  },
  endTitle: {
      fontSize: 28,
      fontFamily: typography.fontHeadline,
      fontWeight: '800',
      color: colors.text,
      marginBottom: spacing.lg
  },
  endStat: {
      fontSize: 16,
      color: colors.muted,
      marginBottom: 8
  },
  restartBtn: {
      marginTop: spacing.xl,
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: radius.pill
  },
  restartBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700'
  },
  
  // Settings Modal
  modalContainer: {
      flex: 1,
      backgroundColor: '#F8FAFC'
  },
  modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderColor: '#E2E8F0',
      backgroundColor: '#fff'
  },
  modalTitle: {
      fontSize: 18,
      fontFamily: typography.fontHeadline,
      fontWeight: '700',
      color: colors.text
  },
  closeBtn: {
      padding: spacing.xs
  },
  closeBtnText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600'
  },
  modalContent: {
      flex: 1,
      padding: spacing.lg
  },
  settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#fff',
      padding: spacing.lg,
      borderRadius: radius.md,
      marginBottom: spacing.md,
      ...shadow.sm
  },
  settingTextCol: {
      flex: 1,
      marginRight: spacing.md
  },
  settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4
  },
  settingSub: {
      fontSize: 14,
      color: colors.muted,
      lineHeight: 20
  }
});
