import type { Track, Artist, Album, Playlist, GenreMood, MLModelMetric } from '../types/music';

export const FMA_GENRES = [
  'Electronic',
  'Experimental',
  'Folk',
  'Hip-Hop',
  'Instrumental',
  'International',
  'Pop',
  'Rock'
] as const;

export const MOCK_ML_MODELS: MLModelMetric[] = [
  {
    name: 'SongNet (C-RNN)',
    type: 'Hybrid Deep C-RNN (Raw Audio)',
    accuracy: 49.25,
    f1Score: 0.4564,
    inferenceTimeMs: 14.2,
    parameters: '3 Conv1D + TimeDistributed FC (Raw Audio Mel-Spectrogram)',
    isBest: true
  },
  {
    name: 'Multilayer Perceptron (MLP)',
    type: 'Dense Neural Baseline',
    accuracy: 53.50,
    f1Score: 0.5384,
    inferenceTimeMs: 6.2,
    parameters: 'Dense Neural Net (256, 128) on 640 statistical features'
  },
  {
    name: 'Random Forest',
    type: 'Ensemble Baseline',
    accuracy: 48.75,
    f1Score: 0.4755,
    inferenceTimeMs: 11.5,
    parameters: '200 Decision Trees on 640 statistical features'
  },
  {
    name: 'Logistic Regression',
    type: 'Linear Baseline',
    accuracy: 43.00,
    f1Score: 0.4268,
    inferenceTimeMs: 2.1,
    parameters: 'Softmax Classifier on 640 statistical features'
  },
  {
    name: 'Linear SVM',
    type: 'Kernel Baseline',
    accuracy: 40.38,
    f1Score: 0.4017,
    inferenceTimeMs: 4.1,
    parameters: 'Linear Kernel on 640 statistical features'
  },
  {
    name: 'K Nearest Neighbors (KNN)',
    type: 'Instance Baseline',
    accuracy: 37.75,
    f1Score: 0.3675,
    inferenceTimeMs: 8.5,
    parameters: 'k=5 Neighbors on 640 statistical features'
  },
  {
    name: 'Random Guessing',
    type: 'Random Baseline',
    accuracy: 12.50,
    f1Score: 0.1250,
    inferenceTimeMs: 0.1,
    parameters: 'Uniform Random Choice (1 / 8 genres)'
  }
];

export const MOCK_CONFUSION_MATRIX = {
  labels: ['Electr.', 'Experim.', 'Folk', 'Hip-Hop', 'Instrum.', 'Internat.', 'Pop', 'Rock'],
  matrix: [
    [48, 8, 4, 11, 6, 9, 3, 11],   // Electronic (48% recall)
    [7, 29, 9, 6, 18, 14, 2, 15],  // Experimental (29% recall)
    [2, 4, 78, 2, 3, 5, 2, 4],     // Folk (78% recall)
    [5, 2, 1, 83, 1, 4, 1, 3],     // Hip-Hop (83% recall)
    [6, 12, 8, 4, 32, 21, 2, 15],  // Instrumental (32% recall)
    [3, 4, 7, 5, 4, 73, 1, 3],     // International (73% recall)
    [12, 10, 11, 14, 8, 21, 1, 23],// Pop (1% recall)
    [5, 7, 10, 4, 6, 8, 10, 50]    // Rock (50% recall)
  ]
};

// Royalty-free sample MP3 streams
const SAMPLE_AUDIO_URLS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'
];

export const MOCK_TRACKS: Track[] = [
  {
    id: 'track-blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    artistId: 'artist-weeknd',
    album: 'After Hours',
    albumId: 'album-after-hours',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    audioUrl: SAMPLE_AUDIO_URLS[0],
    youtubeId: '4NRXx6U8ABQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=4NRXx6U8ABQ',
    duration: '3:20',
    durationSeconds: 200,
    genre: 'Pop',
    predictedGenre: 'Pop',
    confidenceScore: 0.924,
    plays: '3.8B',
    releaseDate: '2020',
    isLiked: true,
    topPredictions: [
      { genre: 'Pop', probability: 0.924, color: '#ec4899' },
      { genre: 'Electronic', probability: 0.061, color: '#ff3b5c' },
      { genre: 'Rock', probability: 0.015, color: '#eab308' }
    ],
    lyrics: [
      "I've been on my own for long enough",
      "Maybe you can show me how to love, maybe",
      "I'm running out of time",
      "'Cause I can see the sun light up the sky"
    ]
  },
  {
    id: 'track-animals',
    title: 'Animals',
    artist: 'Martin Garrix',
    artistId: 'artist-garrix',
    album: 'Gold Skies EP',
    albumId: 'album-gold-skies',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    audioUrl: SAMPLE_AUDIO_URLS[1],
    youtubeId: 'gCYc8_7xUU4',
    youtubeUrl: 'https://martingarrix.com/music/animals/?utm_source=chatgpt.com',
    duration: '5:04',
    durationSeconds: 304,
    genre: 'Electronic',
    predictedGenre: 'Electronic',
    confidenceScore: 0.968,
    plays: '1.6B',
    releaseDate: '2013',
    isLiked: true,
    topPredictions: [
      { genre: 'Electronic', probability: 0.968, color: '#ff3b5c' },
      { genre: 'Pop', probability: 0.021, color: '#ec4899' },
      { genre: 'Experimental', probability: 0.011, color: '#a855f7' }
    ]
  },
  {
    id: 'track-lose-yourself',
    title: 'Lose Yourself',
    artist: 'Eminem',
    artistId: 'artist-eminem',
    album: '8 Mile Soundtrack',
    albumId: 'album-8mile',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    audioUrl: SAMPLE_AUDIO_URLS[2],
    youtubeId: '_Yhyp-_hX2s',
    youtubeUrl: 'https://www.youtube.com/watch?v=_Yhyp-_hX2s',
    duration: '5:26',
    durationSeconds: 326,
    genre: 'Hip-Hop',
    predictedGenre: 'Hip-Hop',
    confidenceScore: 0.982,
    plays: '2.1B',
    releaseDate: '2002',
    isLiked: true,
    topPredictions: [
      { genre: 'Hip-Hop', probability: 0.982, color: '#3b82f6' },
      { genre: 'Pop', probability: 0.012, color: '#ec4899' },
      { genre: 'Rock', probability: 0.006, color: '#eab308' }
    ]
  },
  {
    id: 'track-old-town-road',
    title: 'Old Town Road',
    artist: 'Lil Nas X ft. Billy Ray Cyrus',
    artistId: 'artist-lilnasx',
    album: '7 EP',
    albumId: 'album-7ep',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    audioUrl: SAMPLE_AUDIO_URLS[3],
    youtubeId: 'w2Ov5jzm3j8',
    youtubeUrl: 'https://www.youtube.com/watch?v=w2Ov5jzm3j8',
    duration: '2:37',
    durationSeconds: 157,
    genre: 'Hip-Hop',
    predictedGenre: 'Hip-Hop',
    confidenceScore: 0.884,
    plays: '2.4B',
    releaseDate: '2019',
    isLiked: false,
    topPredictions: [
      { genre: 'Hip-Hop', probability: 0.884, color: '#3b82f6' },
      { genre: 'Folk', probability: 0.082, color: '#22c55e' },
      { genre: 'Pop', probability: 0.034, color: '#ec4899' }
    ]
  },
  {
    id: 'track-country-roads',
    title: 'Take Me Home, Country Roads',
    artist: 'John Denver',
    artistId: 'artist-johndenver',
    album: 'Poems, Prayers & Promises',
    albumId: 'album-poems',
    coverUrl: 'https://images.unsplash.com/photo-1445985543468-8948562875c2?w=600&auto=format&fit=crop&q=80',
    audioUrl: SAMPLE_AUDIO_URLS[4],
    youtubeId: '1vrElj4tDsk',
    youtubeUrl: 'https://www.youtube.com/watch?v=1vrElj4tDsk',
    duration: '3:10',
    durationSeconds: 190,
    genre: 'Folk',
    predictedGenre: 'Folk',
    confidenceScore: 0.946,
    plays: '1.2B',
    releaseDate: '1971',
    isLiked: true,
    topPredictions: [
      { genre: 'Folk', probability: 0.946, color: '#22c55e' },
      { genre: 'Instrumental', probability: 0.038, color: '#06b6d4' },
      { genre: 'Pop', probability: 0.016, color: '#ec4899' }
    ]
  },
  {
    id: 'track-river-flows',
    title: 'River Flows in You',
    artist: 'Yiruma',
    artistId: 'artist-yiruma',
    album: 'First Love',
    albumId: 'album-firstlove',
    coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&auto=format&fit=crop&q=80',
    audioUrl: SAMPLE_AUDIO_URLS[5],
    youtubeId: '7wtfhZwyrcc',
    youtubeUrl: 'https://www.youtube.com/watch?v=7wtfhZwyrcc&utm_source=chatgpt.com',
    duration: '3:08',
    durationSeconds: 188,
    genre: 'Instrumental',
    predictedGenre: 'Instrumental',
    confidenceScore: 0.971,
    plays: '980M',
    releaseDate: '2001',
    isLiked: true,
    topPredictions: [
      { genre: 'Instrumental', probability: 0.971, color: '#06b6d4' },
      { genre: 'Folk', probability: 0.018, color: '#22c55e' },
      { genre: 'Experimental', probability: 0.011, color: '#a855f7' }
    ]
  },
  {
    id: 'track-believer',
    title: 'Believer',
    artist: 'Imagine Dragons',
    artistId: 'artist-imaginedragons',
    album: 'Evolve',
    albumId: 'album-evolve',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
    audioUrl: SAMPLE_AUDIO_URLS[0],
    youtubeId: 'fJ9rUzIMcZQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    duration: '3:24',
    durationSeconds: 204,
    genre: 'Rock',
    predictedGenre: 'Rock',
    confidenceScore: 0.915,
    plays: '2.9B',
    releaseDate: '2017',
    isLiked: false,
    topPredictions: [
      { genre: 'Rock', probability: 0.915, color: '#eab308' },
      { genre: 'Pop', probability: 0.062, color: '#ec4899' },
      { genre: 'Electronic', probability: 0.023, color: '#ff3b5c' }
    ]
  },
  {
    id: 'track-bohemian-rhapsody',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    artistId: 'artist-queen',
    album: 'A Night at the Opera',
    albumId: 'album-opera',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    audioUrl: SAMPLE_AUDIO_URLS[1],
    youtubeId: 'f4Mc-NYwLPA',
    youtubeUrl: 'https://www.youtube.com/watch?v=f4Mc-NYwLPA',
    duration: '5:55',
    durationSeconds: 355,
    genre: 'Rock',
    predictedGenre: 'Rock',
    confidenceScore: 0.897,
    plays: '2.5B',
    releaseDate: '1975',
    isLiked: true,
    topPredictions: [
      { genre: 'Rock', probability: 0.897, color: '#eab308' },
      { genre: 'Experimental', probability: 0.074, color: '#a855f7' },
      { genre: 'Instrumental', probability: 0.029, color: '#06b6d4' }
    ]
  }
];

export const MOCK_ALBUMS: Album[] = [
  {
    id: 'album-after-hours',
    title: 'After Hours',
    artist: 'The Weeknd',
    artistId: 'artist-weeknd',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    releaseYear: '2020',
    genre: 'Pop / Synthwave',
    trackCount: 14,
    tracks: MOCK_TRACKS.filter(t => t.albumId === 'album-after-hours')
  },
  {
    id: 'album-8mile',
    title: '8 Mile Soundtrack',
    artist: 'Eminem',
    artistId: 'artist-eminem',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    releaseYear: '2002',
    genre: 'Hip-Hop',
    trackCount: 16,
    tracks: MOCK_TRACKS.filter(t => t.albumId === 'album-8mile')
  },
  {
    id: 'album-evolve',
    title: 'Evolve',
    artist: 'Imagine Dragons',
    artistId: 'artist-imaginedragons',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
    releaseYear: '2017',
    genre: 'Rock',
    trackCount: 12,
    tracks: MOCK_TRACKS.filter(t => t.albumId === 'album-evolve')
  }
];

export const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-1',
    title: 'SONGNET Global Hits & FMA Benchmark',
    description: 'Iconic world hits analyzed by SONGNET C-RNN real-time audio classifier.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    creator: 'SONGNET AI Team',
    trackCount: 8,
    totalDuration: '33 Mins',
    tracks: MOCK_TRACKS
  }
];

export const MOCK_ARTISTS: Artist[] = [
  {
    id: 'artist-weeknd',
    name: 'The Weeknd',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    genre: 'Pop / R&B / Synthwave',
    followers: '115M',
    monthlyListeners: '108M',
    bio: 'Canadian singer-songwriter known for sonic versatility and dark synth pop aesthetics.',
    popularTracks: MOCK_TRACKS.filter(t => t.artistId === 'artist-weeknd'),
    albums: MOCK_ALBUMS.filter(a => a.artistId === 'artist-weeknd')
  },
  {
    id: 'artist-eminem',
    name: 'Eminem',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&auto=format&fit=crop&q=80',
    genre: 'Hip-Hop / Rap',
    followers: '78M',
    monthlyListeners: '69M',
    bio: 'Global hip-hop icon and multi-grammy winning lyricist.',
    popularTracks: MOCK_TRACKS.filter(t => t.artistId === 'artist-eminem'),
    albums: MOCK_ALBUMS.filter(a => a.artistId === 'artist-eminem')
  }
];

export const MOCK_GENRES: GenreMood[] = [
  {
    id: 'genre-1',
    title: 'Pop',
    category: 'genre',
    gradient: 'from-pink-600 to-rose-900',
    accentColor: '#ec4899',
    iconName: 'Zap',
    trackCount: 1000,
    accuracy: '76.5%'
  },
  {
    id: 'genre-2',
    title: 'Electronic',
    category: 'genre',
    gradient: 'from-pink-600 to-purple-800',
    accentColor: '#ff3b5c',
    iconName: 'Zap',
    trackCount: 1000,
    accuracy: '72.0%'
  },
  {
    id: 'genre-3',
    title: 'Hip-Hop',
    category: 'genre',
    gradient: 'from-blue-600 to-indigo-900',
    accentColor: '#3b82f6',
    iconName: 'Flame',
    trackCount: 1000,
    accuracy: '81.0%'
  },
  {
    id: 'genre-4',
    title: 'Folk',
    category: 'genre',
    gradient: 'from-emerald-600 to-teal-900',
    accentColor: '#22c55e',
    iconName: 'Trees',
    trackCount: 1000,
    accuracy: '74.0%'
  },
  {
    id: 'genre-5',
    title: 'Instrumental',
    category: 'genre',
    gradient: 'from-cyan-600 to-blue-900',
    accentColor: '#06b6d4',
    iconName: 'Music',
    trackCount: 1000,
    accuracy: '68.0%'
  },
  {
    id: 'genre-6',
    title: 'Rock',
    category: 'genre',
    gradient: 'from-amber-600 to-red-900',
    accentColor: '#eab308',
    iconName: 'Radio',
    trackCount: 1000,
    accuracy: '64.0%'
  }
];
