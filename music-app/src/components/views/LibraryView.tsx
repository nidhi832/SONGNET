import React, { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { MOCK_PLAYLISTS, MOCK_ALBUMS, MOCK_ARTISTS, MOCK_TRACKS } from '../../data/mockData';
import PlaylistCard from '../common/PlaylistCard';
import AlbumCard from '../common/AlbumCard';
import ArtistCard from '../common/ArtistCard';
import TrackRow from '../common/TrackRow';
import EmptyState from '../common/EmptyState';
import { Library, Music, Disc, Users, Heart, ArrowUpDown, Plus } from 'lucide-react';

interface LibraryViewProps {
  initialTab?: string;
  onSelectPlaylist?: (id: string) => void;
  onSelectArtist?: (id: string) => void;
  onSelectAlbum?: (id: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  initialTab = 'playlists',
  onSelectPlaylist,
  onSelectArtist,
  onSelectAlbum
}) => {
  const { likedTrackIds } = usePlayer();
  const [subTab, setSubTab] = useState<'playlists' | 'albums' | 'artists' | 'liked'>(
    (['playlists', 'albums', 'artists', 'liked'].includes(initialTab)
      ? initialTab
      : 'playlists') as any
  );
  const [sortOption, setSortOption] = useState<'added' | 'played' | 'alpha'>('added');

  const likedTracks = MOCK_TRACKS.filter(t => likedTrackIds.has(t.id));

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Hero Library Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-card/80 via-card/40 to-card/20 p-8 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
            <Library className="w-3.5 h-3.5" />
            <span>Personal Collection</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Your Music Library
          </h1>
          <p className="text-sm text-text-secondary max-w-lg">
            Manage your saved playlists, followed artists, saved albums, and favorited tracks.
          </p>
        </div>

        <button className="px-5 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-accent/25 hover:scale-105 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> Create Playlist
        </button>
      </div>

      {/* Navigation Sub-Tabs & Sorting Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 'playlists', label: 'Playlists', icon: Music, count: MOCK_PLAYLISTS.length },
            { id: 'albums', label: 'Albums', icon: Disc, count: MOCK_ALBUMS.length },
            { id: 'artists', label: 'Artists', icon: Users, count: MOCK_ARTISTS.length },
            { id: 'liked', label: 'Liked Tracks', icon: Heart, count: likedTracks.length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-accent text-white shadow-lg'
                    : 'bg-card/60 hover:bg-card-hover border border-white/5 text-text-secondary hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-text-muted'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort Filter Selector */}
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span className="font-semibold text-text-muted">Sort by:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="bg-card border border-white/10 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:border-accent"
          >
            <option value="added">Recently Added</option>
            <option value="played">Recently Played</option>
            <option value="alpha">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Main Tab Views */}
      <div>
        {subTab === 'playlists' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {MOCK_PLAYLISTS.map(playlist => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onClick={() => onSelectPlaylist?.(playlist.id)}
              />
            ))}
          </div>
        )}

        {subTab === 'albums' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {MOCK_ALBUMS.map(album => (
              <AlbumCard
                key={album.id}
                album={album}
                onClick={() => onSelectAlbum?.(album.id)}
              />
            ))}
          </div>
        )}

        {subTab === 'artists' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {MOCK_ARTISTS.map(artist => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                onClick={() => onSelectArtist?.(artist.id)}
              />
            ))}
          </div>
        )}

        {subTab === 'liked' && (
          likedTracks.length > 0 ? (
            <div className="space-y-1">
              {likedTracks.map((track, idx) => (
                <TrackRow key={track.id} track={track} index={idx + 1} playlistContext={likedTracks} />
              ))}
            </div>
          ) : (
            <EmptyState type="liked" />
          )
        )}
      </div>
    </div>
  );
};

export default LibraryView;
