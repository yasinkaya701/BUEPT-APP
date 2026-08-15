# BUEPT-APP → IELTS/TOEFL Seviyesi Platform Yol Haritası

**Yazar:** Manus AI · **Tarih:** 16 Ağustos 2026 · **Repo:** [yasinkaya701/BUEPT-APP](https://github.com/yasinkaya701/BUEPT-APP)

## 1. Giriş: Nerede Duruyoruz?

BUEPT-APP şu anda ~73.000 satır kodla sağlıklı bir temel oluşturdu: gerçek BUSEPT formatına sadık 5 tam mock sınav (63–69 soru, passage'lı, MCQ, transcript'li), yazılı bir çalışma takvimi, geniş bir kelime ve gramer veri tabanı, gamification ve çok sayıda yardımcı modül mevcut. Ancak IELTS/TOEFL platformlarıyla karşılaştırıldığında yapı aslında şu soruna sahip: **içerik var, motor yok.** Magoosh, IELTS Ready, Arno ve ETS'in kendi hazırlık araçları bir "puan makinesi" olarak çalışır — her deneme bir veri noktası üretir, sistem o veriye göre zorluğu ayarlar, zayıf alan üretir ve tahmin edilen skoru günceller. Bizde ise denemeler birbirinden bağımsız statik içerik olarak kalıyor.

2026 itibarıyla sektör standardının nasıl göründüğüne dair kısa bir tablo:

| Sektör standardı (ETS/BC/Arno vb.) | BUEPT-APP mevcut durumu | Durum |
|---|---|---|
| Adaptive zorluk (soru performansla seçilir) | Sabit P1–P4 seçimi, adaptif değil | Zayıf |
| AI Writing puanlama (rubric-kalibreli, instant) | Regex/istatistik tabanlı `rubricScoring.js` | Zayıf |
| AI Speaking puanlama (ses analizi, 5 eksen) | Prompt + basit kalıp puanlama, Web Speech API yok | Zayıf |
| Section-level skor raporları + skor tahmini | MockResult basit yüzdelik, ScorePredictor ilkel | Zayıf |
| Hedef skor → kişisel çalışma planı | Çalışma planı kullanıcının elle girdiği hedeflere dayalı | Zayıf |
| Soru başına detaylı explanation | Grammar'da var; Reading/Listening'de yok | Zayıf |
| Sınırsız AI mock üretimi | AIMockGenerator basit, tek seferlik | Zayıf |
| Weak-area drill generator | MistakeCoach var, soru üretimi sınırlı | Orta |
| Hata tipi analitiği (inference, detail, vocab-in-context) | Yok | Yok |
| Gerçek sınav simülasyonu (timer + bölüm akışı + rapor) | OfficialSimScreen var, akış sınırlı | Orta |

BUSEPT'in kendisi YADYOK formatı olduğundan (Speaking bölümü yok) tüm TOEFL özelliklerini birebir kopyalamak yanlış olur; ama **puan motoru, adaptif seçim ve AI geri bildirimi** test-agnostik ve kopyalanması zorunlu çekirdektir.

## 2. Mimari Karar: "Puan Motoru" (Scoring Engine) Katmanı

IELTS/TOEFL platformlarının sırrı ayrı ayrı ekranlar değil, ekranların altında yatan ortak katmandır. Önerim, yeni özellikleri ekran ekran eklemek yerine önce bu katmanı inşa etmektir. Katman üç alt sistemden oluşur:

**B1 — Performans Veri Modeli (performanceModel.js):** Her çözme oturumundan soru bazlı kayıt tutar: `question_id, section, skill_tag (inference/detail/vocab-in-context/grammar/UOE/...), difficulty, correct, response_time_ms, chosen_answer`. Mevcut AppState + localStorage üzerine inşa edilir (sunucu gerektirmez).

**B2 — Skor Motoru (scoreEngine.js):** B1 verisinden CEFR-level tahmin (P1–P4 karşılığı), section skorları (0–100 ölçekli BUSEPT karşılığı + TOEFL 0–30 karşılığı görünümleri), doğruluk trendi, soru tipi başarı matrisi ve "tahmin edilen BUSEPT sonucu" üretir. Basit madde tepki kuramı yaklaşımı: doğru cevaplanan soruların zorlukları toplanarak gerçek bir seviye ölçütü oluşturulur.

**B3 — Adaptif Seçici (adaptiveSelector.js):** Yeni soru setleri oluştururken havuzdan zorluğu kullanıcı seviyesine ±1 adım ayarlayarak seçer. Statik mock'lar sabit kalır; "Smart Practice" modları adaptif olur.

Bu üç dosya ~1.500 satır olur ama **tüm ekranları (Home dashboard, Analytics, Study Plan, MistakeCoach, AIMockGenerator, OfficialSim) aynı anda güçlendirir.** Bu, IELTS/TOEFL platformlarının yaptığı şeyin birebir karşılığıdır.

## 3. Yol Haritası — Dört Dalga

### Dalga 1: Puan Motoru + Analitik (çekirdek, ~2.500 satır)

Bu dalga olmadan diğer dalgalar yüzeysel kalır. İçeriği: `performanceModel`, `scoreEngine` (CEFR tahmini + section skorları + weak-area matrisi), `adaptiveSelector`, yeni **Analytics** ekranı (doğruluk trend grafiği, soru tipi matrisi, skor tahmini kartı, tahmin edilen sınav tarihi), Home dashboard'ının motor verisiyle yenilenmesi ve MockResult ekranının section skor raporu görünümüne evrilmesi. Mevcut gamification (XP, streak, badge) motor verisine bağlanır — XP artık gerçek başarıdan kazanılır.

### Dalga 2: AI Değerlendirme (Writing + Speaking, ~2.000 satır)

IELTS Ready'nin premium paralı özelliği olan şeyi ücretsiz yapmak: `aiGrading.js` Gemini API üzerinden Writing'i gerçek BUSEPT rubric'ine göre puanlar (4 kriter, band 0–10, örnek cümle düzeltmeleri, yeniden yazım önerileri); mevcut regex motoru offline fallback olarak kalır. Speaking için Web Speech API (tarayıcıda hazır, kurulumsuz) ile gerçek ses kaydı, transcription, konuşma hızı, duraklama analizi, kelime çeşitliliği ve kalıp tespiti — 5 eksenlik skor + band tahmini. Mevcut AISpeakingPartner bu motora bağlanır. Bu dalga uygulamanın **ayrıştırıcı özelliği** olur: hiçbir BUSEPT hazırlık kaynağında yok.

### Dalga 3: Adaptif Pratik + Sınırsız Mock (AI Mock Generator 2.0, ~1.500 satır)

AIMockGenerator mevcut tek seferlik üretimden çıkıp "Smart Practice" sistemine dönüşür: kullanıcı seviyesi + weak-area matrisi → Gemini ile kişiselleştirilmiş passage + soru seti üretimi; her mock sınırsız tekrar üretilebilir ve zorluk kullanıcı performansına göre ayarlanır. Ayrıca her soruya **explanation** eklenir (Gemini ile üretilip havuza yazılır) — Magoosh'un en güçlü olduğu alan. Grammar'da zaten olan explanation kültürü Reading/Listening'e yayılır.

### Dalga 4: Hedefe Yönelik Plan + Resmi Simülasyon (kişisel koç, ~1.500 satır)

Kullanıcı "BUSEPT'ten geçmem lazım / P3'e çıkmalıyım" hedefi girer; sistem tersine plan üretir (gün gün drill ataması, weak-area ağırlıklı, deadline'e göre yoğunluk artan). OfficialSim ekranı tam sınav deneyimine evrilir: bölüm blokları arasında resmi süre kesintileri, ara ekranları, bitişte section skor raporu + "geçme olasılığı". Ayrıca弱 alan drill jeneratörü: MistakeCoach artık benzer soru üretiyor ama havuzdan gerçek soru seçebilecek ve Gemini ile yenisini üretebilecek.

## 4. Tahmini Sonuç

| Metrik | Bugün | Dalga 4 sonrası |
|---|---|---|
| Satır (src) | ~73K | ~80K |
| Adaptif soru seçimi | Yok | Reading/Listening/Grammar practice + Smart Mock |
| Writing puanlama | Regex, statik | AI + rubric, band tahmini |
| Speaking puanlama | Prompt + kalıp | Web Speech API, 5 eksen |
| Skor tahmini | Yok denecek | CEFR + BUSEPT geçme olasılığı + tarih |
| Kişisel plan | Elle hedef | Hedefe tersine plan |
| Explanation coverage | Grammar | Tüm bölümler |
| Soru havuzu | Statik (mock başına 63–69) | Sınırsız AI üretimi |

## 5. Uygulama Önerisi

Dalgaların bağımsız, lint-temiz, test-li (jest 36/36 korunacak) commit'lerle uygulanmasını öneriyorum. Dalga 1 en yüksek etki/başlangıç noktasıdır ve 2–4 oturumda tamamlanabilir. Eğer istersen direkt Dalga 1'den başlayabilirim; ya da öncelikle tek bir pilot ekranla (Analytics + scoreEngine) proof-of-concept gösterebilirim.

## Kaynakça

1. [ETS — TOEFL iBT Hazırlık Sayfası](https://www.ets.org/toefl/test-takers/ibt/prepare.html)
2. [Study.com — TOEFL Adaptive Test Prep Guide (2026 güncellemeleri)](https://study.com/resources/toefl-adaptive-test-prep-guide.html)
3. [PrepareBuddy — Top 10 TOEFL Practice Platforms Compared 2026](https://www.preparebuddy.com/blog/top-10-toefl-practice-platforms-compared-2026/)
4. [British Council — IELTS Ready (AI feedback, Writing & Speaking)](https://takeielts.britishcouncil.org/prepare/ielts-ready)
5. [Duolingo English Test — Computer Adaptive Test](https://englishtest.duolingo.com/edu)
