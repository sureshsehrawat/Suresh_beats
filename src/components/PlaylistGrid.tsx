import React from 'react';
import type { Playlist } from '../lib/subsonic';
import { getCoverArtUrl } from '../lib/subsonic';

interface PlaylistGridProps {
  playlists: Playlist[];
  onPlaylistClick: (playlist: Playlist) => void;
}

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({ playlists, onPlaylistClick }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
      {playlists.map((playlist) => (
        <div
          key={playlist.id}
          className="cursor-pointer hover:opacity-80 transition-opacity border border-white/20 rounded-md overflow-hidden"
          onClick={() => onPlaylistClick(playlist)}
        >
          <div className="aspect-square relative">
            <img
              src={playlist.coverArt ? getCoverArtUrl(playlist.coverArt) : '/default-playlist.png'}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="bg-zinc-800 py-2">
            <h3 className="font-semibold text-sm text-white truncate text-center">{playlist.name}</h3>
            <p className="text-xs text-zinc-400 truncate text-center">{playlist.songCount} songs</p>
          </div>
        </div>
      ))}
    </div>
  );
}; 