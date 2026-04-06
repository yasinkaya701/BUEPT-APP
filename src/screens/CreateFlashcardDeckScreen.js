import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/tokens';
import { useAppState } from '../context/AppState';

export default function CreateFlashcardDeckScreen({ navigation }) {
  const { addCustomDeck } = useAppState();
  const [title, setTitle] = useState('');
  const [wordInput, setWordInput] = useState('');
  const [words, setWords] = useState([]);
  const [undoStack, setUndoStack] = useState([]);

  const handleAddWord = () => {
    const w = wordInput.trim().toLowerCase();
    if (!w) return;
    if (words.some((item) => item.toLowerCase() === w.toLowerCase())) {
      Alert.alert('Duplicate', 'This word is already in your list.');
      return;
    }
    setWords([...words, w]);
    setWordInput('');
  };

  const removeWord = (index) => {
    const removedWord = words[index];
    if (!removedWord) return;
    setUndoStack((old) => [...old, { word: removedWord, index }].slice(-20));
    setWords((prev) => prev.filter((_, i) => i !== index));
  };

  const undoRemoveWord = () => {
    const last = undoStack[undoStack.length - 1];
    if (!last) return;
    setUndoStack((prev) => prev.slice(0, -1));
    setWords((prev) => {
      const next = [...prev];
      const restoredIndex = Math.max(0, Math.min(last.index, next.length));
      next.splice(restoredIndex, 0, last.word);
      return next;
    });
  };

  const addManyWords = () => {
    const pieces = wordInput
      .split(/[\n,;]+/g)
      .map((item) => item.trim())
      .filter(Boolean);
    if (pieces.length === 0) return;
    const unique = Array.from(new Set(pieces.map((item) => item.toLowerCase())));
    setWords((prev) => {
      const existing = new Set(prev.map((item) => item.toLowerCase()));
      const incoming = unique.filter((item) => !existing.has(item));
      return [...prev, ...incoming];
    });
    setWordInput('');
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please give your deck a name.');
      return;
    }
    if (words.length === 0) {
      Alert.alert('Empty Deck', 'Add at least one word to your deck.');
      return;
    }

    // Convert list of strings to word objects for the flashcard component
    const wordObjects = words.map(w => ({ word: w, definition: 'Custom Word' }));
    addCustomDeck(title, wordObjects);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView enabled={Platform.OS !== 'web'} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Study Deck</Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Deck Name</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="e.g., Exam Connectors, Weak Words..." 
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={title}
                    onChangeText={setTitle}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Add Words</Text>
                <View style={styles.addWordRow}>
                    <TextInput 
                        style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                        placeholder="Type a word..." 
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        value={wordInput}
                        onChangeText={setWordInput}
                        onSubmitEditing={handleAddWord}
                    />
                    <TouchableOpacity style={styles.addIconBtn} onPress={handleAddWord}>
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.inlineActions}>
                    <TouchableOpacity style={styles.inlineBtn} onPress={addManyWords}>
                        <Ionicons name="sparkles-outline" size={14} color={colors.secondary} />
                        <Text style={styles.inlineBtnText}>Add batch</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.inlineBtn, undoStack.length === 0 && styles.inlineBtnDisabled]} onPress={undoRemoveWord} disabled={undoStack.length === 0}>
                        <Ionicons name="arrow-undo-outline" size={14} color={undoStack.length === 0 ? 'rgba(255,255,255,0.35)' : colors.secondary} />
                        <Text style={[styles.inlineBtnText, undoStack.length === 0 && styles.inlineBtnTextDisabled]}>Undo remove</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.tip}>Tip: Words will be enriched with definitions and examples automatically if they exist in our library.</Text>
            </View>

            <View style={styles.listSection}>
                <Text style={styles.sectionHeader}>Words in this deck ({words.length})</Text>
                <View style={styles.wordGrid}>
                    {words.map((w, i) => (
                        <View key={i} style={styles.wordTag}>
                            <Text style={styles.wordTagText}>{w}</Text>
                            <TouchableOpacity onPress={() => removeWord(i)}>
                                <Ionicons name="close-circle" size={18} color={colors.secondary} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
                {words.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="list-outline" size={48} color="rgba(255,255,255,0.1)" />
                        <Text style={styles.emptyText}>Your list is empty</Text>
                    </View>
                )}
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  saveBtn: { backgroundColor: colors.secondary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  saveBtnText: { color: colors.textOnSecondary, fontWeight: '800' },

  scrollContent: { padding: 24 },
  inputGroup: { marginBottom: 32 },
  label: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, marginBottom: 12, textTransform: 'uppercase' },
  input: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 16,
      padding: 16,
      color: '#fff',
      fontSize: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      marginBottom: 8
  },
  addWordRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  addIconBtn: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  inlineActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  inlineBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
      backgroundColor: 'rgba(255,255,255,0.03)',
      paddingHorizontal: 10,
      paddingVertical: 8,
  },
  inlineBtnDisabled: { opacity: 0.45 },
  inlineBtnText: { color: '#E2E8F0', fontSize: 12, fontWeight: '700' },
  inlineBtnTextDisabled: { color: 'rgba(255,255,255,0.42)' },
  tip: { fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 18, marginTop: 8 },

  listSection: { marginTop: 10 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 20 },
  wordGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  wordTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.05)',
      paddingLeft: 16,
      paddingRight: 8,
      paddingVertical: 8,
      borderRadius: 12,
      gap: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)'
  },
  wordTagText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  
  emptyState: { alignItems: 'center', marginTop: 40, opacity: 0.5 },
  emptyText: { color: '#fff', marginTop: 12, fontSize: 14, fontWeight: '600' }
});
