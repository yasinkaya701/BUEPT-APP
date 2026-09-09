import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../../components/Button';
import Page from '../../components/v2/Page';
import SurfaceCard from '../../components/v2/SurfaceCard';
import { useAppState } from '../../context/AppState';
import { useUniversity } from '../../context/UniversityContext';
import { getV2Theme, v2Radius, v2Spacing, v2Typography } from '../../theme/v2';

const PROVIDERS = [
  { key: 'gemini', label: 'Gemini', icon: 'sparkles-outline' },
  { key: 'openai', label: 'OpenAI', icon: 'chatbubbles-outline' },
  { key: 'claude', label: 'Claude', icon: 'document-text-outline' },
  { key: 'ollama', label: 'Ollama', icon: 'desktop-outline' },
];

export default function AISettingsScreen() {
  const { uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);
  const { aiAccessConfig, updateAiAccessConfig, resetAiAccessConfig } = useAppState();
  const [apiKey, setApiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState(aiAccessConfig?.ollamaUrl || 'http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState(aiAccessConfig?.ollamaModel || 'llama3.2:1b');

  useEffect(() => {
    setOllamaUrl(aiAccessConfig?.ollamaUrl || 'http://localhost:11434');
    setOllamaModel(aiAccessConfig?.ollamaModel || 'llama3.2:1b');
  }, [aiAccessConfig?.ollamaModel, aiAccessConfig?.ollamaUrl]);

  const hosted = aiAccessConfig?.mode === 'hosted';
  const provider = aiAccessConfig?.provider || 'hosted';

  const chooseHosted = () => {
    setApiKey('');
    setClaudeKey('');
    updateAiAccessConfig({ mode: 'hosted', provider: 'hosted', apiKey: '', claudeKey: '', label: 'Hosted BUEPT AI' });
  };

  const chooseProvider = (nextProvider) => {
    updateAiAccessConfig({ mode: 'byok', provider: nextProvider, label: `${nextProvider} · session key` });
  };

  const applySessionConfig = () => {
    const next = {
      mode: 'byok',
      provider,
      ollamaUrl,
      ollamaModel,
    };
    if (provider === 'claude') next.claudeKey = claudeKey;
    else if (provider !== 'ollama') next.apiKey = apiKey;
    updateAiAccessConfig(next);
  };

  return (
    <Page>
      <View style={styles.heading}>
        <Text style={[styles.eyebrow, { color: theme.primary }]}>AI ACCESS</Text>
        <Text style={[styles.title, { color: theme.text }]}>Hosted by default. BYOK only when you choose it.</Text>
        <Text style={[styles.body, { color: theme.muted }]}>The app no longer silently falls back to another AI company. A selected provider either succeeds or returns a clear error.</Text>
      </View>

      <SurfaceCard style={[styles.modeCard, hosted && { borderColor: theme.interactive }]}>
        <View style={styles.modeHeader}>
          <View style={[styles.modeIcon, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="cloud-done-outline" size={22} color={theme.primary} />
          </View>
          <View style={styles.flex}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Hosted BUEPT AI</Text>
            <Text style={[styles.body, { color: theme.muted }]}>No client API key. Provider credentials remain on the backend.</Text>
          </View>
          <Button label={hosted ? 'Selected' : 'Use hosted'} variant={hosted ? 'secondary' : 'primary'} onPress={chooseHosted} />
        </View>
      </SurfaceCard>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Bring your own provider</Text>
      <Text style={[styles.body, { color: theme.muted, marginBottom: v2Spacing.md }]}>Provider secrets are kept in memory for the current app session and deliberately excluded from normal AsyncStorage/localStorage persistence.</Text>

      <View style={styles.providerGrid}>
        {PROVIDERS.map((item) => {
          const active = !hosted && provider === item.key;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => chooseProvider(item.key)}
              style={({ pressed }) => [
                styles.provider,
                {
                  backgroundColor: active ? theme.primarySoft : theme.surface,
                  borderColor: active ? theme.interactive : theme.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name={item.icon} size={20} color={active ? theme.primary : theme.muted} />
              <Text style={[styles.providerText, { color: active ? theme.primaryDark : theme.text }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {!hosted && provider !== 'ollama' ? (
        <SurfaceCard style={styles.formCard}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Session credential</Text>
          <Text style={[styles.body, { color: theme.muted }]}>Enter the key for {provider === 'claude' ? 'Anthropic' : provider}. It is sent only to the provider you selected.</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.canvas }]}
            value={provider === 'claude' ? claudeKey : apiKey}
            onChangeText={provider === 'claude' ? setClaudeKey : setApiKey}
            placeholder="Paste session API key"
            placeholderTextColor={theme.muted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button label="Use for this session" onPress={applySessionConfig} />
        </SurfaceCard>
      ) : null}

      {!hosted && provider === 'ollama' ? (
        <SurfaceCard style={styles.formCard}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Local Ollama</Text>
          <Text style={[styles.body, { color: theme.muted }]}>The app talks directly to the local Ollama endpoint you provide.</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.canvas }]}
            value={ollamaUrl}
            onChangeText={setOllamaUrl}
            placeholder="http://localhost:11434"
            placeholderTextColor={theme.muted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.canvas }]}
            value={ollamaModel}
            onChangeText={setOllamaModel}
            placeholder="llama3.2:1b"
            placeholderTextColor={theme.muted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button label="Use local model" onPress={applySessionConfig} />
        </SurfaceCard>
      ) : null}

      <View style={styles.reset}>
        <Button label="Reset AI settings" variant="ghost" onPress={resetAiAccessConfig} />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: v2Spacing.xl, maxWidth: 780 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginBottom: 7 },
  title: { fontSize: v2Typography.h1, lineHeight: 38, fontWeight: '900', letterSpacing: -0.8 },
  body: { fontSize: 14, lineHeight: 21, marginTop: 5 },
  modeCard: { marginBottom: v2Spacing.xl },
  modeHeader: { flexDirection: 'row', alignItems: 'center', gap: v2Spacing.md },
  modeIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '900' },
  sectionTitle: { fontSize: v2Typography.h2, fontWeight: '900', marginBottom: 2 },
  providerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: v2Spacing.sm, marginBottom: v2Spacing.xl },
  provider: { minWidth: 145, flexDirection: 'row', alignItems: 'center', gap: v2Spacing.sm, borderWidth: 1.5, borderRadius: v2Radius.md, paddingHorizontal: v2Spacing.md, minHeight: 52 },
  providerText: { fontSize: 14, fontWeight: '900' },
  pressed: { opacity: 0.78 },
  formCard: { maxWidth: 720 },
  input: { borderWidth: 1, borderRadius: v2Radius.md, minHeight: 50, paddingHorizontal: v2Spacing.md, marginVertical: v2Spacing.md, fontSize: 14 },
  reset: { marginTop: v2Spacing.xl, alignItems: 'flex-start' },
});
