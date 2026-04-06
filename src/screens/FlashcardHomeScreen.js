import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ImageBackground, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, shadow } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import specializedDecks from '../../data/specialized_flashcards.json';
import wascQuizletDecks from '../../data/wasc_quizlet_decks.json';

const AWL_STATS = { total: 534, mastered: 120, learning: 45 }; // Simulated stats

export default function FlashcardHomeScreen({ navigation }) {
  const { customDecks, deleteCustomDeck, restoreCustomDeck } = useAppState();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [pendingDeletedDeck, setPendingDeletedDeck] = useState(null);
  const undoTimerRef = useRef(null);

  const clearUndoTimer = useCallback(() => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearUndoTimer(), [clearUndoTimer]);

  const filteredSearch = String(search || '').trim().toLowerCase();
  const filterDecks = useCallback((list) => {
    if (!Array.isArray(list)) return [];
    if (!filteredSearch) return list;
    return list.filter((deck) => {
      const title = String(deck?.title || '').toLowerCase();
      const description = String(deck?.description || '').toLowerCase();
      return title.includes(filteredSearch) || description.includes(filteredSearch);
    });
  }, [filteredSearch]);

  const visibleSpecialized = useMemo(
    () => (tab === 'all' || tab === 'specialized' ? filterDecks(specializedDecks) : []),
    [tab, filterDecks]
  );
  const visibleWasc = useMemo(
    () => (tab === 'all' || tab === 'wasc' ? filterDecks(wascQuizletDecks) : []),
    [tab, filterDecks]
  );
  const visibleCustom = useMemo(
    () => (tab === 'all' || tab === 'custom' ? filterDecks(customDecks) : []),
    [tab, filterDecks, customDecks]
  );
  const hasAnyResults = visibleSpecialized.length > 0 || visibleWasc.length > 0 || visibleCustom.length > 0;

  const withCards = useCallback((item) => item.cards || item.words || [], []);

  const startUndoWindow = useCallback((deck) => {
    clearUndoTimer();
    setPendingDeletedDeck(deck);
    undoTimerRef.current = setTimeout(() => {
      setPendingDeletedDeck(null);
      undoTimerRef.current = null;
    }, 5000);
  }, [clearUndoTimer]);

  const handleDeleteDeck = useCallback((id) => {
    const removed = deleteCustomDeck(id);
    if (removed) startUndoWindow(removed);
  }, [deleteCustomDeck, startUndoWindow]);

  const handleUndoDelete = useCallback(() => {
    if (!pendingDeletedDeck) return;
    restoreCustomDeck(pendingDeletedDeck);
    clearUndoTimer();
    setPendingDeletedDeck(null);
  }, [pendingDeletedDeck, restoreCustomDeck, clearUndoTimer]);

  const renderDeckCard = (item, isCustom = false, isWasc = false) => (
    <TouchableOpacity 
      key={item.id}
      style={styles.deckCard} 
      onPress={() => navigation.navigate('VocabFlashcard', { initialWords: withCards(item), title: item.title })}
    >
      <View style={styles.deckIconRow}>
         <View style={[styles.deckIcon, { backgroundColor: isCustom ? colors.primarySoft : isWasc ? '#DDEEFE' : colors.secondarySoft }]}>
            <Ionicons name={isCustom ? "person-outline" : isWasc ? "layers-outline" : "school-outline"} size={24} color={isCustom ? colors.primary : colors.secondary} />
         </View>
         {isCustom && (
            <TouchableOpacity
              onPress={(e) => {
                e?.stopPropagation?.();
                handleDeleteDeck(item.id);
              }}
              style={styles.deleteBtn}
            >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
         )}
      </View>
      <Text style={styles.deckTitle}>{item.title}</Text>
      <Text style={styles.deckSub}>{item.description || `${withCards(item).length} words`}</Text>
      <View style={styles.deckFooter}>
         <Text style={styles.deckLevel}>{item.level || 'Custom'} • {withCards(item).length} cards</Text>
         <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <View style={styles.header}>
            <View>
                <Text style={styles.welcomeText}>Flashcard Master</Text>
                <Text style={styles.subWelcome}>Choose your study deck smoothly</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateFlashcardDeck')}>
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </View>

        {pendingDeletedDeck && (
          <View style={styles.undoBanner}>
            <Text style={styles.undoBannerText} numberOfLines={1}>
              "{pendingDeletedDeck.title}" deleted
            </Text>
            <TouchableOpacity onPress={handleUndoDelete} style={styles.undoBtn}>
              <Ionicons name="arrow-undo-outline" size={16} color={colors.textOnSecondary} />
              <Text style={styles.undoBtnText}>Undo</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.6)" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search a deck..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabRow}>
          {[
            { id: 'all', label: 'All' },
            { id: 'specialized', label: 'BUEPT' },
            { id: 'wasc', label: 'WASC' },
            { id: 'custom', label: 'Mine' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.tabBtn, tab === item.id && styles.tabBtnActive]}
              onPress={() => setTab(item.id)}
            >
              <Text style={[styles.tabBtnText, tab === item.id && styles.tabBtnTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AWL Master Library Hero */}
        <TouchableOpacity 
            style={styles.heroCard}
            onPress={() => navigation.navigate('VocabFlashcard', { title: 'AWL Master Library' })}
        >
            <ImageBackground 
                source={{ uri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop' }} 
                style={styles.heroBg}
                imageStyle={{ borderRadius: 24, opacity: 0.2 }}
            >
                <View style={styles.heroContent}>
                    <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>CORE CONTENT</Text></View>
                    <Text style={styles.heroTitle}>Academic Wordlist (AWL)</Text>
                    <Text style={styles.heroSub}>534 essential words with collocations and examples.</Text>
                    <View style={styles.heroStats}>
                        <View style={styles.heroStatItem}>
                            <Text style={styles.heroStatVal}>{AWL_STATS.total}</Text>
                            <Text style={styles.heroStatLab}>Words</Text>
                        </View>
                        <View style={styles.heroStatDivider} />
                        <View style={styles.heroStatItem}>
                            <Text style={styles.heroStatVal}>{AWL_STATS.mastered}</Text>
                            <Text style={styles.heroStatLab}>Mastered</Text>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>

        {/* Specialized Decks Section */}
        {visibleSpecialized.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>BUEPT Specialized Decks</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {visibleSpecialized.map((deck) => renderDeckCard(deck))}
            </ScrollView>
          </>
        )}

        {visibleWasc.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>WASC Quizlet Decks</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {visibleWasc.map((deck) => renderDeckCard(deck, false, true))}
            </ScrollView>
          </>
        )}

        {/* Custom Decks Section */}
        {(tab === 'all' || tab === 'custom') && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Custom Decks</Text>
            </View>
            {visibleCustom.length > 0 ? (
              <View style={styles.grid}>
                {visibleCustom.map((deck) => renderDeckCard(deck, true))}
              </View>
            ) : (
              <TouchableOpacity style={styles.emptyState} onPress={() => navigation.navigate('CreateFlashcardDeck')}>
                <Ionicons name="add-circle-outline" size={48} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>{filteredSearch ? 'No decks match this search' : 'Create your first custom deck'}</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {!hasAnyResults && tab !== 'custom' && (
          <View style={styles.emptyResultCard}>
            <Ionicons name="sparkles-outline" size={30} color="rgba(255,255,255,0.35)" />
            <Text style={styles.emptyResultTitle}>No decks found</Text>
            <Text style={styles.emptyResultBody}>Try a different keyword or switch tab.</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { padding: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10
  },
  welcomeText: { fontSize: 28, fontWeight: '800', color: '#fff', fontFamily: typography.fontHeadline },
  subWelcome: { fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  addBtn: {
    width: 56, height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    justifyContent: 'center', alignItems: 'center',
    ...shadow.md
  },
  undoBanner: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  undoBannerText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  undoBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  undoBtnText: { color: colors.textOnSecondary, fontSize: 12, fontWeight: '800' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingVertical: 0,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  tabBtn: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(52, 117, 238, 0.24)',
    borderColor: 'rgba(110, 170, 255, 0.6)',
  },
  tabBtnText: { color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '700' },
  tabBtnTextActive: { color: '#fff' },
  
  heroCard: {
      height: 220,
      marginBottom: 30,
      borderRadius: 24,
      backgroundColor: '#1E293B',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)'
  },
  heroBg: { flex: 1, padding: 24 },
  heroContent: { flex: 1, justifyContent: 'flex-end' },
  heroBadge: { 
      backgroundColor: colors.secondary, 
      alignSelf: 'flex-start', 
      paddingHorizontal: 10, 
      paddingVertical: 4, 
      borderRadius: 8,
      marginBottom: 12
  },
  heroBadgeText: { color: colors.textOnSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 8 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 20, marginBottom: 16 },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  heroStatItem: { alignItems: 'flex-start' },
  heroStatVal: { fontSize: 18, fontWeight: '800', color: '#fff' },
  heroStatLab: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
  heroStatDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' },

  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  horizontalScroll: { paddingRight: 40, gap: 16, marginBottom: 30 },
  
  deckCard: {
      width: 180,
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: 24,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
      ...shadow.sm
  },
  deckIconRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  deckIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { padding: 4 },
  deckTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  deckSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 18, height: 36 },
  deckFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  deckLevel: { fontSize: 11, fontWeight: '700', color: colors.secondary, opacity: 0.8 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  
  emptyState: {
      height: 140,
      borderRadius: 24,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: 'rgba(255,255,255,0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12
  },
  emptyText: { color: 'rgba(255,255,255,0.2)', fontWeight: '600' },
  emptyResultCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyResultTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  emptyResultBody: { color: 'rgba(255,255,255,0.45)', fontSize: 13 },
});
