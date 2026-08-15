# BUEPT-APP Arayüz + Özellik Upgrade Planı (~10.000 satır)

**Tarih:** 15 Ağustos 2026 · **Önceki durum:** 49.026 satır ekran kodu, 90 ekran, 0 ESLint hatası, 36/36 test · **Hedef:** +10K satır arayüz ve özellik derinliği, aynı mimari kararlar

## 1. Analiz Özeti

Mevcut uygulama, büyük ekranlarda (VocabScreen 4.4K, ListeningDetail 2K, Feedback 1.8K) yoğun içerik üretimiyle güçlüyken, sınav akışının kritik bağlantı noktaları zayıf kalmış durumda. Özellikle **MockScreen (47 satır)**, dört **History ekranı (47 satır, tekil liste render'ı)** ve **Drafts (61 satır)** ekranları gerçek filtreleme, görsel skorlama ve zaman çizelgesi içermeyen placeholder seviyesinde. Ayrıca uygulama genelinde yeniden kullanılabilir UI bileşeni katmanı neredeyse yok (sadece Button, Card, Chip, ProgressBar); her ekranda aynı satır stiller tekrar ediliyor. Bu plan, (a) placeholder ekranları gerçek işlevsel arayüzlerle değiştirmeyi, (b) ortak bir UI bileşen kütüphanesi kurmayı ve (c) BUSEPT formatına doğrudan bağlı yeni özellik ekranları eklemeyi hedefler.

## 2. Satır Bütçesi ve Paketler

| # | Paket | Yeni/Rework | Tahmini Satır |
|---|---|---|---|
| 1 | UI Bileşen Kütüphanesi (`src/components/ui/`) | Yeni | ~1.400 |
| 2 | Exam Hub & Mock Launcher redesign | Rework | ~1.200 |
| 3 | History & Analytics derinleştirme | Rework | ~1.400 |
| 4 | Writing Studio UI genişletme (Essay Bank, Paraphrase Studio, Outline Builder) | Yeni/Rework | ~1.600 |
| 5 | Speaking & Listening UI viz (Interview Timeline, Signpost Map) | Yeni/Rework | ~1.300 |
| 6 | Reading UI (Passage Reader, Question Tracker, Annotation) | Yeni/Rework | ~1.200 |
| 7 | Gamification & Progress vitrinleri (Badge Case, XP Timeline, Level Cards) | Yeni | ~1.100 |
| 8 | Dashboard 2.0 (HomeScreen kart vizyonları, streak viz) | Rework | ~800 |
| **Toplam** | | | **~10.000** |

## 3. Paket Detayları

### Paket 1 — UI Bileşen Kütüphanesi (~1.400 satır, yeni)

`src/components/ui/` altında ortak bileşenler kurulacak ve mevcut ekranlar bu bileşenlere yönlendirilecek (refactor sırasında satır ekleme/değişiklik olarak sayılır). `ScoreRing` (SVG dairesel skor göstergesi, animasyonlu), `StatCard` (4-modül özet kartı), `ScoreBandChip` (S/F/60-69/70-79/80+ bant renkleri), `TimelineStep` (sınav bölümü adım göstergesi), `EmptyState` (ikonlu boş durum), `TabPill` (segmented tab), `Sparkline` (basit SVG trend çizgisi), `KeywordDensityBar` (yazım için kelime kullanım dağılımı), `ConfidenceStrip` (soru güven seviyesi şeridi), `ThemeDocs` (tasarım token doküman ekranı) bileşenleri tasarlanır. Tema token'larına `bands` (puan bandı renkleri) ve `radii` genişletmesi eklenir.

### Paket 2 — Exam Hub & Mock Launcher (~1.200 satır, rework)

`MockScreen` (47 satır) gerçek sınav merkezine dönüşür: bölüm seçici (Selective/Careful Listening, Reading I/II, Writing), süre önizleme, seviye rozetleri (P1–P4), AI Mock Generator'a köprü, son skor trendi mini grafiği ve resmi BUSEPT sınav yapısı görsel şeması (bölüm süreleri: Listening 30 dk, Reading 40 dk, Writing 30 dk şablonu). `OfficialSimScreen` girişine bölüm zamanlayıcı önizleme kartı ve restart/segment resume akışı eklenir.

### Paket 3 — History & Analytics derinleştirme (~1.400 satır, rework)

Dört History ekranı (Reading/Listening/Grammar/Mock) ayrı ayrı filtre (seviye, tarih aralığı, skor bandı), sıralama, skor trendi sparkline'ı ve "son hatalı sorulara git" aksiyonu alır. `ProgressScreen` radar'a ek olarak 30-günlük çalışma serisi takvimi (GitHub-stili heatmap) ve bölüm bazlı skor trend çizgileri alır. `GenericHistoryScreen` ortak tablo görünümüne dönüştürülür.

### Paket 4 — Writing Studio UI (~1.600 satır, yeni/rework)

`EssayBank`: örnek essay kalıplarının görsel olarak renklendirilmiş yapı analiz ekranı (thesis → destek → kontrast → sonuç blokları). `ParaphraseStudio`: cümle seçip seviyeli (B1→C1) yeniden yazım önerileri alanı, synonym swap önerileri (TerminologyDictionary ile bağlantılı). `OutlineBuilder`: 2 essay için 5-adımlı şablon (thesis + 3 paragraf + conclusion) drag-benzeri sıra düzenleyici. `WritingEditorScreen`'e `KeywordDensityBar` entegrasyonu genişletilir.

### Paket 5 — Speaking & Listening UI (~1.300 satır, yeni/rework)

`SpeakingMockInterviewScreen`'e interview timeline (soru → cevap → geri bildirim akışı görsel), konuşma süresi ve güven seviyesi strip'leri. `SpeakingDetailScreen`'e kelime bazlı telaffuz ısı haritası (kullanılan/kaçan kelimeler renklendirilmiş metin). `LectureListeningLabScreen`'e Signpost Map (işaretleyici kelimelerin lecture yapısındaki konum görselleştirmesi).

### Paket 6 — Reading UI (~1.200 satır, yeni/rework)

`ReadingDetailScreen`'e Passage Reader modu: satır-satır vurgulu okuma (okunan bölge rengiyle işaretlenir), kelimeye tıklama popup'ı görselleştirilir, soru tracker (doğru/yanlış/bayraklı soru ilerleme şeridi). `AdvancedReadingScreen`'e WPM görsel kadran ve bölüm ilerleme barı.

### Paket 7 — Gamification vitrinleri (~1.100 satır, yeni)

`BadgeCaseScreen`: 10 rozetin görsel vitrin ekranı (kazanılmış/kilitli, kilit açıklaması, kazanma tarihi). `LevelCardScreen`: XP unvanlarının görsel kademe ekranı (Novice → Polyglot Scholar, gerek duyulan XP ve mevcut ilerleme). `XPTimelineScreen`: günlük XP akışı çizgisi ve seri kırılma uyarısı. Ana HomeScreen'de streak/badge satırı zenginleştirilir.

### Paket 8 — Dashboard 2.0 (~800 satır, rework)

`HomeScreen`'deki Today Board kartlarına gerçek değer görselleri (mini trend, streak alevi animasyonu, skor bandı rozetleri), Skill Snapshot görsel ring'leri ve boş durum yönlendirmeleri eklenir.

## 4. Uygulama Kuralları

Mevcut mimari korunur: lazy `require` navigasyon kalıbı, AppState context, tema token'ları (`tokens.js` genişletilir, kaldırılmaz), AsyncStorage persistence ve Gemini entegrasyonu değişmez. Her paket sonrasında `npx eslint src/` 0 error, `npx jest` tüm testler geçecek şekilde doğrulanır ve web build (`npm run web:rnw:build:root`) kontrol edilir; sonuç doğrudan `main`'e push edilir. Placeholder ekranlar kaldırılmaz, genişletilir.
