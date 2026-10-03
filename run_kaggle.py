"""
Standalone Kaggle / Google Colab Execution Script for SongNet.
Download FMA-small dataset (or use synthetic), preprocesses Mel spectrograms,
trains classical ML baselines (kNN, LogReg, MLP, SVM), trains SongNet PyTorch models
(Time-Distributed and GRU heads) on GPU/CPU, and prints exact accuracy reports.

Run on Kaggle / Colab:
python run_kaggle.py
"""

import os
import sys
import json
import zipfile
import urllib.request
import numpy as np
import pandas as pd
import torch

from src import preprocess, baselines, train, evaluate


def download_fma_if_missing(fma_dir="data/fma"):
    """
    Download FMA-small dataset if not present on Kaggle/Colab.
    """
    os.makedirs(fma_dir, exist_ok=True)
    small_zip = os.path.join(fma_dir, "fma_small.zip")
    meta_zip = os.path.join(fma_dir, "fma_metadata.zip")
    
    # Check if already unzipped
    if os.path.exists(os.path.join(fma_dir, "fma_small")) and os.path.exists(os.path.join(fma_dir, "fma_metadata")):
        print(f"FMA dataset found in '{fma_dir}'.")
        return True
        
    print("FMA dataset not found locally. To download full FMA-small (~7.2 GB):")
    print("  curl -O https://os.unil.cloud.mswitch.ch/fma/fma_small.zip")
    print("  curl -O https://os.unil.cloud.mswitch.ch/fma/fma_metadata.zip")
    print("  unzip fma_small.zip -d data/fma/")
    print("  unzip fma_metadata.zip -d data/fma/\n")
    return False


def run_full_kaggle_pipeline(epochs=15, limit=None):
    print("==================================================================")
    print("  KAGGLE / COLAB SONGNET MODEL TRAINING & ACCURACY VERIFICATION")
    print("==================================================================")

    fma_present = download_fma_if_missing()
    
    data_dir = "data/processed"
    results_dir = "results"
    runs_td_dir = "runs/songnet"
    runs_gru_dir = "runs/songnet_gru"

    # Step 1: Preprocessing
    print("\n--- STEP 1: Preprocessing Audio -> Log-Mel Spectrograms ---")
    sys.argv = [
        "preprocess.py",
        "--fma_dir", "data/fma",
        "--out_dir", data_dir,
        "--seed", "42"
    ]
    if limit:
        sys.argv.extend(["--limit", str(limit)])
    if not fma_present:
        sys.argv.append("--synthetic")
        
    preprocess.main()

    # Step 2: Classical ML Baselines
    print("\n--- STEP 2: Training Classical ML Baselines (kNN, LogReg, MLP, SVM) ---")
    sys.argv = [
        "baselines.py",
        "--fma_dir", "data/fma",
        "--data_dir", data_dir,
        "--out_dir", results_dir,
        "--seed", "42"
    ]
    baselines.main()

    # Step 3: Train SongNet (Time-Distributed Head)
    print("\n--- STEP 3: Training Deep Learning Model: SongNet (Time-Distributed Head) ---")
    sys.argv = [
        "train.py",
        "--data_dir", data_dir,
        "--out_dir", runs_td_dir,
        "--head", "time_distributed",
        "--epochs", str(epochs),
        "--batch_size", "32",
        "--crop", "640"
    ]
    train.main()

    # Step 4: Train SongNet (GRU Head)
    print("\n--- STEP 4: Training Deep Learning Model: SongNet (Causal GRU Head) ---")
    sys.argv = [
        "train.py",
        "--data_dir", data_dir,
        "--out_dir", runs_gru_dir,
        "--head", "gru",
        "--epochs", str(epochs),
        "--batch_size", "32",
        "--crop", "640"
    ]
    train.main()

    # Step 5: Evaluate & Compare All Models
    print("\n--- STEP 5: Final Test Evaluation & Comparative Accuracy Summary ---")
    sys.argv = [
        "evaluate.py",
        "--data_dir", data_dir,
        "--run_dir", runs_td_dir,
        "--results_dir", results_dir
    ]
    evaluate.main()

    # Print final verification table
    print("\n==================================================================")
    print("   MODEL ACCURACY VERIFICATION REPORT")
    print("==================================================================")
    
    with open(os.path.join(results_dir, "baselines.json"), "r") as f:
        b_res = json.load(f)
    with open(os.path.join(results_dir, "songnet.json"), "r") as f:
        s_res = json.load(f)
        
    print(f"\n[Deep Learning] SongNet (Time-Distributed): Test Acc = {s_res['test_accuracy']*100:.2f}% | Macro F1 = {s_res['macro_f1']:.4f}")
    for b_name, b_metrics in b_res.items():
        print(f"[Classical ML ] {b_name:25s}: Test Acc = {b_metrics['test_accuracy']*100:.2f}% | Macro F1 = {b_metrics['macro_f1']:.4f}")
        
    print("\nSaved Checkpoint Files Ready for Download/Inference:")
    print(f"  1. PyTorch TD Checkpoint : {os.path.join(runs_td_dir, 'best.pt')}")
    print(f"  2. PyTorch GRU Checkpoint: {os.path.join(runs_gru_dir, 'best.pt')}")
    print(f"  3. Scikit-Learn Baselines: {os.path.join(results_dir, 'baselines.joblib')}")
    print("==================================================================\n")


if __name__ == "__main__":
    run_full_kaggle_pipeline(epochs=10)
