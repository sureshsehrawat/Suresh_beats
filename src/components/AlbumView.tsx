import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Plus, Play, Shuffle, Music, Heart } from 'lucide-react';
import ColorThief from 'colorthief';
import type { Album, Song, Playlist } from '../lib/subsonic';
import { getCoverArtUrl, createPlaylist, addToPlaylist, getPlaylists } from '../lib/subsonic';
import { extractArtwork, type ArtworkResponse } from '../lib/metadata';
import { Toast } from './Toast';

interface AlbumViewProps {
  album: Album;
  songs: Song[];
  onPlaySong: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  playlists: Playlist[];
  onPlaylistsChange: () => void;
  onShowPlaylistSelection?: () => void;
}

interface SongArtwork {
  id: string;
  artwork: ArtworkResponse;
}

export const AlbumView: React.FC<AlbumViewProps> = ({
  album,
  songs,
  onPlaySong,
  currentSong,
  isPlaying,
  playlists,
  onPlaylistsChange,
  onShowPlaylistSelection,
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
  const [headerOpacity, setHeaderOpacity] = useState(1);
  const [headerScale, setHeaderScale] = useState(1);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [songArtworks, setSongArtworks] = useState<SongArtwork[]>([]);
  const [isLoadingArtwork, setIsLoadingArtwork] = useState(true);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const albumDropdownRef = useRef<HTMLDivElement>(null);
  const songDropdownsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !headerRef.current) return;
      
      const scrollPosition = containerRef.current.scrollTop;
      const headerHeight = headerRef.current.offsetHeight;
      const triggerPoint = headerHeight * 0.4;
      
      // Calculate opacity and scale based on scroll position
      const newOpacity = Math.max(0, 1 - (scrollPosition / triggerPoint));
      const newScale = Math.max(0.6, 1 - (scrollPosition / triggerPoint) * 0.4);
      
      setHeaderOpacity(newOpacity);
      setHeaderScale(newScale);
      setIsHeaderSticky(scrollPosition > triggerPoint);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

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

  useEffect(() => {
    const loadSongArtworks = async () => {
      setIsLoadingArtwork(true);
      try {
        const artworkPromises = songs.map(async (song) => {
          const artwork = await extractArtwork(song.path, album.coverArt);
          return { id: song.id, artwork };
        });
        
        const artworks = await Promise.all(artworkPromises);
        setSongArtworks(artworks);
      } catch (error) {
        console.error('Error loading song artworks:', error);
      } finally {
        setIsLoadingArtwork(false);
      }
    };

    loadSongArtworks();
  }, [songs, album.coverArt]);

  const getSongArtwork = (songId: string): string | null => {
    const songArtwork = songArtworks.find(art => art.id === songId);
    if (songArtwork?.artwork.artwork) {
      return songArtwork.artwork.artwork;
    }
    return album.coverArt ? getCoverArtUrl(album.coverArt) : null;
  };

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

  const handleAddToPlaylistClick = () => {
    if (onShowPlaylistSelection) {
      onShowPlaylistSelection();
      setShowDropdown(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-screen overflow-y-auto -mt-4 -mx-4 bg-black"
      style={{ scrollBehavior: 'smooth' }}
    >
      <div 
        className={`sticky top-0 z-20 h-16 sticky-header ${isHeaderSticky ? 'opacity-100' : 'opacity-0'}`}
        style={{ pointerEvents: isHeaderSticky ? 'auto' : 'none' }}
      >
        <div className="flex items-center h-full px-4">
          {album.coverArt && (
            <img
              src={getCoverArtUrl(album.coverArt)}
              alt={album.name}
              className="w-10 h-10 rounded-md mr-3"
            />
          )}
          <div className="flex-1">
            <h1 className="text-lg font-bold truncate">{album.name}</h1>
            <p className="text-sm text-zinc-400 truncate">{album.artist}</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div 
          className="absolute top-0 left-0 right-0 h-[500px] transition-all duration-1000" 
          style={backgroundStyle} 
        />

        <div className="relative z-10 px-4 pt-4">
          <div 
            ref={headerRef}
            className="flex flex-col items-center mb-8 relative album-header-transition"
            style={{
              transform: `scale(${headerScale})`,
              opacity: headerOpacity,
            }}
          >
            <div className="absolute top-0 right-0" ref={albumDropdownRef}>
              <button
                onClick={handleDropdownClick}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <MoreVertical className="w-6 h-6" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-[#282828] rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={handleAddToPlaylistClick}
                    className="w-full px-4 py-2 text-left hover:bg-[#3E3E3E] transition-colors text-white/90 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to playlist
                  </button>
                  <button
                    onClick={() => {/* TODO: Implement play next functionality */}}
                    className="w-full px-4 py-2 text-left hover:bg-[#3E3E3E] transition-colors text-white/90 flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play next
                  </button>
                  <button
                    onClick={() => {/* TODO: Implement favorite functionality */}}
                    className="w-full px-4 py-2 text-left hover:bg-[#3E3E3E] transition-colors text-white/90 flex items-center"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Favourite
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

            {album.coverArt && (
              <img
                ref={imgRef}
                src={getCoverArtUrl(album.coverArt)}
                alt={album.name}
                className="w-64 h-64 rounded-lg shadow-lg mb-6 album-artwork"
                crossOrigin="anonymous"
              />
            )}

            <h1 className="text-3xl font-bold mb-2">{album.name}</h1>
            <p className="text-lg text-zinc-400 mb-6">{album.artist}</p>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => onPlaySong(songs[0])}
                className="flex items-center px-6 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors text-red-500"
              >
                <Play className="w-5 h-5 mr-2" />
                Play
              </button>
              <button
                onClick={() => {
                  const randomIndex = Math.floor(Math.random() * songs.length);
                  onPlaySong(songs[randomIndex]);
                }}
                className="flex items-center px-6 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors text-red-500"
              >
                <Shuffle className="w-5 h-5 mr-2" />
                Shuffle
              </button>
            </div>
          </div>

          <div className="px-4 py-2">
            {songs.map((song, index) => {
              const isCurrentSong = currentSong?.id === song.id;
              const songArtwork = getSongArtwork(song.id);
              
              return (
                <div
                  key={song.id}
                  className={`flex items-center p-2 rounded-lg hover:bg-white/10 transition-colors ${
                    isCurrentSong ? 'bg-white/20' : ''
                  }`}
                  onClick={() => onPlaySong(song)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="flex items-center flex-1">
                    <div className="relative w-10 h-10 mr-3 rounded-md overflow-hidden">
                      {songArtwork ? (
                        <img
                          src={songArtwork}
                          alt={song.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                          <Music className="w-5 h-5 text-zinc-400" />
                        </div>
                      )}
                      {isLoadingArtwork && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{song.title}</div>
                      <div className="text-sm text-zinc-400 truncate">{song.artist}</div>
                    </div>
                  </div>
                  
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
    </div>
  );
};