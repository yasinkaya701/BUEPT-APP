# BUEPT-APP Task State (2026-08-15)

## Erişim ve Ortam
- Repo: https://github.com/yasinkaya701/BUEPT-APP (main, gh-pages)
- Local: /home/ubuntu/BUEPT-APP (checkout main)
- Credential: ~/.git-credentials (store helper) — token orada, URL'den uzaklaştırılmış
- GitHub hesabı: yasinkaya701. Token Contents:R/W yetkili; PR izni YOK → kullanıcı isteğiyle PR yerine DİREKT main'e push
- Canlı site: https://yasinkaya701.github.io/BUEPT-APP/ (200 OK, GH Actions deploy)
- Node v22.13.0, npm install yapıldı
- Doğrulama komutları: `npx jest --silent` (36/36), `npx eslint src` (0 error hedef, warning'ler 135 normal), `npm run web:rnw:build:root`

## Kullanıcının 2. istek seti (2 saatlik oturum)
Kullanıcı ders çalışmaya geçti; 2 saat boyunca:
1. 40k satırlık kod ve mevcut özellik genişletmesi, her şeyi doğrulayarak git
2. Temel kararları DEĞİŞTİRME
3. BUSEPT'in orijinal sınavını incele, kendine referans al (docs/buept_research.md)
4. Arayüzü düzenle, temel mantığı kotla
5. Kötü/hatalı özellikleri (vocab kısmı gibi) FIXLE
6. 4 büyük özellik: AI Mock Generator, Gerçek Konuşma Puanlama, SRS Kelime Hafızası, Resmi BUSEPT Simülasyon Modu

## Fix fazı 1 (tamamlandı, main'e push edildi)
- 16 ESLint hatası → 0; iki merge commit: bffc715 (hook deps), 29d515e (crash fixes)
- BUG_FINDINGS.md repo kökünde

## BUSEPT araştırma (docs/buept_research.md)
- Listening: Selective (~10 Q, pre-read 3 dk, while-listening, check 3 dk) + Careful (not-taking, 15 dk)
- Reading: Search (~10 Q, scanning, kısa cevap) + Careful (~10 Q, detay/inference; short answer/MC/matching)
- Writing: 2 essay x 250 kelime x 40 dk = 80 dk
- Geçme 60/100, harf S/F; parçalı geçme var. Speaking resmi sınavda YOK.

## Faz 10: AI Mock Generator (devam ediyor)
- YAZILDI: docs/buept_official_sample_2026.md (resmi 2026 sample analizi: Selective = yalnızca wh- short answer sentence completion, Careful = tanım/neden/faktör + nadir A-F MC, Reading I = 13 paragraf akademik makale + vokab/context, paragraf amacı, main idea, NOT-mentioned, inserted-sentence A/B/C/D, paragraf ilişkisi, cross-text, inference; Reading II = matching paragraf numarası + study bazlı kısa cevap; Writing = 2 essay, helper guidelines)
- aiMockGenerator.js prompt'ları resmi şablona göre güncellendi
- YAZILDI: src/screens/AIMockGeneratorScreen.js (seviye P1-P4, bölüm seçimi, üretim, bank, preview). Renk tokenları düzeltildi (errorLight, successLight)
- TAMAMLANDI: AIMockExamScreen.js + RootNavigator'a 2 ekran + HomeScreen'e 'AI Mock Generator' butonu eklendi
- TAMAMLANDI: commit + push main (18be75e), canlı site 200 OK, lint 0 error / 135 warning, jest 36/36
- FAZ 12: Vocab fixleri — YAPILANLAR:
  1) VocabPracticeScreen: preset size butonları (5/10/20/30) sizeInput'u da günceller (desenkron düzeltmesi)
  2) VocabCollocationQuizScreen: getPool artık Test-English/Default modu ayırıyor; options builder duplicate seçenekleri önler (seen Set) ve doğru cevabın seçeneklerde varlığını garanti eder; boş pool yerine fallback unfiltered
  TAMAMLANDI: VocabQuiz/VocabSynonym/VocabCloze option builder duplicate-fix; VocabFlashcardScreen web klavye desteği (K/U/Space/Enter/Arrow/Esc); lint 0 error
  KALAN: commit + push, sonra FAZ 13'e geç
- FAZ 13: BUSEPT orijinal sınavına göre arayüz/mantık düzenleme (resmi bölüm adları: Selective/Careful Listening, Reading I/II; süre/bilgilendirme metinleri)
- FAZ 13 TAMAMLANDI: ExamDetailScreen formatHint (resmi sıralama bilgisi), ExamsScreen subTasks listesi (Selective/Careful, Reading I/II, Task 1/2) + S/F policy notu; commit f22c144 push edildi
- FAZ 14: Gerçek Konuşma Puanlama — YAZILDI: src/hooks/useSpeechRecognition.js (Web Speech API recognition hook; scoreTranscriptCoverage, estimateFluency exported; web-only, Platform.OS check; FILLERS seti; interim/final sonuç; start/stop/reset; mic izni hata mesajları)
  KALAN FAZ 14: SpeakingScreen.js'e (768 satır; state'ler: levelFilter, queryInput, query, typeFilter, aiSessions) mikrofon butonu + skor paneli entegre et; evaluateSpeakingModel'a accuracy paramını geçir; sonra lint/build + commit + push
- FAZ 15: SRS Kelime Hafızası — weak words listesine SM-2 benzeri spaced repetition bağla + dueCount mevcut (AppState reviews). ReviewScreen mevcut
- FAZ 15: SRS Kelime Hafızası — weak words listesine SM-2 benzeri spaced repetition bağla + dueCount mevcut (AppState reviews). ReviewScreen mevcut
- FAZ 16: Resmi BUSEPT Simülasyon Modu — mevcut section ekranlarını art arda dizen, toplam zamanlayıcılı simülasyon + puan raporu (MockHistory tipi 'official'?)
- Push işi: git commit + git push origin main (credential store ~/.git-credentials sayesinde token gereksiz); canlı: https://yasinkaya701.github.io/BUEPT-APP/ (GH Actions deploy otomatik)
- NOT: HomeScreen'de modül butonları bölümü; RootNavigator lazy require kalıbı; Screen/Card/Button componenti kalıbı; renk tokenları: colors.primary/secondary/muted/error, errorLight/successLight var; spacing.md/lg/xl; typography.h1/h2/h3/body/small; radius.md; button: label/variant/onPress/iconLeft/iconRight
- AIMockExamScreen'de sınav çözme akışı referansı: gradeShortAnswer utility, PASS_MARK=60, bandFor fonksiyonu, exam.results benzeri state yapısı (FAZ 16 simülasyon bundan türetilecek)
- AI Mock Generator API: src/utils/aiMockGenerator.js — generateAiMock({section:'listening'|'reading'|'writing'|'full', level:'P1'-'P4'}), saveMockBank/loadMockBank, isAiAccessAvailable; ekranlar: AIMockGeneratorScreen, AIMockExamScreen (RootNavigator'a kayıtlı)
- Doğrulama zinciri: npx eslint src (0 error) && npx jest --silent (36/36) && npm run web:rnw:build:root
- Button component: iconLeft/iconRight/icon prop'ları var ✔
- Tema: colors.errorLight '#FEF2F2', successLight '#ECFDF5', primarySoft '#DBEAFE', accentGlow var
- YAZILDI: src/utils/aiMockGenerator.js (Gemini ile JSON mock üretimi, seviyeler P1-P4, bölümler listening/reading/writing/full, validation + sanitize + normalizeExam, AsyncStorage MOCK_KEY=ai_mock_bank_v1, isAiAccessAvailable)
- KALAN: 
  a) Ekran: src/screens/AIMockGeneratorScreen.js (seviye/seçim, üretim, loading, hata, bank listesi)
  b) RootNavigator'a Stack.Screen ekle (userToken == null bloğunun altındaki eklenen ekranlardan sonra, lazy require kalıbı)
  c) HomeScreen'e button (Proficiency Mock civarı, 'AI Mock Generator' → navigate('AIMockGenerator'))
  d) ExamsScreen veya HomeScreen entegrasyonu
  e) Test/lint/build doğrula → commit → push

## Mevcut ekran kalıpları (referans)
- Component'ler: Screen, Card, Button, components/ dizini; theme: { colors, spacing, typography, radius, shadow } from '../theme/tokens'
- İkon: react-native-vector-icons/Ionicons
- AI çağrı kalıbı: utils/runtimeApi → fetchDirectGeminiChat({ systemPrompt, messages, jsonFormat:true, signal })
- AI key: runtimeApi'ye gömülü DEFAULT 'AIzaSyAaAbaervIT28OsrSf2rPmUzpyzOiPhjiA' + appStorage.aiAccessConfig
- App.js: Web linking kapalı; Stack.Navigator lazy require kalıbı: <Stack.Screen name="X" getComponent={() => require('../screens/XScreen').default} options={{ headerShown: false }} />
- HomeScreen.js satır ~445: Proficiency Mock butonu
- ProficiencyMockScreen: mevcut mock demo ekranı, requestDemoModule('proficiency_mock') kullanıyor
- ExamsScreen: buept_exams.json (10 mock), examResources, bogazici_prep_profile; timed/practice modları
- appStorage KEYS: mockHistory:'mock_history_v1' vb.

## Yapılacak diğer fazlar (özet)
- Faz 11 Vocab fix: src/utils/vocabHelpers.js, src/utils/vocabCurriculum.js, VocabQuizScreen, VocabPracticeScreen, VocabFlashcard vb. lint/hata taraması
- Faz 13 Speaking: src/utils/speakingModel.js (85 satır, skor 0-100), speechRecognition.js var; Web Speech API recognition ile telaffuz skorlama ekranı (not: GitHub Pages = web, Web Speech API web'de çalışır, mobilde react-native-tts/speech var)
- Faz 14 SRS: src/utils/srs.js VAR (28 satır: scheduleNextReview [0,1,3,7,14,30 gün], createReviewItem, advanceReview, dueNow) — zayıf kelimeler listesine bağla + review ekranı + bildirim
- Faz 15 Simülasyon: tüm bölümler sırayla (Listening Selective→Careful→Writing→Reading Search→Careful), zamanlamalı, puan raporu (60 eşiği, S/F, parçalı geçme takibi)
- Faz 16: hepsini test/lint/build → commit → push → deploy kontrolü
- Faz 17: özet rapor + demo talimatları


---
# FAZ 13+ BÜYÜK UPGRADE OTURUMU (2026-08-15 devam — kullanıcı derste, sorma, ~40K satıra doğru git)

Kullanıcı: "planı büyüt eldeki tüm özelliklere upgrade çak 40 k satır civarı yap bana soru sorma dersteyim"

## Mevcut ölçüm
- data/*.json: ~1.35M satır. src kod: ~66.7K (js) / screens 88, ~47K satır.
- 40K hedefi: kod tabanını büyüt + tüm özellikleri derinleştir.
- Upgrade planı: docs/big_upgrade_plan.md

## Faz akışı
- Faz 14: Reading + Listening upgrade (AdvancedReadingScreen YENİDEN YAZILDI: 8 passage focus bazlı, quiz bank, wpm timer, AI word explain, TTS speed picker) → ŞİMDİ: ListeningDetailScreen upgrade + listening_tasks.json genişletme + lint/build
- Faz 15: Grammar + Writing upgrade
- Faz 16: Vocab + Speaking + Chatbot upgrade
- Faz 17: Study Plan + Analytics + Gamification
- Faz 18: İçerik üretim (Gemini ile reading/speaking/vocab JSON setleri)
- Faz 19: Full doğrulama + push + deploy
- Faz 20: Özet mesaj

## Kritik teknik bilgi (upgrade için)
- Token: ~/.git-credentials store. PR izni yok → direkt main push.
- Doğrulama: `npx eslint src` (0 error), `npx jest --silent`, `npm run web:rnw:build:root`
- AI API kalıbı: runtimeApi fetchDirectGeminiChat({systemPrompt, messages, jsonFormat:true}); loadAiAccessConfig → cfg.apiBase + cfg.apiKey → `x-goog-api-key` header
- speakEnglish(text, bps): utils/ttsEnglish.js (60/90/120)
- RootNavigator: lazy require kalıbı `getComponent={() => require('../screens/XScreen').default}`
- HomeScreen: Prep Control Center bouRow (~satır 442), primaryLaunches dizisi
- Renkler: colors.primary/secondary/muted/error, errorLight '#FEF2F2', successLight '#ECFDF5', primarySoft '#DBEAFE'
- Button: label/variant(primary|secondary|ghost|errorGhost)/onPress/icon
- Styles: colors.surface (#fff), colors.background, typography.h1..small, spacing, radius, shadow
- AdvancedReadingScreen YENİ: styles'ta h1/h3/sub/card/row/passageRow/passageChip*/passageHead/passageTitle/levelBadge/passageBody/interactiveWord/controlsRow/wpmText/wordCard/wordTitle/wordDef/quizQuestion/quizScoreText var (write ile oluşturuldu, h1 olarak typography.h1 kullanıyor — kontrol et! screen component'i Screen scroll + contentStyle kullanıyor)


---
## BÜYÜK UPGRADE İLERLEMESİ (2026-08-15)
- Faz 14 TAMAMLANDI (push 571faf5): AdvancedReadingScreen yeniden yazıldı (8 passage, quiz bank, wpm timer, AI word explain, TTS speed, modal) + ListeningDetailScreen'e notes persistence (AsyncStorage listen_notes_${task.id}), coverage/progress bar'lar, saveNotes fonksiyonu.
- FAZ 15 ŞİMDİ: Grammar + Writing upgrade. WritingEditorScreen'de: writingInsights (flow/variety/complexity/formality/AWL density metrikleri, tasks next-steps), Writing Assistant (thesis/outline/phrases/review tool butonları, ollama/openai toggle), timerCard var. Upgrade fikirleri: EssayBankScreen (örnek BUSEPT band essay'ler + annotation), grammar adaptive drill ekranı (GrammarDrillScreen: error pattern'e göre adaptive quiz), WritingEditor'a kelime sayacı hedef progress (250 target), paraphrase tool.
- FAZ 16: Vocab (word family/collocation modülü), Speaking (AI pronunciation comparison), Chatbot (BUSEPT score predictor tool)
- FAZ 17: StudyPlan/Analytics/Gamification (streak, XP, radar chart)
- FAZ 18: Gemini ile içerik üretimi (listening_tasks.json + reading_tasks.json genişletme, vocab setleri)
- FAZ 19: doğrulama + push + deploy; FAZ 20: özet
- NOT: deploy GH Actions ile otomatik; credential store ~/.git-credentials


---
## FAZ 15 TAMAMLANDI (push 1795dee)
GrammarDrillScreen yeni (10 soru, weak-topics bias %60/%40, rising difficulty, Mistake Coach), GrammarScreen'e Adaptive Drill butonları (hero + weak banner), WritingEditorScreen'e word target progress bar + wordHint. Lint 0 error, jest 36/36.

## FAZ 16 İLERLEME (push 95e0ff2): AISpeakingPartnerScreen'e Web Speech canlı coverage/fluency overlay eklendi (useSpeechRecognition entegrasyonu + coverageCard stil + 70%+ hint). Lint 0 error, jest geçti.

KALAN FAZ 16: VocabScreen'e yeni bölüm kartı (Context Builder — kelimeyi cümlede yaz, AI doğrulama), ChatbotScreen'e score predictor intent/tool + BUSEPTScorePredictorScreen, sonra Faz 17.

## FAZ 16 ŞİMDİ: Vocab + Speaking + Chatbot upgrade planı
- VocabScreen (2600 satır, çok kartlı): yeni kart = "Word Family" (root + derivative quiz), "Context Builder" (kelimeyi cümlede kullan, AI doğrulama)
- AISpeakingPartnerScreen (1627 satır): useSpeechRecognition entegre et (var: src/hooks/useSpeechRecognition.js, exported: useSpeechRecognition hook — check export), transcript coverage göster
- ChatbotScreen: BUSEPT score predictor intent/tool ekle (mevcut intent pattern kalıbı src/screens/ChatbotScreen.js ~430-470)
- Yapılan: VocabFlashcard klavye, collocationQuiz pool fix, quiz option duplicate fix (Faz 12'de push edildi)
- FAZ 17 sonra: StudyPlanScreen/AnalyticsScreen/ProgressScreen + gamification (streak/XP)
- FAZ 18: Gemini içerik üretimi (listening_tasks.json 79 item → genişlet, reading tasks)
- Push komutu: git add -A && git commit -m "..." && git push origin main
- AI API: runtimeApi fetchDirectGeminiChat; loadAiAccessConfig → cfg.apiBase/geminiApiBase + cfg.apiKey/geminiKey → `x-goog-api-key` header, endpoint `${base.replace(/\/$/,'')}/v1beta/models/gemini-2.0-flash:generateContent`


## FAZ 16 İLERLEME 2 (push 4c8e24d)
VocabScreen'e Word Lab bölümü eklendi: SECTIONS/SECTION_META/sectionCounts/getSectionData + renderSectionHeader case 'Word Lab' (WorkspaceIntroCard + Sentence Builder + AI Context Check via runtimeApi fetchDirectGeminiChat dynamic import + Quick Check local fallback + Lab Log 80+ graduates). 16 yeni stil (aiResult*). State'ler: wordLabWords/aiContextLoading/aiContextFeedback/aiContextResult. Lint 0 error, jest 36/36.

KALAN FAZ 16: ChatbotScreen'e score predictor intent + BUSEPTScorePredictorScreen (tahmin ekranı: girdiler = listening correct, reading I/II correct, writing band; 25/25/40 weighting + harf notu S/F). Sonra Faz 17 (StudyPlan/Analytics/Gamification).

Push kalıbı: git add -A && git commit -m "..." && git push origin main. Doğrulama: npx eslint src/screens/X.js (grep error), npx jest --silent.
Not: jest çıktısı "tests passed" satırında "36 tests, 36 passed" gibi görünüyor; tail -1'de sadece Time satırı kalıyor.


## FAZ 16 TAMAMLANDI (push 79100bd)
BUSEPTScorePredictor (utility + screen, resmi ağırlıklar L25/R25/W40, 60 eşiği, S/F, section gaps + weakest advice), Chatbot intent (score_predictor + TR tahmin/geçer miyim), RootNavigator kaydı. Lint 0 error, jest geçti.

## FAZ 17 ŞİMDİ: Study Plan + Analytics + Gamification
Plan:
1. HomeScreen'e streak/XP gösterimi (AppState addXp/streak mevcut mu kontrol et)
2. StudyPlanScreen: AI ile güncelleme (mevcut plan varsa), radar chart (fluent chart yok; SVG radar yaz — src/components/RadarChart.js), weekly progress
3. AnalyticsScreen: module accuracy, section radar, mistake heatmap, trend
4. Gamification: streak tracker (AppState), XP levels (XP→level), badge system (3+ badge kazanma olayı: perfect quiz, 7-day streak, first mock 60+, etc.)
5. MistakeCoach ile bağlantı: zayıf konu → study plan önceliği
Sonra FAZ 18 (Gemini içerik üretimi) → FAZ 19 (final doğrulama + push) → FAZ 20 (özet).


## FAZ 17 KRİTİK BİLGİ
- gamification.js YENİDEN YAZILDI (src/utils/gamification.js): calculateXpForAction (MOCK_EXAM 100, READING/LISTENING/GRAMMAR 20, ESSAY 50, SPEAKING 40, VOCAB_REVIEW 10, DAILY_LOGIN 5, WORD_LAB_CHECK 8, PREDICTOR_USED 3), levelFromXP (1:0-99,2:100+,3:300+,4:600+,5:1000+,6:1500+,7:2100+,8:2800+, sonra sqrt(xp/50)+1), titleForLevel, xpToNextLevel, levelProgressPct, BADGE_DEFS (first_mock, mock_sixty, mock_ninety, perfect_quiz, streak_3, streak_7, streak_14, word_lab, vocab_50, all_sections), checkBadgeUnlocks(ctx, heldIds), computeStreak(lastActiveDateISO, now)
- AppState: xp state satır 363, addXp satır 895 (setXp prev+amount). AppState.return dict'i ~satır 1200 civarında xp, userWords, readingHistory vb. döner. saveXP(xp) satır 611, loadXP import satır 20, saveXP satır 32.
- appStorage.js'te streak/badge key'i YOK → yeni key'ler eklenecek (streak_v1, badges_v1, activityDays_v1).
- HomeScreen: XP/streak gösterimi yok henüz (421 civarı expansionCard var); HomeScreen'de useAppState {xp} alınıp gösterilecek.
- StudyPlanScreen 388 satır, AnalyticsScreen 311 satır, ProgressScreen 369 satır mevcut.
- Push'lar: FAZ16 tamam 79100bd. FAZ15 1795dee, FAZ16.1 95e0ff2, FAZ16.2 4c8e24d.
- Remaining FAZ17: AppState streak/badge persistence + markActivityToday, HomeScreen XP bar, StudyPlanScreen radar+weak-topic prioritization, AnalyticsScreen upgrade (radar chart SVG component yaz src/components/RadarChart.js, radar için 4 eksen: listening/reading/writing/grammar + vocab), badge unlock bildirim toast'ı, FAZ18 (Gemini içerik), FAZ19 final.
