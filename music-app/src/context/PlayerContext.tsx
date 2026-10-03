import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Track, Artist, Album, Playlist, ActiveTab } from '../types/music';
import { MOCK_TRACKS, MOCK_PLAYLISTS, MOCK_ARTISTS, MOCK_ALBUMS } from '../data/mockData';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playbackProgress: number; // 0 to 100
  currentTime: number; // in seconds
  volume: number; // 0 to 1
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  queue: Track[];
  history: Track[];
  
  // Navigation & View States
  activeTab: ActiveTab;
  searchQuery: string;
  searchFilter: 'all' | 'tracks' | 'artists' | 'albums' | 'playlists';
  selectedPlaylist: Playlist | null;
  selectedArtist: Artist | null;
  selectedAlbum: Album | null;
  isNowPlayingOpen: boolean;
  isSidebarCollapsed: boolean;
  isLoading: boolean;
  isSkeletonLoading: boolean;
  isError: boolean;
  isErrorState: boolean;
  likedTrackIds: Set<string>;
  likedAlbumIds: Set<string>;

  // Actions
  playTrack: (track: Track, customQueue?: Track[]) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (percent: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLikeTrack: (trackId: string) => void;
  toggleLikeAlbum: (albumId: string) => void;
  isAlbumLiked: (albumId: string) => boolean;
  setSearchQuery: (query: string) => void;
  setSearchFilter: (filter: 'all' | 'tracks' | 'artists' | 'albums' | 'playlists') => void;
  navigateTo: (tab: ActiveTab, payload?: { playlist?: Playlist; artist?: Artist; album?: Album }) => void;
  toggleNowPlayingModal: (forceState?: boolean) => void;
  toggleSidebar: () => void;
  triggerSkeletonLoader: () => void;
  setIsSkeletonLoading: (loading: boolean) => void;
  triggerErrorState: (showError?: boolean) => void;
  setIsErrorState: (error: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(MOCK_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [queue, setQueue] = useState<Track[]>(MOCK_TRACKS);
  const [history, setHistory] = useState<Track[]>([]);

  // Navigation & View States
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'tracks' | 'artists' | 'albums' | 'playlists'>('all');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(MOCK_PLAYLISTS[0]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(MOCK_ARTISTS[0]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(MOCK_ALBUMS[0]);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(
    () => new Set(MOCK_TRACKS.filter(t => t.isLiked).map(t => t.id))
  );
  const [likedAlbumIds, setLikedAlbumIds] = useState<Set<string>>(new Set(['alb-1']));

  // Web Audio Context & Synthesizer Engine Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const noteStepRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [useSynthFallback, setUseSynthFallback] = useState<boolean>(false);
  const realAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !realAudioRef.current) {
      const el = document.createElement('audio');
      realAudioRef.current = el;
    }
  }, []);

  // Helper: Get unique pitch transposition offset per track ID
  const getTrackPitchOffset = (trackId?: string) => {
    if (!trackId) return 1.0;
    let hash = 0;
    for (let i = 0; i < trackId.length; i++) {
      hash = (hash << 5) - hash + trackId.charCodeAt(i);
      hash |= 0;
    }
    const offsets = [0.84, 0.94, 1.0, 1.12, 1.25, 1.33, 1.5];
    return offsets[Math.abs(hash) % offsets.length];
  };

  // Initialize Web Audio Context
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        const ctx = new AudioCtxClass();
        const masterGain = ctx.createGain();
        masterGain.gain.value = isMuted ? 0 : volume * 0.18;
        masterGain.connect(ctx.destination);

        audioCtxRef.current = ctx;
        masterGainRef.current = masterGain;
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Advanced Multi-Genre & Track-Unique Web Audio Synthesizer
  const triggerGenreSynthMelody = (track: Track) => {
    const ctx = getAudioContext();
    if (!ctx || !masterGainRef.current) return;

    const genre = track.genre;
    const pitchFactor = getTrackPitchOffset(track.id);
    const step = noteStepRef.current;
    noteStepRef.current += 1;

    const now = ctx.currentTime;

    try {
      if (genre === 'Hip-Hop') {
        // Hip-Hop: Heavy 808 Sub-bass kick (60Hz -> 30Hz) + hi-hat noise
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(65 * pitchFactor, now);
        kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.25);
        kickGain.gain.setValueAtTime(1, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        kickOsc.connect(kickGain);
        kickGain.connect(masterGainRef.current);
        kickOsc.start(now);
        kickOsc.stop(now + 0.38);

        // Off-beat Synth Melody Note
        if (step % 2 === 0) {
          const hipHopMelody = [261.63, 311.13, 349.23, 392.00, 466.16]; // Minor Pentatonic C4, Eb4, F4, G4, Bb4
          const noteFreq = hipHopMelody[step % hipHopMelody.length] * pitchFactor;

          const melOsc = ctx.createOscillator();
          const melGain = ctx.createGain();
          melOsc.type = 'triangle';
          melOsc.frequency.setValueAtTime(noteFreq, now + 0.1);
          melGain.gain.setValueAtTime(0, now + 0.1);
          melGain.gain.linearRampToValueAtTime(0.4, now + 0.15);
          melGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

          melOsc.connect(melGain);
          melGain.connect(masterGainRef.current);
          melOsc.start(now + 0.1);
          melOsc.stop(now + 0.45);
        }
      } else if (genre === 'Folk') {
        // Folk: Plucked Acoustic Guitar Dual-Chord (G Major Pentatonic)
        const folkScales = [196.00, 220.00, 246.94, 293.66, 329.63, 392.00, 440.00]; // G3, A3, B3, D4, E4, G4, A4
        const f1 = folkScales[step % folkScales.length] * pitchFactor;
        const f2 = folkScales[(step + 2) % folkScales.length] * pitchFactor;

        [f1, f2].forEach((freq, idx) => {
          const stringOsc = ctx.createOscillator();
          const stringGain = ctx.createGain();
          stringOsc.type = 'sine';
          stringOsc.frequency.setValueAtTime(freq, now + idx * 0.04);

          stringGain.gain.setValueAtTime(0.6, now + idx * 0.04);
          stringGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.5);

          stringOsc.connect(stringGain);
          stringGain.connect(masterGainRef.current!);
          stringOsc.start(now + idx * 0.04);
          stringOsc.stop(now + idx * 0.04 + 0.55);
        });
      } else if (genre === 'Experimental') {
        // Experimental: Frequency Modulated Glitch Synth
        const baseFreq = (300 + (step * 85) % 600) * pitchFactor;
        const expOsc = ctx.createOscillator();
        const expGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        expOsc.type = 'sawtooth';
        expOsc.frequency.setValueAtTime(baseFreq, now);
        expOsc.frequency.linearRampToValueAtTime(baseFreq * 1.5, now + 0.2);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800 + Math.sin(step) * 400, now);

        expGain.gain.setValueAtTime(0.5, now);
        expGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        expOsc.connect(filter);
        filter.connect(expGain);
        expGain.connect(masterGainRef.current);
        expOsc.start(now);
        expOsc.stop(now + 0.32);
      } else if (genre === 'Instrumental') {
        // Instrumental: Lush Orchestral String Triad Chords
        const chordTriad = [261.63, 329.63, 392.00, 523.25]; // C Major Triad
        const chordOffset = (step % 3) * 2;
        const c1 = chordTriad[(0 + chordOffset) % chordTriad.length] * pitchFactor;
        const c2 = chordTriad[(1 + chordOffset) % chordTriad.length] * pitchFactor;

        [c1, c2].forEach(freq => {
          const stringOsc = ctx.createOscillator();
          const stringGain = ctx.createGain();
          stringOsc.type = 'triangle';
          stringOsc.frequency.setValueAtTime(freq, now);

          stringGain.gain.setValueAtTime(0, now);
          stringGain.gain.linearRampToValueAtTime(0.3, now + 0.15);
          stringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

          stringOsc.connect(stringGain);
          stringGain.connect(masterGainRef.current!);
          stringOsc.start(now);
          stringOsc.stop(now + 0.65);
        });
      } else {
        // Electronic / Default: Fast Bright Synth Arpeggio (C Minor)
        const synthScale = [130.81, 155.56, 174.61, 196.00, 233.08, 261.63, 311.13, 392.00];
        const noteFreq = synthScale[step % synthScale.length] * pitchFactor;

        const synthOsc = ctx.createOscillator();
        const synthGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        synthOsc.type = 'sawtooth';
        synthOsc.frequency.setValueAtTime(noteFreq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.25);

        synthGain.gain.setValueAtTime(0.6, now);
        synthGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        synthOsc.connect(filter);
        filter.connect(synthGain);
        synthGain.connect(masterGainRef.current);
        synthOsc.start(now);
        synthOsc.stop(now + 0.3);
      }
    } catch (e) {
      console.log('Synth engine note error:', e);
    }
  };

  // Synchronize Master Gain Volume and Mute
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        isMuted ? 0 : volume * 0.18,
        audioCtxRef.current.currentTime
      );
    }
  }, [volume, isMuted]);

  // Real HTML5 Audio Element playback synchronization
  useEffect(() => {
    const audioEl = realAudioRef.current;
    if (!audioEl || !currentTrack) return;

    if (currentTrack.audioUrl && !useSynthFallback) {
      if (audioEl.src !== currentTrack.audioUrl) {
        audioEl.src = currentTrack.audioUrl;
        audioEl.load();
      }
      audioEl.volume = isMuted ? 0 : volume;

      if (isPlaying) {
        audioEl.play().catch(err => {
          console.warn('Real HTML audio play failed/blocked. Falling back to Web Audio synth:', err);
          setUseSynthFallback(true);
        });
      } else {
        audioEl.pause();
      }
    } else if (audioEl && !isPlaying) {
      audioEl.pause();
    }
  }, [currentTrack, isPlaying, volume, isMuted, useSynthFallback]);

  useEffect(() => {
    const audioEl = realAudioRef.current;
    if (!audioEl) return;

    const handleTimeUpdate = () => {
      if (!useSynthFallback && audioEl.duration && !isNaN(audioEl.duration) && audioEl.duration > 0) {
        setCurrentTime(audioEl.currentTime);
        setPlaybackProgress((audioEl.currentTime / audioEl.duration) * 100);
      }
    };

    const handleEnded = () => {
      if (isRepeat) {
        audioEl.currentTime = 0;
        audioEl.play().catch(() => {
          setUseSynthFallback(true);
        });
      } else {
        nextTrack();
      }
    };

    const handleError = () => {
      console.warn('Real audio element playback error. Activating Web Audio synth fallback.');
      setUseSynthFallback(true);
    };

    audioEl.addEventListener('timeupdate', handleTimeUpdate);
    audioEl.addEventListener('ended', handleEnded);
    audioEl.addEventListener('error', handleError);

    return () => {
      audioEl.removeEventListener('timeupdate', handleTimeUpdate);
      audioEl.removeEventListener('ended', handleEnded);
      audioEl.removeEventListener('error', handleError);
    };
  }, [isRepeat, useSynthFallback]);

  // Audio Playback & Rhythmic Note Scheduler Loop (fallback for synth mode)
  useEffect(() => {
    const isSynthMode = isPlaying && currentTrack && (!currentTrack.audioUrl || useSynthFallback);

    if (isSynthMode && currentTrack) {
      getAudioContext();

      // Trigger initial note immediately on play
      triggerGenreSynthMelody(currentTrack);

      const tempoInterval =
        currentTrack.genre === 'Folk'
          ? 420
          : currentTrack.genre === 'Hip-Hop'
          ? 320
          : currentTrack.genre === 'Instrumental'
          ? 550
          : 250;

      timerRef.current = setInterval(() => {
        triggerGenreSynthMelody(currentTrack);

        setCurrentTime(prev => {
          const nextTime = prev + 1;
          const total = currentTrack.durationSeconds || 220;
          if (nextTime >= total) {
            if (isRepeat) {
              return 0;
            } else {
              nextTrack();
              return 0;
            }
          }
          setPlaybackProgress((nextTime / total) * 100);
          return nextTime;
        });
      }, tempoInterval);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, currentTrack, isRepeat, useSynthFallback]);

  const playTrack = (track: Track, customQueue?: Track[]) => {
    getAudioContext();
    setUseSynthFallback(false);

    setCurrentTrack(track);
    setIsPlaying(true);
    setCurrentTime(0);
    setPlaybackProgress(0);
    noteStepRef.current = 0;

    if (customQueue && customQueue.length > 0) {
      setQueue(customQueue);
    }
    setHistory(prev => [track, ...prev.filter(t => t.id !== track.id)]);
  };

  const togglePlayPause = () => {
    if (!currentTrack) return;
    getAudioContext();
    setIsPlaying(prev => !prev);
  };

  const nextTrack = () => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    let nextIndex = (currentIndex + 1) % queue.length;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    }
    playTrack(queue[nextIndex]);
  };

  const previousTrack = () => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    playTrack(queue[prevIndex]);
  };

  const seekTo = (percent: number) => {
    const audioEl = realAudioRef.current;
    if (audioEl && audioEl.duration && !isNaN(audioEl.duration)) {
      const target = (percent / 100) * audioEl.duration;
      audioEl.currentTime = target;
      setCurrentTime(target);
      setPlaybackProgress(percent);
    } else if (currentTrack?.durationSeconds) {
      const target = (percent / 100) * currentTrack.durationSeconds;
      setCurrentTime(target);
      setPlaybackProgress(percent);
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (vol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const toggleRepeat = () => {
    setIsRepeat(prev => !prev);
  };

  const toggleLikeTrack = (trackId: string) => {
    setLikedTrackIds(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  };

  const toggleLikeAlbum = (albumId: string) => {
    setLikedAlbumIds(prev => {
      const next = new Set(prev);
      if (next.has(albumId)) {
        next.delete(albumId);
      } else {
        next.add(albumId);
      }
      return next;
    });
  };

  const isAlbumLiked = (albumId: string) => {
    return likedAlbumIds.has(albumId);
  };

  const navigateTo = (tab: ActiveTab, payload?: { playlist?: Playlist; artist?: Artist; album?: Album }) => {
    setActiveTab(tab);
    if (payload?.playlist) setSelectedPlaylist(payload.playlist);
    if (payload?.artist) setSelectedArtist(payload.artist);
    if (payload?.album) setSelectedAlbum(payload.album);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleNowPlayingModal = (forceState?: boolean) => {
    setIsNowPlayingOpen(prev => (typeof forceState === 'boolean' ? forceState : !prev));
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const triggerSkeletonLoader = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  };

  const triggerErrorState = (showError = true) => {
    setIsError(showError);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playbackProgress,
        currentTime,
        volume: isMuted ? 0 : volume,
        isMuted,
        isShuffle,
        isRepeat,
        queue,
        history,
        activeTab,
        searchQuery,
        searchFilter,
        selectedPlaylist,
        selectedArtist,
        selectedAlbum,
        isNowPlayingOpen,
        isSidebarCollapsed,
        isLoading,
        isSkeletonLoading: isLoading,
        isError,
        isErrorState: isError,
        likedTrackIds,
        likedAlbumIds,

        playTrack,
        togglePlayPause,
        nextTrack,
        previousTrack,
        seekTo,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        toggleLikeTrack,
        toggleLikeAlbum,
        isAlbumLiked,
        setSearchQuery,
        setSearchFilter,
        navigateTo,
        toggleNowPlayingModal,
        toggleSidebar,
        triggerSkeletonLoader,
        setIsSkeletonLoading: setIsLoading,
        triggerErrorState,
        setIsErrorState: setIsError
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
