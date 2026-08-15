# BUEPT-APP Büyük Yükseltme Raporu

**Tarih:** 15 Ağustos 2026 · **Depo:** [yasinkaya701/BUEPT-APP](https://github.com/yasinkaya701/BUEPT-APP) · **Canlı:** [https://yasinkaya701.github.io/BUEPT-APP/](https://yasinkaya701.github.io/BUEPT-APP/)

Bu oturum, mevcut mimari kararlar korunarak uygulanan kapsamlı bir yükseltme çalışmasıdır. Orijinal resmi BUSEPT formatı (docs/buept_research.md ve 2026 örnek sınav analizi) referans alınmış, kötü çalışan özellikler düzeltilmiş ve uygulama hedeflenen derinliğe ulaştırılmıştır. Tüm gönderimlerden önce 0 ESLint hatası ve geçen testler doğrulanmış, her değişiklik doğrudan `main` dalına gönderilerek GitHub Pages üzerinden otomatik yayınlanmıştır.

## Ölçüm Sonuçları

| Metrik | Önceki Durum | Güncel Durum |
|---|---|---|
| Toplam `src` kod satırı | ~66.7K (oturum başı) | **68.870 satır** |
| Ekran kodu (`src/screens`) | ~47K | **49.026 satır** |
| ESLint hataları | 16+ | **0** |
| Testler (Jest) | 36/36 | **36/36 geçiyor** |
| Web derlemesi | — | **webpack başarıyla derleniyor** |
| Canlı site durumu | 200 OK | **200 OK, tarayıcıda doğrulandı** |

## Yeni Özellikler ve Yükseltmeler

### 1. AI Mock Generator (Faz 10)

Gemini API ile istenilen seviyede (P1–P4) sınırsız BUSEPT formatlı mock sınav üreten tam entegre sistem. Üretici prompt'ları resmi 2026 örnek sınav şablonuna göre yeniden yazıldı: Selective Listening kısa cevap tamamlama, Careful Listening not alma, Reading I inserted-sentence ve cross-text sorular, Reading II paragraf eşleştirme ve Writing 2 essay. Ekranlar: `AIMockGeneratorScreen` ve `AIMockExamScreen`; Home ekranında butonla erişim.

### 2. Resmi BUSEPT Simülasyon Modu (Faz 12)

`OfficialSimScreen` tüm bölümleri resmi sırayla (Selective → Careful Listening → Reading I/II → Writing) dizen, toplam zamanlayıcılı simülasyon modu. Sonuç raporu resmi puanlama politikasını yansıtır: 60/100 eşiği, S/F harf notu ve parçalı geçme (partial passing) takibi.

### 3. Gerçek Konuşma Puanlama (Faz 14)

`useSpeechRecognition` hook'u Web Speech API entegrasyonu ile canlı transcript yakalama, coverage skorlaması ve fluency (duraklama/tekrar) tahmini yapar. `AISpeakingPartnerScreen` üzerinde canlı coverage/fluency overlay kartı mevcuttur; konuşma süresi ölçümü ve 70%+ coverage hedefi göstergesi eklendi.

### 4. SRS Kelime Hafızası (Faz 15)

Zayıf kelimeler listesi SM-2 ilhamlı aralıklı tekrar algoritmasına bağlandı; `src/utils/srs.js` ([0, 1, 3, 7, 14, 30 gün] aralıkları) review sistemine otomatik senkronizasyon ile çalışır.

### 5. Reading + Listening Yükseltmeleri (Faz 14)

`AdvancedReadingScreen` tamamen yeniden yazıldı: 8 odak bazlı akademik paragraf, comprehension quiz bankası, WPM zamanlayıcı, kelimeye tıklayınca AI açıklama ve TTS hız seçici. `ListeningDetailScreen`'e Cornell Notes kalıcılığı (AsyncStorage), kelime coverage/progress bar'ları ve not kaydetme eklendi.

### 6. Grammar + Writing Yükseltmeleri (Faz 15)

`GrammarDrillScreen`: zayıf konulardan bias'lı (adapatif) 10 soruluk drill, artan zorluk ve Mistake Coach. `WritingEditorScreen`: 250 kelime hedefli progress bar ve kelime hedef ipucu.

### 7. Vocab + Speaking + Chatbot Yükseltmeleri (Faz 16)

`VocabScreen`'e **Word Lab** bölümü eklendi: hedef kelimeli Sentence Builder, AI doğrulamalı Context Check (anlam/gramer/akademik register skorlaması) ve 80+ puanlı cümleleri log'layan Lab Log. **AISpeakingPartner**'a Web Speech canlı puanlama entegre edildi. Chatbot'a **BUSEPT Score Predictor** eklendi: resmi ağırlıklar (Listening 25 / Reading 25 / Writing 40), 60 eşiği, S/F harf notu ve bölüm dengesizliği tavsiyesi.

### 8. Study Plan + Analytics + Gamification (Faz 17)

Tam rozet ve seri sistemi: 10 rozet (ilk mock, 60/90 kulüpleri, kusursuz quiz, 3/7/14 gün seri, Word Lab, kelime koleksiyonu, tüm bölümler), 10 seviyeli XP unvan sistemi (Novice → Polyglot Scholar). `AppState`'e `markActivityToday()` ile streak takibi bağlandı ve tüm pratik akışlarından (Reading/Listening/Grammar çözümü, mock sonuçları) tetiklenir. Home ekranında streak/badge kartı ve Analytics ekranında **SVG tabanlı 4 modül Skill Radar** (react-native-svg) eklendi.

### 9. Yeni İçerik Veri Setleri (Faz 18)

| Dosya | İçerik |
|---|---|
| `data/subtle_word_pairs.json` | 24 akademik çift (affect/effect, imply/infer vb.) — Reading II eşleştirme için |
| `data/writing_academic_phrases.json` | 5 kategorili 25 ifade — thesis, örnek, kontrast, neden-sonuç, sonuç |
| `data/listening_signpost_vocabulary.json` | 6 kategorili 30 kelime — ders işaretleyici (signpost) kelime rehberi |

Bu setler VocabScreen'in yeni **Subtle Pairs** ve **Writing Phrases** bölümleri ile ListeningDetailScreen'in Signpost Detector kartına (TTS oynatma ile) entegre edildi.

## Hata Düzeltmeleri

Oturum başında 16 ESLint hatası ve fonksiyonel çökme (ExamDetail, Feedback ve useTts ReferansError'ları) tespit edilip düzeltildi. Vocab modülündeki kötü özellikler onarıldı: preset boyut butonları input ile desenkronize kalıyordu (Faz 12), kolokasyon quiz havuzu boş kalabiliyor ve seçeneklerde doğru cevabın eksikliği/duplicate'i vardı — havuz mod ayırımı, duplicate önleme ve fallback unfiltered ile çözüldü. React Hook dependency hataları (OfficialSimScreen, VocabFlashcardScreen, GrammarDetailScreen, VocabScreen) exhaustive-deps kuralına uygun şekilde giderildi.

## Teknik Notlar

React Native + React Native Web mimarisi korundu; lazy require navigasyon kalıbı, AppState context, Gemini API entegrasyonu ve tema token'ları değiştirilmedi. pnpm bağımlılık kurulumu web webpack derlemesini bozduğu için npm kullanılmıştır. Deploy GitHub Actions üzerinden otomatik çalışır; canlı site her push'ta güncellenir.

## Demo Talimatları

Canlı uygulamada şu akışları denemenizi öneririm: Home → **AI Mock Generator** ile P3 seviyesinde tam mock üretip çözme; **Exams** → resmi simülasyon modu; **Speaking** → AI Speaking Partner'da mikrofon butonuyla canlı puanlama; **Vocab** → Word Lab ile cümle yazıp AI Context Check, ayrıca yeni Subtle Pairs ve Writing Phrases bölümleri; **Analytics** → çözüm yaptıktan sonra Skill Radar görünümü; **Chatbot** → "sınavı geçer miyim" sorusuyla score predictor.
