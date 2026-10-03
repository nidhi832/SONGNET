"""
Training Script for SongNet PyTorch Model.
Includes data loading, normalization, random-crop augmentation,
optimizer, learning rate scheduling, and early stopping checkpointing.
"""

import os
import json
import argparse
import random
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from tqdm import tqdm

from src.model import get_model
from src.common import GENRES, GENRE_TO_IDX


def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


class SongNetDataset(Dataset):
    """
    PyTorch Dataset for log-Mel Spectrograms with normalization and random-crop augmentation.
    """
    def __init__(self, mels, labels, mean, std, crop_len=0, is_train=True):
        self.mels = mels          # Shape: (N, 128, T)
        self.labels = labels      # Shape: (N,)
        self.mean = mean          # Shape: (1, 128, 1)
        self.std = std            # Shape: (1, 128, 1)
        self.crop_len = crop_len  # Timesteps for random crop (0 = full length)
        self.is_train = is_train

    def __len__(self):
        return len(self.mels)

    def __getitem__(self, idx):
        mel = self.mels[idx]  # Shape: (128, T)
        label = self.labels[idx]

        # Apply normalization using training split statistics
        mel = (mel - self.mean.squeeze(0)) / self.std.squeeze(0)

        # Random-crop augmentation during training if crop_len > 0
        T = mel.shape[1]
        if self.is_train and self.crop_len > 0 and T > self.crop_len:
            max_start = T - self.crop_len
            start = random.randint(0, max_start)
            mel = mel[:, start:start + self.crop_len]
            
        mel_tensor = torch.tensor(mel, dtype=torch.float32)
        label_tensor = torch.tensor(label, dtype=torch.long)
        return mel_tensor, label_tensor


def train_one_epoch(model, dataloader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for mels, labels in dataloader:
        mels, labels = mels.to(device), labels.to(device)

        optimizer.zero_grad()
        song_probs, _ = model(mels)

        # Log probability for cross-entropy / NLL loss
        log_probs = torch.log(song_probs + 1e-8)
        loss = criterion(log_probs, labels)

        loss.backward()
        optimizer.step()

        running_loss += loss.item() * len(labels)
        preds = torch.argmax(song_probs, dim=1)
        correct += (preds == labels).sum().item()
        total += len(labels)

    epoch_loss = running_loss / total
    epoch_acc = correct / total
    return epoch_loss, epoch_acc


@torch.no_grad()
def evaluate(model, dataloader, criterion, device):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    for mels, labels in dataloader:
        mels, labels = mels.to(device), labels.to(device)

        song_probs, _ = model(mels)
        log_probs = torch.log(song_probs + 1e-8)
        loss = criterion(log_probs, labels)

        running_loss += loss.item() * len(labels)
        preds = torch.argmax(song_probs, dim=1)
        correct += (preds == labels).sum().item()
        total += len(labels)

    epoch_loss = running_loss / total
    epoch_acc = correct / total
    return epoch_loss, epoch_acc


def main():
    parser = argparse.ArgumentParser(description="Train SongNet on preprocessed FMA Mel spectrograms.")
    parser.add_argument("--data_dir", type=str, default="data/processed", help="Directory with preprocessed dataset.")
    parser.add_argument("--out_dir", type=str, default="runs/songnet", help="Directory to save model checkpoints and logs.")
    parser.add_argument("--head", type=str, default="time_distributed", choices=["time_distributed", "gru"], help="Classifier head type.")
    parser.add_argument("--dropout", type=float, default=0.3, help="Dropout probability.")
    parser.add_argument("--crop", type=int, default=640, help="Random crop length in timesteps during training (0 to disable).")
    parser.add_argument("--epochs", type=int, default=30, help="Number of training epochs.")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size.")
    parser.add_argument("--lr", type=float, default=1e-3, help="Initial learning rate.")
    parser.add_argument("--seed", type=int, default=42, help="Random seed.")
    args = parser.parse_args()

    set_seed(args.seed)
    os.makedirs(args.out_dir, exist_ok=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Load preprocessed data
    meta_path = os.path.join(args.data_dir, "meta.csv")
    mels_path = os.path.join(args.data_dir, "mels.npy")
    norm_path = os.path.join(args.data_dir, "norm.npz")

    if not (os.path.exists(meta_path) and os.path.exists(mels_path) and os.path.exists(norm_path)):
        raise FileNotFoundError(f"Missing preprocessed dataset files in '{args.data_dir}'. Run preprocess.py first!")

    df_meta = pd.read_csv(meta_path)
    mels = np.load(mels_path)
    norm = np.load(norm_path)
    mean, std = norm['mean'], norm['std']

    train_mask = (df_meta['split'] == 'train').values
    val_mask = (df_meta['split'] == 'val').values

    train_mels, train_labels = mels[train_mask], df_meta.loc[train_mask, 'genre_idx'].values
    val_mels, val_labels = mels[val_mask], df_meta.loc[val_mask, 'genre_idx'].values

    train_dataset = SongNetDataset(train_mels, train_labels, mean, std, crop_len=args.crop, is_train=True)
    val_dataset = SongNetDataset(val_mels, val_labels, mean, std, crop_len=0, is_train=False)

    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, drop_last=False)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False)

    # Instantiate Model
    model = get_model(head=args.head, dropout=args.dropout).to(device)
    criterion = nn.NLLLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=3)

    best_val_loss = float('inf')
    best_val_acc = 0.0
    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": [], "lr": []}

    print("\n==========================================")
    print(f"   STARTING SONGNET TRAINING ({args.head.upper()})")
    print(f"   Epochs: {args.epochs} | Batch: {args.batch_size} | Crop: {args.crop} | Dropout: {args.dropout}")
    print("==========================================")

    for epoch in range(1, args.epochs + 1):
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = evaluate(model, val_loader, criterion, device)

        curr_lr = optimizer.param_groups[0]['lr']
        scheduler.step(val_loss)

        history["train_loss"].append(round(train_loss, 4))
        history["train_acc"].append(round(train_acc, 4))
        history["val_loss"].append(round(val_loss, 4))
        history["val_acc"].append(round(val_acc, 4))
        history["lr"].append(curr_lr)

        print(f"Epoch [{epoch:02d}/{args.epochs:02d}] - "
              f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc*100:.2f}% | "
              f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc*100:.2f}% | "
              f"LR: {curr_lr:.6f}")

        # Checkpoint best model based on validation loss / accuracy
        if val_loss < best_val_loss or val_acc > best_val_acc:
            if val_loss < best_val_loss:
                best_val_loss = val_loss
            if val_acc > best_val_acc:
                best_val_acc = val_acc

            ckpt_path = os.path.join(args.out_dir, "best.pt")
            torch.save({
                "model_state_dict": model.state_dict(),
                "config": {
                    "head": args.head,
                    "dropout": args.dropout,
                    "in_channels": 128,
                    "num_classes": len(GENRES),
                    "crop": args.crop
                },
                "val_loss": val_loss,
                "val_acc": val_acc,
                "epoch": epoch
            }, ckpt_path)

    # Save training history
    history_path = os.path.join(args.out_dir, "history.json")
    with open(history_path, "w") as f:
        json.dump(history, f, indent=2)

    print("\n--- Training Complete ---")
    print(f"Best Val Loss: {best_val_loss:.4f} | Best Val Acc: {best_val_acc*100:.2f}%")
    print(f"Checkpoint saved to: '{os.path.join(args.out_dir, 'best.pt')}'")
    print(f"History saved to: '{history_path}'\n")


if __name__ == "__main__":
    main()
