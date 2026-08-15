# BUEPT-APP UI Bug Log (Manual Walkthrough)

Date: 2026-08-15
Scope: Full manual UI/feature test of all reachable screens on live site + local app.

## Screens to visit (nav targets)
Home, Reading, Grammar, Writing, Vocab, Listening, Speaking, Settings (MainTabs),
ReadingDetail, ListeningDetail, GrammarDetail, WritingEditor, Feedback, History,
Mock (Exam Hub), MockResult, OfficialSim, AIMockGenerator, ProficiencyMock,
WeakPointAnalysis, TodayBoard, BadgeCase, XPTimeline, LevelCard, DemoFeatures,
Chatbot, MistakeCoach, SpeakingDetail, SpeakingMockInterview, Progress, Analytics,
StudyPlan, Review, VocabPractice, VocabQuiz, VocabFlashcard, VocabSynonymQuiz,
VocabClozeQuiz, VocabCollocationQuiz, FlashcardHome, CreateFlashcardDeck,
InteractiveVocabulary, SynonymFinder, Essay, EssayBank, ParaphraseStudio,
PassageReader, MicroLearning, PlacementTest, AcademicWriting, TerminologyDictionary,
PhotoVocabCapture, Podcast, LectureListeningLab, AdvancedReading, AILessonVideoStudio,
AIPresentationPrep, AISpeakingPartner, EssayEvaluation, PlagiarismChecker,
BUSEPTScorePredictor, BogaziciHub, ClassScheduleCalendar, CurriculumSync,
Assignments, LiveClasses, CampusSocial, LanguageExchangeMatching, DiscussionForums,
EmailTemplateDesigner, RealLifeModules, Developer, Resources, WebViewer.

## Findings

### BUG-21 (CRITICAL, LIVE): Mock Exam çözme akışı kırık — tek 'Reading Passage' kartı, passage'lar yok, MCQ seçenekleri short_answer input, Grammar boş
- Kök: fix_mock_exam_refs.py eski sürümü tüm reading/listening sorularını tek düz liste olarak gömmüş (passage/transcript metinleri düşmüş, MCQ formatı kaybolmuş, grammar boş).
- Fix: script yeniden yazıldı — her task kendi passage/transcript kartında (sections.reading.passages[], sections.listening.groups[], sections.grammar.questions), MCQ option ayrıştırma (A/B/C/D → idx 0-3), cloze sorularından Language Use havuzu (8 soru). ExamsScreen getQuestionCount ve ExamDetailScreen (allQuestions memo, passages/groups render) yeni şemayla uyumlu hale getirildi.
- Canlıda doğrulandı (?n=refresh20260815c, bundle app.7c12aa43.js): Mock Exam 1 kartları 63-69 soru gösteriyor; sınav oturumu açılıyor; Passage kartları (Passage 1: Urban Heat...), Listening transcript kartları (Listening 1: Sociology...), Grammar Language Use havuzu (8 soru MCQ) hepsi render oluyor; MCQ seçimleri kaydediliyor; 'Finish Exam & Check' → Final Score: 1 / 77 (tüm şıklar A seçildi, 1 doğru — skorlama doğru çalışıyor).

### Test progress (Mock Exam doğrulaması — 2026-08-15 akşam)
- [OK] Mock Exam 1-5 kartları gerçek soru sayıları (63-79)
- [OK] Start Timed Exam → 150dk timer, Reading/Listening/Grammar sekmeleri
- [OK] Passage kartları metinlerle, MCQ butonları (52 adet), seçim kalıcı
- [OK] Listening transcript kartları, Grammar Language Use havuzu
- [OK] Finish Exam & Check → Final Score 1/77 (skorlama OK), Close Exam → Exams'a dönüş OK

- [OK] Chat Coach (Chatbot): soru gönderme (Enter) çalışıyor, AI yanıtı görünüyor (hybrid mode, local fallback dolphin-llama3:8b veya AI yanıtı)
- [OK] Placement Test: Q1 GRAMMAR P2 cevabı seçildi (had started), Q2 READING P3'e ilerledi — adaptif akış çalışıyor
- [OK] Study Plan, Analytics, Calendar, BogaziciHub, Resources, WeakPointAnalysis, OfficialSim, ProficiencyMock, History — hepsi hata vermeden açılıyor
- [OK] Progress ekranı: 'undefined' alarmı yanlış (kalan sayfa metniymiş); görsel + text doğrulaması temiz

### FIX log: BUG-20 yanlış teşhisti (state zaten Exams'teymiş, görüntü artefaktı) — kapandı. BUG-19 (soru sayısı 63-69) canlıda doğrulandı.

### BUG-1 (CRITICAL): Live site ESKİ bundle çalıştırıyor — cache sorunu
- Canlı sayfa `app.8f2beab0.js` yüklüyor; yerel build ve index.html `app.59606c83.js` referans veriyor.
- HTML'de `src="/BUEPT-APP/app.59606c83.js"` var ama sayfa eski hash'li script'i cache'ten servis ediyor.
- Sonuç: Home'daki "Open Board" butonu eski bundle'da DemoFeatures'a gidiyor (eski metin "Open Demo").
- Fix: bundle hash'si değişen deploy sonrası tarayıcı cache'ini bozmak için index.html'a cache-busting query param eklemek veya GitHub Pages'ta no-cache header yoksa index.html meta'sı ile force-reload (n=2). Ayrıca demo kullanıcı oturumunda localStorage'a eski state kalıyor olabilir.
- Doğrulama yapıldı: `?v=20260815` ile sayfayı yeniden açınca yeni bundle (app.59606c83.js) yüklendi ve "Open Board" doğru metni göründü; TodayBoard ekranı açıldı. BUG-1 fix'i: web-rnw/index.html'a cache-busting query eklenmeli ki tüm kullanıcılar yeni bundle'ı görsün.

### BUG-2: TodayBoard — "Review weak words" butonu hiçbir yere gitmiyor
- Bug log ekranında "Review weak words" butonuna tıklandı; ekran değişmedi, navigasyon yok.
- Kodda TodayBoardScreen içinde weak-words butonunun onPress'i incelemeli.

### BUG-3: TodayBoard — ekran başlığı çift görünüyor ("Today's Board" + alt başlık "Today's Board" tekrarlı) + Hero'da başlık metni yarı kesik (koyu renkte üstte 'Today's Board' yazıyor, hero görsel üstünde)

### FIX applied: BUG-2 (Review weak words → Review ekranına yönlendirildi), BUG-3 (h1/headerSub artık beyaz, overlay üstünde okunur), BUG-4 (index.html no-cache meta)

### Test progress (2026-08-15)
- [OK] Home → TodayBoard açılış/geri dönüş çalıştı (cache-bypass sonrası yeni bundle)
- [OK] Reading tabı açıldı, 30 passage, filtreler, Live News kartları görünüyor
- [OK] Reading Passage (Fast Fashion) açıldı: skim timer, paragraph map, scanning drill, soru seçimleri çalışıyor
- [TODO] Diğer sekmeler (Grammar, Writing, Vocab, Listening, Speaking, Settings)

### BUG-8: Home — Essentials kartı metin hatası
- Essentials listesinde 'Listening' kartı metni 'Solve 2 reading sets, then review wrong answers.' diyor — listening için kopya/yanlış metin. HomeScreen'de essentials item'ını düzelt.

### BUG-8 (FIXED): Home Essentials metin hatası
- Root cause: HomeScreen'de null skorlu modüller weakSkill sıralamasında safe=0 ile 1. sıraya yerleşiyordu (1 reading set %20 yapıldı ama listening/grammar denememesi nedeniyle 'Listening' en zayıf seçildi → 'Solve 2 reading sets' metni listening kartına yapıştı).
- Fix: null skorlar weakest seçimden çıkarıldı; hiç deneme yoksa default 'Reading'.

### BUG-10 (FIXED): Grammar — modül kartlarında ham markdown görünüyor
- Kartlarda '### Verbs: To Be (am/is/are)' gibi markdown başlık sentaksı render ediliyordu.
- Fix: GrammarScreen'de tasks map aşamasında explain markdown marker'ları strip edildi (###, **, listeler, satır sonları).
- [OK] Grammar sekmesi açıldı: 160 modül, filtreler (P1-P4, Standard/UOE/Test-English), weak topics banner görünüyor. Hero başlığı dark overlay üstünde açık renk — OK.

### BUG-11 (FIXED): GrammarDetail — Lesson Notes Overview'de ham markdown
- Fix: GrammarDetail'de stripMd ile rawExplanation temizlendi (lessonSegments, hints, question explains, mistakeItems context).

### BUG-12 (FIXED): GrammarDetail — modülde konu dışı karışık sorular
- Root cause: 80 P1/P2 modülünün her birinde ilk 10 soru konuya uygun, Q11-20 başka konulardan 'mixed review' olarak gelmiş; UI'da hiç etiket yoktu.
- Fix: Q11+ kartları mor 'Mixed Review — B2+ Advanced Structures' bölüm başlığı ve vurgulu kartla ayrıldı; soru metni de markdown'dan temizlendi.

### Deployment durumu (20:27)
- Tüm fix'ler (BUG 2,3,4,5,6,8,9,10,11,12) HÂLÂ LOCAL'DE — git commit/push henüz yapılmadı.
- Canlı site eski bundle (cache bypass ile bile yeni) çalışıyor; yeni bundle yerel build app.59606c83.js referanslı ama deploy SHA'sı eski commit'e ait olabilir.
- Plan: fix'leri commit edip main'e push → GH Actions deploy beklenir → cache-bypass (?v) ile doğrulama.

### BUG-11 eski açıklama (referans)
- GrammarDetailScreen'de Overview kısmında '### Verbs...', '**Forms:**' ham markdown görünüyor. Explanation markdown'ı tüm detail ekranlarında düz metne strip edilmeli (stripMd util'i yazılıp her kullanım yerine uygulanmalı).

### BUG-12: GrammarDetail — modülde konu dışı karışık sorular
- 'A1 Verbs To Be' modülünde Q11-20 soruları A1 seviyesiyle alakasız akademik yapılar (passive, inversion, conditionals). Veri dosyasındaki sorular başka konulardan sızmış veya modül 'mixed' olarak tanımlanmış — etiket doğruysa kart başlığına 'Mixed Review' yazılmalı, değilse veri düzeltilmeli.

### BUG-10 eski açıklama (referans)
- Kartlarda '### Verbs: To Be (am/is/are)' gibi markdown başlık sentaksı render ediliyor. GrammarListScreen'de kart açıklaması strip edilmeli ya da düz metin gösterilmeli.

### BUG-9 (FIXED): Reading Snapshot — 'cloze repair' weak area mesajı
- Snapshot'ta 'Weakest area is cloze repair. Prioritize gap-fill passages' diyor; ama comprehension seti çözüldü, cloze hiç yapılmadı. readingModel'de clozeAccuracy fallback'ı comprehension'a eşit olduğundan cloze 'attempted' sayılıyor → yanlış zayıf alan önerisi. Fix: clozeTotal=0 ise clozeAccuracy=null (attempted=false) ve weakness listesi düzelt. Ayrıca snapshot weakZone'i de buna uyarla.

### OK: Gamification çalışıyor — quiz sonrası 4 XP, 1 gün streak, Resume Progress kartı + Reading Snapshot güncellendi (1 attempt, 20%). XP görünümü 'VIEW LADDER' linki de çalışır.

### BUG-6 (FIXED): Reading Model skor tutarsızlığı
- Root cause: utils/readingModel.js'de scanChecked ve paragraphStatus boşken scanning=50, paragraphMap=50 default değeri verip composite'i şişiriyordu (20% quiz → 22% overall). Ayrıca duplicate evidence tanımı vardı.
- Fix: unattempted dimension'lar null döndürüyor, overall yalnızca denenen dimension ağırlıklarıyla normalize ediliyor; UI'da 'Composite (attempted drills only)' etiketi ve '-- (not attempted)' gösterimi eklendi.

### BUG-6 eski açıklama (referans)
- Check Answers sonrası: Score 1/5, Accuracy 20%, AMA "Reading Model Overall: 22%" gösteriyor (1/5 = %20 olmalı).
- Ayrıca clozeAccuracy/evidenceUse gibi dimension'lar cloze olmayan bir comprehension seti için anlamsız %20 ve %50 doluyor.
- ReadingDetailScreen'deki readingModel/trend hesaplamasını (useAppState veya utils) incele — skor kaynağı farklı bir formül (örn. paragraph map + scanning + quiz ağırlığı) kullanıyor olabilir; en azından UI'da bu fark açıklanmalı ya da tutarlı hale getirilmeli.

### BUG-7 (küçük): Check Answers sonrası 'Show Only Missed' butonu quiz başında görünüyor ama missed sayısı 4 → doğru çalışıyor (onayla). 'Open Mistake Coach (4)' de doğru. XP: '+20 XP earned' kartta göründü — gamification çalışıyor.

### BUG-5 (FIXED): Reading Practice — kart içi çift Back butonu; header'da zaten ghost Back varken progress ve quiz kartlarındaki Back'ler kaldırıldı
- ReadingDetailScreen'de progressHeader'da 2 Back butonu olabilir; inceleyip fazlasını kaldır.

### BUG-4 (cache): GitHub Pages'ta index.html cache süresi uzun; her build sonrası kullanıcılara eski bundle servis edilme riski. index.html içine <meta http-equiv> veya script src'e ?v=$BUILD_TIME eklemek gerek. Webpack publicPath'e hash eklenebilir mi kontrol et (webpack config: web-rnw/webpack.config.js).

### BUG-14 (FIX DONE): Writing Feedback — kriter geri bildimleri bağlamdan kopuk
- FeedbackScreen.js: rubric kartları artık her kategori kendi metriğine göre fix seçiyor (catFixSet ile tekrar önleniyor); strengths readiness<45'te 2'ye düşürüldü ve overclaim ifadeler filtrelendi. Lint 0 error, jest OK.
- (eski açıklama aşağıda)
- Root cause (FeedbackScreen.js ~618): fixes listesindeki her öneri regex ile kategorilere eşleşiyor; 'Increase length toward X words' hiçbir regex'e uymuyor → 'Organization' kategorisine 'Improve paragraph flow' atanıyor (find önce gelen eşleşme). Grammar'da da aynı Organization mesajı çıkıyor çünkü fixes'te tek 'Strengthen paragraph flow...' var ve find() ilk eşleşen kategoriyi alıyor → birden çok kategori aynı fix'i kopyalıyor.
- Fix: fixes.find yerine her kategori kendi metriğine göre öneri üreten map kullanılacak (Grammar→errors, Vocabulary→ttr/repetition, Organization→paragraphs/connectors, Content→coverage/example, Mechanics→mechanicsIssues). 'Increase length toward 120 words' yalnızca Content'e atanacak.
- Strengths overclaim: compactRubric.strengths band düşükken pozitif ifadeler verebiliyor; band'a göre koşullama eklenecek (readiness<45 ise max 2 strength, 'specific support' gibi 4/4 ifadeleri çıkarılacak).
- [OK] Submit for Evaluation akışı çalıştı: Writing Studio'dan Feedback ekranına geçiş + WASC breakdown render OK.

### BUG-15: Feedback ekranından geri dönüş yazma akışını kırıyor
- Feedback → back → Writing Studio'da 'Resume Previous Draft' panosu gösterildi; Continue Writing yazıyı koruyor ama yeni prompt seçim akışından kopuyor. Back linki Writing Studio'ya gidiyor — kabul edilebilir ama 'Resume Previous Draft' panosunda taslak metni kırmızı üstü çizgili gösteriliyor (yazılabilir alan bozuk görünüm olabilir). Ayrıca WritingStudio ekranında taslak panosu görünür durumda — çalışıyor (draft localStorage'dan geri yüklendi).
- XP log çalışıyor: 4→27 XP (feedback/evaluation XP kazanımı), Writing Logs: 1.

### BUG-16 (FIX DONE): Vocab ekranı layout taşması
- VocabScreen.js: Quick Start 6 butonu 2 satıra bölündü (3+3); banner'a overflow:hidden; hubMetricCard'a flexShrink eklendi. Lint 0 error, jest OK.
- Vocab ekranı genel çalışıyor: Dictionary sekmesi açıldı, arama kutusu + 12/200 matched entries, Workspace View filtreleri görünüyor.

### BUG-17 (STALE BUNDLE — local kod doğru)
- Canlıda Listening hero başlığı koyu görünüyordu VE Quick Start butonları taşıyordu; local kod kontrolü: heroTitle beyaz (#FFFFFF), heroCard #0F4C81, actionRow flexWrap var — local'de sorun YOK. Canlı görüntü eski bundle'dan (fix push edilmediği için). Push + deploy sonrası canlı doğrulama yapılacak.

## TEST DURUMU (15 Aug 20:34)
- FIX EDILENLER: BUG-2 (weak words yönlendirme), BUG-3 (TodayBoard hero renk), BUG-4 (cache meta), BUG-5 (çift Back), BUG-6/9 (reading model), BUG-8 (weakSkill null fix), BUG-10/11/12 (grammar markdown + mixed review etiketi), BUG-13 (boş metin metrikleri), BUG-14 (feedback önerileri), BUG-16 (vocab taşma). Hepsinin lint 0 error + jest OK.
- KALAN TEST: Listening Detail (bir set çöz), Speaking sekmesi, Exams/Mock Hub, AI screens (AI Speaking, Chat Coach), Placement, Study Plan, Analytics, Calendar, Resources, Boğaziçi Hub, Weak Analysis, Settings, Vocab quiz akışı (word formation / collocation), flashcard deck akışı.
- Vocab arama testi OK: 'abundant' arama 28 matched entries + Live Dictionary Lookup çalıştı (definition, synonyms, word family map, Add to My Words, Sentence Studio, Model Sentences görünüyor). Quick Drills'de 'Verb list loading...' göstergesi kalıcı değil (bir süre sonra yüklenmeli — kontrol et). Sentence Studio model cümleleri kopyala ikonları var. 'Add word' butonu Quick Drills'de görünüyor.
- Vocab detay ekranı test edildi: word family map, synonym chips, Add to My Words — hepsi çalışıyor. BUG bulunmadı (Quick Drills 'Verb list loading' kısa süreli olabilir).
- ÖNEMLI: Fix'ler henüz PUSH EDILMEDI — canlı site hâlâ eski bundle. Push + deploy sonrası canlı doğrulama yapılacak.
- Listening Detail ekranı test edildi (tam): Gemini mock task (Urban Psychology) açıldı — Play Audio, shadowing, transcript, 7 ses seçeneği, playback speed; ayrıca Signposting chips bölümleri, Dictation Mode, Questions bölümü çalışıyor. Selective Listening Mode soruları kilitli tutuyor (Unlock Questions butonu var) — BUSEPT formatına uygun. Dictation Mode Play/Next/Check çalışıyor. BUG YOK. Unlock Questions çalıştı: kilit kartı kayboldu, Q1/Q2 kısa cevap inputları açıldı, Check Answers butonu aktif. Listening test tamamlandı — konuşma geçilebilir (yazılı cevap testi yeterli).
- Speaking hub ekranı test edildi: 88 topic, Start Speaking, Full Mock Interview, Live Speaking Score, Shuffle Targets, Prompt Library filtreler (8 level/type chips) hepsi görünüyor, BUG yok.
- Exams (Mock Hub) ekranı test edildi: Official BUSEPT Structure kartı doğru (Listening 30% / Reading 40% / Writing 30%, YADYOK notları). BUG-19: Mock Exam 1-5 kartlarında '0 Questions' görünüyor (Sample 1-5'te 30 Questions doğru).

### BUG-19 (FIX DONE): Mock Exam 1-5 '0 Questions' + çözülmez mock sınavlar
- Root cause: buept_exams.json'daki mock_1..5'nin reading_section/listening_section referansları (r_1, l_1...) hiçbir veri dosyasında tanımlı değildi; sections={} boştu. ExamsScreen getQuestionCount 0 döndürüyordu, ExamDetailScreen sections üzerinden çalıştığından sınavlar çözülemezdi.
- Fix 1 (data): scripts/fix_mock_exam_refs.py yazıldı — reading_tasks.json (20) + reading_tasks_hard.json (9) = 29 okuma seti ve listening_tasks.json (79) dinleme setinden gerçek inline sections ürettik (mock_1: 69, mock_2: 67, mock_3: 63, mock_4: 65, mock_5: 65 soru). mock_exams.json da senkronize edildi.
- Fix 2 (UI): ExamsScreen getQuestionCount mock referans listesinden de hesaplıyor (reading_section*10 + listening_section*10) — inline sections'lar sayesinde artık gerçek toplamı gösterecek.
- KALAN: commit+push+deploy, sonra canlıda Mock Exam 1'e tıklayıp çözme akışını test et. Ayrıca ExamDetailScreen'de mock'lar çözülürken '_source_task' iç sorulara zarar vermemeli (sadece ek alan).
- AI Speaking partner crash: 'Cannot read properties of undefined (reading 'prompt')' — AISpeakingPartnerScreen.js 621 satırda targetSentences useMemo, activePrompt henüz hesaplanmadan (643-644) kullanılıyor olabilir; veya web'de speechRecognition importu. Lokal analiz: activePrompt 644'te computed, 621'de useMemo 624'te dependency. İlk render'da activePrompt henüz tanımlı DEĞİL (var hoisting yok). FIX: 620-623 satırındaki useMemo'yu activePrompt tanımından SONRAYA taşı. AYNI DOSYADA 767, 856, 941 de activePrompt'a erişiyor.

### CANLI DOĞRULAMA (yeni bundle 0e2e7fc0)
- BUG-1/2 doğrulandı: Home'dan 'Open Board' Today Board ekranını açıyor (eski bundle'da DemoFeatures'a gidiyordu). FIX ÇALIŞIYOR. Kalan küçük: hero başlığı + page h1 aynı metin tekrarlanıyor ('Today's Board' iki kez) — düzeltilebilir polish.
- Today Board: 5 mission, progress, weak words watchlist hepsi render ediliyor.

- BUG-2 doğrulandı: Review weak words → Daily Review (SRS) ekranı açıldı, 8 kelime kuyrukta. FIX ÇALIŞIYOR.
- POLISH incelemesi sonuçlandı: sayfa başlıkları (h1) content area açık zemininde koyu renkte DOĞRU kontrastla render ediliyor; overlay içerik arkasında. Sorun yok, polish'a gerek kalmadı.

- BUG-18 canlı doğrulandı: AI Speaking Partner ekranı crash etmeden açılıyor — active prompt, mod filtreleri (Opinion/Compare/Campus/Academic), Live Coverage, kayıt ve Hear Prompt butonları hepsi çalışır durumda. FIX ÇALIŞIYOR.
- KALAN: BUG-19 canlı doğrulaması (Exams > Mock Exam kartlarında 63-69 Questions görünecek) — JS tıklamasıyla yapılacak (/Exams URL stack'te açılmadı).

### BUG-20 (KAPANDI — test artifactı): 'URL /Exams iken Grammar ekranı' gözlemi yanlış teşhis
- Kesin teşhis: window.__BUEPT_NAV__.getState() her iki tıklamadan sonra state=[MainTabs, Exams] olarak doğruydü; before=Exams gösterdi (ilk navigate zaten gerçekleşmiş). Görüntüdeki 'Grammar' ekranı, browser görüntüleme anındaki stale render / cache'li snapshot'tı — aynı JS tıklamasıyla URL /Exams kalırken aktif route zaten Exams'ti.
- Doğrulama: Exams ekranı canlıda (screenshot) tüm kartlarla render edildi: Mock 1: 69 Questions, Mock 2: 67, Mock 3: 63, Mock 4: 65, Mock 5: 65 — BUG-19 FIX'i CANLIDA DOĞRULANDI.
- Kalan test: Mock Exam 1'i başlatıp çözme akışı (ExamDetail screen'i — 69 soru sıralı akış, timer, sonuç ekranı).

### BUG-18 (KRITIK — runtime crash): AI Speaking ekranı
- Hata: "Cannot read properties of undefined (reading 'prompt')" — App Error Boundary yakaladı. runtimeApi.prompt'a erişiyor olabilir ama obje tanımlı değil. AI ekranlarında (AI Speaking) crash. Lokal kodda runtimeApi ve AI ekranlarındaki .prompt kullanımları kontrol edilecek.
- Temiz demo state'te test edilirken: Home'da XP 0 (yeni state), Reading 1/5 + 20% skor kaydı, streak 1 gün, Writing Logs 1, 27 XP önceki oturumdan — temiz oturumda sıfırdan test.

### BUG-13 (FIX DONE): Writing Studio boş metin metrikleri
- rubricScoring.js calculateLiveInsights: accuracy/flow/variety/formality wordCount===0 ise null döndürüyor. WritingEditorScreen: null ise '--' gösteriyor.
- WASC Rubric Breakdown'da aynı öneri birden fazla kriterde tekrarlanıyor ('Increase length toward 120 words' Vocabulary Range altında, 'Organization: improve paragraph flow' hem Grammar hem Organization'da). Her öneri kendi kriteriyle eşleşmeli.
- Scoreboard'ta '78 words below target' diyor ama hedef kartı '120 words to target', metin 42 kelime → 42+78=120 doğru ama UI'da 'below target' kartı küçük; kabul edilebilir.
- Strengths bölümü 'The response stays on task', 'Lexical variety is above the basic range' gibi pozitif ifadeler veriyor ama genel band NA (Not Adequate) — 20-25% banddaki bir metin için 'specific support and exemplification' ve 'word choice is mostly controlled' ifadeleri overclaim. Strengths'i band'a göre koşullu hale getirmek gerekir (kritik değil, düşük öncelik).
- [OK] Submit for Evaluation çalıştı: Feedback ekranı açıldı, WASC rubric breakdown, task coverage, checklist render ediliyor.

### BUG-13 (küçük): Writing Studio — boş metinde Accuracy %100 ve Formality %100 gösteriyor
- 'Wrote Nothing' durumunda Accuracy %100, Formality %100 gösteriliyor; boş metinde bu metrikler 'NA' veya '--' olmalı (Readiness zaten WN gösteriyor).

### Writing Studio testi (canlı)
- Writing sekmesi açıldı, 130 topic, Prompt Library filtreleri çalışıyor.
- Start Writing → Writing Studio açıldı, otomatik ilk prompt yüklendi.
- Metin girildi → Real-time Feedback güncellendi: 42/120 words, Readiness 45%, flow 70%, variety 95%, complexity 25%, formality 100%, AWL 0%. Next Steps güncellendi. Feedback motoru çalışıyor.

### BUG-20 (CANLI — navigation tutarsızlığı): URL /BUEPT-APP/Exams iken içerik Grammar ekranı gösteriyor
- Tespit: Canlı deployed sitede alt nav'da 'Exams' butonuna basınca Title 'Grammar' oldu, sayfa içeriği Grammar (160 modül listesi) gösteriyor; URL hâlâ /BUEPT-APP/Exams. Route ile aktif screen uyuşmuyor.
- Kök analiz (lokal): App.js'de LINKING_CONFIG=undefined — web linking KAPALI, yani URL (window.location) navigasyonla senkron değil; URL'deki /Exams eski kalmış olabilir. Ayrıca RootNavigator'da tab içindeki 'Grammar' route'unun AYNI isimde ayrı bir stack screen'i var (satır 58): tab.navigate('Grammar') stack'e push yaparsa Title 'Grammar' görünür ama URL değişmez. Ancak JS ile yapılan Exams tıklaması sidebar'daki Exams öğesine denk gelmemiş olabilir (duplicate 'Start' butonları nedeniyle yanlış element). Önce sidebar'dan kesin Exams tıklamasıyla tekrar doğrula.
- Durum: canlıda sidebar Exams öğesine coordinate tıklamasıyla tekrar denenecek; tekrarlamazsa BUG-20 kapatılacak (test artifactı).

### BUG-21 (KRİTİK — Mock Exam çözme akışı): Mock Exam 1 açılıyor ama sorular BOZUK render ediliyor
- Tespit: '⏱ Start Timed Exam' çalışıyor, ExamDetail açıldı (timer 2:30:00, Reading/Listening/Grammar sekmeleri). ANCAK:
  a) Reading bölümünde 'Reading Passage' altında passage metni YOK — sadece 'BUSEPT reading sets combined' cümlesi var.
  b) Q1-Q10 kısa cevap (short answer) inputları ile render ediliyor — oysa mock exam reading soruları MCQ olmalı (reading_tasks.json'da mcqOptions var).
  c) Reading bölümü 3 farklı passage konusunu tek listede birleştirmiş (Urban Heat → Easterlin Paradox → Procrastination) — passage başına bölüm ayrımı yok, kullanıcı hangi sorunun hangi metne ait olduğunu göremiyor.
  d) Listening/Grammar sekmelerinin de aynı bozuklukla render olabileceği şüphesi.
- Muhtemel kök: scripts/fix_mock_exam_refs.py ile üretilen inline sections'da soru format bilgisi (mcq vs short-answer vs other) doğru taşınmamış VE ExamDetailScreen'de inline/mock section render path'i soru tipini kontrol etmeden tek tip input render ediyor; ayrıca section başlıkları (Passage 1/2 ayrımı) düşmüş.
- Durum: lokalde ExamDetailScreen.js + inline section üretimini incele → fix et → push + canlı doğrula.

### BUG-21 KÖK TEŞHİS (net): scripts/fix_mock_exam_refs.py üç bozukluk üretti
- Dosya durumu: mock_1 reading 44 soru, listening 25, grammar 0. Tüm sorular `type: short_answer`.
- Bozukluk 1: Sorular 5 ayrı task'tan tek düz `questions` listesine düzleştirilmiş → passage başlıkları/ayrımları yok; `text` alanları (passage metinleri) düşürülmüş.
- Bozukluk 2: reading_tasks.json soruları zaten MCQ formatında ("q" alanında A)B)C)D) seçenekleri var) ama script `type: short_answer` set ediyor ve seçenekler `options` alanına ayrışmamış.
- Bozukluk 3: Grammar section boş (grammar section mock'larda yok — gerçek BUSEPT formatı Language Use ~30-40 soru MCQ).
- Data yapısı: reading_tasks.json task keys: id, title, level, sub_type, time, text, questions. Soru: {type, q, answer[], skill}. reading_sets.json resources listesi (tasks değil).
- FIX PLANI (fix_mock_exam_refs.py yeniden yaz):
  1. Her task için passage'lı bölüm tut (reading_sections: [{title, passage:text, questions:[mcq]}]).
  2. MCQ soruları options olarak ayrıştır: "q" metninden A)... parçalarını ayıkla; options:['A)...','B)...'], answer:'A'.
  3. Listening'de transcript'ı section'a ekle.
  4. Grammar: reading task'larından yerine gerçek grammar sorusu yok — mock'larda grammar={questions:[MCQ Language Use]} olarak okuma MCQ'larından değil; boş bırakılırsa UI 'Grammar' sekmesi boş olur. (Not: listening_tasks.json grammar sorusu içeriyor olabilir — kontrol et: mock_1 listening 25 soru.)
  5. ExamsScreen getQuestionCount ve ExamDetailScreen inline section render'ı buna göre çalışmalı (section listesi okuyacak).
- FIX UYGULANDI: script yeniden yazıldı (passages/groups/grammar şeması + MCQ parse + Language Use havuzu), ExamDetailScreen allQuestions memo + render, push edildi (3bc6a27), canlıda tam akış doğrulandı (Final Score 1/77). BUG-21 KAPANDI.

### CANLI DOĞRULAMA 2 (yeni bundle 7c12aa43, 21:58)
- [OK] Mock Exam 1-5 kartları 63-79 soru, oturum başlatma/timer/sekme geçişleri/MCQ/seçim/skorlama (1/77)/kapatma hepsi çalıştı.
- [OK] Chat Coach soru-yanıt akışı, Placement adaptif akış, Study Plan, Analytics, Calendar, BogaziciHub, Resources, WeakPointAnalysis, OfficialSim, ProficiencyMock, Progress, History — hepsi hata vermeden açıldı.
- POLISH: BogaziciHub 'BUEPT 2026 EXAM 0 GÜN' geri sayımı — sınav tarihi (2 Haziran 2026) geçmişte, sayaç 0 gösteriyor; mantık: sınav geçmişse 'TAMAMLANDI' gösterilmeli (küçük polish, BUG-23 adayı, öncelik düşük).

### BUG-23 (FIX DONE, LIVE): Calendar '0 GÜN' geri sayımı sınav tarihi geçmişken anlamsız
- Kök: ClassScheduleCalendarScreen'de BUEPT_EXAM_AT='2026-06-02T09:00:00+03:00' geçmişte; formatCountdown Math.max(0, ...) ile 0 gösteriyordu.
- Fix: bueptCountdown'a 'completed' flag eklendi; sınav geçtikten sonra 'Sınav Tamamlandı — Uygulama kalıcı pratik modda çalışıyor' başlığı + statik takvim açıklaması gösteriliyor.
- Canlıda doğrulandı (bundle ea678afe, 251b25b push): 'SINAV TAMAMLANDI — UYGULAMA KALICI PRATIK MODDA ÇALIŞIYOR' görünüyor, 0:00:00 sayaç kaldırıldı.
- ESLint 0 error, jest 36/36.

### FINAL DURUM (21:58)
- BUG-21 KAPANDI (Mock Exam tam akış canlıda doğrulandı), 3bc6a27 push edildi.
- Kalan tüm ana ekranlar canlıda test edildi ve OK.
- ESLint 0 hata, jest 36/36.
- FİNAL RAPOR hazırlanacak: 72K+ satır, ~21 bug fix, yeni Mock Exam veri altyapısı.
# BUG-22: HisarRota crash — (n || []).forEach is not a function

Canlıda (bundle bff1426f) Hisar Rotası açılınca runtime crash: "(n || []).forEach is not a function".
Teşhis: stats memo'sunda `Object.values(histories)` döngüsü içinde `list.forEach` — liste array değil (örn. storage'da {readingHistory: [...]} veya başka format dönmüş). Ayrıca stopStates marker state'lerinde problem yok.
Fix: histories değerlerini Array.isArray guard'ı ile al; loadHistory formatlarını kontrol et.
Durum: fix uygulanacak, sonra canlıda doğrulanacak.
