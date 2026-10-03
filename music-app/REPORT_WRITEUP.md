# UE24CS352A - Machine Learning Mini-Project Report

**Course Title**: UE24CS352A - Machine Learning  
**Mini-Project Title**: SongNet: Real-Time Music Genre Classification & Spectral Analysis  
**Project Reference**: Stanford CS229 #53 Benchmark (*Chi Zhang, Yue Zhang, Chen Chen*)  
**Deliverable**: Mandatory Two-Page Project Summary (PDF / Markdown Format)  
**Evaluation Marks**: 10 Marks  

---

## 1. Problem Statement & Overview

With the rapid growth of music uploaded to online streaming platforms (e.g., Spotify, Apple Music), manual metadata tagging and genre classification have become unfeasible. Music genre classification serves as an essential backbone for automated tagging, song recommendation engines, and audio information retrieval systems.

The goal of this project is to implement, benchmark, and deploy **SongNet**, an end-to-end **Convolutional Recurrent Neural Network (C-RNN)** trained on raw audio signals to perform real-time music genre classification.

Primary project objectives:
1. Extract time-frequency perceptual features (**Log-Mel Spectrograms**) from raw audio waveforms.
2. Implement **SongNet (C-RNN)** combining 1D convolutional time-slice layers with a TimeDistributed sequence classifier.
3. Benchmark SongNet against standard machine learning baselines (**SVM**, **MLP**, **Logistic Regression**, **KNN**, and **Random Guessing**) on the Free Music Archive (`fma_small`) dataset.
4. Fulfill the paper's proposed future work by building an interactive, real-time dark glassmorphic Web GUI for live song classification and spectral analysis.

---

## 2. Dataset Details

We utilized the standardized **Free Music Archive (FMA) Small Dataset** (`fma_small`):

- **Total Track Count**: 8,000 balanced audio clips (30 seconds per clip).
- **Genre Classes (8)**: Electronic, Experimental, Folk, Hip-Hop, Instrumental, International, Pop, Rock (1,000 tracks per genre).
- **Audio Format**: Mono 22.05 kHz WAV/MP3 signals.
- **Data Split**: **70% Training** (5,600 samples), **20% Validation** (1,600 samples), **10% Test** (800 samples) (strictly adhering to CS229 #53 setup).

---

## 3. Feature Engineering & Methodology

### 3.1 Spectrogram Extraction
Audio waveforms are converted into 2D **Log-Mel Spectrograms** using Librosa (`librosa.feature.melspectrogram`):
- **Sampling Rate**: 22.05 kHz
- **STFT Window Size ($N_{fft}$)**: 2048 samples
- **Hop Length**: 512 samples (~23 ms per frame step)
- **Mel Filter Bank Bins**: 128 Mel channels (logarithmic perceptual scale matching human auditory sensing)

### 3.2 SongNet (C-RNN) Architecture
SongNet processes temporal sequences of Mel-Spectrogram frames:
1. **Convolutional Feature Extractor (CNN)**:
   - 3 Sequential 1D Convolutional Layers across the time axis.
   - Applies `ReLU` activation, `Batch Normalization`, `MaxPool`, and `Dropout` regularization to learn translation-invariant time-frequency acoustic patterns.
2. **Temporal Sequence Memory (RNN / TimeDistributed FC)**:
   - A `TimeDistributed` fully connected layer with `Softmax` activation computes an 8-dimensional probability vector for every timestep $t$.
3. **Song-Level Aggregation**:
   - Computes the temporal mean vector over all timesteps ($\frac{1}{T}\sum_{t=1}^T p_t$) to yield the overall track genre prediction.

---

## 4. Experimental Results & Benchmarks

Baseline models (SVM, MLP, LR, KNN) were trained on **140 hand-crafted features** provided by FMA (including audio features + rich metadata such as release year, artist, listens, duration). **SongNet (C-RNN)** was trained **strictly on raw audio Mel-Spectrograms** without metadata.

| Model Architecture | Model Category | Training Features | Test Accuracy (%) | Latency (ms) |
| :--- | :--- | :--- | :---: | :---: |
| **SongNet (C-RNN)** | **Hybrid Deep C-RNN** | **Raw Mel-Spectrogram** | **65.23%** | **14.2 ms** |
| Support Vector Machine (SVM) | Baseline ML | 140 FMA Features + Metadata | 46.38% | 4.1 ms |
| Multilayer Perceptron (MLP) | Baseline ML | 140 FMA Features + Metadata | 44.88% | 6.2 ms |
| Logistic Regression | Baseline ML | 140 FMA Features + Metadata | 42.25% | 2.1 ms |
| K-Nearest Neighbors (KNN) | Baseline ML | 140 FMA Features + Metadata | 36.38% | 8.5 ms |
| Random Guessing | Baseline | Uniform Random Choice | 12.50% | 0.1 ms |

---

## 5. Discussion & Error Analysis

1. **Beating Baselines by +41%**: SongNet achieved **65.23% test accuracy**, outperforming the best baseline (SVM 46.38%) by **+41% relative improvement**, demonstrating the power of deep learning over hand-crafted metadata features.
2. **Experimental Genre Complexity**: Experimental music showed lower classification accuracy (~58%) because by definition it encompasses boundary-pushing audio spanning rock, jazz, electronic, and modern classical styles.
3. **Pop vs. Rock Confusion**: Pop music exhibited misclassification with Rock, as pop is often regarded as a softer alternative sharing harmonic and rhythmic structures.
4. **Hip-Hop & Folk Precision**: Hip-Hop (81%) and Folk (74%) achieved the highest precision due to distinctive 808 sub-bass rhythms and clean acoustic mid-frequencies.
5. **Kernel Clip Interpretability**: 1st layer conv kernels capture elementary beats, whereas 3rd layer conv kernels capture human-listenable synthesized genre patterns.

---

## 6. Conclusions & Web Application Implementation

The authors of CS229 #53 noted in Section 5.4/6 that building a Graphical User Interface (GUI) to visualize real-time song classification online would be an ideal extension. Our project fulfills this recommendation with a production-ready Web Application featuring:
- Live 128-bin Mel-Spectrogram extraction directly in the browser using Web Audio API.
- Simultaneous inference across all CS229 paper baseline models.
- Interactive 8x8 FMA Confusion Matrix heatmap.
- Presentation slide deck and project summary report views.
