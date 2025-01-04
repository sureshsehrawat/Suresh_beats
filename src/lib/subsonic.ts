import { XMLParser } from 'fast-xml-parser';

const BASE_URL = 'https://demo.navidrome.org';
const USER = 'demo';
const PASS = 'demo';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
});

export interface Album {
  id: string;
  name: string;
  artist: string;
  coverArt: string;
  songCount: number;
  created: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  track: number;
  size: number;
  contentType: string;
  coverArt?: string;
  created?: string;
}

export interface Playlist {
  id: string;
  name: string;
  songCount: number;
  duration: number;
  created: string;
  changed: string;
  coverArt?: string;
}

export interface Artist {
  id: string;
  name: string;
  albumCount: number;
  coverArt?: string;
}

export interface SearchResults {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
}

export interface MusicFolder {
  id: string;
  name: string;
}

export interface Directory {
  id: string;
  name: string;
  parent?: string;
  starred?: string;
  playCount?: number;
  created?: string;
  isDir?: boolean;
  artist?: string;
  duration?: number;
  track?: number;
  size?: number;
  contentType?: string;
}

export const getAlbums = async (): Promise<Album[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/rest/getAlbumList2?u=${USER}&p=${PASS}&v=1.13.0&c=spotify-clone&type=alphabeticalByName&size=500&f=json`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data['subsonic-response'].status !== 'ok') {
      throw new Error(data['subsonic-response'].error?.message || 'Subsonic API error');
    }

    return data['subsonic-response'].albumList2?.album || [];
  } catch (error) {
    console.error('Subsonic API error:', error);
    throw new Error('Failed to fetch albums from Subsonic server');
  }
};

export const getAlbum = async (id: string): Promise<{ album: Album; songs: Song[] }> => {
  try {
    const response = await fetch(
      `${BASE_URL}/rest/getAlbum?u=${USER}&p=${PASS}&v=1.13.0&c=spotify-clone&id=${id}&f=json`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data['subsonic-response'].status !== 'ok') {
      throw new Error(data['subsonic-response'].error?.message || 'Subsonic API error');
    }

    return {
      album: data['subsonic-response'].album,
      songs: data['subsonic-response'].album.song || [],
    };
  } catch (error) {
    console.error('Subsonic API error:', error);
    throw new Error('Failed to fetch album details');
  }
};

export const getCoverArtUrl = (id: string): string => {
  return `${BASE_URL}/rest/getCoverArt?id=${id}&u=${USER}&p=${PASS}&v=1.13.0&c=spotify-clone`;
};

export const getStreamUrl = (id: string): string => {
  return `${BASE_URL}/rest/stream?id=${id}&u=${USER}&p=${PASS}&v=1.13.0&c=spotify-clone`;
};

export const getPlaylists = async (): Promise<Playlist[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/rest/getPlaylists?u=${USER}&p=${PASS}&v=1.13.0&c=spotify-clone&f=json`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data['subsonic-response'].status !== 'ok') {
      throw new Error(data['subsonic-response'].error?.message || 'Subsonic API error');
    }

    return data['subsonic-response'].playlists?.playlist || [];
  } catch (error) {
    console.error('Subsonic API error:', error);
    throw new Error('Failed to fetch playlists');
  }
};

export const getPlaylist = async (id: string): Promise<{ playlist: Playlist; songs: Song[] }> => {
  try {
    const response = await fetch(
      `${BASE_URL}/rest/getPlaylist?u=${USER}&p=${PASS}&v=1.13.0&c=spotify-clone&id=${id}&f=json`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data['subsonic-response'].status !== 'ok') {
      throw new Error(data['subsonic-response'].error?.message || 'Subsonic API error');
    }

    return {
      playlist: data['subsonic-response'].playlist,
      songs: data['subsonic-response'].playlist.entry || [],
    };
  } catch (error) {
    console.error('Subsonic API error:', error);
    throw new Error('Failed to fetch playlist details');
  }
};

export const getArtists = async (): Promise<Artist[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/rest/getArtists?u=${USER}&p=${PASS}&v=1.13.0&c=spotify-clone&f=json`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data['subsonic-response'].status !== 'ok') {
      throw new Error(data['subsonic-response'].error?.message || 'Subsonic API error');
    }

    return data['subsonic-response'].artists?.index?.flatMap((index: { artist: Artist[] }) => index.artist) || [];
  } catch (error) {
    console.error('Subsonic API error:', error);
    throw new Error('Failed to fetch artists');
  }
};

export const getArtist = async (id: string): Promise<{ artist: Artist; albums: Album[] }> => {
  try {
    const response = await fetch(
      `${BASE_URL}/rest/getArtist?u=${USER}&p=${PASS}&v=1.13.0&c=spotify-clone&id=${id}&f=json`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data['subsonic-response'].status !== 'ok') {
      throw new Error(data['subsonic-response'].error?.message || 'Subsonic API error');
    }

    return {
      artist: data['subsonic-response'].artist,
      albums: data['subsonic-response'].artist.album || [],
    };
  } catch (error) {
    console.error('Subsonic API error:', error);
    throw new Error('Failed to fetch artist details');
  }
};

export const getAllSongs = async (): Promise<Song[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/rest/getRandomSongs?u=${USER}&p=${PASS}&v=1.13.0&c=spotify-clone&size=500&f=json`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data['subsonic-response'].status !== 'ok') {
      throw new Error(data['subsonic-response'].error?.message || 'Subsonic API error');
    }

    return data['subsonic-response'].randomSongs?.song || [];
  } catch (error) {
    console.error('Subsonic API error:', error);
    throw new Error('Failed to fetch songs');
  }
};

export const getRecentSongs = async (): Promise<Song[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/rest/getAlbumList2?u=${USER}&p=${PASS}&v=1.13.0&c=spotify-clone&type=newest&size=10&f=json`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data['subsonic-response'].status !== 'ok') {
      throw new Error(data['subsonic-response'].error?.message || 'Subsonic API error');
    }

    // Get all songs from the recent albums
    const albums = data['subsonic-response'].albumList2?.album || [];
    const songs: Song[] = [];
    
    // Only fetch songs from the 5 most recent albums to keep it fast
    const recentAlbums = albums.slice(0, 5);
    
    for (const album of recentAlbums) {
      const albumDetails = await getAlbum(album.id);
      songs.push(...albumDetails.songs);
    }

    // Sort by creation date (newest first)
    return songs.sort((a, b) => {
      const dateA = a.created ? new Date(a.created).getTime() : 0;
      const dateB = b.created ? new Date(b.created).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Subsonic API error:', error);
    throw new Error('Failed to fetch recent songs');
  }
};

export const createPlaylist = async (name: string): Promise<Playlist> => {
  try {
    // First create an empty playlist
    const response = await fetch(
      `${BASE_URL}/rest/createPlaylist?u=${USER}&p=${PASS}&v=1.13.0&c=spotify-clone&name=${encodeURIComponent(name)}&f=json`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data['subsonic-response'].status !== 'ok') {
      throw new Error(data['subsonic-response'].error?.message || 'Subsonic API error');
    }

    // After creation, fetch the playlist details to get the full object
    const playlists = await getPlaylists();
    const newPlaylist = playlists.find(p => p.name === name);
    
    if (!newPlaylist) {
      throw new Error('Failed to find newly created playlist');
    }

    return newPlaylist;
  } catch (error) {
    console.error('Subsonic API error:', error);
    throw new Error('Failed to create playlist');
  }
};

export const addToPlaylist = async (playlistId: string, songIds: string[]): Promise<void> => {
  try {
    // Add each song one by one as required by the Subsonic API
    for (const songId of songIds) {
      const response = await fetch(
        `${BASE_URL}/rest/updatePlaylist?u=${USER}&p=${PASS}&v=1.13.0&c=spotify-clone&playlistId=${encodeURIComponent(playlistId)}&songIdToAdd=${encodeURIComponent(songId)}&f=json`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data['subsonic-response'].status !== 'ok') {
        throw new Error(data['subsonic-response'].error?.message || 'Subsonic API error');
      }
    }
  } catch (error) {
    console.error('Subsonic API error:', error);
    throw new Error('Failed to add songs to playlist');
  }
};

export const getRecentAlbums = async (): Promise<Album[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/rest/getAlbumList2?u=${USER}&p=${PASS}&v=1.13.0&c=spotify-clone&type=recent&size=20&f=json`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data['subsonic-response'].status !== 'ok') {
      throw new Error(data['subsonic-response'].error?.message || 'Subsonic API error');
    }

    return data['subsonic-response'].albumList2?.album || [];
  } catch (error) {
    console.error('Subsonic API error:', error);
    throw new Error('Failed to fetch recent albums');
  }
};

export const search = async (query: string): Promise<SearchResults> => {
  try {
    const response = await fetch(
      `${BASE_URL}/rest/search3?u=${USER}&p=${PASS}&v=1.13.0&c=spotify-clone&query=${encodeURIComponent(query)}&f=json`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data['subsonic-response'].status !== 'ok') {
      throw new Error(data['subsonic-response'].error?.message || 'Subsonic API error');
    }

    const searchResult = data['subsonic-response'].searchResult3;
    return {
      songs: searchResult?.song || [],
      albums: searchResult?.album || [],
      artists: searchResult?.artist || [],
    };
  } catch (error) {
    console.error('Subsonic API error:', error);
    throw new Error('Failed to search');
  }
};

export const getMusicFolders = async (): Promise<MusicFolder[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/rest/getMusicFolders?u=${USER}&p=${PASS}&v=1.13.0&c=spotify-clone&f=json`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data['subsonic-response'].status !== 'ok') {
      throw new Error(data['subsonic-response'].error?.message || 'Subsonic API error');
    }

    return data['subsonic-response'].musicFolders?.musicFolder || [];
  } catch (error) {
    console.error('Subsonic API error:', error);
    throw new Error('Failed to fetch music folders');
  }
};

export const getMusicDirectories = async (folderId?: string): Promise<Directory[]> => {
  try {
    // If no folderId is provided, get the root indexes
    if (!folderId) {
      const response = await fetch(
        `${BASE_URL}/rest/getIndexes?u=${USER}&p=${PASS}&v=1.13.0&c=spotify-clone&f=json`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data['subsonic-response'].status !== 'ok') {
        throw new Error(data['subsonic-response'].error?.message || 'Subsonic API error');
      }

      // Get all directories from all indexes
      const indexes = data['subsonic-response'].indexes?.index || [];
      const directories: Directory[] = [];
      
      indexes.forEach((index: any) => {
        if (index.artist) {
          const artists = Array.isArray(index.artist) ? index.artist : [index.artist];
          artists.forEach((artist: any) => {
            directories.push({
              id: artist.id,
              name: artist.name,
              isDir: true
            });
          });
        }
      });

      return directories;
    } 
    // If folderId is provided, get the specific directory contents
    else {
      const response = await fetch(
        `${BASE_URL}/rest/getMusicDirectory?u=${USER}&p=${PASS}&v=1.13.0&c=spotify-clone&id=${folderId}&f=json`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data['subsonic-response'].status !== 'ok') {
        throw new Error(data['subsonic-response'].error?.message || 'Subsonic API error');
      }

      const directory = data['subsonic-response'].directory;
      const children = directory?.child || [];

      return children.map((child: any) => ({
        id: child.id,
        name: child.title || child.name,
        parent: child.parent,
        starred: child.starred,
        playCount: child.playCount,
        created: child.created,
        isDir: child.isDir,
        artist: child.artist,
        duration: child.duration,
        track: child.track,
        size: child.size,
        contentType: child.contentType
      }));
    }
  } catch (error) {
    console.error('Subsonic API error:', error);
    throw new Error('Failed to fetch music directories');
  }
};