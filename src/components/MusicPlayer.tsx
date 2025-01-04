import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Repeat, Shuffle } from 'lucide-react';
import type { Song } from '../lib/subsonic';
import { getCoverArtUrl } from '../lib/subsonic';

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
}) => {
  if (!currentSong || currentView === 'nowPlaying') return null;

  return (
    <div 
      onClick={onNowPlayingClick}
      style={{ bottom: '72px' }}
      className="fixed left-0 right-0 backdrop-blur-md bg-white/[0.02] supports-[backdrop-filter]:bg-white/[0.02] cursor-pointer z-10"
    >
      <div className="flex items-center h-[4.5rem] px-4 py-2 border-t border-white/[0.06] bg-black/30">
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
            <Shuffle size={20} />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onPrevious(); }}
            className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <SkipBack size={20} />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
            className="w-10 h-10 flex items-center justify-center text-white hover:text-white/80 transition-colors bg-red-500 rounded-full"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <SkipForward size={20} />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onToggleRepeat(); }}
            className={`w-8 h-8 flex items-center justify-center transition-colors relative ${
              repeatMode !== 'off' ? 'text-red-500' : 'text-white/60 hover:text-white'
            }`}
          >
            <Repeat size={20} />
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
};