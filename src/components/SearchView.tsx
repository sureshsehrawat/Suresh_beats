import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import type { Album, Song, Artist, SearchResults } from '../lib/subsonic';
import { search } from '../lib/subsonic';
import { AlbumGrid } from './AlbumGrid';
import { SongList } from './SongList';

interface SearchViewProps {
  onAlbumClick: (album: Album) => void;
  onPlaySong: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
}

export function SearchView({ onAlbumClick, onPlaySong, currentSong, isPlaying }: SearchViewProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const searchDebounced = async () => {
      if (!query.trim()) {
        setResults(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const searchResults = await search(query);
        setResults(searchResults);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred while searching');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="sticky top-0 bg-black z-10 pb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search albums or songs"
            className="w-full pl-10 pr-4 py-3 bg-zinc-900 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center">
          <p>{error}</p>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-8">
          {results.albums.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Albums</h2>
              <AlbumGrid albums={results.albums} onAlbumClick={onAlbumClick} />
            </div>
          )}

          {results.songs.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Songs</h2>
              <SongList
                songs={results.songs}
                onPlaySong={onPlaySong}
                currentSong={currentSong}
                isPlaying={isPlaying}
              />
            </div>
          )}

          {!results.albums.length && !results.songs.length && (
            <div className="text-center text-zinc-400 py-12">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}

      {!results && !loading && !error && (
        <div className="text-center text-zinc-400 py-12">
          Search for your favorite music
        </div>
      )}
    </div>
  );
} 