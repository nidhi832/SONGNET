"""
Common audio configuration and spectrogram utility functions for SongNet.
"""

import os
import json
import numpy as np
import librosa

# Audio processing hyperparameters
SAMPLE_RATE = 22050
DURATION = 30  # seconds per FMA track
TARGET_SAMPLES = SAMPLE_RATE * DURATION  # 661,500 samples
N_FFT = 2048
HOP_LENGTH = 512
N_MELS = 128
FMIN = 20
FMAX = 11025

# 8 genres in FMA-Small dataset (alphabetical order as in FMA metadata)
GENRES = [
    "Electronic",
    "Experimental",
    "Folk",
    "Hip-Hop",
    "Instrumental",
    "International",
    "Pop",
    "Rock"
]

GENRE_TO_IDX = {g: i for i, g in enumerate(GENRES)}
IDX_TO_GENRE = {i: g for i, g in enumerate(GENRES)}


def audio_to_mel(y, sr=SAMPLE_RATE):
    """
    Convert 1D audio waveform into log-Mel spectrogram.
    Returns array of shape (N_MELS, Timesteps).
    """
    if len(y) == 0:
        y = np.zeros(TARGET_SAMPLES, dtype=np.float32)
    
    # Compute Mel spectrogram
    S = librosa.feature.melspectrogram(
        y=y,
        sr=sr,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
        n_mels=N_MELS,
        fmin=FMIN,
        fmax=FMAX
    )
    # Convert to log scale (dB)
    log_S = librosa.power_to_db(S, ref=np.max)
    return log_S.astype(np.float32)


def load_audio_file(filepath, duration=DURATION, sr=SAMPLE_RATE):
    """
    Robust universal audio file loader supporting ALL audio and video formats:
    MP3, MP4, WAV, M4A, AAC, OGG, FLAC, MOV, AVI, MKV, WMA, WebM, etc.
    """
    y = None
    errors = []

    # 1. Primary: Try pydub (handles MP3, MP4, M4A, AAC, MOV, MKV, AVI, etc.)
    try:
        from pydub import AudioSegment
        seg = AudioSegment.from_file(filepath)
        seg = seg.set_frame_rate(sr).set_channels(1)
        samples = np.array(seg.get_array_of_samples(), dtype=np.float32)
        if seg.sample_width == 2:    # 16-bit PCM
            samples = samples / 32768.0
        elif seg.sample_width == 4:  # 32-bit PCM
            samples = samples / 2147483648.0
        elif seg.sample_width == 1:  # 8-bit PCM
            samples = (samples - 128.0) / 128.0
        y = samples
    except Exception as e_pydub:
        errors.append(f"pydub: {e_pydub}")

    # 2. Secondary: Try librosa.load
    if y is None:
        try:
            y, _ = librosa.load(filepath, sr=sr, duration=duration, res_type='kaiser_fast')
        except Exception as e_librosa:
            errors.append(f"librosa: {e_librosa}")

    # 3. Tertiary: Try soundfile
    if y is None:
        try:
            import soundfile as sf
            y, file_sr = sf.read(filepath)
            if len(y.shape) > 1:
                y = np.mean(y, axis=1)
            if file_sr != sr:
                y = librosa.resample(y.astype(np.float32), orig_sr=file_sr, target_sr=sr)
        except Exception as e_sf:
            errors.append(f"soundfile: {e_sf}")

    # 4. Quaternary: Try scipy.io.wavfile
    if y is None:
        try:
            from scipy.io import wavfile
            file_sr, y = wavfile.read(filepath)
            y = y.astype(np.float32)
            if len(y.shape) > 1:
                y = np.mean(y, axis=1)
            max_val = np.max(np.abs(y))
            if max_val > 1.0:
                y = y / max_val
            if file_sr != sr:
                y = librosa.resample(y, orig_sr=file_sr, target_sr=sr)
        except Exception as e_scipy:
            errors.append(f"scipy: {e_scipy}")

    if y is None or len(y) == 0:
        raise RuntimeError(f"Could not read audio/video file '{filepath}'. Decoder errors:\n" + "\n".join(errors))

    # Pad or crop to exact target length
    target_len = int(sr * duration)
    if len(y) < target_len:
        y = np.pad(y, (0, target_len - len(y)), mode='constant')
    elif len(y) > target_len:
        y = y[:target_len]

    return y.astype(np.float32)


def generate_synthetic_audio(genre_idx, duration=DURATION, sr=SAMPLE_RATE):
    """
    Generate synthetic audio waveform with genre-specific spectral characteristics.
    Used for smoke testing, offline dry-runs, and real-time testing.
    """
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    
    # Base frequencies per genre to make spectrograms distinct
    base_freqs = [100, 220, 440, 80, 523, 330, 659, 293]
    f0 = base_freqs[genre_idx % len(base_freqs)]
    
    # Tone + harmonics + modulation
    signal = np.sin(2 * np.pi * f0 * t) * 0.4
    signal += np.sin(2 * np.pi * f0 * 1.5 * t) * 0.2
    signal += np.sin(2 * np.pi * f0 * 2.0 * t) * 0.1
    
    # Add rhythm / pulse (different beats per genre)
    bpm_list = [128, 90, 110, 95, 75, 105, 120, 140]
    bpm = bpm_list[genre_idx % len(bpm_list)]
    beat_freq = bpm / 60.0
    envelope = 0.5 + 0.5 * np.cos(2 * np.pi * beat_freq * t)
    signal = signal * envelope
    
    # Add white noise for texture
    noise = np.random.randn(len(t)) * 0.05
    audio = (signal + noise).astype(np.float32)
    
    # Normalize amplitude
    max_val = np.max(np.abs(audio))
    if max_val > 0:
        audio = audio / max_val
        
    return audio
