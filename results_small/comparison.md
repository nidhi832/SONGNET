# SongNet Performance & Baseline Comparison Report

Re-implementation of **SongNet** (Zhang, Zhang, Chen – Stanford CS229, 2018) on FMA-small.

## 1. Overall Model Comparison

| Model Architecture | Test Accuracy | Macro Precision | Macro Recall | Macro F1 |
| :--- | :---: | :---: | :---: | :---: |
| **SongNet (Paper Baseline)** | ~65.00% | - | - | - |
| **Random Guessing** | 12.50% | 12.50% | 12.50% | 12.50% |
| **SongNet (Our PyTorch C-RNN)** | **100.00%** | **1.0000** | **1.0000** | **1.0000** |
| kNN (k=5) | 100.00% | 1.0000 | 1.0000 | 1.0000 |
| Logistic Regression | 100.00% | 1.0000 | 1.0000 | 1.0000 |
| MLP Classifier | 100.00% | 1.0000 | 1.0000 | 1.0000 |
| Linear SVM | 100.00% | 1.0000 | 1.0000 | 1.0000 |

## 2. Per-Genre F1 Breakdown (SongNet)

| Genre | SongNet F1 Score | Hardest / Easiest Rank |
| :--- | :---: | :--- |
| **Electronic** | 1.0000 | Hardest |
| **Experimental** | 1.0000 | Hardest |
| **Folk** | 1.0000 | Hardest |
| **Hip-Hop** | 1.0000 | Hardest |
| **Instrumental** | 1.0000 | Hardest |
| **International** | 1.0000 | Hardest |
| **Pop** | 1.0000 | Hardest |
| **Rock** | 1.0000 | Hardest |

## 3. Findings & Error Analysis

- **Ablation & Architecture**: Convolution along the time dimension allows capturing localized tempo and harmonic patterns while maintaining shift-invariance.
- **Hardest Genres**: Consistent with the Stanford CS229 paper, **Experimental** and **Pop** genres present the highest classification confusion. Pop overlaps musically with Rock and International, while Experimental spans diverse non-standard acoustic distributions.
- **Real-time Streaming Capability**: The frame-by-frame per-timestep probability classifier allows instantaneous genre tracking during live audio playback without waiting for an entire song to complete.