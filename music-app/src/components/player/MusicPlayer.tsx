import React, { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, Heart, Maximize2, ListMusic, ExternalLink, Tv
} from 'lucide-react';

export const MusicPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    playbackProgress,
    currentTime,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    likedTrackIds,
    toggleLikeTrack,
    toggleNowPlayingModal,
    navigateTo
  } = usePlayer();

  const [isHoveredProgress, setIsHoveredProgress] = useState<boolean>(false);
  const [hoverSeekPercent, setHoverSeekPercent] = useState<number>(0);

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.has(currentTrack.id);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(Math.max((clickX / rect.width) * 100, 0), 100);
    seekTo(percent);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const percent = Math.min(Math.max((mouseX / rect.width) * 100, 0), 100);
    setHoverSeekPercent(percent);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 border-t border-white/10 backdrop-blur-2xl px-4 py-3 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* LEFT: Currently Playing Track Info */}
        <div className="flex items-center gap-3 w-1/4 min-w-0">
          <div
            onClick={() => toggleNowPlayingModal(true)}
            className="relative group cursor-pointer shrink-0"
          >
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-md group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h4
              onClick={() => toggleNowPlayingModal(true)}
              className="text-sm font-bold text-white truncate cursor-pointer hover:text-accent transition-colors flex items-center gap-1.5"
            >
              {currentTrack.title}
            </h4>
            <p
              onClick={() => navigateTo('artist-detail')}
              className="text-xs text-text-secondary truncate cursor-pointer hover:text-white transition-colors"
            >
              {currentTrack.artist}
            </p>
          </div>

          <button
            onClick={() => toggleLikeTrack(currentTrack.id)}
            className={`p-1.5 rounded-full transition-colors shrink-0 cursor-pointer ${
              isLiked ? 'text-accent' : 'text-text-muted hover:text-white'
            }`}
            title={isLiked ? 'Remove from liked' : 'Save to liked'}
          >
            <Heart
              className="w-4 h-4 transition-transform active:scale-125"
              fill={isLiked ? '#ff3b5c' : 'none'}
              color={isLiked ? '#ff3b5c' : 'currentColor'}
            />
          </button>
        </div>

        {/* CENTER: Playback Controls & Progress Bar */}
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-xl">
          {/* Main Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-full transition-colors ${
                isShuffle ? 'text-accent' : 'text-text-muted hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={previousTrack}
              className="p-1.5 text-text-secondary hover:text-white transition-colors"
              title="Previous"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-10 h-10 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center shadow-lg shadow-accent/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-1.5 text-text-secondary hover:text-white transition-colors"
              title="Next"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-full transition-colors ${
                isRepeat ? 'text-accent' : 'text-text-muted hover:text-white'
              }`}
              title="Repeat"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar & Timers */}
          <div className="w-full flex items-center gap-3 text-xs font-mono text-text-muted">
            <span className="w-9 text-right">{formatTime(currentTime)}</span>

            <div
              onClick={handleProgressClick}
              onMouseEnter={() => setIsHoveredProgress(true)}
              onMouseLeave={() => setIsHoveredProgress(false)}
              onMouseMove={handleProgressMouseMove}
              className="relative flex-1 h-2 bg-white/10 hover:h-2.5 rounded-full cursor-pointer transition-all overflow-hidden group"
            >
              {/* Played Fill Bar */}
              <div
                className="absolute top-0 left-0 bottom-0 bg-accent rounded-full transition-all"
                style={{ width: `${playbackProgress}%` }}
              />

              {/* Hover Seek Position Indicator */}
              {isHoveredProgress && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none"
                  style={{ left: `${hoverSeekPercent}%` }}
                />
              )}
            </div>

            <span className="w-9 text-left">{currentTrack.duration}</span>
          </div>
        </div>

        {/* RIGHT: Volume & YouTube Stream Link */}
        <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
          {currentTrack.youtubeUrl && (
            <a
              href={currentTrack.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Stream Official Video / Audio on YouTube"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <button
            onClick={() => navigateTo('library')}
            className="p-2 text-text-muted hover:text-white transition-colors"
            title="Queue / Library"
          >
            <ListMusic className="w-5 h-5" />
          </button>

          {/* Volume Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-text-muted hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-accent" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1.5 bg-white/10 accent-accent rounded-lg cursor-pointer"
            />
          </div>

          <button
            onClick={() => toggleNowPlayingModal(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors ml-1"
            title="Full Screen Player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
