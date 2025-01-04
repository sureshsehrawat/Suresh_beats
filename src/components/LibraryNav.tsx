import React from 'react';

interface LibraryNavProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

export const LibraryNav: React.FC<LibraryNavProps> = ({ onNavigate, currentView }) => {
  const navItems = [
    { id: 'playlists', label: 'Playlists', icon: '♫' },
    { id: 'albums', label: 'Albums', icon: '📀' },
    { id: 'artists', label: 'Artists', icon: '🎤' },
    { id: 'songs', label: 'Songs', icon: '♪' },
  ];

  return (
    <div className="mb-6">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`w-full text-left px-4 py-3 flex items-center space-x-4 border-b border-zinc-800 
            ${currentView === item.id ? 'text-red-500' : 'text-white'}`}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-lg">{item.label}</span>
          <span className="ml-auto">›</span>
        </button>
      ))}
    </div>
  );
}; 