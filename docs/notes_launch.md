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

## E2E canlı test bulguları (2026-08-15)
Mevcut oturumlu kullanıcı Splash → Demo Dashboard'a doğrudan ulaştı (onboarded zaten true'du, demo path'i doğru çalışıyor). Splash sunset görseli + BÜ logo + "Boğaziçi Prep / PROFICIENCY STUDIO" canlıda çalışıyor. Fresh kullanıcı testi için: tarayıcıda localStorage'da @buept_onboarded_v1 ve @buept_auth_token silinip yeniden yüklenecek — yeni Onboarding vitrini görülmeli.

### Sorun: Fresh state'te bile Dashboard açılıyor
localStorage temizlendi (onboarded key'i yoktu bile — demek ki daha önce hiç kayıt yapılmamıştı ve varsayılan false olması gerekirdi; ama yine de Dashboard geldi). Teşhis: Splash, userToken set olduğu için MainTabs'a gidiyor olabilir MI? Hayır — localStorage temizlendi, userToken de null olmalı. Ama ekranda "Demo mode / Guest Student" yazıyor → eski demo oturumu hâlâ context'e yükleniyor olabilir (AppState init sırasında demo verisi restore ediliyor: STORAGE_DEMO_SEEDED veya userProfile v1'i silmedim mi? Silindi: @buept_user_profile_v1 silindi... ama ekranda demo görünüyor. Muhtemelen uygulama demo data'yı otomatik uygular (applyDemoData bir yerden tetikleniyor) ya da localStorage'da başka bir demo key var. KONSOL: localStorage key listesinde @buept_smoke_report_v1 vardı ama user profile yoktu. Yine de dashboard "Demo mode" gösteriyor → Splash sonrası HomeScreen demo profile create ediyor olabilir (isDemoUser başka kaynaktan). Bu aslında launch-blocking DEĞİL; asıl kontrol: onboarded=false iken (localStorage'da @buept_onboarded_v1 yokken) Splash → Onboarding gitmeli. Ekranda Dashboard geldiğine göre Splash onboarding'i atladı → onboardedRef init'te false, userToken null ise 'Onboarding' olması gerek. Ama dashboard geldi! Splash, token null iken bile Login'i atlayıp Dashboard'a gidiyor — yani kullanıcı daha önce login olmuş ve token HÂLÂ bir yerde tutuluyor (örn. userWords storage veya başka key). KONTROL EDİLECEK: Splash'ta authReadyRef tamamlanmadan önce default route ne? navigation.reset ile 'Login' olmalı. Belki tarayıcıdaki eski state (react-native-web web storage) asyncStorage key farklı adla saklıyor: @buept_auth_token yerine 'buept_auth_token' olabilir.

### Teşhis güncelleme (2. adım)
localStorage tamamen temizlendi (auth_token ve user_profile bile kalmadı), ama ekranda "Guest Student / Demo mode" dashboard geldi. İki ihtimal: (1) Canlıdaki bundle eski — deploy henüz yeni commit'i içermiyor. (2) Uygulama, token null olsa bile bir yerde demo data'yı otomatik seed ediyor (HomeScreen veya AppState init'te applyDemoData tetikleniyor olabilir — userWords storage 'user_words_v1' hala dolu çünkü clear'den önce kalmıştı; hayır clear yapıldı sonra). Asıl ihtimal (1): push 74408f0 → deploy ~3 dk, benim curl 200 aldım ama build cache'li eski bundle olabilir. KONTROL: dist bundle'ının hash'ini kontrol et.

### Teşhis (3. adım): Bundle içeriği
app.73810aa7.js'de @buept_onboarded_v1 sabiti VAR (AppState kısmı), ama 'Onboarding' ekran string'i bulunamadı (minification — ekran adı silinmiş olabilir, lazy require()). Bundle'ın yeni kodu içerdiğinden eminim. O halde sorun başka: live sayfada Dashboard direkt açıldı, yani Splash 'MainTabs' seçti → userToken set edilmiş olmalı. Nereden? Muhtemelen SplashScreen'de authReadyRef gecikmesinde bir race: JEST_WORKER_ID kontrolü web'de false; finishNavigation çalışıyor. Ama dest hesaplaması doğru olmalı. KALAN İHTİMAL: HomeScreen init'te bir demo auto-login — veya daha önceden kalmış oturum: localStorage clear'den SONRA sayfa yenilendiğinde bile "Guest Student/Demo mode" geldi. Guest Student, demo@buept.app → DEMO LOGIN otomatik çalışıyor. Hangi ekran auto demo login yapıyor? Belki RootNavigator'da bir auth guard veya TabNavigator'da bir fallback... Ya da SplashAnimationScreen web'de 120ms sonra navigation.reset yapıyor ama bu sırada userTokenRef null. Reset 'Login' olmalı. LoginScreen açılınca kullanıcı otomatik demo'ya atanıyor olabilir mi — hayır, user interaction gerekir. SONRAKİ ADIM: Canlı sayfayı hard reload ile aç, hangi ekranın render olduğunu ve state'i kontrol et (console exec ile navigation state).

### Kesin teşhis (4. adım)
localStorage tamamen temiz olmasına rağmen sayfa yenilenince token=demo_student ve profile=Guest Student otomatik geri geldi. Bu, uygulamanın bir yerinde DEMO AUTO-SEED mantığı olduğunu kesinleştiriyor — splash/home init'te token yoksa demo profile oluşturuluyor. LAUNCH'A UYGUN: Bu aslında bilerek yapılmış olabilir (friction-free demo). Ama onboarded=0 iken kullanıcıyı onboarding'e götürmemiz gerekiyor; onboarding'de 'Skip' zaten setOnboarded(true) yapıyor. Sorun: demo auto-seed, onboarded false bile olsa token set ediyor → Splash 'MainTabs' açıyor. ÇÖZÜM: auto-seed yapan yeri bulup, onboarded=false ise onboarding'e yönlendirecek şekilde veya auto-seed'i sadece 'Open Demo Hub' aksiyonuna bağlayacak şekilde değiştirmek. Yer tespiti: muhtemelen HomeScreen veya bir auth guard'da applyDemoData + setUserToken çağrısı.

## Kök neden bulundu (web-rnw/index.web.js)
Web entry point, localStorage'da token yoksa otomatik demo_student profili seed'liyordu — fresh kullanıcı onboarding'i hiç görmeden Dashboard'a ulaşıyordu. DÜZELTME: index.web.js bootstrap'a ONBOARDED_KEY='0' ekle (ilk çalıştırmada) → Splash onboardedRef=false görünce 'Onboarding' açar. Skip sonrası setOnboarded(true) '1' yazar, sonraki açılışlarda Login/Dashboard'a gider.

## E2E canlı test (fresh state)
Yeni onboarding akışı ve SEO katmanı canlıda çalışıyor. Ancak temiz localStorage ile bile uygulamanın otomatik demo oturumu açtığı tespit edildi; fresh kullanıcı doğrudan Dashboard görüyor, onboarding ekranına uğramıyor. Bu davranışın kaynağı bulunup ilk girişte onboarding'e yönlendirme sağlanmalı. Bundle sürümü: app.73810aa7.js.
