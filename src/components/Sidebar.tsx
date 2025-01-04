import React from 'react';
import { Home, Search, Library, Music2 } from 'lucide-react';

export function Sidebar() {
  return (
    <div className="hidden md:flex flex-col w-64 bg-black p-6">
      <div className="flex items-center gap-2 mb-8">
        <Music2 className="w-8 h-8 text-white" />
        <span className="text-xl font-bold text-white">Music Player</span>
      </div>
      
      <nav className="space-y-4">
        <a href="#" className="flex items-center gap-3 text-zinc-200 hover:text-white transition-colors">
          <Home className="w-6 h-6" />
          <span>Home</span>
        </a>
        <a href="#" className="flex items-center gap-3 text-zinc-200 hover:text-white transition-colors">
          <Search className="w-6 h-6" />
          <span>Search</span>
        </a>
        <a href="#" className="flex items-center gap-3 text-zinc-200 hover:text-white transition-colors">
          <Library className="w-6 h-6" />
          <span>Your Library</span>
        </a>
      </nav>
    </div>
  );
}