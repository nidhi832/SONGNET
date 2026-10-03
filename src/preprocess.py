"""
Preprocessing script for FMA-Small dataset.
Extracts log-Mel spectrograms, performs stratified 70/20/10 train/val/test split,
and computes normalization statistics on the training set only.
"""

import os
import sys
import glob
import json
import argparse
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from tqdm import tqdm

from src.common import (
    SAMPLE_RATE, DURATION, GENRES, GENRE_TO_IDX, IDX_TO_GENRE,
    audio_to_mel, load_audio_file, generate_synthetic_audio
)


def parse_fma_tracks_csv(metadata_dir):
    """
    Parse FMA tracks.csv to get track IDs and genre labels for fma_small.
    """
    tracks_path = os.path.join(metadata_dir, "tracks.csv")
    if not os.path.exists(tracks_path):
        return None
    
    print(f"Reading tracks metadata from {tracks_path}...")
    try:
        tracks = pd.read_csv(tracks_path, index_col=0, header=[0, 1])
        small_tracks = tracks[tracks['set', 'subset'] == 'small']
        
        track_info = {}
        for track_id, row in small_tracks.iterrows():
            genre = row[('track', 'genre_top')]
            if pd.notna(genre) and genre in GENRE_TO_IDX:
                # Track ID formatted as 6 digits with leading zeros
                tid_str = f"{int(track_id):06d}"
                track_info[tid_str] = genre
        return track_info
    except Exception as e:
        print(f"Warning: Could not parse tracks.csv: {e}")
        return None


def get_audio_files(fma_dir, track_info=None, limit=None):
    """
    Locate mp3 audio files in fma_small directory structure.
    fma_small structure: fma_dir/fma_small/000/000002.mp3
    """
    small_dir = os.path.join(fma_dir, "fma_small")
    if not os.path.exists(small_dir):
        small_dir = fma_dir  # fallback check directly in fma_dir
        
    mp3_files = glob.glob(os.path.join(small_dir, "*", "*.mp3"))
    if not mp3_files:
        mp3_files = glob.glob(os.path.join(fma_dir, "*.mp3"))
        
    if not mp3_files:
        return []

    items = []
    for filepath in mp3_files:
        filename = os.path.basename(filepath)
        tid_str = os.path.splitext(filename)[0]
        
        if track_info and tid_str in track_info:
            genre = track_info[tid_str]
            items.append({'track_id': tid_str, 'filepath': filepath, 'genre': genre})
        elif not track_info:
            # If no tracks.csv, try parent folder or round-robin genre mapping
            genre = GENRES[hash(tid_str) % len(GENRES)]
            items.append({'track_id': tid_str, 'filepath': filepath, 'genre': genre})
            
    if limit and len(items) > limit:
        items = items[:limit]
        
    return items


def create_synthetic_dataset(count=400, limit=None):
    """
    Generate synthetic dataset for offline testing/dry-runs when FMA mp3s are absent.
    """
    if limit and limit < count:
        count = limit
        
    print(f"Generating {count} synthetic audio spectrograms...")
    mels = []
    meta = []
    
    tracks_per_genre = count // len(GENRES)
    track_idx = 0
    
    for g_idx, genre in enumerate(GENRES):
        for i in range(tracks_per_genre):
            tid_str = f"syn_{track_idx:06d}"
            audio = generate_synthetic_audio(g_idx, duration=30, sr=SAMPLE_RATE)
            mel = audio_to_mel(audio, sr=SAMPLE_RATE)
            
            mels.append(mel)
            meta.append({'track_id': tid_str, 'genre': genre, 'genre_idx': g_idx})
            track_idx += 1
            
    return np.array(mels, dtype=np.float32), pd.DataFrame(meta)


def main():
    parser = argparse.ArgumentParser(description="Preprocess FMA-small dataset for SongNet.")
    parser.add_argument("--fma_dir", type=str, default="data/fma", help="Path to unzipped FMA dataset root directory.")
    parser.add_argument("--out_dir", type=str, default="data/processed", help="Directory to save output processed data.")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of tracks to process (e.g. 400 for quick dry run).")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducible split.")
    parser.add_argument("--synthetic", action="store_true", help="Force synthetic dataset generation.")
    args = parser.parse_args()

    np.random.seed(args.seed)
    os.makedirs(args.out_dir, exist_ok=True)

    metadata_dir = os.path.join(args.fma_dir, "fma_metadata")
    track_info = parse_fma_tracks_csv(metadata_dir)
    audio_items = get_audio_files(args.fma_dir, track_info, limit=args.limit)

    if args.synthetic or not audio_items:
        if not args.synthetic:
            print(f"No FMA mp3 audio files found under '{args.fma_dir}'. Falling back to synthetic audio data mode.")
        mels_array, df_meta = create_synthetic_dataset(count=args.limit if args.limit else 400, limit=args.limit)
    else:
        print(f"Found {len(audio_items)} audio tracks. Processing Mel spectrograms...")
        mels_list = []
        meta_list = []
        
        for item in tqdm(audio_items, desc="Extracting Mel Spectrograms"):
            try:
                y = load_audio_file(item['filepath'], duration=DURATION, sr=SAMPLE_RATE)
                mel = audio_to_mel(y, sr=SAMPLE_RATE)
                mels_list.append(mel)
                meta_list.append({
                    'track_id': item['track_id'],
                    'genre': item['genre'],
                    'genre_idx': GENRE_TO_IDX[item['genre']]
                })
            except Exception as e:
                print(f"Skipping corrupt track {item['track_id']}: {e}")
                
        mels_array = np.array(mels_list, dtype=np.float32)
        df_meta = pd.DataFrame(meta_list)

    # Perform Stratified 70 / 20 / 10 Train / Val / Test Split
    print("Performing stratified 70/20/10 train/val/test split...")
    indices = np.arange(len(df_meta))
    labels = df_meta['genre_idx'].values
    
    train_idx, temp_idx, _, temp_labels = train_test_split(
        indices, labels, test_size=0.30, random_state=args.seed, stratify=labels
    )
    val_idx, test_idx = train_test_split(
        temp_idx, test_size=(1/3), random_state=args.seed, stratify=temp_labels
    )
    
    df_meta['split'] = ''
    df_meta.loc[train_idx, 'split'] = 'train'
    df_meta.loc[val_idx, 'split'] = 'val'
    df_meta.loc[test_idx, 'split'] = 'test'

    # Compute Normalization Statistics (Mean & Std per Mel frequency bin) on Train split ONLY
    print("Computing normalization statistics on train split...")
    train_mels = mels_array[train_idx]  # Shape: (N_train, N_MELS, T)
    # Mean and std across samples (axis 0) and timesteps (axis 2)
    mean = np.mean(train_mels, axis=(0, 2), keepdims=True)  # Shape: (1, N_MELS, 1)
    std = np.std(train_mels, axis=(0, 2), keepdims=True)    # Shape: (1, N_MELS, 1)
    std = np.where(std < 1e-6, 1e-6, std)  # Avoid division by zero

    # Save outputs
    print(f"Saving preprocessed dataset to '{args.out_dir}'...")
    np.save(os.path.join(args.out_dir, "mels.npy"), mels_array)
    df_meta.to_csv(os.path.join(args.out_dir, "meta.csv"), index=False)
    np.savez(os.path.join(args.out_dir, "norm.npz"), mean=mean, std=std)
    
    with open(os.path.join(args.out_dir, "genres.json"), "w") as f:
        json.dump({"genres": GENRES, "genre_to_idx": GENRE_TO_IDX, "idx_to_genre": IDX_TO_GENRE}, f, indent=2)

    print("\n--- Preprocessing Complete ---")
    print(f"Total Tracks: {len(df_meta)}")
    print(f"Train: {len(train_idx)} | Val: {len(val_idx)} | Test: {len(test_idx)}")
    print(f"Mel Spectrogram Shape per track: {mels_array.shape[1:]}")
    print(f"Saved: mels.npy, meta.csv, norm.npz, genres.json in {args.out_dir}\n")


if __name__ == "__main__":
    main()
