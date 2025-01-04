import React from 'react';
import type { Song } from '../lib/subsonic';

interface SongListProps {
  songs: Song[];
  onPlaySong: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
}

export const SongList: React.FC<SongListProps> = ({ songs, onPlaySong, currentSong, isPlaying }) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      {songs.map((song) => {
        const isCurrentSong = currentSong?.id === song.id;
        return (
          <div
            key={song.id}
            className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors ${
              isCurrentSong ? 'bg-gray-800' : ''
            }`}
            onClick={() => onPlaySong(song)}
          >
            <div className="flex-1">
              <h3 className={`font-medium ${isCurrentSong ? 'text-red-500' : ''}`}>
                {song.title}
              </h3>
              <p className="text-sm text-gray-400">{song.artist}</p>
            </div>
            <div className="text-sm text-gray-400">
              {formatDuration(song.duration)}
            </div>
          </div>
        );
      })}
    </div>
  );
}; 