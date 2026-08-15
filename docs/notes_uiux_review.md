# Canlı Görsel Review — UI/UX Upgrade

## Writing sekmesi sorunları (2026-08-15 canlı ekran görüntüsünden)
1. **SkillHeader çakışması**: Header'da "WRITING STUDIO" eyebrow yazısı sayfa üst başlığı (Writing) ile üst üste binmiş — ekranın üst kısmında iki başlık çarpışıyor. Ayrıca sağdaki "0 Draft words" kutusu header'dan taşıyor.
2. **MetricRail kartları boş görünüyor**: "Ready / SAVED DRAFT", "0 / FAVORITES", "15 / VISIBLE" kartlarında değer solda, label altta, ancak kart içleri gereksiz boş; renk accent bar görünmüyor (beyaz kartta kaybolmuş olabilir) — MetricTile tasarımını gözden geçir.
3. **Input taşmaları**: Custom Topic kartındaki text input genişliği kartı taşıyor; "Prompt Library" search box da aynı şekilde dar/sığıyor. FilterBar chip'leri de alt satıra düzensiz inmiş.
4. **Icon pozisyonu**: SectionHeader'daki ikon solda boşlukta, padding dengesi bozuk görünüyor (sol padding eksik gibi).

## Düzeltme planı
- SkillHeader: ekran üstündeki mevcut headerSpacer ile entegrasyonu kontrol et; WritingScreen'de headerSpacer'dan sonra gelen h1/sub yok artık ama SkillHeader içi padding/topSpacing ayarlanmalı; rightValue label'ı dar kartta taşma — kompakt göster.
- MetricTile: accent bar görünmüyor mu kontrol et; kart dolgusunu azalt (padding sm), value daha belirgin.
- Kart içi padding: section içeriklerine `paddingHorizontal: spacing.md` ver (FilterBar/input taşmalarını çözer).
- FilterBar: chip'ler dar genişlikte sarılmalı (flexWrap zaten var mı kontrol et).

## Kontrol edilecek diğer sekmeler
- Listening, Speaking, Vocab ekranları için de aynı sorunların varlığını doğrula.

## Listening sekmesi sorunları (canlı ekran görüntüsü)
- SkillHeader: "LISTENING STUDIO" eyebrow + "Listening" başlığı üst üste okunuyor; sağda "-- ACCURACY" etiketi taşıyor.
- MetricRail kartları gene boş görünüyor: değerler çok küçük/hiç görünmüyor, accent bar yok gibi.
- LetterRail (F / F / 0%) ok ama kartlar çok geniş boşluklu, harf tile'larda değerler sığmamış gibi görünüyor.
- BUSEPT format kartı: header'da ikon boşlukta, içerik ok.

## Teşhis (kök neden)
- MetricTile/MetricRail'de kart içi padding çok büyük, değer fontu beyaz kartta renk kontrastı düşük olabilir; canlıda değer görünmüyor => MetricRail bileşenini kontrol et (render edilen değer renk/margin).
- SkillHeader'da eyebrow + title sıralaması dar alanda taşma yapıyor; sağdaki value/label kutusu dar; responsive kontrol et.

## Teşhis (kesin, 2. ekran görüntüsü sonrası)
1. MetricRail çalışıyor — asıl sorun: kartlar düzgün, accent barlar görünüyor, değerler görünüyor. GÖRSEL OLARAK KALİTELİ. Kaldırılacak sorun yok metric rail'de.
2. Kalan sorunlar:
   a. **SkillHeader eyebrow/title üst üste binmesi YOK** — aslında düzgün render ediliyor (Listening Studio eyebrow + açıklama + sağda ACCURACY kutusu). Sorun: sağ kutu dar (-- ACCURACY yazısı okunabilir). Sağ kutu genişliği OK.
   b. SkillHeader'da açıklama metni eyebrow ile aynı satırda gibi — aslında row düzeni doğru.
   c. Gerçek sorun: hero kartının üstünde SkillHeader var ama hero kart da "Listening Studio" eyebrow içeriyor — ÇİFT eyebrow. Ayrıca Listening Snapshot kartı ile metrik rail arasında bilgi tekrarı.
   d. Writing'de headerSpacer'da eski h1/sub yok artık ama SkillHeader + hero kartta yine iki başlık bloğu.

## Netleştirme
Kod aslında düzgün render ediliyor. Asıl düzeltmeler kozmetik:
- Hero kartlardan mükerrer eyebrow/title kaldır (hero kart artık alt başlık içeriyor) — WritingScreen hero kartı: heroEyebrow (Writing Studio) + heroTitle — bunları kısalt: title satırını kaldır, hero kartı sadece CTA'ya odakla.
- Listening: hero kartta "Listening Studio" eyebrow zaten var; SkillHeader var — heroTitle'u kaldırıp hero kartı kompakt CTA'ya çevir.
- Speaking: aynı şey.
- Vocab: aynı şey.
- MetricRail/MetricTile: accentBar görünür; iyileştirme opsiyonel — değer rengini accent rengiyle vurgulamak daha premium durur (value rengi accentColor olsun, label muted).

## Son canlı doğrulama (2026-08-15, push 6872f71)
Speaking ekranı canlıda: SkillHeader (SPEAKING STUDIO eyebrow + Speaking başlığı + 88 Topics kutusu) + hero CTA kartı + Live Speaking Score (SectionHeader) + MetricRail (3 renkli metrik) + AI Speaking Partner (ScoreRing + son oturum pilli) + Prompt Library (FilterBar: Level/Type). Tüm sekmeler artık ortak tasarım diliyle çalışıyor; hero kartlarda mükerrer başlıklar kaldırıldı, metrik değerleri accent renkli. ESLint 0 error, 36/36 test, prod build OK, canlı deploy 200.
