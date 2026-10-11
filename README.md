# SongNet: Time-Resolved Music Genre Classification

[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C.svg?style=flat&logo=pytorch)](https://pytorch.org/)
[![Gradio](https://img.shields.io/badge/Gradio-Demo-orange.svg)](#demo)
[![Accuracy](https://img.shields.io/badge/SongNet_GRU_Test_Accuracy-59.75%25-brightgreen.svg)](#results)
[![Dataset](https://img.shields.io/badge/Dataset-FMA--Small-blue.svg)](https://github.com/mdeff/fma)

---

## Overview

**SongNet** is a temporal 1D convolutional-recurrent network (CRNN) that classifies music into 8 genres from 128-bin log-Mel spectrograms. It is a re-implementation of *SongNet: Real-time Music Classification* (Zhang, Zhang, Chen, Stanford CS229). The model outputs a genre probability at every time step, and the song-level prediction is the mean over time. These per-timestep outputs let us visualise how genre confidence changes across a clip, and provide a foundation for real-time genre tracking. Streaming latency has not been benchmarked.

On the 800-track test set, the **GRU / CRNN variant reaches 59.75% accuracy (macro F1 0.5897)**, ahead of the best classical baseline (Logistic Regression, 56.12%).

---

## Results

Test set: 800 tracks, 100 per genre. All numbers come from a single run on one stratified split.

| Model | Test accuracy | Macro F1 |
| :--- | :---: | :---: |
| **SongNet, GRU / CRNN** | **59.75%** | **0.5897** |
| SongNet, Time-Distributed head | 56.25% | 0.5561 |
| Logistic Regression | 56.12% | 0.5605 |
| Random Forest | 55.38% | 0.5467 |
| MLP Classifier | 54.50% | 0.5434 |
| Linear SVM | 50.88% | 0.5105 |
| kNN (k=5) | 46.38% | 0.4486 |

- GRU / CRNN improves test accuracy by **3.63 percentage points** over Logistic Regression (macro F1 +0.0292). The GRU weighted F1 is also 0.5897.
- Random guessing over 8 equally likely classes has an expected accuracy of 12.5%.
- The five classical baselines use the handcrafted features provided with FMA (`data/fma/fma_metadata/features.csv`). They are fitted on train + validation, whereas SongNet trains on the training split only.

### GRU / CRNN per-genre test metrics

| Genre | Precision | Recall | F1 |
| :--- | :---: | :---: | :---: |
| Electronic | 0.67 | 0.64 | 0.66 |
| Experimental | 0.42 | 0.47 | 0.44 |
| Folk | 0.57 | 0.79 | 0.66 |
| **Hip-Hop** | 0.79 | 0.78 | **0.78** |
| Instrumental | 0.51 | 0.41 | 0.46 |
| International | 0.67 | 0.68 | 0.68 |
| **Pop** | 0.42 | 0.28 | **0.34** |
| Rock | 0.68 | 0.73 | 0.71 |

Hip-Hop is the strongest class by F1 and Pop is the weakest. The confusion matrix is produced by `src/evaluate.py` (for example `results/gru/confusion_matrix.png`).

---

## Dataset

[FMA-Small](https://github.com/mdeff/fma) contains 8,000 balanced 30-second tracks (1,000 per genre): Electronic, Experimental, Folk, Hip-Hop, Instrumental, International, Pop and Rock.

- During preprocessing, three corrupt MP3 files were skipped, so **7,997 tracks** were used.
- Audio is resampled to 22.05 kHz and converted to log-Mel spectrograms (128 Mel bins, FFT size 2048, hop length 512), giving a **128 x 1292** input per track.
- Stratified 70/20/10 split: **5,597 train, 1,600 validation, 800 test**.
- Normalisation statistics are computed on the training split only.

---

## Model

Both variants share one backbone and differ only in the classification head.

**Shared backbone.** Three temporal Conv1D blocks (the 128 Mel bins are the input channels; convolution runs along time only), with channels 128 → 128 → 256 → 256 and kernel size 5. Each block is Conv1d → BatchNorm → ReLU → MaxPool(2) → Dropout(0.3). The 1292 input frames become a 256 x 161 feature map.

| Variant | Head | Recurrence |
| :--- | :--- | :---: |
| **Time-Distributed** (`--head time_distributed`) | 1x1 Conv1d classifier applied at each of the 161 time steps | No |
| **GRU / CRNN** (`--head gru`) | Unidirectional GRU (hidden size 128) followed by a linear classifier at each step | Yes |

CRNN stands for Convolutional Recurrent Neural Network. Per-step softmax probabilities are averaged over time to give the song-level prediction. At test time, the full-length (1292-frame) spectrograms are used.

---

## Training

Settings of `src/train.py`, as used for the measured Time-Distributed run:

```bash
python -m src.train --data_dir data/processed --out_dir runs/songnet_full --epochs 20
```

| Setting | Value |
| :--- | :--- |
| Optimiser | Adam, learning rate 1e-3, weight decay 1e-4 |
| Scheduler | ReduceLROnPlateau (factor 0.5, patience 3) on validation loss |
| Loss | Negative log-likelihood of the log mean-pooled step probabilities |
| Batch size / dropout | 32 / 0.3 |
| Augmentation | Random 640-frame (about 14.9 s) crop during training |
| Epochs | 20 (Time-Distributed run) |
| Seed | 42 |
| Checkpoint | `best.pt` is saved whenever validation loss or validation accuracy improves |

The Time-Distributed run reached a best validation accuracy of 55.75% and a lowest validation loss of 1.2900. The GRU variant was trained using the same script with `--head gru`,
using the training split and evaluating on the held-out test split.
Its test result is reported in the table above.
---

## Reproducing the Pipeline

```bash
pip install -r requirements.txt

# 1. Spectrograms, split, normalisation statistics (expects FMA under data/fma)
python -m src.preprocess --fma_dir data/fma --out_dir data/processed

# 2. Classical baselines (loads data/fma/fma_metadata/features.csv)
python -m src.baselines --fma_dir data/fma --data_dir data/processed --out_dir results

# 3. Train a SongNet variant
python -m src.train --data_dir data/processed --out_dir runs/songnet_full --epochs 20
python -m src.train --data_dir data/processed --out_dir runs/songnet_gru --head gru

# 4. Evaluate on the test set
python -m src.evaluate --data_dir data/processed --run_dir runs/songnet_gru --results_dir results/gru

# Quick end-to-end check on synthetic data (about 1 minute)
python -m tests.smoke_test
```

---

## Demo

### Gradio app (`app.py`)

```bash
python app.py        # http://127.0.0.1:7860 by default; use --port to change
```

- Upload an audio file or record from the microphone.
- Shows per-timestep genre probability curves, a temporal heatmap and song-level genre probabilities.
- Supports the Time-Distributed and GRU heads, plus a spectrogram view and a model-comparison tab.
- Includes a per-genre synthetic audio generator for quick testing.

The app searches for Time-Distributed checkpoints in
`models/best.pt`, `models/best (1).pt`, `runs/songnet/best.pt`
and `runs/songnet_small/best.pt`.

For the GRU model, it searches `models/best_gru.pt` and
`runs/songnet_gru/best.pt`. The required checkpoint and
preprocessing normalization file must be available for trained-model inference.

### React front end (`music-app/`)

```bash
cd music-app && npm install && npm run dev      # http://localhost:5173
```

A separate UI prototype with a Web Audio spectrogram visualiser, music search and an AI assistant. Its in-browser genre scores come from a heuristic engine, **not** from the trained PyTorch models, so use `app.py` to demonstrate the real model.

---

## Repository Structure

| Path | Description |
| :--- | :--- |
| `src/preprocess.py` | Log-Mel extraction, stratified 70/20/10 split, normalisation statistics |
| `src/baselines.py` | kNN, Logistic Regression, MLP, Linear SVM, Random Forest on FMA features |
| `src/model.py` | `SongNet`: 3 x Conv1D backbone with Time-Distributed or GRU head |
| `src/train.py` | Training loop (Adam, ReduceLROnPlateau, random crops, checkpointing) |
| `src/evaluate.py` | Test metrics, confusion matrix, training curves, comparison report |
| `src/common.py` | Audio constants and spectrogram utilities |
| `app.py` | Gradio demo |
| `music-app/` | React + Vite UI prototype |
| `tests/smoke_test.py` | Synthetic end-to-end smoke test |
| `kaggle_songnet.ipynb` | Earlier exploratory notebook (see note below) |
| `models/`, `results/`, `results_small/` | Saved artifacts from earlier runs; regenerate with the commands above |

### Note on the Kaggle notebook

`kaggle_songnet.ipynb` records an earlier, separate experiment. It used AdamW with cosine annealing over 35 epochs, label smoothing, gradient clipping and SpecAugment, and baselines on 640 statistical Mel features. It reported 56.12% test accuracy. Those settings and numbers do **not** describe the results above, which come from the `src/` pipeline.

---

## Reference

C. Zhang, Y. Zhang and C. Chen, "SongNet: Real-time Music Classification," Stanford University, CS229 course project report, 2018.
M. Defferrard, K. Benzi, P. Vandergheynst and X. Bresson, "FMA: A Dataset for Music Analysis," ISMIR, 2017.

Repository: <https://github.com/nidhi832/SONGNET>
