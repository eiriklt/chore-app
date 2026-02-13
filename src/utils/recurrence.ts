import {
  format,
  addDays,
  addWeeks,
  addMonths,
  isBefore,
  isAfter,
  parseISO,
  startOfDay,
  getDay,
} from 'date-fns';
import type { Chore, CalendarEvent } from '../types';

export function expandChoreToEvents(
  chore: Chore,
  rangeStart: Date,
  rangeEnd: Date,
  memberColors: Map<string, string>
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const choreStart = parseISO(chore.date);
  const color = chore.assigneeId
    ? memberColors.get(chore.assigneeId) ?? '#999'
    : '#999';

  if (chore.recurrence.type === 'none') {
    if (!isBefore(choreStart, rangeStart) || !isAfter(choreStart, rangeEnd)) {
      const dateStr = chore.date;
      if (!isBefore(parseISO(dateStr), rangeStart) && !isAfter(parseISO(dateStr), rangeEnd)) {
        events.push(makeEvent(chore, dateStr, color));
      }
    }
    return events;
  }

  const recEndDate = chore.recurrence.endDate
    ? parseISO(chore.recurrence.endDate)
    : null;
  const interval = Math.max(1, chore.recurrence.interval);
  let current = startOfDay(choreStart);
  let iterations = 0;
  const maxIterations = 1000;

  while (iterations < maxIterations) {
    iterations++;

    if (recEndDate && isAfter(current, recEndDate)) break;
    if (isAfter(current, rangeEnd)) break;

    if (!isBefore(current, rangeStart)) {
      const dateStr = format(current, 'yyyy-MM-dd');

      if (chore.recurrence.type === 'weekly' && chore.recurrence.weekdays.length > 0) {
        // For weekly with specific weekdays, check each day in the week
        for (let d = 0; d < 7; d++) {
          const dayInWeek = addDays(current, d);
          if (isAfter(dayInWeek, rangeEnd)) break;
          if (recEndDate && isAfter(dayInWeek, recEndDate)) break;
          if (chore.recurrence.weekdays.includes(getDay(dayInWeek))) {
            const dayStr = format(dayInWeek, 'yyyy-MM-dd');
            events.push(makeEvent(chore, dayStr, color));
          }
        }
      } else {
        events.push(makeEvent(chore, dateStr, color));
      }
    }

    switch (chore.recurrence.type) {
      case 'daily':
        current = addDays(current, interval);
        break;
      case 'weekly':
        current = addWeeks(current, interval);
        break;
      case 'monthly':
        current = addMonths(current, interval);
        break;
    }
  }

  return events;
}

function makeEvent(chore: Chore, dateStr: string, color: string): CalendarEvent {
  const date = parseISO(dateStr);
  return {
    id: `${chore.id}_${dateStr}`,
    title: chore.title,
    start: date,
    end: date,
    choreId: chore.id,
    occurrenceDate: dateStr,
    assigneeId: chore.assigneeId,
    color,
    isCompleted: chore.completed.includes(dateStr),
  };
}
