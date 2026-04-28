# BUEPT-APP

Bu uygulama, Boğaziçi Üniversitesi İngilizce Yeterlilik Sınavı'na (BUEPT) hazırlanan öğrenciler için geliştirilmiş React Native tabanlı bir mobil uygulamadır.

## Calistirma

```bash
npm install
npm start
```

Yeni bir terminalde:

```bash
npm run android
# veya
npm run ios
```

## Web (React Native Web, 1:1 UI)

Gelisim:

```bash
npm run web:rnw:start
```

Production bundle:

```bash
npm run web:rnw:build
```

Yerel AI + web (tek komut):

```bash
./scripts/start-web-local-ai.sh
```

## Yapay Zeka (AI) Konfigürasyonu (Bulut ve Yerel)

BUEPT-APP, hem bulut tabanlı API sağlayıcılarıyla (OpenAI, Gemini) hem de tamamen yerel (çevrimdışı ve ücretsiz) olarak cihazınızda çalışan yapay zeka modelleriyle (Ollama) entegre çalışabilir. Mistake Koçu (Mistake Coach), Konuşma (Speaking) Geribildirimi ve Chatbot tamamen bu altyapıyı kullanır.

**Ayarlar Menüsünden Yapılandırma:**
1. Uygulama içerisinden "Settings" veya "AI Config" paneline gidin.
2. Sağlayıcı (Provider) Seçimi:
   - **OpenAI veya Gemini:** Kendi API anahtarınızı (BYOK - Bring Your Own Key) girin. Bu istekler proxy üzerinden güvenle iletilir.
   - **Ollama (Local AI):** Cihazınızda çalışan Ollama URL'sini (varsayılan: `http://localhost:11434`) ve Model ismini (örn: `llama3.2:1b`) girin.

**Ollama (Yerel Yapay Zeka) Kullanımı:**
1. Bilgisayarınıza [Ollama](https://ollama.com/) kurun.
2. Terminali açıp modeli indirin ve çalıştırın:
   ```bash
   ollama run llama3.2:1b
   ```
3. BUEPT-APP üzerinden Ollama seçeneğini aktifleştirdiğinizde, tüm Chatbot ve Mistake Coach istekleri doğrudan yerel sunucunuza iletilir. İnternet bağlantısı gerektirmez ve hiçbir veri dışarı çıkmaz.
