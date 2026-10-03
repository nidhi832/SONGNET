import React from 'react';
import { PlayerProvider } from './context/PlayerContext';
import Shell from './components/layout/Shell';

const App: React.FC = () => {
  return (
    <PlayerProvider>
      <Shell />
    </PlayerProvider>
  );
};

export default App;
