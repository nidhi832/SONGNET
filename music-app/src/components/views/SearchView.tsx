import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { MOCK_TRACKS, MOCK_ARTISTS, MOCK_ALBUMS, MOCK_PLAYLISTS } from '../../data/mockData';
import TrackRow from '../common/TrackRow';
import ArtistCard from '../common/ArtistCard';
import AlbumCard from '../common/AlbumCard';
import PlaylistCard from '../common/PlaylistCard';
import EmptyState from '../common/EmptyState';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

interface SearchViewProps {
  initialQuery?: string;
  onSelectPlaylist?: (id: string) => void;
  onSelectArtist?: (id: string) => void;
  onSelectAlbum?: (id: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  initialQuery,
  onSelectPlaylist,
  onSelectArtist,
  onSelectAlbum
}) => {
  const { searchQuery, setSearchQuery, searchFilter, setSearchFilter, navigateTo } = usePlayer();

  const currentQuery = initialQuery !== undefined ? initialQuery : searchQuery;
  const queryLower = currentQuery.toLowerCase().trim();

  const filteredTracks = MOCK_TRACKS.filter(
    t => t.title.toLowerCase().includes(queryLower) || t.artist.toLowerCase().includes(queryLower) || t.genre.toLowerCase().includes(queryLower)
  );

  const filteredArtists = MOCK_ARTISTS.filter(
    a => a.name.toLowerCase().includes(queryLower) || a.genre.toLowerCase().includes(queryLower)
  );

  const filteredAlbums = MOCK_ALBUMS.filter(
    a => a.title.toLowerCase().includes(queryLower) || a.artist.toLowerCase().includes(queryLower)
  );

  const filteredPlaylists = MOCK_PLAYLISTS.filter(
    p => p.title.toLowerCase().includes(queryLower) || p.description.toLowerCase().includes(queryLower)
  );

  const totalResults =
    filteredTracks.length + filteredArtists.length + filteredAlbums.length + filteredPlaylists.length;

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header Search Control Bar */}
      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            placeholder="Search tracks, artists, albums, or playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border border-white/10 text-white placeholder-text-muted text-base font-medium focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/15 transition-all shadow-lg"
          />
        </div>

        {/* Filters and Counters */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {(['all', 'tracks', 'artists', 'albums', 'playlists'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSearchFilter(filter)}
                className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                  searchFilter === filter
                    ? 'bg-accent text-white shadow-md'
                    : 'bg-card/60 hover:bg-card-hover border border-white/5 text-text-secondary hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-text-muted">
            <SlidersHorizontal className="w-4 h-4 text-accent" />
            <span>
              {queryLower
                ? `${totalResults} Results for "${searchQuery}"`
                : 'Showing all music results'}
            </span>
          </div>
        </div>
      </div>

      {/* Zero Results / Gemini AI Fetch Option */}
      {queryLower && totalResults === 0 ? (
        <div className="space-y-6">
          <EmptyState type="search" />
          <div className="p-6 rounded-3xl bg-card/80 border border-accent/30 text-center space-y-4 max-w-lg mx-auto">
            <Sparkles className="w-8 h-8 text-accent mx-auto animate-pulse" />
            <h3 className="text-lg font-bold text-white">Can't find "{searchQuery}" in local database?</h3>
            <p className="text-xs text-text-muted">
              Use your active Gemini API key to fetch song metadata, spectrogram analysis, and real-time ML genre predictions!
            </p>
            <button
              onClick={() => navigateTo('gemini-ai')}
              className="px-5 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-accent/25 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Fetch "{searchQuery}" via Gemini AI</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* TRACKS SECTION */}
          {(searchFilter === 'all' || searchFilter === 'tracks') && filteredTracks.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center justify-between">
                <span>Tracks</span>
                <span className="text-xs font-medium text-text-muted">{filteredTracks.length} found</span>
              </h2>
              <div className="space-y-1">
                {filteredTracks.slice(0, searchFilter === 'all' ? 5 : 15).map((track, idx) => (
                  <TrackRow key={track.id} track={track} index={idx + 1} playlistContext={filteredTracks} />
                ))}
              </div>
            </section>
          )}

          {/* ARTISTS SECTION */}
          {(searchFilter === 'all' || searchFilter === 'artists') && filteredArtists.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center justify-between">
                <span>Artists</span>
                <span className="text-xs font-medium text-text-muted">{filteredArtists.length} found</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {filteredArtists.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    onClick={() => onSelectArtist?.(artist.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ALBUMS SECTION */}
          {(searchFilter === 'all' || searchFilter === 'albums') && filteredAlbums.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center justify-between">
                <span>Albums</span>
                <span className="text-xs font-medium text-text-muted">{filteredAlbums.length} found</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {filteredAlbums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onClick={() => onSelectAlbum?.(album.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* PLAYLISTS SECTION */}
          {(searchFilter === 'all' || searchFilter === 'playlists') && filteredPlaylists.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center justify-between">
                <span>Playlists</span>
                <span className="text-xs font-medium text-text-muted">{filteredPlaylists.length} found</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {filteredPlaylists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onClick={() => onSelectPlaylist?.(playlist.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchView;
