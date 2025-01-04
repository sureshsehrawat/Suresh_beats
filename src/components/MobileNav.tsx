import React from 'react';
import { Home, Search, Library, Settings, Folder } from 'lucide-react';
import type { Song } from '../lib/subsonic';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentSong: Song | null;
}

export function MobileNav({ currentView, onNavigate, currentSong }: MobileNavProps) {
  const navItems = [
    { view: 'home', icon: Home, label: 'Home' },
    { view: 'search', icon: Search, label: 'Search' },
    { view: 'folders', icon: Folder, label: 'Folders' },
    { view: 'nowPlaying', icon: Library, label: 'Now Playing' },
    { view: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 z-50">
      <div className="flex justify-around py-3">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={`flex flex-col items-center ${
              currentView === item.view ? 'text-white' : 'text-zinc-400'
            } hover:text-white`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}