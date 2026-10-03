"""
End-to-end smoke test for SongNet project pipeline.
Runs preprocessing, classical baselines, model training (both time-distributed and GRU heads),
evaluation, plot generation, and app predictor inference on synthetic audio data.

Execution:
python -m tests.smoke_test
Should take ~1 min and terminate with "SMOKE TEST PASSED".
"""

import os
import sys
import shutil
import tempfile
import numpy as np
import torch

from src import preprocess, baselines, train, evaluate
from app import SongNetPredictor


def run_smoke_test():
    print("\n=======================================================")
    print("   SONGNET END-TO-END SMOKE TEST")
    print("=======================================================\n")

    # Create temporary isolated directories for smoke test
    temp_dir = tempfile.mkdtemp(prefix="songnet_smoke_test_")
    smoke_data_dir = os.path.join(temp_dir, "data_smoke")
    smoke_runs_dir = os.path.join(temp_dir, "runs_smoke")
    smoke_results_dir = os.path.join(temp_dir, "results_smoke")

    try:
        # 1. Test Preprocessing
        print("--- Step 1: Preprocessing Synthetic Data ---")
        sys.argv = [
            "preprocess.py",
            "--out_dir", smoke_data_dir,
            "--limit", "160",
            "--synthetic",
            "--seed", "42"
        ]
        preprocess.main()
        
        assert os.path.exists(os.path.join(smoke_data_dir, "mels.npy")), "Missing mels.npy"
        assert os.path.exists(os.path.join(smoke_data_dir, "meta.csv")), "Missing meta.csv"
        assert os.path.exists(os.path.join(smoke_data_dir, "norm.npz")), "Missing norm.npz"
        assert os.path.exists(os.path.join(smoke_data_dir, "genres.json")), "Missing genres.json"
        print("[OK] Preprocessing passed.\n")
        
        # 2. Test Classical ML Baselines
        print("--- Step 2: Running Classical ML Baselines ---")
        sys.argv = [
            "baselines.py",
            "--data_dir", smoke_data_dir,
            "--out_dir", smoke_results_dir,
            "--seed", "42"
        ]
        baselines.main()
        
        assert os.path.exists(os.path.join(smoke_results_dir, "baselines.json")), "Missing baselines.json"
        print("[OK] Baselines passed.\n")

        # 3. Test SongNet Model Training (Time-Distributed Head)
        print("--- Step 3: Training SongNet (Time-Distributed Head) ---")
        sys.argv = [
            "train.py",
            "--data_dir", smoke_data_dir,
            "--out_dir", smoke_runs_dir,
            "--head", "time_distributed",
            "--epochs", "2",
            "--batch_size", "16",
            "--crop", "320"
        ]
        train.main()
        
        ckpt_path = os.path.join(smoke_runs_dir, "best.pt")
        assert os.path.exists(ckpt_path), "Missing best.pt checkpoint"
        assert os.path.exists(os.path.join(smoke_runs_dir, "history.json")), "Missing history.json"
        print("[OK] Time-Distributed Head training passed.\n")

        # 4. Test SongNet Model Training (GRU Head)
        print("--- Step 4: Training SongNet (GRU Head) ---")
        gru_runs_dir = os.path.join(temp_dir, "runs_smoke_gru")
        sys.argv = [
            "train.py",
            "--data_dir", smoke_data_dir,
            "--out_dir", gru_runs_dir,
            "--head", "gru",
            "--epochs", "2",
            "--batch_size", "16",
            "--crop", "320"
        ]
        train.main()
        
        assert os.path.exists(os.path.join(gru_runs_dir, "best.pt")), "Missing GRU best.pt checkpoint"
        print("[OK] GRU Head training passed.\n")

        # 5. Test Evaluation & Plotting
        print("--- Step 5: Evaluating Model & Generating Artifacts ---")
        sys.argv = [
            "evaluate.py",
            "--data_dir", smoke_data_dir,
            "--run_dir", smoke_runs_dir,
            "--results_dir", smoke_results_dir
        ]
        evaluate.main()
        
        assert os.path.exists(os.path.join(smoke_results_dir, "songnet.json")), "Missing songnet.json"
        assert os.path.exists(os.path.join(smoke_results_dir, "confusion_matrix.png")), "Missing confusion_matrix.png"
        assert os.path.exists(os.path.join(smoke_results_dir, "training_curves.png")), "Missing training_curves.png"
        assert os.path.exists(os.path.join(smoke_results_dir, "comparison.md")), "Missing comparison.md"
        print("[OK] Evaluation & report generation passed.\n")

        # 6. Test App Predictor Inference
        print("--- Step 6: Testing App Inference Engine ---")
        predictor = SongNetPredictor(ckpt_path=ckpt_path, data_dir=smoke_data_dir)
        status_msg, genre_dict, fig = predictor.predict(None)
        
        assert status_msg is not None, "Predictor failed status message"
        assert len(genre_dict) == 8, "Predictor did not return 8 genre probabilities"
        assert fig is not None, "Predictor failed plot generation"
        print("[OK] App predictor inference passed.\n")

        print("=======================================================")
        print("   SMOKE TEST PASSED")
        print("=======================================================\n")

    finally:
        # Clean up temp test files
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)


if __name__ == "__main__":
    run_smoke_test()
