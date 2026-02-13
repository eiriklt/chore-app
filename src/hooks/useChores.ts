import { useCallback } from 'react';
import type { Chore, TeamMember, CalendarEvent } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { expandChoreToEvents } from '../utils/recurrence';

export function useChores() {
  const [chores, setChores] = useLocalStorage<Chore[]>('chores', []);
  const [members, setMembers] = useLocalStorage<TeamMember[]>('members', []);

  const addChore = useCallback((chore: Chore) => {
    setChores(prev => [...prev, chore]);
  }, [setChores]);

  const updateChore = useCallback((updated: Chore) => {
    setChores(prev => prev.map(c => c.id === updated.id ? updated : c));
  }, [setChores]);

  const deleteChore = useCallback((id: string) => {
    setChores(prev => prev.filter(c => c.id !== id));
  }, [setChores]);

  const toggleComplete = useCallback((choreId: string, occurrenceDate: string) => {
    setChores(prev => prev.map(c => {
      if (c.id !== choreId) return c;
      const completed = c.completed.includes(occurrenceDate)
        ? c.completed.filter(d => d !== occurrenceDate)
        : [...c.completed, occurrenceDate];
      return { ...c, completed };
    }));
  }, [setChores]);

  const addMember = useCallback((member: TeamMember) => {
    setMembers(prev => [...prev, member]);
  }, [setMembers]);

  const removeMember = useCallback((id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setChores(prev => prev.map(c =>
      c.assigneeId === id ? { ...c, assigneeId: null } : c
    ));
  }, [setMembers, setChores]);

  const getEvents = useCallback((rangeStart: Date, rangeEnd: Date, memberColors: Map<string, string>): CalendarEvent[] => {
    return chores.flatMap(chore =>
      expandChoreToEvents(chore, rangeStart, rangeEnd, memberColors)
    );
  }, [chores]);

  return {
    chores,
    members,
    addChore,
    updateChore,
    deleteChore,
    toggleComplete,
    addMember,
    removeMember,
    getEvents,
  };
}
