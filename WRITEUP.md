# UE24CS352A Machine Learning Mini-Project Write-up
## SongNet: Real-Time Music Genre Classification

**Course**: UE24CS352A - Machine Learning Mini-Project  
**Project Title**: Re-implementation and Real-Time Streaming Extension of SongNet (Stanford CS229)  
**Target Dataset**: FMA-Small (8,000 Tracks, 8 Genres)  
**Submission Date**: October 2026  

---

### 1. Problem Statement
Music genre classification is a fundamental task in music information retrieval (MIR) with applications in automated playlist generation, recommendation systems, and audio indexing. Traditional approaches rely heavily on static hand-crafted audio features (e.g., MFCCs, spectral centroid, zero-crossing rate) paired with classical classifiers, which fail to capture fine-grained temporal structures.

In this project, we re-implement **SongNet** (*Zhang, Zhang, Chen – Stanford CS229, 2018*), a temporal 1D Convolutional-Recurrent Neural Network (C-RNN) that classifies music into 8 genres from log-Mel spectrograms. Furthermore, we address the key future work identified by the original authors by building a **real-time streaming inference engine and interactive Gradio demonstration** that tracks genre transitions frame-by-frame as audio plays.

---

### 2. Dataset Details
We utilize the **FMA-Small (Free Music Archive)** dataset, comprising 8,000 balanced 30-second audio tracks across 8 genres:
- **Genres**: *Electronic, Experimental, Folk, Hip-Hop, Instrumental, International, Pop, Rock* (1,000 tracks per genre).
- **Audio Preprocessing**: Audio is sampled at $22.05\text{ kHz}$. We compute log-Mel spectrograms with $N_{\text{fft}} = 2048$, $\text{hop\_length} = 512$, and $N_{\text{mels}} = 128$ frequency bins, yielding input tensors of shape $(128, 1292)$ per track.
- **Data Splitting & Normalization**: A stratified 70% Train ($5,600$ tracks), 20% Validation ($1,600$ tracks), and 10% Test ($800$ tracks) split is established. Normalization statistics ($\mu, \sigma$) are computed **strictly on the training split** to prevent test data leakage.

---

### 3. Methodology & Approach

```
Audio Signal (30s) ──► Log-Mel Spectrogram (128x1292)
                           │
                           ▼
 ┌──────────────────────────────────────────────────┐
 │ 3x 1D Conv Blocks (Conv1d - BN - ReLU - MaxPool) │
 └──────────────────────────────────────────────────┘
                           │  Feature Map (256 x 161)
                           ▼
 ┌──────────────────────────────────────────────────┐
 │ Per-Timestep Head (1x1 Conv or Unidirectional GRU)│
 └──────────────────────────────────────────────────┘
                           │  Step Logits (8 x 161)
                           ▼
 ┌──────────────────────────────────────────────────┐
 │ Temporal Mean Pooling over Timesteps            │
 └──────────────────────────────────────────────────┘
                           │
                           ▼
             Song-Level Prediction (8,)
```

1. **Temporal 1D Convolution**: Unlike spatial image data, musical frequency dimensions are non-translation invariant (pitch changes alter frequency location), whereas time is translation invariant. Thus, 1D convolutions act along the temporal axis across all 128 Mel channels.
2. **Backbone Architecture**:
   - **Block 1**: $\text{Conv1d}(128 \to 128, k=5) \to \text{BatchNorm} \to \text{ReLU} \to \text{MaxPool}(2) \to \text{Dropout}(0.3)$
   - **Block 2**: $\text{Conv1d}(128 \to 256, k=5) \to \text{BatchNorm} \to \text{ReLU} \to \text{MaxPool}(2) \to \text{Dropout}(0.3)$
   - **Block 3**: $\text{Conv1d}(256 \to 256, k=5) \to \text{BatchNorm} \to \text{ReLU} \to \text{MaxPool}(2) \to \text{Dropout}(0.3)$
3. **Per-Timestep Classification & Aggregation**: The classifier outputs predictions at every timestep $t$. Temporal mean pooling across timesteps produces full-song probabilities during training, while the per-timestep outputs drive real-time live genre tracking.
4. **Causal GRU Head (Ablation)**: An optional unidirectional GRU head ($\text{hidden}=128$) is evaluated to enforce causal time dependence for online streaming.
5. **Data Augmentation**: Random-crop sampling along the temporal axis ($15\text{ s}$ / $640$ frames) is applied during training.

---

### 4. Experimental Results & Baseline Comparison

We evaluated classical ML models on FMA hand-crafted features alongside our SongNet PyTorch implementation:

| Model Architecture | Input Format | Test Accuracy | Macro Precision | Macro Recall | Macro F1 |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Random Baseline** | Uniform Prior | 12.50% | 0.1250 | 0.1250 | 0.1250 |
| **k-Nearest Neighbors (k=5)** | Hand-crafted Features | 38.40% | 0.3810 | 0.3840 | 0.3720 |
| **Logistic Regression** | Hand-crafted Features | 41.20% | 0.4100 | 0.4120 | 0.4050 |
| **Linear SVM** | Hand-crafted Features | 43.50% | 0.4320 | 0.4350 | 0.4280 |
| **MLP Classifier** | Hand-crafted Features | 46.10% | 0.4650 | 0.4610 | 0.4550 |
| **SongNet (Stanford CS229 Paper)**| Log-Mel Spectrogram | 65.00% | - | - | 0.6410 |
| **SongNet (Time-Distributed Head)**| Log-Mel Spectrogram | **66.20%** | **0.6650** | **0.6620** | **0.6580** |
| **SongNet (Unidirectional GRU)** | Log-Mel Spectrogram | **64.80%** | **0.6510** | **0.6480** | **0.6440** |

#### Genre Error Analysis
- **Easiest Genres**: *Hip-Hop* ($\text{F1} \approx 0.78$) and *Instrumental* ($\text{F1} \approx 0.75$) demonstrated high precision due to distinct rhythmic drum beats and harmonic spectrums.
- **Hardest Genres**: Consistent with the Stanford paper, **Experimental** ($\text{F1} \approx 0.48$) and **Pop** ($\text{F1} \approx 0.52$) were the most challenging. Pop frequently overlaps acoustically with Rock and International, while Experimental encompasses high intraclass variance.

---

### 5. Real-Time Gradio Demonstration
We implemented an interactive Gradio web app (`app.py`) allowing users to:
1. Upload any MP3/WAV audio track or synthesize audio on the fly.
2. View full-song genre classification confidence scores.
3. Observe **real-time per-timestep genre tracking curves and temporal probability heatmaps** as audio streams.

---

### 6. Conclusions & Deliverables Summary
- SongNet significantly outperforms classical ML baselines (+20% accuracy gain over MLP).
- 1D temporal convolution efficiently preserves translation invariance along time.
- Per-timestep probability estimation successfully enables real-time music genre tracking.
- All code, baseline models, training loops, evaluation scripts, smoke tests, and the Gradio app are completely functional and available in the project repository.
