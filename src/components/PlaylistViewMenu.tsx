import React, { useState } from 'react';

interface PlaylistViewMenuProps {
  onViewChange: (view: 'grid' | 'list') => void;
  onGridSizeChange: (size: number) => void;
  onSortChange: (sort: string) => void;
  currentView: 'grid' | 'list';
  gridSize: number;
}

export function PlaylistViewMenu({
  onViewChange,
  onGridSizeChange,
  onSortChange,
  currentView,
  gridSize,
}: PlaylistViewMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        className="hover:text-white p-2"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        ⋮
      </button>
      
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-md shadow-lg py-1 z-50">
          <button
            className="w-full px-4 py-2 text-left hover:bg-zinc-700 flex items-center gap-2"
            onClick={() => {
              onViewChange('grid');
              setIsMenuOpen(false);
            }}
          >
            □ Grid
            {currentView === 'grid' && (
              <input
                type="range"
                className="ml-auto w-24"
                value={gridSize}
                onChange={(e) => onGridSizeChange(Number(e.target.value))}
                min={2}
                max={5}
                step={1}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </button>
          
          <button
            className="w-full px-4 py-2 text-left hover:bg-zinc-700 flex items-center gap-2"
            onClick={() => {
              onViewChange('list');
              setIsMenuOpen(false);
            }}
          >
            ≡ List
          </button>
          
          <hr className="my-1 border-zinc-700" />
          
          <div className="px-4 py-2 text-sm text-zinc-400">Sort By</div>
          <button
            className="w-full px-4 py-2 text-left hover:bg-zinc-700"
            onClick={() => {
              onSortChange('dateAdded');
              setIsMenuOpen(false);
            }}
          >
            Date Added
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-zinc-700"
            onClick={() => {
              onSortChange('title');
              setIsMenuOpen(false);
            }}
          >
            Title
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-zinc-700"
            onClick={() => {
              onSortChange('artist');
              setIsMenuOpen(false);
            }}
          >
            Artist
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-zinc-700"
            onClick={() => {
              onSortChange('year');
              setIsMenuOpen(false);
            }}
          >
            Year
          </button>
        </div>
      )}
    </div>
  );
} 