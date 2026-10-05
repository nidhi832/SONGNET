"""
SongNet Architecture Implementation in PyTorch.
Convolutional-Recurrent network for music genre classification from log-Mel spectrograms.

Reference:
SongNet: Real-time Music Classification (Zhang, Zhang, Chen - Stanford CS229, 2018)
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


class ConvBlock(nn.Module):
    """
    1D Convolutional block along the temporal dimension:
    Conv1d -> BatchNorm1d -> ReLU -> MaxPool1d -> Dropout
    """
    def __init__(self, in_channels, out_channels, kernel_size=5, dropout=0.3):
        super().__init__()
        padding = kernel_size // 2
        self.block = nn.Sequential(
            nn.Conv1d(in_channels, out_channels, kernel_size=kernel_size, padding=padding, bias=False),
            nn.BatchNorm1d(out_channels),
            nn.ReLU(inplace=True),
            nn.MaxPool1d(kernel_size=2, stride=2),
            nn.Dropout(p=dropout)
        )

    def forward(self, x):
        return self.block(x)


class SongNet(nn.Module):
    """
    SongNet model: 1D Time-Convolutional Network with per-timestep classifier head.
    Supports either time-distributed Conv1d head or Unidirectional GRU head.
    """
    def __init__(self, in_channels=128, num_classes=8, head="time_distributed", dropout=0.3):
        super().__init__()
        self.in_channels = in_channels
        self.num_classes = num_classes
        self.head_type = head.lower()
        self.dropout = dropout

        # 3-Stage 1D Convolutional Backbone over temporal dimension
        self.conv1 = ConvBlock(in_channels=in_channels, out_channels=128, kernel_size=5, dropout=dropout)
        self.conv2 = ConvBlock(in_channels=128, out_channels=256, kernel_size=5, dropout=dropout)
        self.conv3 = ConvBlock(in_channels=256, out_channels=256, kernel_size=5, dropout=dropout)

        # Classification Head
        if self.head_type in ["time_distributed", "conv"]:
            # Per-timestep 1x1 Convolution classifier
            self.classifier = nn.Conv1d(in_channels=256, out_channels=num_classes, kernel_size=1)
        elif self.head_type == "gru":
            # Unidirectional GRU (causal for streaming/real-time)
            self.gru = nn.GRU(input_size=256, hidden_size=128, batch_first=True, num_layers=1)
            self.classifier = nn.Linear(128, num_classes)
        else:
            raise ValueError(f"Unknown head type: {head}. Choose 'time_distributed' or 'gru'.")

    def forward(self, x, return_logits=False):
        """
        Input x: (Batch, Channels=128, Timesteps=T)
        Returns:
            song_probs: (Batch, num_classes) - Average predicted probability across timesteps
            step_probs: (Batch, num_classes, T_down) - Frame-by-frame genre probabilities
            (If return_logits=True, returns: song_logits, song_probs, step_probs)
        """
        # Feature extraction through 1D Convolutions
        feat = self.conv1(x)  # (B, 128, T/2)
        feat = self.conv2(feat)  # (B, 256, T/4)
        feat = self.conv3(feat)  # (B, 256, T/8)

        if self.head_type in ["time_distributed", "conv"]:
            # Per-timestep logits (B, num_classes, T_down)
            step_logits = self.classifier(feat)
        elif self.head_type == "gru":
            # Rearrange to (B, T_down, 256) for GRU
            feat_perm = feat.permute(0, 2, 1)
            gru_out, _ = self.gru(feat_perm)  # (B, T_down, 128)
            step_logits_perm = self.classifier(gru_out)  # (B, T_down, num_classes)
            step_logits = step_logits_perm.permute(0, 2, 1)  # (B, num_classes, T_down)

        # Compute per-timestep probabilities (softmax over genre classes)
        step_probs = F.softmax(step_logits, dim=1)  # (B, num_classes, T_down)

        # Aggregate across timesteps via mean pooling to obtain song-level probability
        song_probs = torch.mean(step_probs, dim=2)  # (B, num_classes)

        if return_logits:
            song_logits = torch.mean(step_logits, dim=2)
            return song_logits, song_probs, step_probs

        return song_probs, step_probs


def get_model(head="time_distributed", dropout=0.3, in_channels=128, num_classes=8):
    """
    Factory function to instantiate SongNet.
    """
    return SongNet(in_channels=in_channels, num_classes=num_classes, head=head, dropout=dropout)


if __name__ == "__main__":
    # Test forward pass shape sanity check
    model_td = SongNet(head="time_distributed")
    model_gru = SongNet(head="gru")
    
    dummy_input = torch.randn(4, 128, 1292)  # Batch size 4, 128 mel bins, 1292 timesteps
    
    song_probs, step_probs = model_td(dummy_input)
    print("Time-Distributed Head Output Shapes:")
    print("  Song Probs:", song_probs.shape)  # Should be (4, 8)
    print("  Step Probs:", step_probs.shape)  # Should be (4, 8, 161)
    
    song_probs_gru, step_probs_gru = model_gru(dummy_input)
    print("\nGRU Head Output Shapes:")
    print("  Song Probs:", song_probs_gru.shape)  # Should be (4, 8)
    print("  Step Probs:", step_probs_gru.shape)  # Should be (4, 8, 161)
