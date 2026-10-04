import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Monitor, CheckCircle2, Sparkles } from 'lucide-react';

export const SlidesView: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const slides = [
    {
      id: 1,
      title: "SongNet: Real-Time Music Genre Classification",
      subtitle: "UE24CS352A Machine Learning Mini-Project Demonstration",
      content: (
        <div className="space-y-6 text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 text-accent font-mono text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Live Review Presentation Deck
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            SongNet (C-RNN)
          </h2>
          <p className="text-text-secondary text-base max-w-xl mx-auto">
            Real-Time Music Genre Classification & Audio Spectrogram Analytics
          </p>
          <div className="pt-4 flex items-center justify-center gap-4 text-xs font-mono text-text-muted">
            <span>Team Members: 2 Assigned Members</span>
            <span>•</span>
            <span>Dataset: FMA Small (8K Tracks)</span>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Problem Statement & Objective",
      subtitle: "Why Automated Genre Tagging Matters",
      content: (
        <div className="space-y-4 py-4 text-left">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <h4 className="font-bold text-white text-base">Challenge in Music Streaming</h4>
            <p className="text-xs text-text-secondary">
              Streaming platforms host millions of uploaded tracks. Manual genre labeling is slow, subjective, and costly.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-accent/15 border border-accent/30 space-y-2">
            <h4 className="font-bold text-accent text-base">Project Goal</h4>
            <p className="text-xs text-white">
              Build a real-time C-RNN model that receives Mel-Spectrogram features from raw audio and outputs instant genre classification probabilities with low latency.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Dataset & Feature Extraction",
      subtitle: "Free Music Archive (FMA) Small Benchmark",
      content: (
        <div className="space-y-4 py-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] text-text-muted font-mono uppercase">Dataset</span>
              <p className="text-sm font-bold text-white">8,000 Balanced Audio Clips</p>
              <p className="text-[11px] text-text-secondary">8 Genres (1000 clips per genre)</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] text-text-muted font-mono uppercase">Feature Engineering</span>
              <p className="text-sm font-bold text-accent">128-Bin Log-Mel Spectrogram</p>
              <p className="text-[11px] text-text-secondary">STFT Window: 2048, Hop: 512</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "SongNet C-RNN Neural Network Architecture",
      subtitle: "Convolutional + Recurrent Hybrid Model",
      content: (
        <div className="space-y-3 py-2 text-left">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
            <span className="font-bold text-white">1. Spatial Extraction (4x Conv2D)</span>
            <span className="text-text-muted">BatchNorm + ELU + MaxPool2D</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-between text-xs">
            <span className="font-bold text-accent">2. Temporal Memory (2x GRU)</span>
            <span className="text-white">128 Hidden Recurrent Units</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
            <span className="font-bold text-white">3. Classifier (Dense Softmax)</span>
            <span className="text-text-muted">8-Class Probability Vector</span>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Benchmark Results & Evaluation",
      subtitle: "Full 8,000 FMA Dataset (800 Test Samples)",
      content: (
        <div className="space-y-3 py-2 text-left">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-accent/20 to-card border border-accent/40 flex items-center justify-between">
            <div>
              <span className="text-xs text-text-muted uppercase font-bold">Deep Learning SongNet C-RNN</span>
              <p className="text-2xl font-black text-white">49.25% Accuracy</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-accent text-white text-xs font-bold">
              57.17% Train Acc
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-white/5 flex justify-between">
              <span>MLP Classifier:</span>
              <span className="text-text-secondary font-bold">53.50%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 flex justify-between">
              <span>Random Forest:</span>
              <span className="text-text-secondary font-bold">48.75%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 flex justify-between">
              <span>Logistic Regression:</span>
              <span className="text-text-secondary font-bold">43.00%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 flex justify-between">
              <span>Linear SVM:</span>
              <span className="text-text-secondary font-bold">40.38%</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const slide = slides[currentSlide];

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-4xl mx-auto">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-accent" />
          <h2 className="text-1xl font-bold text-white">Live Presentation Slide Deck</h2>
        </div>
        <span className="text-xs font-mono text-text-muted">
          Slide {currentSlide + 1} of {slides.length}
        </span>
      </div>

      {/* Main Slide Stage Container */}
      <div className="relative aspect-[16/9] w-full rounded-3xl bg-card/80 border border-white/15 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl flex flex-col justify-between overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        {/* Slide Header */}
        <div className="space-y-1 relative z-10">
          <span className="text-xs font-mono text-accent font-bold uppercase tracking-widest">
            {slide.subtitle}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {slide.title}
          </h1>
        </div>

        {/* Slide Body Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          {slide.content}
        </div>

        {/* Slide Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-text-muted">
          <span>UE24CS352A Mini-Project Presentation</span>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ready for Live Demonstration
          </div>
        </div>
      </div>

      {/* Navigation Slide Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
          disabled={currentSlide === 0}
          className="p-3 rounded-full bg-card hover:bg-card-hover border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === i ? 'bg-accent scale-125' : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1))}
          disabled={currentSlide === slides.length - 1}
          className="p-3 rounded-full bg-card hover:bg-card-hover border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default SlidesView;
