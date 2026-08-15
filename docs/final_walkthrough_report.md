# BUEPT-APP — Stabilizasyon Walkthrough Raporu

**Tarih:** 15 Ağustos 2026 · **Repo:** [yasinkaya701/BUEPT-APP](https://github.com/yasinkaya701/BUEPT-APP) · **Branch:** `main` · **Son commit:** `251b25b`

## Özet

72.764 satır (`src/` JavaScript) ve 56 dokümantasyon/script dosyası içeren Boğaziçi University English Proficiency Test hazırlık uygulaması, UI/özellik genişletmesi sonrası sistematik bir manuel doğrulama turundan geçirildi. Turda 21+ sorun tespit edildi; hepsi kök neden analiziyle giderildi, her düzeltme ESLint (0 hata) ve jest (36/36 test) kontrollerinden geçtikten sonra `main`e doğrudan push edildi ve GitHub Pages canlı dağıtımında doğrulandı.

## Kapatılan Kritik Sorunlar

| # | Sorun | Kök Neden | Çözüm |
|---|-------|-----------|-------|
| 1 | Canlı site eski bundle çalıştırıyordu (cache) | GitHub Pages index.html cache süresi uzun | `index.html`a no-cache meta + cache-busting query eklendi; cache-bypass ile doğrulandı |
| 2 | TodayBoard "Review weak words" butonu çalışmıyordu | Basit onPress yokluğu | Review (SRS) ekranına yönlendirme eklendi |
| 6/9 | Reading Model skor tutarsızlığı + yanlış "cloze repair" zayıf alan önerisi | Boş dimension'lara default 50 değeri; clozeAccuracy fallback'ı | Denenmemiş dimension'lar null döndürür; overall yalnızca denenen ağırlıklarla normalize edilir; "Composite (attempted drills only)" etiketi |
| 8 | Home Essentials'ta "Listening" kartı okuma metni gösteriyordu | Null skorlu modüller weakSkill sıralamasında 1. sıraya yerleşiyordu | Null skorlar zayıf alan seçiminden çıkarıldı |
| 10–12 | Grammar ekranlarında ham markdown ("### Verbs...") ve konu dışı Q11-20 karışık soruları | Markdown strip edilmemişti; "mixed review" bölümü etiketsizdi | stripMd uygulandı; Q11+ için "Mixed Review — B2+ Advanced Structures" bölüm başlığı |
| 13 | Writing Studio boş metinde Accuracy %100 / Formality %100 | Boş metin metrikleri hesaplanıyordu | wordCount 0 ise metrikler '--'; rubric önerileri kategoriye göre ayrı üretiliyor |
| 14 | Feedback ekranında aynı öneri birden fazla kriterde tekrarlanıyordu | `fixes.find()` ilk eşleşen kategoriye atıyordu | Her kategori kendi metriğine göre öneri üretiyor (catFixSet) |
| 16 | Vocab ekranı Quick Start butonları taşıyordu | 6 buton tek satırda, overflow yok | 3+3 iki satır + overflow:hidden + flexShrink |
| 18 | AI Speaking Partner ekranı TDZ crash'i | `activePrompt` tanımlanmadan önce useMemo kullanımı | useMemo'lar activePrompt tanımından sonraya taşındı |
| 19 | Mock Exam kartlarında "0 Questions" ve sınavlar çözülemiyordu | `buept_exams.json` mock referansları (r_/l_) hiçbir dosyada tanımlı değildi | `scripts/fix_mock_exam_refs.py` ile gerçek görevlerden inline bölüm üretildi (mock başına 63–69 soru) |
| 21 | **Mock Exam çözme akışı bozuktu**: passage metinleri yoktu, MCQ seçenekleri kısa cevap kutusu olarak render ediliyordu, Grammar bölümü boştu | Script soruları tek düz liste yapmıştı; format bilgisi kaybolmuştu | Script yeniden yazıldı: her görev kendi passage/transcript kartında, MCQ ayrıştırma (A/B/C/D), Language Use grammar havuzu (8 MCQ); ExamDetailScreen yeni şemaya uyarlandı |
| 23 | Calendar'da "0 GÜN : 00 SAAT" anlamsız geri sayımı | Sınav tarihi (2 Haziran 2026) geçmişte, formatCountdown 0 gösteriyordu | Sınav geçtikten sonra "Sınav Tamamlandı — kalıcı pratik mod" gösterimi |

## Canlıda Doğrulanan Ekranlar (bundle `ea678afe`)

Home, TodayBoard, Reading (+Detail, Live News), Grammar (+Detail), Writing Studio + Feedback, Vocab (+Dictionary, Live Lookup, Detail), Listening (+Detail: Play Audio, Dictation, Selective/Careful), AI Speaking Partner, Chat Coach, Placement Test, Study Plan, Analytics, Progress, History, Exams/Mock Hub (5 mock tam çözme akışı: timer, passage kartları, MCQ, transcript, skorlama 1/77), OfficialSim, ProficiencyMock, WeakPointAnalysis, Calendar, Resources, BogaziciHub, Settings.

## Mock Exam Veri Altyapısı (yeni)

`scripts/fix_mock_exam_refs.py` yeniden yazıldı ve şu şemayı üretiyor: `sections.reading.passages[]` (her görev ayrı passage kartı), `sections.listening.groups[]` (transcript dahil), `sections.grammar.questions[]` (Language Use MCQ havuzu). MCQ seçenekleri "q" metninden ayrıştırılıp `options`/`answer` alanlarına işleniyor. ExamsScreen `getQuestionCount` ve ExamDetailScreen yeni şemaya uyumlu hale getirildi.

## Kalan Bilinen Küçük Notlar

Vocab Quick Drills "Verb list loading..." göstergesi kısa süreli görünüyor (yükleme sonrası kayboluyor — beklenen davranış). BogaziciHub'da "Today 2 min" özet kartı demo verisine dayalı. Yeni özellik talepleri (AI Mock Generator genişletme, Speaking Web Speech puanlama, SRS hatırlatmaları, Resmi Simülasyon modu) önceliklendirilmiş backlog olarak duruyor.

## Doğrulama Standartları

Her push öncesi: `npx eslint` — 0 hata, 0 uyarı (kritik dosyalarda); `npx jest` — 36/36 geçiyor. Canlı doğrulama cache-bypass query parametresiyle yapılıyor; bundle hash'i yeni commit'e karşılık geliyor (`ea678afe` ← `251b25b`).
