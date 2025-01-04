import React from 'react';
import { Music } from 'lucide-react';
import type { Album } from '../lib/subsonic';
import { getCoverArtUrl } from '../lib/subsonic';

interface AlbumGridProps {
  albums: Album[];
  onAlbumClick: (album: Album) => void;
}

export function AlbumGrid({ albums, onAlbumClick }: AlbumGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
      {albums.map((album) => (
        <div
          key={album.id}
          className="cursor-pointer hover:opacity-80 transition-opacity border border-white/20 rounded-md overflow-hidden"
          onClick={() => onAlbumClick(album)}
        >
          <div className="aspect-square relative">
            {album.coverArt ? (
              <img
                src={getCoverArtUrl(album.coverArt)}
                alt={album.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-12 h-12 text-zinc-500" />
              </div>
            )}
          </div>
          <div className="bg-zinc-800 py-2">
            <h3 className="font-semibold text-sm text-white truncate text-center">{album.name}</h3>
            <p className="text-xs text-zinc-400 truncate text-center">{album.artist}</p>
          </div>
        </div>
      ))}
    </div>
  );
}