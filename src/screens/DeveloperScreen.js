import React, { useState } from 'react';
import { View, Text, StyleSheet, Linking, TextInput, TouchableOpacity, Platform } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import LogoMark from '../components/LogoMark';
import { colors, spacing, typography, radius } from '../theme/tokens';
import { runDiagnostics } from '../utils/diagnostics';
import { useAppState } from '../context/AppState';
import { useTts } from '../hooks/useTts';

const PROVIDERS = [
  { key: 'openai',  label: 'OpenAI',           emoji: '🔑', color: '#10a37f' },
  { key: 'gemini',  label: '🆓 Gemini',         emoji: '🟣', color: '#4285F4' },
  { key: 'ollama',  label: '🏠 Ollama (Local)',  emoji: '🦙', color: '#FF6B35' },
];

const PROVIDER_INFO = {
  openai: {
    note: 'Detailed WASC feedback with GPT-4o. Requires OpenAI account and credits.',
    keyLabel: 'OpenAI API Key',
    keyPlaceholder: 'sk-proj-...',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyUrlLabel: '🔑 Get API Key (Paid)',
    needsKey: true,
    needsUrl: false,
  },
  gemini: {
    note: 'Gemini 1.5 Flash FREE — 1M tokens/day, 15 RPM. Ideal for mobile.',
    keyLabel: 'Google Gemini API Key',
    keyPlaceholder: 'AIza...',
    keyUrl: 'https://aistudio.google.com/apikey',
    keyUrlLabel: '🆓 Get Free Gemini Key',
    needsKey: true,
    needsUrl: false,
  },
  ollama: {
    note: 'Local Ollama — No internet, 100% privacy. Requires Ollama installed on your PC.',
    keyLabel: null,
    keyPlaceholder: null,
    keyUrl: 'https://ollama.com/download',
    keyUrlLabel: '📥 Download Ollama (Mac/Win/Linux)',
    needsKey: false,
    needsUrl: true,
  },
};

const OLLAMA_MODELS = ['llama3.2:1b', 'llama3.2:3b', 'llama3.1:8b', 'qwen2.5:14b', 'mistral-nemo', 'dolphin-llama3:8b', 'qwen2.5:32b', 'qwen3-coder:30b', 'mistral:7b', 'phi3:mini'];

export default function DeveloperScreen() {
  const { aiAccessConfig, updateAiAccessConfig, ttsConfig, setTtsConfig } = useAppState();
  const { voices, speakWord } = useTts();

  const [provider, setProvider]       = useState(aiAccessConfig?.provider || 'openai');
  const [apiKey, setApiKey]           = useState(aiAccessConfig?.apiKey || '');
  const [ollamaUrl, setOllamaUrl]     = useState(aiAccessConfig?.ollamaUrl || 'http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState(aiAccessConfig?.ollamaModel || 'llama3.2:1b');
  const [keyVisible, setKeyVisible]   = useState(false);
  const [savedMsg, setSavedMsg]       = useState('');
  const [diagResults, setDiagResults] = useState([]);
  const [diagRunning, setDiagRunning] = useState(false);
  const [ollamaTest, setOllamaTest]   = useState(null); // null | 'testing' | 'ok' | 'fail'
  const [installedModels, setInstalledModels] = useState([]); // list of installed model names

  const info = PROVIDER_INFO[provider] || PROVIDER_INFO.openai;
  const currentKeySet = Boolean(String(aiAccessConfig?.apiKey || '').trim());
  const currentProvider = aiAccessConfig?.provider || 'openai';
  const isActive = currentProvider === provider && (provider === 'ollama' ? true : currentKeySet);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const switchProvider = (p) => {
    setProvider(p);
    setApiKey('');
    setSavedMsg('');
    setOllamaTest(null);
  };

  const handleSave = () => {
    const trimmedKey = String(apiKey || '').trim();
    const trimmedUrl = String(ollamaUrl || '').trim() || 'http://localhost:11434';
    const trimmedModel = String(ollamaModel || '').trim() || 'llama3.2:1b';

    if (provider !== 'ollama' && !trimmedKey) {
      setSavedMsg('⚠️ Please enter an API key.');
      setTimeout(() => setSavedMsg(''), 3000);
      return;
    }

    updateAiAccessConfig({
      apiKey: provider !== 'ollama' ? trimmedKey : '',
      provider,
      ollamaUrl: trimmedUrl,
      ollamaModel: trimmedModel,
    });

    const label = provider === 'gemini' ? 'Gemini' : provider === 'ollama' ? 'Ollama' : 'OpenAI';
    setSavedMsg(`✓ ${label} configuration saved`);
    setTimeout(() => setSavedMsg(''), 3500);
  };

  const handleClear = () => {
    setApiKey('');
    updateAiAccessConfig({ apiKey: '', provider: 'openai', ollamaUrl: '', ollamaModel: '' });
    setSavedMsg('✓ Configuration cleared — using server AI');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleTestOllama = async () => {
    setOllamaTest('testing');
    const url = String(ollamaUrl || '').trim() || 'http://localhost:11434';
    try {
      const res = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined });
      if (res.ok) {
        const data = await res.json();
        // Extract installed model names
        const names = (data?.models || []).map(m => String(m.name || '').split(':')[0]);
        setInstalledModels(names);
        setOllamaTest('ok');
      } else {
        setOllamaTest('fail');
        setInstalledModels([]);
      }
    } catch (_) {
      setOllamaTest('fail');
      setInstalledModels([]);
    }
  };

  const handleDiagnostics = async () => {
    setDiagRunning(true);
    try {
      const results = await runDiagnostics();
      setDiagResults(results);
    } catch (e) {
      setDiagResults([{ id: 'fatal', label: 'Diagnostics', ok: false, detail: String(e?.message || e) }]);
    } finally {
      setDiagRunning(false);
    }
  };

  const activeLabel =
    currentProvider === 'gemini' ? '🟢 Gemini active'
    : currentProvider === 'ollama' ? '🟢 Ollama (Local) active'
    : '🟢 OpenAI active';

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Screen scroll contentStyle={styles.container}>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <View style={styles.hero}>
        <LogoMark size={72} label="B" />
        <Text style={styles.appName}>Settings</Text>
        <Text style={styles.version}>Configure your AI models and preferences</Text>
      </View>

      {/* ── AI PROVIDER CONFIG ──────────────────────────────────── */}
      <Card style={styles.byokCard}>
        {/* Header */}
        <View style={styles.byokHeader}>
          <Text style={styles.byokIcon}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.byokTitle}>AI Configuration</Text>
            <Text style={styles.byokSub}>Select an AI provider for writing feedback</Text>
          </View>
          {(currentKeySet || currentProvider === 'ollama') && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ACTIVE</Text>
            </View>
          )}
        </View>

        {/* Provider Tabs */}
        <View style={styles.tabRow}>
          {PROVIDERS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.tab, provider === p.key && { borderColor: p.color, backgroundColor: p.color + '22' }]}
              onPress={() => switchProvider(p.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, provider === p.key && { color: p.color, fontFamily: typography.fontHeadline }]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Provider Note */}
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>{info.note}</Text>
        </View>

        {/* ── OpenAI / Gemini Key Input ── */}
        {info.needsKey && (
          <>
            <Text style={styles.inputLabel}>{info.keyLabel}</Text>
            <View style={styles.keyRow}>
              <TextInput
                style={styles.keyInput}
                placeholder={info.keyPlaceholder}
                placeholderTextColor="rgba(255,255,255,0.28)"
                value={apiKey}
                onChangeText={setApiKey}
                secureTextEntry={!keyVisible}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setKeyVisible(v => !v)} activeOpacity={0.7}>
                <Text style={styles.eyeText}>{keyVisible ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── Ollama Config ── */}
        {provider === 'ollama' && (
          <>
            <Text style={styles.inputLabel}>Ollama Sunucu URL</Text>
            <TextInput
              style={[styles.keyInput, { marginBottom: spacing.md }]}
              placeholder="http://localhost:11434"
              placeholderTextColor="rgba(255,255,255,0.28)"
              value={ollamaUrl}
              onChangeText={setOllamaUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <Text style={styles.inputLabel}>Model</Text>
            <View style={styles.modelChips}>
              {OLLAMA_MODELS.map((m) => {
                const baseName = m.split(':')[0];
                const isInstalled = installedModels.length > 0 && installedModels.includes(baseName);
                const isUnknown = installedModels.length === 0;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.modelChip, ollamaModel === m && styles.modelChipActive]}
                    onPress={() => setOllamaModel(m)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.modelChipText, ollamaModel === m && styles.modelChipTextActive]}>{m}</Text>
                    {!isUnknown && (
                      <Text style={[styles.modelChipBadge, isInstalled ? styles.modelChipBadgeOk : styles.modelChipBadgeMissing]}>
                        {isInstalled ? '✓' : '⬇'}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            {installedModels.length > 0 && (
              <Text style={styles.modelHint}>✓ = kurulu, ⬇ = indirilmeli</Text>
            )}

            <View style={styles.ollamaTestRow}>
              <Button
                label={ollamaTest === 'testing' ? 'Testing...' : 'Test Ollama Connection'}
                variant="ghost"
                onPress={handleTestOllama}
                disabled={ollamaTest === 'testing'}
                style={{ flex: 1 }}
              />
              {ollamaTest === 'ok' && <Text style={styles.testOk}>✓ Connection successful</Text>}
              {ollamaTest === 'fail' && <Text style={styles.testFail}>✗ Connection failed</Text>}
            </View>
          </>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            label="Save Settings"
            onPress={handleSave}
            variant="primary"
            style={{ flex: 1 }}
          />
          <Button
            label={info.keyUrlLabel}
            onPress={() => Linking.openURL(info.keyUrl)}
            variant="ghost"
            style={{ flex: 1 }}
          />
        </View>

        {/* Feedback & Status */}
        {savedMsg ? <Text style={styles.savedMsg}>{savedMsg}</Text> : null}

        {(currentKeySet || currentProvider === 'ollama') && (
          <View style={styles.activeRow}>
            <Text style={styles.activeLabel}>{activeLabel} · Writing feedback is using this configuration</Text>
            <TouchableOpacity onPress={handleClear} style={styles.clearBtn} activeOpacity={0.7}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
      
      {/* ── VOICE CONFIG ────────────────────────────────────────── */}
      <Card style={styles.voiceCard}>
        <View style={styles.byokHeader}>
          <Text style={styles.byokIcon}>🔊</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.byokTitle}>Voice & Pronunciation</Text>
            <Text style={styles.byokSub}>Select your preferred TTS engine and voice</Text>
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Google Natural Voice</Text>
            <Text style={styles.settingSub}>Higher quality, uses Google's experimental neural engine (Web only)</Text>
          </View>
          <TouchableOpacity 
            style={[styles.toggleBtn, ttsConfig.useExperimental && styles.toggleBtnActive]}
            onPress={() => setTtsConfig(prev => ({ ...prev, useExperimental: !prev.useExperimental }))}
          >
            <Text style={styles.toggleText}>{ttsConfig.useExperimental ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Speech Rate ({ttsConfig.rate.toFixed(2)})</Text>
        <View style={styles.rateRow}>
          {[0.4, 0.45, 0.5, 0.55, 0.6, 0.7].map(r => (
            <TouchableOpacity 
              key={r}
              style={[styles.rateChip, ttsConfig.rate === r && styles.rateChipActive]}
              onPress={() => setTtsConfig(prev => ({ ...prev, rate: r }))}
            >
              <Text style={[styles.rateChipText, ttsConfig.rate === r && styles.rateChipTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>Available Voices</Text>
        <View style={styles.voiceList}>
          {voices.length > 0 ? voices.map(v => (
            <TouchableOpacity 
              key={v.id}
              style={[styles.voiceItem, ttsConfig.voiceId === v.id && styles.voiceItemActive]}
              onPress={() => {
                setTtsConfig(prev => ({ ...prev, voiceId: v.id }));
                speakWord("This is a preview of the selected voice.", { iosVoiceId: v.id });
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.voiceName, ttsConfig.voiceId === v.id && styles.voiceNameActive]}>{v.name}</Text>
                <Text style={styles.voiceLang}>{v.language}</Text>
              </View>
              <Text style={styles.voicePreviewIcon}>▶️</Text>
            </TouchableOpacity>
          )) : (
            <Text style={styles.emptyText}>Loading voices...</Text>
          )}
        </View>
      </Card>

      {/* ── GUIDE CARDS ─────────────────────────────────────────── */}
      <Card style={styles.guideCard}>
        <Text style={styles.cardTitle}>📱 Telefon İçin Ücretsiz AI</Text>
        <Text style={styles.bodyText}>
          Telefon için en iyi seçenek: <Text style={styles.bold}>Google Gemini 1.5 Flash</Text> (tamamen ücretsiz).
        </Text>
        {[
          '1. aistudio.google.com/apikey → Google hesabınla giriş yap',
          '2. "Create API key" → AIza... ile başlayan anahtarı kopyala',
          '3. Yukarıda "🆓 Gemini" sekmesini seç → yapıştır → Kaydet',
        ].map((s) => (
          <Text key={s} style={styles.stepText}>{s}</Text>
        ))}
      </Card>

      <Card style={styles.guideCard}>
        <Text style={styles.cardTitle}>🏠 Ollama — Yerel AI (Tam Gizlilik)</Text>
        <Text style={styles.bodyText}>
          Verilerini hiçbir sunucuya göndermeden AI kullanmak için bilgisayarında{' '}
          <Text style={styles.bold}>Ollama</Text> çalıştır.
        </Text>
        {[
          '1. ollama.com/download → Mac/Windows/Linux için kur',
          '2. Terminal: ollama pull llama3.2:1b   (veya mistral:7b)',
          '3. Terminal: OLLAMA_HOST="0.0.0.0" OLLAMA_ORIGINS="*" ollama serve',
          `4. Yukarıda "🏠 Ollama" sekmesi → URL: http://10.5.202.62:11434 (Eğer telden bağlanıyorsan)`,
          '   Veya bilgisayardaysan: http://localhost:11434',
        ].map((s) => (
          <Text key={s} style={styles.stepText}>{s}</Text>
        ))}
      </Card>

      {/* ── DEVELOPER INFO ──────────────────────────────────────── */}
      <Card style={styles.devCard}>
        <Text style={styles.cardTitle}>Geliştirici Hakkında</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Geliştirici</Text>
          <Text style={styles.infoValue}>Mehmet Yasin Kaya</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bölüm</Text>
          <Text style={styles.infoValue}>Boğaziçi Üniversitesi{'\n'}Bilgisayar Mühendisliği</Text>
        </View>
        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>
            "Built for Boğaziçi students. 
            May your preparation lead to success."
          </Text>
        </View>
      </Card>

      {/* ── CONTACT ─────────────────────────────────────────────── */}
      <Card style={styles.contactCard}>
        <Text style={styles.cardTitle}>İletişim & Destek</Text>
        <Text style={styles.bodyText}>Geri bildirim veya hata bildirimi için mail atabilirsiniz.</Text>
        <Button
          label="gs7016903@gmail.com"
          onPress={() => Linking.openURL('mailto:gs7016903@gmail.com?subject=Boğaziçi Prep Feedback')}
          variant="ghost"
        />
      </Card>

      {/* ── DIAGNOSTICS ─────────────────────────────────────────── */}
      <Card style={styles.contactCard}>
        <Text style={styles.cardTitle}>System Diagnostics</Text>
        <Text style={styles.bodyText}>Test API, dictionary, and TTS connections.</Text>
        <Button
          label={diagRunning ? 'Running...' : 'Run Diagnostics'}
          onPress={handleDiagnostics}
          disabled={diagRunning}
        />
        {diagResults.length > 0 && (
          <View style={styles.diagList}>
            {diagResults.map((row) => (
              <View key={row.id} style={styles.diagRow}>
                <View style={[styles.diagBadge, row.ok ? styles.diagOk : styles.diagFail]}>
                  <Text style={styles.diagBadgeText}>{row.ok ? 'OK' : 'FAIL'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.diagLabel}>{row.label}</Text>
                  <Text style={styles.diagDetail}>{row.detail}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

    </Screen>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xl, paddingTop: spacing.md },

  // Hero
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  appName: { fontSize: typography.h1, fontFamily: typography.fontHeadline, color: colors.text, marginTop: spacing.md },
  version: { fontSize: typography.small, color: colors.muted, marginTop: 4 },

  // BYOK Card
  byokCard: { marginBottom: spacing.lg, backgroundColor: '#08152E', borderColor: '#2563EB', borderWidth: 1.5 },
  voiceCard: { marginBottom: spacing.lg, backgroundColor: '#0F172A', borderColor: '#6366F1', borderWidth: 1.5 },
  byokHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  byokIcon: { fontSize: 34 },
  byokTitle: { fontSize: typography.h3, fontFamily: typography.fontHeadline, color: '#FFFFFF', fontWeight: '800' },
  byokSub: { fontSize: typography.small, color: 'rgba(148,163,184,0.9)', marginTop: 2 },
  activeBadge: { backgroundColor: '#16a34a', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 6 },
  activeBadgeText: { fontSize: 10, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },

  // Provider Tabs
  tabRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md, flexWrap: 'wrap' },
  tab: {
    flex: 1, minWidth: 90,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  tabText: { fontSize: typography.small, color: 'rgba(203,213,225,0.7)', textAlign: 'center' },

  // Note box
  noteBox: {
    backgroundColor: 'rgba(37,99,235,0.10)',
    borderRadius: 10, padding: spacing.md,
    borderWidth: 1, borderColor: 'rgba(96,165,250,0.2)',
    marginBottom: spacing.md,
  },
  noteText: { fontSize: typography.small, color: '#93C5FD', lineHeight: 20 },

  // Inputs
  inputLabel: {
    fontSize: typography.small, color: 'rgba(203,213,225,0.7)',
    fontFamily: typography.fontHeadline, marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  keyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
  keyInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.16)', borderWidth: 1,
    borderRadius: 10, padding: spacing.md,
    color: '#FFFFFF', fontSize: typography.body,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier',
  },
  eyeBtn: { padding: spacing.sm },
  eyeText: { fontSize: 20 },

  // Ollama model chips
  modelChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  modelChip: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  modelChipActive: { borderColor: '#FF6B35', backgroundColor: 'rgba(255,107,53,0.15)' },
  modelChipText: { fontSize: typography.xsmall, color: 'rgba(203,213,225,0.7)', fontFamily: 'monospace' },
  modelChipTextActive: { color: '#FF6B35', fontFamily: typography.fontHeadline },
  modelChipBadge: { fontSize: 10, fontWeight: '700', marginLeft: 4 },
  modelChipBadgeOk: { color: '#4ade80' },
  modelChipBadgeMissing: { color: '#fb923c' },
  modelHint: { fontSize: 11, color: 'rgba(203,213,225,0.45)', marginBottom: spacing.sm, fontStyle: 'italic' },
  ollamaTestRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  testOk: { fontSize: typography.small, color: '#4ade80', fontFamily: typography.fontHeadline },
  testFail: { fontSize: typography.small, color: '#f87171', fontFamily: typography.fontHeadline },

  // Action buttons
  actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },

  // Feedback
  savedMsg: {
    fontSize: typography.small, color: '#4ade80',
    fontFamily: typography.fontHeadline, textAlign: 'center',
    marginVertical: spacing.xs,
  },
  activeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: spacing.sm, gap: spacing.sm,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', paddingTop: spacing.sm,
  },
  activeLabel: { flex: 1, fontSize: typography.small, color: '#86efac', lineHeight: 19 },
  clearBtn: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  clearBtnText: { fontSize: typography.small, color: 'rgba(203,213,225,0.6)' },

  // Guide cards
  guideCard: { marginBottom: spacing.md, backgroundColor: '#0a1a2e', borderColor: '#1e3a5f', borderWidth: 1 },
  stepText: { fontSize: typography.small, color: '#93C5FD', lineHeight: 22, marginBottom: 4 },

  // Dev card
  devCard: { marginBottom: spacing.lg, backgroundColor: '#0A1628', borderColor: colors.primary, borderWidth: 1 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: spacing.sm, paddingBottom: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoLabel: { fontSize: typography.body, color: colors.muted, fontWeight: '700', flex: 1 },
  infoValue: { fontSize: typography.body, color: '#DDE8FF', fontFamily: typography.fontHeadline, flex: 2, textAlign: 'right', lineHeight: 22 },
  quoteBox: {
    marginTop: spacing.md, padding: spacing.md,
    backgroundColor: 'rgba(88,166,255,0.08)', borderRadius: 10,
    borderLeftWidth: 3, borderLeftColor: colors.primary,
  },
  quoteText: { fontSize: typography.small, color: '#A8C0FF', fontStyle: 'italic', lineHeight: 20 },

  // Contact & misc
  contactCard: { marginBottom: spacing.xl },
  cardTitle: { fontSize: typography.h3, fontFamily: typography.fontHeadline, color: colors.primary, marginBottom: spacing.md },
  bodyText: { fontSize: typography.body, color: colors.text, marginBottom: spacing.md, lineHeight: 22 },
  bold: { fontFamily: typography.fontHeadline, color: '#7DD3FC', fontWeight: '700' },

  // Diagnostics
  diagList: { marginTop: spacing.md, gap: spacing.sm },
  diagRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: spacing.xs },
  diagBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, minWidth: 44, alignItems: 'center' },
  diagOk: { backgroundColor: '#DCFCE7' },
  diagFail: { backgroundColor: '#FEE2E2' },
  diagBadgeText: { fontSize: 11, fontWeight: '900', color: '#374151' },
  diagLabel: { fontSize: typography.small, fontWeight: '700', color: colors.text, marginBottom: 2 },
  diagDetail: { fontSize: typography.xsmall, color: colors.muted, lineHeight: 17 },

  // Settings & Toggles
  settingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: spacing.md },
  settingLabel: { fontSize: typography.body, color: '#FFFFFF', fontWeight: '700' },
  settingSub: { fontSize: typography.xsmall, color: 'rgba(148,163,184,0.7)', marginTop: 2 },
  toggleBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, minWidth: 60, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: '#22C55E' },
  toggleText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },

  // Rate chips
  rateRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg },
  rateChip: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  rateChipActive: { backgroundColor: 'rgba(99,102,241,0.2)', borderColor: '#6366F1' },
  rateChipText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  rateChipTextActive: { color: '#818CF8', fontWeight: 'bold' },

  // Voice list
  voiceList: { gap: 8 },
  voiceItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  voiceItemActive: { borderColor: '#6366F1', backgroundColor: 'rgba(99,102,241,0.1)' },
  voiceName: { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
  voiceNameActive: { color: '#818CF8' },
  voiceLang: { fontSize: 10, color: 'rgba(148,163,184,0.6)', marginTop: 2 },
  voicePreviewIcon: { fontSize: 14, opacity: 0.8 },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: 12 },
});
