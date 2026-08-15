# BUEPT-APP Bug Findings (2026-08-15)

## Ortam
- Node v22.13.0, npm install OK
- Jest: 36 test passed (3 suites)
- ESLint src: 153 problems (16 errors, 137 warnings)

## FONKSİYONEL BUGLAR (kullanıcıya yansıyan)

### F1. ExamDetailScreen.js:124 — ReferenceError: genericExplain tanımsız
- `active.explain || genericExplain` ifadesi, açıklaması olmayan sorularda ekranı çökertebilir (ReferenceError).
- Düzeltme: tanım yoksa güvenli fallback kullan.

### F2. FeedbackScreen.js:1000 — ReferenceError: saveParaphraseWords tanımsız
- "Save Paraphrase Bank" butonu tanımsız fonksiyona bağlı → butona basınca çökme.
- Düzeltme: saveWeakWords benzeri bir saveParaphraseWords fonksiyonu tanımla veya ilgili UI'ı kaldır.

### F3. VideoLessonPlayerScreen.js:195 — ReferenceError: useEffect tanımsız
- import React, { useMemo, useRef, useState } — useEffect eksik, web senkronizasyon useEffect'i çalışmaz → web'de video süresi/oynatma senkronu bozuk.
- Düzeltme: useEffect'i import'a ekle.

### F4. useTts.js:438/443 — setRateState ve setActiveVoiceIdState tanımsız
- setRate ve setVoiceId helper fonksiyonları tanımsız setter'lara bağlı → TTS hız/ses seçim ayarı web'de çökme veya sessiz hata.
- Düzeltme: tanımsız değişkenleri kaldır/doğru setter'larla düzelt.

### F5. useTts.js:340 — Audio undefined (web)
- new Audio(url) web ortamında çalışır ama global tanımlı değil; SSR/safe-güvenlik için korunmalı. Fonksiyonel risk düşük ama hata sınıfında.
- Düzeltme: typeof window !== 'undefined' ? new Audio : fallback.

## KALİTE BUGLARI (hook deps, gölgeleme, kullanılmayan)

| Dosya | Satır | Sorun |
|---|---|---|
| src/context/AppState.js | 1003 | useCallback eksik dep: 'level' (aslında essayText/addXp/userProfile — dep dizisi yanlış) |
| src/hooks/useTts.js | 315, 388 | useEffect/useCallback eksik dep'ler |
| src/screens/ChatbotScreen.js | 731, 869 | useCallback eksik dep: width, webAccess |
| src/screens/GenericHistoryScreen.js | 120 | useMemo eksik dep: config |
| src/screens/ListeningScreen.js | 296 | useMemo gereksiz dep: tasks (dış scope modül değişkeni) |
| src/screens/WritingEditorScreen.js | 215 | useEffect eksik dep: text |
| src/screens/DeveloperScreen.js | 113 | AbortSignal.timeout polyfill ihtiyacı (eski web tarayıcıları) |
| src/utils/mistakeCoach.js | 182 | no-shadow: timeout |
| src/utils/rubricScoring.js | 452 | no-shadow: academicCount |
| Çeşitli | — | 137 warning: no-unused-vars |

## Web build doğrulama: yapılmadı (sonraki adım)
