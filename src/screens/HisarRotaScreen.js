// ── Hisar Rotası — Kampüs Patikası (rev2) ──
// Tasarım konsepti: ekran bir kampüs kağıt haritası. BUSEPT sınavı Hisar
// tepesinde; öğrenci sahilden (Bebek İskelesi) tepeye tırmanıyor. Her durak
// kampüsün gerçek bir yeri: Bebek İskelesi, Deniz Kampüsü, Martı Çay
// Bahçesi, Güney Kampüs, Merdivenler, Hisar (sınav salonu).
// Palet: kağıt bej zemin, kiremit kırmızısı (aktif), servi yeşili (tamamlanan),
// Boğaz turkuazı (aksan), günbatımı amber (XP/vurgu).

import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, typography, spacing, radius, shadow } from '../theme/tokens';
import { useAppState } from '../context/AppState';
import {
  loadReadingHistory,
  loadListeningHistory,
  loadGrammarHistory,
  loadMockHistory,
} from '../utils/appStorage';
import { calculateXpForAction } from '../utils/gamification';

const HERO_IMG = require('../assets/images/real_south_gate.jpg');
const NORTH_IMG = require('../assets/images/real_north_campus.jpg');

// ── Kampüs paleti ──
const paper = '#FAF6EE';
const paperDeep = '#F0E8D8';
const terracotta = '#B3541E';
const cypress = '#2E5943';
const bosphorus = '#1B8FA8';
const bosphorusLight = '#7FD4E0';
const amber = '#E8A33D';
const ink = '#3A3226';
const inkSoft = '#8A7E6A';
const mist = 'rgba(250,246,238,0.88)';

// ── Patika durakları (kampüsün gerçek yerleri) ──
const STOPS = [
  {
    id: 'bebek',
    name: 'Bebek İskelesi',
    detail: 'Vapurdan indin. Yolculuğun başlangıcı.',
    icon: 'ferry',
    missions: ['Daily podcast dinle (15 dk)', 'Yeni kelime kartlarını aç (10 dk)'],
  },
  {
    id: 'deniz',
    name: 'Deniz Kampüsü',
    detail: 'Deniz üstündeki ilk dersler.',
    icon: 'school-outline',
    missions: ['Listening — 1 Global Understanding set', 'Lecture Listening Lab (1 oturum)'],
  },
  {
    id: 'marti',
    name: 'Martı Çay Bahçesi',
    detail: 'Bir çay molası: hafif ama etkili.',
    icon: 'cafe',
    missions: ['Vocab — eş anlamlı eşleştirme (10 dk)', 'Sözlük tekrar kuyruğu'],
  },
  {
    id: 'guney',
    name: 'Güney Kampüs',
    detail: 'Taş binaların gölgesi. İşler ciddileşiyor.',
    icon: 'business-outline',
    missions: ['Grammar — Yapı/UOE × 2 set', 'Mock bir bölüm çöz'],
  },
  {
    id: 'merdiven',
    name: 'Hisar Merdivenleri',
    detail: 'En dik kısım. Reading çıkarımları burada.',
    icon: 'map-outline',
    missions: ['Reading — 1 tam passage + çıkarım soruları', 'Zayıf alan drilleri (15 dk)'],
  },
  {
    id: 'hisar',
    name: 'Hisar — Sınav Salonu',
    detail: 'BUSEPT burada. Zirve.',
    icon: 'flag',
    missions: ['Mock Exam (tam süreli)', 'Writing — rubric kalibreli essay'],
  },
];

// ── Görevler: her durak için haftalık görev seti ──
function buildMissions(stopId) {
  const stop = STOPS.find((s) => s.id === stopId);
  return (stop && stop.missions) || [];
}

function daysUntil() {
  const ms = new Date(2026, 5, 2).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

// ── Durak işaretçisi ──
function StopMarker({ stop, index, state, onPress, isActive }) {
  const isDone = state[stop.id] === 'done';
  const ringColor = isDone ? cypress : isActive ? terracotta : inkSoft;
  const fill = isDone ? cypress : isActive ? terracotta : paper;
  // Patika boyunca dikey dağılım: bebeğ (sahil) en altta, Hisar en üstte
  // Patika üzerindeki noktalar (viewBox 320x900 içindeki kıvrım x salınımı): Hisar üstte başlar
  const xOffsetPct = ['50%', '58%', '42%', '56%', '46%', '50%'][index] || '50%';
  const topPct = ['10%', '25%', '38%', '51%', '64%', '78%'][index] || '50%';
  const alignLeft = index % 2 === 0;
  return (
    <TouchableOpacity
      style={[styles.markerWrap, { top: topPct, left: xOffsetPct }, alignLeft ? styles.markerRowLeft : styles.markerRowRight]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {alignLeft ? (
        <View style={styles.markerInnerLeft}>
          <View style={[styles.markerRing, { borderColor: ringColor }]}>
            <View style={[styles.markerDot, { backgroundColor: fill }]}>
              <MaterialCommunityIcons
                name={stop.icon}
                size={15}
                color={isDone || isActive ? '#FFFFFF' : inkSoft}
              />
            </View>
          </View>
          <View style={[styles.markerLabelWrap, styles.markerLabelLeft]}>
            <Text style={[styles.markerName, isDone && styles.markerNameDone, isActive && styles.markerNameActive]}>
              {stop.name}
            </Text>
            <Text style={styles.markerDetail}>{stop.detail}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.markerInnerRight}>
          <View style={[styles.markerLabelWrap, styles.markerLabelRight]}>
            <Text style={[styles.markerName, isDone && styles.markerNameDone, isActive && styles.markerNameActive]}>
              {stop.name}
            </Text>
            <Text style={styles.markerDetail}>{stop.detail}</Text>
          </View>
          <View style={[styles.markerRing, { borderColor: ringColor }]}>
            <View style={[styles.markerDot, { backgroundColor: fill }]}>
              <MaterialCommunityIcons
                name={stop.icon}
                size={15}
                color={isDone || isActive ? '#FFFFFF' : inkSoft}
              />
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Patika SVG'si (eğimli, kıvrımlı rota) ──
function PathSvg() {
  return (
    <View pointerEvents="none" style={styles.pathSvg}>
      <svg width="100%" height="100%" viewBox="0 0 320 900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pathGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={bosphorusLight} />
            <stop offset="100%" stopColor={terracotta} />
          </linearGradient>
        </defs>
        <path
          d="M 160 870 C 240 790, 80 640, 160 560 C 240 480, 80 330, 160 250 C 220 190, 140 90, 160 30"
          fill="none"
          stroke="url(#pathGrad)"
          strokeWidth="3"
          strokeDasharray="8 7"
          strokeLinecap="round"
          opacity="0.9"
        />
      </svg>
    </View>
  );
}

// ── Kağıt mühür kartı ──
function SealCard({ children, style }) {
  return (
    <View style={[styles.sealCard, style]}>
      <View style={styles.sealCornerTL} />
      <View style={styles.sealCornerTR} />
      {children}
      <View style={styles.sealCornerBL} />
      <View style={styles.sealCornerBR} />
    </View>
  );
}

export default function HisarRotaScreen({ navigation }) {
  const { level } = useAppState();
  const days = useMemo(() => daysUntil(), []);
  const [openStop, setOpenStop] = useState('marti');
  const [doneMissions, setDoneMissions] = useState({});
  const [stopStates, setStopStates] = useState({ bebek: 'done', deniz: 'done', marti: 'current' });

  const histories = useMemo(
    () => ({
      reading: loadReadingHistory(),
      listening: loadListeningHistory(),
      grammar: loadGrammarHistory(),
      mock: loadMockHistory(),
    }),
    []
  );

  // Her liste array olmalı — storage'dan bozuk/async değerler gelirse güvenli düşür
  const safeLists = useMemo(() => {
    const out = {};
    for (const key of Object.keys(histories)) {
      const v = histories[key];
      out[key] = Array.isArray(v) ? v : [];
    }
    return out;
  }, [histories]);

  const stats = useMemo(() => {
    let total = 0;
    let correct = 0;
    for (const list of Object.values(safeLists)) {
      list.forEach((h) => {
        const t = h && typeof h === 'object' ? h.total || 0 : 0;
        const c = h && typeof h === 'object' ? h.correct || 0 : 0;
        total += t;
        correct += c;
      });
    }
    return { total, accuracy: total > 0 ? correct / total : 0 };
  }, [safeLists]);

  const progress = useMemo(
    () => Math.min(92, Math.round(stats.accuracy * 100 * 0.75 + Math.min(25, stats.total * 0.7))),
    [stats]
  );

  const missions = useMemo(() => buildMissions(openStop), [openStop]);
  const activeStop = useMemo(() => STOPS.find((s) => s.id === openStop) || STOPS[0], [openStop]);

  // Oturumda görev tamamlayınca durak durumunu güncelle (demo)
  useEffect(() => {
    const doneCount = Object.values(doneMissions).filter(Boolean).length;
    if (doneCount >= 2 && stopStates[openStop] !== 'done') {
      setStopStates((prev) => ({ ...prev, [openStop]: 'done' }));
    }
  }, [doneMissions, openStop, stopStates]);

  const toggleMission = (key) => {
    setDoneMissions((prev) => ({ ...prev, [key]: !prev[key] }));
    if (!doneMissions[key]) {
      try {
        const xp = calculateXpForAction('DAILY_MISSION');
        console.log(`[HisarRota] +${xp} XP (demo)`);
      } catch (e) {}
    }
  };


  return (
    <Screen scroll contentStyle={styles.screenRoot}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero: günbatımı kampüs + hedef bant ── */}
        <ImageBackground source={HERO_IMG} style={styles.hero} resizeMode="cover">
          <View style={styles.heroOverlay} />
          <View style={styles.heroGradient}>
            <View style={styles.heroInner}>
            <View style={styles.heroHeadRow}>
              <View style={styles.heroTitleWrap}>
                <Text style={styles.heroEyebrow}>KAMPÜS PATİKASI</Text>
                <Text style={styles.heroTitle}>Hisar Rotası</Text>
              </View>
              <View style={styles.heroDays}>
                <Text style={styles.heroDaysNum}>{days}</Text>
                <Text style={styles.heroDaysLabel}>gün kaldı</Text>
              </View>
            </View>
            <Text style={styles.heroSub}>
              {level || 'P2'} seviyesinden Hisar'ın tepesine — vapurdan sınav salonuna.
            </Text>
          </View>
          </View>
        </ImageBackground>

        {/* ── Harita: patika + duraklar ── */}
        <View style={styles.mapCard}>
          <View style={styles.mapHead}>
            <Ionicons name="map" size={16} color={bosphorus} />
            <Text style={styles.mapTitle}>Tepenin Patikası</Text>
            <Text style={styles.mapPct}>{`%${progress}`}</Text>
          </View>
          <View style={styles.pathWrap}>
            <PathSvg />
            {STOPS.map((stop, i) => (
              <StopMarker
                key={stop.id}
                stop={stop}
                index={i}
                state={stopStates}
                isActive={stop.id === openStop}
                onPress={() => setOpenStop(stop.id)}
              />
            ))}
          </View>
          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: cypress }]} />
              <Text style={styles.legendText}>Tamamlanan durak</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: terracotta }]} />
              <Text style={styles.legendText}>Şu an burada</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: inkSoft }]} />
              <Text style={styles.legendText}>Henüz gelmedi</Text>
            </View>
          </View>
        </View>

        {/* ── Durak görevleri (seçili durak açılır) ── */}
        <SealCard style={styles.missionCard}>
          <View style={styles.missionHead}>
            <View style={styles.missionHeadLeft}>
              <View style={styles.missionIconWrap}>
                <MaterialCommunityIcons name={activeStop.icon} size={18} color={paper} />
              </View>
              <View>
                <Text style={styles.missionStopName}>{activeStop.name}</Text>
                <Text style={styles.missionStopDetail}>{activeStop.detail}</Text>
              </View>
            </View>
            <Button
              label="Duruma Git"
              variant="secondary"
              onPress={() => navigation.navigate('Reading')}
              style={styles.missionGoto}
              textStyle={styles.missionGotoText}
            />
          </View>
          <View style={styles.missionList}>
            {missions.map((m, i) => {
              const key = `${openStop}-${i}`;
              const done = doneMissions[key];
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.missionRow}
                  onPress={() => toggleMission(key)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.missionCheck, done && styles.missionCheckDone]}>
                    {done ? <Ionicons name="checkmark" size={13} color="#FFFFFF" /> : null}
                  </View>
                  <Text style={[styles.missionText, done && styles.missionTextDone]}>{m}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.xpStrip}>
            <Ionicons name="star" size={13} color={amber} />
            <Text style={styles.xpText}>Her görev kiremit bir tuğladır — Hisar'ı sen örüyorsun.</Text>
          </View>
        </SealCard>

        {/* ── Kampüs Koçu: Martı çay bahçesi tarzı notlar ── */}
        <Card style={styles.coachCard}>
          <View style={styles.coachHead}>
            <MaterialCommunityIcons name="seagull" size={18} color={bosphorus} />
            <Text style={styles.coachTitle}>Martı'dan Notlar</Text>
          </View>
          <View style={styles.coachBody}>
            <Text style={styles.coachLine}>
              Çay soğumadan: {Math.max(0, 2 - Object.values(doneMissions).filter(Boolean).length)} görev kaldı bugün.
            </Text>
            <Text style={styles.coachLine}>
              Merdivenler dik — Reading çıkarımları en çok antrenman isteyen kısım.
            </Text>
            <Text style={styles.coachLine}>
              Hisar'dan manzara güzel, ama vapur her gün kalkıyor. Süreklilik bu işin sırrı.
            </Text>
          </View>
        </Card>

        {/* ── Alt: Boğaz şeridi ── */}
        <ImageBackground source={NORTH_IMG} style={styles.footer} resizeMode="cover">
          <View style={styles.footerOverlay}>
            <Text style={styles.footerText}>
              Boğaziçi Üniversitesi — 1863'ten beri Hisar'ın eteğinde. Sen de buradaydın; sınavı da geçeceksin.
            </Text>
          </View>
        </ImageBackground>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenRoot: { backgroundColor: paper },
  scrollContent: { paddingBottom: spacing.md },

  // ── Hero ──
  hero: { height: 250 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(42,30,18,0.25)',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    top: undefined,
    height: '62%',
    paddingTop: 120,
    justifyContent: 'flex-end',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  heroInner: { justifyContent: 'flex-end' },
  heroHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heroEyebrow: {
    fontFamily: typography.fontHeadline,
    fontSize: typography.xsmall,
    color: '#F5D9B8',
    letterSpacing: 2.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: typography.fontHeadline,
    fontSize: 34,
    color: '#FFF8EE',
    fontWeight: '800',
  },
  heroDays: { alignItems: 'center' },
  heroDaysNum: {
    fontFamily: typography.fontHeadline,
    fontSize: 32,
    color: '#FFF8EE',
    fontWeight: '800',
    lineHeight: 36,
  },
  heroDaysLabel: { fontSize: typography.xsmall, color: '#F5D9B8', fontWeight: '600' },
  heroSub: {
    fontSize: typography.body,
    color: '#FFF6EA',
    marginTop: spacing.xs,
    maxWidth: 320,
    lineHeight: 21,
  },

  // ── Harita ──
  mapCard: {
    marginHorizontal: spacing.lg,
    marginTop: -46,
    backgroundColor: paper,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: paperDeep,
    ...shadow.md,
    padding: spacing.md,
  },
  mapHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  mapTitle: {
    fontFamily: typography.fontHeadline,
    fontSize: typography.h3,
    color: ink,
    fontWeight: '700',
    marginLeft: spacing.xs,
    flex: 1,
  },
  mapPct: {
    fontFamily: typography.fontHeadline,
    fontSize: typography.h3,
    color: terracotta,
    fontWeight: '800',
  },
  pathWrap: {
    height: 560,
    position: 'relative',
    marginVertical: spacing.xs,
  },
  pathSvg: {
    ...StyleSheet.absoluteFillObject,
  },
  markerWrap: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  markerRowLeft: { justifyContent: 'flex-start', paddingLeft: 8 },
  markerRowRight: { justifyContent: 'flex-end', paddingRight: 8 },
  markerInnerLeft: { flexDirection: 'row', alignItems: 'center' },
  markerInnerRight: { flexDirection: 'row', alignItems: 'center' },
  markerRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: paper,
    zIndex: 2,
  },
  markerDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerLabelWrap: {
    position: 'absolute',
    width: 130,
    backgroundColor: mist,
    borderRadius: radius.md,
    padding: 6,
    borderWidth: 1,
    borderColor: paperDeep,
  },
  markerLabelLeft: { right: 48 },
  markerLabelRight: { left: 48 },
  markerName: {
    fontFamily: typography.fontHeadline,
    fontSize: typography.small,
    color: ink,
    fontWeight: '700',
  },
  markerNameActive: { color: terracotta },
  markerNameDone: { color: cypress, textDecorationLine: 'underline' },
  markerDetail: { fontSize: typography.xsmall, color: inkSoft, marginTop: 2, lineHeight: 14 },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: paperDeep,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 9, height: 9, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: typography.xsmall, color: inkSoft },

  // ── Görev kartı (mühürlü) ──
  sealCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: paperDeep,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#E2D3B4',
    padding: spacing.md,
    ...shadow.sm,
  },
  sealCornerTL: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: terracotta,
  },
  sealCornerTR: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: terracotta,
  },
  sealCornerBL: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: terracotta,
  },
  sealCornerBR: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: terracotta,
  },
  missionCard: { backgroundColor: paperDeep },
  missionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  missionHeadLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  missionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  missionStopName: {
    fontFamily: typography.fontHeadline,
    fontSize: typography.h3,
    color: ink,
    fontWeight: '700',
  },
  missionStopDetail: { fontSize: typography.xsmall, color: inkSoft, marginTop: 2 },
  missionGoto: { paddingHorizontal: 10, paddingVertical: 4 },
  missionGotoText: { fontSize: typography.xsmall },
  missionList: {
    borderTopWidth: 1,
    borderTopColor: '#E2D3B4',
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#EADFC4',
  },
  missionCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  missionCheckDone: { backgroundColor: cypress, borderColor: cypress },
  missionText: { flex: 1, fontSize: typography.body, color: ink, lineHeight: 20 },
  missionTextDone: { textDecorationLine: 'line-through', color: inkSoft },
  xpStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  xpText: { fontSize: typography.small, color: inkSoft, fontWeight: '600', marginLeft: spacing.xs, fontStyle: 'italic' },

  // ── Koç kartı ──
  coachCard: { marginHorizontal: spacing.lg, marginTop: spacing.md },
  coachHead: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  coachTitle: {
    fontFamily: typography.fontHeadline,
    fontSize: typography.h3,
    color: ink,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  coachBody: {},
  coachLine: {
    fontSize: typography.body,
    color: ink,
    lineHeight: 21,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  // ── Alt Boğaz şeridi ──
  footer: {
    height: 92,
    marginTop: spacing.md,
  },
  footerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23,41,52,0.78)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  footerText: {
    fontSize: typography.small,
    color: '#EAF4F6',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
