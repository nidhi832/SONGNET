import React from 'react';
import { SearchX, Music, Heart, Disc } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

interface EmptyStateProps {
  type: 'search' | 'playlist' | 'library' | 'liked';
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  message,
  actionText,
  onAction
}) => {
  const { navigateTo } = usePlayer();

  const defaults = {
    search: {
      icon: SearchX,
      title: 'No search results found',
      message: 'We couldn’t find any tracks, artists, or albums matching your query. Try another term or browse genres.',
      actionText: 'Explore Discover Mode',
      action: () => navigateTo('discover')
    },
    playlist: {
      icon: Music,
      title: 'Empty Playlist',
      message: 'This playlist has no tracks added yet. Start searching to build your mix.',
      actionText: 'Search Tracks',
      action: () => navigateTo('search')
    },
    library: {
      icon: Disc,
      title: 'Your library is empty',
      message: 'Save tracks, albums, and artists to build your personalized music collection.',
      actionText: 'Discover Music',
      action: () => navigateTo('discover')
    },
    liked: {
      icon: Heart,
      title: 'No liked tracks yet',
      message: 'Tap the heart icon on any track to save your favorites here.',
      actionText: 'Find Tracks',
      action: () => navigateTo('home')
    }
  };

  const config = defaults[type];
  const Icon = config.icon;

  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const displayActionText = actionText || config.actionText;
  const handleAction = onAction || config.action;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-card/40 border border-white/10 backdrop-blur-xl my-8 space-y-4 max-w-md mx-auto animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shadow-lg shadow-accent/20">
        <Icon className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white tracking-tight">{displayTitle}</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{displayMessage}</p>
      </div>

      <button
        onClick={handleAction}
        className="mt-2 px-6 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white font-semibold text-xs shadow-lg hover:shadow-accent/25 hover:scale-105 active:scale-95 transition-all"
      >
        {displayActionText}
      </button>
    </div>
  );
};

export default EmptyState;
