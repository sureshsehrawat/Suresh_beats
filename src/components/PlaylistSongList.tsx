import React from 'react';
import type { Song } from '../lib/subsonic';
import { Play, Pause } from 'lucide-react';

interface PlaylistSongListProps {
  songs: Song[];
  onPlaySong: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
}

export const PlaylistSongList: React.FC<PlaylistSongListProps> = ({
  songs,
  onPlaySong,
  currentSong,
  isPlaying,
}) => {
  return (
    <div className="space-y-1">
      {songs.map((song) => {
        const isCurrentSong = currentSong?.id === song.id;
        return (
          <button
            key={song.id}
            onClick={() => onPlaySong(song)}
            className="w-full text-left px-4 py-3 flex items-center gap-4 rounded-lg hover:bg-zinc-800/50 group"
          >
            <div className="w-8 h-8 flex items-center justify-center text-zinc-400 group-hover:text-white">
              {isCurrentSong ? (
                isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )
              ) : (
                <Play className="w-5 h-5 opacity-0 group-hover:opacity-100" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-medium truncate ${isCurrentSong ? 'text-red-500' : ''}`}>
                {song.title}
              </div>
              <div className="text-sm text-zinc-400 truncate">
                {song.artist}
              </div>
            </div>
            <div className="text-sm text-zinc-400">
              {formatDuration(song.duration)}
            </div>
          </button>
        );
      })}
    </div>
  );
};

function formatDuration(seconds: number | undefined): string {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 