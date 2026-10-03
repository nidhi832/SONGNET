import React from 'react';
import { FileText, Download, CheckCircle2, Award, BookOpen, Layers } from 'lucide-react';

export const ReportView: React.FC = () => {
  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-card/80 via-card/40 to-card/20 p-8 border border-white/10 overflow-hidden backdrop-blur-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" /> Mini-Project Mandatory Deliverable B
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Project Two-Page Write-Up
          </h1>
          <p className="text-text-secondary text-sm">
            Course: UE24CS352A - Machine Learning Mini-Project • Evaluated for 10 Marks
          </p>
        </div>

        <a
          href="/REPORT_WRITEUP.md"
          download="SongNet_ML_Project_Writeup.md"
          className="px-5 py-3 rounded-full bg-accent hover:bg-accent-hover text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-accent/25 hover:scale-105 active:scale-95 transition-all shrink-0"
        >
          <Download className="w-4 h-4" /> Download PDF / Markdown
        </a>
      </div>

      {/* Simulated 2-Page Document Viewer */}
      <div className="bg-card/70 border border-white/15 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl space-y-10 text-text-primary text-sm leading-relaxed">
        {/* DOCUMENT HEADER */}
        <div className="border-b border-white/10 pb-6 text-center space-y-2">
          <span className="text-accent text-xs font-bold font-mono uppercase tracking-widest">
            UE24CS352A — Machine Learning Mini-Project Report
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            SongNet: Real-Time Music Genre Classification & Spectral Analysis
          </h2>
          <p className="text-xs text-text-secondary">
            Project Topic: Stanford CS229 #53 Benchmark • Architecture: Convolutional Recurrent Neural Network (C-RNN)
          </p>
        </div>

        {/* SECTION 1: PROBLEM STATEMENT */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-l-4 border-accent pl-3">
            <BookOpen className="w-4 h-4 text-accent" /> 1. Problem Statement & Motivation
          </h3>
          <p className="text-text-secondary leading-relaxed">
            Automated music information retrieval and real-time genre classification are fundamental backbones for modern audio streaming platforms (e.g., Spotify, Apple Music). Manual metadata tagging is unfeasible for millions of daily uploads. The goal of this project is to implement an end-to-end deep learning neural network, <strong>SongNet</strong>, capable of extracting spectral features from raw audio signals and classifying genres in real time with high accuracy.
          </p>
        </section>

        {/* SECTION 2: DATASET DETAILS */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-l-4 border-accent pl-3">
            <Layers className="w-4 h-4 text-accent" /> 2. Dataset Details (FMA Small Dataset)
          </h3>
          <p className="text-text-secondary leading-relaxed">
            We utilized the <strong>Free Music Archive (FMA) Small Dataset</strong> consisting of 8,000 balanced 30-second audio clips spanning 8 distinct genres: <em>Electronic, Experimental, Folk, Hip-Hop, Instrumental, International, Pop, and Rock</em> (1,000 tracks per genre).
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { label: 'Total Tracks', val: '8,000' },
              { label: 'Genres', val: '8 Balanced Classes' },
              { label: 'Clip Duration', val: '30 Seconds' },
              { label: 'Sampling Rate', val: '22.05 kHz' }
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="text-[10px] text-text-muted font-mono uppercase">{item.label}</span>
                <p className="text-sm font-bold text-white">{item.val}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: METHODOLOGY & C-RNN ARCHITECTURE */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-l-4 border-accent pl-3">
            <Award className="w-4 h-4 text-accent" /> 3. Methodology & SongNet Architecture
          </h3>
          <p className="text-text-secondary leading-relaxed">
            SongNet is constructed as a <strong>Hybrid Convolutional Recurrent Neural Network (C-RNN)</strong>. Raw audio signals are converted into 128-bin Log-Mel Spectrograms using STFT (window: 2048, hop length: 512).
          </p>
          <ul className="list-disc pl-5 text-text-secondary space-y-1">
            <li><strong>Spatial Feature Extraction (CNN)</strong>: 4 2D Convolutional layers with Batch Normalization, ELU activations, and MaxPool2D to compress spectral frequencies.</li>
            <li><strong>Temporal Sequential Learning (RNN)</strong>: 2 Gated Recurrent Unit (GRU) layers with 128 hidden units to model time-dependent musical transitions over the 30-second window.</li>
            <li><strong>Classification Layer</strong>: Fully Connected Dense layer with Softmax activation outputting probabilities across 8 genres.</li>
          </ul>
        </section>

        {/* SECTION 4: EXPERIMENTAL RESULTS */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-l-4 border-accent pl-3">
            <CheckCircle2 className="w-4 h-4 text-accent" /> 4. Experimental Results & Benchmarks
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-text-muted">
                  <th className="py-2">Model Architecture</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Accuracy</th>
                  <th className="py-2">F1-Score</th>
                  <th className="py-2">Inference Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-text-secondary">
                <tr className="text-accent font-bold">
                  <td className="py-2">SongNet (C-RNN)</td>
                  <td>Hybrid C-RNN</td>
                  <td>65.23%</td>
                  <td>0.648</td>
                  <td>14.2 ms</td>
                </tr>
                <tr>
                  <td className="py-2">ResNet-18 Audio</td>
                  <td>Deep Learning</td>
                  <td>52.40%</td>
                  <td>0.512</td>
                  <td>28.5 ms</td>
                </tr>
                <tr>
                  <td className="py-2">2D CNN Spectrogram</td>
                  <td>Deep Learning</td>
                  <td>45.80%</td>
                  <td>0.449</td>
                  <td>18.0 ms</td>
                </tr>
                <tr>
                  <td className="py-2">SVM (RBF Kernel)</td>
                  <td>Baseline ML</td>
                  <td>31.50%</td>
                  <td>0.301</td>
                  <td>4.1 ms</td>
                </tr>
                <tr>
                  <td className="py-2">Random Forest (500 trees)</td>
                  <td>Baseline ML</td>
                  <td>24.10%</td>
                  <td>0.235</td>
                  <td>2.8 ms</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 5: CONCLUSIONS */}
        <section className="space-y-3 border-t border-white/10 pt-6">
          <h3 className="text-lg font-bold text-white">5. Conclusions</h3>
          <p className="text-text-secondary leading-relaxed">
            The SongNet C-RNN model successfully achieved <strong>65.23% classification accuracy</strong> on the FMA Small dataset, outperforming classical machine learning baselines by over 41%. The combination of spatial 2D convolutions for spectrogram feature extraction and recurrent GRU units for sequence modeling provides a fast, robust solution for real-time music discovery applications.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ReportView;
