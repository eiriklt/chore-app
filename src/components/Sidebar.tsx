import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onAddChore: () => void;
}

export function Sidebar({ children, onAddChore }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Office Chores</h1>
        <button className="btn btn-primary" onClick={onAddChore}>
          + New Chore
        </button>
      </div>
      <div className="sidebar-content">
        {children}
      </div>
    </aside>
  );
}
