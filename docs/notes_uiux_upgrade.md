# UI/UX Upgrade — Notlar (2026-08-16)

## Mevcut Durum Analizi

### Genel gözlemler
- 4 ekran da ayrı ayrı inline StyleSheet ile çalışıyor; ortak desensiz, kopya-yapıştır MetricTile/FilterChip bileşenleri ekran başına tekrarlanıyor.
- Token sistemi var (Midnight Sapphire tema: `src/theme/tokens.js`) ama ekranlar onu yetersiz kullanıyor; görsel hiyerarşi zayıf.
- VocabScreen 4400+ satır, devasa; ana upgrade hedefi giriş katmanı (hero, bölüm kartları, metrikler) olmalı.
- WritingScreen 458 satır — görece basit; hero + metrik + kütüphane var.
- SpeakingScreen 918 satır — Live mic scoring kartı var.
- ListeningScreen 1284 satır — hero + metrik rail + snapshot + format kartı + filtreler.

### Eksiklikler
1. Section header'lar ikon ve numaralandırma içermiyor; görsel ritim yok.
2. Metrikler (MetricTile) ekranlar arası tutarsız; StatCard var ama kullanılmıyor.
3. Hero kartları koyu ama hiyerarşi/eyebrow tipografisi zayıf.
4. Filter chip'ler inline, tutarsız padding/border.
5. Listening'de "Open" yazan satır içi CTA'lar zayıf; ikon yok.
6. Speaking'de mic sonuçları düz metin; ScoreRing kullanılmıyor.
7. Vocab ekran giriş katmanı sıkışık; bölüm grid'i görsel ağırlıksız.

## Upgrade Planı
1. `src/components/ui/SkillHeader.js` — yeni ortak üst-bar: eyebrow badge + başlık + açıklama + sağ tarafta mini stat (her sekme için).
2. `src/components/ui/MetricTile.js` + `MetricRail.js` — tekilleştirilmiş metrik karosu (4 ekran ortak).
3. `src/components/ui/FilterBar.js` — yatay kaydırmalı tekilleştirilmiş filtre çipi.
4. `src/components/ui/TaskRow.js` — ikonlu satır bileşeni (Listening/Speaking kütüphaneleri için).
5. tokens.js — yeni accent tonları ve section badge renkleri ekle (sekme kimlik renkleri: vocab=teal, listening=indigo, writing=amber, speaking=rose/purple).
6. ListeningScreen — SkillHeader, MetricRail, TaskRow entegre et; format kartına ikon ekle.
7. WritingScreen — SkillHeader, metrik tutarlılığı, prompt kartlarına ikon/numara.
8. SpeakingScreen — mic sonuç kartına ScoreRing; SkillHeader.
9. VocabScreen — sadece giriş katmanı: SkillHeader, bölüm grid kartlarına görsel ağırlık, Tool kartları tutarlı ikon/tone.
10. ESLint 0 hata + jest 36/36 + prod build doğrula, push.

## İlerleme Kaydı (faz 2-4)

### Yapıldı
- tokens.js: `colors.skill` (vocab/listening/writing/speaking) + `colors.skillSoft` eklendi.
- Yeni bileşenler: `src/components/ui/SkillHeader.js`, `MetricRail.js` (+MetricTile), `FilterBar.js` (+FilterChip), `SectionHeader.js`, `PracticeTaskRow.js`. ui/index.js'e export edildi. ESLint temiz.
- ListeningScreen: SkillHeader + MetricRail + SectionHeader (snapshot/format/quickstart/suggested/podcast featured) + FilterBar + PracticeTaskRow entegre edildi; eski MetricTile/FilterChip inline tanımlar ve ~25 ölü stil silindi. ESLint 0 hata, parse OK.
- WritingScreen: SkillHeader + MetricRail + SectionHeader (custom topic/quick starts/prompt library) + FilterBar entegre; eski inline MetricTile+FilterChip silindi; JSX structure fix (grid kapanışı). ESLint 0 hata, parse OK.
- SpeakingScreen: import'lar eklendi (SkillHeader/MetricRail/SectionHeader/FilterBar/ScoreRing), inline MetricTile+FilterChip silindi. KALAN: JSX entegrasyonu (satır ~185-265: h1+sub yerine SkillHeader; metricGrid yerine MetricRail; partnerHeader yerine SectionHeader; micResultBox'a ScoreRing; renderItem'ı PracticeTaskRow'a; chipScroll'ları FilterBar'a).

### Kalan
1. SpeakingScreen JSX entegrasyonu (yukarıdaki KALAN) + ölü stil temizliği (metricTile*, filterChip*, taskRow*, badge*, hero*, partner*, pronunciation*) + ESLint.
2. VocabScreen: sadece giriş katmanı — h1 (satır ~?) yerine SkillHeader + giriş metrikleri; Tool kartları (VOCAB_TOOLS) PracticeTaskRow benzeri görsel ağırlık. 4400 satır, büyük edit DİKKATLİ yapılmalı.
3. ESLint tüm ekranlar + jest (36/36) + prod build + push main + deploy bekle + canlı doğrula.
4. Rapor + kullanıcıya teslim.

### Stil isimleri (ölü temizlik referansı)
- ListeningScreen temizlendi. WritingScreen: metricTile/metricAccent*/metricValue/metricLabel/filterChip/filterChipText/filterChipHelper (inline'lar silindi, styles'da tanımlar duruyor olabilir — kontrol et). SpeakingScreen: aynı set + taskRow*/taskBadgeRow*/badge*/partner*/pronunciation*/hero*/metricGrid (kontrol et).
