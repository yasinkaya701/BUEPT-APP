# Web Motion / Premium UI Upgrade Planı

## Envanter (mevcut)
- `src/components/Screen.js`: tek ortak animasyon bileşeni — fade+translate (animate=true opsiyonel, default false). motion.normal token'ı kullanıyor.
- SplashAnimationScreen: zengin Animated sequence (web'de 120ms instant skip).
- TabNavigator web-desktop: `animation: 'none'` → tab geçişleri animasyonsuz; WebSidebarTabBar statik.
- Çoğu ekran Screen.js'i animate=false kullanıyor.
- Android/iOS: native react-native projesi (android/ ve ios/ klasörleri var, package.json'da react-native run-android/run-ios scriptleri; Expo yok, bare RN).

## Plan: Web Motion Katmanı
1. `tokens.js` — motion token'larını genişlet: fast (120), normal (240), slow (400), spring (friction), stagger delay'ler.
2. `components/ui/PageTransition.js` — yeni ortak wrapper: web'de fade+rise (240ms cubic), içerideki `MotionGroup` (stagger children animation, scale 0.96→1, translateY 12→0, opacity 0→1, 60ms stagger). native'de mevcut Screen animasyonunu koru.
3. `components/ui/MotionGroup.js` + `components/ui/MotionItem.js` — kart/row'lar için: hover'da scale+lift (web), girişte stagger.
4. `components/ui/MetricTile.js` / `ScoreRing.js` — sayı count-up animasyonu + ring dolum animasyonu (web'de aktif).
5. Tab bar web-desktop: aktif sekmede indicator slide animasyonu (animatedValue), ikon bounce on focus.
6. Screen.js animate default'u false kalsın; ana 4 sekme + Home'da PageTransition wrapper'ı ekle.
7. Buton: hover/press micro-feedback (web) — press scale 0.97.

## Mobil (faz 2)
- Bare RN; Expo CLI yok. Plan: Expo EAS için `eas.json` + `app.config.js` veya mevcut android/ios native build'i doğrula. Yayın seviyesi: splash/icon/assets doğrula, `./gradlew assembleRelease` APK build testi, iOS Pod install doğrulaması.

## İlerleme (faz 2)
- ✅ tokens.js: motion.ultra (90), pageIn (340), stagger (55), overshoot (5) eklendi
- ✅ src/components/ui/PageTransition.js, MotionGroup.js, MotionCard.js, CountUp.js oluşturuldu
- ✅ ui/index.js'e export edildi
- ✅ MetricRail.MetricTile değeri CountUp ile animasyonlu
- ✅ 5 ana ekrana PageTransition import + sarma: HomeScreen, VocabScreen, ListeningScreen, WritingScreen, SpeakingScreen
- ⬜ Sıradaki: WebSidebarTabBar'a aktif sekme indicator slide animasyonu + ikon bounce (TabNavigator.js — WebSidebarTabBar buraya bak: src/navigation/TabNavigator.js içinde tanımlı)
- ⬜ Button'a web hover/press scale (src/components/Button.js — Pressable pressed style zaten var: styles.pressed)
- ⬜ ESLint + jest + prod build → commit → push main → canlıda doğrula
- Not: MotionCard henüz ekranda kullanılmadı; istenirse HomeScreen launchCard'lara eklenebilir (opsiyonel, basit tut).
- Faz 3: Mobil — bare RN projesi (android/ ios/ klasörleri var). Plan: gradlew assembleRelease APK doğrula, Pod install doğrula, icon/splash asset kontrol, eğer Expo EAS gerekiyorsa app.json→app.config.js. Deploy zaten GitHub Pages'te.
