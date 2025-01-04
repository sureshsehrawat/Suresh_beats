import React from 'react';
import { MoreVertical, Plus } from 'lucide-react';
import type { Playlist, Song } from '../lib/subsonic';
import { getCoverArtUrl } from '../lib/subsonic';

interface PlaylistViewProps {
  playlist: Playlist;
  songs: Song[];
  onPlaySong: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({
  playlist,
  songs,
  onPlaySong,
  currentSong,
  isPlaying,
}) => {
  return (
    <div>
      <div className="flex flex-col items-center mb-8">
        <div className="w-48 h-48 bg-zinc-800 rounded-lg overflow-hidden mb-4">
          {playlist.coverArt ? (
            <img
              src={getCoverArtUrl(playlist.coverArt)}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
              <Plus className="w-12 h-12 text-zinc-500" />
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold mb-1">{playlist.name}</h1>
        <p className="text-zinc-400">{songs.length} songs</p>
      </div>

      <div className="flex justify-center items-center space-x-4 mb-6">
        <button
          onClick={() => songs.length > 0 && onPlaySong(songs[0])}
          className="bg-red-500 text-white px-8 py-2 rounded-full font-semibold disabled:opacity-50"
          disabled={songs.length === 0}
        >
          Play
        </button>
        <button
          onClick={() => {
            if (songs.length > 0) {
              const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
              onPlaySong(shuffledSongs[0]);
            }
          }}
          className="bg-zinc-800 text-white px-8 py-2 rounded-full font-semibold disabled:opacity-50"
          disabled={songs.length === 0}
        >
          Shuffle
        </button>
      </div>

      <div className="space-y-2">
        {songs.map((song) => {
          const isCurrentSong = currentSong?.id === song.id;
          return (
            <button
              key={song.id}
              onClick={() => onPlaySong(song)}
              className="w-full text-left px-4 py-3 flex items-center space-x-4 rounded-lg hover:bg-zinc-800"
            >
              <div className="flex-1">
                <div className={`font-medium ${isCurrentSong ? 'text-red-500' : ''}`}>
                  {song.title}
                </div>
                <div className="text-sm text-zinc-400">{song.artist}</div>
              </div>
              {isCurrentSong && (
                <div className="text-red-500">
                  {isPlaying ? '▶️' : '⏸'}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}; 