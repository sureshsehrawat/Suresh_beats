import React, { useState, useRef, useEffect } from 'react';
import { Plus, MoreVertical, Play, Shuffle, Heart } from 'lucide-react';
import type { Playlist, Song, Album } from '../lib/subsonic';
import { getCoverArtUrl, starItem, unstarItem } from '../lib/subsonic';
import { Toast } from './Toast';

interface PlaylistViewProps {
  playlist: Playlist;
  songs: Song[];
  onPlaySong: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaylistsChange: () => void;
  onAlbumClick: (album: Album) => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({
  playlist,
  songs,
  onPlaySong,
  currentSong,
  isPlaying,
  onPlaylistsChange,
  onAlbumClick,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSongDropdown, setShowSongDropdown] = useState<string | null>(null);
  const [isPlaylistStarred, setIsPlaylistStarred] = useState(false);
  const [starredSongs, setStarredSongs] = useState<Set<string>>(new Set());
  const [starringInProgress, setStarringInProgress] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [headerOpacity, setHeaderOpacity] = useState(1);
  const [headerScale, setHeaderScale] = useState(1);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);

  const playlistDropdownRef = useRef<HTMLDivElement>(null);
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
      // Handle playlist dropdown
      if (playlistDropdownRef.current && !playlistDropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }

      // Handle song dropdowns
      if (showSongDropdown) {
        const songDropdownElement = songDropdownsRef.current[showSongDropdown];
        if (songDropdownElement && !songDropdownElement.contains(event.target as Node)) {
          setShowSongDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSongDropdown]);

  const handleStarPlaylist = async () => {
    if (starringInProgress.has(playlist.id)) return;
    
    try {
      setStarringInProgress(prev => new Set(prev).add(playlist.id));
      if (isPlaylistStarred) {
        await unstarItem(playlist.id, 'playlist');
        setIsPlaylistStarred(false);
        setToast('Playlist removed from favorites');
      } else {
        await starItem(playlist.id, 'playlist');
        setIsPlaylistStarred(true);
        setToast('Playlist added to favorites');
      }
      onPlaylistsChange();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update star status');
    } finally {
      setStarringInProgress(prev => {
        const next = new Set(prev);
        next.delete(playlist.id);
        return next;
      });
    }
  };

  const handleStarSong = async (song: Song) => {
    if (starringInProgress.has(song.id)) return;
    
    try {
      setStarringInProgress(prev => new Set(prev).add(song.id));
      if (starredSongs.has(song.id)) {
        await unstarItem(song.id, 'song');
        setStarredSongs(prev => {
          const next = new Set(prev);
          next.delete(song.id);
          return next;
        });
        setToast(`"${song.title}" removed from favorites`);
      } else {
        await starItem(song.id, 'song');
        setStarredSongs(prev => new Set(prev).add(song.id));
        setToast(`"${song.title}" added to favorites`);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update star status');
    } finally {
      setStarringInProgress(prev => {
        const next = new Set(prev);
        next.delete(song.id);
        return next;
      });
    }
  };

  const handleSongDropdownClick = async (songId: string) => {
    if (showSongDropdown === songId) {
      setShowSongDropdown(null);
      return;
    }
    setShowSongDropdown(songId);
  };

  const sortedSongs = [...songs].sort((a, b) => {
    if (!a.created || !b.created) return 0;
    return new Date(b.created).getTime() - new Date(a.created).getTime();
  });

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto"
      style={{ 
        background: `linear-gradient(to bottom, rgba(24, 24, 27, 0.9) 0%, rgb(24, 24, 27) 100%)`,
      }}
    >
      <div className="relative min-h-full">
        <div 
          ref={headerRef}
          className={`sticky top-0 z-10 px-6 pt-6 pb-4 transition-transform duration-300 ${
            isHeaderSticky ? 'bg-zinc-900/80 backdrop-blur-xl' : ''
          }`}
          style={{
            transform: `scale(${headerScale})`,
            transformOrigin: 'center top',
          }}
        >
          <div 
            className="flex flex-col items-center mb-8"
            style={{ opacity: headerOpacity }}
          >
            <div className="absolute top-0 right-0" ref={playlistDropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <MoreVertical className="w-6 h-6" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-[#282828] rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={handleStarPlaylist}
                    disabled={starringInProgress.has(playlist.id)}
                    className="w-full px-4 py-2 text-left hover:bg-[#3E3E3E] transition-colors text-white/90 flex items-center"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isPlaylistStarred ? 'fill-current text-red-500' : ''}`} />
                    {isPlaylistStarred ? 'Remove from favorites' : 'Add to favorites'}
                  </button>
                </div>
              )}
            </div>

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

          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={() => songs.length > 0 && onPlaySong(songs[0])}
              className="flex items-center px-6 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors text-red-500"
              disabled={songs.length === 0}
            >
              <Play className="w-5 h-5 mr-2" />
              Play
            </button>
            <button
              onClick={() => {
                if (songs.length > 0) {
                  const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
                  onPlaySong(shuffledSongs[0]);
                }
              }}
              className="flex items-center px-6 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors text-red-500"
              disabled={songs.length === 0}
            >
              <Shuffle className="w-5 h-5 mr-2" />
              Shuffle
            </button>
          </div>
        </div>

        <div className="px-6 space-y-2 pb-6">
          {sortedSongs.map((song) => {
            const isCurrentSong = currentSong?.id === song.id;
            const isStarred = starredSongs.has(song.id);
            
            return (
              <div
                key={song.id}
                className="px-4 py-3 flex items-center space-x-4 rounded-lg hover:bg-zinc-800 group"
              >
                <div 
                  className="w-12 h-12 flex-shrink-0 rounded overflow-hidden cursor-pointer"
                  onClick={() => onAlbumClick({ 
                    id: song.albumId,
                    name: song.album,
                    artist: song.artist,
                    coverArt: song.coverArt,
                    songCount: 0,
                    duration: 0,
                    created: song.created,
                    year: song.year || 0,
                    genre: ''
                  })}
                >
                  {song.coverArt ? (
                    <img
                      src={getCoverArtUrl(song.coverArt)}
                      alt={song.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-700">
                      <Plus className="w-6 h-6 text-zinc-500" />
                    </div>
                  )}
                </div>

                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => onPlaySong(song)}
                >
                  <div className={`font-medium ${isCurrentSong ? 'text-red-500' : ''}`}>
                    {song.title}
                  </div>
                  <div className="text-sm text-zinc-400">{song.artist}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleStarSong(song)}
                    disabled={starringInProgress.has(song.id)}
                    className={`p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100 ${
                      isStarred ? 'text-red-500' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isStarred ? 'fill-current' : ''}`} />
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
                          onClick={() => handleStarSong(song)}
                          disabled={starringInProgress.has(song.id)}
                          className="w-full px-4 py-2 text-left hover:bg-zinc-700 flex items-center"
                        >
                          <Heart className={`w-4 h-4 mr-2 ${isStarred ? 'fill-current text-red-500' : ''}`} />
                          {isStarred ? 'Remove from favorites' : 'Add to favorites'}
                        </button>
                      </div>
                    )}
                  </div>

                  {isCurrentSong && (
                    <div className="text-red-500">
                      {isPlaying ? '▶️' : '⏸'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {toast && (
        <Toast message={toast} onClose={() => setToast(null)} />
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}; 