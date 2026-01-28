
import React from 'react';
import { Logo } from './Logo';

type View = 'rfps' | 'store' | 'config' | 'logs';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const navItems: { id: View; label: string }[] = [
    { id: 'rfps', label: 'RFPs' },
    { id: 'store', label: 'Store' },
    { id: 'config', label: 'Config' },
    { id: 'logs', label: 'Logs' },
  ];

  return (
    <header className="bg-base-200 sticky top-0 z-10 px-6 py-3 border-b border-base-300 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Logo />
        <h1 className="text-xl font-bold text-ink-700">
          TenderFlow
        </h1>
      </div>
      <nav className="flex items-center gap-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            aria-current={currentView === item.id ? 'page' : undefined}
            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
              currentView === item.id
                ? 'bg-accent-700 text-white'
                : 'text-ink-500 hover:bg-base-300 hover:text-ink-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
};
