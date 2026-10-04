"""
Classical ML Baselines for Music Genre Classification.
Evaluates kNN, Logistic Regression, MLP, Linear SVM, and Random Forest on hand-crafted features.
"""

import os
import json
import argparse
import numpy as np
import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.svm import LinearSVC, SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report

from src.common import GENRES, GENRE_TO_IDX, IDX_TO_GENRE


def load_fma_features(fma_dir, df_meta):
    """
    Attempt to load hand-crafted features from FMA fma_metadata/features.csv.
    """
    features_path = os.path.join(fma_dir, "fma_metadata", "features.csv")
    if not os.path.exists(features_path):
        return None, None
        
    print(f"Loading FMA hand-crafted features from {features_path}...")
    try:
        # FMA features.csv has multi-level columns
        df_feat = pd.read_csv(features_path, index_col=0, header=[0, 1, 2])
        
        # Match track IDs from df_meta
        track_ids = [int(tid.replace('syn_', '')) if 'syn_' in tid else int(tid) for tid in df_meta['track_id']]
        common_ids = [tid for tid in track_ids if tid in df_feat.index]
        
        if len(common_ids) < 0.5 * len(df_meta):
            print("Not enough matching track IDs in features.csv.")
            return None, None
            
        matched_feat = df_feat.loc[common_ids]
        X = matched_feat.values
        return X, common_ids
    except Exception as e:
        print(f"Could not parse features.csv: {e}")
        return None, None


def extract_features_from_mels(mels):
    """
    Extract baseline summary features (mean, std, min, max, skew) from log-Mel spectrograms.
    Shape input: (N, 128, T) -> Output: (N, 128 * 4 + extra)
    """
    N, n_mels, T = mels.shape
    features = []
    
    for i in range(N):
        mel = mels[i]  # Shape: (128, T)
        mean_feat = np.mean(mel, axis=1)
        std_feat = np.std(mel, axis=1)
        max_feat = np.max(mel, axis=1)
        min_feat = np.min(mel, axis=1)
        
        # Spectral summary features
        feat_vector = np.concatenate([mean_feat, std_feat, max_feat, min_feat])
        features.append(feat_vector)
        
    return np.array(features, dtype=np.float32)


def main():
    parser = argparse.ArgumentParser(description="Evaluate classical ML baselines on FMA dataset.")
    parser.add_argument("--fma_dir", type=str, default="data/fma", help="Path to FMA metadata directory.")
    parser.add_argument("--data_dir", type=str, default="data/processed", help="Path to preprocessed data directory.")
    parser.add_argument("--out_dir", type=str, default="results", help="Directory to save baselines evaluation JSON.")
    parser.add_argument("--seed", type=int, default=42, help="Random seed.")
    args = parser.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)
    
    # Load metadata and cached mels
    meta_path = os.path.join(args.data_dir, "meta.csv")
    mels_path = os.path.join(args.data_dir, "mels.npy")
    
    if not os.path.exists(meta_path) or not os.path.exists(mels_path):
        raise FileNotFoundError(f"Missing meta.csv or mels.npy in '{args.data_dir}'. Run preprocess.py first!")

    df_meta = pd.read_csv(meta_path)
    mels = np.load(mels_path)
    
    train_mask = (df_meta['split'] == 'train').values
    val_mask = (df_meta['split'] == 'val').values
    test_mask = (df_meta['split'] == 'test').values
    
    y = df_meta['genre_idx'].values
    
    # Try loading official FMA features or extract summary features from spectrograms
    X, _ = load_fma_features(args.fma_dir, df_meta)
    if X is None:
        print("Extracting hand-crafted statistical features from Mel spectrograms...")
        X = extract_features_from_mels(mels)

    X_train, y_train = X[train_mask], y[train_mask]
    X_val, y_val = X[val_mask], y[val_mask]
    X_test, y_test = X[test_mask], y[test_mask]

    # Combine train + val for standard baseline training if desired, or fit on train
    X_train_full = np.vstack([X_train, X_val])
    y_train_full = np.concatenate([y_train, y_val])

    # Standardize features (fit ONLY on train)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_full)
    X_test_scaled = scaler.transform(X_test)

    # Models to evaluate
    models = {
        "kNN (k=5)": KNeighborsClassifier(n_neighbors=5),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=args.seed, C=1.0),
        "MLP Classifier": MLPClassifier(hidden_layer_sizes=(100, 50), max_iter=500, random_state=args.seed),
        "Linear SVM": SVC(kernel='linear', C=1.0, random_state=args.seed),
        "Random Forest": RandomForestClassifier(n_estimators=200, max_depth=None, random_state=args.seed, n_jobs=-1),
    }

    results = {}
    print("\n==========================================")
    print("   CLASSICAL ML BASELINE EVALUATION")
    print("==========================================")
    
    for name, clf in models.items():
        print(f"\nTraining {name}...")
        clf.fit(X_train_scaled, y_train_full)
        
        y_train_pred = clf.predict(X_train_scaled)
        y_test_pred = clf.predict(X_test_scaled)
        
        train_acc = float(accuracy_score(y_train_full, y_train_pred))
        test_acc = float(accuracy_score(y_test, y_test_pred))
        
        prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_test_pred, average='macro', zero_division=0)
        _, _, per_class_f1, _ = precision_recall_fscore_support(y_test, y_test_pred, average=None, zero_division=0)
        
        results[name] = {
            "train_accuracy": round(train_acc, 4),
            "test_accuracy": round(test_acc, 4),
            "macro_precision": round(float(prec), 4),
            "macro_recall": round(float(rec), 4),
            "macro_f1": round(float(f1), 4),
            "per_class_f1": {GENRES[i]: round(float(per_class_f1[i]), 4) for i in range(len(GENRES))}
        }
        
        print(f"-> {name} | Train Acc: {train_acc*100:.2f}% | Test Acc: {test_acc*100:.2f}% | Macro F1: {f1:.4f}")

    # Save results to JSON
    out_path = os.path.join(args.out_dir, "baselines.json")
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)

    # Save fitted scaler and model objects to joblib for real-time app inference
    import joblib
    model_save_path = os.path.join(args.out_dir, "baselines.joblib")
    joblib.dump({"scaler": scaler, "models": models}, model_save_path)

    print(f"\nSaved baseline evaluation results to '{out_path}'.")
    print(f"Saved fitted baseline models to '{model_save_path}'.\n")


if __name__ == "__main__":
    main()
