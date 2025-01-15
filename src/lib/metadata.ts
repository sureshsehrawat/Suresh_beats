import * as mm from 'music-metadata';

export interface ArtworkResponse {
  artwork: string | null;
  source: 'song' | 'album' | 'default';
}

export async function extractArtwork(
  filePath: string,
  albumArtworkPath?: string
): Promise<ArtworkResponse> {
  try {
    // Try to get song-specific artwork
    const metadata = await mm.parseFile(filePath);
    
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const picture = metadata.common.picture[0];
      const base64Data = picture.data.toString('base64');
      return {
        artwork: `data:${picture.format};base64,${base64Data}`,
        source: 'song'
      };
    }

    // Fallback to album artwork if provided
    if (albumArtworkPath) {
      try {
        const albumMetadata = await mm.parseFile(albumArtworkPath);
        if (albumMetadata.common.picture && albumMetadata.common.picture.length > 0) {
          const picture = albumMetadata.common.picture[0];
          const base64Data = picture.data.toString('base64');
          return {
            artwork: `data:${picture.format};base64,${base64Data}`,
            source: 'album'
          };
        }
      } catch (error) {
        console.error('Error reading album artwork:', error);
      }
    }

    // Return null if no artwork found
    return {
      artwork: null,
      source: 'default'
    };
  } catch (error) {
    console.error('Error extracting artwork:', error);
    return {
      artwork: null,
      source: 'default'
    };
  }
} 