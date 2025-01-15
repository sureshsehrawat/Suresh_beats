import React from 'react';
import type { Song } from '../lib/subsonic';
import { getCoverArtUrl } from '../lib/subsonic';
import { Play, Pause } from 'lucide-react';

interface PlaylistSongGridProps {
  songs: Song[];
  onPlaySong: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  gridColumns: number;
}

export const PlaylistSongGrid: React.FC<PlaylistSongGridProps> = ({
  songs,
  onPlaySong,
  currentSong,
  isPlaying,
  gridColumns,
}) => {
  return (
    <div 
      className="grid gap-4" 
      style={{ 
        gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` 
      }}
    >
      {songs.map((song) => {
        const isCurrentSong = currentSong?.id === song.id;
        return (
          <button
            key={song.id}
            onClick={() => onPlaySong(song)}
            className="group relative flex flex-col items-center text-center p-4 rounded-lg hover:bg-zinc-800/50 transition-colors"
          >
            <div className="w-full aspect-square bg-zinc-800 rounded-lg overflow-hidden mb-3 relative">
              {song.coverArt ? (
                <img
                  src={getCoverArtUrl(song.coverArt)}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                  <div className="text-4xl text-zinc-600">♪</div>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                {isCurrentSong && isPlaying ? (
                  <Pause className="w-12 h-12 text-white" />
                ) : (
                  <Play className="w-12 h-12 text-white" />
                )}
              </div>
            </div>
            <div className="w-full">
              <div className={`font-medium truncate ${isCurrentSong ? 'text-red-500' : ''}`}>
                {song.title}
              </div>
              <div className="text-sm text-zinc-400 truncate">
                {song.artist}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}; 