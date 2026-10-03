import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import type { ActiveTab } from '../../types/music';
import { Home, Compass, Search, Library } from 'lucide-react';

interface MobileNavProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab: propActiveTab, setActiveTab }) => {
  const { activeTab: contextActiveTab, navigateTo } = usePlayer();

  const currentTab = propActiveTab || contextActiveTab;

  const handleNavClick = (id: ActiveTab) => {
    if (setActiveTab) {
      setActiveTab(id);
    } else {
      navigateTo(id);
    }
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-card/95 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around px-2">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all ${
              isActive ? 'text-accent font-bold scale-105' : 'text-text-muted hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;
