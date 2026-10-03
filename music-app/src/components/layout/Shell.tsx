import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import MusicPlayer from '../player/MusicPlayer';
import NowPlayingModal from '../player/NowPlayingModal';

import HomeView from '../views/HomeView';
import DiscoverView from '../views/DiscoverView';
import SearchView from '../views/SearchView';
import LibraryView from '../views/LibraryView';
import PlaylistDetailView from '../views/PlaylistDetailView';
import ArtistDetailView from '../views/ArtistDetailView';
import AlbumDetailView from '../views/AlbumDetailView';
import ClassifierView from '../views/ClassifierView';
import ModelsView from '../views/ModelsView';
import GeminiAssistantView from '../views/GeminiAssistantView';
import SettingsView from '../views/SettingsView';

import SkeletonLoader from '../common/SkeletonLoader';
import ErrorState from '../common/ErrorState';
import { usePlayer } from '../../context/PlayerContext';

const Shell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('pl-1');
  const [selectedArtistId, setSelectedArtistId] = useState<string>('art-1');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('alb-1');

  const {
    isSkeletonLoading,
    isErrorState,
    setIsErrorState
  } = usePlayer();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setActiveTab('search');
  };

  const handleSelectPlaylist = (id: string) => {
    setSelectedPlaylistId(id);
    setActiveTab('playlist-detail');
  };

  const handleSelectArtist = (id: string) => {
    setSelectedArtistId(id);
    setActiveTab('artist-detail');
  };

  const handleSelectAlbum = (id: string) => {
    setSelectedAlbumId(id);
    setActiveTab('album-detail');
  };

  // View Title mapping for Header
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'SONGNET Music Discovery';
      case 'gemini-ai':
        return 'SONGNET AI Music Intelligence Portal';
      case 'classifier':
        return 'SONGNET C-RNN Real-Time Audio Classifier';
      case 'models':
        return 'SONGNET Model Architecture & Benchmarks';
      case 'discover':
        return 'Explore FMA Genres & Sound Radar';
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
      case 'settings':
        return 'Settings & Preferences';
      default:
        return 'SONGNET';
    }
  };

  // Render current view content based on activeTab
  const renderViewContent = () => {
    if (isErrorState) {
      return (
        <ErrorState
          title="Audio Stream Interrupted"
          message="Failed to establish secure connection with local prototype state. Please refresh or reset error simulation."
          onRetry={() => setIsErrorState(false)}
        />
      );
    }

    if (isSkeletonLoading) {
      return (
        <div className="space-y-8 animate-pulse">
          <div className="h-48 rounded-3xl bg-white/5 w-full" />
          <div className="space-y-4">
            <div className="h-6 w-40 bg-white/10 rounded-md" />
            <SkeletonLoader count={5} type="track" />
          </div>
          <div className="space-y-4">
            <div className="h-6 w-40 bg-white/10 rounded-md" />
            <SkeletonLoader count={5} type="card" />
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            onSelectPlaylist={handleSelectPlaylist}
            onSelectArtist={handleSelectArtist}
            onSelectAlbum={handleSelectAlbum}
          />
        );
      case 'gemini-ai':
        return <GeminiAssistantView />;
      case 'classifier':
        return <ClassifierView />;
      case 'models':
        return <ModelsView />;
      case 'discover':
        return (
          <DiscoverView
            onSelectPlaylist={handleSelectPlaylist}
            onSelectArtist={handleSelectArtist}
            onSelectAlbum={handleSelectAlbum}
          />
        );
      case 'search':
        return (
          <SearchView
            initialQuery={searchQuery}
            onSelectPlaylist={handleSelectPlaylist}
            onSelectArtist={handleSelectArtist}
            onSelectAlbum={handleSelectAlbum}
          />
        );
      case 'library':
      case 'playlists':
      case 'albums':
      case 'artists':
      case 'liked':
        return (
          <LibraryView
            initialTab={
              ['playlists', 'albums', 'artists', 'liked'].includes(activeTab)
                ? activeTab
                : 'playlists'
            }
            onSelectPlaylist={handleSelectPlaylist}
            onSelectArtist={handleSelectArtist}
            onSelectAlbum={handleSelectAlbum}
          />
        );
      case 'playlist-detail':
        return <PlaylistDetailView playlistId={selectedPlaylistId} />;
      case 'artist-detail':
        return (
          <ArtistDetailView
            artistId={selectedArtistId}
            onSelectAlbum={handleSelectAlbum}
          />
        );
      case 'album-detail':
        return <AlbumDetailView albumId={selectedAlbumId} />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <HomeView
            onSelectPlaylist={handleSelectPlaylist}
            onSelectArtist={handleSelectArtist}
            onSelectAlbum={handleSelectAlbum}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans selection:bg-accent selection:text-white relative overflow-x-hidden">
      {/* Ambient background glow effects */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-1/4 right-10 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* App Main Shell Grid */}
      <div className="flex flex-1 relative z-10">
        {/* Desktop Sidebar Navigation */}
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />

        {/* Central Scrollable Content Area */}
        <main className="flex-1 flex flex-col min-w-0 pb-36 md:pb-28">
          {/* Header */}
          <Header
            activeTabTitle={getHeaderTitle()}
            onSearchSubmit={handleSearchSubmit}
          />

          {/* Main View Container */}
          <div className="flex-1 px-4 sm:px-6 md:px-8 py-6 max-w-7xl w-full mx-auto">
            {renderViewContent()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <MobileNav activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Music Player Bar (Fixed Bottom) */}
      <MusicPlayer />

      {/* Now Playing Fullscreen Modal */}
      <NowPlayingModal />
    </div>
  );
};

export default Shell;
