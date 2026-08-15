# Planning & Exams kartları yeniden tasarım — konsept

## Mevcut durum analizi (HomeScreen.js, Control Center kartı)
- planningTools dizisi (satır ~206): placement / study-plan / analytics / exams
- Render: tek `controlPanel` (satır ~426) içinde 4 adet `Button` (variant secondary; exams primary) tek satırda `bouRow` — buton çorbası, hiçbir kartta içerik/istatistik yok.
- Sorun: buton listesi ≠ kart tasarımı. Magoosh/ETS standardında bu bölümler canlı veri kartı olur.

## Yeni konsept: "Mission Grid" — her araç bağımsız içerikli mini-kart
planningTools dizisi genişletilecek: her öğe { key, label, route, icon, tone, surface, accent?, meta? }
Render: controlGridWide içinde 4 ayrı kart (launchCard kalıbı gibi ama daha zengin):
- Her kartta: ikon rozeti + başlık + kısa açıklama + CANLI METRİK (ör: Exams → "Last Mock: --" veya mockHistory'den overall; Analytics → composite score; Study Plan → plan streak/adaptive focus; Placement → level CEFR)
- "Start →" arrow sağ üst (FeatureGrid launchCard kalıbı: head row + arrow)
- Exams kartı koyu tema (surface colors.primaryDark, beyaz ikon) — öne çıkan.

## Canlı metrik hesaplama (HomeScreen'de zaten var)
- latestMock = mockHistory[0]?.result (overall sayı)
- skillComposite (composite score)
- level (P1-P4)
- adaptive.focusAction (focus konu)
- examCount: mockHistory.length

## Render bloğu (satır 426-434 arası) değiştirilecek:
{planningTools.map(item => (
  <TouchableOpacity key={item.key} style={[planCard, planCardWide, {backgroundColor: item.surface}]} onPress={() => navigation.navigate(item.route)}>
    <View style={planHead}>
      <View style={[planIconWrap, {backgroundColor: item.iconBg}]}>
        <Ionicons name={item.icon} size={18} color={item.tone} />
      </View>
      <Ionicons name="arrow-forward" size={14} color="#9CA3AF" />
    </View>
    <Text style={planTitle}>{item.label}</Text>
    <Text style={planBody}>{item.body}</Text>
    <View style={planMetric}>
      <Text style={planMetricValue}>{item.metaValue}</Text>
      <Text style={planMetricLabel}>{item.metaLabel}</Text>
    </View>
  </TouchableOpacity>
))}

## Tema uyumu
- launchCard stillerinden kopyala (borderRadius 16, borderWidth 1 borderColor border, padding 14, gap 5, shadow.sm, flexBasis %48.5)
- controlPanelWide genişliği %48.5 ile aynı grid hizası

## Kaynak referans
- /home/ubuntu/BUEPT-APP/src/screens/HomeScreen.js (launchCard stilleri satır 527-532)
- FeatureGrid örnek kart (src/components/Home/FeatureGrid.js) tone/surface kalıbı
- Tema: src/theme/tokens.js — colors, spacing, typography

## Doğrulama
- ESLint temiz + jest 36/36 → commit main → deploy ~3dk → canlı tarama (bundle app.*.js hash'i değişir)
