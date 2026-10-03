import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { MOCK_ALBUMS, MOCK_TRACKS, MOCK_PLAYLISTS, MOCK_GENRES } from '../../data/mockData';
import AlbumCard from '../common/AlbumCard';
import TrackRow from '../common/TrackRow';
import PlaylistCard from '../common/PlaylistCard';
import GenreCard from '../common/GenreCard';
import { SkeletonCardGrid, SkeletonTrackList } from '../common/SkeletonLoader';
import ErrorState from '../common/ErrorState';
import { Search, Sparkles, Flame, Clock, Radio, ChevronRight } from 'lucide-react';

interface HomeViewProps {
  onSelectPlaylist?: (playlistId: string) => void;
  onSelectArtist?: (artistId: string) => void;
  onSelectAlbum?: (albumId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectPlaylist,
  onSelectAlbum
}) => {
  const {
    searchQuery,
    setSearchQuery,
    searchFilter,
    setSearchFilter,
    navigateTo,
    isLoading,
    isError
  } = usePlayer();

  if (isError) {
    return <ErrorState />;
  }

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('search');
    }
  };

  return (
    <div className="space-y-12 pb-16 animate-fade-in">
      {/* HERO / SEARCH DISCOVERY BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent/20 via-card to-card p-8 md:p-12 border border-white/10 shadow-2xl backdrop-blur-2xl">
        {/* Background ambient glowing shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-purple-600/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Discovery Engine
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">
            Find your next <span className="text-gradient">sound</span>.
          </h1>

          <p className="text-text-secondary text-sm md:text-base leading-relaxed">
            Explore millions of high-definition spatial tracks, underground electronic releases, curated acoustic vibes, and custom algorithmic mixes.
          </p>

          {/* Large Hero Search Form */}
          <form onSubmit={handleHeroSearchSubmit} className="relative group max-w-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-text-muted group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                placeholder="Search tracks, artists, albums or mood categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-24 py-4 rounded-2xl bg-black/40 border border-white/15 focus:border-accent text-white placeholder-text-muted text-sm font-medium focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all shadow-inner backdrop-blur-md"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-xs transition-all shadow-md hover:scale-105 active:scale-95"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-text-muted font-medium mr-1">Filter by:</span>
            {(['all', 'tracks', 'artists', 'albums', 'playlists'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSearchFilter(filter)}
                className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-all ${
                  searchFilter === filter
                    ? 'bg-accent text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/5'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION A — FEATURED MUSIC (Horizontal Album Cards) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-accent" />
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Featured Albums</h2>
          </div>
          <button
            onClick={() => navigateTo('discover')}
            className="text-xs font-semibold text-text-secondary hover:text-white flex items-center gap-1 transition-colors"
          >
            Explore All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <SkeletonCardGrid count={5} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {MOCK_ALBUMS.slice(0, 5).map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onClick={() => onSelectAlbum?.(album.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECTION B — RECENTLY PLAYED TRACKS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Recently Played</h2>
          </div>
          <button
            onClick={() => navigateTo('library')}
            className="text-xs font-semibold text-text-secondary hover:text-white flex items-center gap-1 transition-colors"
          >
            View History <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <SkeletonTrackList count={4} />
        ) : (
          <div className="space-y-1">
            {MOCK_TRACKS.slice(0, 5).map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx + 1}
                playlistContext={MOCK_TRACKS}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECTION C — RECOMMENDED FOR YOU (Playlists) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-accent" />
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Recommended For You</h2>
          </div>
        </div>

        {isLoading ? (
          <SkeletonCardGrid count={4} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {MOCK_PLAYLISTS.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onClick={() => onSelectPlaylist?.(playlist.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECTION D — GENRES & MOODS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Genres & Atmospheres</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {MOCK_GENRES.slice(0, 8).map((genre) => (
            <GenreCard key={genre.id} genre={genre} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeView;
