import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, MessageSquare, Airplay, List } from 'lucide-react';
import ColorThief from 'colorthief';
import type { Song } from '../lib/subsonic';
import { getCoverArtUrl } from '../lib/subsonic';
import { Toast } from './Toast';
import './NowPlaying.css';

interface NowPlayingProps {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  onTogglePlay: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSeek: (value: number) => void;
  onMinimize: () => void;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function NowPlaying({
  currentSong,
  isPlaying,
  progress,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onMinimize,
}: NowPlayingProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [dominantColor, setDominantColor] = useState<[number, number, number] | null>(null);
  const [isSliding, setIsSliding] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadImage = async () => {
      if (!currentSong?.coverArt || !imgRef.current) return;

      const colorThief = new ColorThief();
      const img = imgRef.current;

      try {
        if (!img.complete) {
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
        }

        const color = colorThief.getColor(img);
        setDominantColor(color);
      } catch (error) {
        console.error('Failed to extract color:', error);
      }
    };

    loadImage();
  }, [currentSong?.coverArt]);

  useEffect(() => {
    setIsZoomed(isPlaying);
  }, [isPlaying]);

  const handleMinimize = () => {
    setIsSliding(true);
    setTimeout(() => {
      onMinimize();
      setIsSliding(false);
    }, 500);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    onSeek(Math.max(0, Math.min(100, percentage)));
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStartY(clientY);
    setDragOffset(0);
  };

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const offset = clientY - dragStartY;
    
    if (offset > 0) {
      setDragOffset(offset);
      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(${offset}px)`;
      }
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset > 100) {
      handleMinimize();
    } else if (containerRef.current) {
      containerRef.current.style.transform = '';
    }
    setDragOffset(0);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('touchmove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  if (!currentSong) {
    return (
      <div className="flex items-center justify-center h-screen text-zinc-400">
        No song is currently playing
      </div>
    );
  }

  const currentTime = (progress / 100) * (currentSong.duration || 0);
  const remainingTime = (currentSong.duration || 0) - currentTime;

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

  return (
    <div 
      ref={containerRef}
      className={`now-playing-container ${isSliding ? 'sliding-down' : ''}`}
      style={{ 
        transition: isDragging ? 'none' : undefined 
      }}
    >
      <div className="absolute inset-0" style={backgroundStyle} />
      <div className={`background-blur ${isZoomed ? 'active' : ''}`} />
      
      <div 
        className="swipe-area"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div className="swipe-handle" />
      </div>

      <div className={`album-art-container ${isZoomed ? 'zoomed' : ''}`}>
        <img
          ref={imgRef}
          src={currentSong.coverArt ? getCoverArtUrl(currentSong.coverArt) : ''}
          alt={currentSong.title}
          crossOrigin="anonymous"
        />
      </div>

      <div className="player-content">
        <div className="song-info">
          <h2 className="song-title">{currentSong.title}</h2>
          <p className="song-artist">{currentSong.artist}</p>
        </div>

        <div className="flex justify-center">
          <span className="audio-quality">Lossless</span>
        </div>

        <div>
          <div 
            className="progress-bar"
            onClick={handleSeek}
          >
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="time-display">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(remainingTime)}</span>
          </div>
        </div>

        <div className="playback-controls">
          <button onClick={onPrevious}>
            <SkipBack size={32} />
          </button>
          
          <button onClick={onTogglePlay} className="play-pause-button">
            {isPlaying ? <Pause size={36} /> : <Play size={36} />}
          </button>
          
          <button onClick={onNext}>
            <SkipForward size={32} />
          </button>
        </div>

        <div className="volume-control">
          <Volume2 size={16} className="text-white opacity-80" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>

        <div className="additional-controls">
          <button>
            <MessageSquare size={22} />
          </button>
          <button>
            <Airplay size={22} />
          </button>
          <button>
            <List size={22} />
          </button>
        </div>
      </div>

      {toast && (
        <Toast message={toast} onClose={() => setToast(null)} />
      )}
    </div>
  );
} 