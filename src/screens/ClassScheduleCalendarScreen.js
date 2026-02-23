import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography } from '../theme/tokens';
import scheduleData from '../../data/university_schedule_2025_fall.json';

const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const CLASS_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

export default function ClassScheduleCalendarScreen({ navigation }) {
  const programs = useMemo(() => scheduleData?.programs || [], []);
  const holidays = useMemo(() => scheduleData?.holidays || [], []);
  const academicEvents = useMemo(() => scheduleData?.academicEvents || [], []);
  const holidayMap = useMemo(() => new Map(holidays.map((h) => [h.date, h.name])), [holidays]);

  const defaultProgram = programs[0] || null;
  const defaultSection = defaultProgram?.sections?.[0] || null;

  const [programId, setProgramId] = useState(defaultProgram?.program || null);
  const [sectionId, setSectionId] = useState(defaultSection?.section || null);
  const [monthDate, setMonthDate] = useState(new Date(2025, 8, 1));
  const [selectedDate, setSelectedDate] = useState(scheduleData?.meta?.termStart || toISO(new Date(2025, 8, 15)));
  const [viewMode, setViewMode] = useState('calendar');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');

  const termStart = scheduleData?.meta?.termStart || '2025-09-15';
  const termEnd = scheduleData?.meta?.termEnd || '2026-01-16';

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
      .filter((h) => h.date >= selectedDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3),
    [holidays, selectedDate]
  );

  const upcomingEvents = useMemo(
    () => filteredAcademicEvents
      .filter((e) => e.startDate && (e.endDate || e.startDate) >= selectedDate)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 5),
    [filteredAcademicEvents, selectedDate]
  );
  const nextExamEvent = useMemo(
    () => filteredAcademicEvents
      .filter((e) => {
        const t = String(e.type || '').toLowerCase();
        const title = String(e.title || '').toLowerCase();
        return t.includes('exam') || title.includes('exam') || title.includes('quiz');
      })
      .filter((e) => e.startDate >= selectedDate)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] || null,
    [filteredAcademicEvents, selectedDate]
  );
  const daysUntilNextExam = useMemo(() => {
    if (!nextExamEvent?.startDate) return null;
    const today = new Date(`${selectedDate}T00:00:00`).getTime();
    const exam = new Date(`${nextExamEvent.startDate}T00:00:00`).getTime();
    const diff = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
    return Number.isFinite(diff) ? diff : null;
  }, [nextExamEvent, selectedDate]);

  const selectedInfo = useMemo(() => {
    const dayKey = WEEK_DAYS[selectedDateObj.getDay()];
    const holidayName = holidayMap.get(selectedDate);
    const inTerm = selectedDate >= termStart && selectedDate <= termEnd;
    const sessions = inTerm && !holidayName ? daySessions(activeSection, dayKey) : [];
    const events = dayEvents.get(selectedDate) || [];
    return { dayKey, holidayName, inTerm, sessions, events };
  }, [selectedDate, selectedDateObj, holidayMap, termStart, termEnd, activeSection, dayEvents]);

  return (
    <Screen scroll contentStyle={styles.container}>
      <Card style={styles.heroCard}>
        <Text style={styles.heroTitle}>Ders Programı ve Takvim</Text>
        <Text style={styles.heroSub}>
          Takvim üzerinde ders günlerini ve tatil günlerini birlikte gör.
        </Text>
        <Text style={styles.termText}>Term: {termStart} → {termEnd}</Text>
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
            <Text style={styles.dashboardLabel}>Countdown</Text>
            <Text style={styles.dashboardValue}>{daysUntilNextExam == null ? '--' : `${daysUntilNextExam}d`}</Text>
            <Text style={styles.dashboardSub}>until next exam milestone</Text>
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
              setSelectedDate(toISO(today));
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
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}><View style={styles.dotClass} /><Text style={styles.legendText}>Class day</Text></View>
          <View style={styles.legendItem}><View style={styles.dotHoliday} /><Text style={styles.legendText}>Holiday</Text></View>
          <View style={styles.legendItem}><View style={styles.dotEvent} /><Text style={styles.legendText}>Academic event</Text></View>
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
              </TouchableOpacity>
            );
          })}
        </View>

        {!selectedInfo.inTerm ? (
          <Text style={styles.infoText}>Bu tarih güz dönemi aralığında değil.</Text>
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
        <Text style={styles.meta}>Tatil listesi `data/university_schedule_2025_fall.json` içinden yönetilir.</Text>
        <Text style={styles.meta}>Üniversitenin resmi güncellemesine göre ekstra tatil günleri buraya eklenebilir.</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
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
    color: '#1E3A8A',
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
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dashboardItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: '#F8FAFC',
  },
  dashboardLabel: {
    fontSize: typography.xsmall,
    color: '#1E3A8A',
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
    color: '#1E3A8A',
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
    color: '#1E3A8A',
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
    color: '#1E3A8A',
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
    color: '#1E3A8A',
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
});
