import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, useWindowDimensions, InteractionManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
    BADGE_CONFIG,
    DEMO_ANALYTICS,
    DEMO_CATEGORIES,
    DEMO_ISSUES,
    DEMO_MODULES
} from '../data/demoModules';

const FAVORITES_KEY = '@demo_features_favorites_v1';
const RECENTS_KEY = '@demo_features_recents_v1';
const SCRIPT_PROGRESS_KEY = '@demo_features_script_progress_v1';
const SCRIPT_ACTIVE_KEY = '@demo_features_script_active_v1';
const PREFLIGHT_KEY = '@demo_features_preflight_v1';
const SESSION_LOG_KEY = '@demo_features_session_log_v1';
const DEFAULT_PREFLIGHT = {
    metro: false,
    internet: false,
    audio: false,
    orientation: false,
    login: false,
};

const DEMO_PACKS = [
    { id: 'pack_exam', label: 'Exam Flow', moduleIds: ['placement', 'prof_mocks', 'weak_point', 'essay_grader'] },
    { id: 'pack_ai', label: 'AI Flow', moduleIds: ['ai_speaking', 'presentation_prep', 'ai_lesson_video', 'essay_grader'] },
    { id: 'pack_class', label: 'Campus Flow', moduleIds: ['curriculum', 'class_schedule_calendar', 'teacher_dash', 'discussion'] },
];

const DEMO_SCRIPTS = [
    { id: 'script_teacher', label: 'Teacher Pitch 15m', moduleIds: ['placement', 'adv_reading', 'ai_speaking', 'essay_grader', 'class_schedule_calendar'] },
    { id: 'script_ai', label: 'AI Stack 12m', moduleIds: ['ai_speaking', 'presentation_prep', 'ai_lesson_video', 'essay_grader'] },
    { id: 'script_academic', label: 'Academic Skills 18m', moduleIds: ['academic_writing', 'listening_lab', 'interactive_vocab', 'terminology', 'adv_reading'] },
];

const DEMO_STORYLINES = [
    {
        id: 'story_outcome',
        label: 'Outcome Story',
        summary: 'Show measurable progress first, then AI depth.',
        moduleIds: ['placement', 'weak_point', 'essay_grader', 'ai_speaking'],
        talkingPoints: [
            'Placement baseline sets an objective level.',
            'Weak Point Analysis maps exact gaps.',
            'Automated Essay Evaluation gives fast actionable feedback.',
            'AI Speaking Partner closes speaking-confidence gap.',
        ],
    },
    {
        id: 'story_campus',
        label: 'Campus Story',
        summary: 'Show class integration and operational fit.',
        moduleIds: ['curriculum', 'class_schedule_calendar', 'teacher_dash', 'discussion'],
        talkingPoints: [
            'Curriculum sync aligns app tasks with classes.',
            'Calendar flow improves daily planning discipline.',
            'Teacher integration closes feedback loop.',
            'Discussion modules sustain daily engagement.',
        ],
    },
    {
        id: 'story_innovation',
        label: 'Innovation Story',
        summary: 'Show AI differentiation and future-ready stack.',
        moduleIds: ['ai_speaking', 'presentation_prep', 'ai_lesson_video', 'interactive_vocab'],
        talkingPoints: [
            'AI speaking gives scalable oral practice.',
            'Presentation prep bridges class and conference needs.',
            'Lesson video studio enables experimental teaching media.',
            'Interactive vocab supports retention and transfer.',
        ],
    },
];

const DEMO_FAQ = [
    { q: 'How is this different from a simple quiz app?', a: 'It combines assessment, adaptive guidance, and classroom workflow modules. Demo scripts show end-to-end pedagogical flow, not isolated mini quizzes.' },
    { q: 'Can instructors actually use this in class?', a: 'Yes. Curriculum, assignments, calendar, and analytics modules are designed for instructor-facing operations and monitoring.' },
    { q: 'What if internet is unstable during the demo?', a: 'Preflight checklist + queue planner allow selecting low-risk modules first. You can prioritize local flows and postpone network-heavy modules.' },
    { q: 'How do you prove impact quickly?', a: 'Start with baseline placement, show weak-point mapping, then open targeted intervention module and close with progress indicators.' },
];

const DEMO_PROFILES = [
    { id: 'teacher', label: 'Teacher Mode', categories: ['Assessment', 'University', 'Skills'], focusTags: ['assessment', 'assignment', 'curriculum', 'analytics'] },
    { id: 'student', label: 'Student Mode', categories: ['Skills', 'AI Tools', 'Community'], focusTags: ['speaking', 'writing', 'vocab', 'listening'] },
];

const DURATION_MAP = {
    placement: 4, prof_mocks: 3, weak_point: 2, essay_grader: 2, adv_reading: 3, ai_speaking: 2,
    presentation_prep: 2, ai_lesson_video: 2, class_schedule_calendar: 2, curriculum: 2, teacher_dash: 2,
    discussion: 1, academic_writing: 3, listening_lab: 3, interactive_vocab: 2, terminology: 2
};

function moduleDuration(modId) {
    return DURATION_MAP[modId] || 2;
}
function toLocalDateKey(ts) {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
function safeJsonParse(raw, fallback) {
    try {
        return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
        return fallback;
    }
}
function sanitizePreflight(value) {
    if (!value || typeof value !== 'object') return { ...DEFAULT_PREFLIGHT };
    return Object.keys(DEFAULT_PREFLIGHT).reduce((acc, key) => {
        acc[key] = Boolean(value[key]);
        return acc;
    }, {});
}

function modulePriority(mod, favoriteIds = [], recentIds = []) {
    const live = mod?.route ? 1 : 0;
    const fav = favoriteIds.includes(mod.id) ? 1 : 0;
    const recent = recentIds.includes(mod.id) ? 1 : 0;
    const badgeBoost = mod.badge ? 1 : 0;
    return (live * 4) + (fav * 3) + (recent * 2) + badgeBoost;
}

export default function DemoFeaturesScreen() {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const isWide = width >= 920;
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [availableOnly, setAvailableOnly] = useState(false);
    const [sortMode, setSortMode] = useState('smart'); // smart | az | recent
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [recentIds, setRecentIds] = useState([]);
    const [showComingSoon, setShowComingSoon] = useState(true);
    const [viewMode, setViewMode] = useState('detail'); // detail | compact
    const [activeScriptId, setActiveScriptId] = useState('');
    const [scriptProgress, setScriptProgress] = useState({});
    const [timeBudget, setTimeBudget] = useState(20);
    const [queueModuleIds, setQueueModuleIds] = useState([]);
    const [queueCursor, setQueueCursor] = useState(0);
    const [sessionLog, setSessionLog] = useState([]);
    const [coveredIds, setCoveredIds] = useState([]);
    const [rehearsalOn, setRehearsalOn] = useState(false);
    const [rehearsalSec, setRehearsalSec] = useState(0);
    const [rehearsalTargetMin, setRehearsalTargetMin] = useState(20);
    const [activeStoryId, setActiveStoryId] = useState(DEMO_STORYLINES[0].id);
    const [faqOpen, setFaqOpen] = useState({});
    const [profileId, setProfileId] = useState('teacher');
    const [compareA, setCompareA] = useState('placement');
    const [compareB, setCompareB] = useState('ai_speaking');
    const [preflight, setPreflight] = useState(DEFAULT_PREFLIGHT);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [listReady, setListReady] = useState(false);
    const liveModules = useMemo(() => DEMO_MODULES.filter((m) => !!m.route), []);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const [favRaw, recentRaw] = await Promise.all([
                    AsyncStorage.getItem(FAVORITES_KEY),
                    AsyncStorage.getItem(RECENTS_KEY),
                ]);
                const [progressRaw, activeRaw] = await Promise.all([
                    AsyncStorage.getItem(SCRIPT_PROGRESS_KEY),
                    AsyncStorage.getItem(SCRIPT_ACTIVE_KEY),
                ]);
                const sessionRaw = await AsyncStorage.getItem(SESSION_LOG_KEY);
                const preflightRaw = await AsyncStorage.getItem(PREFLIGHT_KEY);
                const fav = safeJsonParse(favRaw, []);
                const recent = safeJsonParse(recentRaw, []);
                const progress = safeJsonParse(progressRaw, {});
                const session = safeJsonParse(sessionRaw, []);
                const preflightSaved = safeJsonParse(preflightRaw, null);
                if (!mounted) return;
                const validIds = new Set(DEMO_MODULES.map((m) => m.id));
                const normalizedFav = Array.isArray(fav) ? fav.filter((id) => validIds.has(id)).slice(0, 40) : [];
                const normalizedRecent = Array.isArray(recent) ? recent.filter((id) => validIds.has(id)).slice(0, 8) : [];
                setFavoriteIds(normalizedFav);
                setRecentIds(normalizedRecent);
                if (progress && typeof progress === 'object') setScriptProgress(progress);
                if (Array.isArray(session)) setSessionLog(session.slice(0, 120));
                if (typeof activeRaw === 'string') setActiveScriptId(activeRaw);
                if (preflightSaved && typeof preflightSaved === 'object') {
                    setPreflight(sanitizePreflight(preflightSaved));
                }
                // Auto-heal stale ids in storage to prevent ghost favorites/recents.
                if (Array.isArray(fav) && normalizedFav.length !== fav.length) {
                    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(normalizedFav)).catch(() => { });
                }
                if (Array.isArray(recent) && normalizedRecent.length !== recent.length) {
                    AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(normalizedRecent)).catch(() => { });
                }
            } catch (_) { }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => setListReady(true));
        return () => task.cancel?.();
    }, []);

    const persistRecents = useCallback(async (next) => {
        setRecentIds(next);
        try { await AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(next)); } catch (_) { }
    }, []);

    const toggleFavorite = useCallback((id) => {
        if (!DEMO_MODULES.some((m) => m.id === id)) return;
        setFavoriteIds((prev) => {
            const isFav = prev.includes(id);
            const next = (isFav ? prev.filter((x) => x !== id) : [id, ...prev]).slice(0, 40);
            AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)).catch(() => { });
            return next;
        });
    }, []);

    const openModule = useCallback((mod) => {
        if (!mod?.route) {
            Alert.alert('Coming Soon', `"${mod.title}" demo module is not connected yet.`);
            return;
        }
        try {
            navigation.navigate(mod.route);
        } catch (_) {
            Alert.alert('Route Error', `Route "${mod.route}" is not registered in navigator yet.`);
            return;
        }
        setRecentIds((prev) => {
            const nextRecents = [mod.id, ...prev.filter((x) => x !== mod.id)].slice(0, 8);
            AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(nextRecents)).catch(() => { });
            return nextRecents;
        });
        setSessionLog((prev) => {
            const nextLog = [
                { id: mod.id, title: mod.title, ts: Date.now() },
                ...prev
            ].slice(0, 120);
            AsyncStorage.setItem(SESSION_LOG_KEY, JSON.stringify(nextLog)).catch(() => { });
            return nextLog;
        });
    }, [navigation]);

    const stats = useMemo(() => {
        const aiModules = DEMO_MODULES.filter(m => m.category === 'AI Tools').length;
        const categoryLive = DEMO_CATEGORIES
            .filter((c) => c !== 'All' && c !== 'Favorites')
            .map((category) => {
                const all = DEMO_MODULES.filter((m) => m.category === category).length;
                const live = DEMO_MODULES.filter((m) => m.category === category && !!m.route).length;
                return { category, all, live, pct: all ? Math.round((live / all) * 100) : 0 };
            });
        const completionScore = Math.round((DEMO_ANALYTICS.live / Math.max(1, DEMO_ANALYTICS.total)) * 100);
        const allLive = DEMO_MODULES.filter((m) => !!m.route).length;
        return { total: DEMO_ANALYTICS.total, available: DEMO_ANALYTICS.live, aiModules, categoryLive, completionScore, allLive };
    }, []);
    const activeProfile = useMemo(
        () => DEMO_PROFILES.find((p) => p.id === profileId) || DEMO_PROFILES[0],
        [profileId]
    );
    useEffect(() => {
        if (activeCategory === 'All' || activeCategory === 'Favorites') return;
        if (!activeProfile.categories.includes(activeCategory)) {
            setActiveCategory('All');
        }
    }, [activeProfile, activeCategory]);

    const filtered = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return DEMO_MODULES
            .filter((m) => {
                const isFav = favoriteIds.includes(m.id);
                const profileCategoryOk = activeCategory === 'Favorites'
                    ? isFav
                    : activeProfile.categories.includes(m.category);
                const matchCat = activeCategory === 'All'
                    || m.category === activeCategory
                    || (activeCategory === 'Favorites' && isFav);
                const inTags = Array.isArray(m.tags) && m.tags.some((tag) => String(tag).toLowerCase().includes(query));
                const matchSearch = !query
                    || m.title.toLowerCase().includes(query)
                    || m.desc.toLowerCase().includes(query)
                    || m.category.toLowerCase().includes(query)
                    || inTags;
                const matchAvailability = (!availableOnly || !!m.route) && (showComingSoon || !!m.route);
                return profileCategoryOk && matchCat && matchSearch && matchAvailability;
            })
            .sort((a, b) => {
                if (sortMode === 'az') return a.title.localeCompare(b.title);
                if (sortMode === 'recent') {
                    const ai = recentIds.indexOf(a.id);
                    const bi = recentIds.indexOf(b.id);
                    if (ai === -1 && bi === -1) return a.title.localeCompare(b.title);
                    if (ai === -1) return 1;
                    if (bi === -1) return -1;
                    return ai - bi;
                }
                const aFav = favoriteIds.includes(a.id) ? 1 : 0;
                const bFav = favoriteIds.includes(b.id) ? 1 : 0;
                if (aFav !== bFav) return bFav - aFav;
                if (!!a.route !== !!b.route) return a.route ? -1 : 1;
                return a.title.localeCompare(b.title);
            });
    }, [activeCategory, searchQuery, availableOnly, favoriteIds, sortMode, recentIds, showComingSoon, activeProfile]);

    const categoryCounts = useMemo(() => {
        return DEMO_CATEGORIES.reduce((acc, cat) => {
            if (cat === 'All') acc[cat] = DEMO_MODULES.length;
            else if (cat === 'Favorites') acc[cat] = favoriteIds.length;
            else acc[cat] = DEMO_MODULES.filter((m) => m.category === cat).length;
            return acc;
        }, {});
    }, [favoriteIds]);

    const recentModules = useMemo(() => {
        return recentIds
            .map(id => DEMO_MODULES.find(m => m.id === id))
            .filter(Boolean);
    }, [recentIds]);

    const recommendedModules = useMemo(() => {
        const favoritePool = DEMO_MODULES.filter((m) => favoriteIds.includes(m.id) && !!m.route);
        const aiPool = DEMO_MODULES.filter((m) => m.category === 'AI Tools' && !!m.route);
        const livePool = DEMO_MODULES.filter((m) => !!m.route);
        const base = favoritePool.length > 0 ? favoritePool : aiPool;
        if (base.length > 0) return base.slice(0, 4);
        return livePool.slice(0, 4);
    }, [favoriteIds]);
    const highlightedModules = useMemo(() => {
        const live = DEMO_MODULES.filter((m) => !!m.route);
        const sorted = [...live].sort((a, b) => {
            const aScore = (a.badge ? 2 : 0) + (favoriteIds.includes(a.id) ? 3 : 0) + (recentIds.includes(a.id) ? 2 : 0);
            const bScore = (b.badge ? 2 : 0) + (favoriteIds.includes(b.id) ? 3 : 0) + (recentIds.includes(b.id) ? 2 : 0);
            return bScore - aScore;
        });
        return sorted.slice(0, 3);
    }, [favoriteIds, recentIds]);
    const demoScore = useMemo(() => {
        const livePct = Math.round((stats.available / Math.max(1, stats.total)) * 100);
        const favWeight = Math.min(100, favoriteIds.length * 8);
        const recentWeight = Math.min(100, recentIds.length * 10);
        const score = Math.round((livePct * 0.6) + (favWeight * 0.2) + (recentWeight * 0.2));
        const label = score >= 85 ? 'Showcase Ready' : score >= 70 ? 'Strong Demo' : 'In Progress';
        return { score, label };
    }, [stats, favoriteIds, recentIds]);
    const openPack = useCallback((pack) => {
        const mods = (pack?.moduleIds || [])
            .map((id) => DEMO_MODULES.find((m) => m.id === id))
            .filter((m) => !!m?.route);
        if (!mods.length) {
            Alert.alert('Pack Not Ready', 'No live module in this pack yet.');
            return;
        }
        const first = mods[0];
        openModule(first);
        Alert.alert(
            `${pack.label} Started`,
            `Opened: ${first.title}\nNext suggestions:\n${mods.slice(1).map((m) => `• ${m.title}`).join('\n') || 'None'}`
        );
    }, [openModule]);

    const openRandomLive = useCallback(() => {
        const live = DEMO_MODULES.filter(m => !!m.route);
        if (!live.length) return;
        const pick = live[Math.floor(Math.random() * live.length)];
        openModule(pick);
    }, [openModule]);

    const clearPersonalization = useCallback(async () => {
        setFavoriteIds([]);
        setRecentIds([]);
        setScriptProgress({});
        setActiveScriptId('');
        setQueueModuleIds([]);
        setQueueCursor(0);
        setSessionLog([]);
        setCoveredIds([]);
        setRehearsalOn(false);
        setRehearsalSec(0);
        setPreflight(DEFAULT_PREFLIGHT);
        setActiveCategory('All');
        setSearchQuery('');
        setAvailableOnly(false);
        setSortMode('smart');
        setViewMode('detail');
        setProfileId('teacher');
        setQueueModuleIds([]);
        setQueueCursor(0);
        setFaqOpen({});
        try {
            await Promise.all([
                AsyncStorage.removeItem(FAVORITES_KEY),
                AsyncStorage.removeItem(RECENTS_KEY),
                AsyncStorage.removeItem(SCRIPT_PROGRESS_KEY),
                AsyncStorage.removeItem(SCRIPT_ACTIVE_KEY),
                AsyncStorage.removeItem(PREFLIGHT_KEY),
                AsyncStorage.removeItem(SESSION_LOG_KEY),
            ]);
        } catch (_) { }
    }, []);
    useEffect(() => {
        if (!rehearsalOn) return undefined;
        const t = setInterval(() => setRehearsalSec((s) => s + 1), 1000);
        return () => clearInterval(t);
    }, [rehearsalOn]);
    const scriptsWithStats = useMemo(() => {
        return DEMO_SCRIPTS.map((script) => {
            const moduleIds = script.moduleIds.filter((id) => !!DEMO_MODULES.find((m) => m.id === id));
            const done = moduleIds.filter((id) => !!scriptProgress[`${script.id}:${id}`]).length;
            const total = moduleIds.length;
            const minutes = moduleIds.reduce((sum, id) => sum + moduleDuration(id), 0);
            const pct = total ? Math.round((done / total) * 100) : 0;
            return { ...script, moduleIds, done, total, minutes, pct };
        });
    }, [scriptProgress]);
    const activeScript = useMemo(
        () => scriptsWithStats.find((s) => s.id === activeScriptId) || null,
        [scriptsWithStats, activeScriptId]
    );
    const preflightDone = useMemo(
        () => Object.keys(DEFAULT_PREFLIGHT).filter((k) => preflight[k]).length,
        [preflight]
    );
    const preflightPct = useMemo(
        () => Math.round((preflightDone / Math.max(1, Object.keys(DEFAULT_PREFLIGHT).length)) * 100),
        [preflightDone]
    );
    const sessionStats = useMemo(() => {
        const today = toLocalDateKey(Date.now());
        const todayLog = sessionLog.filter((x) => toLocalDateKey(x.ts) === today);
        const unique = new Set(todayLog.map((x) => x.id));
        const liveUnique = Array.from(unique).filter((id) => !!DEMO_MODULES.find((m) => m.id === id && !!m.route));
        const estMinutes = liveUnique.reduce((sum, id) => sum + moduleDuration(id), 0);
        return { opens: todayLog.length, unique: unique.size, estMinutes };
    }, [sessionLog]);
    const plannedQueue = useMemo(() => {
        const live = DEMO_MODULES.filter((m) => !!m.route);
        const sorted = [...live].sort((a, b) => modulePriority(b, favoriteIds, recentIds) - modulePriority(a, favoriteIds, recentIds));
        const picked = [];
        let totalMin = 0;
        sorted.forEach((m) => {
            const dur = moduleDuration(m.id);
            if (totalMin + dur <= timeBudget || picked.length < 2) {
                picked.push(m.id);
                totalMin += dur;
            }
        });
        return { ids: picked, totalMin };
    }, [favoriteIds, recentIds, timeBudget]);
    const queueCurrentModule = useMemo(() => {
        const id = queueModuleIds[queueCursor];
        return DEMO_MODULES.find((m) => m.id === id) || null;
    }, [queueModuleIds, queueCursor]);
    useEffect(() => {
        if (!queueModuleIds.length && queueCursor !== 0) {
            setQueueCursor(0);
            return;
        }
        if (queueCursor >= queueModuleIds.length && queueModuleIds.length > 0) {
            setQueueCursor(queueModuleIds.length - 1);
        }
    }, [queueModuleIds, queueCursor]);
    const queueProgressPct = useMemo(() => {
        if (!queueModuleIds.length) return 0;
        return Math.round(((queueCursor + 1) / queueModuleIds.length) * 100);
    }, [queueCursor, queueModuleIds.length]);
    const rehearsalPct = useMemo(() => {
        const target = rehearsalTargetMin * 60;
        if (!target) return 0;
        return Math.min(100, Math.round((rehearsalSec / target) * 100));
    }, [rehearsalSec, rehearsalTargetMin]);
    const uncoveredLive = useMemo(() => {
        const covered = new Set(coveredIds);
        return DEMO_MODULES.filter((m) => !!m.route && !covered.has(m.id));
    }, [coveredIds]);
    const reliability = useMemo(() => {
        const total = DEMO_MODULES.length;
        const live = DEMO_MODULES.filter((m) => !!m.route).length;
        const comingSoon = total - live;
        const riskLabel = comingSoon <= 2 ? 'Low' : comingSoon <= 6 ? 'Medium' : 'High';
        const topRisk = DEMO_MODULES.filter((m) => !m.route).slice(0, 5);
        return { total, live, comingSoon, riskLabel, topRisk };
    }, []);
    const activeStory = useMemo(
        () => DEMO_STORYLINES.find((s) => s.id === activeStoryId) || DEMO_STORYLINES[0],
        [activeStoryId]
    );
    const storyModules = useMemo(
        () => activeStory.moduleIds.map((id) => DEMO_MODULES.find((m) => m.id === id)).filter(Boolean),
        [activeStory]
    );
    const confidenceScore = useMemo(() => {
        const pre = preflightPct;
        const reh = rehearsalPct;
        const queue = queueProgressPct;
        const score = Math.round((pre * 0.4) + (reh * 0.35) + (queue * 0.25));
        const label = score >= 85 ? 'High' : score >= 65 ? 'Medium' : 'Low';
        return { score, label };
    }, [preflightPct, rehearsalPct, queueProgressPct]);
    const compareModules = useMemo(() => {
        const a = DEMO_MODULES.find((m) => m.id === compareA) || null;
        const b = DEMO_MODULES.find((m) => m.id === compareB) || null;
        if (!a || !b) return null;
        if (a.id === b.id) {
            return {
                a, b, overlap: a.tags || [], durationGap: 0, combinedMin: moduleDuration(a.id) * 2,
                recommendation: 'Pick two different modules for a meaningful comparison.',
            };
        }
        const aTags = new Set(a.tags || []);
        const overlap = (b.tags || []).filter((t) => aTags.has(t));
        const durationGap = Math.abs(moduleDuration(a.id) - moduleDuration(b.id));
        const recommendation = durationGap <= 1
            ? 'Good pair for balanced demo pacing.'
            : 'Use shorter one first, then longer one to control pacing.';
        return {
            a, b, overlap, durationGap, recommendation,
            combinedMin: moduleDuration(a.id) + moduleDuration(b.id),
        };
    }, [compareA, compareB]);
    useEffect(() => {
        if (!liveModules.length) return;
        if (!liveModules.some((m) => m.id === compareA)) setCompareA(liveModules[0].id);
        if (!liveModules.some((m) => m.id === compareB)) {
            setCompareB(liveModules[1]?.id || liveModules[0].id);
        }
    }, [liveModules, compareA, compareB]);
    const objectionShield = useMemo(() => {
        const items = [];
        if (preflightPct < 80) items.push('Run preflight fully before live classroom demo.');
        if (rehearsalPct < 60) items.push('Complete at least one full rehearsal to reduce timing drift.');
        if (queueProgressPct < 50) items.push('Finish queue steps to cover core modules end-to-end.');
        if (!items.length) items.push('Demo readiness is strong. Focus on impact narrative and outcomes.');
        return items;
    }, [preflightPct, rehearsalPct, queueProgressPct]);
    const toggleScriptStep = useCallback((scriptId, moduleId) => {
        const key = `${scriptId}:${moduleId}`;
        setScriptProgress((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            AsyncStorage.setItem(SCRIPT_PROGRESS_KEY, JSON.stringify(next)).catch(() => { });
            return next;
        });
        setActiveScriptId(scriptId);
        AsyncStorage.setItem(SCRIPT_ACTIVE_KEY, scriptId || '').catch(() => { });
    }, []);
    const startScript = useCallback((script) => {
        if (!script) return;
        const firstLive = script.moduleIds
            .map((id) => DEMO_MODULES.find((m) => m.id === id))
            .find((m) => !!m?.route);
        setActiveScriptId(script.id);
        AsyncStorage.setItem(SCRIPT_ACTIVE_KEY, script.id || '').catch(() => { });
        if (!firstLive) {
            Alert.alert('Script Not Ready', 'No live route in this script yet.');
            return;
        }
        openModule(firstLive);
    }, [openModule]);
    const togglePreflight = useCallback((key) => {
        setPreflight((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            AsyncStorage.setItem(PREFLIGHT_KEY, JSON.stringify(next)).catch(() => { });
            return next;
        });
    }, []);
    const buildQueue = useCallback(() => {
        setQueueModuleIds(plannedQueue.ids);
        setQueueCursor(0);
    }, [plannedQueue.ids]);
    const openQueueCurrent = useCallback(() => {
        if (!queueCurrentModule) return;
        openModule(queueCurrentModule);
        setCoveredIds((prev) => (prev.includes(queueCurrentModule.id) ? prev : [...prev, queueCurrentModule.id]));
    }, [queueCurrentModule, openModule]);
    const nextQueue = useCallback(() => {
        setQueueCursor((c) => Math.min(c + 1, Math.max(0, queueModuleIds.length - 1)));
    }, [queueModuleIds.length]);
    const prevQueue = useCallback(() => {
        setQueueCursor((c) => Math.max(0, c - 1));
    }, []);
    const openNextBest = useCallback(() => {
        const next = uncoveredLive
            .slice()
            .sort((a, b) => modulePriority(b, favoriteIds, recentIds) - modulePriority(a, favoriteIds, recentIds))[0];
        if (!next) {
            Alert.alert('All Covered', 'No uncovered live module left.');
            return;
        }
        openModule(next);
        setCoveredIds((prev) => (prev.includes(next.id) ? prev : [...prev, next.id]));
    }, [uncoveredLive, favoriteIds, recentIds, openModule]);
    const formatClock = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };
    const visibleModules = useMemo(
        () => (listReady ? filtered : filtered.slice(0, 6)),
        [filtered, listReady]
    );

    return (
        <Screen scroll animate contentStyle={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerTitleWrap}>
                    <Text style={styles.headerTitle}>Feature Hub</Text>
                    <Text style={styles.headerSub}>{stats.available}/{stats.total} playable modules</Text>
                </View>
            </View>

            <Card style={styles.heroCard}>
                <View style={styles.heroHead}>
                    <View style={styles.heroCopy}>
                        <Text style={styles.heroEyebrow}>Showcase Workspace</Text>
                        <Text style={styles.heroTitle}>BUEPT Demo Suite</Text>
                        <Text style={styles.heroBody}>
                            Access all specialized academic modules from a single command center. Use filters to narrow down by skill or assessment type.
                        </Text>
                    </View>
                    <View style={styles.heroMetric}>
                        <Text style={styles.heroMetricValue}>{demoScore.score}%</Text>
                        <Text style={styles.heroMetricLabel}>{demoScore.label}</Text>
                    </View>
                </View>
                <View style={styles.readinessBarTrack}>
                    <View style={[styles.readinessBarFill, { width: `${demoScore.score}%` }]} />
                </View>
            </Card>

            <View style={styles.statsRow}>
                <TouchableOpacity
                    onPress={() => setAvailableOnly(v => !v)}
                    style={[styles.quickToggle, availableOnly && styles.quickToggleActive]}
                >
                    <Ionicons name={availableOnly ? 'checkmark-circle' : 'filter'} size={14} color={availableOnly ? '#fff' : '#172554'} />
                    <Text style={[styles.quickToggleText, availableOnly && styles.quickToggleTextActive]}>
                        Live only
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openRandomLive} style={styles.quickAction}>
                    <Ionicons name="shuffle" size={14} color="#172554" />
                    <Text style={styles.quickActionText}>Random</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setShowComingSoon(v => !v)}
                    style={[styles.quickAction, !showComingSoon && styles.quickActionActive]}
                >
                    <Ionicons name={showComingSoon ? 'eye' : 'eye-off'} size={14} color={showComingSoon ? "#172554" : '#fff'} />
                    <Text style={[styles.quickActionText, !showComingSoon && styles.quickActionTextActive]}>
                        Coming Soon
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.microStatsRow}>
                <Text style={styles.microStatText}>Favorites: {favoriteIds.length}</Text>
                <Text style={styles.microStatText}>Recent: {recentIds.length}</Text>
                <Text style={styles.microStatText}>Ready: {stats.available}/{stats.total}</Text>
                <TouchableOpacity onPress={() => setActiveCategory('Favorites')}>
                    <Text style={styles.microStatAction}>Open Favorites</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.advancedToggleRow}>
                <Text style={styles.advancedToggleLabel}>Advanced demo controls</Text>
                <TouchableOpacity onPress={() => setShowAdvanced((v) => !v)} style={styles.advancedToggleBtn}>
                    <Ionicons name={showAdvanced ? 'chevron-up' : 'chevron-down'} size={14} color={colors.primaryDark} />
                    <Text style={styles.advancedToggleText}>{showAdvanced ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
            </View>
            {showAdvanced ? (
                <>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.profileRow}>
                    {DEMO_PROFILES.map((p) => (
                        <TouchableOpacity
                            key={p.id}
                            onPress={() => setProfileId(p.id)}
                            style={[styles.profileChip, profileId === p.id && styles.profileChipActive]}
                        >
                            <Ionicons name={p.id === 'teacher' ? 'school' : 'person'} size={14} color={profileId === p.id ? '#fff' : '#172554'} />
                            <Text style={[styles.profileChipText, profileId === p.id && styles.profileChipTextActive]}>{p.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.packRow}>
                    {DEMO_PACKS.map((pack) => (
                        <TouchableOpacity key={pack.id} onPress={() => openPack(pack)} style={styles.packChip}>
                            <Ionicons name="rocket" size={14} color="#172554" />
                            <Text style={styles.packChipText}>{pack.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.packRow}>
                    {highlightedModules.map((m) => (
                        <TouchableOpacity key={`hl-${m.id}`} onPress={() => openModule(m)} style={styles.highlightChip}>
                            <Ionicons name={m.icon} size={14} color={m.color} />
                            <Text style={styles.highlightChipText}>{m.title}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                </>
            ) : null}
            {showAdvanced ? (
                <>
            <Card style={styles.preflightCard}>
                <Text style={styles.preflightTitle}>Showtime Preflight</Text>
                <Text style={styles.preflightMeta}>{preflightDone}/{Object.keys(DEFAULT_PREFLIGHT).length} done • {preflightPct}%</Text>
                <View style={styles.preflightTrack}>
                    <View style={[styles.preflightFill, { width: `${preflightPct}%` }]} />
                </View>
                <View style={styles.preflightGrid}>
                    {[
                        { key: 'metro', label: 'Metro Running' },
                        { key: 'internet', label: 'Internet' },
                        { key: 'audio', label: 'Audio Working' },
                        { key: 'orientation', label: 'Orientation Tested' },
                        { key: 'login', label: 'Account Ready' },
                    ].map((item) => (
                        <TouchableOpacity key={item.key} onPress={() => togglePreflight(item.key)} style={[styles.preflightItem, preflight[item.key] && styles.preflightItemDone]}>
                            <Ionicons name={preflight[item.key] ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={preflight[item.key] ? '#16A34A' : colors.muted} />
                            <Text style={[styles.preflightItemText, preflight[item.key] && styles.preflightItemTextDone]}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Card>
            <Card style={styles.preflightCard}>
                <Text style={styles.preflightTitle}>Time Budget Planner</Text>
                <View style={styles.budgetRow}>
                    {[10, 20, 30, 45].map((m) => (
                        <TouchableOpacity key={`budget-${m}`} onPress={() => setTimeBudget(m)} style={[styles.budgetChip, timeBudget === m && styles.budgetChipActive]}>
                        <Text style={[styles.budgetChipText, timeBudget === m && styles.budgetChipTextActive]}>{m}m</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity onPress={buildQueue} style={styles.budgetBuildBtn}>
                        <Text style={styles.budgetBuildText}>Build Queue</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.preflightMeta}>Suggested: {plannedQueue.ids.length} modules • ~{plannedQueue.totalMin} min</Text>
                <Text style={styles.preflightMeta}>Session today: {sessionStats.opens} opens • {sessionStats.unique} unique • ~{sessionStats.estMinutes}m covered</Text>
                {queueModuleIds.length > 0 ? (
                    <View style={styles.queueControlRow}>
                        <TouchableOpacity onPress={prevQueue} style={styles.queueCtrlBtn}>
                            <Ionicons name="chevron-back" size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <View style={styles.queueInfo}>
                            <Text style={styles.queueInfoTitle}>
                                {queueCurrentModule ? queueCurrentModule.title : 'Queue item'}
                            </Text>
                            <Text style={styles.queueInfoMeta}>
                                Step {queueCursor + 1}/{queueModuleIds.length} • {queueCurrentModule ? moduleDuration(queueCurrentModule.id) : 0} min
                            </Text>
                        </View>
                        <TouchableOpacity onPress={nextQueue} style={styles.queueCtrlBtn}>
                            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={openQueueCurrent} style={styles.queueOpenBtn}>
                            <Text style={styles.queueOpenText}>Open</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
                {queueModuleIds.length > 0 ? (
                    <View style={styles.preflightTrack}>
                        <View style={[styles.preflightFill, { width: `${queueProgressPct}%` }]} />
                    </View>
                ) : null}
            </Card>
            <Card style={styles.preflightCard}>
                <Text style={styles.preflightTitle}>Rehearsal Timer</Text>
                <View style={styles.budgetRow}>
                    {[10, 20, 30].map((m) => (
                        <TouchableOpacity key={`reh-${m}`} onPress={() => setRehearsalTargetMin(m)} style={[styles.budgetChip, rehearsalTargetMin === m && styles.budgetChipActive]}>
                            <Text style={[styles.budgetChipText, rehearsalTargetMin === m && styles.budgetChipTextActive]}>{m}m</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity onPress={() => setRehearsalOn((v) => !v)} style={styles.budgetBuildBtn}>
                        <Text style={styles.budgetBuildText}>{rehearsalOn ? 'Pause' : 'Start'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setRehearsalOn(false); setRehearsalSec(0); }} style={styles.budgetBuildBtn}>
                        <Text style={styles.budgetBuildText}>Reset</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.preflightMeta}>Elapsed: {formatClock(rehearsalSec)} / {rehearsalTargetMin}:00</Text>
                <View style={styles.preflightTrack}>
                    <View style={[styles.preflightFill, { width: `${rehearsalPct}%` }]} />
                </View>
                <Text style={styles.preflightMeta}>Covered live modules: {coveredIds.length} • Remaining: {uncoveredLive.length}</Text>
                {uncoveredLive.slice(0, 4).map((m) => (
                    <Text key={`risk-${m.id}`} style={styles.riskText}>• {m.title}</Text>
                ))}
                <View style={styles.rehearsalActionRow}>
                    <TouchableOpacity onPress={openNextBest} style={styles.queueOpenBtn}>
                        <Text style={styles.queueOpenText}>Open Next Best</Text>
                    </TouchableOpacity>
                </View>
            </Card>
            <Card style={styles.preflightCard}>
                <Text style={styles.preflightTitle}>Storyline Builder</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyChipRow}>
                    {DEMO_STORYLINES.map((s) => (
                        <TouchableOpacity key={s.id} onPress={() => setActiveStoryId(s.id)} style={[styles.storyChip, activeStoryId === s.id && styles.storyChipActive]}>
                            <Text style={[styles.storyChipText, activeStoryId === s.id && styles.storyChipTextActive]}>{s.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <Text style={styles.preflightMeta}>{activeStory.summary}</Text>
                {activeStory.talkingPoints.map((tp) => (
                    <Text key={`tp-${tp}`} style={styles.riskText}>• {tp}</Text>
                ))}
                <View style={styles.storyModuleRow}>
                    {storyModules.map((m) => (
                        <TouchableOpacity key={`story-${m.id}`} onPress={() => openModule(m)} style={styles.storyModuleChip}>
                            <Ionicons name={m.icon} size={13} color={m.color} />
                            <Text style={styles.storyModuleChipText}>{m.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Card>
            <Card style={styles.preflightCard}>
                <Text style={styles.preflightTitle}>Confidence & Q/A</Text>
                <Text style={styles.preflightMeta}>Confidence: {confidenceScore.score}% ({confidenceScore.label})</Text>
                <View style={styles.preflightTrack}>
                    <View style={[styles.preflightFill, { width: `${confidenceScore.score}%` }]} />
                </View>
                {DEMO_FAQ.map((item) => {
                    const open = !!faqOpen[item.q];
                    return (
                        <TouchableOpacity key={item.q} onPress={() => setFaqOpen((prev) => ({ ...prev, [item.q]: !prev[item.q] }))} style={styles.faqRow}>
                            <View style={styles.faqHead}>
                                <Ionicons name={open ? 'chevron-down' : 'chevron-forward'} size={14} color={colors.primary} />
                                <Text style={styles.faqQ}>{item.q}</Text>
                            </View>
                            {open ? <Text style={styles.faqA}>{item.a}</Text> : null}
                        </TouchableOpacity>
                    );
                })}
            </Card>
            <Card style={styles.preflightCard}>
                <Text style={styles.preflightTitle}>Reliability Radar</Text>
                <Text style={styles.preflightMeta}>Live: {reliability.live}/{reliability.total} • Coming Soon: {reliability.comingSoon} • Risk: {reliability.riskLabel}</Text>
                {reliability.topRisk.map((m) => (
                    <Text key={`riskmod-${m.id}`} style={styles.riskText}>• Missing route: {m.title}</Text>
                ))}
                {objectionShield.map((txt) => (
                    <Text key={`obj-${txt}`} style={styles.faqA}>• {txt}</Text>
                ))}
            </Card>
            <Card style={styles.preflightCard}>
                <Text style={styles.preflightTitle}>Module Compare</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyChipRow}>
                    {liveModules.map((m) => (
                        <TouchableOpacity key={`cmp-a-${m.id}`} onPress={() => setCompareA(m.id)} style={[styles.storyChip, compareA === m.id && styles.storyChipActive]}>
                            <Text style={[styles.storyChipText, compareA === m.id && styles.storyChipTextActive]}>A: {m.title}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyChipRow}>
                    {liveModules.map((m) => (
                        <TouchableOpacity key={`cmp-b-${m.id}`} onPress={() => setCompareB(m.id)} style={[styles.storyChip, compareB === m.id && styles.storyChipActive]}>
                            <Text style={[styles.storyChipText, compareB === m.id && styles.storyChipTextActive]}>B: {m.title}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                {compareModules ? (
                    <>
                        <Text style={styles.preflightMeta}>{compareModules.a.title} + {compareModules.b.title}</Text>
                        <Text style={styles.preflightMeta}>Combined: ~{compareModules.combinedMin} min • Duration gap: {compareModules.durationGap} min</Text>
                        <Text style={styles.faqA}>Tag overlap: {compareModules.overlap.length ? compareModules.overlap.join(', ') : 'None'}</Text>
                        <Text style={styles.faqA}>{compareModules.recommendation}</Text>
                    </>
                ) : null}
            </Card>
            <View style={styles.scriptSection}>
                <View style={styles.sectionHeadRow}>
                    <Text style={styles.sectionHeadText}>Demo Scripts</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scriptRow}>
                    {scriptsWithStats.map((script) => (
                        <TouchableOpacity
                            key={script.id}
                            onPress={() => setActiveScriptId(script.id)}
                            style={[styles.scriptCard, activeScriptId === script.id && styles.scriptCardActive]}
                        >
                            <Text style={styles.scriptTitle}>{script.label}</Text>
                            <Text style={styles.scriptMeta}>{script.done}/{script.total} done • {script.minutes} min</Text>
                            <View style={styles.scriptTrack}>
                                <View style={[styles.scriptFill, { width: `${script.pct}%` }]} />
                            </View>
                            <TouchableOpacity style={styles.scriptStartBtn} onPress={() => startScript(script)}>
                                <Text style={styles.scriptStartText}>Start</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                {activeScript ? (
                    <View style={styles.scriptStepsWrap}>
                        {activeScript.moduleIds.map((id) => {
                            const mod = DEMO_MODULES.find((m) => m.id === id);
                            if (!mod) return null;
                            const done = !!scriptProgress[`${activeScript.id}:${id}`];
                            return (
                                <View key={`step-${activeScript.id}-${id}`} style={[styles.stepRow, done && styles.stepRowDone]}>
                                    <TouchableOpacity onPress={() => toggleScriptStep(activeScript.id, id)} style={styles.stepToggleBtn}>
                                        <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={done ? '#16A34A' : colors.muted} />
                                    </TouchableOpacity>
                                    <Text style={[styles.stepText, done && styles.stepTextDone]}>{mod.title}</Text>
                                    <Text style={styles.stepTime}>{moduleDuration(id)}m</Text>
                                    <TouchableOpacity onPress={() => openModule(mod)}>
                                        <Text style={styles.stepOpen}>Open</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                ) : null}
            </View>

            {__DEV__ && DEMO_ISSUES.length > 0 && (
                <View style={styles.devWarnBox}>
                    <Ionicons name="alert-circle" size={14} color="#92400E" />
                    <Text style={styles.devWarnText}>
                        Demo catalog warnings: {DEMO_ISSUES.length}
                    </Text>
                </View>
            )}
                </>
            ) : null}

            <View style={styles.sortRow}>
                {[
                    { id: 'smart', label: 'Smart' },
                    { id: 'az', label: 'A-Z' },
                    { id: 'recent', label: 'Recent' },
                ].map((s) => (
                    <TouchableOpacity
                        key={s.id}
                        onPress={() => setSortMode(s.id)}
                        style={[styles.sortChip, sortMode === s.id && styles.sortChipActive]}
                    >
                        <Text style={[styles.sortChipText, sortMode === s.id && styles.sortChipTextActive]}>{s.label}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={clearPersonalization} style={styles.clearPrefsBtn}>
                    <Ionicons name="refresh" size={12} color={colors.muted} />
                    <Text style={styles.clearPrefsText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setViewMode((v) => (v === 'detail' ? 'compact' : 'detail'))}
                    style={[styles.clearPrefsBtn, styles.viewModeBtn]}
                >
                    <Ionicons name={viewMode === 'detail' ? 'grid' : 'list'} size={12} color={colors.muted} />
                    <Text style={styles.clearPrefsText}>{viewMode === 'detail' ? 'Compact' : 'Detail'}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.categoryHealthWrap}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryHealthRow}>
                    {stats.categoryLive.map((item) => (
                        <View key={`health-${item.category}`} style={styles.categoryHealthCard}>
                            <Text style={styles.categoryHealthTitle}>{item.category}</Text>
                            <Text style={styles.categoryHealthMeta}>{item.live}/{item.all} live ({item.pct}%)</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {recentModules.length > 0 && (
                <View style={styles.recentWrap}>
                    <View style={styles.sectionHeadRow}>
                        <Text style={styles.sectionHeadText}>Continue</Text>
                        <TouchableOpacity onPress={() => persistRecents([])}>
                            <Text style={styles.sectionHeadAction}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
                        {recentModules.map((m) => (
                            <TouchableOpacity key={m.id} onPress={() => openModule(m)} style={styles.recentChip}>
                                <Ionicons name={m.icon} size={13} color={m.color} />
                                <Text style={styles.recentChipText}>{m.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {recommendedModules.length > 0 && (
                <View style={styles.recentWrap}>
                    <View style={styles.sectionHeadRow}>
                        <Text style={styles.sectionHeadText}>Recommended</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
                        {recommendedModules.map((m) => (
                            <TouchableOpacity key={m.id} onPress={() => openModule(m)} style={styles.recentChip}>
                                <Ionicons name={m.icon} size={13} color={m.color} />
                                <Text style={styles.recentChipText}>{m.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Search bar */}
            <View style={styles.searchWrap}>
                <Ionicons name="search" size={18} color={colors.muted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search modules..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={colors.muted}
                    autoCapitalize="none"
                    returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearBtn}>
                        <Ionicons name="close-circle" size={18} color={colors.muted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Category pills */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.catScrollWrap}
                contentContainerStyle={styles.catScroll}
            >
                {DEMO_CATEGORIES.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => setActiveCategory(cat)}
                        style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
                    >
                        <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>
                            {cat} ({categoryCounts[cat] || 0})
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={[styles.scrollContent, isWide && styles.scrollGrid]}>
                {!listReady && filtered.length > visibleModules.length ? (
                    <View style={styles.loadingHint}>
                        <Ionicons name="hourglass-outline" size={16} color={colors.muted} />
                        <Text style={styles.loadingHintText}>Loading full module grid...</Text>
                    </View>
                ) : null}
                {filtered.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="search-outline" size={48} color={colors.muted} />
                        <Text style={styles.emptyTitle}>No modules found</Text>
                        <Text style={styles.emptySub}>Try a different search or category</Text>
                        <TouchableOpacity
                            style={styles.emptyActionBtn}
                            onPress={() => {
                                setActiveCategory('All');
                                setSearchQuery('');
                                setAvailableOnly(false);
                                setSortMode('smart');
                            }}
                        >
                            <Text style={styles.emptyActionText}>Reset Filters</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {visibleModules.map((mod) => (
                    <TouchableOpacity
                        key={mod.id}
                        activeOpacity={0.85}
                        onPress={() => openModule(mod)}
                        onLongPress={() => toggleFavorite(mod.id)}
                        style={[styles.cardWrap, isWide && styles.cardWrapWide]}
                    >
                        <Card style={styles.moduleCard} glow={!!mod.route}>
                            <View style={styles.cardTop}>
                                {/* Icon circle */}
                                <View style={[styles.iconCircle, { backgroundColor: mod.color + '18' }]}>
                                    <Ionicons name={mod.icon} size={22} color={mod.color} />
                                </View>

                                {/* Badges */}
                                <View style={styles.badgesRow}>
                                    <TouchableOpacity onPress={() => toggleFavorite(mod.id)} style={styles.favoriteBtn}>
                                        <Ionicons
                                            name={favoriteIds.includes(mod.id) ? 'heart' : 'heart-outline'}
                                            size={16}
                                            color={favoriteIds.includes(mod.id) ? '#DC2626' : colors.muted}
                                        />
                                    </TouchableOpacity>
                                    {mod.badge && (
                                        <View style={[styles.badge, { backgroundColor: (BADGE_CONFIG[mod.badge] || {}).bg || '#F3F4F6' }]}>
                                            <Text style={[styles.badgeText, { color: (BADGE_CONFIG[mod.badge] || {}).text || colors.muted }]}>{mod.badge}</Text>
                                        </View>
                                    )}
                                    <View style={[styles.catBadge, { backgroundColor: mod.color + '18' }]}>
                                        <Text style={[styles.catBadgeText, { color: mod.color }]}>{mod.category}</Text>
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.modTitle}>{mod.title}</Text>
                            {viewMode === 'detail' ? <Text style={styles.modDesc}>{mod.desc}</Text> : null}
                            {mod.tags?.length ? (
                                <View style={styles.tagsRow}>
                                    {mod.tags.slice(0, 4).map((tag) => (
                                        <View key={`${mod.id}-${tag}`} style={styles.tagChip}>
                                            <Text style={styles.tagText}>#{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : null}

                            <View style={[styles.launchRow, mod.route ? styles.launchRowActive : styles.launchRowInactive]}>
                                <Ionicons
                                    name={mod.route ? 'play-circle' : 'time-outline'}
                                    size={14}
                                    color={mod.route ? '#172554' : colors.muted}
                                />
                                <Text style={[styles.launchText, mod.route ? styles.launchTextActive : styles.launchTextInactive]}>
                                    {mod.route ? 'Open Module →' : 'Coming Soon'}
                                </Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                ))}

                <View style={styles.listSpacer} />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    mainScroll: { paddingBottom: 120 },

    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: spacing.xl, 
        paddingTop: spacing.md, 
        paddingBottom: spacing.sm,
        backgroundColor: '#172554'
    },
    headerTitleWrap: {
        flex: 1,
    },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(255,255,255,0.1)' },
    headerTitle: { fontSize: typography.h3, fontFamily: typography.fontHeadline, color: '#FFFFFF', fontWeight: '800' },
    headerSub: { fontSize: typography.xsmall, color: '#BFDBFE', fontWeight: '600' },

    heroCard: {
        margin: spacing.xl,
        marginTop: 0,
        backgroundColor: '#172554',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: radius.xl,
        borderBottomRightRadius: radius.xl,
        padding: spacing.lg,
        paddingTop: spacing.md,
        ...shadow.md,
    },
    heroHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
    heroCopy: { flex: 1 },
    heroEyebrow: { fontSize: 10, color: '#BFDBFE', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    heroTitle: { fontSize: 24, color: '#FFFFFF', fontWeight: '900', marginBottom: 6 },
    heroBody: { fontSize: 13, color: '#DBEAFE', lineHeight: 18, opacity: 0.9 },
    heroMetric: { alignItems: 'flex-end' },
    heroMetricValue: { fontSize: 28, color: '#FFFFFF', fontWeight: '900' },
    heroMetricLabel: { fontSize: 10, color: '#BFDBFE', fontWeight: '700', textTransform: 'uppercase' },

    readinessBarTrack: { marginTop: spacing.md, height: 6, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.1)' },
    readinessBarFill: { height: '100%', backgroundColor: '#60A5FA', borderRadius: radius.pill },

    statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
    quickToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#172554', paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: '#eff6ff' },
    quickToggleActive: { backgroundColor: '#172554', borderColor: '#172554' },
    quickToggleText: { fontSize: 12, color: '#172554', fontWeight: '700' },
    quickToggleTextActive: { color: '#fff' },
    quickAction: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(15,63,127,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: '#fff' },
    quickActionActive: { backgroundColor: '#172554', borderColor: '#172554' },
    quickActionText: { fontSize: 12, color: '#172554', fontWeight: '700' },
    quickActionTextActive: { color: '#fff' },
    microStatsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
    microStatText: { fontSize: 11, color: colors.muted, fontWeight: '700' },
    microStatAction: { fontSize: 11, color: colors.primary, fontWeight: '800' },
    advancedToggleRow: {
        marginTop: spacing.sm,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    advancedToggleLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    advancedToggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#E8F0FF',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    advancedToggleText: {
        fontSize: 11,
        fontWeight: '800',
        color: colors.primaryDark,
    },
    profileRow: { paddingHorizontal: spacing.xl, gap: 8, paddingBottom: spacing.xs },
    profileChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fff' },
    profileChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    profileChipText: { fontSize: 12, color: colors.primary, fontWeight: '800' },
    profileChipTextActive: { color: '#fff' },
    readinessRow: { marginHorizontal: spacing.xl, marginBottom: spacing.xs },
    readinessBox: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
    readinessValue: { fontSize: 22, color: colors.primaryDark, fontWeight: '900' },
    readinessLabel: { fontSize: 12, color: colors.muted, fontWeight: '700' },
    profileMeta: { marginTop: 4, fontSize: 11, color: colors.muted, fontWeight: '700' },
    packRow: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xs, gap: 8 },
    packChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.secondary, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 7 },
    packChipText: { fontSize: 12, color: colors.primaryDark, fontWeight: '700' },
    highlightChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 7 },
    highlightChipText: { fontSize: 12, color: colors.primaryDark, fontWeight: '700' },
    scriptSection: { marginBottom: spacing.sm },
    scriptRow: { paddingHorizontal: spacing.xl, gap: 8, paddingBottom: spacing.xs },
    scriptCard: { width: 190, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: radius.md, padding: 10 },
    scriptCardActive: { borderColor: colors.primary, backgroundColor: '#EFF6FF' },
    scriptTitle: { fontSize: 12, color: colors.text, fontWeight: '800' },
    scriptMeta: { marginTop: 4, fontSize: 11, color: colors.muted, fontWeight: '700' },
    scriptTrack: { marginTop: 8, height: 6, borderRadius: radius.pill, backgroundColor: '#E2E8F0', overflow: 'hidden' },
    scriptFill: { height: '100%', backgroundColor: colors.primary },
    scriptStartBtn: { marginTop: 8, alignSelf: 'flex-start', backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
    scriptStartText: { fontSize: 11, color: colors.primaryDark, fontWeight: '800' },
    scriptStepsWrap: { marginHorizontal: spacing.xl, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: radius.md, padding: 8 },
    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    stepRowDone: { backgroundColor: '#ECFDF3' },
    stepToggleBtn: { width: 20, alignItems: 'center', justifyContent: 'center' },
    stepText: { flex: 1, fontSize: 12, color: colors.text, fontWeight: '600' },
    stepTextDone: { color: '#166534' },
    stepTime: { fontSize: 11, color: colors.muted, fontWeight: '700' },
    stepOpen: { fontSize: 11, color: colors.primary, fontWeight: '800' },
    preflightCard: { marginHorizontal: spacing.xl, marginBottom: spacing.sm, backgroundColor: '#fff' },
    preflightTitle: { fontSize: 13, fontWeight: '800', color: colors.text },
    preflightMeta: { marginTop: 3, fontSize: 11, color: colors.muted, fontWeight: '700' },
    preflightTrack: { marginTop: 6, height: 7, borderRadius: radius.pill, backgroundColor: '#E2E8F0', overflow: 'hidden' },
    preflightFill: { height: '100%', backgroundColor: '#16A34A' },
    preflightGrid: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    preflightItem: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: '#fff' },
    preflightItemDone: { backgroundColor: '#ECFDF3', borderColor: '#86EFAC' },
    preflightItemText: { fontSize: 11, color: colors.muted, fontWeight: '700' },
    preflightItemTextDone: { color: '#166534' },
    budgetRow: { marginTop: 8, flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
    budgetChip: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fff' },
    budgetChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    budgetChipText: { fontSize: 12, color: colors.muted, fontWeight: '800' },
    budgetChipTextActive: { color: '#fff' },
    budgetBuildBtn: { marginLeft: 'auto', backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#BFDBFE' },
    budgetBuildText: { fontSize: 11, color: colors.primaryDark, fontWeight: '800' },
    queueControlRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
    queueCtrlBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#BFDBFE', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF' },
    queueInfo: { flex: 1 },
    queueInfoTitle: { fontSize: 12, color: colors.text, fontWeight: '800' },
    queueInfoMeta: { fontSize: 11, color: colors.muted, marginTop: 2, fontWeight: '700' },
    queueOpenBtn: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 },
    queueOpenText: { fontSize: 11, color: '#fff', fontWeight: '800' },
    riskText: { fontSize: 11, color: '#92400E', marginTop: 3, fontWeight: '700' },
    rehearsalActionRow: { marginTop: 8, flexDirection: 'row', justifyContent: 'flex-end' },
    storyChipRow: { gap: 8, marginTop: 6, paddingBottom: 4 },
    storyChip: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fff' },
    storyChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    storyChipText: { fontSize: 11, color: colors.muted, fontWeight: '800' },
    storyChipTextActive: { color: '#fff' },
    storyModuleRow: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    storyModuleChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 6 },
    storyModuleChipText: { fontSize: 11, color: colors.primaryDark, fontWeight: '700' },
    faqRow: { marginTop: 8, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: radius.md, backgroundColor: '#fff', padding: 8 },
    faqHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    faqQ: { flex: 1, fontSize: 12, color: colors.text, fontWeight: '800' },
    faqA: { marginTop: 6, fontSize: 11, color: colors.muted, lineHeight: 17 },
    devWarnBox: { marginHorizontal: spacing.xl, marginBottom: spacing.sm, backgroundColor: '#FEF3C7', borderColor: '#FCD34D', borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
    devWarnText: { color: '#92400E', fontSize: 12, fontWeight: '700' },
    sortRow: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
    sortChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.04)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
    sortChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    sortChipText: { fontSize: 12, fontWeight: '700', color: colors.muted },
    sortChipTextActive: { color: '#fff' },
    clearPrefsBtn: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
    viewModeBtn: { marginLeft: 0 },
    clearPrefsText: { fontSize: 11, color: colors.muted, fontWeight: '700' },
    categoryHealthWrap: { marginBottom: spacing.sm },
    categoryHealthRow: { paddingHorizontal: spacing.xl, gap: 8 },
    categoryHealthCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 8 },
    categoryHealthTitle: { fontSize: 11, color: colors.text, fontWeight: '800', textTransform: 'uppercase' },
    categoryHealthMeta: { fontSize: 11, color: colors.muted, marginTop: 2, fontWeight: '700' },

    recentWrap: { marginBottom: spacing.sm },
    sectionHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, marginBottom: 6 },
    sectionHeadText: { fontSize: 12, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
    sectionHeadAction: { fontSize: 12, fontWeight: '700', color: colors.primary },
    recentRow: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, gap: 8 },
    recentChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', borderRadius: radius.pill, paddingVertical: 7, paddingHorizontal: 11 },
    recentChipText: { fontSize: 12, color: colors.text, fontWeight: '600' },

    searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: spacing.sm, backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: radius.pill, height: 42 },
    searchIcon: {
        marginLeft: 12,
    },
    searchClearBtn: {
        padding: 8,
    },
    searchInput: { flex: 1, height: '100%', paddingHorizontal: spacing.sm, fontSize: 14, color: colors.text },

    catScrollWrap: { minHeight: 46, marginBottom: spacing.sm },
    catScroll: { paddingHorizontal: spacing.xl, gap: 8, alignItems: 'center' },
    catChip: { minHeight: 34, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.04)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', justifyContent: 'center' },
    catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    catChipText: { fontSize: 13, lineHeight: 16, fontWeight: '700', color: colors.muted },
    catChipTextActive: { color: '#fff' },

    scrollContent: { paddingHorizontal: spacing.xl },
    scrollGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },

    cardWrap: { marginBottom: spacing.md },
    cardWrapWide: { width: '48%' },
    moduleCard: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
    iconCircle: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
    badgesRow: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1, marginLeft: spacing.sm },
    favoriteBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.04)', justifyContent: 'center', alignItems: 'center' },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
    badgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
    catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
    catBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },

    modTitle: { fontSize: typography.h3, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '700', marginBottom: spacing.xs },
    modDesc: { fontSize: typography.small, color: colors.text, lineHeight: 20, marginBottom: spacing.md },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md },
    tagChip: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
    tagText: { fontSize: 10, color: colors.muted, fontWeight: '800' },

    launchRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.sm, gap: 5 },
    launchRowActive: { backgroundColor: colors.primarySoft },
    launchRowInactive: { backgroundColor: 'rgba(0,0,0,0.03)' },
    launchText: { fontSize: 12, fontWeight: '700' },
    launchTextActive: { color: '#172554' },
    launchTextInactive: { color: colors.muted },

    loadingHint: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: spacing.sm },
    loadingHintText: { fontSize: 12, color: colors.muted, fontWeight: '600' },

    emptyState: { alignItems: 'center', paddingVertical: 60 },
    listSpacer: { height: 40 },
    emptyTitle: { fontSize: typography.h3, fontWeight: '800', color: colors.muted, marginTop: spacing.md },
    emptySub: { fontSize: typography.small, color: colors.muted, marginTop: spacing.xs },
    emptyActionBtn: { marginTop: spacing.md, backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
    emptyActionText: { fontSize: 12, color: colors.primaryDark, fontWeight: '700' },
});
