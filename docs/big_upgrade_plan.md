# BUEPT-APP — Büyük Ölçekli Upgrade Planı (40K+ satır hedefi)

## Mevcut durum (faz 13 ölçümü)
- Toplam veri (data/*.json): ~1.35M satır (büyük soru bankaları zaten var)
- src kod: ~66.7K satır / screens: 88 ekran (~47K satır)
- `src/` hedefi: 40K satıra **yakınlaşmak yerine, mevcut özellik kalitesini derinleştirmek** + yeni ekranlar + AI içeriği
- Kullanıcı isteği: "eldeki tüm özelliklere upgrade çak", temel kararları değiştirme, her şeyi doğrula

## Kurallar (kullanıcıdan)
- Temel mimari kararları değiştirme (navigation, storage, theme, runtimeApi BYOK kalıbı)
- Her commit: `npx eslint src` = 0 error, `npx jest` = geçiyor, `npm run web:rnw:build:root` = başarılı
- main'e doğrudan push, canlıya deploy

## Upgrade fazları
1. **Reading + Listening** (faz 14): AdvancedReading genişletme, Listening Detail'e note-taking + speed control + transcript highlight, reading_tasks.json'a yeni passage setleri (AI ile üret)
2. **Grammar + Writing** (faz 15): GrammarScreen'e adaptive drill + error pattern tracker, WritingEditor'e AI rewriting suggestions + phrase bank + paraphrase studio
3. **Vocab + Speaking + Chatbot** (faz 16): Vocab kelime ağı/word family modülü, Speaking'e AI telaffuz karşılaştırma (Gemini), Chatbot'a BUSEPT-specific tool'lar (score predictor, study advisor)
4. **Study Plan + Analytics + Gamification** (faz 17): Analytics'e radar chart + weekly trend, Study Plan'e streak + goal engine, XP/badge sistemi
5. **İçerik üretimi** (faz 18): reading_tasks.json + speaking_prompts.json + vocabulary JSON'larına Gemini ile yeni setler ekle
6. **Doğrulama + deploy** (faz 19): full lint/test/build + push + GH Pages check

## Teknik kalıplar
- Yeni utility: `src/utils/` altına modül bazlı (upgradeReading.js vb.)
- Yeni ekranlar RootNavigator'a lazy require ile, HomeScreen'e buton
- AI üretim: `src/utils/aiMockGenerator.js` kalıbını takip et (runtimeApi fetchDirectGeminiChat + validator)
- Stil: mevcut token'lar (colors, spacing, typography, shadow), Card/Button/Screen component'ları
