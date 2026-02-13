import { useState, useMemo, useCallback } from 'react';
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  type View,
} from 'react-big-calendar';
import {
  format,
  parse,
  startOfWeek,
  getDay,
  startOfMonth,
  endOfMonth,
  addDays,
  subDays,
} from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import type { CalendarEvent, TeamMember } from '../types';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
});

interface Props {
  getEvents: (start: Date, end: Date, memberColors: Map<string, string>) => CalendarEvent[];
  members: TeamMember[];
  filterMemberIds: string[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectSlot: (slotInfo: { start: Date }) => void;
}

export function Calendar({ getEvents, members, filterMemberIds, onSelectEvent, onSelectSlot }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>('month');

  const memberColors = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach(m => map.set(m.id, m.color));
    return map;
  }, [members]);

  const events = useMemo(() => {
    const rangeStart = subDays(startOfMonth(currentDate), 7);
    const rangeEnd = addDays(endOfMonth(currentDate), 7);
    let allEvents = getEvents(rangeStart, rangeEnd, memberColors);

    if (filterMemberIds.length > 0) {
      allEvents = allEvents.filter(
        e => e.assigneeId && filterMemberIds.includes(e.assigneeId)
      );
    }

    return allEvents;
  }, [getEvents, currentDate, memberColors, filterMemberIds]);

  const eventStyleGetter = useCallback((event: CalendarEvent) => ({
    style: {
      backgroundColor: event.isCompleted ? '#ccc' : event.color,
      opacity: event.isCompleted ? 0.6 : 1,
      color: '#fff',
      borderRadius: '4px',
      border: 'none',
      textDecoration: event.isCompleted ? 'line-through' : 'none',
    },
  }), []);

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  return (
    <div className="calendar-container">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        date={currentDate}
        view={currentView}
        onNavigate={handleNavigate}
        onView={setCurrentView}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        style={{ height: '100%' }}
      />
    </div>
  );
}
