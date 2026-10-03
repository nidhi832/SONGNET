import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { Search } from 'lucide-react';

interface HeaderProps {
  activeTabTitle?: string;
  onSearchSubmit?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTabTitle, onSearchSubmit }) => {
  const {
    activeTab,
    searchQuery,
    setSearchQuery,
    navigateTo
  } = usePlayer();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard shortcut listener for Search (Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onSearchSubmit) {
        onSearchSubmit(searchQuery);
      } else {
        navigateTo('search');
      }
    }
  };

  const getTitle = () => {
    if (activeTabTitle) return activeTabTitle;
    switch (activeTab) {
      case 'home':
        return 'Home';
      case 'discover':
        return 'Discover Music';
      case 'search':
        return searchQuery ? `Search results for "${searchQuery}"` : 'Search';
      case 'library':
      case 'playlists':
      case 'albums':
      case 'artists':
      case 'liked':
        return 'Your Collection';
      case 'playlist-detail':
        return 'Playlist Overview';
      case 'artist-detail':
        return 'Artist Profile';
      case 'album-detail':
        return 'Album Record';
      default:
        return 'SONGNET';
    }
  };

  return (
    <header className="sticky top-0 z-20 w-full px-4 sm:px-6 md:px-8 py-4 bg-background/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between gap-4">
      {/* Left: Page Title Context */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
          {getTitle()}
        </h1>
      </div>

      {/* Center: Search Field */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search tracks, artists, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-10 pr-12 py-2 rounded-full bg-card/80 border border-white/10 text-white placeholder-text-muted text-xs font-medium focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-text-muted pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>
    </header>
  );
};

export default Header;
