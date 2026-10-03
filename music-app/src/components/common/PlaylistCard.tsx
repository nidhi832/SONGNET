import React from 'react';
import type { Playlist } from '../../types/music';
import { usePlayer } from '../../context/PlayerContext';
import { Play } from 'lucide-react';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick?: () => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  const { playTrack, navigateTo } = usePlayer();

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.tracks && playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigateTo('playlist-detail', { playlist });
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col p-3 rounded-2xl bg-card/60 hover:bg-card border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1"
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-card/80">
        <img
          src={playlist.coverUrl}
          alt={playlist.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={handlePlayClick}
            className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/40 hover:scale-110 active:scale-95 transition-transform duration-200"
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="font-bold text-sm text-white truncate group-hover:text-accent transition-colors">
          {playlist.title}
        </h4>
        <p className="text-xs text-text-secondary line-clamp-2">
          {playlist.description || `By ${playlist.creator}`}
        </p>
      </div>
    </div>
  );
};

export default PlaylistCard;
