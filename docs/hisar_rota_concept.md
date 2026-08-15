# Hisar Rotası — Tasarımcı Konsepti (rev2)

## Kullanıcı geri bildirimi
1. İlk mockup'lar (AI görsel) "AI slop" — beğenilmedi. → Gerçek kodla çalışmak şart.
2. İkinci tur Boğaziçi odaklı mockup'lar yine beğenilmedi: "daha fazla Boğaziçi'ne has şeyler kullan, tasarımcı gibi düşün, özgür ruhlu ol."

## Mevcut durum (rev2)
- HisarRotaScreen.js yazıldı, ESLint temiz, jest 36/36 geçti, RootNavigator'a route eklendi ('HisarRota'), HomeScreen planningTools'a 'Hisar Rotası' girişi eklendi.
- Rev1 konsepti: alacakaranlık kampüs fotosu + koyu navy panel + gauge + haftalık timeline — "generic" bulundu.

## Görsel analiz (kampüs fotoğraflarından)
- real_north_campus.jpg: turkuaz Boğaz, kırmızı kiremit çatılar, koyu yeşil servi/meşe, taş duvarlar, merdivenli patika, güneşli açık mavi gökyüzü.
- real_south_gate.jpg: günbatımı, Boğaziçi Köprüsü ışıklı, sarı taş binalar, portakal-mor gökyüzü.
- Renk paleti: Boğaz turkuazı (#1B8FA8/#2FA4B8), kiremit kırmızısı (#B3541E/#C1541E), servi yeşili (#2E5943), taş bej (#E8DCC3), günbatımı amber (#E8A33D).

## Rev2 konsepti: "Kampüs Patikası" (Hisar Tepesi'nden aşağı)
- Ekran bir kampüs haritası: dikey patika (winding path SVG) Hisar tepesinden sahile (Boğaz) iner.
- Duraklar kampüs yerleri: Hisar (tepe/sınav hedefi), Güney Kampüs, Martı Çay Bahçesi, Deniz Kampüsü, Bebek İskelesi...
- Her durak bir haftanın görevlerini barındırır (tıklanınca kart açılır).
- Zemin rengi: açık bej/kağıt (#FAF6EE) — kampüs kağıt haritası hissi, koyu navy yerine.
- Vurgular: kiremit (#B3541E) aktif durak, servi yeşili tamamlanan, Boğaz turkuazı aksan.
- Alt kenarda ince Boğaz şeridi (turkuaz gradient + vapur silueti).
- "Hisar'a çık" metaforu: sınav BUSEPT = Hisar tepesi; ilerledikçe patikada yukarı tırman.
- Kartlar kağıt dokulu, hafif eğik, mühür/rozet stili.

## Teknik notlar
- Tema token'ları: src/theme/tokens.js (Midnight Sapphire) — rev2'de rev1'de kullanılan token'lar üzerine kağıt paleti lokal olarak tanımlandı.
- Bileşenler: Card (src/components/Card.js), Button (label prop), Screen, Ionicons, ImageBackground.
- Storage API: loadReadingHistory/loadListeningHistory/loadGrammarHistory/loadMockHistory (src/utils/appStorage.js); calculateXpForAction (gamification.js).
- AppState: {level, ...} — useAppState hook.
- Mevcut ekran kodu: src/screens/HisarRotaScreen.js (rev1 — rev2'de yeniden yazılacak).
