import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Grid as GridIcon, List as ListIcon, Check, ChevronRight } from 'lucide-react';

interface ViewOptionsMenuProps {
  onViewChange: (view: 'grid' | 'list') => void;
  onSortChange: (sortBy: string) => void;
  onGridColumnsChange: (columns: number) => void;
  currentView: 'grid' | 'list';
  currentSort: string;
  currentGridColumns: number;
}

export const ViewOptionsMenu: React.FC<ViewOptionsMenuProps> = ({
  onViewChange,
  onSortChange,
  onGridColumnsChange,
  currentView,
  currentSort,
  currentGridColumns,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    { value: 'dateAdded', label: 'Date Added' },
    { value: 'title', label: 'Title' },
    { value: 'artist', label: 'Artist' },
    { value: 'year', label: 'Year' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGridColumnsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    onGridColumnsChange(newValue);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
      >
        <MoreVertical className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-zinc-800 rounded-lg shadow-lg py-1 z-10">
          <div className="relative group">
            <button
              onClick={() => onViewChange('grid')}
              className="w-full px-4 py-2 text-left hover:bg-zinc-700 flex items-center justify-between group-hover:bg-zinc-700"
            >
              <div className="flex items-center">
                <GridIcon className="w-4 h-4 mr-2" />
                Grid
              </div>
              {currentView === 'grid' && <Check className="w-4 h-4 ml-auto mr-2" />}
              <ChevronRight className="w-4 h-4" />
            </button>
            
            {currentView === 'grid' && (
              <div className="hidden group-hover:block absolute left-0 top-0 -translate-x-full w-40 bg-zinc-800 rounded-lg shadow-lg p-4">
                <div className="flex justify-between items-center text-sm text-zinc-400 mb-2">
                  <span>Grid Size</span>
                  <span className="transition-all duration-150 ease-in-out">{currentGridColumns} columns</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="2"
                    max="4"
                    step="1"
                    value={currentGridColumns}
                    onChange={handleGridColumnsChange}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-zinc-700 accent-red-500
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-red-500
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:transition-all
                    [&::-webkit-slider-thumb]:duration-150
                    [&::-webkit-slider-thumb]:ease-in-out
                    [&::-webkit-slider-thumb]:hover:scale-110
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-red-500
                    [&::-moz-range-thumb]:border-0
                    [&::-moz-range-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:transition-all
                    [&::-moz-range-thumb]:duration-150
                    [&::-moz-range-thumb]:ease-in-out
                    [&::-moz-range-thumb]:hover:scale-110
                    [&::-moz-range-track]:bg-zinc-700
                    [&::-moz-range-track]:rounded-lg
                    [&::-moz-range-track]:h-2"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onViewChange('list')}
            className="w-full px-4 py-2 text-left hover:bg-zinc-700 flex items-center"
          >
            <ListIcon className="w-4 h-4 mr-2" />
            List
            {currentView === 'list' && <Check className="w-4 h-4 ml-auto" />}
          </button>

          <div className="relative group border-t border-zinc-700">
            <button className="w-full px-4 py-2 text-left hover:bg-zinc-700 flex items-center justify-between group-hover:bg-zinc-700">
              Sort By
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
            <div className="hidden group-hover:block absolute left-0 top-0 -translate-x-full w-48 bg-zinc-800 rounded-lg shadow-lg py-1">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-zinc-700 flex items-center"
                >
                  {option.label}
                  {currentSort === option.value && <Check className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 