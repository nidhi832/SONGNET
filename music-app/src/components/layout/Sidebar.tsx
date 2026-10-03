import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import type { ActiveTab } from '../../types/music';
import {
  Home, Compass, Search, Library, Music, Disc, Users, Heart,
  Settings, Radio, Sparkles, ChevronLeft, ChevronRight,
  Cpu, Layers
} from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab: propActiveTab, setActiveTab }) => {
  const {
    activeTab: contextActiveTab,
    navigateTo,
    isSidebarCollapsed,
    toggleSidebar
  } = usePlayer();

  const currentTab = propActiveTab || contextActiveTab;

  const handleNavClick = (id: ActiveTab) => {
    if (setActiveTab) {
      setActiveTab(id);
    } else {
      navigateTo(id);
    }
  };

  const primaryNavItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library }
  ];

  const mlNavItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'gemini-ai', label: 'SongNet Portal', icon: Sparkles },
    { id: 'classifier', label: 'SongNet Classifier', icon: Cpu },
    { id: 'models', label: 'Model Benchmarks', icon: Layers }
  ];

  const musicNavItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'playlists', label: 'Playlists', icon: Music },
    { id: 'albums', label: 'Albums', icon: Disc },
    { id: 'artists', label: 'Artists', icon: Users },
    { id: 'liked', label: 'Liked Tracks', icon: Heart }
  ];

  return (
    <aside
      className={`hidden md:flex flex-col sticky top-0 h-screen border-r border-white/5 bg-background/95 backdrop-blur-2xl transition-all duration-300 z-30 shrink-0 ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header / Logo */}
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-purple-600 flex items-center justify-center shadow-lg shadow-accent/25 group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>

          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-white tracking-wider">
                SONGNET
              </span>
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-widest">
                Real-Time Audio System
              </span>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-white transition-colors"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Nav Content Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin">
        {/* ML INTELLIGENCE SECTION */}
        <div className="space-y-1">
          {!isSidebarCollapsed && (
            <h3 className="px-3 text-[10px] font-bold text-accent uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> ML Classifier & Models
            </h3>
          )}
          {mlNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-accent text-white shadow-lg shadow-accent/25 font-bold'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-accent'}`} />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* PRIMARY SECTION */}
        <div className="space-y-1">
          {!isSidebarCollapsed && (
            <h3 className="px-3 text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">
              Navigation
            </h3>
          )}
          {primaryNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-accent/15 text-accent shadow-sm border border-accent/30'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : ''}`} />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* MUSIC SECTION */}
        <div className="space-y-1">
          {!isSidebarCollapsed && (
            <h3 className="px-3 text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">
              Music Collection
            </h3>
          )}
          {musicNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-accent/15 text-accent shadow-sm border border-accent/30'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : ''}`} />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* FOOTER & SETTINGS NAVIGATION */}
      <div className="p-4 border-t border-white/5 space-y-2 bg-black/20">
        <div className="flex items-center justify-between px-2 pt-1">
          <button
            onClick={() => handleNavClick('settings')}
            className={`flex items-center gap-3 text-xs font-semibold transition-colors cursor-pointer ${
              currentTab === 'settings' ? 'text-accent' : 'text-text-secondary hover:text-white'
            }`}
          >
            <Settings className={`w-4 h-4 ${currentTab === 'settings' ? 'text-accent' : ''}`} />
            {!isSidebarCollapsed && <span>Settings</span>}
          </button>

          {!isSidebarCollapsed && (
            <div
              onClick={() => handleNavClick('settings')}
              className="flex items-center gap-2 pl-2 cursor-pointer group"
              title="User Profile & Settings"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-accent to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md group-hover:scale-110 transition-transform">
                SN
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
