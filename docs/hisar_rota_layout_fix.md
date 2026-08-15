# Hisar Rota canlı test v3 — kalan sorunlar

1. **Hero metin çakışması**: Hero alt bandında başlık + açıklama fotoğrafın koyu olmayan bölgesinde kalıyor. HeroOverlay'in alt kısmına gradient eklemek gerekiyor (bottom'dan koyu degrade).
2. **Marker hizalama patika ile uyuşmuyor**: Marker'lar sabit sol sütunda, patika sağa doğru kıvrılıyor. Patikanın x konumunu her y seviyesinde bilmek gerekiyor ya da daha basit: patikayı daralt (merkezde tut) ve marker'ları iki tarafa; veya marker'ları patikanın kendi koordinatlarına oturt.
   - Basit çözüm: PathSvg viewBox 200x400 kıvrımlı bir yol; marker y seviyeleri path'in M koordinatlarına uydurulmalı. Patika x'i her y'de ~%50 civarında salınım yapıyor; markerWrap'ları left:'50%' yapıp translateX(-50%) ile merkeze, etiketler dışa.
3. **Sağdaki marker'ların etiketleri taşma/kesilme**: markerRowRight kullanıyor ama ekran daralınca kesiliyor; label'a max-width ve ellipsis yok. Aşağı kaydırınca görünüyor olabilir ama güvenliği max-width.
4. **Patikanın sağa kayması**: preserveAspectRatio="none" + viewBox uyumsuz — Patika'nın başı sol-üst, sonu sol-alt olmalı.

Plan: Patika'yı dikey merkezli yap (viewBox 320x560, path M 160 540 kıvrımlı yukarı), marker'ları centerX='50%' ile hizala, etiketler index'e göre sola/sağa 8px + max-width 130px. Hero'ya alt gradient + metin altına padding-bottom.
