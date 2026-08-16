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

## Canlı doğrulama (push sonrası)
- Commit 91a0680 → CI "Deploy BUEPT Web" success → canlıda https://yasinkaya701.github.io/BUEPT-APP/ kontrol edildi.
- Home: Sidebar + kartlar + Today Board metrikler render OK. Konsol hatası YOK.
- Vocab: PageTransition entegre, 28046 entries, Flashcard ekosistem, tool grid render OK. Konsol hatası YOK.
- ESLint: 0 errors / 185 warnings (inline style'lar, genel tarz). Jest: 36/36 pass. Prod build: OK.
- Sıradaki faz: Mobil (Android APK + iOS) doğrulaması.

## Faz 3: Android build durumu (23:45 civarı)
- Ortam: sandbox Ubuntu 24.04, 3.8GB RAM + 4GB swap eklendi, Java 21 JDK (javac kuruldu), Android SDK kuruldu /opt/android-sdk (platform 34,35,36, NDK 27.1.12297006, platform-tools).
- Gradle wrapper 9.0 → IBM_SEMERU/JvmVendorSpec uyumsuzluğu nedeniyle 8.14.3'e düşürüldü (gradle/wrapper/gradle-wrapper.properties).
- android/build.gradle: kotlinVersion 2.1.20 → 2.2.21.
- android/gradle.properties eklenen satırlar: org.gradle.jvmargs=-Xmx1536m -XX:MaxMetaspaceSize=384m -XX:+HeapDumpOnOutOfMemoryError -XX:+UseSerialGC; org.gradle.daemon=false
- app/build.gradle: abiFilters "arm64-v8a", "armeabi-v7a" eklendi (buildCMake x86 OOM'leri vardı; logda hâlâ 4 ABI görünüyor ama build 179 task'a kadar ilerledi).
- Build hata 1 (çözüldü): androidx versionedparcelable duplikasyonu — kaynak: node_modules/@react-native-voice/voice/android/build.gradle'de com.android.support:appcompat-v7:28.0.0 → androidx.appcompat:appcompat:1.6.1 ile değiştirildi.
- Şimdi yeniden ./gradlew assembleRelease deneniyor: cd /home/ubuntu/BUEPT-APP/android && export ANDROID_HOME=/opt/android-sdk && export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 && ./gradlew assembleRelease --no-daemon
- Not: Bu node_modules değişikliği patch ile kaydedilmeli (veya git'e node_modules eklenmez; kalıcı çözüm olarak android/app/build.gradle'de resolutionStrategy force + jetifier kapatma veya patches klasörüne eklemek daha iyi). Patch-File veya postinstall scripti düşünülebilir.
- Web fazı tamamdı: commit 91a0680 main'e pushlandı, CI success, canlı doğrulandı (Home + Vocab, 0 console error).

## Android build ilerlemesi (güncel)
Çalışan komut kalıbı: `cd /home/ubuntu/BUEPT-APP/android && export ANDROID_HOME=/opt/android-sdk && export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 && nohup ./gradlew assembleRelease -x lintVitalRelease --no-daemon > /tmp/gradle_buildNN.log 2>&1 &`
Düzeltmeler: (1) gradle-wrapper 8.14.3; (2) kotlinVersion 2.2.21; (3) gradle.properties: jvmargs=-Xmx1536m -XX:MaxMetaspaceSize=384m -XX:+HeapDumpOnOutOfMemoryError -XX:+UseSerialGC + org.gradle.daemon=false; (4) app/build.gradle abiFilters arm64-v8a+armeabi-v7a; (5) node_modules/@react-native-voice/voice/android/build.gradle: com.android.support:appcompat-v7:28.0.0 → androidx.appcompat:appcompat:1.6.1 (3.8GB RAM sandbox, 4GB swap /swapfile2 eklendi); (6) lint task'ları OOM veriyor → -x lintVitalRelease ile atlanıyor.
Build10/11: 317 task up-to-date gösterdi; lintVitalRelease input-file hatası → -x lintVitalRelease ile build12 başlatıldı. Log: /tmp/gradle_build12.log. Hedef: app/build/outputs/apk/release/app-release.apk oluşması.
Sonraki adım: APK oluşursa doğrula (aapt/adb yok, unzip ile kontrol yeterli) → GitHub'a yükleyip kullanıcıya ver. Ardından iOS kısmı (ios/ klasörü var, CocoaPods kur; sandbox macOS değil → iOS build yapılamaz, sadece pod install + metadata doğrulama yapıp kullanıcıya bildirme durumu netleşmeli).
