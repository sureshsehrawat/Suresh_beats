import React from 'react';
import { Music } from 'lucide-react';
import type { Song } from '../lib/subsonic';
import { getCoverArtUrl } from '../lib/subsonic';

interface SongGridProps {
  songs: Song[];
  onPlaySong: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
}

export function SongGrid({ songs, onPlaySong, currentSong, isPlaying }: SongGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
      {songs.map((song) => {
        const isCurrentSong = currentSong?.id === song.id;
        return (
          <div
            key={song.id}
            className="bg-zinc-900 p-4 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            onClick={() => onPlaySong(song)}
          >
            <div className="aspect-square relative mb-4 rounded-md overflow-hidden bg-zinc-800">
              {song.coverArt ? (
                <img
                  src={getCoverArtUrl(song.coverArt)}
                  alt={song.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-12 h-12 text-zinc-500" />
                </div>
              )}
              {isCurrentSong && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-red-500 text-2xl">
                    {isPlaying ? '▶️' : '⏸'}
                  </div>
                </div>
              )}
            </div>
            <h3 className={`font-semibold text-sm text-white truncate ${isCurrentSong ? 'text-red-500' : ''}`}>
              {song.title}
            </h3>
            <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
          </div>
        )
      })}
    </div>
  );
} 