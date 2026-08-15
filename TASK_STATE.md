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
- KALAN (faz 11 devamında):
  a) src/screens/AIMockExamScreen.js yaz (çözme akışı: Selective → Careful → Reading I → Reading II → Writing; short answer kabulü: case-insensitive, fuzzy 60% kelime örtüşmesi veya model-answer dizisinde eşleşme; MC matching); result: bölüm puanları + pass (60) + S/F
  b) RootNavigator satır 127'den önce: AIMockGenerator + AIMockExam ekranları (lazy require)
  c) HomeScreen satır 445 civarı: 'AI Mock' butonu ekle (Proficiency Mock yanına)
  d) App.js'ye gerek yok, RootNavigator otomatik
  e) npx jest --silent && npx eslint src (0 error) && npm run web:rnw:build:root → commit → push (main, token store helper ~/.git-credentials)
- Reference ekranlar: MockResultScreen.js (CEFR bantları, PASSING_THRESHOLD=60, ScoreCircle, SectionBar) — yeni result ekranı buna benzer yap
- MockResultScreen'de PASSING_THRESHOLD=60, getBand: >=90 C1, >=80 B2+, >=68 B2, >=58 B1+, >=48 B1, else A2
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
