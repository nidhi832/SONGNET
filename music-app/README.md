# SongNet — Real-Time Music Genre Classification Web Application
**UE24CS352A - Machine Learning Project**  
*Strictly Aligned with Stanford CS229 Paper #53 Benchmark*

[![GitHub Repository](https://img.shields.io/badge/GitHub-SONGNET-purple?style=for-the-badge&logo=github)](https://github.com/nidhi832/SONGNET)
[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)

---

## 📌 Project Overview

**SongNet** is an end-to-end Machine Learning web application designed for real-time music genre classification and spectral audio analytics. Based on the **Stanford CS229 Paper #53** (*SongNet: Real-time Music Genre Classification* by Chi Zhang, Yue Zhang, and Chen Chen), the core classifier is a **Convolutional Recurrent Neural Network (C-RNN)** trained on the **Free Music Archive (FMA) Small Dataset**.

SongNet achieves **65.23% classification accuracy** on raw audio Mel-Spectrograms (128 Mel Bins), outperforming traditional machine learning baselines (SVM 46.38%, MLP 44.88%, LR 42.25%, KNN 36.38%) by **+41% relative improvement** without requiring track metadata.

---

## 🌟 Key Features & Capabilities

- 🎵 **Interactive Real-Time Spectrogram Classifier**: Upload audio or video files (`.mp3`, `.wav`, `.mp4`, `.webm`, `.mov`, `.m4a`) or choose preset tracks to view live 128-bin Mel-Spectrogram heatmaps (22.05 kHz, STFT $N_{fft}=2048$, $hop=512$) and Softmax genre probability distributions.
- 📊 **Stanford CS229 Paper #53 Model Benchmarks**: Side-by-side performance evaluation across all 6 model architectures:
  1. **SongNet (C-RNN)** — **65.23%** (Best Model - 3 Conv1D + TimeDistributed Dense)
  2. **Support Vector Machine (SVM)** — **46.38%** (RBF Kernel on 140 FMA features)
  3. **Multilayer Perceptron (MLP)** — **44.88%** (Dense Neural Net)
  4. **Logistic Regression** — **42.25%** (Softmax Classifier)
  5. **K-Nearest Neighbors (KNN)** — **36.38%** ($k=5$ Neighbors)
  6. **Random Baseline** — **12.50%** (Uniform $1/8$ random chance)
- 🎛️ **Web Audio API Sound Synthesizer & Fallback**: Native browser DSP engine that synthesizes genre-tuned musical notes (Pop, Rock, Hip-Hop, Folk, Instrumental, Electronic) and provides CORS-proof audio playback fallback.
- ⚙️ **Customizable Settings & System Preferences**:
  - **User Profile**: Custom Display Name, Email, Academic Role, and Favorite Genre.
  - **Themes**: Selectable visual themes (*Dark Onyx*, *Midnight Violet*, *Cyber Emerald*, *Slate Gray*, *Light Mode*).
  - **Audio DSP Settings**: Audio quality selector, sample rate toggle (22.05 kHz CS229 benchmark vs 44.1 kHz HD), and crossfade slider.
  - **Model Defaults**: Primary classifier selection and spectrogram bin resolution.
- 📄 **Academic Deliverables Included**:
  - `REPORT_WRITEUP.md`: Two-page structured project report.
  - `PRESENTATION_SLIDES.md`: Presentation slide deck structure for live evaluation.
  - `stanford_report_53.pdf` & `stanford_poster_53.pdf`: Original Stanford research reference documents.

---

## 📁 Repository Directory Structure

```text
SONGNET/
├── src/
│   ├── components/
│   │   ├── common/         # TrackRow, AlbumCard, ArtistCard, GenreCard, SkeletonLoader
│   │   ├── layout/         # Shell, Sidebar, Header, MobileNav
│   │   ├── player/         # MusicPlayer, NowPlayingModal
│   │   └── views/          # ClassifierView, ModelsView, SettingsView, ReportView, SlidesView, SongNetPortal
│   ├── context/            # PlayerContext state manager (Audio & Queue state)
│   ├── data/               # mockData (FMA dataset & model evaluation metrics)
│   ├── services/           # audioClassifier.ts (Web Audio DSP), geminiService.ts
│   └── types/              # TypeScript definitions for music & ML predictions
├── stanford_report_53.pdf  # Stanford CS229 Paper #53 Research Report
├── stanford_poster_53.pdf  # Stanford CS229 Paper #53 Presentation Poster
├── REPORT_WRITEUP.md       # Mandatory Project Summary Report
├── PRESENTATION_SLIDES.md   # Project Presentation Slide Deck
├── package.json            # Project dependencies and build scripts
└── README.md               # Complete Project Documentation
```

---

## ⚡ Quick Start & Installation

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)

### Setup Commands

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/nidhi832/SONGNET.git
   cd SONGNET
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Local Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser to [http://localhost:5173/](http://localhost:5173/).

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🔬 Dataset & Machine Learning Specifications

* **Dataset**: Free Music Archive (FMA) Small
* **Sample Count**: 8,000 audio tracks (1,000 per genre)
* **Genres (8)**: *Electronic, Experimental, Folk, Hip-Hop, Instrumental, International, Pop, Rock*
* **Feature Extraction**: 128 Log-Mel Spectrogram Bins, 22.05 kHz Sample Rate, Zero Crossing Rate, RMS Loudness, Spectral Centroid, Sub-Bass/Bass/Mid/Brilliance Band Energies.

---

## 📜 License & Credits

Developed as part of the **UE24CS352A Machine Learning Course Project**.  
Based on the research paper:  
*SongNet: Real-Time Music Genre Classification* (Stanford CS229, 2018) by Chi Zhang, Yue Zhang, and Chen Chen.
