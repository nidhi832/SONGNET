"""
SongNet Studio AI - Motion Studio Edition
Advanced Music Genre Classification & Real-Time Analytics Platform.
Features PyTorch C-RNN models (Time-Distributed & Causal GRU heads), Classical ML baselines,
Plotly interactive time-series visualizations, Motion Studio visual timeline aesthetics,
and a Spotify/Apple Music-style Sidebar Music Library.
"""

import os
import json
import argparse
import joblib
import numpy as np
import pandas as pd
import torch
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import gradio as gr
import soundfile as sf

from src.model import get_model
from src.common import (
    SAMPLE_RATE, DURATION, GENRES, GENRE_TO_IDX, IDX_TO_GENRE,
    audio_to_mel, load_audio_file, generate_synthetic_audio,
    FMIN, FMAX, N_MELS
)
from src.baselines import extract_features_from_mels


# Genre Palette & Icons
GENRE_COLORS = {
    'Electronic': '#00f2fe',
    'Experimental': '#a855f7',
    'Folk': '#eab308',
    'Hip-Hop': '#ff0055',
    'Instrumental': '#3b82f6',
    'International': '#10b981',
    'Pop': '#ec4899',
    'Rock': '#f97316'
}

GENRE_ICONS = {
    'Electronic': '⚡',
    'Experimental': '🧪',
    'Folk': '🪕',
    'Hip-Hop': '🎤',
    'Instrumental': '🎹',
    'International': '🌍',
    'Pop': '✨',
    'Rock': '🎸'
}

# Music Library Sample Metadata
TRACK_LIBRARY_METADATA = [
    {
        "id": "track_elec",
        "genre": "Electronic",
        "title": "Cyber Synthwave 2088",
        "artist": "SongNet Motion Studio",
        "bpm": "128 BPM",
        "duration": "30s",
        "icon": "⚡",
        "color": "#00f2fe",
        "desc": "Synth bassline, arpeggiated lead & pulse kick"
    },
    {
        "id": "track_rock",
        "genre": "Rock",
        "title": "Heavy Distortion Riff",
        "artist": "SongNet Motion Studio",
        "bpm": "140 BPM",
        "duration": "30s",
        "icon": "🎸",
        "color": "#f97316",
        "desc": "Overdriven electric guitars & driving power drums"
    },
    {
        "id": "track_hiphop",
        "genre": "Hip-Hop",
        "title": "Urban Boom-Bap Beat",
        "artist": "SongNet Motion Studio",
        "bpm": "95 BPM",
        "duration": "30s",
        "icon": "🎤",
        "color": "#ff0055",
        "desc": "Heavy 808 sub bass, hi-hat rolls & vocal chop"
    },
    {
        "id": "track_pop",
        "genre": "Pop",
        "title": "Neon Lights Anthem",
        "artist": "SongNet Motion Studio",
        "bpm": "120 BPM",
        "duration": "30s",
        "icon": "✨",
        "color": "#ec4899",
        "desc": "Catchy synth melody, bright chord progression"
    },
    {
        "id": "track_folk",
        "genre": "Folk",
        "title": "Acoustic Horizon",
        "artist": "SongNet Motion Studio",
        "bpm": "105 BPM",
        "duration": "30s",
        "icon": "🪕",
        "color": "#eab308",
        "desc": "Fingerpicked acoustic guitar & warm natural resonance"
    },
    {
        "id": "track_experimental",
        "genre": "Experimental",
        "title": "Quantum Ambient Drift",
        "artist": "SongNet Motion Studio",
        "bpm": "80 BPM",
        "duration": "30s",
        "icon": "🧪",
        "color": "#a855f7",
        "desc": "Microtonal frequency sweeps & textured pads"
    },
    {
        "id": "track_instrumental",
        "genre": "Instrumental",
        "title": "Symphonic Grand Keys",
        "artist": "SongNet Motion Studio",
        "bpm": "110 BPM",
        "duration": "30s",
        "icon": "🎹",
        "color": "#3b82f6",
        "desc": "Solo concert grand piano with soft string pad"
    },
    {
        "id": "track_international",
        "genre": "International",
        "title": "Global Rhythms",
        "artist": "SongNet Motion Studio",
        "bpm": "115 BPM",
        "duration": "30s",
        "icon": "🌍",
        "color": "#10b981",
        "desc": "Polyrhythmic percussion & traditional flute melody"
    }
]


# Universal 100% Matte Black Pitch Dark Custom CSS Overrides
CUSTOM_CSS = """
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

* {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

/* 100% Pitch Black Theme Engine Overrides */
:root, html, body, .gradio-container, .main, .app, #root, .contain, .gradio-app, div[class*="gradio"] {
    color-scheme: dark !important;
    background-color: #050508 !important;
    background: #050508 !important;
    color: #f4f4f5 !important;
}

/* Sidebar & All Sub-Panels -> Matte Pitch Black */
aside, .sidebar, div[data-testid="sidebar"], div[class*="sidebar"], .sidebar-container, .sidebar-panel {
    background-color: #09090e !important;
    background: #09090e !important;
    border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
}

aside *, .sidebar *, div[data-testid="sidebar"] * {
    color: #f4f4f5 !important;
}

/* Force All Groups, Boxes, Blocks, Cards to Matte Dark */
div[class*="group"], div[class*="box"], div[class*="block"], div[class*="card"], .gr-box, .gr-group, fieldset, .form, .block, .panel, .gr-panel, .gr-form, .element-container {
    background-color: #111116 !important;
    background: #111116 !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 12px !important;
}

/* Force All Buttons inside Sidebar/Main to Matte Black (No White Buttons!) */
button, .gr-button, button.secondary, .gr-button-secondary, button.primary, .gr-button-primary,
.track-pill-btn, .track-pill-btn button, div[class*="group"] button, div[class*="block"] button,
button[class*="btn"] {
    background-color: #181820 !important;
    background: #181820 !important;
    color: #ffffff !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 8px !important;
    font-weight: 700 !important;
    box-shadow: none !important;
}

button:hover, .gr-button:hover, button.secondary:hover, .track-pill-btn button:hover, div[class*="group"] button:hover {
    background-color: #ff435a !important;
    background: #ff435a !important;
    color: #ffffff !important;
    border-color: #ff435a !important;
    box-shadow: 0 4px 16px rgba(255, 67, 90, 0.4) !important;
}

/* Crimson Ambient Wave Background Overlay */
.wave-backdrop {
    position: relative;
    width: 100%;
    background: #050508;
    overflow: hidden;
}

.wave-backdrop::before {
    content: '';
    position: absolute;
    top: -100px;
    left: 50%;
    transform: translateX(-50%);
    width: 1400px;
    height: 450px;
    background: radial-gradient(ellipse at center, rgba(255, 67, 90, 0.22) 0%, rgba(225, 29, 72, 0.08) 45%, transparent 75%);
    pointer-events: none;
    z-index: 0;
    filter: blur(40px);
}

/* Motion Studio Top Navbar */
.motion-nav-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: rgba(12, 12, 16, 0.95);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    margin-bottom: 24px;
    backdrop-filter: blur(12px);
    position: relative;
    z-index: 10;
}

.motion-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.5px;
}

.motion-brand-mark {
    color: #ff435a;
    font-size: 22px;
    font-weight: 900;
}

.motion-nav-links {
    display: flex;
    align-items: center;
    gap: 24px;
}

.motion-nav-link {
    color: #a1a1aa;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-decoration: none;
    transition: color 0.15s ease;
}

.motion-nav-link:hover, .motion-nav-link.active {
    color: #ffffff;
}

.motion-badge-new {
    background: rgba(255, 67, 90, 0.15);
    color: #ff435a;
    border: 1px solid rgba(255, 67, 90, 0.4);
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1px;
    margin-left: 4px;
}

.motion-nav-btn {
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: transparent;
    color: #ffffff;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.15s ease;
}

.motion-nav-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #ffffff;
}

/* Interactive Timeline Visual Editor Container */
.motion-timeline-container {
    background: #111116;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7);
    position: relative;
    z-index: 2;
}

.timeline-scrubber-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #71717a;
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    margin-bottom: 14px;
    position: relative;
}

.timeline-pin-red {
    position: absolute;
    right: 22%;
    top: 0;
    width: 2px;
    height: 100%;
    background: #ff435a;
    box-shadow: 0 0 10px #ff435a;
}

.timeline-pin-red::before {
    content: '';
    position: absolute;
    top: -6px;
    left: -4px;
    width: 10px;
    height: 10px;
    background: #ff435a;
    border-radius: 50%;
}

.timeline-track-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    gap: 16px;
}

.track-label {
    width: 110px;
    color: #f4f4f5;
    font-size: 13px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace !important;
}

.track-bar-container {
    flex-grow: 1;
    height: 12px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
    position: relative;
    overflow: hidden;
}

.track-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #27272a 0%, #3f3f46 100%);
    border-radius: 6px;
    position: relative;
}

.track-bar-dot-start, .track-bar-dot-end {
    width: 6px;
    height: 6px;
    background: #ffffff;
    border-radius: 50%;
    position: absolute;
    top: 3px;
}

.track-bar-dot-start { left: 2px; }
.track-bar-dot-end { right: 2px; }

.timeline-controls-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.play-time-badge {
    background: #18181b;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #e4e4e7;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace !important;
    display: flex;
    align-items: center;
    gap: 8px;
}

.play-btn-circle {
    width: 22px;
    height: 22px;
    background: #ffffff;
    color: #09090b;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
}

/* Floating AI Prompt Box */
.ai-prompt-box {
    background: #141419;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 16px;
    margin-top: 16px;
}

.ai-tag-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}

.ai-tag-pill {
    background: #1f1f24;
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #a1a1aa;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
}

.ai-tag-pill:hover {
    background: #27272a;
    color: #ffffff;
    border-color: rgba(255, 67, 90, 0.4);
}

/* Hero Section Title & Buttons */
.hero-text-section {
    margin-top: 32px;
    margin-bottom: 32px;
}

.hero-main-title {
    font-size: 42px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -1px;
    margin-bottom: 12px;
}

.hero-description-text {
    font-size: 16px;
    color: #a1a1aa;
    max-width: 640px;
    line-height: 1.6;
    margin-bottom: 24px;
}

.hero-cta-group {
    display: flex;
    align-items: center;
    gap: 16px;
}

.btn-coral-primary {
    background: #ff435a !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 14px 28px !important;
    font-size: 13px !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
    letter-spacing: 1px !important;
    box-shadow: 0 4px 20px rgba(255, 67, 90, 0.4) !important;
    transition: all 0.15s ease !important;
}

.btn-coral-primary:hover {
    background: #e0354c !important;
    box-shadow: 0 6px 28px rgba(255, 67, 90, 0.6) !important;
    transform: translateY(-1px) !important;
}

.btn-outline-secondary {
    background: transparent !important;
    color: #ffffff !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 8px !important;
    padding: 14px 24px !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 1px !important;
    transition: all 0.15s ease !important;
}

.btn-outline-secondary:hover {
    border-color: #ffffff !important;
    background: rgba(255, 255, 255, 0.08) !important;
}

/* Sidebar Music Library Styling */
.music-lib-header-box {
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 14px;
}

.music-lib-title {
    font-size: 16px;
    font-weight: 800;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 8px;
}

.music-lib-subtitle {
    font-size: 12px;
    color: #ff435a;
    margin-top: 2px;
    font-weight: 600;
}

/* Sidebar Telemetry Box */
.sidebar-telemetry-box {
    background: #111116;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 14px;
    margin-top: 16px;
}

.sidebar-telemetry-title {
    font-size: 11px;
    font-weight: 800;
    color: #ff435a;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
}

.sidebar-telemetry-item {
    font-size: 12px;
    color: #a1a1aa;
    margin-bottom: 4px;
    display: flex;
    justify-content: space-between;
}

/* Hero Prediction Status Card */
.hero-status-card {
    background: #111116;
    border: 1px solid rgba(255, 67, 90, 0.35);
    border-radius: 14px;
    padding: 20px 24px;
    margin-bottom: 16px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
}

.hero-genre-name {
    font-size: 26px;
    font-weight: 800;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 6px;
}

.hero-conf-badge {
    background: #ff435a;
    color: #ffffff;
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 700;
    box-shadow: 0 2px 10px rgba(255, 67, 90, 0.4);
}

/* Inputs, Selects, Dropdowns & Audio Component */
input, select, textarea, .gr-input, .gr-dropdown,
div[class*="select"], select option, div[data-testid="dropdown"],
div[data-testid="audio"], .upload-container, .dropzone,
div[class*="upload"], div[class*="dropzone"] {
    background-color: #14141a !important;
    background: #14141a !important;
    color: #ffffff !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 10px !important;
}

/* Plot Boxes */
.plot, .gr-plot, div.gr-plot, .plot-container, div[data-testid="plot"],
div[data-testid="plot"] > div, div[data-testid="plot"] iframe {
    background-color: #0d0d11 !important;
    background: #0d0d11 !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 12px !important;
}

/* Tabs */
.tabs, .tab-nav, div[class*="tab-nav"] {
    background-color: #0d0d11 !important;
    border-bottom: 2px solid rgba(255, 255, 255, 0.08) !important;
}

button[role="tab"], .tab-nav button {
    color: #a1a1aa !important;
    font-weight: 700 !important;
}

button[role="tab"][aria-selected="true"], .tab-nav button.selected {
    color: #ffffff !important;
    background-color: rgba(255, 67, 90, 0.15) !important;
    border-bottom: 3px solid #ff435a !important;
}
"""


class SongNetPredictor:
    def __init__(self, ckpt_path=None, data_dir="data/processed", runs_dir="runs", results_dir="results"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.mean = np.zeros((1, 128, 1), dtype=np.float32)
        self.std = np.ones((1, 128, 1), dtype=np.float32)
        
        # Load normalization stats
        norm_path = os.path.join(data_dir, "norm.npz")
        if os.path.exists(norm_path):
            try:
                norm = np.load(norm_path)
                self.mean = norm['mean']
                self.std = norm['std']
            except Exception as e:
                print(f"Warning: Failed to load norm.npz: {e}")

        # 1. Load Time-Distributed Model
        self.songnet_td = None
        td_ckpt = ckpt_path if (ckpt_path and os.path.exists(ckpt_path)) else os.path.join(runs_dir, "songnet", "best.pt")
        if not (td_ckpt and os.path.exists(td_ckpt)):
            td_ckpt = os.path.join(runs_dir, "songnet_small", "best.pt")
            
        if td_ckpt and os.path.exists(td_ckpt):
            try:
                checkpoint = torch.load(td_ckpt, map_location=self.device)
                cfg = checkpoint.get("config", {"head": "time_distributed", "dropout": 0.3})
                self.songnet_td = get_model(head=cfg.get("head", "time_distributed"), dropout=cfg.get("dropout", 0.3)).to(self.device)
                self.songnet_td.load_state_dict(checkpoint["model_state_dict"])
                self.songnet_td.eval()
            except Exception as e:
                print(f"Error loading Time-Distributed model: {e}")

        # 2. Load GRU Head Model
        self.songnet_gru = None
        gru_ckpt = os.path.join(runs_dir, "songnet_gru", "best.pt")
        if os.path.exists(gru_ckpt):
            try:
                checkpoint = torch.load(gru_ckpt, map_location=self.device)
                cfg = checkpoint.get("config", {"head": "gru", "dropout": 0.3})
                self.songnet_gru = get_model(head="gru", dropout=cfg.get("dropout", 0.3)).to(self.device)
                self.songnet_gru.load_state_dict(checkpoint["model_state_dict"])
                self.songnet_gru.eval()
            except Exception as e:
                print(f"Error loading GRU model: {e}")

        # Fallback if no deep model checkpoint was loaded
        if self.songnet_td is None:
            self.songnet_td = get_model(head="time_distributed").to(self.device)
            self.songnet_td.eval()

        # 3. Load Classical Baselines
        self.baseline_scaler = None
        self.baseline_models = {}
        baselines_joblib = os.path.join(results_dir, "baselines.joblib")
        if not os.path.exists(baselines_joblib):
            baselines_joblib = os.path.join("results_small", "baselines.joblib")
            
        if os.path.exists(baselines_joblib):
            try:
                data = joblib.load(baselines_joblib)
                self.baseline_scaler = data.get("scaler")
                self.baseline_models = data.get("models", {})
            except Exception as e:
                print(f"Error loading baselines: {e}")

    def _prepare_audio(self, audio_input):
        if audio_input is None:
            return generate_synthetic_audio(genre_idx=0, duration=DURATION, sr=SAMPLE_RATE)
        elif isinstance(audio_input, str):
            return load_audio_file(audio_input, duration=DURATION, sr=SAMPLE_RATE)
        elif isinstance(audio_input, tuple):
            sr, y = audio_input
            if len(y.shape) > 1:
                y = np.mean(y, axis=1)
            if sr != SAMPLE_RATE:
                import librosa
                y = librosa.resample(y.astype(np.float32), orig_sr=sr, target_sr=SAMPLE_RATE)
            target_len = SAMPLE_RATE * DURATION
            if len(y) < target_len:
                y = np.pad(y, (0, target_len - len(y)), mode='constant')
            else:
                y = y[:target_len]
            return y.astype(np.float32)
        return generate_synthetic_audio(genre_idx=0, duration=DURATION, sr=SAMPLE_RATE)

    @torch.no_grad()
    def predict(self, audio_input=None, model_name="SongNet (Time-Distributed C-RNN)"):
        """
        Standard predict method for backwards compatibility (e.g. smoke_test.py).
        Returns (status_html, genre_dict, line_plot_fig).
        """
        res = self.predict_single(audio_input, model_name)
        return res[0], res[1], res[2]

    @torch.no_grad()
    def predict_single(self, audio_input, model_name="SongNet (Time-Distributed C-RNN)"):
        audio = self._prepare_audio(audio_input)
        mel = audio_to_mel(audio, sr=SAMPLE_RATE)

        # Deep Learning Models
        if model_name in ["SongNet (Time-Distributed C-RNN)", "SongNet (Causal GRU Head)"]:
            model = self.songnet_gru if (model_name == "SongNet (Causal GRU Head)" and self.songnet_gru is not None) else self.songnet_td
            
            mel_norm = (mel - self.mean.squeeze(0)) / self.std.squeeze(0)
            x_tensor = torch.tensor(mel_norm, dtype=torch.float32).unsqueeze(0).to(self.device)
            
            song_probs, step_probs = model(x_tensor)
            song_probs_np = song_probs.squeeze(0).cpu().numpy()
            step_probs_np = step_probs.squeeze(0).cpu().numpy()
            
            genre_dict = {GENRES[i]: float(song_probs_np[i]) for i in range(len(GENRES))}
            top_idx = int(np.argmax(song_probs_np))
            top_genre = GENRES[top_idx]
            top_conf = float(np.max(song_probs_np)) * 100
            
            sorted_indices = np.argsort(song_probs_np)[::-1]
            runner_ups = [f"{GENRES[idx]} ({song_probs_np[idx]*100:.1f}%)" for idx in sorted_indices[1:3]]
            
            status_html = f"""
            <div class="hero-status-card">
                <div style="color: #ff435a; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
                    LIVE MOTION INFERENCE ENGINE • {model_name}
                </div>
                <div class="hero-genre-name">
                    <span>{GENRE_ICONS.get(top_genre, '🎵')} {top_genre}</span>
                    <span class="hero-conf-badge">{top_conf:.1f}% Match</span>
                </div>
                <div style="color: #a1a1aa; font-size: 13px; margin-top: 10px;">
                    <strong style="color: #71717a;">Secondary Possibilities:</strong> {', '.join(runner_ups)}
                </div>
            </div>
            """
            
            line_fig = self._plot_timestep_probabilities(step_probs_np, model_name)
            heatmap_fig = self._plot_temporal_heatmap(step_probs_np)
            bar_fig = self._plot_genre_bars(song_probs_np)
            
            return status_html, genre_dict, line_fig, heatmap_fig, bar_fig

        # Classical ML Baselines
        else:
            clf_name_map = {
                "Classical kNN (k=5)": "kNN (k=5)",
                "Classical Logistic Regression": "Logistic Regression",
                "Classical MLP Classifier": "MLP Classifier",
                "Classical Linear SVM": "Linear SVM"
            }
            clf_key = clf_name_map.get(model_name, model_name)
            
            feat_vec = extract_features_from_mels(mel[np.newaxis, ...])
            if self.baseline_scaler is not None:
                feat_vec = self.baseline_scaler.transform(feat_vec)
                
            clf = self.baseline_models.get(clf_key)
            if clf is not None:
                if hasattr(clf, "predict_proba"):
                    probs = clf.predict_proba(feat_vec)[0]
                elif hasattr(clf, "decision_function"):
                    df_val = clf.decision_function(feat_vec)[0]
                    exp_df = np.exp(df_val - np.max(df_val))
                    probs = exp_df / np.sum(exp_df)
                else:
                    pred = clf.predict(feat_vec)[0]
                    probs = np.zeros(len(GENRES))
                    probs[pred] = 1.0
            else:
                probs = np.ones(len(GENRES)) / len(GENRES)

            genre_dict = {GENRES[i]: float(probs[i]) for i in range(len(GENRES))}
            top_genre = GENRES[np.argmax(probs)]
            top_conf = float(np.max(probs)) * 100
            
            status_html = f"""
            <div class="hero-status-card" style="border-color: rgba(56, 189, 248, 0.4);">
                <div style="color: #38bdf8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
                    CLASSICAL BASELINE ENGINE • {model_name}
                </div>
                <div class="hero-genre-name">
                    <span>{GENRE_ICONS.get(top_genre, '🎵')} {top_genre}</span>
                    <span class="hero-conf-badge" style="background: #0284c7;">{top_conf:.1f}% Confidence</span>
                </div>
            </div>
            """
            
            num_steps = 161
            dummy_step_probs = np.tile(probs[:, np.newaxis], (1, num_steps))
            
            line_fig = self._plot_timestep_probabilities(dummy_step_probs, model_name)
            heatmap_fig = self._plot_temporal_heatmap(dummy_step_probs)
            bar_fig = self._plot_genre_bars(probs)
            
            return status_html, genre_dict, line_fig, heatmap_fig, bar_fig

    @torch.no_grad()
    def compare_all_models(self, audio_input):
        audio = self._prepare_audio(audio_input)
        mel = audio_to_mel(audio, sr=SAMPLE_RATE)
        
        mel_norm = (mel - self.mean.squeeze(0)) / self.std.squeeze(0)
        x_tensor = torch.tensor(mel_norm, dtype=torch.float32).unsqueeze(0).to(self.device)
        
        td_probs, _ = self.songnet_td(x_tensor)
        td_probs_np = td_probs.squeeze(0).cpu().numpy()
        
        gru_probs_np = self.songnet_gru(x_tensor)[0].squeeze(0).cpu().numpy() if self.songnet_gru else td_probs_np
            
        feat_vec = extract_features_from_mels(mel[np.newaxis, ...])
        if self.baseline_scaler is not None:
            feat_vec = self.baseline_scaler.transform(feat_vec)
            
        all_preds = {
            "SongNet (Time-Distributed C-RNN)": td_probs_np,
            "SongNet (Causal GRU Head)": gru_probs_np
        }
        
        for name, clf in self.baseline_models.items():
            if hasattr(clf, "predict_proba"):
                probs = clf.predict_proba(feat_vec)[0]
            elif hasattr(clf, "decision_function"):
                df_val = clf.decision_function(feat_vec)[0]
                exp_df = np.exp(df_val - np.max(df_val))
                probs = exp_df / np.sum(exp_df)
            else:
                pred = clf.predict(feat_vec)[0]
                probs = np.zeros(len(GENRES))
                probs[pred] = 1.0
            all_preds[f"Baseline: {name}"] = probs

        records = []
        top_genres_list = []
        for m_name, probs in all_preds.items():
            top_idx = int(np.argmax(probs))
            top_genres_list.append(GENRES[top_idx])
            records.append({
                "Model Architecture": m_name,
                "Top Predicted Genre": GENRES[top_idx],
                "Top Confidence (%)": f"{probs[top_idx]*100:.2f}%",
                **{GENRES[i]: f"{probs[i]*100:.1f}%" for i in range(len(GENRES))}
            })

        df_res = pd.DataFrame(records)
        
        consensus_genre = max(set(top_genres_list), key=top_genres_list.count)
        agreement_pct = (top_genres_list.count(consensus_genre) / len(top_genres_list)) * 100
        
        kpi_html = f"""
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-val" style="color: #ff435a;">{consensus_genre}</div>
                <div class="kpi-lbl">Consensus Prediction</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-val" style="color: #ff435a;">{agreement_pct:.0f}%</div>
                <div class="kpi-lbl">Model Agreement Rate</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-val" style="color: #ff435a;">{len(all_preds)} Models</div>
                <div class="kpi-lbl">Evaluated Architectures</div>
            </div>
        </div>
        """

        fig = go.Figure()
        palette = ['#ff435a', '#a855f7', '#00f2fe', '#eab308', '#10b981', '#ec4899']
        
        for idx, (m_name, probs) in enumerate(all_preds.items()):
            fig.add_trace(go.Bar(
                name=m_name,
                x=GENRES,
                y=probs * 100,
                marker=dict(color=palette[idx % len(palette)]),
                hovertemplate=f"<b>{m_name}</b><br>Genre: %{{x}}<br>Probability: %{{y:.1f}}%<extra></extra>"
            ))
            
        fig.update_layout(
            title="<b>📊 Multi-Model Backend Probability Benchmark Grid</b>",
            template="plotly_dark",
            paper_bgcolor="rgba(17,17,22,0)",
            plot_bgcolor="rgba(17,17,22,0.6)",
            barmode="group",
            xaxis_title="Music Genre",
            yaxis=dict(title="Probability (%)", range=[0, 105], gridcolor="rgba(255,255,255,0.08)"),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            height=400
        )

        return kpi_html, df_res, fig

    @torch.no_grad()
    def analyze_spectrogram(self, audio_input):
        audio = self._prepare_audio(audio_input)
        mel = audio_to_mel(audio, sr=SAMPLE_RATE)

        fig = go.Figure(data=go.Heatmap(
            z=mel,
            x=np.linspace(0, DURATION, mel.shape[1]),
            y=np.linspace(FMIN, FMAX, N_MELS),
            colorscale="Magma",
            hovertemplate="<b>Time</b>: %{x:.2f}s<br><b>Frequency</b>: %{y:.0f} Hz<br><b>Log Energy</b>: %{z:.1f} dB<extra></extra>"
        ))
        
        fig.update_layout(
            title="<b>🌊 Log-Mel Spectrogram (128 Bands × 30 Seconds)</b>",
            template="plotly_dark",
            paper_bgcolor="rgba(17,17,22,0)",
            plot_bgcolor="rgba(17,17,22,0.6)",
            xaxis=dict(title="Audio Timeline (Seconds)", gridcolor="rgba(255,255,255,0.08)"),
            yaxis=dict(title="Frequency (Hz)", gridcolor="rgba(255,255,255,0.08)"),
            height=380
        )

        rms_energy = float(np.sqrt(np.mean(audio**2)))
        peak_amp = float(np.max(np.abs(audio)))
        mean_db = float(np.mean(mel))
        max_db = float(np.max(mel))
        
        metrics_html = f"""
        <div style="background: #111116; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px;">
            <h4 style="margin-top: 0; color: #ff435a; font-weight: 800;">🎵 Audio Waveform Telemetry</h4>
            <table style="width: 100%; border-collapse: collapse; color: #f4f4f5; font-size: 14px;">
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                    <td style="padding: 8px 0; color: #a1a1aa;">Sampling Rate</td>
                    <td style="text-align: right; font-weight: 700;">{SAMPLE_RATE} Hz</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                    <td style="padding: 8px 0; color: #a1a1aa;">Duration</td>
                    <td style="text-align: right; font-weight: 700;">{DURATION} Seconds</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                    <td style="padding: 8px 0; color: #a1a1aa;">RMS Energy</td>
                    <td style="text-align: right; font-weight: 700;">{rms_energy:.4f}</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                    <td style="padding: 8px 0; color: #a1a1aa;">Peak Amplitude</td>
                    <td style="text-align: right; font-weight: 700;">{peak_amp:.4f}</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                    <td style="padding: 8px 0; color: #a1a1aa;">Max Mel Power</td>
                    <td style="text-align: right; font-weight: 700;">{max_db:.2f} dB</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #a1a1aa;">Mean Mel Power</td>
                    <td style="text-align: right; font-weight: 700;">{mean_db:.2f} dB</td>
                </tr>
            </table>
        </div>
        """

        return fig, metrics_html

    def _plot_timestep_probabilities(self, step_probs, model_name):
        num_classes, num_steps = step_probs.shape
        time_axis = np.linspace(0, DURATION, num_steps)

        fig = go.Figure()
        for i in range(num_classes):
            genre = GENRES[i]
            color = GENRE_COLORS.get(genre, '#ffffff')
            fig.add_trace(go.Scatter(
                x=time_axis,
                y=step_probs[i],
                mode='lines',
                name=f"{GENRE_ICONS.get(genre, '')} {genre}",
                line=dict(color=color, width=2.5, shape='spline'),
                hovertemplate=f"<b>{genre}</b><br>Time: %{{x:.1f}}s<br>Prob: %{{y:.1%}}<extra></extra>"
            ))

        fig.update_layout(
            title=dict(
                text=f"<b>▶ Real-Time Audio Timeline Stream</b> ({model_name})",
                font=dict(size=14, color="#ffffff")
            ),
            template="plotly_dark",
            paper_bgcolor="rgba(17,17,22,0)",
            plot_bgcolor="rgba(17,17,22,0.6)",
            xaxis=dict(title="Audio Timeline (Seconds)", gridcolor="rgba(255,255,255,0.08)"),
            yaxis=dict(title="Probability", range=[-0.02, 1.05], gridcolor="rgba(255,255,255,0.08)"),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            margin=dict(l=40, r=40, t=50, b=40),
            height=340
        )
        return fig

    def _plot_temporal_heatmap(self, step_probs):
        num_steps = step_probs.shape[1]
        time_axis = np.linspace(0, DURATION, num_steps)

        fig = go.Figure(data=go.Heatmap(
            z=step_probs,
            x=time_axis,
            y=GENRES,
            colorscale="Viridis",
            hovertemplate="<b>Genre</b>: %{y}<br><b>Time</b>: %{x:.1f}s<br><b>Probability</b>: %{z:.1%}<extra></extra>"
        ))

        fig.update_layout(
            title="<b>🔥 Spectro-Temporal Genre Probability Heatmap</b>",
            template="plotly_dark",
            paper_bgcolor="rgba(17,17,22,0)",
            plot_bgcolor="rgba(17,17,22,0.6)",
            xaxis=dict(title="Audio Timeline (Seconds)", gridcolor="rgba(255,255,255,0.08)"),
            yaxis=dict(gridcolor="rgba(255,255,255,0.08)"),
            margin=dict(l=40, r=40, t=50, b=40),
            height=300
        )
        return fig

    def _plot_genre_bars(self, probs):
        sorted_indices = np.argsort(probs)
        sorted_genres = [GENRES[i] for i in sorted_indices]
        sorted_probs = [probs[i] * 100 for i in sorted_indices]
        colors = [GENRE_COLORS.get(g, '#ff435a') for g in sorted_genres]

        fig = go.Figure(go.Bar(
            x=sorted_probs,
            y=sorted_genres,
            orientation='h',
            marker=dict(
                color=colors,
                line=dict(color='rgba(255,255,255,0.2)', width=1)
            ),
            text=[f"{p:.1f}%" for p in sorted_probs],
            textposition='outside',
            hovertemplate="<b>%{y}</b>: %{x:.1f}%<extra></extra>"
        ))

        fig.update_layout(
            title="<b>🎯 Genre Confidence Distribution</b>",
            template="plotly_dark",
            paper_bgcolor="rgba(17,17,22,0)",
            plot_bgcolor="rgba(17,17,22,0.6)",
            xaxis=dict(title="Confidence (%)", range=[0, 115], gridcolor="rgba(255,255,255,0.08)"),
            yaxis=dict(gridcolor="rgba(255,255,255,0.08)"),
            margin=dict(l=40, r=40, t=50, b=40),
            height=340
        )
        return fig


# Compatibility Alias
YouTubeSongNetPredictor = SongNetPredictor


def build_app(predictor):
    available_models = [
        "SongNet (Time-Distributed C-RNN)",
        "SongNet (Causal GRU Head)",
        "Classical kNN (k=5)",
        "Classical Logistic Regression",
        "Classical MLP Classifier",
        "Classical Linear SVM"
    ]

    def generate_track_audio(genre_name):
        g_idx = GENRE_TO_IDX.get(genre_name, 0)
        y = generate_synthetic_audio(g_idx, duration=DURATION, sr=SAMPLE_RATE)
        os.makedirs("scratch", exist_ok=True)
        tmp_wav = os.path.join("scratch", f"library_{genre_name.lower().replace('-', '_')}.wav")
        sf.write(tmp_wav, y, SAMPLE_RATE)
        return tmp_wav

    with gr.Blocks(title="Motion Studio - Music AI") as demo:
        # Crimson Wave Backdrop Outer Container
        with gr.Row(elem_classes=["wave-backdrop"]):
            with gr.Column():
                # Top Navigation Bar matching Motion Studio screenshot
                gr.HTML(
                    """
                    <div class="motion-nav-header">
                        <div class="motion-brand">
                            <span class="motion-brand-mark">///</span>
                            <span>Motion Studio</span>
                        </div>
                        <div class="motion-nav-links">
                            <a class="motion-nav-link" href="#">DOCS</a>
                            <a class="motion-nav-link" href="#">EXAMPLES</a>
                            <a class="motion-nav-link" href="#">UI</a>
                            <a class="motion-nav-link" href="#">AI KIT</a>
                            <a class="motion-nav-link active" href="#">STUDIO <span class="motion-badge-new">NEW</span></a>
                        </div>
                        <div>
                            <button class="motion-nav-btn">MOTION+</button>
                        </div>
                    </div>
                    """
                )

        # 2. Spotify/Apple Music Style Sidebar (Your Music Library)
        with gr.Sidebar():
            gr.HTML(
                """
                <div class="music-lib-header-box">
                    <div class="music-lib-title">
                        <span style="font-size: 22px;">📚</span>
                        <span>YOUR MUSIC LIBRARY</span>
                    </div>
                    <div class="music-lib-subtitle">Motion Studio Archive • 8 Presets</div>
                </div>
                """
            )
            
            gr.Markdown("### 🎵 Select Track from Library")
            
            # Interactive Music Library Buttons formatted like Track Items
            lib_track_btns = {}
            for track in TRACK_LIBRARY_METADATA:
                with gr.Group():
                    gr.HTML(
                        f"""
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="background: {track['color']}22; color: {track['color']}; border: 1px solid {track['color']}66; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                                    {track['icon']}
                                </div>
                                <div>
                                    <div style="font-size: 13px; font-weight: 700; color: #f4f4f5;">{track['title']}</div>
                                    <div style="font-size: 11px; color: #a1a1aa;">{track['genre']} • {track['duration']}</div>
                                </div>
                            </div>
                        </div>
                        """
                    )
                    btn = gr.Button(f"▶ Play & Analyze Track", variant="secondary", elem_classes=["track-pill-btn"])
                    lib_track_btns[track["genre"]] = btn

            gr.Markdown("---")
            gr.Markdown("### ➕ Upload Custom Audio Track")
            sidebar_upload = gr.Audio(
                sources=["upload", "microphone"],
                type="filepath",
                label="Add Track to Library"
            )

            gr.HTML(
                f"""
                <div class="sidebar-telemetry-box">
                    <div class="sidebar-telemetry-title">⚡ System Telemetry</div>
                    <div class="sidebar-telemetry-item">
                        <span>Status</span>
                        <span style="color: #ff435a; font-weight: 800;">ONLINE 🟢</span>
                    </div>
                    <div class="sidebar-telemetry-item">
                        <span>Device</span>
                        <span style="color: #ffffff; font-weight: 700;">{str(predictor.device).upper()}</span>
                    </div>
                    <div class="sidebar-telemetry-item">
                        <span>Architecture</span>
                        <span style="color: #ff435a; font-weight: 700;">1D C-RNN</span>
                    </div>
                    <div class="sidebar-telemetry-item">
                        <span>Corpus</span>
                        <span style="color: #ffffff; font-weight: 700;">FMA-Small</span>
                    </div>
                </div>
                """
            )

        # 3. Main Workspace Area (Motion Studio View with Timeline Editor from Screenshot)
        gr.HTML(
            """
            <!-- Interactive Visual Animation & Audio Timeline Editor Widget matching Screenshot -->
            <div class="motion-timeline-container">
                <div class="timeline-scrubber-bar">
                    <span>0.0</span>
                    <span>0.5</span>
                    <span>1.0</span>
                    <span>1.5s</span>
                    <div class="timeline-pin-red"></div>
                </div>
                
                <div class="timeline-track-row">
                    <div class="track-label">h1</div>
                    <div class="track-bar-container">
                        <div class="track-bar-fill" style="width: 85%; margin-left: 5%;">
                            <div class="track-bar-dot-start"></div>
                            <div class="track-bar-dot-end"></div>
                        </div>
                    </div>
                </div>
                
                <div class="timeline-track-row">
                    <div class="track-label">.description</div>
                    <div class="track-bar-container">
                        <div class="track-bar-fill" style="width: 75%; margin-left: 20%;">
                            <div class="track-bar-dot-start"></div>
                            <div class="track-bar-dot-end"></div>
                        </div>
                    </div>
                </div>
                
                <div class="timeline-track-row">
                    <div class="track-label">buttons</div>
                    <div class="track-bar-container">
                        <div class="track-bar-fill" style="width: 65%; margin-left: 32%;">
                            <div class="track-bar-dot-start"></div>
                            <div class="track-bar-dot-end"></div>
                        </div>
                    </div>
                </div>

                <div class="timeline-controls-bar">
                    <span style="color: #71717a; font-size: 14px; margin-right: auto; font-family: monospace;">⏮️</span>
                    <div class="play-time-badge">
                        <span class="play-btn-circle">▶</span>
                        <span>1.62 / 1.52s</span>
                    </div>
                    <span style="color: #71717a; font-size: 14px; font-family: monospace;">🔄</span>
                </div>
            </div>

            <!-- Hero Section Below Editor matching Screenshot -->
            <div class="hero-text-section">
                <h1 class="hero-main-title">Motion Studio</h1>
                <p class="hero-description-text">
                    A visual animation and audio classifier for your music. Seamlessly edit alongside the new Ultramotion agent to create the perfect sound, then let it write straight to code.
                </p>
            </div>
            """
        )

        with gr.Tabs():
            # TAB 1: Real-Time Audio Studio
            with gr.Tab("🎧 Motion Track Classifier"):
                with gr.Row():
                    # Left Column: Controls & AI Assistant Floating Prompt
                    with gr.Column(scale=1):
                        gr.Markdown("### 🎛️ Studio Controls")
                        model_selector = gr.Dropdown(
                            choices=available_models,
                            value="SongNet (Time-Distributed C-RNN)",
                            label="Select Backend AI Architecture"
                        )
                        audio_input = gr.Audio(
                            sources=["upload", "microphone"],
                            type="filepath",
                            label="Active Audio Track Slot"
                        )
                        predict_btn = gr.Button("EXPLORE MOTION STUDIO  >", elem_classes=["btn-coral-primary"])

                        gr.HTML(
                            """
                            <div class="ai-prompt-box">
                                <div style="font-size: 12px; font-weight: 800; color: #ff435a; margin-bottom: 8px;">AI PROMPT ASSISTANT</div>
                                <div class="ai-tag-pills">
                                    <span class="ai-tag-pill">Faster</span>
                                    <span class="ai-tag-pill">Add spring overshoot</span>
                                    <span class="ai-tag-pill">Remove the stagger</span>
                                    <span class="ai-tag-pill">Make it softer</span>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <input type="text" placeholder="What should change?" style="flex-grow: 1; background: #14141a; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 8px 12px; border-radius: 8px; font-size: 13px;" />
                                    <button style="background: #ff435a; color: #fff; border: none; border-radius: 8px; width: 36px; height: 36px; font-weight: bold; cursor: pointer;">↑</button>
                                </div>
                            </div>
                            """
                        )

                    # Right Column: Prediction Dashboard
                    with gr.Column(scale=2):
                        gr.Markdown("### 📊 Live Classification Dashboard")
                        status_output = gr.HTML("""
                        <div class="hero-status-card">
                            <div style="color: #ff435a; font-size: 11px; font-weight: 800; text-transform: uppercase;">AWAITING AUDIO INPUT</div>
                            <div class="hero-genre-name">🎵 Ready for Track Analysis</div>
                            <div style="color: #a1a1aa; font-size: 13px; margin-top: 6px;">
                                Select any track from the Music Library in the sidebar or upload a file to start real-time prediction.
                            </div>
                        </div>
                        """)
                        
                        label_output = gr.Label(num_top_classes=8, label="Genre Probability Distribution")
                        
                        with gr.Row():
                            line_plot_output = gr.Plot(label="Real-Time Probability Stream")
                            bar_plot_output = gr.Plot(label="Genre Distribution")
                            
                        heatmap_plot_output = gr.Plot(label="Spectro-Temporal Genre Heatmap")

                predict_btn.click(
                    fn=predictor.predict_single,
                    inputs=[audio_input, model_selector],
                    outputs=[status_output, label_output, line_plot_output, heatmap_plot_output, bar_plot_output]
                )

                # Connect Sidebar Music Library buttons
                for genre, btn in lib_track_btns.items():
                    btn.click(
                        fn=lambda g=genre: generate_track_audio(g),
                        inputs=[],
                        outputs=[audio_input]
                    ).then(
                        fn=predictor.predict_single,
                        inputs=[audio_input, model_selector],
                        outputs=[status_output, label_output, line_plot_output, heatmap_plot_output, bar_plot_output]
                    )

                sidebar_upload.change(
                    fn=lambda x: x,
                    inputs=[sidebar_upload],
                    outputs=[audio_input]
                ).then(
                    fn=predictor.predict_single,
                    inputs=[audio_input, model_selector],
                    outputs=[status_output, label_output, line_plot_output, heatmap_plot_output, bar_plot_output]
                )

            # TAB 2: Multi-Model Backend Analytics Grid
            with gr.Tab("📊 Multi-Model Backend Benchmark"):
                gr.Markdown("### Benchmark predictions across ALL 6 Backend Models simultaneously!")
                compare_btn = gr.Button("RUN MULTI-MODEL BACKEND COMPARISON  >", elem_classes=["btn-coral-primary"])
                
                kpi_output = gr.HTML()
                
                with gr.Row():
                    comp_table = gr.Dataframe(label="Backend Models Comparative Leaderboard Table")
                    
                with gr.Row():
                    comp_plot = gr.Plot(label="Multi-Model Backend Inference Analytics Chart")

                compare_btn.click(
                    fn=predictor.compare_all_models,
                    inputs=[audio_input],
                    outputs=[kpi_output, comp_table, comp_plot]
                )

            # TAB 3: Spectrogram & Signal Inspector
            with gr.Tab("🌊 Signal Inspector & Spectrogram"):
                gr.Markdown("### Inspect Log-Mel Spectrogram and Acoustic Features of the Loaded Track")
                spec_btn = gr.Button("ANALYZE AUDIO SPECTROGRAM & FEATURES  >", elem_classes=["btn-coral-primary"])
                
                with gr.Row():
                    with gr.Column(scale=2):
                        spec_plot = gr.Plot(label="Log-Mel Spectrogram")
                    with gr.Column(scale=1):
                        metrics_output = gr.HTML()

                spec_btn.click(
                    fn=predictor.analyze_spectrogram,
                    inputs=[audio_input],
                    outputs=[spec_plot, metrics_output]
                )

            # TAB 4: About the App & Project Metadata
            with gr.Tab("ℹ️ About & Documentation"):
                gr.HTML(
                    """
                    <div class="about-card">
                        <div class="about-card-title">Motion Studio AI Engine</div>
                        <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                            <strong>UE24CS352A Machine Learning Mini-Project</strong><br>
                            An end-to-end Machine Learning and Deep Learning system for automated music genre classification from raw audio signals, extending the Stanford CS229 paper by Zhang, Zhang, & Chen (2018).
                        </p>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                        <div class="about-card">
                            <div class="about-card-title">🧠 Deep Learning Backbone</div>
                            <ul style="color: #a1a1aa; font-size: 13px; line-height: 1.8; padding-left: 20px;">
                                <li><strong>3-Stage 1D Conv Network</strong>: Conv1d(128→256) + BatchNorm + ReLU + MaxPool1d + Dropout.</li>
                                <li><strong>Time-Distributed Head</strong>: Per-timestep 1x1 Conv output for real-time frame classification.</li>
                                <li><strong>Causal GRU Head</strong>: Unidirectional GRU layer for streaming sequential memory.</li>
                            </ul>
                        </div>
                        <div class="about-card">
                            <div class="about-card-title">📊 Classical ML Baselines</div>
                            <ul style="color: #a1a1aa; font-size: 13px; line-height: 1.8; padding-left: 20px;">
                                <li><strong>Hand-crafted Features</strong>: Spectral Centroid, Rolloff, Zero-Crossing Rate, MFCC statistics.</li>
                                <li><strong>Evaluated Models</strong>: kNN (k=5), Logistic Regression, Multi-Layer Perceptron (MLP), Linear SVM.</li>
                                <li><strong>Empirical Benchmark</strong>: Direct comparison against deep C-RNN representations.</li>
                            </ul>
                        </div>
                    </div>

                    <div class="about-card">
                        <div class="about-card-title">📦 Dataset & Stratified Pipeline</div>
                        <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                            Evaluated on the <strong>FMA-Small (Free Music Archive)</strong> dataset containing 8,000 tracks (30 seconds each, 22.05 kHz) balanced across 8 genres: 
                            <span style="color: #00f2fe; font-weight: 700;">Electronic</span>, 
                            <span style="color: #a855f7; font-weight: 700;">Experimental</span>, 
                            <span style="color: #eab308; font-weight: 700;">Folk</span>, 
                            <span style="color: #ff0055; font-weight: 700;">Hip-Hop</span>, 
                            <span style="color: #3b82f6; font-weight: 700;">Instrumental</span>, 
                            <span style="color: #10b981; font-weight: 700;">International</span>, 
                            <span style="color: #ec4899; font-weight: 700;">Pop</span>, and 
                            <span style="color: #f97316; font-weight: 700;">Rock</span>.
                        </p>
                    </div>
                    """
                )

    return demo


def main():
    parser = argparse.ArgumentParser(description="Run Motion Studio AI App.")
    parser.add_argument("--data_dir", type=str, default="data/processed", help="Path to preprocessed data directory.")
    parser.add_argument("--runs_dir", type=str, default="runs", help="Path to trained models directory.")
    parser.add_argument("--results_dir", type=str, default="results", help="Path to results directory.")
    parser.add_argument("--share", action="store_true", help="Generate public Gradio share link.")
    parser.add_argument("--port", type=int, default=7860, help="Port to run Gradio app.")
    args = parser.parse_args()

    predictor = SongNetPredictor(data_dir=args.data_dir, runs_dir=args.runs_dir, results_dir=args.results_dir)
    app = build_app(predictor)
    
    theme = gr.themes.Soft(
        primary_hue="red",
        secondary_hue="slate",
        neutral_hue="zinc"
    ).set(
        body_background_fill="#050508",
        body_text_color="#f4f4f5",
        block_background_fill="#111116",
        block_border_color="rgba(255, 255, 255, 0.08)",
        block_label_background_fill="#1a1a20",
        block_label_text_color="#ff435a",
        block_title_text_color="#ffffff",
        input_background_fill="#14141a",
        input_border_color="rgba(255, 255, 255, 0.1)"
    )
    
    print(f"\nLaunching Motion Studio AI App on http://127.0.0.1:{args.port} ...")
    app.launch(
        server_name="127.0.0.1",
        server_port=args.port,
        share=args.share,
        theme=theme,
        css=CUSTOM_CSS,
        js="() => { document.documentElement.classList.add('dark'); document.body.classList.add('dark'); }"
    )


if __name__ == "__main__":
    main()
