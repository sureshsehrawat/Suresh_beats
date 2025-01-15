import React, { useState } from 'react';
import type { Album } from '../lib/subsonic';
import { AlbumGrid } from './AlbumGrid';
import { AlbumList } from './AlbumList';
import { ViewOptionsMenu } from './ViewOptionsMenu';

interface AlbumsViewProps {
  albums: Album[];
  onAlbumClick: (album: Album) => void;
}

export const AlbumsView: React.FC<AlbumsViewProps> = ({ albums, onAlbumClick }) => {
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [currentSort, setCurrentSort] = useState('name');
  const [gridColumns, setGridColumns] = useState(2);

  const sortedAlbums = [...albums].sort((a, b) => {
    switch (currentSort) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'artist':
        return a.artist.localeCompare(b.artist);
      case 'dateAdded':
        return (b.created || 0) - (a.created || 0);
      default:
        return 0;
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Albums</h2>
        <ViewOptionsMenu
          onViewChange={setCurrentView}
          onSortChange={setCurrentSort}
          onGridColumnsChange={setGridColumns}
          currentView={currentView}
          currentSort={currentSort}
          currentGridColumns={gridColumns}
        />
      </div>
      {currentView === 'grid' ? (
        <AlbumGrid albums={sortedAlbums} onAlbumClick={onAlbumClick} gridColumns={gridColumns} />
      ) : (
        <AlbumList albums={sortedAlbums} onAlbumClick={onAlbumClick} />
      )}
    </div>
  );
}; 