import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography } from '../theme/tokens';
import fallScheduleData from '../../data/university_schedule_2025_fall.json';
import springCalendarData from '../../data/university_schedule_2026_spring.json';

const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const CLASS_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HOMEWORK_STORAGE_KEY = 'class_schedule_homework_v1';
const BUEPT_EXAM_AT = '2026-06-02T09:00:00+03:00';

function toISO(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateLabel(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatShortDate(isoDate) {
  if (!isoDate || typeof isoDate !== 'string' || isoDate.length < 10) return '--';
  return isoDate.slice(5);
}

function formatCountdown(msRemaining) {
  const safe = Math.max(0, Number(msRemaining || 0));
  const totalSeconds = Math.floor(safe / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function isLunch(label) {
  return typeof label === 'string' && label.toUpperCase().includes('LUNCH BREAK');
}

function parseInstructor(label, instructors = {}) {
  if (!label || typeof label !== 'string') return null;
  const trimmed = label.trim();
  if (trimmed.startsWith('A')) return instructors.A || null;
  if (trimmed.startsWith('B')) return instructors.B || null;
  return null;
}

function parseSections(program) {
  if (!program || !Array.isArray(program.sections)) return [];
  return program.sections.map((section) => ({
    label: `Section ${section.section}`,
    value: section.section,
  }));
}

function daySessions(section, dayKey) {
  if (!section || !Array.isArray(section.slots)) return [];
  const sessions = [];
  section.slots.forEach((slot, idx) => {
    const entry = (slot.entries || []).find((e) => e.day === dayKey && !isLunch(e.label));
    if (!entry) return;
    sessions.push({
      id: `${dayKey}-${idx}`,
      time: slot.time || 'Session',
      label: entry.label,
    });
  });
  return sessions;
}

function buildMonthCells(monthDate) {
  const firstDay = startOfMonth(monthDate);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

function isIsoInRange(iso, start, end) {
  return typeof iso === 'string' && iso >= start && iso <= end;
}

function findBestTerm(termDataList, todayISO) {
  if (!Array.isArray(termDataList) || !termDataList.length) return fallScheduleData;
  const inRange = termDataList.find((term) => isIsoInRange(todayISO, term?.meta?.termStart, term?.meta?.termEnd));
  if (inRange) return inRange;

  const upcoming = termDataList
    .filter((term) => typeof term?.meta?.termStart === 'string' && term.meta.termStart >= todayISO)
    .sort((a, b) => a.meta.termStart.localeCompare(b.meta.termStart));
  if (upcoming.length) return upcoming[0];

  const past = termDataList
    .filter((term) => typeof term?.meta?.termEnd === 'string' && term.meta.termEnd <= todayISO)
    .sort((a, b) => b.meta.termEnd.localeCompare(a.meta.termEnd));
  if (past.length) return past[0];

  return termDataList[0];
}

export default function ClassScheduleCalendarScreen({ navigation }) {
  const termDataList = useMemo(
    () => [fallScheduleData, springCalendarData].filter(Boolean),
    []
  );
  const [todayISO, setTodayISO] = useState(() => toISO(new Date()));
  const [nowClockMs, setNowClockMs] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      const next = toISO(new Date());
      setTodayISO((prev) => (prev === next ? prev : next));
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const timer = setInterval(() => setNowClockMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const detectedTerm = useMemo(
    () => findBestTerm(termDataList, todayISO),
    [termDataList, todayISO]
  );

  const [termId, setTermId] = useState(detectedTerm?.meta?.termKey || detectedTerm?.meta?.name || 'fall');
  const activeTerm = useMemo(
    () => termDataList.find((term) => (term?.meta?.termKey || term?.meta?.name) === termId) || detectedTerm,
    [termDataList, termId, detectedTerm]
  );

  const termStart = activeTerm?.meta?.termStart || '2026-02-16';
  const termEnd = activeTerm?.meta?.termEnd || '2026-06-05';
  const initialDate = todayISO;

  const programs = useMemo(
    () => activeTerm?.programs || fallScheduleData?.programs || [],
    [activeTerm]
  );
  const holidays = useMemo(() => activeTerm?.holidays || [], [activeTerm]);
  const academicEvents = useMemo(() => activeTerm?.academicEvents || [], [activeTerm]);
  const holidayMap = useMemo(() => new Map(holidays.map((h) => [h.date, h.name])), [holidays]);

  const defaultProgram = programs[0] || null;
  const defaultSection = defaultProgram?.sections?.[0] || null;

  const [programId, setProgramId] = useState(defaultProgram?.program || null);
  const [sectionId, setSectionId] = useState(defaultSection?.section || null);
  const [monthDate, setMonthDate] = useState(new Date(`${initialDate}T00:00:00`));
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [viewMode, setViewMode] = useState('calendar');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [homeworkTitle, setHomeworkTitle] = useState('');
  const [homeworkDueDate, setHomeworkDueDate] = useState(initialDate);
  const [homeworkNote, setHomeworkNote] = useState('');
  const [homeworkItems, setHomeworkItems] = useState([]);

  const activeProgram = useMemo(
    () => programs.find((p) => p.program === programId) || programs[0] || null,
    [programId, programs]
  );

  const sectionOptions = useMemo(() => parseSections(activeProgram), [activeProgram]);

  const activeSection = useMemo(() => {
    const found = activeProgram?.sections?.find((s) => `${s.section}` === `${sectionId}`);
    if (found) return found;
    return activeProgram?.sections?.[0] || null;
  }, [activeProgram, sectionId]);

  const classWeekDays = useMemo(() => {
    const set = new Set();
    if (!activeSection) return set;
    CLASS_DAYS.forEach((day) => {
      const sessions = daySessions(activeSection, day);
      if (sessions.length) set.add(day);
    });
    return set;
  }, [activeSection]);

  const monthCells = useMemo(() => buildMonthCells(monthDate), [monthDate]);
  const selectedDateObj = useMemo(() => new Date(`${selectedDate}T00:00:00`), [selectedDate]);
  const selectedWeekDates = useMemo(() => {
    const weekStart = startOfWeek(selectedDateObj);
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [selectedDateObj]);

  const filteredAcademicEvents = useMemo(
    () => academicEvents.filter((event) => {
      if (!event || typeof event.startDate !== 'string') return false;
      return eventTypeFilter === 'all' || event.type === eventTypeFilter;
    }),
    [academicEvents, eventTypeFilter]
  );

  const eventTypeOptions = useMemo(() => {
    const uniq = Array.from(new Set(academicEvents.map((event) => event.type).filter(Boolean)));
    return ['all', ...uniq];
  }, [academicEvents]);

  const dayEvents = useMemo(() => {
    const map = new Map();
    const pushEvent = (date, event) => {
      if (!map.has(date)) map.set(date, []);
      map.get(date).push(event);
    };
    filteredAcademicEvents.forEach((event) => {
      const start = new Date(`${event.startDate}T00:00:00`);
      const end = new Date(`${event.endDate || event.startDate}T00:00:00`);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;
      for (let date = new Date(start); date <= end; date = addDays(date, 1)) {
        pushEvent(toISO(date), event);
      }
    });
    return map;
  }, [filteredAcademicEvents]);

  useEffect(() => {
    const nextSelectedDate = todayISO;
    setSelectedDate(nextSelectedDate);
    setHomeworkDueDate(nextSelectedDate);
    setMonthDate(new Date(`${nextSelectedDate}T00:00:00`));
  }, [termStart, termEnd, todayISO, termId]);

  useEffect(() => {
    if (!programs.length) return;
    const exists = programs.some((program) => `${program.program}` === `${programId}`);
    if (!exists) {
      const firstProgram = programs[0];
      setProgramId(firstProgram?.program || null);
      setSectionId(firstProgram?.sections?.[0]?.section || null);
    }
  }, [programs, programId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(HOMEWORK_STORAGE_KEY);
        if (!mounted) return;
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .filter((item) => item && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.dueDate === 'string')
            .map((item) => ({
              id: item.id,
              title: item.title,
              dueDate: item.dueDate,
              note: typeof item.note === 'string' ? item.note : '',
              done: Boolean(item.done),
              createdAt: typeof item.createdAt === 'string' ? item.createdAt : todayISO,
            }));
          setHomeworkItems(normalized);
        }
      } catch (_) {
        // ignore storage read errors
      }
    })();
    return () => { mounted = false; };
  }, [todayISO]);

  useEffect(() => {
    AsyncStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(homeworkItems)).catch(() => { });
  }, [homeworkItems]);

  const monthStats = useMemo(() => {
    let classDays = 0;
    let holidayCount = 0;
    let eventDays = 0;
    monthCells.forEach((date) => {
      if (!date) return;
      const iso = toISO(date);
      const dayKey = WEEK_DAYS[date.getDay()];
      const inTerm = iso >= termStart && iso <= termEnd;
      if (!inTerm) return;
      if (dayEvents.has(iso)) eventDays += 1;
      if (holidayMap.has(iso)) {
        holidayCount += 1;
        return;
      }
      if (classWeekDays.has(dayKey)) classDays += 1;
    });
    return { classDays, holidayCount, eventDays };
  }, [monthCells, termStart, termEnd, holidayMap, classWeekDays, dayEvents]);

  const upcomingHolidays = useMemo(
    () => holidays
      .filter((h) => h.date >= todayISO)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5),
    [holidays, todayISO]
  );

  const upcomingEvents = useMemo(
    () => filteredAcademicEvents
      .filter((e) => e.startDate && (e.endDate || e.startDate) >= todayISO)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 8),
    [filteredAcademicEvents, todayISO]
  );
  const nextExamEvent = useMemo(
    () => filteredAcademicEvents
      .filter((e) => {
        const t = String(e.type || '').toLowerCase();
        const title = String(e.title || '').toLowerCase();
        return t.includes('exam') || title.includes('exam') || title.includes('quiz');
      })
      .filter((e) => e.startDate >= todayISO)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] || null,
    [filteredAcademicEvents, todayISO]
  );
  const bueptCountdown = useMemo(() => {
    const examMs = new Date(BUEPT_EXAM_AT).getTime();
    return formatCountdown(examMs - nowClockMs);
  }, [nowClockMs]);

  const homeworkDateMap = useMemo(() => {
    const map = new Map();
    homeworkItems.forEach((item) => {
      if (item.done) return;
      map.set(item.dueDate, (map.get(item.dueDate) || 0) + 1);
    });
    return map;
  }, [homeworkItems]);

  const openHomeworkCount = useMemo(
    () => homeworkItems.filter((item) => !item.done).length,
    [homeworkItems]
  );

  const upcomingHomework = useMemo(
    () => homeworkItems
      .filter((item) => !item.done && item.dueDate >= todayISO)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 8),
    [homeworkItems, todayISO]
  );

  const selectedDayHomework = useMemo(
    () => homeworkItems
      .filter((item) => item.dueDate === selectedDate)
      .sort((a, b) => {
        if (a.done === b.done) return a.title.localeCompare(b.title);
        return a.done ? 1 : -1;
      }),
    [homeworkItems, selectedDate]
  );

  const addHomework = () => {
    const title = homeworkTitle.trim();
    if (!title) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(homeworkDueDate)) return;
    const item = {
      id: `hw_${Date.now()}`,
      title,
      dueDate: homeworkDueDate,
      note: homeworkNote.trim(),
      done: false,
      createdAt: todayISO,
    };
    setHomeworkItems((prev) => [item, ...prev]);
    setHomeworkTitle('');
    setHomeworkNote('');
  };

  const toggleHomeworkDone = (id) => {
    setHomeworkItems((prev) => prev.map((item) => (
      item.id === id ? { ...item, done: !item.done } : item
    )));
  };

  const removeHomework = (id) => {
    setHomeworkItems((prev) => prev.filter((item) => item.id !== id));
  };

  const selectedInfo = useMemo(() => {
    const dayKey = WEEK_DAYS[selectedDateObj.getDay()];
    const holidayName = holidayMap.get(selectedDate);
    const inTerm = isIsoInRange(selectedDate, termStart, termEnd);
    const sessions = inTerm && !holidayName ? daySessions(activeSection, dayKey) : [];
    const events = dayEvents.get(selectedDate) || [];
    return { dayKey, holidayName, inTerm, sessions, events };
  }, [selectedDate, selectedDateObj, holidayMap, termStart, termEnd, activeSection, dayEvents]);

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    if (navigation?.navigate) {
      navigation.navigate('BogaziciHub');
    }
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      <View style={[styles.topBar, { marginTop: Platform.OS === 'ios' ? 44 : 20 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Prep Calendar</Text>
      </View>

      <Card style={styles.countdownCard}>
        <Text style={styles.countdownTitle}>BUEPT 2026 Exam</Text>
        <View style={styles.countdownBlocks}>
            <View style={styles.timeBlock}>
                <Text style={styles.timeVal}>{bueptCountdown.days}</Text>
                <Text style={styles.timeLab}>Gün</Text>
            </View>
            <Text style={styles.colon}>:</Text>
            <View style={styles.timeBlock}>
                <Text style={styles.timeVal}>{String(bueptCountdown.hours).padStart(2, '0')}</Text>
                <Text style={styles.timeLab}>Saat</Text>
            </View>
            <Text style={styles.colon}>:</Text>
            <View style={styles.timeBlock}>
                <Text style={styles.timeVal}>{String(bueptCountdown.minutes).padStart(2, '0')}</Text>
                <Text style={styles.timeLab}>Dk</Text>
            </View>
            <Text style={styles.colon}>:</Text>
            <View style={styles.timeBlock}>
                <Text style={styles.timeVal}>{String(bueptCountdown.seconds).padStart(2, '0')}</Text>
                <Text style={styles.timeLab}>Sn</Text>
            </View>
        </View>
        <Text style={styles.countdownSub}>2 Haziran 2026 • Bogazici University</Text>
      </Card>

      <Card style={styles.heroCard}>
        <Text style={styles.heroTitle}>Ders Programı ve Takvim</Text>
        <Text style={styles.heroSub}>
          2. dönem takvimi aktif. Bugüne göre sınav ve ödev akışını takip et.
        </Text>
        <Text style={styles.termText}>Bugün: {todayISO}</Text>
        <Text style={styles.termText}>Term: {termStart} → {termEnd}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.blockTitle}>Dönem Seçimi</Text>
        <View style={styles.rowWrap}>
          {termDataList.map((term) => {
            const key = term?.meta?.termKey || term?.meta?.name;
            const active = key === (activeTerm?.meta?.termKey || activeTerm?.meta?.name);
            return (
              <TouchableOpacity
                key={key}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setTermId(key)}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {term?.meta?.name || key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.blockTitle}>Boğaziçi Prep Dashboard</Text>
        <View style={styles.dashboardRow}>
          <View style={styles.dashboardItem}>
            <Text style={styles.dashboardLabel}>Next Exam</Text>
            <Text style={styles.dashboardValue}>{nextExamEvent?.startDate || '--'}</Text>
            <Text style={styles.dashboardSub}>{nextExamEvent?.title || 'No upcoming exam event'}</Text>
          </View>
          <View style={styles.dashboardItem}>
            <Text style={styles.dashboardLabel}>Status</Text>
            <Text style={styles.dashboardValue}>{termId}</Text>
            <Text style={styles.dashboardSub}>Active Term</Text>
          </View>
          <View style={styles.dashboardItem}>
            <Text style={styles.dashboardLabel}>Open Homework</Text>
            <Text style={styles.dashboardValue}>{openHomeworkCount}</Text>
            <Text style={styles.dashboardSub}>pending tasks</Text>
          </View>
        </View>
        <View style={styles.rowWrap}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('BogaziciHub')}>
            <Text style={styles.quickBtnText}>Boğaziçi Hub</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('PlacementTest')}>
            <Text style={styles.quickBtnText}>Placement Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Mock')}>
            <Text style={styles.quickBtnText}>Mock Exam</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('WritingEditor')}>
            <Text style={styles.quickBtnText}>Writing Focus</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Listening')}>
            <Text style={styles.quickBtnText}>Listening Focus</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <View style={styles.kpiRow}>
        <Card style={styles.kpiCard}>
          <Text style={styles.kpiValue}>P{activeProgram?.program || '-'}</Text>
          <Text style={styles.kpiLabel}>Program</Text>
        </Card>
        <Card style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{activeSection?.section || '-'}</Text>
          <Text style={styles.kpiLabel}>Section</Text>
        </Card>
        <Card style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{monthStats.classDays}</Text>
          <Text style={styles.kpiLabel}>Class Days</Text>
        </Card>
      </View>

      <Card style={styles.card}>
        <Text style={styles.blockTitle}>Program</Text>
        <View style={styles.rowWrap}>
          {programs.map((program) => {
            const active = program.program === activeProgram?.program;
            return (
              <TouchableOpacity
                key={program.program}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => {
                  setProgramId(program.program);
                  setSectionId(program.sections?.[0]?.section || null);
                }}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>P{program.program}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.blockTitle, { marginTop: spacing.md }]}>Section</Text>
        <View style={styles.rowWrap}>
          {sectionOptions.map((section) => {
            const active = `${section.value}` === `${activeSection?.section}`;
            return (
              <TouchableOpacity
                key={`${activeProgram?.program}-${section.value}`}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setSectionId(section.value)}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{section.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>Room: {activeSection?.room || '-'}</Text>
          <Text style={styles.meta}>A: {activeSection?.instructors?.A || '-'}</Text>
          {activeSection?.instructors?.B ? <Text style={styles.meta}>B: {activeSection.instructors.B}</Text> : null}
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.modeRow}>
          <TouchableOpacity style={[styles.modePill, viewMode === 'calendar' && styles.modePillActive]} onPress={() => setViewMode('calendar')}>
            <Text style={[styles.modePillText, viewMode === 'calendar' && styles.modePillTextActive]}>Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modePill, viewMode === 'agenda' && styles.modePillActive]} onPress={() => setViewMode('agenda')}>
            <Text style={[styles.modePillText, viewMode === 'agenda' && styles.modePillTextActive]}>Agenda</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.metaTiny}>Event Filter</Text>
        <View style={styles.filterChipRow}>
          {eventTypeOptions.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterPill, eventTypeFilter === type && styles.filterPillActive]}
              onPress={() => setEventTypeFilter(type)}
            >
              <Text style={[styles.filterPillText, eventTypeFilter === type && styles.filterPillTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {viewMode === 'calendar' ? (
          <>
        <View style={styles.topActionRow}>
          <TouchableOpacity
            style={styles.todayBtn}
            onPress={() => {
              const today = new Date();
              const iso = toISO(today);
              setSelectedDate(iso);
              setHomeworkDueDate(iso);
              setMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
            }}
          >
            <Text style={styles.todayBtnText}>Today</Text>
          </TouchableOpacity>
          <Text style={styles.meta}>
            Class days: {monthStats.classDays} • Holidays: {monthStats.holidayCount} • Events: {monthStats.eventDays}
          </Text>
        </View>

        <View style={styles.calendarHeader}>
          <TouchableOpacity style={styles.monthBtn} onPress={() => setMonthDate((prev) => addMonths(prev, -1))}>
            <Text style={styles.monthBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTHS[monthDate.getMonth()]} {monthDate.getFullYear()}</Text>
          <TouchableOpacity style={styles.monthBtn} onPress={() => setMonthDate((prev) => addMonths(prev, 1))}>
            <Text style={styles.monthBtnText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekHeaderRow}>
          {WEEK_DAYS.map((day) => (
            <Text key={day} style={styles.weekHeaderText}>{day.slice(0, 2)}</Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {monthCells.map((date, idx) => {
            if (!date) return <View key={`empty-${idx}`} style={styles.dayCell} />;
            const iso = toISO(date);
            const dayKey = WEEK_DAYS[date.getDay()];
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const inTerm = iso >= termStart && iso <= termEnd;
            const isHoliday = holidayMap.has(iso);
            const hasEvent = dayEvents.has(iso);
            const hasHomework = homeworkDateMap.has(iso);
            const isToday = iso === todayISO;
            const hasClass = inTerm && !isHoliday && classWeekDays.has(dayKey);
            const isSelected = iso === selectedDate;
            return (
              <TouchableOpacity
                key={iso}
                style={[
                  styles.dayCell,
                  isWeekend && styles.dayWeekend,
                  isSelected && styles.daySelected,
                  hasClass && styles.dayClass,
                  isHoliday && styles.dayHoliday,
                  isToday && styles.dayToday,
                ]}
                onPress={() => setSelectedDate(iso)}
              >
                <Text style={[
                  styles.dayText,
                  isSelected && styles.dayTextSelected,
                  isHoliday && styles.dayTextHoliday,
                ]}
                >
                  {date.getDate()}
                </Text>
                {hasClass ? <View style={styles.dotClass} /> : null}
                {isHoliday ? <View style={styles.dotHoliday} /> : null}
                {hasEvent ? <View style={styles.dotEvent} /> : null}
                {hasHomework ? <View style={styles.dotHomework} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}><View style={styles.dotClass} /><Text style={styles.legendText}>Class day</Text></View>
          <View style={styles.legendItem}><View style={styles.dotHoliday} /><Text style={styles.legendText}>Holiday</Text></View>
          <View style={styles.legendItem}><View style={styles.dotEvent} /><Text style={styles.legendText}>Academic event</Text></View>
          <View style={styles.legendItem}><View style={styles.dotHomework} /><Text style={styles.legendText}>Homework</Text></View>
        </View>
          </>
        ) : (
          <View style={styles.agendaWrap}>
            {upcomingEvents.slice(0, 8).map((event) => (
              <View key={`agenda-${event.id}`} style={styles.agendaRow}>
                <View style={styles.agendaDateBadge}>
                  <Text style={styles.agendaDateText}>{formatShortDate(event.startDate)}</Text>
                </View>
                <View style={styles.agendaBody}>
                  <Text style={styles.agendaTitle}>{event.title}</Text>
                  <Text style={styles.agendaMeta}>
                    {event.type}
                    {event.endDate && event.endDate !== event.startDate ? ` • until ${event.endDate}` : ''}
                  </Text>
                </View>
              </View>
            ))}
            {upcomingEvents.length === 0 && <Text style={styles.infoText}>Filtreye uygun etkinlik yok.</Text>}
          </View>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.blockTitle}>Selected Day: {selectedDate} ({selectedInfo.dayKey})</Text>
        <Text style={styles.infoText}>{formatDateLabel(selectedDate)}</Text>

        <View style={styles.weekStrip}>
          {selectedWeekDates.map((date) => {
            const iso = toISO(date);
            const isSelected = iso === selectedDate;
            const isHoliday = holidayMap.has(iso);
            const hasEvent = dayEvents.has(iso);
            const hasHomework = homeworkDateMap.has(iso);
            const dayKey = WEEK_DAYS[date.getDay()];
            const isClass = iso >= termStart && iso <= termEnd && !isHoliday && classWeekDays.has(dayKey);
            return (
              <TouchableOpacity
                key={`week-${iso}`}
                style={[styles.weekDayPill, isSelected && styles.weekDayPillSelected]}
                onPress={() => {
                  setSelectedDate(iso);
                  if (date.getMonth() !== monthDate.getMonth() || date.getFullYear() !== monthDate.getFullYear()) {
                    setMonthDate(new Date(date.getFullYear(), date.getMonth(), 1));
                  }
                }}
              >
                <Text style={[styles.weekDayName, isSelected && styles.weekDayNameSelected]}>{WEEK_DAYS[date.getDay()].slice(0, 2)}</Text>
                <Text style={[styles.weekDayNum, isSelected && styles.weekDayNameSelected]}>{date.getDate()}</Text>
                {isHoliday ? <View style={styles.weekHolidayMark} /> : null}
                {isClass ? <View style={styles.weekClassMark} /> : null}
                {hasEvent ? <View style={styles.weekEventMark} /> : null}
                {hasHomework ? <View style={styles.weekHomeworkMark} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {!selectedInfo.inTerm ? (
          <Text style={styles.infoText}>Bu tarih seçili dönem aralığında değil.</Text>
        ) : null}

        {selectedInfo.holidayName ? (
          <View style={styles.holidayBox}>
            <Text style={styles.holidayTitle}>Holiday</Text>
            <Text style={styles.holidayName}>{selectedInfo.holidayName}</Text>
          </View>
        ) : null}

        {selectedInfo.events.length > 0 && (
          <View style={styles.eventBlock}>
            <Text style={styles.eventBlockTitle}>Academic Events</Text>
            {selectedInfo.events.map((event) => (
              <View key={`${event.id}-${selectedDate}`} style={styles.eventRow}>
                <Text style={styles.eventType}>{event.type}</Text>
                <View style={styles.eventBody}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.source ? <Text style={styles.eventSource}>{event.source}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        )}

        {!selectedInfo.holidayName && selectedInfo.inTerm && selectedInfo.sessions.length === 0 ? (
          <Text style={styles.infoText}>Bu section için ders görünmüyor.</Text>
        ) : null}

        {selectedDayHomework.length > 0 ? (
          <View style={styles.eventBlock}>
            <Text style={styles.eventBlockTitle}>Homework on {selectedDate}</Text>
            {selectedDayHomework.map((item) => (
              <View key={item.id} style={styles.homeworkItem}>
                <View style={styles.homeworkBody}>
                  <Text style={[styles.homeworkTitle, item.done && styles.homeworkDoneText]}>{item.title}</Text>
                  {item.note ? <Text style={styles.homeworkNote}>{item.note}</Text> : null}
                </View>
                <View style={styles.homeworkActions}>
                  <TouchableOpacity
                    style={[styles.homeworkActionBtn, item.done && styles.homeworkDoneBtn]}
                    onPress={() => toggleHomeworkDone(item.id)}
                  >
                    <Text style={styles.homeworkActionText}>{item.done ? 'Undo' : 'Done'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.homeworkActionBtn, styles.homeworkDeleteBtn]}
                    onPress={() => removeHomework(item.id)}
                  >
                    <Text style={styles.homeworkDeleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {selectedInfo.sessions.map((session) => {
          const instructor = parseInstructor(session.label, activeSection?.instructors || {});
          return (
            <View key={session.id} style={styles.sessionRow}>
              <View>
                <Text style={styles.sessionTime}>{session.time}</Text>
                <Text style={styles.sessionLabel}>{session.label}</Text>
              </View>
              {instructor ? <Text style={styles.sessionInstructor}>{instructor}</Text> : null}
            </View>
          );
        })}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.blockTitle}>Upcoming Holidays</Text>
        {upcomingHolidays.length === 0 ? (
          <Text style={styles.infoText}>Yakın tarihte tatil görünmüyor.</Text>
        ) : (
          upcomingHolidays.map((h) => (
            <View key={`holiday-${h.date}`} style={styles.holidayRow}>
              <Text style={styles.holidayDate}>{h.date}</Text>
              <Text style={styles.holidayRowName}>{h.name}</Text>
            </View>
          ))
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.blockTitle}>Ödev Ekle</Text>
        <TextInput
          style={styles.input}
          value={homeworkTitle}
          onChangeText={setHomeworkTitle}
          placeholder="Ödev başlığı (örn: Writing draft 2)"
          placeholderTextColor={colors.muted}
        />
        <View style={styles.rowWrap}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            value={homeworkDueDate}
            onChangeText={setHomeworkDueDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.inlineSelectBtn}
            onPress={() => setHomeworkDueDate(selectedDate)}
          >
            <Text style={styles.inlineSelectBtnText}>Use Selected Day</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.input, styles.noteInput]}
          value={homeworkNote}
          onChangeText={setHomeworkNote}
          placeholder="Kısa not (opsiyonel)"
          placeholderTextColor={colors.muted}
          multiline
        />
        <View style={styles.rowWrap}>
          <TouchableOpacity style={styles.addHomeworkBtn} onPress={addHomework}>
            <Text style={styles.addHomeworkText}>Ödevi Ekle</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.blockTitle}>Upcoming Homework</Text>
        {upcomingHomework.length === 0 ? (
          <Text style={styles.infoText}>Yakın tarihte açık ödev görünmüyor.</Text>
        ) : (
          upcomingHomework.map((item) => (
            <View key={`homework-upcoming-${item.id}`} style={styles.homeworkRow}>
              <View style={styles.homeworkDateBadge}>
                <Text style={styles.homeworkDateText}>{formatShortDate(item.dueDate)}</Text>
              </View>
              <View style={styles.homeworkBody}>
                <Text style={styles.homeworkTitle}>{item.title}</Text>
                {item.note ? <Text style={styles.homeworkNote}>{item.note}</Text> : null}
              </View>
              <View style={styles.homeworkActions}>
                <TouchableOpacity style={styles.homeworkActionBtn} onPress={() => toggleHomeworkDone(item.id)}>
                  <Text style={styles.homeworkActionText}>Done</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.homeworkActionBtn, styles.homeworkDeleteBtn]} onPress={() => removeHomework(item.id)}>
                  <Text style={styles.homeworkDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.blockTitle}>Upcoming Academic Events</Text>
        {upcomingEvents.length === 0 ? (
          <Text style={styles.infoText}>Yakın tarihte akademik etkinlik görünmüyor.</Text>
        ) : (
          upcomingEvents.map((event) => (
            <View key={`event-${event.id}`} style={styles.upcomingEventRow}>
              <Text style={styles.holidayDate}>
                {event.startDate}{event.endDate && event.endDate !== event.startDate ? ` → ${event.endDate}` : ''}
              </Text>
              <Text style={styles.upcomingEventTitle}>{event.title}</Text>
              <Text style={styles.upcomingEventType}>{event.type}</Text>
            </View>
          ))
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.blockTitle}>Not</Text>
        <Text style={styles.meta}>Takvim verileri `data/university_schedule_2025_fall.json` ve `data/university_schedule_2026_spring.json` dosyalarından okunur.</Text>
        <Text style={styles.meta}>Ödevler cihazda saklanır; uygulama yeniden açılsa da listede kalır.</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  backBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.18)',
  },
  backBtnText: {
    fontSize: typography.small,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'right',
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    color: colors.textOnDarkMuted,
  },
  countdownCard: {
    backgroundColor: '#1E1B4B',
    borderColor: '#312E81',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  countdownTitle: {
    fontSize: 16,
    color: '#A5B4FC',
    fontWeight: '800',
    fontFamily: typography.fontHeadline,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
  },
  countdownBlocks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timeBlock: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  timeVal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    fontFamily: typography.fontHeadline,
  },
  timeLab: {
    fontSize: 11,
    color: '#C7D2FE',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  colon: {
    fontSize: 28,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
    paddingBottom: 16,
  },
  countdownSub: {
    fontSize: 13,
    color: '#818CF8',
    marginTop: 16,
    fontWeight: '600',
  },
  heroCard: {
    marginBottom: spacing.md,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  heroTitle: {
    fontSize: typography.h2,
    fontFamily: typography.fontHeadline,
    color: '#1D4ED8',
    marginBottom: spacing.xs,
  },
  heroSub: {
    fontSize: typography.small,
    color: '#172554',
    marginBottom: spacing.xs,
  },
  termText: {
    fontSize: typography.xsmall,
    color: colors.muted,
  },
  card: {
    marginBottom: spacing.md,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  kpiCard: {
    flex: 1,
    marginBottom: 0,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderColor: '#DBEAFE',
  },
  kpiValue: {
    fontSize: typography.h3,
    color: '#1D4ED8',
    fontFamily: typography.fontHeadline,
  },
  kpiLabel: {
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  dashboardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dashboardItem: {
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: '#F8FAFC',
  },
  dashboardLabel: {
    fontSize: typography.xsmall,
    color: '#172554',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dashboardValue: {
    fontSize: typography.body,
    color: colors.text,
    fontFamily: typography.fontHeadline,
    marginBottom: 2,
  },
  dashboardSub: {
    fontSize: typography.xsmall,
    color: colors.muted,
  },
  quickBtn: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: '#EFF6FF',
  },
  quickBtnText: {
    fontSize: typography.small,
    color: '#1D4ED8',
    fontFamily: typography.fontHeadline,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  modePill: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
  },
  modePillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  modePillText: {
    color: colors.muted,
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
  },
  modePillTextActive: {
    color: colors.primaryDark,
  },
  metaTiny: {
    fontSize: typography.xsmall,
    color: colors.muted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  filterChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  filterPill: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: '#F8FAFC',
  },
  filterPillActive: {
    borderColor: '#1D4ED8',
    backgroundColor: '#DBEAFE',
  },
  filterPillText: {
    fontSize: typography.xsmall,
    color: '#475569',
    textTransform: 'capitalize',
    fontFamily: typography.fontHeadline,
  },
  filterPillTextActive: {
    color: '#172554',
  },
  blockTitle: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  pillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  pillText: {
    fontSize: typography.small,
    color: colors.muted,
    fontFamily: typography.fontHeadline,
  },
  pillTextActive: {
    color: colors.primaryDark,
  },
  metaRow: {
    marginTop: spacing.md,
    gap: 4,
  },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  todayBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  todayBtnText: {
    color: '#fff',
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
  },
  meta: {
    fontSize: typography.small,
    color: colors.muted,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  monthBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthBtnText: {
    fontSize: 24,
    color: colors.primary,
    marginTop: -2,
  },
  monthTitle: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekHeaderText: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: typography.xsmall,
    color: colors.muted,
    fontFamily: typography.fontHeadline,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#EDF2F7',
    position: 'relative',
  },
  dayWeekend: {
    backgroundColor: '#F8FAFC',
  },
  daySelected: {
    backgroundColor: '#DBEAFE',
  },
  dayClass: {
    backgroundColor: '#F0FDF4',
  },
  dayHoliday: {
    backgroundColor: '#FEF2F2',
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: '#1D4ED8',
  },
  dayText: {
    fontSize: typography.small,
    color: colors.text,
  },
  dayTextSelected: {
    fontFamily: typography.fontHeadline,
  },
  dayTextHoliday: {
    color: '#B91C1C',
    fontFamily: typography.fontHeadline,
  },
  dotClass: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    position: 'absolute',
    bottom: 6,
  },
  dotHoliday: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
    position: 'absolute',
    bottom: 6,
    right: 8,
  },
  dotEvent: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    position: 'absolute',
    top: 6,
    left: 8,
  },
  dotHomework: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7C3AED',
    position: 'absolute',
    top: 6,
    right: 8,
  },
  legendRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendText: {
    fontSize: typography.xsmall,
    color: colors.muted,
  },
  agendaWrap: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  agendaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    backgroundColor: '#F8FBFF',
    borderRadius: 12,
    padding: spacing.sm,
  },
  agendaDateBadge: {
    width: 58,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  agendaDateText: {
    fontSize: typography.xsmall,
    color: '#1E40AF',
    fontFamily: typography.fontHeadline,
  },
  agendaBody: {
    flex: 1,
  },
  agendaTitle: {
    fontSize: typography.small,
    color: '#172554',
    fontFamily: typography.fontHeadline,
  },
  agendaMeta: {
    marginTop: 2,
    fontSize: typography.xsmall,
    color: colors.muted,
    textTransform: 'capitalize',
  },
  infoText: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: 4,
  },
  weekDayPill: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    position: 'relative',
  },
  weekDayPillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  weekDayName: {
    fontSize: 10,
    color: colors.muted,
    fontFamily: typography.fontHeadline,
  },
  weekDayNum: {
    fontSize: typography.small,
    color: colors.text,
    fontFamily: typography.fontHeadline,
  },
  weekDayNameSelected: {
    color: colors.primaryDark,
  },
  weekHolidayMark: {
    width: 5,
    height: 5,
    borderRadius: 99,
    backgroundColor: colors.error,
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  weekClassMark: {
    width: 5,
    height: 5,
    borderRadius: 99,
    backgroundColor: colors.success,
    position: 'absolute',
    bottom: 4,
    left: 4,
  },
  weekEventMark: {
    width: 5,
    height: 5,
    borderRadius: 99,
    backgroundColor: '#2563EB',
    position: 'absolute',
    top: 4,
    right: 4,
  },
  weekHomeworkMark: {
    width: 5,
    height: 5,
    borderRadius: 99,
    backgroundColor: '#7C3AED',
    position: 'absolute',
    top: 4,
    left: 4,
  },
  eventBlock: {
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  eventBlockTitle: {
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    color: '#1E40AF',
    marginBottom: spacing.xs,
  },
  eventRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  eventType: {
    minWidth: 80,
    fontSize: typography.xsmall,
    color: '#1D4ED8',
    textTransform: 'uppercase',
    fontFamily: typography.fontHeadline,
  },
  eventBody: {
    flex: 1,
  },
  eventTitle: {
    fontSize: typography.small,
    color: '#172554',
    fontFamily: typography.fontHeadline,
  },
  eventSource: {
    fontSize: 11,
    color: '#475569',
  },
  holidayBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  holidayTitle: {
    fontSize: typography.xsmall,
    color: '#991B1B',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  holidayName: {
    fontSize: typography.body,
    fontFamily: typography.fontHeadline,
    color: '#B91C1C',
  },
  holidayRow: {
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    gap: 2,
  },
  holidayDate: {
    fontSize: typography.xsmall,
    color: '#991B1B',
    fontFamily: typography.fontHeadline,
  },
  holidayRowName: {
    fontSize: typography.small,
    color: '#7F1D1D',
  },
  upcomingEventRow: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  upcomingEventTitle: {
    fontSize: typography.small,
    color: '#172554',
    fontFamily: typography.fontHeadline,
  },
  upcomingEventType: {
    marginTop: 2,
    fontSize: typography.xsmall,
    color: '#1D4ED8',
    textTransform: 'uppercase',
  },
  sessionRow: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sessionTime: {
    fontSize: typography.small,
    fontFamily: typography.fontHeadline,
    color: colors.text,
  },
  sessionLabel: {
    fontSize: typography.small,
    color: colors.muted,
  },
  sessionInstructor: {
    fontSize: typography.xsmall,
    color: colors.primaryDark,
    fontFamily: typography.fontHeadline,
    textAlign: 'right',
    maxWidth: '45%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.text,
    marginBottom: spacing.sm,
    minWidth: 180,
  },
  dateInput: {
    flex: 1,
    marginBottom: 0,
  },
  noteInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  inlineSelectBtn: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineSelectBtnText: {
    color: '#1E40AF',
    fontFamily: typography.fontHeadline,
    fontSize: typography.xsmall,
  },
  addHomeworkBtn: {
    borderWidth: 1,
    borderColor: '#1D4ED8',
    backgroundColor: '#1D4ED8',
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addHomeworkText: {
    color: '#FFFFFF',
    fontFamily: typography.fontHeadline,
    fontSize: typography.small,
  },
  homeworkRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  homeworkDateBadge: {
    width: 58,
    borderRadius: 8,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  homeworkDateText: {
    fontSize: typography.xsmall,
    color: '#5B21B6',
    fontFamily: typography.fontHeadline,
  },
  homeworkItem: {
    borderWidth: 1,
    borderColor: '#DDD6FE',
    backgroundColor: '#F5F3FF',
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  homeworkBody: {
    flex: 1,
  },
  homeworkTitle: {
    fontSize: typography.small,
    color: '#4C1D95',
    fontFamily: typography.fontHeadline,
  },
  homeworkDoneText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  homeworkNote: {
    marginTop: 2,
    fontSize: typography.xsmall,
    color: '#5B21B6',
  },
  homeworkActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  homeworkActionBtn: {
    borderWidth: 1,
    borderColor: '#C4B5FD',
    backgroundColor: '#EDE9FE',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  homeworkDoneBtn: {
    borderColor: '#22C55E',
    backgroundColor: '#DCFCE7',
  },
  homeworkActionText: {
    color: '#4C1D95',
    fontFamily: typography.fontHeadline,
    fontSize: typography.xsmall,
  },
  homeworkDeleteBtn: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  homeworkDeleteText: {
    color: '#B91C1C',
    fontFamily: typography.fontHeadline,
    fontSize: typography.xsmall,
  },
});
