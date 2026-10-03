import React from 'react';
import { Play, Shuffle, Heart, Disc, Calendar, Clock, Share2, MoreHorizontal } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import TrackRow from '../common/TrackRow';
import { MOCK_ALBUMS, MOCK_TRACKS } from '../../data/mockData';

interface AlbumDetailViewProps {
  albumId?: string;
}

export const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({ albumId = 'alb-1' }) => {
  const { playTrack, toggleLikeAlbum, isAlbumLiked } = usePlayer();

  const album = MOCK_ALBUMS.find(a => a.id === albumId) || MOCK_ALBUMS[0];
  const albumTracks = MOCK_TRACKS.filter(t => t.albumId === album.id || t.album === album.title);

  // Fallback tracks if less than 4 found
  const displayTracks = albumTracks.length >= 3 ? albumTracks : MOCK_TRACKS.slice(0, 8);

  const handlePlayAlbum = () => {
    if (displayTracks.length > 0) {
      playTrack(displayTracks[0], displayTracks);
    }
  };

  const handleShuffleAlbum = () => {
    if (displayTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * displayTracks.length);
      playTrack(displayTracks[randomIndex], displayTracks);
    }
  };

  const liked = isAlbumLiked(album.id);

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-card/80 via-card/40 to-card/20 p-6 md:p-8 border border-white/10 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10">
          {/* Artwork */}
          <div className="relative group shrink-0">
            <img
              src={album.coverUrl}
              alt={album.title}
              className="w-48 h-48 md:w-56 md:h-56 rounded-2xl object-cover shadow-2xl border border-white/10 group-hover:scale-[1.02] transition-transform duration-300"
            />
            <div className="absolute inset-0 rounded-2xl bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={handlePlayAlbum}
                className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
              >
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold uppercase tracking-wider">
              <Disc className="w-3.5 h-3.5" /> Album Release
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              {album.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-sm text-text-secondary">
              <span className="font-semibold text-white hover:text-accent cursor-pointer transition-colors">
                {album.artist}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {album.releaseYear}
              </span>
              <span>•</span>
              <span className="capitalize">{album.genre}</span>
              <span>•</span>
              <span>{displayTracks.length} tracks</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center md:justify-start gap-3 pt-4">
              <button
                onClick={handlePlayAlbum}
                className="px-6 py-3 rounded-full bg-accent hover:bg-accent-hover text-white font-semibold text-sm flex items-center gap-2 shadow-lg hover:shadow-accent/25 hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-white" /> Play Album
              </button>

              <button
                onClick={handleShuffleAlbum}
                className="px-5 py-3 rounded-full bg-card hover:bg-card-hover border border-white/10 text-white font-medium text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              >
                <Shuffle className="w-4 h-4 text-text-secondary" /> Shuffle
              </button>

              <button
                onClick={() => toggleLikeAlbum(album.id)}
                className={`p-3 rounded-full border border-white/10 transition-all ${
                  liked
                    ? 'bg-accent/20 text-accent border-accent/40'
                    : 'bg-card hover:bg-card-hover text-text-secondary hover:text-white'
                }`}
                title={liked ? 'Remove from library' : 'Save to library'}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-accent' : ''}`} />
              </button>

              <button
                className="p-3 rounded-full bg-card hover:bg-card-hover border border-white/10 text-text-secondary hover:text-white transition-all"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                className="p-3 rounded-full bg-card hover:bg-card-hover border border-white/10 text-text-secondary hover:text-white transition-all"
                title="More Options"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Track List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider px-4">
          <div className="flex items-center gap-4">
            <span className="w-6 text-center">#</span>
            <span>Title</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:inline">Plays</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        <div className="space-y-1">
          {displayTracks.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx + 1}
              playlistContext={displayTracks}
            />
          ))}
        </div>
      </div>

      {/* Album Info Footer */}
      <div className="p-6 rounded-2xl bg-card/40 border border-white/5 space-y-2 text-xs text-text-muted">
        <p>Released: {album.releaseYear} • All rights reserved</p>
        <p>© 2026 {album.artist} under exclusive license to AURA Music</p>
      </div>
    </div>
  );
};

export default AlbumDetailView;
