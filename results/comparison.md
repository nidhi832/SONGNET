# SongNet Performance & Baseline Comparison Report

Re-implementation of **SongNet** (Zhang, Zhang, Chen – Stanford CS229, 2018) on FMA-small.

## 1. Overall Model Comparison

| Model Architecture | Test Accuracy | Macro Precision | Macro Recall | Macro F1 |
| :--- | :---: | :---: | :---: | :---: |
| **SongNet (Paper Baseline)** | ~65.00% | - | - | - |
| **Random Guessing** | 12.50% | 12.50% | 12.50% | 12.50% |
| **SongNet (Our PyTorch C-RNN)** | **59.75%** | **0.5923** | **0.5975** | **0.5897** |
| kNN (k=5) | 46.37% | 0.4727 | 0.4637 | 0.4486 |
| Logistic Regression | 56.13% | 0.5617 | 0.5613 | 0.5605 |
| MLP Classifier | 54.50% | 0.5433 | 0.5450 | 0.5434 |
| Linear SVM | 50.88% | 0.5191 | 0.5087 | 0.5105 |
| Random Forest | 55.37% | 0.5466 | 0.5537 | 0.5467 |

## 2. Per-Genre F1 Breakdown (SongNet)

| Genre | SongNet F1 Score | Hardest / Easiest Rank |
| :--- | :---: | :--- |
| **Pop** | 0.3373 | Hardest |
| **Experimental** | 0.4413 | - |
| **Instrumental** | 0.4556 | - |
| **Electronic** | 0.6564 | - |
| **Folk** | 0.6611 | - |
| **International** | 0.6766 | - |
| **Rock** | 0.7053 | - |
| **Hip-Hop** | 0.7839 | Easiest |

## 3. Findings & Error Analysis

- **Ablation & Architecture**: Convolution along the time dimension allows capturing localized tempo and harmonic patterns while maintaining shift-invariance.
- **Hardest Genres**: Consistent with the Stanford CS229 paper, **Experimental** and **Pop** genres present the highest classification confusion. Pop overlaps musically with Rock and International, while Experimental spans diverse non-standard acoustic distributions.
- **Real-time Streaming Capability**: The frame-by-frame per-timestep probability classifier allows instantaneous genre tracking during live audio playback without waiting for an entire song to complete.