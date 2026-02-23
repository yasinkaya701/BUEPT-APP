import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, TouchableOpacity } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import Chip from '../components/Chip';
import Screen from '../components/Screen';
import { colors, spacing, typography } from '../theme/tokens';
import { getDictionaryCount, getDictionarySample, getWordEntry } from '../utils/dictionary';
import { speakEnglish } from '../utils/ttsEnglish';
import { useAppState } from '../context/AppState';
import academic from '../../data/academic_wordlist.json';
import bogaziciDeptVocab from '../../data/bogazici_department_vocab.json';

const LEVELS = ['All', 'A1', 'A2', 'B1', 'B2', 'C1'];
const SECTIONS = [
  { key: 'My Words', label: 'My Words' },
  { key: 'Academic', label: 'Academic' },
  { key: 'Dictionary', label: 'Dictionary' },
  { key: 'Unknown', label: 'Unknown' },
  { key: 'Bogazici Dept', label: 'BUEPT Dept' },
];

const LEVEL_COLORS = {
  A1: '#4CAF50', A2: '#8BC34A', B1: '#2196F3',
  B2: '#3F51B5', C1: '#9C27B0',
};

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function seededIndex(seed, length) {
  if (!length) return 0;
  return Math.abs((seed * 9301 + 49297) % 233280) % length;
}

function buildVocabChallenge(pool = [], seed = 1) {
  if (!Array.isArray(pool) || pool.length < 4) return null;
  const source = pool.filter((item) => item.word && item.def);
  if (source.length < 4) return null;
  const target = source[seededIndex(seed, source.length)];
  const distractors = source
    .filter((item) => item.word !== target.word && item.def !== target.def)
    .slice(0, 30);
  if (distractors.length < 3) return null;
  const wrong = [
    distractors[seededIndex(seed + 1, distractors.length)],
    distractors[seededIndex(seed + 7, distractors.length)],
    distractors[seededIndex(seed + 13, distractors.length)],
  ].map((x) => x.def);
  const options = [target.def, ...wrong].sort((a, b) => seededIndex(seed + a.length, 100) - seededIndex(seed + b.length, 100));
  const correctIndex = options.findIndex((o) => o === target.def);
  return { word: target.word, options, correctIndex };
}

/* Speak a word via TTS */
async function speakWord(word) {
  try {
    await speakEnglish(word, { rate: 0.48 });
  } catch (_) { }
}

function VocabCard({ item, expanded, onToggle, stats }) {
  return (
    <Pressable onPress={onToggle}>
      <Card style={styles.card}>
        <View style={styles.wordRow}>
          {/* Tap word text to hear pronunciation */}
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation?.(); speakWord(item.word); }}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            style={styles.wordTapArea}
          >
            <Text style={styles.word}>{item.word}</Text>
            <Text style={styles.ttsIcon}>🔊</Text>
          </TouchableOpacity>
          {item.level ? (
            <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[item.level] || colors.secondary }]}>
              <Text style={styles.levelBadgeText}>{item.level}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.meta}>{item.word_type || '—'}</Text>
        <Text style={styles.def}>{item.simple_definition || 'Definition pending'}</Text>
        {stats ? (
          <Text style={styles.stats}>Known: {stats.known || 0} • Unknown: {stats.unknown || 0}</Text>
        ) : null}
        {expanded && (
          <View style={styles.expandedSection}>
            {item.derivatives?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Word Forms</Text>
                <Text style={styles.sub}>{item.derivatives.slice(0, 6).join(', ')}</Text>
              </>
            )}
            {item.synonyms?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Synonyms</Text>
                <View style={styles.chipRow}>
                  {item.synonyms.slice(0, 6).map((s, i) => (
                    <TouchableOpacity key={i} onPress={() => speakWord(s)} style={styles.miniChip}>
                      <Text style={styles.miniChipText}>{s} 🔊</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
            {item.antonyms?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Antonyms</Text>
                <Text style={styles.sub}>{item.antonyms.slice(0, 6).join(', ')}</Text>
              </>
            )}
            {item.collocations?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Collocations</Text>
                <Text style={styles.sub}>{item.collocations.slice(0, 6).join(', ')}</Text>
              </>
            )}
            {item.examples?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Example</Text>
                <Text style={styles.example}>"{item.examples[0]}"</Text>
                <TouchableOpacity onPress={() => speakWord(item.examples[0])} style={styles.exampleSpeak}>
                  <Text style={styles.speakExText}>🔊 Read example</Text>
                </TouchableOpacity>
              </>
            )}
            {item.common_errors?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Common Errors</Text>
                <Text style={styles.commonErrorText}>{item.common_errors.slice(0, 2).join(' | ')}</Text>
              </>
            )}
          </View>
        )}
        <Text style={styles.expandHint}>{expanded ? '▲ Collapse' : '▼ Tap to expand'}</Text>
      </Card>
    </Pressable>
  );
}

export default function VocabScreen({ navigation }) {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('All');
  const [activeSection, setActiveSection] = useState('Dictionary');
  const [expanded, setExpanded] = useState({});
  const [challengeSeed, setChallengeSeed] = useState(1);
  const [challengeSelected, setChallengeSelected] = useState(null);
  const [challengeChecked, setChallengeChecked] = useState(false);
  const [sentenceInput, setSentenceInput] = useState('');
  const [sentenceFeedback, setSentenceFeedback] = useState('');
  const [dept, setDept] = useState(bogaziciDeptVocab[0]?.id || '');
  const [deptQuery, setDeptQuery] = useState('');
  const [deptChallengeSeed, setDeptChallengeSeed] = useState(1);
  const [deptChallengeSelected, setDeptChallengeSelected] = useState(null);
  const [deptChallengeChecked, setDeptChallengeChecked] = useState(false);
  const [academicRenderLimit, setAcademicRenderLimit] = useState(60);
  const [deptRenderLimit, setDeptRenderLimit] = useState(60);
  const { userWords, unknownWords, addUserWord, clearUnknownWords, vocabStats } = useAppState();
  const total = getDictionaryCount();
  const challengePool = useMemo(() => {
    const dict = getDictionarySample(1200).map((v) => ({ word: v.word, def: v.simple_definition })).filter((v) => v.word && v.def);
    const acad = academic.map((w) => ({ word: w.word, def: w.definition })).filter((v) => v.word && v.def);
    return [...dict, ...acad];
  }, []);
  const challenge = useMemo(() => buildVocabChallenge(challengePool, challengeSeed), [challengePool, challengeSeed]);
  const wordOfDay = useMemo(() => {
    const daySeed = Number(new Date().toISOString().slice(8, 10)) || 1;
    const list = getDictionarySample(1500).filter((v) => v.word && v.simple_definition);
    if (!list.length) return null;
    return list[seededIndex(daySeed * 17, list.length)];
  }, []);

  const vocab = useMemo(() => {
    const list = getDictionarySample(20000);
    return list.filter((v) => {
      const matchQuery = query ? v.word.includes(query.toLowerCase()) : true;
      const matchLevel = level !== 'All' ? v.level === level : true;
      return matchQuery && matchLevel;
    }).slice(0, 100);
  }, [query, level]);
  const deptList = useMemo(() => bogaziciDeptVocab.map((d) => ({ id: d.id, department: d.department })), []);
  const deptWords = useMemo(() => {
    const selected = bogaziciDeptVocab.find((d) => d.id === dept) || bogaziciDeptVocab[0];
    const rawWords = Array.isArray(selected?.words) ? selected.words : [];
    const q = String(deptQuery || '').trim().toLowerCase();
    return rawWords
      .filter((item) => !q || String(item.word || '').toLowerCase().includes(q) || String(item.definition || '').toLowerCase().includes(q))
      .map((item) => {
        const entry = getWordEntry(item.word) || {};
        const safeSynonyms = Array.isArray(entry.synonyms) ? entry.synonyms : [];
        const safeAntonyms = Array.isArray(entry.antonyms) ? entry.antonyms : [];
        const safeCollocations = Array.isArray(entry.collocations) ? entry.collocations : [];
        const safeExamples = Array.isArray(entry.examples) ? entry.examples : [];
        return {
          ...entry,
          word: item.word,
          word_type: entry.word_type || 'departmental term',
          simple_definition: item.definition || entry.simple_definition || 'Definition pending',
          synonyms: safeSynonyms,
          antonyms: safeAntonyms,
          collocations: safeCollocations,
          examples: item.example ? [item.example, ...safeExamples] : safeExamples,
        };
      });
  }, [dept, deptQuery]);
  const academicList = useMemo(() => academic.slice(0, academicRenderLimit), [academicRenderLimit]);
  const deptVisibleWords = useMemo(() => deptWords.slice(0, deptRenderLimit), [deptWords, deptRenderLimit]);
  const selectedDeptLabel = useMemo(
    () => (bogaziciDeptVocab.find((d) => d.id === dept)?.department || 'Bogazici Department'),
    [dept]
  );
  const deptChallenge = useMemo(
    () => buildVocabChallenge(deptWords.map((w) => ({ word: w.word, def: w.simple_definition })), deptChallengeSeed),
    [deptWords, deptChallengeSeed]
  );
  const progress = useMemo(() => {
    const all = Object.values(vocabStats || {});
    let known = 0;
    let unknown = 0;
    all.forEach((x) => {
      known += Number(x?.known || 0);
      unknown += Number(x?.unknown || 0);
    });
    const totalChecks = known + unknown;
    const knownPct = totalChecks ? Math.round((known / totalChecks) * 100) : 0;
    return { known, unknown, totalChecks, knownPct };
  }, [vocabStats]);
  const smartReview = useMemo(() => {
    const keys = Object.keys(vocabStats || {});
    const weighted = keys
      .map((w) => {
        const st = vocabStats[w] || {};
        const k = Number(st.known || 0);
        const u = Number(st.unknown || 0);
        return { w, score: u * 3 - k };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => getWordEntry(x.w))
      .filter(Boolean);
    return weighted;
  }, [vocabStats]);

  const onAdd = () => {
    addUserWord(input.trim());
    setInput('');
  };

  const submitChallenge = () => {
    if (challengeSelected == null) return;
    setChallengeChecked(true);
  };

  const nextChallenge = () => {
    setChallengeSeed((s) => s + 1);
    setChallengeSelected(null);
    setChallengeChecked(false);
  };

  const checkSentence = () => {
    const sentence = String(sentenceInput || '').trim();
    const targetWord = challenge?.word || wordOfDay?.word;
    if (!sentence || !targetWord) {
      setSentenceFeedback('Write a sentence first.');
      return;
    }
    const escaped = escapeRegExp(targetWord.toLowerCase());
    const hasWord = new RegExp(`\\b${escaped}\\b`).test(sentence.toLowerCase());
    const wc = sentence.split(/\s+/).filter(Boolean).length;
    if (!hasWord) {
      setSentenceFeedback(`Use the target word "${targetWord}" in your sentence.`);
      return;
    }
    if (wc < 8) {
      setSentenceFeedback('Sentence is too short. Try 8+ words.');
      return;
    }
    setSentenceFeedback('Good sentence. Word usage looks valid.');
  };

  const toggle = (w) => setExpanded((prev) => ({ ...prev, [w]: !prev[w] }));
  const addTopDeptWords = () => {
    deptWords.slice(0, 10).forEach((item) => addUserWord(item.word));
  };
  const checkDeptChallenge = () => {
    if (deptChallengeSelected == null) return;
    setDeptChallengeChecked(true);
  };
  const nextDeptChallenge = () => {
    setDeptChallengeSeed((s) => s + 1);
    setDeptChallengeSelected(null);
    setDeptChallengeChecked(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'My Words':
        return (
          <>
            <Card style={styles.card}>
              <Text style={styles.h3}>Add a Word</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. substantial"
                value={input}
                onChangeText={setInput}
                autoCapitalize="none"
                placeholderTextColor={colors.muted}
              />
              <Button label="Add to My Words" onPress={onAdd} />
            </Card>
            {userWords.length === 0 ? (
              <Text style={styles.sub}>No saved words yet. Add words from the Dictionary section.</Text>
            ) : (
              userWords.map((v) => (
                <VocabCard key={v.word} item={v} expanded={!!expanded[v.word]} onToggle={() => toggle(v.word)} stats={vocabStats[v.word]} />
              ))
            )}
          </>
        );
      case 'Academic':
        return (
          <>
            {academicList.map((w) => {
          const entry = getWordEntry(w.word) || {};
          const merged = { ...w, ...entry, simple_definition: w.definition || entry.simple_definition, word: w.word };
          return (
            <VocabCard key={w.word} item={merged} expanded={!!expanded[w.word]} onToggle={() => toggle(w.word)} stats={vocabStats[w.word]} />
          );
            })}
            {academicRenderLimit < academic.length ? (
              <Button label="Load More Academic Words" variant="secondary" onPress={() => setAcademicRenderLimit((n) => n + 60)} />
            ) : null}
          </>
        );
      case 'Dictionary':
        return (
          <>
            <Text style={styles.dictMeta}>Total: {total} entries • Showing top 100</Text>
            <TextInput
              style={styles.input}
              placeholder="Search dictionary..."
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              placeholderTextColor={colors.muted}
            />
            {/* Level filter */}
            <View style={styles.levelRow}>
              {LEVELS.map((lvl) => (
                <Chip key={lvl} label={lvl} active={level === lvl} onPress={() => setLevel(lvl)} />
              ))}
            </View>
            {vocab.map((v) => (
              <VocabCard key={v.word} item={v} expanded={!!expanded[v.word]} onToggle={() => toggle(v.word)} stats={vocabStats[v.word]} />
            ))}
          </>
        );
      case 'Unknown':
        return (
          <>
            {unknownWords.length > 0 && (
              <Button label="Clear Unknown List" variant="secondary" onPress={clearUnknownWords} />
            )}
            {unknownWords.length === 0 ? (
              <Text style={styles.sub}>No unknown words yet. Long-press words while reading/listening to mark them.</Text>
            ) : (
              unknownWords.map((v) => (
                <VocabCard key={v.word} item={v} expanded={!!expanded[v.word]} onToggle={() => toggle(v.word)} stats={vocabStats[v.word]} />
              ))
            )}
          </>
        );
      case 'Bogazici Dept':
        return (
          <>
            <Card style={styles.card}>
              <Text style={styles.h3}>Bogazici Department Vocabulary</Text>
              <Text style={styles.sub}>Long-form vocabulary sets grouped by Bogazici departments only.</Text>
              <View style={styles.levelRow}>
                {deptList.map((d) => (
                  <Chip
                    key={d.id}
                    label={d.department.replace('Bogazici - ', '')}
                    active={dept === d.id}
                    onPress={() => {
                      setDept(d.id);
                      setDeptRenderLimit(60);
                    }}
                  />
                ))}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Search in selected department..."
                value={deptQuery}
                onChangeText={(v) => {
                  setDeptQuery(v);
                  setDeptRenderLimit(60);
                }}
                autoCapitalize="none"
                placeholderTextColor={colors.muted}
              />
              <Text style={styles.dictMeta}>Showing {deptWords.length} words</Text>
              <View style={styles.quizRow}>
                <Button label="Add Top 10 To My Words" variant="secondary" onPress={addTopDeptWords} />
              </View>
            </Card>
            <Card style={styles.card}>
              <Text style={styles.h3}>Department Challenge</Text>
              <Text style={styles.sub}>{selectedDeptLabel}</Text>
              {!deptChallenge ? (
                <Text style={styles.sub}>Not enough words for challenge in current filter.</Text>
              ) : (
                <>
                  <Text style={styles.challengePrompt}>Best definition for: <Text style={styles.challengeWord}>{deptChallenge.word}</Text></Text>
                  {deptChallenge.options.map((option, idx) => {
                    const selected = deptChallengeSelected === idx;
                    const isCorrect = deptChallengeChecked && idx === deptChallenge.correctIndex;
                    const isWrongSelected = deptChallengeChecked && selected && idx !== deptChallenge.correctIndex;
                    return (
                      <TouchableOpacity
                        key={`${deptChallenge.word}-dept-${idx}`}
                        style={[styles.challengeOption, selected && styles.challengeOptionSelected, isCorrect && styles.challengeOptionCorrect, isWrongSelected && styles.challengeOptionWrong]}
                        onPress={() => !deptChallengeChecked && setDeptChallengeSelected(idx)}
                      >
                        <Text style={styles.challengeOptionText}>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                  <View style={styles.quizRow}>
                    <Button label="Check" variant="secondary" onPress={checkDeptChallenge} />
                    <Button label="Next" variant="secondary" onPress={nextDeptChallenge} />
                    <Button label="Add Word" onPress={() => addUserWord(deptChallenge.word)} />
                  </View>
                </>
              )}
            </Card>
            {deptVisibleWords.map((v) => (
              <VocabCard key={`${dept}-${v.word}`} item={v} expanded={!!expanded[`${dept}-${v.word}`]} onToggle={() => toggle(`${dept}-${v.word}`)} stats={vocabStats[v.word]} />
            ))}
            {deptRenderLimit < deptWords.length ? (
              <Button label="Load More Department Words" variant="secondary" onPress={() => setDeptRenderLimit((n) => n + 60)} />
            ) : null}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Text style={styles.h1}>📚 Vocabulary</Text>

      {/* Banner */}
      <Card style={styles.banner}>
        <Text style={styles.bannerTitle}>💡 Study Tip</Text>
        <Text style={styles.bannerBody}>
          Tap any word to hear its pronunciation. Expand a card to see synonyms, examples, and collocations.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Word of the Day</Text>
        {!wordOfDay ? (
          <Text style={styles.sub}>No word available.</Text>
        ) : (
          <>
            <View style={styles.wordRow}>
              <TouchableOpacity onPress={() => speakWord(wordOfDay.word)} style={styles.wordTapArea}>
                <Text style={styles.word}>{wordOfDay.word}</Text>
                <Text style={styles.ttsIcon}>🔊</Text>
              </TouchableOpacity>
              {wordOfDay.level ? (
                <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[wordOfDay.level] || colors.secondary }]}>
                  <Text style={styles.levelBadgeText}>{wordOfDay.level}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.sub}>{wordOfDay.simple_definition}</Text>
            <View style={styles.quizRow}>
              <Button label="Add to My Words" variant="secondary" onPress={() => addUserWord(wordOfDay.word)} />
              <Button label="Find Synonyms" variant="secondary" onPress={() => navigation.navigate('SynonymFinder')} />
            </View>
          </>
        )}
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Vocab Progress</Text>
        <Text style={styles.sub}>Known checks: {progress.known} • Unknown checks: {progress.unknown}</Text>
        <Text style={styles.sub}>Known ratio: {progress.knownPct}%</Text>
      </Card>

      {/* Quick Quizzes */}
      <Card style={styles.card}>
        <Text style={styles.h3}>Quick Quizzes</Text>
        <View style={styles.quizRow}>
          <Button label="Word Quiz" variant="secondary" onPress={() => navigation.navigate('VocabPractice')} />
          <Button label="Synonyms Quiz" variant="secondary" onPress={() => navigation.navigate('VocabSynonymQuiz')} />
          <Button label="Fill Blank" variant="secondary" onPress={() => navigation.navigate('VocabClozeQuiz')} />
          <Button label="🔍 Synonym Finder" variant="secondary" onPress={() => navigation.navigate('SynonymFinder')} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Daily Vocab Challenge</Text>
        {!challenge ? (
          <Text style={styles.sub}>Challenge data is loading.</Text>
        ) : (
          <>
            <Text style={styles.challengePrompt}>Best definition for: <Text style={styles.challengeWord}>{challenge.word}</Text></Text>
            {challenge.options.map((option, idx) => {
              const selected = challengeSelected === idx;
              const isCorrect = challengeChecked && idx === challenge.correctIndex;
              const isWrongSelected = challengeChecked && selected && idx !== challenge.correctIndex;
              return (
                <TouchableOpacity
                  key={`${challenge.word}-${idx}`}
                  style={[styles.challengeOption, selected && styles.challengeOptionSelected, isCorrect && styles.challengeOptionCorrect, isWrongSelected && styles.challengeOptionWrong]}
                  onPress={() => !challengeChecked && setChallengeSelected(idx)}
                >
                  <Text style={styles.challengeOptionText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
            <View style={styles.quizRow}>
              <Button label="Check" variant="secondary" onPress={submitChallenge} />
              <Button label="Next Challenge" variant="secondary" onPress={nextChallenge} />
              <Button label="Add Word" onPress={() => addUserWord(challenge.word)} />
            </View>
          </>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Sentence Practice</Text>
        <Text style={styles.sub}>
          Target word: {(challenge?.word || wordOfDay?.word || 'N/A')}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Write one sentence using the target word..."
          value={sentenceInput}
          onChangeText={setSentenceInput}
        />
        <View style={styles.quizRow}>
          <Button label="Check Sentence" variant="secondary" onPress={checkSentence} />
          <Button label="Read Sentence" variant="secondary" onPress={() => speakWord(sentenceInput)} />
        </View>
        {sentenceFeedback ? <Text style={styles.sub}>{sentenceFeedback}</Text> : null}
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Smart Review Queue</Text>
        {smartReview.length === 0 ? (
          <Text style={styles.sub}>No high-risk words yet. Keep practicing quizzes first.</Text>
        ) : (
          smartReview.map((v) => (
            <VocabCard key={`review-${v.word}`} item={v} expanded={!!expanded[`review-${v.word}`]} onToggle={() => toggle(`review-${v.word}`)} stats={vocabStats[v.word]} />
          ))
        )}
      </Card>

      {/* Section Tabs */}
      <View style={styles.tabRow}>
        {SECTIONS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeSection === key && styles.tabActive]}
            onPress={() => setActiveSection(key)}
          >
            <Text style={[styles.tabText, activeSection === key && styles.tabTextActive]}>{label}</Text>
            {key === 'My Words' && userWords.length > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{userWords.length}</Text></View>
            )}
            {key === 'Unknown' && unknownWords.length > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{unknownWords.length}</Text></View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {renderSection()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.md,
  },
  h3: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm,
  },
  banner: {
    marginBottom: spacing.md,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
  },
  bannerBody: {
    color: '#DDE8FF',
    marginTop: spacing.xs,
    fontSize: typography.small,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: 4,
    gap: 2,
  },
  tab: {
    minWidth: '31%',
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 11,
    fontFamily: typography.fontHeadline,
    color: colors.muted,
  },
  tabTextActive: {
    color: '#fff',
  },
  badge: {
    backgroundColor: '#FF5722',
    borderRadius: 999,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: { color: '#fff', fontSize: 9, fontFamily: typography.fontHeadline },
  quizRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  card: { marginBottom: spacing.md },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  wordTapArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  word: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  ttsIcon: { fontSize: 16 },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
  },
  levelBadgeText: {
    color: '#fff',
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
  },
  meta: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  def: {
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stats: {
    fontSize: typography.small,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  expandedSection: { marginTop: spacing.sm },
  sectionTitle: {
    marginTop: spacing.sm,
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  miniChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
  },
  miniChipText: {
    fontSize: typography.small,
    color: colors.primary,
  },
  example: {
    fontSize: typography.small,
    color: colors.text,
    fontStyle: 'italic',
    marginTop: 4,
  },
  exampleSpeak: { marginTop: 4 },
  speakExText: {
    fontSize: typography.small,
    color: colors.primary,
  },
  expandHint: {
    fontSize: 11,
    color: colors.muted,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.secondary,
    fontSize: typography.body,
    color: colors.text,
  },
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  dictMeta: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  challengePrompt: {
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  challengeWord: {
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  challengeOption: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: '#fff',
  },
  challengeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  challengeOptionCorrect: {
    borderColor: '#16A34A',
    backgroundColor: '#ECFDF3',
  },
  challengeOptionWrong: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  challengeOptionText: {
    fontSize: typography.small,
    color: colors.text,
  },
  commonErrorText: {
    fontSize: typography.small,
    color: '#FF5722',
    marginTop: 2,
  },
});
