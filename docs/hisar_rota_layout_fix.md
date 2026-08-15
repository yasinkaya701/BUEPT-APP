# Hisar Rotası canlı görsel sorunları (düzeltilecek)

Canlı test (bundle 35ec8694) ekran açıldı, crash yok. Görsel sorunlar:
1. Tüm durak işaretçileri aynı noktada (sol, %50 hizasında) yığılmış — index'e göre vertical dağılım yok. markerWrap `top: '50%'` sabit; her durak için farklı top %'si olmalı (6 durak: ~%90 (bebek), %74, %58, %42, %26, %10 (hisar)).
2. Patika SVG sağ tarafa kaymış — preserveAspectRatio none + path M160 koordinatları viewBox uyumsuz olabilir; ayrıca duraklar patikaya hizalı olmalı.
3. Hero'da üstte karanlık bant (ImageBackground hero padding üstte 44px web'de) — hero iç başlık üstte sıkışmış, back butonla çakışma var (heroHeadRow paddingTop düzeltilmeli).
4. mapHead'de harita ikonu görünmüyor (Ionicons name="map" render ediliyor ama küçük olabilir — kontrol et).
5. Görev kartı başlık ikonu "?" gösteriyor — MaterialCommunityIcons 'cafe' web font'unda eksik olabilir (font dosyası yüklü mü kontrol).
