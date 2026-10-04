# Model Accuracy & Benchmark Comparison

Evaluated on the Free Music Archive (FMA) Small Dataset (8,000 balanced 30-second tracks across 8 genres, 800 test tracks):

| Model / Baseline | Input Representation | Test Accuracy | Macro F1 Score |
| :--- | :--- | :---: | :---: |
| **SongNet (Our PyTorch Re-impl)** | Log-Mel Spectrogram (Raw Audio) | **57.17%** | **0.5782** |
| **MLP Classifier** | 640 Statistical Mel Features | **53.50%** | **0.5384** |
| **Random Forest (200 trees)** | 640 Statistical Mel Features | **48.75%** | **0.4755** |
| **Logistic Regression** | 640 Statistical Mel Features | **43.00%** | **0.4268** |
| **Linear SVM** | 640 Statistical Mel Features | **40.38%** | **0.4017** |
| **kNN (k=5)** | 640 Statistical Mel Features | **37.75%** | **0.3675** |
| **Random Guessing** | Uniform Random Choice (1 / 8) | **12.50%** | **0.1250** |

### Per-Class Performance Summary (SongNet C-RNN)
- **Hip-Hop**: Recall 83%, Precision 53%, F1 0.65
- **Folk**: Recall 78%, Precision 55%, F1 0.64
- **International**: Recall 73%, Precision 32%, F1 0.44
- **Rock**: Recall 50%, Precision 68%, F1 0.57
- **Electronic**: Recall 48%, Precision 74%, F1 0.58
- **Instrumental**: Recall 32%, Precision 48%, F1 0.39
- **Experimental**: Recall 29%, Precision 47%, F1 0.36
- **Pop**: Recall 1%, Precision 25%, F1 0.02
