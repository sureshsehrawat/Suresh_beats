import React from 'react';
import { Music } from 'lucide-react';
import type { Album } from '../lib/subsonic';
import { getCoverArtUrl } from '../lib/subsonic';

interface AlbumListProps {
  albums: Album[];
  onAlbumClick: (album: Album) => void;
}

export const AlbumList: React.FC<AlbumListProps> = ({ albums, onAlbumClick }) => {
  return (
    <div className="space-y-2">
      {albums.map((album) => (
        <div
          key={album.id}
          className="flex items-center space-x-4 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors"
          onClick={() => onAlbumClick(album)}
        >
          <div className="w-12 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
            {album.coverArt ? (
              <img
                src={getCoverArtUrl(album.coverArt)}
                alt={album.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-6 h-6 text-zinc-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{album.name}</h3>
            <p className="text-xs text-zinc-400 truncate">{album.artist}</p>
          </div>
          <div className="text-xs text-zinc-400">
            {album.songCount} songs
          </div>
        </div>
      ))}
    </div>
  );
}; 