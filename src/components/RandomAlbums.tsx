import React, { useState, useEffect } from 'react';
import { Music } from 'lucide-react';
import type { Album } from '../lib/subsonic';
import { getRandomAlbums, getCoverArtUrl } from '../lib/subsonic';

interface RandomAlbumsProps {
  onAlbumClick: (album: Album) => void;
}

export function RandomAlbums({ onAlbumClick }: RandomAlbumsProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const randomAlbums = await getRandomAlbums();
        setAlbums(randomAlbums);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch random albums');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

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
      <h3 className="text-lg font-semibold mb-4 text-zinc-400">Discover Something New</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {albums.map((album) => (
          <div
            key={album.id}
            onClick={() => onAlbumClick(album)}
            className="group/album bg-zinc-800/40 rounded-xl p-3 transition-all duration-300 hover:bg-zinc-800/60 cursor-pointer"
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-3 shadow-lg">
              {album.coverArt ? (
                <img
                  src={getCoverArtUrl(album.coverArt)}
                  alt={album.name}
                  className="w-full h-full object-cover transform transition-transform duration-300 group-hover/album:scale-105"
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
    </div>
  );
} 