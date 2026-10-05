# Model Accuracy & Benchmark Comparison

Evaluated on the Free Music Archive (FMA) Small Dataset (8,000 balanced 30-second tracks across 8 genres, 800 test tracks):

| Model / Baseline | Input Representation | Test Accuracy | Macro F1 Score |
| :--- | :--- | :---: | :---: |
| **SongNet (Our PyTorch Re-impl)** | Log-Mel Spectrogram (Raw Audio) | **56.12%** | **0.5400** |
| **MLP Classifier** | 640 Statistical Mel Features | **53.50%** | **0.5384** |
| **Random Forest (200 trees)** | 640 Statistical Mel Features | **48.75%** | **0.4755** |
| **Logistic Regression** | 640 Statistical Mel Features | **43.00%** | **0.4268** |
| **Linear SVM** | 640 Statistical Mel Features | **40.38%** | **0.4017** |
| **kNN (k=5)** | 640 Statistical Mel Features | **37.75%** | **0.3675** |
| **Random Guessing** | Uniform Random Choice (1 / 8) | **12.50%** | **0.1250** |

### Per-Class Performance Summary (SongNet C-RNN - Test Acc: 56.12%)
- **Rock**: Recall 77% (77/100 correct)
- **Hip-Hop**: Recall 75% (75/100 correct)
- **Folk**: Recall 74% (74/100 correct)
- **International**: Recall 71% (71/100 correct)
- **Electronic**: Recall 56% (56/100 correct)
- **Instrumental**: Recall 50% (50/100 correct)
- **Experimental**: Recall 37% (37/100 correct)
- **Pop**: Recall 9% (9/100 correct)
