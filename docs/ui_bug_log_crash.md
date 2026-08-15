# BUG-22: HisarRota crash — (n || []).forEach is not a function

Canlıda (bundle bff1426f) Hisar Rotası açılınca runtime crash: "(n || []).forEach is not a function".
Teşhis: stats memo'sunda `Object.values(histories)` döngüsü içinde `list.forEach` — liste array değil (örn. storage'da {readingHistory: [...]} veya başka format dönmüş). Ayrıca stopStates marker state'lerinde problem yok.
Fix: histories değerlerini Array.isArray guard'ı ile al; loadHistory formatlarını kontrol et.
Durum: fix uygulanacak, sonra canlıda doğrulanacak.
