# Launch Gap Analizi (2026-08-16)

## Mevcut durum
- 97 ekran, login flow çalışır durumda, canlı GitHub Pages'da 200 OK.
- ESLint 0 error, 36/36 test, prod build OK, SEO/AEO katmanı canlıda.
- Dört ana sekme (Vocab, Listening, Writing, Speaking) yeni tasarım sistemiyle güncellendi.

## Tespit edilen launch gap'leri
1. **Onboarding ekranı zayıf**: Sadece level seçimi + düz liste; launch kalitesinde değil. Hero yok, özellik vitrini yok, value proposition yok. "What You'll Get" kısmı 3 satırlık sade liste; 97 ekranlık bir ürünün ilk izlenimi için yetersiz.
2. **Ondboarding tek renkli, markasız**: LogoMark küçük, campus görseli yok, Boğaziçi kimliği (campus fotoğrafı, renk derinliği) giriş ekranına yansımıyor.
3. **Onboarding sonrası akış**: PlacementTest'e direkt atıyor — iyi, ama onboarding'in kendisi ikna edici değil.
4. **LoginScreen**: Kontrol edilecek (branding, empty state).
5. **Footer/branding**: Uygulama içi alt bölümlerde BUEPT-APP markası sürümü yok.
6. **Hata/boş durumlar**: Uçtan uca tarama gerekli (demo student, yeni kullanıcı).

## Kritik bulgu (routing)
- Onboarding stack'te kayıtlı ama Splash → (userToken ? MainTabs : Login) diyor; Onboarding hiç tetiklenmiyor. Yani kullanıcılar hiç onboarding görmüyor. Launch'ta Splash'tan sonra (yeni kullanıcılar için) Onboarding gösterilmeli — Signup veya Login'den sonra ilk girişte tetiklenebilir. Pratik çözüm: Splash'ta token yoksa Login → sonra Onboarding akışı; veya Login sonrası yeni kullanıcı flag'i ile. En basit launch çözümü: Signup sonrası + demo dahil ilk girişte Onboarding göster (AppContext'e onboarded flag eklemek yerine, AsyncStorage onboarded kontrolü Login sonrası replace).
- SignupScreen var, kontrol edilecek.

## Planlanan launch çalışmaları
- OnboardingScreen'i launch-level hero vitrine çevir: campus arka planı, büyük marka bloğu, 3 özellik vitrin kartı (Real BUSEPT Format, WASC Essay Bank + AI Evaluation, Sınırsız Mock), level seçimi, placement CTA.
- LoginScreen kontrolü + branding.
- Onboarding + login boş/hata state'leri.
- Uçtan uca tarayıcı testi (home, 4 sekme, login, onboarding).
- Push + canlı doğrulama.

## İlerleme (faz 2)
- OnboardingScreen.js TAMAMEN yeniden yazıldı: ImageBackground (real_south_gate.jpg) + koyu overlay, hero badge (LogoMark + Bosphorus-Ready), 3 showcase kartı (Official BUSEPT Format / WASC-Scored Essay Bank / Adaptive Daily Plan), level chip seçimi (P1-P4 etiketli), Placement CTA + "Skip and go to Dashboard". Skip'te setOnboarded(true) çağrılıyor ve MainTabs'a replace ediyor.
- AppState.js'e onboarded flag eklendi: STORAGE_ONBOARDED='@buept_onboarded_v1', state+useEffect yükleme, setOnboarded useCallback (AsyncStorage persist), value export'ta onboarded/setOnboarded, dependency listesine onboarded eklendi.
- YAPILACAK: SplashAnimationScreen'de (satır 44 civarı `const dest = userTokenRef.current ? 'MainTabs' : 'Login';`) onboarded=true ise 'Onboarding' yönlendirmesi. Demo dahil kullanıcılar için Login sonrası demo path'te de onboarded true yapılmayabilir; en güvenlisi Splash'ta onboarded=false ise Login yerine Onboarding göster.
- Sonraki: ESLint+tum testler+build, push main, canlı doğrulama (login akışı sıfırlı fresh state ile: localStorage temizleyip siteyi yeniden aç).
- Live doğrulama URL: https://yasinkaya701.github.io/BUEPT-APP/ — deploy ~2-3 dk sürüyor.
- Build komutu: npm run web:rnw:build; test: npx jest --silent; lint: npx eslint src/ scripts/
