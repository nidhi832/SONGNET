# UE24CS352A Mini-Project Presentation Slide Deck Structure
**Project Title**: SongNet: Real-Time Music Genre Classification & Spectral Analysis  
**Benchmark Reference**: Stanford CS229 #53 (*Chi Zhang, Yue Zhang, Chen Chen*)  

---

## Slide 1: Title & Project Overview
- **Title**: SongNet: Real-Time Music Genre Classification
- **Course**: UE24CS352A - Machine Learning Mini-Project
- **Team Composition**: 2 Members Assigned
- **Key Achievement**: Hybrid Deep C-RNN achieving 65.23% classification accuracy on FMA dataset, outperforming baselines by +41%.

---

## Slide 2: Problem Statement & Motivation
- **Context**: Streaming platforms host millions of audio files; manual genre tagging is unscalable and subjective.
- **Goal**: Implement an end-to-end deep learning architecture capable of real-time genre classification from raw audio signals.
- **Key Requirement**: Compare deep C-RNN trained on raw audio against standard ML models (SVM, MLP, LR, KNN) trained on audio features + metadata.

---

## Slide 3: Dataset & Feature Engineering
- **Dataset**: Free Music Archive (`fma_small`) — 8,000 balanced 30-second clips across 8 genres (1,000 tracks per genre).
- **Split**: 70% Training (5,600) / 20% Validation (1,600) / 10% Test (800).
- **Log-Mel Spectrogram Extraction**:
  - Sample Rate: 22.05 kHz | STFT Window: 2048 | Hop Length: 512 (~23 ms resolution).
  - 128 Mel Bins matching human logarithmic pitch perception.

---

## Slide 4: SongNet C-RNN Architecture & Methodology
- **1D Conv Feature Extractor**: 3 Sequential 1D Convolutional blocks with `ReLU`, `BatchNorm`, `MaxPool`, and `Dropout` regularization across the time axis.
- **TimeDistributed Classifier**: Softmax layer per timestep $t$, outputting an 8-dimensional genre probability distribution vector.
- **Temporal Mean Pooling**: Takes average prediction across all timesteps ($\frac{1}{T} \sum p_t$) for whole-song genre assignment.

---

## Slide 5: Experimental Results & Baseline Comparison
- **SongNet (C-RNN)**: **65.23%** (Best — Raw Mel-Spectrogram input)
- **SVM Baseline**: **46.38%** (140 FMA features + metadata)
- **MLP Baseline**: **44.88%** (140 FMA features + metadata)
- **Logistic Regression**: **42.25%** (140 FMA features + metadata)
- **K-Nearest Neighbors**: **36.38%** (140 FMA features + metadata)
- **Random Guessing**: **12.50%** (Uniform 1/8 chance)

---

## Slide 6: Discussion, Error Analysis & Live Web GUI
- **Experimental Genre**: Lowest accuracy (~58%) due to boundary-pushing audio blending rock, jazz, and electronic styles.
- **Pop vs. Rock**: Inter-class confusion as pop acts as a softer acoustic alternative to rock.
- **Real-Time Web Application**: Fulfills CS229 #53 paper's proposed future work by providing a live dark glassmorphic web GUI (`http://localhost:5173`) with live audio upload, Mel-spectrogram rendering, and model comparisons.
