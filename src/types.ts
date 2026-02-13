export interface TeamMember {
  id: string;
  name: string;
  color: string;
}

export interface Recurrence {
  type: 'none' | 'daily' | 'weekly' | 'monthly';
  interval: number;
  weekdays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  endDate: string | null; // 'yyyy-MM-dd' or null for no end
}

export interface Chore {
  id: string;
  title: string;
  description: string;
  assigneeId: string | null;
  date: string; // 'yyyy-MM-dd'
  recurrence: Recurrence;
  completed: string[]; // array of 'yyyy-MM-dd' occurrence dates that are completed
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  choreId: string;
  occurrenceDate: string; // 'yyyy-MM-dd'
  assigneeId: string | null;
  color: string;
  isCompleted: boolean;
}
