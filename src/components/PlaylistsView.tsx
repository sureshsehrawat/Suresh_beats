import React, { useState } from 'react';
import { MoreVertical, Plus, Music } from 'lucide-react';
import type { Playlist } from '../lib/subsonic';
import { createPlaylist, getCoverArtUrl } from '../lib/subsonic';
import './RecentAlbums.css';

interface PlaylistsViewProps {
  playlists: Playlist[];
  onPlaylistClick: (playlist: Playlist) => void;
  onPlaylistsChange: () => void;
}

export function PlaylistsView({ playlists, onPlaylistClick, onPlaylistsChange }: PlaylistsViewProps) {
  const [showPlaylistsDropdown, setShowPlaylistsDropdown] = useState(false);
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreatePlaylist = async () => {
    try {
      await createPlaylist(newPlaylistName);
      setNewPlaylistName('');
      setShowNewPlaylistInput(false);
      onPlaylistsChange();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create playlist');
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-zinc-400">My Playlists</h2>
        <div className="relative">
          <button
            onClick={() => setShowPlaylistsDropdown(!showPlaylistsDropdown)}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <MoreVertical className="w-6 h-6" />
          </button>
          
          {showPlaylistsDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-[#282828] rounded-md shadow-lg py-1 z-10">
              <button
                onClick={() => {
                  setShowNewPlaylistInput(true);
                  setShowPlaylistsDropdown(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-[#3E3E3E] transition-colors text-white/90 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Playlist
              </button>
            </div>
          )}

          {showNewPlaylistInput && (
            <div className="absolute right-0 mt-2 w-64 bg-zinc-800 rounded-lg shadow-lg p-4 z-10">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="w-full px-3 py-2 bg-zinc-700 rounded-lg mb-2 text-white placeholder-zinc-400"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowNewPlaylistInput(false);
                    setNewPlaylistName('');
                  }}
                  className="px-3 py-1 text-sm hover:bg-zinc-700 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName}
                  className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 rounded disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            onClick={() => onPlaylistClick(playlist)}
            className="group/album bg-zinc-800/40 rounded-xl p-3 transition-all duration-300 hover:bg-zinc-800/60 cursor-pointer"
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-3 shadow-lg">
              {playlist.coverArt ? (
                <img
                  src={getCoverArtUrl(playlist.coverArt)}
                  alt={playlist.name}
                  className="w-full h-full object-cover transform transition-transform duration-300 group-hover/album:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-12 h-12 text-zinc-500" />
                </div>
              )}
            </div>
            <div className="truncate font-medium text-sm group-hover/album:text-white">
              {playlist.name}
            </div>
            <div className="truncate text-xs text-zinc-400">
              {playlist.songCount} songs
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 