import React from 'react';
import { Music2, Mic2, Disc, Music } from 'lucide-react';

interface LibraryNavProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

export const LibraryNav: React.FC<LibraryNavProps> = ({ onNavigate, currentView }) => {
  const navItems = [
    { id: 'playlists', label: 'Playlists', icon: Music2 },
    { id: 'artists', label: 'Artists', icon: Mic2 },
    { id: 'albums', label: 'Albums', icon: Disc },
    { id: 'songs', label: 'Songs', icon: Music },
  ];

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">My Music</h2>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`w-full text-left px-4 py-3 flex items-center space-x-4 hover:bg-zinc-900 transition-colors
            ${currentView === item.id ? 'text-white' : 'text-zinc-400'}`}
        >
          <item.icon className="w-5 h-5 text-red-500" />
          <span className="text-base font-medium">{item.label}</span>
          <span className="ml-auto text-zinc-400">›</span>
        </button>
      ))}
    </div>
  );
}; 