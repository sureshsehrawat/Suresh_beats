import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Plus, Play, Shuffle } from 'lucide-react';
import ColorThief from 'colorthief';
import type { Album, Song, Playlist } from '../lib/subsonic';
import { getCoverArtUrl, createPlaylist, addToPlaylist, getPlaylists } from '../lib/subsonic';
import { Toast } from './Toast';

interface AlbumViewProps {
  album: Album;
  songs: Song[];
  onPlaySong: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  playlists: Playlist[];
  onPlaylistsChange: () => void;
}

export const AlbumView: React.FC<AlbumViewProps> = ({
  album,
  songs,
  onPlaySong,
  currentSong,
  isPlaying,
  playlists,
  onPlaylistsChange,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [showSongDropdown, setShowSongDropdown] = useState<string | null>(null);
  const [showSongNewPlaylistInput, setShowSongNewPlaylistInput] = useState<string | null>(null);
  const [songNewPlaylistName, setSongNewPlaylistName] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [dominantColor, setDominantColor] = useState<[number, number, number] | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const albumDropdownRef = useRef<HTMLDivElement>(null);
  const songDropdownsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle album dropdown
      if (albumDropdownRef.current && !albumDropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowNewPlaylistInput(false);
      }

      // Handle song dropdowns
      if (showSongDropdown) {
        const songDropdownElement = songDropdownsRef.current[showSongDropdown];
        if (songDropdownElement && !songDropdownElement.contains(event.target as Node)) {
          setShowSongDropdown(null);
          setShowSongNewPlaylistInput(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSongDropdown]);

  useEffect(() => {
    const loadImage = async () => {
      if (!album.coverArt || !imgRef.current) return;

      const colorThief = new ColorThief();
      const img = imgRef.current;

      try {
        // Force image loading if not already loaded
        if (!img.complete) {
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
        }

        const color = colorThief.getColor(img);
        console.log('Extracted color:', color);
        setDominantColor(color);
      } catch (error) {
        console.error('Failed to extract color:', error);
      }
    };

    loadImage();
  }, [album.coverArt]);

  const backgroundStyle = dominantColor ? {
    background: `
      linear-gradient(
        to bottom,
        rgba(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]}, 0.8) 0%,
        rgba(0, 0, 0, 1) 100%
      )
    `,
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
  } : {};

  const handleDropdownClick = async () => {
    if (showDropdown) {
      setShowDropdown(false);
      return;
    }
    
    try {
      await onPlaylistsChange();
      setShowDropdown(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch playlists');
    }
  };

  const handleSongDropdownClick = async (songId: string) => {
    if (showSongDropdown === songId) {
      setShowSongDropdown(null);
      return;
    }
    
    try {
      await onPlaylistsChange();
      setShowSongDropdown(songId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch playlists');
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      setError(null);
      const songIds = songs.map(song => song.id);
      await addToPlaylist(playlistId, songIds);
      setShowDropdown(false);
      onPlaylistsChange();
      const playlist = playlists.find(p => p.id === playlistId);
      setToast(`Added album to ${playlist?.name}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add to playlist');
    }
  };

  const handleCreatePlaylist = async () => {
    try {
      setError(null);
      const playlist = await createPlaylist(newPlaylistName);
      const songIds = songs.map(song => song.id);
      await addToPlaylist(playlist.id, songIds);
      setNewPlaylistName('');
      setShowNewPlaylistInput(false);
      setShowDropdown(false);
      onPlaylistsChange();
      setToast(`Added album to ${playlist.name}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create playlist');
    }
  };

  const handleAddSongToPlaylist = async (songId: string, playlistId: string) => {
    try {
      setError(null);
      await addToPlaylist(playlistId, [songId]);
      setShowSongDropdown(null);
      onPlaylistsChange();
      const playlist = playlists.find(p => p.id === playlistId);
      const song = songs.find(s => s.id === songId);
      setToast(`Added "${song?.title}" to ${playlist?.name}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add to playlist');
    }
  };

  const handleCreatePlaylistForSong = async (songId: string) => {
    try {
      setError(null);
      const playlist = await createPlaylist(songNewPlaylistName);
      await addToPlaylist(playlist.id, [songId]);
      setSongNewPlaylistName('');
      setShowSongNewPlaylistInput(null);
      setShowSongDropdown(null);
      onPlaylistsChange();
      const song = songs.find(s => s.id === songId);
      setToast(`Added "${song?.title}" to ${playlist.name}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create playlist');
    }
  };

  return (
    <div className="relative min-h-screen -mt-4 -mx-4 px-4 pt-4 pb-24 bg-black">
      <div className="absolute top-0 left-0 right-0 h-[500px] transition-all duration-1000" style={backgroundStyle} />

      <div className="relative z-10">
        <div className="flex flex-col items-center mb-8 relative">
          <div className="absolute top-0 right-0" ref={albumDropdownRef}>
            <button
              onClick={handleDropdownClick}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <MoreVertical className="w-6 h-6" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-zinc-800 rounded-lg shadow-lg py-1 z-10">
                <button
                  onClick={() => setShowNewPlaylistInput(true)}
                  className="w-full px-4 py-2 text-left hover:bg-zinc-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Playlist
                </button>
                
                {playlists.map(playlist => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                    className="w-full px-4 py-2 text-left hover:bg-zinc-700"
                  >
                    Add to {playlist.name}
                  </button>
                ))}
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
                    onClick={() => setShowNewPlaylistInput(false)}
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

          <div className="w-[14.4rem] h-[14.4rem] bg-zinc-800 rounded-lg overflow-hidden mb-4 relative">
            {(songs[0]?.coverArt || album.coverArt) && (
              <img
                ref={imgRef}
                crossOrigin="anonymous"
                src={getCoverArtUrl(songs[0]?.coverArt || album.coverArt)}
                alt={album.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <h1 className="text-2xl font-bold mb-1">{album.name}</h1>
          <p className="text-zinc-400">{album.artist}</p>
          
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        <div className="flex justify-center items-center space-x-4 mb-6">
          <button
            onClick={() => onPlaySong(songs[0])}
            className="bg-zinc-900 hover:bg-zinc-800 text-red-500 px-8 py-3 rounded-lg font-bold transition-colors flex items-center space-x-2"
          >
            <Play className="w-5 h-5" strokeWidth={2.5} />
            <span>Play</span>
          </button>
          <button
            onClick={() => {
              const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
              onPlaySong(shuffledSongs[0]);
            }}
            className="bg-zinc-900 hover:bg-zinc-800 text-red-500 px-8 py-3 rounded-lg font-bold transition-colors flex items-center space-x-2"
          >
            <Shuffle className="w-5 h-5" strokeWidth={2.5} />
            <span>Shuffle</span>
          </button>
        </div>

        <div className="space-y-2">
          {songs.map((song) => {
            const isCurrentSong = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                className="flex items-center space-x-4 rounded-lg hover:bg-zinc-800 group"
              >
                <button
                  onClick={() => onPlaySong(song)}
                  className="flex-1 text-left px-4 py-3"
                >
                  <div className={`font-medium ${isCurrentSong ? 'text-red-500' : ''}`}>
                    {song.title}
                  </div>
                  <div className="text-sm text-zinc-400">{song.artist}</div>
                </button>

                <div className="relative px-2" ref={(el) => songDropdownsRef.current[song.id] = el}>
                  <button
                    onClick={() => handleSongDropdownClick(song.id)}
                    className="p-2 hover:bg-zinc-700 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {showSongDropdown === song.id && (
                    <div className="absolute right-0 mt-2 w-56 bg-zinc-800 rounded-lg shadow-lg py-1 z-10">
                      <button
                        onClick={() => {
                          setShowSongNewPlaylistInput(song.id);
                          setShowSongDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-zinc-700 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Playlist
                      </button>
                      
                      {playlists.map(playlist => (
                        <button
                          key={playlist.id}
                          onClick={() => handleAddSongToPlaylist(song.id, playlist.id)}
                          className="w-full px-4 py-2 text-left hover:bg-zinc-700"
                        >
                          Add to {playlist.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {showSongNewPlaylistInput === song.id && (
                    <div className="absolute right-0 mt-2 w-64 bg-zinc-800 rounded-lg shadow-lg p-4 z-10">
                      <input
                        type="text"
                        value={songNewPlaylistName}
                        onChange={(e) => setSongNewPlaylistName(e.target.value)}
                        placeholder="Playlist name"
                        className="w-full px-3 py-2 bg-zinc-700 rounded-lg mb-2 text-white placeholder-zinc-400"
                        autoFocus
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setShowSongNewPlaylistInput(null)}
                          className="px-3 py-1 text-sm hover:bg-zinc-700 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleCreatePlaylistForSong(song.id)}
                          disabled={!songNewPlaylistName}
                          className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 rounded disabled:opacity-50"
                        >
                          Create
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {isCurrentSong && (
                  <div className="text-red-500 pr-4">
                    {isPlaying ? '▶️' : '⏸'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {toast && (
          <Toast message={toast} onClose={() => setToast(null)} />
        )}
      </div>
    </div>
  );
};