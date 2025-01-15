import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, List, Shuffle, Repeat, ChevronDown, Heart, Share2 } from 'lucide-react';
import type { Song } from '../lib/subsonic';
import { getCoverArtUrl } from '../lib/subsonic';
import ProgressBar from './ProgressBar';

interface MusicPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onNowPlayingClick?: () => void;
  isShuffleOn: boolean;
  onToggleShuffle: () => void;
  repeatMode: 'off' | 'all' | 'one';
  onToggleRepeat: () => void;
  currentView: string;
  duration?: number;
  currentTime?: number;
  onSeek?: (time: number) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentSong,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
  onNowPlayingClick,
  isShuffleOn,
  onToggleShuffle,
  repeatMode,
  onToggleRepeat,
  currentView,
  duration = 0,
  currentTime = 0,
  onSeek,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const swipeThreshold = 50; // Minimum distance for a swipe

  useEffect(() => {
    if (currentView === 'nowPlaying') {
      setIsFullScreen(true);
    }
  }, [currentView]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !touchEnd) return;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // If vertical swipe is more prominent and it's downward
    if (absDeltaY > absDeltaX && deltaY > swipeThreshold) {
      setIsFullScreen(false);
      onNowPlayingClick?.();
      return;
    }

    // If horizontal swipe is more prominent
    if (absDeltaX > absDeltaY && absDeltaX > swipeThreshold) {
      if (deltaX > 0) {
        // Swipe right - previous song
        onPrevious();
      } else {
        // Swipe left - next song
        onNext();
      }
    }
  };

  if (!currentSong) return null;

  const miniPlayer = (
    <div 
      onClick={() => setIsFullScreen(true)}
      style={{ bottom: '72px' }}
      className="fixed left-0 right-0 backdrop-blur-md bg-[#1A1A1A]/40 cursor-pointer z-[50]"
    >
      <div className="flex items-center h-[4.5rem] px-4 py-2 border-t border-zinc-800/20">
        <div className="h-12 w-12 rounded-lg overflow-hidden bg-zinc-800 mr-4 flex-shrink-0">
          {currentSong.coverArt && (
            <img
              src={getCoverArtUrl(currentSong.coverArt)}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="truncate font-medium text-white">{currentSong.title}</div>
          <div className="truncate text-sm text-white/60">{currentSong.artist}</div>
        </div>
        
        <div className="flex items-center space-x-4 ml-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleShuffle(); }}
            className={`w-8 h-8 flex items-center justify-center transition-colors ${
              isShuffleOn ? 'text-red-500' : 'text-white/60 hover:text-white'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onPrevious(); }}
            className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
            className="w-10 h-10 flex items-center justify-center text-white hover:text-white/80 transition-colors bg-red-500 rounded-full"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onToggleRepeat(); }}
            className={`w-8 h-8 flex items-center justify-center transition-colors relative ${
              repeatMode !== 'off' ? 'text-red-500' : 'text-white/60 hover:text-white'
            }`}
          >
            <Repeat className="w-5 h-5" />
            {repeatMode === 'one' && (
              <span className="absolute text-[10px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                1
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const fullScreenPlayer = (
    <div 
      className="fixed inset-0 bg-gradient-to-b from-zinc-900/95 to-black z-[60]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex flex-col h-full px-6 py-12 relative">
        <div className="absolute top-8 left-6 flex items-center">
          <button 
            onClick={() => setIsFullScreen(false)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <ChevronDown size={24} />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center mt-8">
          <div 
            className={`w-72 h-72 md:w-96 md:h-96 rounded-3xl shadow-2xl overflow-hidden transition-transform duration-300 ease-in-out ${
              isPlaying ? 'scale-105' : 'scale-100'
            }`}
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            {currentSong.coverArt && (
              <img
                src={getCoverArtUrl(currentSong.coverArt)}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        <div 
          className="mt-12 text-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">{currentSong.title}</h2>
          <p className="text-white/60 font-medium">{currentSong.artist}</p>
        </div>

        <div className="mt-8 px-1">
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={onSeek || (() => {})}
          />
        </div>

        <div className="mt-8 flex items-center justify-center space-x-8">
          <button 
            onClick={onToggleShuffle}
            className={`p-2 rounded-full transition-colors ${
              isShuffleOn ? 'text-red-500' : 'text-white/60 hover:text-white'
            }`}
          >
            <Shuffle className="w-6 h-6" />
          </button>
          
          <button 
            onClick={onPrevious} 
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <SkipBack className="w-8 h-8" />
          </button>

          <button 
            onClick={onTogglePlay}
            className={`w-16 h-16 flex items-center justify-center bg-red-500 hover:bg-red-600 rounded-full 
              transform transition-all duration-150 ease-in-out active:scale-95 shadow-lg`}
          >
            {isPlaying ? 
              <Pause className="w-8 h-8 text-white" /> : 
              <Play className="w-8 h-8 text-white ml-1" />
            }
          </button>

          <button 
            onClick={onNext} 
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <SkipForward className="w-8 h-8" />
          </button>

          <button 
            onClick={onToggleRepeat}
            className={`p-2 rounded-full transition-colors relative ${
              repeatMode !== 'off' ? 'text-red-500' : 'text-white/60 hover:text-white'
            }`}
          >
            <Repeat className="w-6 h-6" />
            {repeatMode === 'one' && (
              <span className="absolute text-[10px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                1
              </span>
            )}
          </button>
        </div>

        <div className="mt-12 flex items-center justify-between px-4">
          <button className="p-2 text-white/60 hover:text-white transition-colors">
            <Heart className="w-6 h-6" />
          </button>
          <button className="p-2 text-white/60 hover:text-white transition-colors">
            <Volume2 className="w-6 h-6" />
          </button>
          <button className="p-2 text-white/60 hover:text-white transition-colors">
            <List className="w-6 h-6" />
          </button>
          <button className="p-2 text-white/60 hover:text-white transition-colors">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );

  return isFullScreen ? fullScreenPlayer : miniPlayer;
};