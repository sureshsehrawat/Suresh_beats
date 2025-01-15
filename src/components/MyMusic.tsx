import React from 'react';
import type { Album } from '../lib/subsonic';
import { RecentAlbums } from './RecentAlbums';
import { FrequentAlbums } from './FrequentAlbums';
import { RandomAlbums } from './RandomAlbums';
import './NowPlaying.css';

interface MyMusicProps {
  onAlbumClick: (album: Album) => void;
}

export function MyMusic({ onAlbumClick }: MyMusicProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 px-4 space-y-12 pb-8 overflow-y-auto">
        <RecentAlbums onAlbumClick={onAlbumClick} />
        <FrequentAlbums onAlbumClick={onAlbumClick} />
        <RandomAlbums onAlbumClick={onAlbumClick} />
      </div>
    </div>
  );
} 