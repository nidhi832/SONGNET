import React from 'react';
import type { GenreMood } from '../../types/music';
import { usePlayer } from '../../context/PlayerContext';
import { Sparkles } from 'lucide-react';

interface GenreCardProps {
  genre: GenreMood;
}

export const GenreCard: React.FC<GenreCardProps> = ({ genre }) => {
  const { navigateTo, setSearchQuery } = usePlayer();

  const handleClick = () => {
    setSearchQuery(genre.title);
    navigateTo('search');
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative overflow-hidden rounded-2xl p-5 border border-white/10 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br ${genre.gradient}`}
    >
      <div className="relative z-10 flex flex-col justify-between h-28">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
            {genre.category}
          </span>
          <Sparkles className="w-4 h-4 text-white/70 group-hover:text-white group-hover:scale-125 transition-all" />
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight group-hover:translate-x-1 transition-transform">
            {genre.title}
          </h3>
          <p className="text-xs text-white/80 font-medium mt-0.5">
            {genre.trackCount} Curated Tracks
          </p>
        </div>
      </div>

      {/* Decorative backdrop shapes */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
    </div>
  );
};

export default GenreCard;
