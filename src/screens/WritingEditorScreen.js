import React, { useEffect, useMemo, useState } from 'react';
import { 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  useWindowDimensions 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../components/Button';
import Card from '../components/Card';
import Chip from '../components/Chip';
import Screen from '../components/Screen';
import { colors, shadow, spacing, typography, radius } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import { countWords } from '../utils/ys9Mock';
import { requestWritingAssistant } from '../utils/onlineFeedback';
import { loadDraft, saveDraft } from '../utils/essayStorage';
import { calculateLiveInsights } from '../utils/rubricScoring';

const VIEWS = ['draft', 'guide', 'assistant', 'coach', 'resources'];

function formatLabel(value = '') {
  return String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
}

const templates = {
  opinion: {
    intro: ['I firmly believe that', 'From my perspective,', 'It is my conviction that', 'The evidence strongly suggests that', 'One cannot ignore the fact that'],
    body: ['A primary reason for this is', 'Furthermore,', 'Moreover,', 'In addition to this,', 'This is evidenced by'],
    conclusion: ['To summarize,', 'All things considered,', 'Ultimately,', 'Drawing these points together,', 'It is clear that'],
  },
  compare_contrast: {
    intro: ['This essay will explore the similarities and differences between', 'While some argue that... others suggest...', 'There is a stark contrast between', 'Both concepts share several key features, yet'],
    body: ['Conversely,', 'In stark contrast,', 'On the other hand,', 'Similarly,', 'In a similar vein,', 'While... on one hand, ... on the other'],
    conclusion: ['Weighing both sides,', 'In conclusion,', 'Despite these differences,', 'In light of these comparisons,'],
  },
  cause_effect: {
    intro: ['This essay examines the root causes of...', 'Several factors contribute to...', 'The primary reason for this phenomenon is'],
    body: ['As a result,', 'Consequently,', 'For this reason,', 'This leads to', 'One immediate effect is'],
    conclusion: ['To conclude, the effects of... are far-reaching.', 'In summary, addressing the causes is crucial.'],
  },
  general: {
    intro: ['The issue of... has become increasingly relevant.', 'This essay discusses', 'It is widely acknowledged that'],
    body: ['Firstly,', 'Secondly,', 'Additionally,', 'Specifically,', 'Notably,', 'From an academic standpoint,'],
    conclusion: ['In summary,', 'To conclude,', 'As a final point,', 'Given these points,'],
  }
};

function buildStructureRoute(task = 'paragraph', type = 'opinion', templateBlock = {}, targetWords = 120) {
  const introStarter = templateBlock?.intro?.[0] || 'This topic matters because';
  const bodyStarter = templateBlock?.body?.[0] || 'One clear reason is that';
  const conclusionStarter = templateBlock?.conclusion?.[0] || 'In conclusion,';
  
  if (task === 'essay') {
    return [
      { key: 'intro', title: 'Introduction', target: '40-60 words', note: 'Topic background + Thesis.', starter: introStarter },
      { key: 'body1', title: 'Body 1', target: '60-80 words', note: 'Strongest argument + Example.', starter: bodyStarter },
      { key: 'body2', title: 'Body 2', target: '60-80 words', note: 'Second argument or counter-point.', starter: bodyStarter },
      { key: 'conclusion', title: 'Conclusion', target: '30-40 words', note: 'Restate thesis + Final thought.', starter: conclusionStarter },
    ];
  }
  return [
    { key: 'opening', title: 'Opening', target: '30-40 words', note: 'Direct answer to the prompt.', starter: introStarter },
    { key: 'support', title: 'Support', target: '70-90 words', note: 'Evidence and development.', starter: bodyStarter },
    { key: 'closing', title: 'Closing', target: '20-30 words', note: 'Wrap up sentence.', starter: conclusionStarter },
  ];
}

function BandMeter({ band, readiness }) {
  return (
    <View style={styles.bandMeter}>
      <View style={[styles.bandBadge, { backgroundColor: band?.color || colors.primary }]}>
        <Text style={styles.bandCode}>{band?.code || '??'}</Text>
      </View>
      <View style={styles.bandMeta}>
        <Text style={styles.bandLabel}>{band?.label || 'Calculating...'}</Text>
        <Text style={styles.bandDesc}>{band?.descriptor}</Text>
        <View style={styles.readinessWrap}>
          <View style={styles.readinessTrack}>
            <View style={[styles.readinessFill, { width: `${readiness}%`, backgroundColor: band?.color || colors.primary }]} />
          </View>
          <Text style={styles.readinessText}>{readiness}% Readiness</Text>
        </View>
      </View>
    </View>
  );
}

function InsightStat({ icon, label, value, color = colors.muted }) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon} size={18} color={color} />
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

export default function WritingEditorScreen({ navigation, route }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 1100;
  
  // Destructure with fallbacks to avoid crashes if context is in transition
  const appState = useAppState() || {};
  const { 
    essayText = '', 
    setEssayText = () => {}, 
    generateReport = () => {}, 
    level = 'B2',
    aiAccessConfig = {},
    updateAiAccessConfig = () => {}
  } = appState;

  const [text, setText] = useState(route.params?.draftText || essayText || '');
  const [activeView, setActiveView] = useState('draft');
  const [isZen, setIsZen] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [remainingSec, setRemainingSec] = useState(route.params?.initialTask === 'essay' ? 2400 : 1200);
  const [assistantReply, setAssistantReply] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [ollamaStatus, setOllamaStatus] = useState('idle');

  const testOllamaConnection = async () => {
    setOllamaStatus('testing');
    const url = aiAccessConfig?.ollamaUrl || 'http://localhost:11434';
    try {
      const res = await fetch(`${url}/api/tags`);
      if (res.ok) {
        setOllamaStatus('ok');
        return;
      }
    } catch (e) {
      // Fallback to 127.0.0.1 if localhost failed
      if (url.includes('localhost')) {
        try {
          const res2 = await fetch(`http://127.0.0.1:11434/api/tags`);
          if (res2.ok) {
            setOllamaStatus('ok');
            return;
          }
        } catch (_) {}
      }
    }
    setOllamaStatus('fail');
  };

  const selectedText = useMemo(() => {
    if (selection.start === selection.end) return '';
    return text.substring(selection.start, selection.end);
  }, [text, selection]);

  const promptItem = useMemo(() => ({
    prompt: route.params?.prompt || 'Should university education be free for everyone? Discuss with examples.',
    task: route.params?.initialTask || route.params?.promptMeta?.task || 'paragraph',
    type: route.params?.initialType || route.params?.promptMeta?.type || 'opinion',
  }), [route.params]);

  const targetWords = promptItem.task === 'essay' ? 250 : 120;

  const insights = useMemo(() => calculateLiveInsights({ 
    text, 
    prompt: promptItem.prompt, 
    targetWords 
  }), [text, promptItem, targetWords]);

  useEffect(() => {
    loadDraft().then(d => { if (d && !text) setText(d); });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      saveDraft(text);
      setSavedAt(new Date());
    }, 2000);
    return () => clearTimeout(t);
  }, [text]);

  useEffect(() => {
    if (!isRunning || remainingSec <= 0) return;
    const interval = setInterval(() => setRemainingSec(s => s - 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, remainingSec]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const callAssistant = async (mode) => {
    setAssistantLoading(true);
    setAssistantReply('AI is thinking...');
    setActiveView('assistant');
    try {
      const res = await requestWritingAssistant({
        task: promptItem.task,
        prompt: promptItem.prompt,
        currentText: text,
        selectedText,
        mode
      });
      setAssistantReply(res.text || res.reply || 'No response from assistant.');
    } catch (e) {
      setAssistantReply(`Error: ${e.message}`);
    } finally {
      setAssistantLoading(false);
    }
  };

  const findSynonyms = async () => {
    if (!selectedText) {
      setAssistantReply('Please highlight a word or phrase in your draft first!');
      setActiveView('assistant');
      return;
    }
    setAssistantLoading(true);
    setAssistantReply(`Finding academic synonyms for "${selectedText}"...`);
    setActiveView('assistant');
    try {
      const res = await requestWritingAssistant({
        task: promptItem.task,
        prompt: promptItem.prompt,
        currentText: text,
        selectedText,
        mode: 'synonyms'
      });
      setAssistantReply(res.text || 'No synonyms found.');
    } catch (e) {
      setAssistantReply(`Synonym error: ${e.message}`);
    } finally {
      setAssistantLoading(false);
    }
  };

  const onSubmit = () => {
    setEssayText(text);
    generateReport({ 
      text, 
      type: promptItem.type, 
      level, 
      prompt: promptItem.prompt, 
      task: promptItem.task 
    });
    navigation.navigate('Feedback', { 
      draftMeta: { ...promptItem, level } 
    });
  };

  const renderSidePanel = () => (
    <ScrollView style={styles.sidePanel} showsVerticalScrollIndicator={false}>
      <Card style={styles.insightCard}>
        <Text style={styles.sectionTitle}>Real-time Feedback</Text>
        <BandMeter band={insights.band} readiness={insights.readiness} />
        
        <View style={styles.statsGrid}>
          <InsightStat icon="document-text-outline" label="Words" value={`${insights.metrics.words}/${targetWords}`} />
          <InsightStat icon="checkmark-circle-outline" label="Accuracy" value={`${insights.metrics.accuracy}%`} color={colors.success} />
          <InsightStat icon="git-branch-outline" label="Flow" value={`${insights.metrics.flow}%`} color={colors.primary} />
          <InsightStat icon="flask-outline" label="Variety" value={`${insights.metrics.variety}%`} color={colors.accent} />
          <InsightStat icon="flash-outline" label="Complexity" value={`${insights.metrics.complexity}%`} color={colors.warning} />
          <InsightStat icon="ribbon-outline" label="Formality" value={`${insights.metrics.formality}%`} color={colors.primaryDark} />
          <InsightStat icon="school-outline" label="AWL Density" value={`${insights.metrics.academicDensity}%`} color={colors.success} />
        </View>

        {insights.tasks.length > 0 && (
          <View style={styles.taskList}>
            <Text style={styles.miniLabel}>Next Steps</Text>
            {insights.tasks.map((task, idx) => (
              <View key={idx} style={styles.taskItem}>
                <Ionicons 
                  name={task.type === 'error' ? 'alert-circle' : 'arrow-forward-circle'} 
                  size={16} 
                  color={task.type === 'error' ? colors.error : colors.muted} 
                />
                <Text style={styles.taskText}>{task.text}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card style={styles.toolCard}>
        <View style={styles.aiStatusHeader}>
          <Text style={styles.sectionTitle}>Writing Assistant</Text>
          <TouchableOpacity 
            style={[styles.providerToggle, aiAccessConfig?.provider === 'ollama' && styles.providerToggleActive]}
            onPress={() => updateAiAccessConfig({ provider: aiAccessConfig?.provider === 'ollama' ? 'openai' : 'ollama' })}
          >
            <Ionicons name={aiAccessConfig?.provider === 'ollama' ? 'home' : 'cloud-done'} size={12} color="#FFF" />
            <Text style={styles.aiBadgeText}>{formatLabel(aiAccessConfig?.provider || 'Hosted')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonGrid}>
          <TouchableOpacity style={styles.toolBtn} onPress={() => callAssistant('thesis')}>
            <Ionicons name="bulb-outline" size={20} color={colors.primary} />
            <Text style={styles.toolBtnText}>Thesis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={() => callAssistant('outline')}>
            <Ionicons name="list-outline" size={20} color={colors.primary} />
            <Text style={styles.toolBtnText}>Outline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={() => callAssistant('refine')}>
            <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
            <Text style={styles.toolBtnText}>Refine</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={findSynonyms}>
            <Ionicons name="search-outline" size={20} color={colors.accent} />
            <Text style={styles.toolBtnText}>Synonyms</Text>
          </TouchableOpacity>
        </View>

        {aiAccessConfig?.provider === 'ollama' && (
          <TouchableOpacity 
            style={[styles.miniTestBtn, ollamaStatus === 'ok' && styles.testOk]} 
            onPress={testOllamaConnection}
          >
            <Ionicons 
              name={ollamaStatus === 'ok' ? "checkmark-circle" : "pulse-outline"} 
              size={14} 
              color={ollamaStatus === 'ok' ? "#FFF" : colors.primary} 
            />
            <Text style={[styles.miniTestText, ollamaStatus === 'ok' && { color: '#FFF' }]}>
              {ollamaStatus === 'ok' ? 'Ollama Connected' : 'Test Ollama Connection'}
            </Text>
          </TouchableOpacity>
        )}
      </Card>

      <Card style={styles.timerCard}>
        <View style={styles.timerHeader}>
          <Text style={styles.timerValue}>{formatTime(remainingSec)}</Text>
          <TouchableOpacity onPress={() => setIsRunning(!isRunning)}>
            <Ionicons name={isRunning ? 'pause' : 'play'} size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.miniLabel}>Remaining for {formatLabel(promptItem.task)}</Text>
      </Card>
    </ScrollView>
  );

  const renderGuideView = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card style={styles.card}>
        <Text style={styles.h3}>BUEPT Writing Strategy</Text>
        <Text style={styles.sub}>Mastering the {formatLabel(promptItem.task)} format for Boğaziçi standards.</Text>
        
        <View style={styles.guideStep}>
          <Text style={styles.guideTitle}>1. Introduction & Thesis</Text>
          <Text style={styles.body}>• Start with a neutral background sentence.{"\n"}• State your thesis clearly. For BUEPT, a direct "I believe..." or "This essay argues..." is preferred over vague hooks.</Text>
        </View>

        <View style={styles.guideStep}>
          <Text style={styles.guideTitle}>2. Paragraph Structure (PEEL)</Text>
          <Text style={styles.body}>• <Text style={styles.bodyStrong}>Point:</Text> Start with a clear topic sentence.{"\n"}• <Text style={styles.bodyStrong}>Evidence:</Text> Use concrete examples from real life or research.{"\n"}• <Text style={styles.bodyStrong}>Explanation:</Text> Link the example back to your point.{"\n"}• <Text style={styles.bodyStrong}>Link:</Text> Transition to the next paragraph smoothly.</Text>
        </View>

        <View style={styles.guideStep}>
          <Text style={styles.guideTitle}>3. Academic Register</Text>
          <Text style={styles.body}>• Avoid contractions (don't, can't).{"\n"}• Use "Academic Word List" (AWL) vocabulary.{"\n"}• Use passive voice where appropriate to sound more objective.</Text>
        </View>

        <View style={styles.guideStep}>
          <Text style={styles.guideTitle}>4. Conclusion</Text>
          <Text style={styles.body}>• Summarize your main points.{"\n"}• Restate the thesis in different words.{"\n"}• End with a final thought or recommendation.</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>BUEPT Mastery Checklist</Text>
        <Text style={styles.body}>Before you submit, check these critical BUEPT requirements:</Text>
        <View style={styles.checklist}>
          <Text style={styles.checkItem}>✅ Thesis statement is the LAST sentence of Intro.</Text>
          <Text style={styles.checkItem}>✅ Each body paragraph starts with a TOPIC sentence.</Text>
          <Text style={styles.checkItem}>✅ Every point is supported by at least one EXAMPLE.</Text>
          <Text style={styles.checkItem}>✅ NO contractions (use 'do not', 'is not').</Text>
          <Text style={styles.checkItem}>✅ Clear conclusion signal used (e.g. 'To sum up').</Text>
        </View>
      </Card>

      {insights.alerts.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.h3}>⚠️ Style & Grammar Warnings</Text>
          {insights.alerts.map((alert, i) => (
            <View key={i} style={styles.alertRow}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.alertText}>{alert.text}</Text>
            </View>
          ))}
        </Card>
      )}
      
      <Card style={styles.card}>
        <Text style={styles.h3}>Boğaziçi Marking Secret</Text>
        <Text style={styles.body}>The raters look for <Text style={styles.bodyStrong}>"Task Response"</Text> first. If you don't answer both sides of a prompt (if asked), you cannot pass even with perfect grammar. Always check the prompt twice!</Text>
      </Card>
    </ScrollView>
  );

  const renderPromptView = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card style={styles.card}>
        <Text style={styles.h3}>Task Assignment</Text>
        <Text style={styles.body}>{promptItem.prompt}</Text>
        <View style={styles.promptMetaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.miniLabel}>Task</Text>
            <Text style={styles.bodyStrong}>{formatLabel(promptItem.task)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.miniLabel}>Type</Text>
            <Text style={styles.bodyStrong}>{formatLabel(promptItem.type)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.miniLabel}>Goal</Text>
            <Text style={styles.bodyStrong}>{targetWords} words</Text>
          </View>
        </View>
      </Card>
      
      <Card style={styles.card}>
        <Text style={styles.h3}>Suggested Structure</Text>
        {buildStructureRoute(promptItem.task, promptItem.type, templates[promptItem.type], targetWords).map((step, idx) => (
          <View key={step.key} style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{idx + 1}</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.bodyStrong}>{step.title} ({step.target})</Text>
              <Text style={styles.sub}>{step.note}</Text>
              <Text style={styles.starterText}>Starter: "{step.starter}"</Text>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );

  const renderInner = () => (
    <View style={[styles.container, isWide && styles.containerWide, isZen && styles.containerZen]}>
      <View style={styles.mainContent}>
        {!isZen && (
          <Card style={styles.promptCard} glow>
            <View style={styles.promptHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.promptMeta}>{formatLabel(promptItem.task)} • {formatLabel(promptItem.type)} • {level}</Text>
                <Text style={styles.promptText}>{promptItem.prompt}</Text>
              </View>
              <View style={styles.promptActions}>
                <TouchableOpacity onPress={() => setIsZen(true)} style={styles.iconBtn}>
                  <Ionicons name="expand-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}

        {isZen && (
          <View style={styles.zenHeader}>
            <Text style={styles.zenPromptText} numberOfLines={1}>{promptItem.prompt}</Text>
            <TouchableOpacity onPress={() => setIsZen(false)}>
              <Ionicons name="contract-outline" size={22} color={colors.muted} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tabRow}>
          {VIEWS.map(v => (
            <Chip key={v} label={formatLabel(v)} active={activeView === v} onPress={() => setActiveView(v)} />
          ))}
          <Chip label="Prompt" active={activeView === 'prompt'} onPress={() => setActiveView('prompt')} />
        </View>

        {activeView === 'draft' && (
          <Card style={[styles.editorCard, isZen && styles.editorCardZen]}>
            <TextInput
              style={styles.editorInput}
              multiline
              placeholder="Start writing your BUEPT response..."
              value={text}
              onChangeText={setText}
              onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
              placeholderTextColor={colors.muted}
              textAlignVertical="top"
            />
            <View style={styles.editorFooter}>
              <Text style={styles.footerText}>
                {savedAt ? `Autosaved ${savedAt.toLocaleTimeString()}` : 'Writing...'}
              </Text>
              <View style={styles.footerActions}>
                <Button label="Submit for Evaluation" onPress={onSubmit} icon="analytics-outline" />
              </View>
            </View>
          </Card>
        )}

        {activeView === 'assistant' && (
          <Card style={styles.card}>
            <Text style={styles.h3}>AI Writing Assistant</Text>
            <View style={styles.assistantReplyContainer}>
              {assistantLoading ? (
                <Text style={styles.loadingText}>AI is analyzing your draft...</Text>
              ) : (
                <ScrollView><Text style={styles.body}>{assistantReply || 'Select a tool from the sidebar (Thesis, Outline, Refine) to get AI help.'}</Text></ScrollView>
              )}
            </View>
            <View style={styles.actionRow}>
              <Button label="Clear" variant="ghost" onPress={() => setAssistantReply('')} />
              <Button label="Back to Draft" onPress={() => setActiveView('draft')} />
            </View>
          </Card>
        )}

        {activeView === 'coach' && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Card style={styles.card}>
              <Text style={styles.h3}>Rubric Coaching</Text>
              <Text style={styles.sub}>How to reach the next band level ({insights.isPass ? 'Maintain' : 'Improve'} focus):</Text>
              {insights.tasks.map((t, i) => (
                <View key={i} style={styles.sprintRow}>
                  <View style={[styles.dot, { backgroundColor: insights.band?.color || colors.primary }]} />
                  <Text style={styles.bodyStrong}>{t.text}</Text>
                </View>
              ))}
              {insights.tasks.length === 0 && <Text style={styles.body}>Your draft is looking strong! Continue developing your points.</Text>}
            </Card>
          </ScrollView>
        )}

        {activeView === 'resources' && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Card style={styles.card}>
              <Text style={styles.h3}>Academic Phrasebank</Text>
              <Text style={styles.sub}>Templates and structural connectors for BUEPT {formatLabel(promptItem.type)} tasks.</Text>
              
              {Object.entries(templates[promptItem.type] || templates.general).map(([key, list]) => (
                <View key={key} style={styles.resourceBlock}>
                  <View style={styles.resourceHeader}>
                    <Ionicons 
                      name={key === 'intro' ? 'home-outline' : key === 'body' ? 'layers-outline' : 'flag-outline'} 
                      size={18} 
                      color={colors.primary} 
                    />
                    <Text style={styles.miniLabel}>{formatLabel(key)} Phrases</Text>
                  </View>
                  <View style={styles.phraseList}>
                    {list.map(phrase => (
                      <TouchableOpacity 
                        key={phrase} 
                        onPress={() => setText(prev => prev + ' ' + phrase)}
                        style={styles.phraseItem}
                      >
                        <Text style={styles.body}>• {phrase}</Text>
                        <Ionicons name="add-circle-outline" size={16} color={colors.muted} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </Card>
          </ScrollView>
        )}

        {activeView === 'guide' && renderGuideView()}

        {activeView === 'prompt' && renderPromptView()}
      </View>

      {isWide && !isZen && renderSidePanel()}
    </View>
  );

  return (
    <Screen title="Writing Studio" scrollable={!isWide}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        {renderInner()}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  containerWide: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  containerZen: {
    maxWidth: 900,
    alignSelf: 'center',
  },
  mainContent: {
    flex: 1,
  },
  sidePanel: {
    width: 340,
  },
  zenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  zenPromptText: {
    fontSize: typography.small,
    color: colors.muted,
    flex: 1,
    marginRight: spacing.md,
    fontFamily: typography.fontHeadline,
  },
  promptCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  promptMeta: {
    fontSize: typography.xsmall,
    color: colors.primary,
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  promptText: {
    fontSize: typography.body,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    lineHeight: 24,
  },
  promptActions: {
    marginLeft: spacing.md,
  },
  iconBtn: {
    padding: 4,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  editorCard: {
    flex: 1,
    padding: 0,
    minHeight: 450,
    overflow: 'hidden',
    borderColor: colors.border,
  },
  editorCardZen: {
    minHeight: 650,
  },
  editorInput: {
    flex: 1,
    padding: spacing.xl,
    fontSize: 18,
    lineHeight: 28,
    color: colors.text,
    fontFamily: typography.fontBody,
    backgroundColor: '#fff',
  },
  editorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 12,
    color: colors.muted,
  },
  footerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  insightCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  bandMeter: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  bandBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },
  bandCode: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
  },
  bandMeta: {
    flex: 1,
  },
  bandLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  bandDesc: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 14,
    marginBottom: 4,
  },
  readinessWrap: {
    marginTop: 4,
  },
  readinessTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 2,
  },
  readinessFill: {
    height: '100%',
  },
  readinessText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.muted,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    flexBasis: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskList: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  taskText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  toolCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  buttonGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toolBtn: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  timerCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 36,
    fontFamily: typography.fontHeadline,
    fontWeight: '900',
    color: colors.primary,
  },
  promptMetaGrid: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaItem: {
    gap: 2,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  stepContent: {
    flex: 1,
    gap: 4,
  },
  starterText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.primary,
    marginTop: 6,
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: radius.sm,
  },
  assistantReplyContainer: {
    minHeight: 160,
    maxHeight: 400,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingText: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 40,
  },
  sprintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: '#FFF5F5',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  alertText: {
    fontSize: 14,
    color: '#C53030',
    fontWeight: '600',
    flex: 1,
  },
  h3: {
    fontSize: 18,
    fontFamily: typography.fontHeadline,
    fontWeight: '900',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.muted,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  resourceBlock: {
    marginBottom: spacing.xl,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
  },
  phraseList: {
    gap: 4,
  },
  phraseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
  },
  miniLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  bodyStrong: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  sub: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  card: {
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  guideStep: {
    marginBottom: spacing.lg,
    paddingLeft: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
  },
  checklist: {
    marginTop: spacing.md,
    gap: 8,
  },
  checkItem: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: typography.fontHeadline,
    fontWeight: '900',
    color: colors.text,
    marginBottom: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  aiStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  aiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: -10,
  },
  aiBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  miniTestBtn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(37,99,235,0.05)',
  },
  testOk: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  miniTestText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  providerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.success,
    marginTop: -8,
  },
  providerToggleActive: {
    backgroundColor: colors.warning,
  },
});
