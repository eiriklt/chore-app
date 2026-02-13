import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import type { Chore, TeamMember, Recurrence } from '../types';

interface Props {
  chore: Chore | null;
  initialDate?: Date;
  occurrenceDate?: string;
  members: TeamMember[];
  onSave: (chore: Chore) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (choreId: string, occurrenceDate: string) => void;
  onClose: () => void;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const defaultRecurrence: Recurrence = {
  type: 'none',
  interval: 1,
  weekdays: [],
  endDate: null,
};

export function ChoreModal({
  chore,
  initialDate,
  occurrenceDate,
  members,
  onSave,
  onDelete,
  onToggleComplete,
  onClose,
}: Props) {
  const isEdit = !!chore;

  const [title, setTitle] = useState(chore?.title ?? '');
  const [description, setDescription] = useState(chore?.description ?? '');
  const [assigneeId, setAssigneeId] = useState<string>(chore?.assigneeId ?? '');
  const [date, setDate] = useState(
    chore?.date ?? (initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
  );
  const [recurrence, setRecurrence] = useState<Recurrence>(
    chore?.recurrence ?? { ...defaultRecurrence }
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const savedChore: Chore = {
      id: chore?.id ?? crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      assigneeId: assigneeId || null,
      date,
      recurrence,
      completed: chore?.completed ?? [],
    };
    onSave(savedChore);
    onClose();
  };

  const handleDelete = () => {
    if (chore) {
      onDelete(chore.id);
      onClose();
    }
  };

  const isCompleted = chore && occurrenceDate
    ? chore.completed.includes(occurrenceDate)
    : false;

  const toggleWeekday = (day: number) => {
    setRecurrence(prev => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter(d => d !== day)
        : [...prev.weekdays, day],
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Chore' : 'New Chore'}</h2>
          <button className="btn-icon" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="chore-title">Title</label>
            <input
              id="chore-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Clean kitchen"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="chore-desc">Description</label>
            <textarea
              id="chore-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="chore-date">Date</label>
              <input
                id="chore-date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="chore-assignee">Assignee</label>
              <select
                id="chore-assignee"
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="chore-recurrence">Recurrence</label>
            <select
              id="chore-recurrence"
              value={recurrence.type}
              onChange={e => setRecurrence({
                ...recurrence,
                type: e.target.value as Recurrence['type'],
              })}
            >
              <option value="none">No repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {recurrence.type !== 'none' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="chore-interval">Every</label>
                  <input
                    id="chore-interval"
                    type="number"
                    min={1}
                    value={recurrence.interval}
                    onChange={e => setRecurrence({
                      ...recurrence,
                      interval: parseInt(e.target.value) || 1,
                    })}
                  />
                  <span className="interval-label">
                    {recurrence.type === 'daily' && 'day(s)'}
                    {recurrence.type === 'weekly' && 'week(s)'}
                    {recurrence.type === 'monthly' && 'month(s)'}
                  </span>
                </div>
                <div className="form-group">
                  <label htmlFor="chore-end">End date</label>
                  <input
                    id="chore-end"
                    type="date"
                    value={recurrence.endDate ?? ''}
                    onChange={e => setRecurrence({
                      ...recurrence,
                      endDate: e.target.value || null,
                    })}
                  />
                </div>
              </div>

              {recurrence.type === 'weekly' && (
                <div className="form-group">
                  <label>Repeat on</label>
                  <div className="weekday-picker">
                    {WEEKDAY_LABELS.map((label, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`weekday-btn ${recurrence.weekdays.includes(i) ? 'active' : ''}`}
                        onClick={() => toggleWeekday(i)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="modal-actions">
            {isEdit && occurrenceDate && (
              <button
                type="button"
                className={`btn ${isCompleted ? 'btn-completed' : 'btn-complete'}`}
                onClick={() => onToggleComplete(chore.id, occurrenceDate)}
              >
                {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
              </button>
            )}
            {isEdit && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
            <div className="modal-actions-right">
              <button type="button" className="btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                {isEdit ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
