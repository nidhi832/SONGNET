export interface GenrePrediction {
  genre: string;
  probability: number; // e.g. 0.84
  color: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  coverUrl: string;
  audioUrl?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  duration: string; // e.g. "3:45"
  durationSeconds: number;
  genre: string; // Ground truth genre from FMA
  predictedGenre?: string; // SongNet AI predicted genre
  confidenceScore?: number; // e.g. 0.92
  plays: string; // e.g. "1.2M"
  releaseDate: string;
  lyrics?: string[];
  isLiked?: boolean;
  spectrogramUrl?: string;
  topPredictions?: GenrePrediction[];
}

export interface Artist {
  id: string;
  name: string;
  avatarUrl: string;
  bannerUrl: string;
  genre: string;
  followers: string;
  monthlyListeners: string;
  bio: string;
  popularTracks: Track[];
  albums: Album[];
  isFollowing?: boolean;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverUrl: string;
  releaseYear: string;
  genre: string;
  trackCount: number;
  tracks: Track[];
  isSaved?: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  creator: string;
  trackCount: number;
  totalDuration: string;
  tracks: Track[];
  isLiked?: boolean;
}

export interface GenreMood {
  id: string;
  title: string;
  category: 'mood' | 'genre';
  gradient: string;
  accentColor: string;
  iconName: string;
  trackCount: number;
  accuracy: string; // e.g. "71.4%"
}

export interface MLModelMetric {
  name: string;
  type: string;
  accuracy: number; // e.g. 65.23
  f1Score: number;
  inferenceTimeMs: number;
  parameters: string;
  isBest?: boolean;
}

export type ActiveTab =
  | 'home'
  | 'gemini-ai'
  | 'classifier'
  | 'models'
  | 'discover'
  | 'search'
  | 'library'
  | 'playlists'
  | 'albums'
  | 'artists'
  | 'liked'
  | 'playlist-detail'
  | 'artist-detail'
  | 'album-detail'
  | 'settings';
