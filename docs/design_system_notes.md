# Tasarım Sistemi Notları — Hisar Rotası Ekranı İnşası (16 Aug 2026)

## Görev
Beğenilen mockup konseptini (mockup_boun_rota.png — Hisar Rotası Kişisel Koç) gerçek kod ekranı olarak inşa etmek. Kullanıcı "AI slop" görselleri beğenmedi; kodda yaşayan gerçek ekran istiyor.

## Tema ölçümleri (src/theme/tokens.js — "Midnight Sapphire")
- colors: primary #1D4ED8, primaryDark #1E3A8A, primaryLight #EFF6FF, primarySoft #DBEAFE, primaryDeeper #172554, primaryUltraLight #F0F5FF
- accentGold #D97706, accentBright #F59E0B, teal #0D9488
- text #0F172A, textSecondary #334155, muted #64748B, textOnDark #F1F5F9, textOnDarkMuted rgba(241,245,249,0.72)
- surface #FFFFFF, surfaceAlt #F1F5FB, border #E2E8F0, divider rgba(0,0,0,0.06)
- semantic: error #DC2626, success #059669, warning #D97706
- bands: E #10B981, VG #059669, MA #2563EB, A #3B82F6, D #F59E0B, NA #EF4444, FBA #DC2626, INS #991B1B
- typography: Avenir Next, h1 28 / h2 21 / h3 17 / body 15 / small 13 / xsmall 11
- spacing: xs 4 / sm 8 / md 14 / lg 20 / xl 28 / xxl 42
- radius: sm 10 / md 14 / lg 18 / xl 24 / pill 9999
- shadow: slight/sm/md/lg/elev1/elev2/glow/accentGlow/premium (shadowColor #1E3A8A / #172554)
- motion: quick 140 / normal 220 / slow 320

## Bileşen API'leri
- Card ({children, style, glow, compact}): backgroundColor colors.surface, borderRadius radius.xl (24), padding spacing.md+2, border 1px colors.border, marginBottom spacing.md, top 3px tint rgba(29,78,216,0.16), shadow.sm
- Screen ({scroll, contentStyle...}): contentWeb {maxWidth 1280, paddingHorizontal spacing.lg, backgroundColor colors.bg}
- Button (src/components/Button.js) — mevcut

## Navigasyon
- TabNavigator (Home, Reading, Grammar, Writing, Vocab, Listening, Speaking, Settings) + RootNavigator stack'inde lazy-loaded ekranlar (require('../screens/X').default).
- Yeni ekran: HisarRotaScreen.js → RootNavigator'a `<Stack.Screen name="HisarRota" getComponent={() => require('../screens/HisarRotaScreen').default} options={{title:'Hisar Rotası'}} />` eklenecek.
- Ana sayfa Quick Actions'tan 'Kampüs Koçu' veya Calendar'dan erişim verilebilir.

## Mockup içeriği (mockup_boun_rota.png referansı)
- Alacakaranlık Güney Kampüs fotoğrafı arka plan (assets/images/real_south_gate.jpg) + %85 koyu navy overlay
- Hedef kartı: 'Hedefin: BUSEPT Geç — P3 (B2)', 'Sınav: 2 Haziran 2026 • 47 gün kaldı', %71 geçme olasılığı gauge (yeşil/amber)
- 47 Günlük Hisar Rota Planı: W1 %100 ✓, W2 amber 'Buradasın — %78', W3-W6 outlined
- Bu Haftanın Görevleri checklist + Kampüs Koçu önerileri (zayıf alan drill, Mock Exam unlock, Sözlük SRS)
- Alt bar: 'Sonraki oturum 3 saat sonra' + 'Şimdi Başla'

## Veri kaynakları
- appStorage.js ile localStorage persistence; state persistence helpers: src/utils/storage.js + appStorage
- Mock/history verileri: src/utils/mistakeCoach.js, gamification.js, srs.js — zayıf alan hesaplaması için kullanılabilir
