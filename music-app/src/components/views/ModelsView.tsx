import React, { useState } from 'react';
import { MOCK_ML_MODELS, MOCK_CONFUSION_MATRIX } from '../../data/mockData';
import { Trophy, Layers, Cpu, Award, Zap, Activity } from 'lucide-react';

export const ModelsView: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number; val: number } | null>(null);

  return (
    <div className="space-y-10 pb-16 animate-fade-in">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-card/80 via-card/40 to-card/20 p-8 border border-white/10 overflow-hidden backdrop-blur-2xl">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" /> Model Architecture & Benchmark
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            SongNet (C-RNN) vs Baselines
          </h1>
          <p className="text-text-secondary text-sm md:text-base leading-relaxed">
            Evaluated on the Free Music Archive (FMA) Small Dataset (8,000 balanced 30-second audio tracks across 8 genres). SongNet achieves 65.23% classification accuracy—outperforming traditional baseline models by +41%.
          </p>
        </div>
      </div>

      {/* Model Performance Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Benchmark Comparison Table & Charts */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-card/60 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-extrabold text-white tracking-tight">Model Accuracy Comparison</h3>
              </div>
              <span className="text-xs text-text-muted font-mono">FMA Small Test Set</span>
            </div>

            {/* Model Comparison Bars */}
            <div className="space-y-3 pt-2">
              {MOCK_ML_MODELS.map((model, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    model.isBest
                      ? 'bg-accent/15 border-accent/40 shadow-lg'
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-white">{model.name}</span>
                      {model.isBest && (
                        <span className="px-2 py-0.5 rounded-full bg-accent text-white text-[10px] uppercase font-bold tracking-wider">
                          Best Model
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-accent font-extrabold text-sm">
                      {model.accuracy.toFixed(2)}%
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        model.isBest ? 'bg-accent shadow-sm shadow-accent' : 'bg-blue-500/80'
                      }`}
                      style={{ width: `${model.accuracy}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-text-muted mt-2 font-mono">
                    <span>{model.parameters}</span>
                    <span>Latency: {model.inferenceTimeMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* C-RNN Layer Architecture Diagram */}
          <div className="p-6 rounded-3xl bg-card/40 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent" /> SongNet Neural Network Pipeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { title: 'Audio Input', desc: 'Raw Audio Waveform (22.05 kHz)' },
                { title: 'Mel-Spectrogram', desc: 'STFT Window: 2048, 128 Mel Bins' },
                { title: '3x Conv1D Layers', desc: 'Temporal-Spectral Feature Extraction (ReLU, BatchNorm, Dropout)' },
                { title: 'TimeDistributed FC', desc: 'Per-Timestep Softmax Genre Probability & Mean Vector' }
              ].map((step, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-bold font-mono">
                    Step 0{i + 1}
                  </span>
                  <p className="text-xs font-bold text-white">{step.title}</p>
                  <p className="text-[10px] text-text-muted">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Confusion Matrix Heatmap */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-card/60 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-accent" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  8x8 Confusion Matrix
                </h3>
              </div>
              <span className="text-[10px] text-text-muted font-mono">FMA Test Predictions</span>
            </div>

            {/* Confusion Matrix Table Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-1 text-[9px] font-mono text-text-muted">True \ Pred</th>
                    {MOCK_CONFUSION_MATRIX.labels.map((lbl, idx) => (
                      <th key={idx} className="p-1 text-[9px] font-mono text-text-secondary truncate max-w-[32px]">
                        {lbl.slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CONFUSION_MATRIX.matrix.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="p-1 text-[9px] font-mono text-text-secondary text-right pr-2">
                        {MOCK_CONFUSION_MATRIX.labels[rIdx].slice(0, 3)}
                      </td>
                      {row.map((val, cIdx) => {
                        const isDiagonal = rIdx === cIdx;
                        const opacity = Math.min(val / 85, 1);
                        return (
                          <td
                            key={cIdx}
                            onClick={() => setSelectedCell({ row: rIdx, col: cIdx, val })}
                            className={`p-1.5 text-[10px] font-mono rounded cursor-pointer transition-all border border-black/30 ${
                              isDiagonal
                                ? 'bg-accent text-white font-bold'
                                : val > 5
                                ? 'bg-accent/20 text-accent font-semibold'
                                : 'bg-white/5 text-text-muted hover:bg-white/10'
                            }`}
                            style={{
                              opacity: isDiagonal ? 1 : Math.max(opacity, 0.2)
                            }}
                            title={`True: ${MOCK_CONFUSION_MATRIX.labels[rIdx]} | Pred: ${MOCK_CONFUSION_MATRIX.labels[cIdx]} = ${val}%`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedCell && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-text-secondary font-mono flex items-center justify-between">
                <span>
                  True: <strong className="text-white">{MOCK_CONFUSION_MATRIX.labels[selectedCell.row]}</strong> → Pred: <strong className="text-accent">{MOCK_CONFUSION_MATRIX.labels[selectedCell.col]}</strong>
                </span>
                <span className="font-bold text-white">{selectedCell.val}% Samples</span>
              </div>
            )}
          </div>

          {/* Model Summary Metrics Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-accent/20 via-card to-card border border-accent/40 space-y-4">
            <div className="flex items-center gap-2 text-accent">
              <Award className="w-5 h-5" />
              <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">
                Key Findings & Contributions
              </h4>
            </div>

            <ul className="space-y-2 text-xs text-text-secondary leading-relaxed">
              <li className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span><strong>SongNet C-RNN (65.23%)</strong> outperforms the best baseline (SVM 46.38%) by <strong>+41% relative improvement</strong> without using metadata.</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>Baselines (SVM, MLP, LR, KNN) were trained with 140 features including metadata (artist, year, etc.), while SongNet relies strictly on raw audio Mel-Spectrograms.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelsView;
