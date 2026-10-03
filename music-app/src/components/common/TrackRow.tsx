import React, { useState } from 'react';
import type { Track } from '../../types/music';
import { usePlayer } from '../../context/PlayerContext';
import { Play, Pause, Heart, MoreHorizontal, Share2, ListPlus } from 'lucide-react';

interface TrackRowProps {
  track: Track;
  index: number;
  showAlbum?: boolean;
  playlistContext?: Track[];
}

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  index,
  showAlbum = true,
  playlistContext
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlayPause, likedTrackIds, toggleLikeTrack, navigateTo } = usePlayer();
  const [showMenu, setShowMenu] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const isLiked = likedTrackIds.has(track.id);

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      playTrack(track, playlistContext);
    }
  };

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLikeTrack(track.id);
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group relative flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border border-transparent ${
        isCurrent
          ? 'bg-accent/10 border-accent/20 text-white'
          : 'hover:bg-card-hover hover:border-white/5 text-text-secondary hover:text-white'
      }`}
    >
      {/* Left: Index / Play Icon & Track Info */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
        {/* Track Index or Playing Indicator */}
        <div className="w-6 text-center text-xs font-semibold text-text-muted group-hover:text-white shrink-0">
          {isCurrent && isPlaying ? (
            <div className="flex items-end justify-center gap-0.5 h-3.5 w-3.5 mx-auto">
              <span className="w-1 bg-accent h-full animate-bounce" />
              <span className="w-1 bg-accent h-2/3 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1 bg-accent h-4/5 animate-bounce [animation-delay:0.4s]" />
            </div>
          ) : isCurrent ? (
            <Pause className="w-4 h-4 fill-accent text-accent mx-auto" />
          ) : (
            <>
              <span className="group-hover:hidden">{index}</span>
              <Play className="w-3.5 h-3.5 fill-white text-white mx-auto hidden group-hover:block ml-0.5" />
            </>
          )}
        </div>

        {/* Track Artwork */}
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-11 h-11 rounded-lg object-cover shadow-sm shrink-0 border border-white/5 group-hover:scale-105 transition-transform"
        />

        {/* Title & Artist */}
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold truncate ${
              isCurrent ? 'text-accent' : 'text-white group-hover:text-accent'
            } transition-colors`}
          >
            {track.title}
          </p>
          <p
            onClick={(e) => {
              e.stopPropagation();
              navigateTo('artist-detail');
            }}
            className="text-xs text-text-secondary hover:text-white truncate cursor-pointer transition-colors"
          >
            {track.artist}
          </p>
        </div>
      </div>

      {/* Middle: Album Name (Hidden on smaller screens) */}
      {showAlbum && (
        <div className="hidden md:block flex-1 max-w-xs px-4 truncate">
          <span
            onClick={(e) => {
              e.stopPropagation();
              navigateTo('album-detail');
            }}
            className="text-xs text-text-muted hover:text-white truncate cursor-pointer transition-colors"
          >
            {track.album}
          </span>
        </div>
      )}

      {/* Right: Duration & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Like Button */}
        <button
          onClick={handleLikeToggle}
          className={`p-1.5 rounded-full transition-all cursor-pointer ${
            isLiked
              ? 'text-accent opacity-100'
              : 'text-text-muted hover:text-white opacity-0 group-hover:opacity-100'
          }`}
          title={isLiked ? 'Remove from liked' : 'Save to liked'}
        >
          <Heart
            className="w-4 h-4 transition-transform active:scale-125"
            fill={isLiked ? '#ff3b5c' : 'none'}
            color={isLiked ? '#ff3b5c' : 'currentColor'}
          />
        </button>

        {/* Duration */}
        <span className="text-xs text-text-muted font-medium w-10 text-right">
          {track.duration}
        </span>

        {/* More Actions Menu Button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 text-text-muted hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            title="More Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Context Dropdown */}
          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1 w-44 bg-card border border-white/10 rounded-xl shadow-2xl z-50 py-1 text-xs text-text-primary backdrop-blur-xl animate-scale-in"
            >
              <button
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2"
              >
                <ListPlus className="w-3.5 h-3.5 text-text-secondary" />
                Add to Queue
              </button>
              <button
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5 text-text-secondary" />
                Share Track
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackRow;
