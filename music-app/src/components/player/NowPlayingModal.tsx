import React, { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import {
  X, Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Repeat,
  Disc, AlignLeft, ListOrdered, Tv
} from 'lucide-react';
import TrackRow from '../common/TrackRow';

export const NowPlayingModal: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    playbackProgress,
    currentTime,
    isShuffle,
    isRepeat,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    toggleShuffle,
    toggleRepeat,
    likedTrackIds,
    toggleLikeTrack,
    isNowPlayingOpen,
    toggleNowPlayingModal,
    queue
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<'lyrics' | 'queue' | 'video'>('lyrics');

  if (!isNowPlayingOpen || !currentTrack) return null;

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

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-3xl flex flex-col justify-between p-6 md:p-10 animate-fade-in overflow-y-auto">
      {/* Background Dynamic Ambient Blur */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-25 blur-3xl pointer-events-none scale-125"
        style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Disc className="w-5 h-5 text-accent animate-spin-slow" />
          <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Now Playing
          </span>
        </div>

        <button
          onClick={() => toggleNowPlayingModal(false)}
          className="p-3 rounded-full bg-card hover:bg-card-hover border border-white/10 text-white transition-all hover:scale-105 active:scale-95"
          title="Close Modal"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-6xl mx-auto w-full">
        {/* LEFT COLUMN: Album Cover & Track Metadata */}
        <div className="lg:col-span-6 flex flex-col items-center text-center space-y-6">
          <div className="relative group w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl border border-white/15">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {currentTrack.title}
            </h2>
            <p className="text-lg text-accent font-medium">
              {currentTrack.artist} • <span className="text-text-secondary text-sm">{currentTrack.album}</span>
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Lyrics, Queue & Official Video Embed Tabs */}
        <div className="lg:col-span-6 flex flex-col h-full min-h-[380px] bg-card/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-6">
          {/* Tab Selection */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shrink-0 ${
                activeTab === 'lyrics'
                  ? 'bg-accent text-white shadow-lg'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <AlignLeft className="w-4 h-4" /> Synchronized Lyrics
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shrink-0 ${
                activeTab === 'queue'
                  ? 'bg-accent text-white shadow-lg'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <ListOrdered className="w-4 h-4" /> Next Up
            </button>
            {currentTrack.youtubeId && (
              <button
                onClick={() => setActiveTab('video')}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shrink-0 ${
                  activeTab === 'video'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Tv className="w-4 h-4" /> YouTube Video
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto max-h-[300px] scrollbar-thin pr-2">
            {activeTab === 'lyrics' ? (
              <div className="space-y-4 py-2 text-center">
                {currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
                  currentTrack.lyrics.map((line, idx) => (
                    <p
                      key={idx}
                      className={`text-base md:text-lg font-bold transition-all ${
                        idx === 1 ? 'text-accent scale-105' : 'text-text-muted hover:text-white'
                      }`}
                    >
                      {line}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-text-muted italic py-12">
                    Synchronized lyrics loading for {currentTrack.title}...
                  </p>
                )}
              </div>
            ) : activeTab === 'queue' ? (
              <div className="space-y-2">
                {queue.map((t, idx) => (
                  <TrackRow key={t.id} track={t} index={idx + 1} showAlbum={false} />
                ))}
              </div>
            ) : (
              <div className="w-full h-64 rounded-2xl overflow-hidden border border-white/10 bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1`}
                  title={currentTrack.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Floating Playback Controls Bar */}
      <div className="relative z-10 max-w-3xl mx-auto w-full space-y-4 bg-card/60 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
        {/* Progress Slider */}
        <div className="space-y-1">
          <div
            onClick={handleProgressClick}
            className="relative h-2 bg-white/10 hover:h-3 rounded-full cursor-pointer transition-all overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 bottom-0 bg-accent rounded-full"
              style={{ width: `${playbackProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-text-muted">
            <span>{formatTime(currentTime)}</span>
            <span>{currentTrack.duration}</span>
          </div>
        </div>

        {/* Central Controls */}
        <div className="flex items-center justify-between px-4">
          <button
            onClick={() => toggleLikeTrack(currentTrack.id)}
            className={`p-3 rounded-full transition-colors cursor-pointer ${
              isLiked ? 'text-accent bg-accent/15' : 'text-text-muted hover:text-white bg-white/5'
            }`}
            title={isLiked ? 'Remove from liked' : 'Save to liked'}
          >
            <Heart
              className="w-5 h-5 transition-transform active:scale-125"
              fill={isLiked ? '#ff3b5c' : 'none'}
              color={isLiked ? '#ff3b5c' : 'currentColor'}
            />
          </button>

          <div className="flex items-center gap-6">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition-colors ${
                isShuffle ? 'text-accent' : 'text-text-muted hover:text-white'
              }`}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button onClick={previousTrack} className="text-white hover:scale-110 transition-transform">
              <SkipBack className="w-7 h-7 fill-white" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-16 h-16 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center shadow-xl shadow-accent/40 hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-white" />
              ) : (
                <Play className="w-7 h-7 fill-white ml-0.5" />
              )}
            </button>

            <button onClick={nextTrack} className="text-white hover:scale-110 transition-transform">
              <SkipForward className="w-7 h-7 fill-white" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-full transition-colors ${
                isRepeat ? 'text-accent' : 'text-text-muted hover:text-white'
              }`}
            >
              <Repeat className="w-5 h-5" />
            </button>
          </div>

          <div className="w-10" />
        </div>
      </div>
    </div>
  );
};

export default NowPlayingModal;
