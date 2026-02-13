import { useState, useCallback } from 'react';
import { useChores } from './hooks/useChores';
import { Calendar } from './components/Calendar';
import { ChoreModal } from './components/ChoreModal';
import { Sidebar } from './components/Sidebar';
import { TeamManager } from './components/TeamManager';
import type { Chore, CalendarEvent } from './types';
import './App.css';

interface ModalState {
  open: boolean;
  chore: Chore | null;
  initialDate?: Date;
  occurrenceDate?: string;
}

export default function App() {
  const {
    chores,
    members,
    addChore,
    updateChore,
    deleteChore,
    toggleComplete,
    addMember,
    removeMember,
    getEvents,
  } = useChores();

  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    chore: null,
  });

  const [filterMemberIds, setFilterMemberIds] = useState<string[]>([]);

  const openNewChore = useCallback((initialDate?: Date) => {
    setModalState({ open: true, chore: null, initialDate });
  }, []);

  const openEditChore = useCallback((event: CalendarEvent) => {
    const chore = chores.find(c => c.id === event.choreId) ?? null;
    setModalState({
      open: true,
      chore,
      occurrenceDate: event.occurrenceDate,
    });
  }, [chores]);

  const closeModal = useCallback(() => {
    setModalState({ open: false, chore: null });
  }, []);

  const handleSave = useCallback((chore: Chore) => {
    if (chores.some(c => c.id === chore.id)) {
      updateChore(chore);
    } else {
      addChore(chore);
    }
  }, [chores, addChore, updateChore]);

  const handleSelectSlot = useCallback((slotInfo: { start: Date }) => {
    openNewChore(slotInfo.start);
  }, [openNewChore]);

  return (
    <div className="app">
      <Sidebar onAddChore={() => openNewChore()}>
        <TeamManager
          members={members}
          filterMemberIds={filterMemberIds}
          onAddMember={addMember}
          onRemoveMember={removeMember}
          onFilterChange={setFilterMemberIds}
        />
      </Sidebar>
      <main className="main-content">
        <Calendar
          getEvents={getEvents}
          members={members}
          filterMemberIds={filterMemberIds}
          onSelectEvent={openEditChore}
          onSelectSlot={handleSelectSlot}
        />
      </main>
      {modalState.open && (
        <ChoreModal
          chore={modalState.chore}
          initialDate={modalState.initialDate}
          occurrenceDate={modalState.occurrenceDate}
          members={members}
          onSave={handleSave}
          onDelete={deleteChore}
          onToggleComplete={toggleComplete}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
