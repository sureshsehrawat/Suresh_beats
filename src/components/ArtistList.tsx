import React from 'react';
import type { Artist } from '../lib/subsonic';

interface ArtistListProps {
  artists: Artist[];
  onArtistClick: (artist: Artist) => void;
}

export const ArtistList: React.FC<ArtistListProps> = ({ artists, onArtistClick }) => {
  return (
    <div className="space-y-2">
      {artists.map((artist) => (
        <div
          key={artist.id}
          className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
          onClick={() => onArtistClick(artist)}
        >
          <div className="flex-1">
            <h3 className="font-medium">{artist.name}</h3>
            <p className="text-sm text-gray-400">{artist.albumCount} albums</p>
          </div>
          <div className="text-sm text-gray-400">›</div>
        </div>
      ))}
    </div>
  );
}; 