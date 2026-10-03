import React from 'react';
import type { Artist } from '../../types/music';
import { usePlayer } from '../../context/PlayerContext';

interface ArtistCardProps {
  artist: Artist;
  onClick?: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onClick }) => {
  const { navigateTo } = usePlayer();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigateTo('artist-detail', { artist });
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col items-center p-4 rounded-2xl bg-card/60 hover:bg-card border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 text-center"
    >
      <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-3 bg-card/80 border border-white/10 shadow-md group-hover:border-accent/40 transition-colors">
        <img
          src={artist.avatarUrl}
          alt={artist.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <h4 className="font-bold text-sm text-white truncate max-w-full group-hover:text-accent transition-colors">
        {artist.name}
      </h4>
      <p className="text-xs text-text-secondary capitalize truncate max-w-full">
        {artist.genre} • {artist.followers} followers
      </p>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick();
        }}
        className="mt-3 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/5 hover:bg-accent hover:text-white border border-white/10 transition-all"
      >
        Follow
      </button>
    </div>
  );
};

export default ArtistCard;
