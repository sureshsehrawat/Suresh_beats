import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getAlbums, getAlbum, getStreamUrl, getPlaylists, getPlaylist, getArtists, getArtist, getAllSongs, getRecentAlbums, getMusicFolders, getMusicDirectories, addToPlaylist, createPlaylist } from './lib/subsonic';
import type { Album, Song, Playlist, Artist, MusicFolder, Directory } from './lib/subsonic';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { Camera, MoreVertical, Plus } from 'lucide-react';
import { PlaylistsView } from './components/PlaylistsView';

// Lazy load components
const MobileNav = lazy(() => import('./components/MobileNav').then(module => ({ default: module.MobileNav })));
const AlbumGrid = lazy(() => import('./components/AlbumGrid').then(module => ({ default: module.AlbumGrid })));
const AlbumsView = lazy(() => import('./components/AlbumsView').then(module => ({ default: module.AlbumsView })));
const PlaylistGrid = lazy(() => import('./components/PlaylistGrid').then(module => ({ default: module.PlaylistGrid })));
const ArtistList = lazy(() => import('./components/ArtistList').then(module => ({ default: module.ArtistList })));
const SongList = lazy(() => import('./components/SongList').then(module => ({ default: module.SongList })));
const SongGrid = lazy(() => import('./components/SongGrid').then(module => ({ default: module.SongGrid })));
const AlbumView = lazy(() => import('./components/AlbumView').then(module => ({ default: module.AlbumView })));
const PlaylistView = lazy(() => import('./components/PlaylistView').then(module => ({ default: module.PlaylistView })));
const MusicPlayer = lazy(() => import('./components/MusicPlayer').then(module => ({ default: module.MusicPlayer })));
const MyMusic = lazy(() => import('./components/MyMusic').then(module => ({ default: module.MyMusic })));
const LibraryNav = lazy(() => import('./components/LibraryNav').then(module => ({ default: module.LibraryNav })));
const Settings = lazy(() => import('./components/Settings').then(module => ({ default: module.Settings })));
const SearchView = lazy(() => import('./components/SearchView').then(module => ({ default: module.SearchView })));
const PWAPrompt = lazy(() => import('./components/PWAPrompt').then(module => ({ default: module.PWAPrompt })));
const Login = lazy(() => import('./components/Login').then(module => ({ default: module.Login })));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      suspense: true,
    },
  },
});

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [recentAlbums, setRecentAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<{ album: Album; songs: Song[] } | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<{ playlist: Playlist; songs: Song[] } | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<{ artist: Artist; albums: Album[] } | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentView, setCurrentView] = useState('nowPlaying');
  const [previousView, setPreviousView] = useState('nowPlaying');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [shuffledQueue, setShuffledQueue] = useState<Song[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [scrollPositions, setScrollPositions] = useState<{ [key: string]: number }>({});
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [folders, setFolders] = useState<MusicFolder[]>([]);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(null);
  const [directoryStack, setDirectoryStack] = useState<{id: string, name: string}[]>([]);
  const [isPlaylistSelectionMode, setIsPlaylistSelectionMode] = useState(false);
  const [songsToAdd, setSongsToAdd] = useState<Song[]>([]);
  const [showPlaylistsDropdown, setShowPlaylistsDropdown] = useState(false);
  const playlistsDropdownRef = useRef<HTMLDivElement>(null);
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Get the streaming URL for the current song
  const streamUrl = currentSong ? getStreamUrl(currentSong.id) : null;
  const {
    isPlaying: audioIsPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
  } = useAudioPlayer(streamUrl);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);
        
        if (currentView === 'albums') {
          const albumsData = await getAlbums();
          setAlbums(albumsData);
        } else if (currentView === 'home') {
          const recentAlbumsData = await getRecentAlbums();
          setRecentAlbums(recentAlbumsData);
        } else if (currentView === 'playlists') {
          const playlistsData = await getPlaylists();
          setPlaylists(playlistsData);
        } else if (currentView === 'artists') {
          const artistsData = await getArtists();
          setArtists(artistsData);
        } else if (currentView === 'songs') {
          const songsData = await getAllSongs();
          setSongs(songsData);
        } else if (currentView === 'folders') {
          const directoriesData = await getMusicDirectories(currentDirectory || undefined);
          setDirectories(directoriesData);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentView, currentDirectory]);

  const handleAlbumClick = async (album: Album) => {
    try {
      if (mainContentRef.current) {
        setScrollPositions(prev => ({
          ...prev,
          albums: mainContentRef.current?.scrollTop || 0
        }));
      }
      setLoading(true);
      setError(null);
      const albumData = await getAlbum(album.id);
      setPreviousView(currentView);
      setSelectedAlbum(albumData);
      setSelectedPlaylist(null);
      setSelectedArtist(null);
      setCurrentView('album');
      
      // Fetch playlists in the background if needed
      if (playlists.length === 0) {
        getPlaylists().then(setPlaylists).catch(console.error);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while fetching album details');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistClick = async (playlist: Playlist) => {
    try {
      if (mainContentRef.current) {
        setScrollPositions(prev => ({
          ...prev,
          playlists: mainContentRef.current?.scrollTop || 0
        }));
      }
      setLoading(true);
      setError(null);
      const playlistData = await getPlaylist(playlist.id);
      setSelectedPlaylist(playlistData);
      setSelectedAlbum(null);
      setSelectedArtist(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while fetching playlist details');
    } finally {
      setLoading(false);
    }
  };

  const handleArtistClick = async (artist: Artist) => {
    try {
      if (mainContentRef.current) {
        setScrollPositions(prev => ({
          ...prev,
          artists: mainContentRef.current?.scrollTop || 0
        }));
      }
      setLoading(true);
      setError(null);
      const artistData = await getArtist(artist.id);
      setSelectedArtist(artistData);
      setSelectedAlbum(null);
      setSelectedPlaylist(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while fetching artist details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedAlbum && !selectedPlaylist && !selectedArtist && mainContentRef.current) {
      const savedPosition = scrollPositions[currentView];
      if (savedPosition) {
        mainContentRef.current.scrollTop = savedPosition;
      }
    }
  }, [selectedAlbum, selectedPlaylist, selectedArtist, currentView]);

  const getCurrentQueue = () => {
    if (selectedAlbum) {
      return selectedAlbum.songs;
    } else if (selectedPlaylist) {
      return selectedPlaylist.songs;
    }
    return [];
  };

  const shuffleQueue = (queue: Song[]) => {
    return [...queue].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    if (isShuffleOn) {
      const queue = getCurrentQueue();
      if (currentSong) {
        // Remove current song from queue before shuffling
        const remainingQueue = queue.filter(song => song.id !== currentSong.id);
        const shuffled = shuffleQueue(remainingQueue);
        // Put current song at the start
        setShuffledQueue([currentSong, ...shuffled]);
      } else {
        setShuffledQueue(shuffleQueue(queue));
      }
    }
  }, [isShuffleOn, selectedAlbum, selectedPlaylist]);

  const handleNextSong = () => {
    const queue = isShuffleOn ? shuffledQueue : getCurrentQueue();
    if (!queue.length || !currentSong) return;

    const currentIndex = queue.findIndex(song => song.id === currentSong.id);
    
    if (currentIndex < queue.length - 1) {
      handlePlaySong(queue[currentIndex + 1]);
    } else if (repeatMode === 'all') {
      handlePlaySong(queue[0]);
      if (isShuffleOn) {
        // Reshuffle the queue when we loop back
        const newShuffled = shuffleQueue(queue);
        setShuffledQueue([newShuffled[0], ...newShuffled.slice(1)]);
      }
    }
  };

  const handlePreviousSong = () => {
    const queue = isShuffleOn ? shuffledQueue : getCurrentQueue();
    if (!queue.length || !currentSong) return;

    const currentIndex = queue.findIndex(song => song.id === currentSong.id);
    
    if (currentIndex > 0) {
      handlePlaySong(queue[currentIndex - 1]);
    } else if (repeatMode === 'all') {
      handlePlaySong(queue[queue.length - 1]);
    }
  };

  const handleSongEnd = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    } else {
      handleNextSong();
    }
  };

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = getStreamUrl(currentSong.id);
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentSong]);

  const handleTogglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleToggleShuffle = () => {
    setIsShuffleOn(!isShuffleOn);
  };

  const handleToggleRepeat = () => {
    setRepeatMode(current => {
      switch (current) {
        case 'off': return 'all';
        case 'all': return 'one';
        case 'one': return 'off';
      }
    });
  };

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      const time = (value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = time;
      setProgress(value);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      const progress = (currentTime / duration) * 100;
      setProgress(progress);
      seek(progress); // Update the seek position in the useAudioPlayer hook
    }
  };

  const handlePlaySong = (song: Song) => {
    if (audioRef.current) {
      audioRef.current.src = getStreamUrl(song.id);
      audioRef.current.play().catch(console.error);
    }
    setCurrentSong(song);
    setIsPlaying(true);

    // If shuffle is on, create a new shuffled queue starting with the selected song
    if (isShuffleOn) {
      const queue = getCurrentQueue();
      const remainingQueue = queue.filter(s => s.id !== song.id);
      const shuffled = shuffleQueue(remainingQueue);
      setShuffledQueue([song, ...shuffled]);
    }
  };

  const getUpcomingSongs = () => {
    const queue = isShuffleOn ? shuffledQueue : getCurrentQueue();
    if (!queue.length || !currentSong) return [];

    const currentIndex = queue.findIndex(song => song.id === currentSong.id);
    if (currentIndex === -1) return [];

    let upcomingSongs = queue.slice(currentIndex + 1);
    
    // If repeat all is on and we're near the end, add the beginning of the queue
    if (repeatMode === 'all' && upcomingSongs.length < 5) {
      upcomingSongs = [...upcomingSongs, ...queue.slice(0, currentIndex)];
    }

    return upcomingSongs;
  };

  const handlePlaylistSelectionForAlbum = (songs: Song[]) => {
    setSongsToAdd(songs);
    setIsPlaylistSelectionMode(true);
    setSelectedAlbum(null);
    setCurrentView('playlists');
  };

  const handlePlaylistSelect = async (playlist: Playlist) => {
    try {
      setLoading(true);
      await addToPlaylist(playlist.id, songsToAdd.map(song => song.id));
      setIsPlaylistSelectionMode(false);
      setSongsToAdd([]);
      setCurrentView('playlists');
      // Refresh playlists
      const playlistsData = await getPlaylists();
      setPlaylists(playlistsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add to playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (view === 'nowPlaying') {
      setSelectedAlbum(null);
      setSelectedPlaylist(null);
      setSelectedArtist(null);
    }
    // Restore scroll position for the view
    if (mainContentRef.current && scrollPositions[view]) {
      mainContentRef.current.scrollTop = scrollPositions[view];
    }
  };

  const renderContent = () => {
    const mainContent = () => {
      if (loading) {
        return (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
          </div>
        );
      }

      if (error) {
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-400 text-center">
              <p className="text-lg font-semibold mb-2">Error loading content</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        );
      }

      if (currentView === 'settings') {
        return <Settings />;
      }

      if (currentView === 'search') {
        return (
          <SearchView
            onAlbumClick={handleAlbumClick}
            onPlaySong={handlePlaySong}
            currentSong={currentSong}
            isPlaying={isPlaying}
          />
        );
      }

      if (selectedAlbum) {
        return (
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <button 
                onClick={() => {
                  setSelectedAlbum(null);
                  setCurrentView(previousView);
                }} 
                className="text-red-500"
              >
                ‹ Back
              </button>
            </div>
            <AlbumView
              album={selectedAlbum.album}
              songs={selectedAlbum.songs}
              onPlaySong={handlePlaySong}
              currentSong={currentSong}
              isPlaying={isPlaying}
              playlists={playlists}
              onPlaylistsChange={async () => {
                try {
                  const playlistsData = await getPlaylists();
                  setPlaylists(playlistsData);
                } catch (error) {
                  console.error('Failed to refresh playlists:', error);
                }
              }}
              onShowPlaylistSelection={() => handlePlaylistSelectionForAlbum(selectedAlbum.songs)}
            />
          </div>
        );
      }

      if (selectedPlaylist) {
        return (
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <button 
                onClick={() => setSelectedPlaylist(null)} 
                className="text-red-500"
              >
                ‹ Back
              </button>
            </div>
            <PlaylistView
              playlist={selectedPlaylist.playlist}
              songs={selectedPlaylist.songs}
              onPlaySong={handlePlaySong}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlaylistsChange={async () => {
                try {
                  const playlistsData = await getPlaylists();
                  setPlaylists(playlistsData);
                } catch (error) {
                  console.error('Failed to refresh playlists:', error);
                }
              }}
              onAlbumClick={handleAlbumClick}
            />
          </div>
        );
      }

      if (selectedArtist) {
        return (
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <button 
                onClick={() => setSelectedArtist(null)} 
                className="text-red-500"
              >
                ‹ Back
              </button>
            </div>
            <h1 className="text-3xl font-bold mb-4">{selectedArtist.artist.name}</h1>
            <AlbumGrid albums={selectedArtist.albums} onAlbumClick={handleAlbumClick} />
          </div>
        );
      }

      if (currentView === 'folders') {
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Folders</h2>
            
            {/* Breadcrumb navigation */}
            {directoryStack.length > 0 && (
              <div className="flex items-center space-x-2 mb-4">
                <button 
                  onClick={() => {
                    const newStack = [...directoryStack];
                    newStack.pop();
                    setDirectoryStack(newStack);
                    const previousDir = newStack[newStack.length - 1];
                    setCurrentDirectory(previousDir?.id || null);
                  }}
                  className="text-red-500"
                >
                  ‹ Back
                </button>
                <div className="text-zinc-400">
                  {directoryStack.map((dir, index) => (
                    <span key={dir.id}>
                      {index > 0 && " / "}
                      {dir.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {directories.map((directory) => (
                <div
                  key={directory.id}
                  className="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors cursor-pointer"
                  onClick={() => {
                    if (directory.isDir) {
                      setDirectoryStack([...directoryStack, { id: directory.id, name: directory.name }]);
                      setCurrentDirectory(directory.id);
                    } else {
                      // Handle file click - maybe play the song
                      if (directory.id) {
                        const song: Song = {
                          id: directory.id,
                          title: directory.name,
                          artist: directory.artist || '',
                          duration: directory.duration || 0,
                          track: directory.track || 0,
                          size: directory.size || 0,
                          contentType: directory.contentType || ''
                        };
                        handlePlaySong(song);
                      }
                    }
                  }}
                >
                  <div className="flex items-center">
                    <span className="mr-2">
                      {directory.isDir ? '📁' : '🎵'}
                    </span>
                    <h3 className="text-lg font-semibold">{directory.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">JatBeats</h1>
            <div 
              className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
              onClick={() => setCurrentView('settings')}
            >
              {user?.profilePhoto ? (
                <img 
                  src={user.profilePhoto} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <Camera size={24} />
                </div>
              )}
            </div>
          </div>
          
          <LibraryNav currentView={currentView} onNavigate={handleNavigate} />
          
          {currentView === 'nowPlaying' && (
            <MyMusic onAlbumClick={handleAlbumClick} />
          )}

          {currentView === 'albums' && (
            <AlbumsView albums={albums} onAlbumClick={handleAlbumClick} />
          )}

          {currentView === 'playlists' && (
            <PlaylistsView 
              playlists={playlists}
              onPlaylistClick={isPlaylistSelectionMode ? handlePlaylistSelect : handlePlaylistClick}
              onPlaylistsChange={async () => {
                try {
                  const playlistsData = await getPlaylists();
                  setPlaylists(playlistsData);
                } catch (error) {
                  console.error('Failed to refresh playlists:', error);
                }
              }}
            />
          )}

          {currentView === 'artists' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Artists</h2>
              <ArtistList artists={artists} onArtistClick={handleArtistClick} />
            </div>
          )}

          {currentView === 'songs' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Songs</h2>
              <SongList
                songs={songs}
                onPlaySong={handlePlaySong}
                currentSong={currentSong}
                isPlaying={isPlaying}
              />
            </div>
          )}

          {currentView === 'folders' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Folders</h2>
              
              {/* Breadcrumb navigation */}
              {directoryStack.length > 0 && (
                <div className="flex items-center space-x-2 mb-4">
                  <button 
                    onClick={() => {
                      const newStack = [...directoryStack];
                      newStack.pop();
                      setDirectoryStack(newStack);
                      const previousDir = newStack[newStack.length - 1];
                      setCurrentDirectory(previousDir?.id || null);
                    }}
                    className="text-red-500"
                  >
                    ‹ Back
                  </button>
                  <div className="text-zinc-400">
                    {directoryStack.map((dir, index) => (
                      <span key={dir.id}>
                        {index > 0 && " / "}
                        {dir.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {directories.map((directory) => (
                  <div
                    key={directory.id}
                    className="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors cursor-pointer"
                    onClick={() => {
                      if (directory.isDir) {
                        setDirectoryStack([...directoryStack, { id: directory.id, name: directory.name }]);
                        setCurrentDirectory(directory.id);
                      } else {
                        // Handle file click - maybe play the song
                        if (directory.id) {
                          const song: Song = {
                            id: directory.id,
                            title: directory.name,
                            artist: directory.artist || '',
                            duration: directory.duration || 0,
                            track: directory.track || 0,
                            size: directory.size || 0,
                            contentType: directory.contentType || ''
                          };
                          handlePlaySong(song);
                        }
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <span className="mr-2">
                        {directory.isDir ? '📁' : '🎵'}
                      </span>
                      <h3 className="text-lg font-semibold">{directory.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      );
    };

    return mainContent();
  };

  useEffect(() => {
    // Check if running in standalone mode
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    setIsStandalone(isInStandaloneMode);

    // Add event listener for changes in display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Prevent default touch behaviors in standalone mode
  useEffect(() => {
    if (isStandalone) {
      document.addEventListener('touchmove', (e) => {
        if (!e.target || !(e.target as HTMLElement).closest('.smooth-scroll')) {
          e.preventDefault();
        }
      }, { passive: false });
    }
  }, [isStandalone]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (playlistsDropdownRef.current && !playlistsDropdownRef.current.contains(event.target as Node)) {
        setShowPlaylistsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`flex flex-col h-screen bg-black text-white ${isStandalone ? 'standalone' : ''}`}>
      <main className="flex-1 overflow-y-auto pb-32 smooth-scroll" ref={mainContentRef}>
        <div className={`px-4 py-4 ${isStandalone ? 'pt-12' : ''}`}>
          {renderContent()}
        </div>
      </main>
      
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleSongEnd}
      />

      {currentSong && (
        <MusicPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onNext={handleNextSong}
          onPrevious={handlePreviousSong}
          onNowPlayingClick={() => setCurrentView('nowPlaying')}
          isShuffleOn={isShuffleOn}
          onToggleShuffle={handleToggleShuffle}
          repeatMode={repeatMode}
          onToggleRepeat={handleToggleRepeat}
          currentView={currentView}
          duration={audioRef.current?.duration || 0}
          currentTime={audioRef.current?.currentTime || 0}
          onSeek={handleSeek}
        />
      )}
      
      <PWAPrompt />
      
      <MobileNav
        currentView={currentView}
        onNavigate={handleNavigate}
        currentSong={currentSong}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <AppContent />
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;