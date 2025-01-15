import React from 'react';
import type { Artist } from '../lib/subsonic';
import { getCoverArtUrl } from '../lib/subsonic';

interface ArtistGridProps {
  artists: Artist[];
  onArtistClick: (artist: Artist) => void;
}

export const ArtistGrid: React.FC<ArtistGridProps> = ({ artists, onArtistClick }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {artists.map((artist) => (
        <div
          key={artist.id}
          className="cursor-pointer hover:bg-gray-800 p-4 rounded-lg transition-colors"
          onClick={() => onArtistClick(artist)}
        >
          <div className="aspect-square mb-4">
            <img
              src={artist.coverArt ? getCoverArtUrl(artist.coverArt) : '/default-artist.png'}
              alt={artist.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <h3 className="font-semibold truncate">{artist.name}</h3>
          <p className="text-sm text-gray-400">{artist.albumCount} albums</p>
        </div>
      ))}
    </div>
  );
}; 