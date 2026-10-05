import React, { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import {
  fetchSongMetadataWithGemini,
  askGeminiAssistant
} from '../../services/geminiService';
import type { Track } from '../../types/music';
import {
  Sparkles, Search, Send, Play, Cpu, AlertCircle, Loader2
} from 'lucide-react';

export const GeminiAssistantView: React.FC = () => {
  const { playTrack, currentTrack, navigateTo } = usePlayer();

  // Song Fetcher State
  const [songQuery, setSongQuery] = useState<string>('');
  const [isFetchingSong, setIsFetchingSong] = useState<boolean>(false);
  const [fetchedTrack, setFetchedTrack] = useState<Track | null>(null);
  const [songFetchError, setSongFetchError] = useState<string | null>(null);

  // Chat Assistant State
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Hello! I am SONGNET AI Assistant. Powered by deep neural networks, I can analyze any song in the world, generate live CS229 SongNet C-RNN spectrogram predictions, or answer questions about audio Machine Learning.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Fetch song
  const handleFetchSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songQuery.trim()) return;

    setIsFetchingSong(true);
    setSongFetchError(null);
    setFetchedTrack(null);

    try {
      const track = await fetchSongMetadataWithGemini(songQuery);
      setFetchedTrack(track);
    } catch (err: any) {
      setSongFetchError(err.message || 'Failed to fetch song metadata.');
    } finally {
      setIsFetchingSong(false);
    }
  };

  // Send message to AI Assistant
  const handleSendChatMessage = async (promptText?: string) => {
    const textToSend = promptText || chatInput;
    if (!textToSend.trim() || isChatLoading) return;

    const userMessage = {
      sender: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    if (!promptText) setChatInput('');
    setIsChatLoading(true);

    try {
      const aiResponse = await askGeminiAssistant(textToSend, currentTrack || undefined);
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: aiResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ SONGNET AI Error: ${err.message || 'Could not connect to AI service. Please try again.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-6xl mx-auto">
      {/* Banner / Header */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-accent/20 via-purple-900/30 to-blue-900/20 border border-accent/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64 text-accent" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SongNet Integration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              SongNet Portal
            </h1>
            <p className="text-text-secondary text-sm max-w-2xl">
              Fetch song metadata in real-time, generate live Mel-Spectrogram feature predictions, or chat with your custom SONGNET AI model.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 1. Live Song Fetcher | 2. AI Assistant Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT 5 COLS: Live Song Fetcher */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-white/10 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Search className="w-5 h-5 text-accent" />
              <h2>Fetch Any Song Metadata</h2>
            </div>
            <p className="text-xs text-text-muted">
              Enter any song title or artist. SONGNET AI will construct full metadata, spectrogram predictions, and audio features.
            </p>

            <form onSubmit={handleFetchSong} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Starboy - The Weeknd, Despacito, Billie Jean..."
                  value={songQuery}
                  onChange={(e) => setSongQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 rounded-2xl bg-black/30 border border-white/10 text-white placeholder-text-muted text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={isFetchingSong || !songQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-white transition-all cursor-pointer"
                >
                  {isFetchingSong ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                </button>
              </div>
            </form>

            {/* Fetch Error */}
            {songFetchError && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{songFetchError}</span>
              </div>
            )}

            {/* Fetched Track Display Card */}
            {fetchedTrack && (
              <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <img
                    src={fetchedTrack.coverUrl}
                    alt={fetchedTrack.title}
                    className="w-16 h-16 rounded-xl object-cover border border-white/10 shadow-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="px-2 py-0.5 rounded-md bg-accent/20 border border-accent/30 text-accent text-[10px] font-bold">
                      {fetchedTrack.predictedGenre || fetchedTrack.genre} ({((fetchedTrack.confidenceScore || 0.91) * 100).toFixed(1)}%)
                    </span>
                    <h3 className="text-base font-bold text-white truncate mt-1">{fetchedTrack.title}</h3>
                    <p className="text-xs text-text-muted truncate">{fetchedTrack.artist} • {fetchedTrack.album}</p>
                  </div>
                </div>

                {/* Predictions Distribution */}
                <div className="space-y-2 text-xs">
                  <span className="text-text-muted font-bold">SONGNET C-RNN Predictions:</span>
                  {(fetchedTrack.topPredictions || []).map((pred) => (
                    <div key={pred.genre} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white font-medium">{pred.genre}</span>
                        <span className="font-mono text-text-muted">{(pred.probability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pred.probability * 100}%`, backgroundColor: pred.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lyrics / AI Analysis Snippet */}
                {fetchedTrack.lyrics && (
                  <div className="p-3 rounded-xl bg-black/40 text-xs text-text-secondary italic space-y-1">
                    {fetchedTrack.lyrics.slice(0, 3).map((line, i) => (
                      <p key={i}>"{line}"</p>
                    ))}
                  </div>
                )}

                {/* Audio Preview Player */}
                {fetchedTrack.audioUrl && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-text-muted block mb-1.5">🎧 30-Second Audio Stream Preview:</span>
                    <audio controls src={fetchedTrack.audioUrl} className="w-full h-9 rounded-xl bg-black/40 border border-white/10" />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => {
                      playTrack(fetchedTrack);
                      navigateTo('classifier');
                    }}
                    className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-accent/25"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play & Test in SongNet C-RNN (56.12%)</span>
                  </button>
                  <button
                    onClick={() => {
                      playTrack(fetchedTrack);
                      navigateTo('classifier');
                    }}
                    className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                    title="Open Spectrogram Classifier"
                  >
                    <Cpu className="w-4 h-4 text-accent" />
                    <span>Open Spectrogram Studio Classifier</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 7 COLS: Music Assistant Chat */}
        <div className="lg:col-span-7">
          <div className="bg-card border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col h-[560px]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-bold text-white">Ask SONGNET AI Assistant</h2>
              </div>
              <span className="text-xs text-text-muted font-mono">Model: SONGNET Deep Intelligence</span>
            </div>

            {/* Chat History Box */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2 scrollbar-thin">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-accent text-white rounded-br-none shadow-md'
                        : 'bg-white/5 border border-white/10 text-text-secondary rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-text-muted mt-1 px-1 font-mono">{msg.time}</span>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex items-center gap-2 text-xs text-accent animate-pulse p-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>SONGNET AI is formulating response...</span>
                </div>
              )}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="py-2 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
              <button
                onClick={() => handleSendChatMessage('Explain how SongNet C-RNN model classifies Electronic vs Rock.')}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary whitespace-nowrap transition-colors"
              >
                ⚡ Electronic vs Rock ML
              </button>
              <button
                onClick={() => handleSendChatMessage('What are the main Mel-spectrogram features analyzed by 2D-CNNs?')}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary whitespace-nowrap transition-colors"
              >
                📊 Spectrogram Features
              </button>
              <button
                onClick={() => handleSendChatMessage('Recommend 5 tracks matching Martin Garrix Animals.')}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary whitespace-nowrap transition-colors"
              >
                🎵 Recommend Similar Tracks
              </button>
            </div>

            {/* Chat Input Bar */}
            <div className="pt-3 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask SONGNET AI about music, genres, or SongNet ML architecture..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                className="flex-1 px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-text-muted text-xs focus:outline-none focus:border-accent"
              />
              <button
                onClick={() => handleSendChatMessage()}
                disabled={!chatInput.trim() || isChatLoading}
                className="p-3 rounded-2xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-white transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GeminiAssistantView;
