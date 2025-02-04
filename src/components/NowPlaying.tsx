import React from 'react';
import type { Album } from '../lib/subsonic';
import { RecentAlbums } from './RecentAlbums';
import './NowPlaying.css';

interface MyMusicProps {
  onAlbumClick: (album: Album) => void;
}

export function MyMusic({ onAlbumClick }: MyMusicProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 px-4">
        <RecentAlbums onAlbumClick={onAlbumClick} />
      </div>
    </div>
  );
} 