import React, { useState } from 'react';
import {
  User, Palette, Sliders, Cpu, Bell, Check, Save, Sparkles, Moon, Sun, Monitor, Shield, Volume2
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  // Active settings tab
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'audio' | 'ml' | 'notifications'>('profile');

  // Profile Form State
  const [displayName, setDisplayName] = useState<string>(() => localStorage.getItem('songnet_user_name') || 'CS229 Researcher');
  const [email, setEmail] = useState<string>(() => localStorage.getItem('songnet_user_email') || 'songnet.team@stanford.edu');
  const [role, setRole] = useState<string>(() => localStorage.getItem('songnet_user_role') || 'Machine Learning & Signal Processing Engineer');
  const [favGenre, setFavGenre] = useState<string>('Electronic');

  // Appearance & Theme State
  const [themeMode, setThemeMode] = useState<'dark' | 'violet' | 'emerald' | 'slate' | 'light'>(() => (localStorage.getItem('songnet_theme') as any) || 'dark');
  const [enableAnimations, setEnableAnimations] = useState<boolean>(true);

  // Audio & DSP Engine State
  const [audioQuality, setAudioQuality] = useState<string>('320k');
  const [sampleRate, setSampleRate] = useState<string>('22050');
  const [crossfadeSec, setCrossfadeSec] = useState<number>(3);
  const [autoplaySimilar, setAutoplaySimilar] = useState<boolean>(true);

  // ML Model State
  const [defaultModel, setDefaultModel] = useState<string>('c-rnn');
  const [melBins, setMelBins] = useState<string>('128');
  const [autoAnalyzeUpload, setAutoAnalyzeUpload] = useState<boolean>(true);

  // Toast feedback
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem('songnet_user_name', displayName);
    localStorage.setItem('songnet_user_email', email);
    localStorage.setItem('songnet_user_role', role);
    localStorage.setItem('songnet_theme', themeMode);

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-5xl mx-auto">
      {/* Settings Top Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-card/90 via-card/50 to-card/20 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" />
              <span>System Preferences</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Settings & Preferences
            </h1>
            <p className="text-text-secondary text-sm max-w-xl">
              Customize your profile, appearance themes, Web Audio DSP engine, and default SONGNET classification models.
            </p>
          </div>

          <button
            onClick={() => handleSaveSettings()}
            className="px-6 py-3 rounded-2xl bg-accent hover:bg-accent-hover text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-accent/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Save Success Toast */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-scale-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Settings updated and saved successfully!</span>
          </div>
          <span className="text-[10px] opacity-70">Saved to Local Storage</span>
        </div>
      )}

      {/* Main Settings Navigation & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Category Tabs */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-card/60 border border-white/10 rounded-3xl p-3 space-y-1.5 backdrop-blur-xl">
            {[
              { id: 'profile', label: 'User Profile', icon: User, desc: 'Personal info & avatar' },
              { id: 'appearance', label: 'Themes & Aesthetics', icon: Palette, desc: 'Color palettes & modes' },
              { id: 'audio', label: 'Audio Engine (DSP)', icon: Volume2, desc: 'Quality & sample rate' },
              { id: 'ml', label: 'SONGNET Models', icon: Cpu, desc: 'Default classifier & bins' },
              { id: 'notifications', label: 'Preferences', icon: Bell, desc: 'Alerts & animations' }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-start gap-3.5 p-3.5 rounded-2xl transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-accent text-white shadow-lg shadow-accent/20 font-bold'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isActive ? 'text-white' : 'text-accent'}`} />
                  <div>
                    <p className="text-sm font-bold leading-none">{tab.label}</p>
                    <p className={`text-[11px] mt-1 ${isActive ? 'text-white/80' : 'text-text-muted'}`}>
                      {tab.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Tab Content Panel */}
        <div className="lg:col-span-8">
          <div className="bg-card/70 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl min-h-[460px]">
            
            {/* 1. USER PROFILE TAB */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveSettings} className="space-y-6 animate-fade-in">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white">Profile Details</h3>
                  <p className="text-xs text-text-muted">Manage your display name and academic credentials.</p>
                </div>

                {/* Avatar Preview */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/10">
                    SN
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{displayName}</h4>
                    <p className="text-xs text-text-secondary">{role}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-mono">
                      Stanford CS229 Member
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5">Role / Designation</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5">Favorite Music Genre</label>
                    <select
                      value={favGenre}
                      onChange={(e) => setFavGenre(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-accent"
                    >
                      <option value="Electronic">Electronic</option>
                      <option value="Pop">Pop</option>
                      <option value="Hip-Hop">Hip-Hop</option>
                      <option value="Folk">Folk</option>
                      <option value="Instrumental">Instrumental</option>
                      <option value="Rock">Rock</option>
                      <option value="Experimental">Experimental</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Update Profile Info
                  </button>
                </div>
              </form>
            )}

            {/* 2. THEMES & AESTHETICS TAB */}
            {activeTab === 'appearance' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white">Appearance & Themes</h3>
                  <p className="text-xs text-text-muted">Choose your preferred visual theme and color palette.</p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-text-secondary">UI Color Themes</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'dark', title: 'Dark Onyx', desc: 'Default sleek obsidian dark mode', bg: 'bg-[#070709]', accent: '#ff3b5c', icon: Moon },
                      { id: 'violet', title: 'Midnight Violet', desc: 'Deep purple gradient theme', bg: 'bg-[#0f0a1c]', accent: '#a855f7', icon: Sparkles },
                      { id: 'emerald', title: 'Cyber Emerald', desc: 'Neon green accent theme', bg: 'bg-[#06140e]', accent: '#10b981', icon: Monitor },
                      { id: 'slate', title: 'Slate Gray', desc: 'Modern high-contrast dark', bg: 'bg-[#0f172a]', accent: '#3b82f6', icon: Shield },
                      { id: 'light', title: 'Light Mode', desc: 'Clean high-contrast theme', bg: 'bg-[#f8fafc]', accent: '#ec4899', icon: Sun }
                    ].map((theme) => {
                      const Icon = theme.icon;
                      const isSelected = themeMode === theme.id;
                      return (
                        <div
                          key={theme.id}
                          onClick={() => {
                            setThemeMode(theme.id as any);
                          }}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-accent bg-accent/15 shadow-lg'
                              : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl ${theme.bg} flex items-center justify-center border border-white/20`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">{theme.title}</h4>
                              <p className="text-[10px] text-text-muted">{theme.desc}</p>
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-accent shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Micro-Animations Toggle */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Interface Micro-Animations</h4>
                    <p className="text-[11px] text-text-muted">Enable smooth fade-ins and pulse glow effects.</p>
                  </div>
                  <button
                    onClick={() => setEnableAnimations(!enableAnimations)}
                    className={`w-12 h-6 rounded-full transition-colors p-1 ${
                      enableAnimations ? 'bg-accent' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        enableAnimations ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* 3. AUDIO ENGINE (DSP) TAB */}
            {activeTab === 'audio' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white">Web Audio Engine & DSP</h3>
                  <p className="text-xs text-text-muted">Configure Web Audio API sample rates and streaming quality.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5">Audio Quality Stream</label>
                    <select
                      value={audioQuality}
                      onChange={(e) => setAudioQuality(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-accent"
                    >
                      <option value="320k">High Quality (320 kbps MP3 / AAC)</option>
                      <option value="flac">Lossless Audio (FLAC 1411 kbps)</option>
                      <option value="160k">Standard Quality (160 kbps)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5">Web Audio API Sample Rate</label>
                    <select
                      value={sampleRate}
                      onChange={(e) => setSampleRate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-accent"
                    >
                      <option value="22050">22.05 kHz (Stanford CS229 FMA Paper Standard)</option>
                      <option value="44100">44.1 kHz (CD Quality HD)</option>
                      <option value="48000">48.0 kHz (Studio Quality HD)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-text-secondary mb-1.5">
                      <span>Crossfade Duration</span>
                      <span className="font-mono text-accent">{crossfadeSec} seconds</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="1"
                      value={crossfadeSec}
                      onChange={(e) => setCrossfadeSec(parseInt(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <h4 className="text-xs font-bold text-white">Autoplay Recommended Tracks</h4>
                      <p className="text-[11px] text-text-muted">Automatically queue similar genre tracks when playback ends.</p>
                    </div>
                    <button
                      onClick={() => setAutoplaySimilar(!autoplaySimilar)}
                      className={`w-12 h-6 rounded-full transition-colors p-1 ${
                        autoplaySimilar ? 'bg-accent' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          autoplaySimilar ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. SONGNET ML MODELS TAB */}
            {activeTab === 'ml' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white">SONGNET Model Configuration</h3>
                  <p className="text-xs text-text-muted">Set primary classification algorithm & Log-Mel spectrogram resolution.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5">Primary Classifier Model</label>
                    <select
                      value={defaultModel}
                      onChange={(e) => setDefaultModel(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-accent"
                    >
                      <option value="c-rnn">SongNet C-RNN (56.12% Deep Learning - Recommended #1)</option>
                      <option value="mlp">Multilayer Perceptron MLP (53.50% Baseline)</option>
                      <option value="rf">Random Forest (48.75% Baseline)</option>
                      <option value="lr">Logistic Regression (43.00% Baseline)</option>
                      <option value="svm">Support Vector Machine SVM (40.38% Baseline)</option>
                      <option value="knn">K-Nearest Neighbors KNN (37.75% Baseline)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5">Log-Mel Spectrogram Resolution</label>
                    <select
                      value={melBins}
                      onChange={(e) => setMelBins(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-accent"
                    >
                      <option value="128">128 Mel Bins (CS229 Paper Specification)</option>
                      <option value="256">256 Mel Bins (Ultra High Precision)</option>
                      <option value="64">64 Mel Bins (Fast Inference Mode)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <h4 className="text-xs font-bold text-white">Auto-Analyze Uploaded Audio Files</h4>
                      <p className="text-[11px] text-text-muted">Run real-time Web Audio feature extraction immediately on file drop.</p>
                    </div>
                    <button
                      onClick={() => setAutoAnalyzeUpload(!autoAnalyzeUpload)}
                      className={`w-12 h-6 rounded-full transition-colors p-1 ${
                        autoAnalyzeUpload ? 'bg-accent' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          autoAnalyzeUpload ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. PREFERENCES & NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white">General Preferences</h3>
                  <p className="text-xs text-text-muted">Manage system notifications and audio visualizer preferences.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">Spectrogram Canvas Animations</h4>
                      <p className="text-text-muted text-[11px]">Render real-time FFT frequency canvas on player.</p>
                    </div>
                    <Check className="w-5 h-5 text-accent" />
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">Audio Processing Sound Effects</h4>
                      <p className="text-text-muted text-[11px]">Play subtle feedback sounds when switching classification models.</p>
                    </div>
                    <Check className="w-5 h-5 text-accent" />
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">FMA Benchmark Notifications</h4>
                      <p className="text-text-muted text-[11px]">Notify when new model weights are loaded.</p>
                    </div>
                    <Check className="w-5 h-5 text-accent" />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
