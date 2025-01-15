import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Music } from 'lucide-react';
import type { Album } from '../lib/subsonic';
import { getFrequentAlbums, getCoverArtUrl } from '../lib/subsonic';
import './RecentAlbums.css';

interface FrequentAlbumsProps {
  onAlbumClick: (album: Album) => void;
}

export function FrequentAlbums({ onAlbumClick }: FrequentAlbumsProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const frequentAlbums = await getFrequentAlbums();
        setAlbums(frequentAlbums);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch frequent albums');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('frequent-albums-container');
    if (!container) return;

    const scrollAmount = direction === 'left' ? -200 : 200;
    const newPosition = scrollPosition + scrollAmount;
    
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    
    setScrollPosition(newPosition);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
      </div>
    );
  }

  if (albums.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <h3 className="text-lg font-semibold mb-4 text-zinc-400">Most Played</h3>
      <div className="relative group">
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black/50 rounded-full text-white/60 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          id="frequent-albums-container"
          className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          {albums.map((album) => (
            <div
              key={album.id}
              onClick={() => onAlbumClick(album)}
              className="flex-shrink-0 w-40 cursor-pointer group/album"
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-2">
                {album.coverArt ? (
                  <img
                    src={getCoverArtUrl(album.coverArt)}
                    alt={album.name}
                    className="w-full h-full object-cover transform transition-transform group-hover/album:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-12 h-12 text-zinc-500" />
                  </div>
                )}
              </div>
              <div className="truncate font-medium text-sm group-hover/album:text-white">
                {album.name}
              </div>
              <div className="truncate text-xs text-zinc-400">
                {album.artist}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black/50 rounded-full text-white/60 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
} 