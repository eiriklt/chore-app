import { useState } from 'react';
import type { TeamMember } from '../types';

const COLORS = [
  '#4A90D9', '#E06B50', '#50B878', '#F5A623',
  '#9B59B6', '#1ABC9C', '#E74C8B', '#3498DB',
  '#E67E22', '#2ECC71',
];

interface Props {
  members: TeamMember[];
  filterMemberIds: string[];
  onAddMember: (member: TeamMember) => void;
  onRemoveMember: (id: string) => void;
  onFilterChange: (ids: string[]) => void;
}

export function TeamManager({ members, filterMemberIds, onAddMember, onRemoveMember, onFilterChange }: Props) {
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    onAddMember({
      id: crypto.randomUUID(),
      name,
      color: COLORS[members.length % COLORS.length],
    });
    setNewName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const toggleFilter = (id: string) => {
    if (filterMemberIds.includes(id)) {
      onFilterChange(filterMemberIds.filter(fid => fid !== id));
    } else {
      onFilterChange([...filterMemberIds, id]);
    }
  };

  return (
    <div className="team-manager">
      <h3>Team Members</h3>
      <div className="team-add">
        <input
          type="text"
          placeholder="Add member..."
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn btn-small" onClick={handleAdd}>Add</button>
      </div>
      <ul className="team-list">
        {members.map(member => (
          <li key={member.id} className="team-member">
            <label className="team-member-label">
              <input
                type="checkbox"
                checked={filterMemberIds.includes(member.id)}
                onChange={() => toggleFilter(member.id)}
              />
              <span
                className="member-color"
                style={{ backgroundColor: member.color }}
              />
              <span className="member-name">{member.name}</span>
            </label>
            <button
              className="btn-icon"
              onClick={() => onRemoveMember(member.id)}
              title="Remove member"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
      {members.length === 0 && (
        <p className="empty-hint">No team members yet. Add someone above.</p>
      )}
    </div>
  );
}
