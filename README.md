# SongNet: Real-Time Music Genre Classification

[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C.svg?style=flat&logo=pytorch)](https://pytorch.org/)
[![Gradio](https://img.shields.io/badge/Gradio-Demo-orange.svg)](http://127.0.0.1:7860)
[![React](https://img.shields.io/badge/React-Vite_UI-61DAFB.svg?style=flat&logo=react)](http://localhost:5173)
[![Accuracy](https://img.shields.io/badge/SongNet_Test_Accuracy-56.12%25-brightgreen.svg)](#-5-results--benchmark-comparison)
[![Dataset](https://img.shields.io/badge/Dataset-FMA_Small_(8k_Tracks)-blue.svg)](https://github.com/mdeff/fma)

---

## 🎵 Overview

**SongNet** is a temporal 1D Convolutional-Recurrent Neural Network (C-RNN) designed for classifying music into 8 distinct genres from raw 128-bin log-Mel spectrograms. Beyond static song-level genre prediction, SongNet outputs frame-by-frame (per-timestep) genre probability distributions, enabling real-time live audio genre classification as a song streams—fulfilling the future work proposed by the original Stanford CS229 authors (*Zhang, Zhang, Chen, 2018*).

In our latest end-to-end training on the full 8,000-track Free Music Archive (FMA Small) dataset, **SongNet C-RNN achieved 56.12% Test Accuracy (56.88% Peak Validation Accuracy)**, officially outperforming all classical machine learning baselines:
- **#1 SongNet C-RNN (Deep Learning)**: **56.12%** (Macro F1: 0.5400)
- **#2 Multilayer Perceptron (MLP)**: **53.50%**
- **#3 Random Forest (200 trees)**: **48.75%**
- **#4 Logistic Regression**: **43.00%**
- **#5 Linear SVM**: **40.38%**
- **#6 kNN (k=5)**: **37.75%**
- **#7 Random Guessing**: **12.50%**

---

## 🖥️ Interactive Web Applications & Live Demos

The platform provides two interactive user interfaces for inference, audio testing, and comparative analysis:

### 1. Python Motion Studio Backend & Gradio Dashboard
- **URL**: [http://127.0.0.1:7860/](http://127.0.0.1:7860/)
- **Command**: `python app.py`
- **Features**:
  - Live temporal genre probability curves (Plotly interactive charts)
  - 2D temporal heatmaps tracking genre confidence across time
  - Support for Time-Distributed Conv1D head and Causal Unidirectional GRU head
  - Pre-loaded sample library across all 8 genres and instant microphone/file upload
  - Classical baseline inference toggles (MLP, Random Forest, Logistic Regression, SVM, kNN)

### 2. Modern React + Vite Music Platform & Spectrogram Studio
- **URL**: [http://localhost:5173/](http://localhost:5173/)
- **Command**: `cd music-app && npm run dev`
- **Features**:
  - **Real-Time 128-bin Mel Spectrogram Visualizer**: Web Audio API DSP extraction directly in the browser
  - **All 5 Paper Classifiers**: Side-by-side probability bars comparing C-RNN against MLP, Random Forest, SVM, and kNN
  - **Real Global Song Search & Audio Streaming**: Integrated iTunes Search API allows searching any song worldwide (*Starboy*, *Bohemian Rhapsody*, *Despacito*, *Lose Yourself*, etc.) with authentic 30-second audio stream previews (CORS-enabled)
  - **SONGNET AI Assistant**: Ask questions about audio ML, genres, or DSP with Google Gemini integration and intelligent offline musicological fallback
  - **Interactive Slides Deck & Research Report**: Built-in slide presentation and comprehensive academic benchmark report

---

## 🚀 Quick Start: Running the Servers

### Prerequisites
- Python 3.10+ with PyTorch, torchaudio, librosa, scikit-learn, gradio, soundfile
- Node.js 18+ & npm (for the React music app)

### Step 1: Install Dependencies
```bash
# Clone the repository
git clone https://github.com/nidhi832/SONGNET.git
cd SONGNET

# Install Python requirements
pip install -r requirements.txt

# Install React frontend requirements
cd music-app
npm install
cd ..
```

### Step 2: Launch the Servers

You can run both servers simultaneously in two terminal windows:

**Terminal 1 — Python Backend & Gradio Demo ([http://127.0.0.1:7860/](http://127.0.0.1:7860/)):**
```bash
python app.py
```

**Terminal 2 — React Music App UI ([http://localhost:5173/](http://localhost:5173/)):**
```bash
cd music-app
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser to experience the full SongNet Studio suite!

---

## 🛠️ Pipeline & Architecture

```
fma_small mp3s ──► src/preprocess.py ──► data/processed/{mels.npy, meta.csv, norm.npz, genres.json}
fma_metadata/  ──► src/baselines.py  ──► models/baselines.joblib (fitted models + scaler)
data/processed ──► src/train.py      ──► models/best.pt (56.12% Test Acc)
               ──► src/evaluate.py   ──► results/{confusion_matrix.png, comparison.md}
models/best.pt ──► app.py            ──► Gradio Motion Studio Demo (http://127.0.0.1:7860)
models/best.pt ──► music-app/        ──► React Spectrogram Studio (http://localhost:5173)
```

### Repository Structure

| Path | Description |
| :--- | :--- |
| `app.py` | Python Gradio backend server running on `http://127.0.0.1:7860/`. |
| `kaggle_songnet.ipynb` | Complete, self-contained Kaggle notebook with training runs, loss curves, and evaluation. |
| `models/best.pt` | PyTorch checkpoint for trained SongNet C-RNN model (56.12% Test Accuracy). |
| `models/baselines.joblib` | Compressed scikit-learn baselines (MLP, Random Forest, Logistic Regression, Linear SVM, kNN). |
| `models/confusion_matrix.png` | Genre confusion matrix on the 800 test tracks. |
| `music-app/` | Modern React + TypeScript + Tailwind Vite application running on `http://localhost:5173/`. |
| `src/model.py` | PyTorch `SongNet` definition: 3×Conv1D backbone with Time-Distributed and GRU heads. |
| `src/common.py` | Audio DSP constants (22.05 kHz, 128 Mel bins, 8 FMA genres). |
| `src/preprocess.py` | Extracts log-Mel spectrograms from FMA Small into stratified 70/20/10 splits. |
| `src/baselines.py` | Trains and evaluates classical ML baselines on 640 statistical features. |
| `src/train.py` | PyTorch training loop with Cosine Annealing, AdamW, and random temporal slicing. |
| `src/evaluate.py` | Generates confusion matrices, classification reports, and benchmark metrics. |
| `results/comparison.md` | Formal accuracy and F1 score comparison table. |
| `tests/smoke_test.py` | Fast synthetic end-to-end smoke test (~1 min). |
| `WRITEUP.md` | Formal two-page academic report complying with Stanford CS229 / university guidelines. |

---

## 📊 5. Results & Benchmark Comparison

Evaluated on the Free Music Archive (FMA) Small Dataset (8,000 balanced 30-second tracks across 8 genres, 800 test tracks):

| Model / Baseline | Input Representation | Test Accuracy | Macro F1 Score | Status |
| :--- | :--- | :---: | :---: | :---: |
| **SongNet C-RNN (Deep Learning)** | **Log-Mel Spectrogram (Raw Audio)** | **56.12%** | **0.5400** | **#1 Best Overall** |
| **Multilayer Perceptron (MLP)** | 640 Statistical Mel Features | **53.50%** | **0.5384** | Classical Baseline |
| **Random Forest (200 trees)** | 640 Statistical Mel Features | **48.75%** | **0.4755** | Ensemble Baseline |
| **Logistic Regression** | 640 Statistical Mel Features | **43.00%** | **0.4268** | Linear Baseline |
| **Linear SVM** | 640 Statistical Mel Features | **40.38%** | **0.4017** | Kernel Baseline |
| **kNN (k=5)** | 640 Statistical Mel Features | **37.75%** | **0.3675** | Instance Baseline |
| **Random Baseline** | Uniform Random Choice (1 / 8) | **12.50%** | **0.1250** | Theoretical Minimum |

### Per-Class Recall Breakdown (SongNet C-RNN - Test Acc: 56.12%)
- **Rock**: 77% recall (77/100 correct)
- **Hip-Hop**: 75% recall (75/100 correct)
- **Folk**: 74% recall (74/100 correct)
- **International**: 71% recall (71/100 correct)
- **Electronic**: 56% recall (56/100 correct)
- **Instrumental**: 50% recall (50/100 correct)
- **Experimental**: 37% recall (37/100 correct)
- **Pop**: 9% recall (9/100 correct)

### Confusion Matrix
The confusion matrix is saved at `models/confusion_matrix.png` and `results/confusion_matrix.png`. Rock, Hip-Hop, Folk, and International demonstrate high precision and recall, while Experimental and Pop show cross-genre acoustic dispersion as reported in the original Stanford CS229 paper.

---

## 🔬 Deep Learning Optimizations Applied

The model was optimized in `kaggle_songnet.ipynb` using 4 core techniques:
1. **Raw Logit Pooling**: Averaging unnormalized temporal logits before `nn.CrossEntropyLoss(label_smoothing=0.05)` to eliminate gradient vanishing.
2. **Audio Data Augmentation**: Random temporal window slicing (600 frames $\approx 14$s) paired with frequency and time masking (SpecAugment) across the 5,600 training songs.
3. **Cosine Annealing Learning Rate**: AdamW with `CosineAnnealingLR` decaying smoothly over 35 epochs from $10^{-3}$ down to $10^{-5}$.
4. **Gradient Clipping**: Stabilized backpropagation with `clip_grad_norm_ = 1.0`.

---

## 🌐 Endpoints Summary

- **Local Python Gradio App**: `http://127.0.0.1:7860/`
- **Local React Music App**: `http://localhost:5173/`
- **GitHub Repository**: [https://github.com/nidhi832/SONGNET](https://github.com/nidhi832/SONGNET)
