import React, { useState } from 'react';
import { Sparkles, TrendingUp, Radio, Flame, Award, Headphones } from 'lucide-react';
import AlbumCard from '../common/AlbumCard';
import ArtistCard from '../common/ArtistCard';
import PlaylistCard from '../common/PlaylistCard';
import GenreCard from '../common/GenreCard';
import TrackRow from '../common/TrackRow';
import {
  MOCK_ALBUMS,
  MOCK_ARTISTS,
  MOCK_PLAYLISTS,
  MOCK_GENRES,
  MOCK_TRACKS
} from '../../data/mockData';

interface DiscoverViewProps {
  onSelectPlaylist?: (playlistId: string) => void;
  onSelectArtist?: (artistId: string) => void;
  onSelectAlbum?: (albumId: string) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  onSelectPlaylist,
  onSelectArtist,
  onSelectAlbum
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Discoveries' },
    { id: 'trending', label: 'Trending Now' },
    { id: 'new', label: 'New Releases' },
    { id: 'curated', label: 'Curated Mixes' },
  ];

  return (
    <div className="space-y-10 pb-16 animate-fade-in">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-accent/20 via-card to-card p-8 border border-white/10 overflow-hidden">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Sound Radar
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Explore New Sonic Horizons
          </h1>
          <p className="text-text-secondary text-sm md:text-base leading-relaxed">
            Uncover handcrafted playlists, rising underground producers, algorithmic daily mixes, and deep spatial audio soundscapes.
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-accent text-white shadow-lg shadow-accent/25'
                    : 'bg-card/80 hover:bg-card-hover border border-white/10 text-text-secondary hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Charts Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold text-white tracking-tight">Global Top 5 Chart</h2>
          </div>
          <span className="text-xs text-text-muted">Updated 1 hour ago</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {MOCK_TRACKS.slice(0, 6).map((track, idx) => (
            <TrackRow key={track.id} track={track} index={idx + 1} playlistContext={MOCK_TRACKS} />
          ))}
        </div>
      </section>

      {/* Mood & Atmosphere Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold text-white tracking-tight">Mood & Atmosphere</h2>
          </div>
          <span className="text-xs text-text-muted">8 Curated Categories</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {MOCK_GENRES.map((genre) => (
            <GenreCard key={genre.id} genre={genre} />
          ))}
        </div>
      </section>

      {/* Featured Mixes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold text-white tracking-tight">Curated Daily Mixes</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {MOCK_PLAYLISTS.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onClick={() => onSelectPlaylist?.(playlist.id)}
            />
          ))}
        </div>
      </section>

      {/* Fresh Record Releases */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold text-white tracking-tight">Fresh Album Drops</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {MOCK_ALBUMS.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onClick={() => onSelectAlbum?.(album.id)}
            />
          ))}
        </div>
      </section>

      {/* Trending Artists */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold text-white tracking-tight">Artists on the Rise</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {MOCK_ARTISTS.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onClick={() => onSelectArtist?.(artist.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default DiscoverView;
