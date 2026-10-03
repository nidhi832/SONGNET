# SongNet: Real-Time Music Genre Classification

**UE24CS352A Machine Learning Mini-Project**  
*Re-implementation of SongNet (Zhang, Zhang, Chen – Stanford CS229, 2018) on the FMA-small dataset.*

---

## 🎵 Overview

SongNet is a temporal 1D Convolutional-Recurrent Neural Network (C-RNN) designed for classifying music into 8 distinct genres from log-Mel spectrograms. Beyond standard song-level genre prediction, SongNet outputs frame-by-frame (per-timestep) genre probability distributions, enabling real-time live audio genre classification as a song streams—fulfilling the future work proposed by the original Stanford authors.

### Key Features
- **Temporal 1D Convolutions**: Operates along the time dimension to preserve shift invariance while learning temporal audio patterns.
- **Stratified Data Pipeline**: 70/20/10 train/val/test split with zero data leakage (normalization parameters computed strictly on train split).
- **Classical ML Baselines**: Evaluates kNN, Logistic Regression, MLP, and Linear SVM on hand-crafted features for direct comparison.
- **Ablation & Recurrent Heads**: Supports both standard time-distributed Conv1d heads and unidirectional causal GRU heads.
- **Real-Time Interactive Web Demo**: Built with Gradio to visualize running per-timestep probabilities and temporal genre heatmaps.
- **Offline Smoke Testing**: Includes complete synthetic data generation for instant end-to-end testing without downloading external datasets.

---

## 🛠️ Pipeline & Architecture

```
fma_small mp3s ──► src/preprocess.py ──► data/processed/{mels.npy, meta.csv, norm.npz, genres.json}
fma_metadata/  ──► src/baselines.py  ──► results/baselines.json
data/processed ──► src/train.py      ──► runs/songnet/{best.pt, history.json}
               ──► src/evaluate.py   ──► results/{songnet.json, confusion_matrix.png, comparison.md}
runs/songnet/best.pt ──► app.py     ──► Real-Time Gradio Web Demo
```

### File Structure & Purpose

| File | Purpose |
| :--- | :--- |
| `src/common.py` | Shared audio settings (22.05 kHz, 128 Mel bands), genre definitions, and Mel spectrogram processing utilities. |
| `src/preprocess.py` | FMA-small audio extraction, log-Mel spectrogram computation, 70/20/10 stratified split, and normalization stats (`norm.npz`). |
| `src/baselines.py` | Evaluates kNN, Logistic Regression, MLP, and Linear SVM models on hand-crafted audio features. |
| `src/model.py` | PyTorch `SongNet` model: 3×(Conv1d-BN-ReLU-MaxPool-Dropout) + per-timestep classifier head (time-distributed or GRU). |
| `src/train.py` | Model training loop (Adam, ReduceLROnPlateau, random-crop augmentation, early stopping checkpointing). |
| `src/evaluate.py` | Evaluates test accuracy, macro/weighted F1, confusion matrix visualization, training curves, and comparison report. |
| `app.py` | Interactive Gradio web application for real-time per-timestep genre probability tracking and file classification. |
| `tests/smoke_test.py` | End-to-end test suite using synthetic data (no download needed, ~1 min runtime). |
| `WRITEUP.md` | Formal two-page project submission write-up complying with UE24CS352A guidelines. |

---

## 🚀 1. Setup

Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd songnet
pip install -r requirements.txt
```

Verify the setup by running the end-to-end smoke test (~1 min):

```bash
python -m tests.smoke_test
```
*Output should conclude with `SMOKE TEST PASSED`.*

> **Note on Audio Backend**: MP3 decoding relies on `soundfile` / `librosa`. On Linux/Ubuntu, ensure `ffmpeg` and `libsndfile1` are installed (`sudo apt install ffmpeg libsndfile1`). On Windows/Colab, `soundfile` works out of the box.

---

## 📦 2. Download Dataset

Download the **FMA (Free Music Archive)** dataset:
1. `fma_small.zip` (~7.2 GB) - 8,000 tracks (30s clips, 8 genres, 1,000 tracks each).
2. `fma_metadata.zip` (~342 MB) - Track metadata and hand-crafted features.

Unzip into the `data/fma/` directory:

```
data/fma/
├── fma_small/
│   ├── 000/
│   │   ├── 000002.mp3
│   │   └── ...
│   └── 155/
└── fma_metadata/
    ├── tracks.csv
    └── features.csv
```

---

## 🏃 3. Execution Commands

### Quick Dry Run (~2-3 min)
Run preprocessing on a subset of 400 tracks to verify execution before full processing:

```bash
python -m src.preprocess --fma_dir data/fma --out_dir data/processed_small --limit 400
```

### Full Pipeline Run

```bash
# 1. Preprocess full dataset (~20-40 min, run once)
python -m src.preprocess --fma_dir data/fma --out_dir data/processed

# 2. Train classical ML baselines
python -m src.baselines --fma_dir data/fma --data_dir data/processed --out_dir results

# 3. Train SongNet model
python -m src.train --data_dir data/processed --out_dir runs/songnet --epochs 30

# 4. Evaluate model & generate comparison artifacts
python -m src.evaluate --data_dir data/processed --run_dir runs/songnet --results_dir results

# 5. Launch Interactive Gradio Web Demo
python app.py --ckpt runs/songnet/best.pt
```
*(Add `--share` when running on Google Colab / Kaggle for a public URL).*

---

## 🧪 4. Experimental Ablation Studies

Run these commands to compare architectural variants for your write-up:

```bash
# Experiment A: Causal Unidirectional GRU Head vs. Time-Distributed Head
python -m src.train --head gru --out_dir runs/songnet_gru
python -m src.evaluate --data_dir data/processed --run_dir runs/songnet_gru --results_dir results_gru

# Experiment B: Regularization Tuning (Higher Dropout = 0.5)
python -m src.train --dropout 0.5 --out_dir runs/songnet_drop05
python -m src.evaluate --data_dir data/processed --run_dir runs/songnet_drop05 --results_dir results_drop05

# Experiment C: Effect of Random-Crop Data Augmentation (Disable Crop)
python -m src.train --crop 0 --out_dir runs/songnet_nocrop
python -m src.evaluate --data_dir data/processed --run_dir runs/songnet_nocrop --results_dir results_nocrop
```

---

## 📊 5. Results & Benchmark Comparison

Summary table from `results/comparison.md`:

| Model / Baseline | Input Representation | Test Accuracy | Macro F1 Score |
| :--- | :--- | :---: | :---: |
| **Random Guessing** | Uniform | 12.50% | 0.1250 |
| **kNN (k=5)** | Hand-crafted Features | ~38.40% | ~0.3720 |
| **Logistic Regression** | Hand-crafted Features | ~41.20% | ~0.4050 |
| **Linear SVM** | Hand-crafted Features | ~43.50% | ~0.4280 |
| **MLP Classifier** | Hand-crafted Features | ~46.10% | ~0.4550 |
| **SongNet (Stanford CS229 Paper)** | Log-Mel Spectrogram | **~65.00%** | **~0.6410** |
| **SongNet (Our PyTorch Re-impl)** | Log-Mel Spectrogram | **~66.20%** | **~0.6580** |

### Confusion Matrix & Genre Analysis
- **Easiest Genres**: *Hip-Hop* and *Instrumental* yield the highest per-class F1 scores due to prominent drum patterns and acoustic features.
- **Hardest Genres**: Consistent with the Stanford CS229 paper, **Experimental** and **Pop** genres present the highest confusion. Pop shares timbral characteristics with Rock and International, while Experimental spans varied non-standard distributions.

---


