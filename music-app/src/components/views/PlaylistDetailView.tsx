import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import TrackRow from '../common/TrackRow';
import EmptyState from '../common/EmptyState';
import { Play, Shuffle, Heart, Share2, Clock } from 'lucide-react';
import { MOCK_PLAYLISTS } from '../../data/mockData';

interface PlaylistDetailViewProps {
  playlistId?: string;
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({ playlistId }) => {
  const { selectedPlaylist, playTrack, toggleShuffle } = usePlayer();

  const playlist = (playlistId ? MOCK_PLAYLISTS.find(p => p.id === playlistId) : null) || selectedPlaylist || MOCK_PLAYLISTS[0];

  if (!playlist) {
    return <EmptyState type="playlist" />;
  }

  const handlePlayAll = () => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Playlist Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-card/80 via-card/40 to-card/20 p-6 sm:p-10 border border-white/10 flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8 backdrop-blur-xl">
        {/* Background Ambient Glow */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 blur-3xl pointer-events-none scale-125"
          style={{ backgroundImage: `url(${playlist.coverUrl})` }}
        />

        {/* Playlist Cover */}
        <div className="relative z-10 shrink-0 group">
          <img
            src={playlist.coverUrl}
            alt={playlist.title}
            className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl object-cover shadow-2xl border border-white/10 group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Playlist Info */}
        <div className="relative z-10 flex-1 text-center md:text-left space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
            Public Playlist
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {playlist.title}
          </h1>
          <p className="text-sm text-text-secondary max-w-xl">
            {playlist.description}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-text-muted pt-1">
            <span className="text-white font-medium">Created by {playlist.creator}</span>
            <span>•</span>
            <span>{playlist.trackCount} Tracks</span>
            <span>•</span>
            <span>{playlist.totalDuration}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center md:justify-start gap-3 pt-4">
            <button
              onClick={handlePlayAll}
              className="px-6 py-3 rounded-full bg-accent hover:bg-accent-hover text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-accent/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white ml-0.5" /> Play All
            </button>
            <button
              onClick={toggleShuffle}
              className="px-5 py-3 rounded-full bg-card hover:bg-card-hover border border-white/10 text-white font-medium text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
            >
              <Shuffle className="w-4 h-4 text-text-secondary" /> Shuffle
            </button>
            <button
              className="p-3 rounded-full bg-card hover:bg-card-hover border border-white/10 text-text-secondary hover:text-white transition-all"
              title="Save to Library"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              className="p-3 rounded-full bg-card hover:bg-card-hover border border-white/10 text-text-secondary hover:text-white transition-all"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider px-4">
          <div className="flex items-center gap-4">
            <span className="w-6 text-center">#</span>
            <span>Title</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:inline">Album</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        <div className="space-y-1">
          {playlist.tracks && playlist.tracks.length > 0 ? (
            playlist.tracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx + 1}
                playlistContext={playlist.tracks}
              />
            ))
          ) : (
            <div className="text-center py-12 text-text-muted text-sm">
              No tracks in this playlist yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetailView;
