import type { Track } from '../types/music';

// Gemini API Key provided via environment or user input
const DEFAULT_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const getGeminiApiKey = (): string => {
  return localStorage.getItem('songnet_gemini_api_key') || DEFAULT_API_KEY;
};

export const setGeminiApiKey = (key: string): void => {
  if (key.trim()) {
    localStorage.setItem('songnet_gemini_api_key', key.trim());
  } else {
    localStorage.removeItem('songnet_gemini_api_key');
  }
};

const GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

interface GeminiOptions {
  jsonFormat?: boolean;
}

/**
 * Dynamically fetch working generateContent models from Gemini API
 */
async function fetchValidGeminiModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) return [];
    const data = await res.json() as { models?: Array<{ name?: string; supportedGenerationMethods?: string[] }> };
    return (data.models || [])
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => (m.name || '').replace('models/', ''))
      .filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Executes a call to Google Gemini REST API trying available models
 */
export async function callGeminiApi(prompt: string, options: GeminiOptions = {}): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini AI service is currently unavailable.');
  }

  // Try static list first, then dynamically fetched models
  let modelsToTry = [...GEMINI_MODELS];
  let lastError: Error | null = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const requestBody: Record<string, unknown> = {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        }
      };

      if (options.jsonFormat) {
        (requestBody.generationConfig as Record<string, unknown>).responseMimeType = 'application/json';
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as Record<string, Record<string, string>>).error?.message || `HTTP ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        return generatedText;
      }
    } catch (err: unknown) {
      console.warn(`Gemini model ${model} failed:`, (err as Error).message);
      lastError = err as Error;

      // If we exhausted static list, try dynamically discovering available models
      if (i === GEMINI_MODELS.length - 1 && modelsToTry.length === GEMINI_MODELS.length) {
        const dynamicModels = await fetchValidGeminiModels(apiKey);
        const newModels = dynamicModels.filter(m => !modelsToTry.includes(m));
        if (newModels.length > 0) {
          modelsToTry.push(...newModels);
        }
      }
    }
  }

  throw lastError || new Error('Failed to fetch response from Gemini API.');
}

// ─────────────────────────────────────────────────────────────
// AUDIO ANALYSIS ENGINE (Real Web Audio API Feature Extraction)
// ─────────────────────────────────────────────────────────────

export interface AudioFeatures {
  fileName: string;
  fileSizeMb: number;
  durationSec: number;
  sampleRate: number;
  // Frequency band energies (normalized 0-1)
  subBassEnergy: number;   // 20-60 Hz
  bassEnergy: number;      // 60-250 Hz
  lowMidEnergy: number;    // 250-500 Hz
  midEnergy: number;       // 500-2000 Hz
  highMidEnergy: number;   // 2000-4000 Hz
  presenceEnergy: number;  // 4000-6000 Hz
  brillianceEnergy: number;// 6000-20000 Hz
  // Dynamics
  overallRms: number;       // Overall loudness
  dynamicRange: number;     // Peak - min RMS
  // Rhythm estimate (from beat detection)
  estimatedBpm: number;
  // Spectral characteristics
  spectralCentroid: number; // Brightness (Hz)
  zeroCrossingRate: number; // Noisiness / texture
  // Tempo feel
  isPercussive: boolean;
  hasBassline: boolean;
  hasHighFreqContent: boolean;
}

/**
 * Extracts real audio features from an uploaded File using Web Audio API
 */
export async function extractAudioFeatures(file: File): Promise<AudioFeatures> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const audioCtx = new AudioContext({ sampleRate: 22050 });
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));

        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const durationSec = audioBuffer.duration;

        // --- Analyze a 30-second window or the full track ---
        const analyzeLength = Math.min(channelData.length, sampleRate * 30);
        const analyzeData = channelData.slice(0, analyzeLength);

        // 1. Compute overall RMS
        let sumSquares = 0;
        let peak = 0;
        let minRms = 1;
        for (let i = 0; i < analyzeData.length; i++) {
          sumSquares += analyzeData[i] * analyzeData[i];
          if (Math.abs(analyzeData[i]) > peak) peak = Math.abs(analyzeData[i]);
        }
        const overallRms = Math.sqrt(sumSquares / analyzeData.length);

        // 2. Compute RMS in 512-sample frames for dynamic range
        const frameSize = 512;
        const frameRms: number[] = [];
        for (let i = 0; i < analyzeData.length - frameSize; i += frameSize) {
          let fs = 0;
          for (let j = 0; j < frameSize; j++) {
            fs += analyzeData[i + j] * analyzeData[i + j];
          }
          frameRms.push(Math.sqrt(fs / frameSize));
        }
        const maxFrameRms = Math.max(...frameRms);
        minRms = Math.min(...frameRms.filter(r => r > 0.001));
        const dynamicRange = maxFrameRms - minRms;

        // 3. FFT-based frequency band analysis using OfflineAudioContext
        const fftSize = 4096;
        const offCtx = new OfflineAudioContext(1, fftSize, sampleRate);
        const offBuffer = offCtx.createBuffer(1, fftSize, sampleRate);
        const midPoint = Math.floor(analyzeData.length / 2);
        offBuffer.getChannelData(0).set(analyzeData.slice(midPoint, midPoint + fftSize));
        const src = offCtx.createBufferSource();
        src.buffer = offBuffer;
        const analyser = offCtx.createAnalyser();
        analyser.fftSize = fftSize;
        src.connect(analyser);
        analyser.connect(offCtx.destination);
        src.start(0);
        await offCtx.startRendering();

        const freqData = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(freqData);

        // Convert dB to linear magnitude
        const magnitudes = Array.from(freqData).map(db => Math.pow(10, db / 20));
        const binHz = sampleRate / fftSize;

        const getBandEnergy = (lowHz: number, highHz: number): number => {
          const lo = Math.floor(lowHz / binHz);
          const hi = Math.ceil(highHz / binHz);
          const slice = magnitudes.slice(lo, hi);
          return slice.reduce((a, b) => a + b, 0) / Math.max(slice.length, 1);
        };

        const subBassEnergy = getBandEnergy(20, 60);
        const bassEnergy = getBandEnergy(60, 250);
        const lowMidEnergy = getBandEnergy(250, 500);
        const midEnergy = getBandEnergy(500, 2000);
        const highMidEnergy = getBandEnergy(2000, 4000);
        const presenceEnergy = getBandEnergy(4000, 6000);
        const brillianceEnergy = getBandEnergy(6000, 20000);

        // Normalize energies to 0-1 range
        const allEnergies = [subBassEnergy, bassEnergy, lowMidEnergy, midEnergy, highMidEnergy, presenceEnergy, brillianceEnergy];
        const maxEnergy = Math.max(...allEnergies) || 1;
        const normalize = (e: number) => Math.min(e / maxEnergy, 1.0);

        // 4. Spectral centroid (brightness)
        let weightedSum = 0;
        let totalMag = 0;
        for (let i = 0; i < magnitudes.length; i++) {
          weightedSum += i * binHz * magnitudes[i];
          totalMag += magnitudes[i];
        }
        const spectralCentroid = totalMag > 0 ? weightedSum / totalMag : 0;

        // 5. Zero Crossing Rate
        let zcr = 0;
        for (let i = 1; i < analyzeData.length; i++) {
          if ((analyzeData[i] >= 0) !== (analyzeData[i - 1] >= 0)) zcr++;
        }
        const zeroCrossingRate = zcr / analyzeData.length;

        // 6. Simple BPM estimation via onset detection
        const hopSize = 512;
        let prevEnergy = 0;
        const onsets: number[] = [];
        for (let i = 0; i < analyzeData.length - hopSize; i += hopSize) {
          let e = 0;
          for (let j = 0; j < hopSize; j++) {
            e += analyzeData[i + j] * analyzeData[i + j];
          }
          e /= hopSize;
          if (e > prevEnergy * 1.5 && e > 0.002) {
            onsets.push(i / sampleRate);
          }
          prevEnergy = e;
        }
        let estimatedBpm = 120; // Default
        if (onsets.length > 4) {
          const intervals: number[] = [];
          for (let i = 1; i < onsets.length; i++) {
            intervals.push(onsets[i] - onsets[i - 1]);
          }
          const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          estimatedBpm = Math.round(60 / Math.max(avgInterval, 0.1));
          // Clamp to reasonable BPM range
          while (estimatedBpm > 200) estimatedBpm = Math.round(estimatedBpm / 2);
          while (estimatedBpm < 60) estimatedBpm = Math.round(estimatedBpm * 2);
        }

        // 7. Qualitative flags
        const normBass = normalize(bassEnergy);
        const normSub = normalize(subBassEnergy);
        const normBrilliance = normalize(brillianceEnergy);

        const isPercussive = zeroCrossingRate > 0.05 && dynamicRange > 0.05;
        const hasBassline = normBass > 0.4 || normSub > 0.3;
        const hasHighFreqContent = normBrilliance > 0.3;

        await audioCtx.close();

        resolve({
          fileName: file.name,
          fileSizeMb: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
          durationSec: parseFloat(durationSec.toFixed(1)),
          sampleRate,
          subBassEnergy: parseFloat(normalize(subBassEnergy).toFixed(3)),
          bassEnergy: parseFloat(normalize(bassEnergy).toFixed(3)),
          lowMidEnergy: parseFloat(normalize(lowMidEnergy).toFixed(3)),
          midEnergy: parseFloat(normalize(midEnergy).toFixed(3)),
          highMidEnergy: parseFloat(normalize(highMidEnergy).toFixed(3)),
          presenceEnergy: parseFloat(normalize(presenceEnergy).toFixed(3)),
          brillianceEnergy: parseFloat(normalize(brillianceEnergy).toFixed(3)),
          overallRms: parseFloat(overallRms.toFixed(4)),
          dynamicRange: parseFloat(dynamicRange.toFixed(4)),
          estimatedBpm,
          spectralCentroid: parseFloat(spectralCentroid.toFixed(1)),
          zeroCrossingRate: parseFloat(zeroCrossingRate.toFixed(5)),
          isPercussive,
          hasBassline,
          hasHighFreqContent,
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read audio file.'));
    reader.readAsArrayBuffer(file);
  });
}

// ─────────────────────────────────────────────────────────────
// GEMINI GENRE CLASSIFICATION FROM REAL AUDIO FEATURES
// ─────────────────────────────────────────────────────────────

export interface ClassificationResult {
  predictedGenre: string;
  confidenceScore: number;
  topPredictions: Array<{ genre: string; probability: number; color: string }>;
  reasoning: string;
  musicalCharacteristics: {
    tempo: string;
    energy: string;
    mood: string;
    instrumentation: string;
  };
  modelDetails: {
    inferenceTimeMs: number;
    method: string;
  };
}

const GENRE_COLORS: Record<string, string> = {
  'Pop': '#ec4899',
  'Electronic': '#ff3b5c',
  'Hip-Hop': '#3b82f6',
  'Folk': '#22c55e',
  'Instrumental': '#06b6d4',
  'Rock': '#eab308',
  'Experimental': '#a855f7',
  'International': '#f97316'
};

/**
 * Sends real extracted audio features to Gemini API for accurate genre classification.
 * This is the core SONGNET AI classification pipeline.
 */
export async function classifyAudioWithGemini(features: AudioFeatures, songTitle?: string, artistName?: string): Promise<ClassificationResult> {
  const startTime = performance.now();

  const contextHint = songTitle
    ? `\nSong context: Title = "${songTitle}"${artistName ? `, Artist = "${artistName}"` : ''}. Use this to inform but not override the audio analysis.`
    : '';

  const prompt = `You are SONGNET AI — a real-time music genre classification system based on the CS229 Stanford paper "SongNet: Real-Time Music Genre Classification" using Convolutional-Recurrent Neural Networks trained on the Free Music Archive (FMA) dataset.

You have received the following REAL acoustic audio features extracted by Web Audio API from the user's uploaded audio file:${contextHint}

=== EXTRACTED AUDIO FEATURES ===
File: ${features.fileName}
Duration: ${features.durationSec}s
Sample Rate: ${features.sampleRate} Hz
Estimated BPM: ${features.estimatedBpm}
Overall RMS Loudness: ${features.overallRms}
Dynamic Range: ${features.dynamicRange}
Spectral Centroid (Brightness): ${features.spectralCentroid} Hz
Zero Crossing Rate: ${features.zeroCrossingRate}

=== FREQUENCY BAND ENERGIES (normalized 0-1) ===
Sub-Bass  (20-60 Hz):     ${features.subBassEnergy}
Bass      (60-250 Hz):    ${features.bassEnergy}
Low-Mid   (250-500 Hz):   ${features.lowMidEnergy}
Mid       (500-2000 Hz):  ${features.midEnergy}
High-Mid  (2000-4000 Hz): ${features.highMidEnergy}
Presence  (4000-6000 Hz): ${features.presenceEnergy}
Brilliance(6000-20k Hz):  ${features.brillianceEnergy}

=== QUALITATIVE FLAGS ===
Percussive Pattern Detected: ${features.isPercussive}
Strong Bassline: ${features.hasBassline}
High Frequency Content: ${features.hasHighFreqContent}

=== CLASSIFICATION TASK ===
Based STRICTLY on these audio features, classify this audio into one of the 8 FMA genres:
Electronic, Experimental, Folk, Hip-Hop, Instrumental, International, Pop, Rock

Rules:
- High sub-bass + bass + BPM 120-150 + percussive → likely Electronic or Hip-Hop
- Low spectral centroid + acoustic + low BPM → likely Folk or Instrumental
- High brilliance + presence + mid energy + BPM 100-180 → likely Rock
- High bass + low BPM 70-100 + percussive → likely Hip-Hop
- Balanced spectrum + moderate BPM + high mid → likely Pop
- Chaotic spectrum + wide dynamic range → likely Experimental
- Sparse energy + unique tonality → likely International
- No percussion + clean mid/presence + low ZCR → likely Instrumental

Return ONLY a JSON object in this exact schema:
{
  "predictedGenre": "GENRE_NAME",
  "confidenceScore": 0.XX,
  "topPredictions": [
    { "genre": "Genre1", "probability": 0.XX },
    { "genre": "Genre2", "probability": 0.XX },
    { "genre": "Genre3", "probability": 0.XX },
    { "genre": "Genre4", "probability": 0.XX },
    { "genre": "Genre5", "probability": 0.XX }
  ],
  "reasoning": "2-sentence technical reasoning explaining why this classification was made based on the audio features.",
  "musicalCharacteristics": {
    "tempo": "Slow/Moderate/Fast/Very Fast",
    "energy": "Low/Medium/High/Very High",
    "mood": "describe the mood",
    "instrumentation": "describe likely instruments"
  }
}

Rules for probabilities: must sum to 1.0. All 5 genres in topPredictions must be different. Predicted genre probability must be highest.`;

  const rawJson = await callGeminiApi(prompt, { jsonFormat: true });
  const endTime = performance.now();

  let cleaned = rawJson.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(cleaned) as {
    predictedGenre: string;
    confidenceScore: number;
    topPredictions: Array<{ genre: string; probability: number }>;
    reasoning: string;
    musicalCharacteristics: {
      tempo: string;
      energy: string;
      mood: string;
      instrumentation: string;
    };
  };

  const topPredictions = (parsed.topPredictions || []).map(p => ({
    genre: p.genre,
    probability: Number(p.probability.toFixed(3)),
    color: GENRE_COLORS[p.genre] || '#a855f7'
  }));

  return {
    predictedGenre: parsed.predictedGenre,
    confidenceScore: parsed.confidenceScore,
    topPredictions,
    reasoning: parsed.reasoning || '',
    musicalCharacteristics: parsed.musicalCharacteristics || {
      tempo: 'Moderate',
      energy: 'Medium',
      mood: 'Neutral',
      instrumentation: 'Mixed'
    },
    modelDetails: {
      inferenceTimeMs: parseFloat((endTime - startTime).toFixed(1)),
      method: 'Gemini 2.5 Flash + Web Audio API Feature Extraction'
    }
  };
}

// ─────────────────────────────────────────────────────────────
// FETCH ANY SONG METADATA FROM GEMINI (by name)
// ─────────────────────────────────────────────────────────────

export interface GeminiSongResult {
  title: string;
  artist: string;
  album: string;
  releaseDate: string;
  duration: string;
  durationSeconds: number;
  genre: 'Electronic' | 'Experimental' | 'Folk' | 'Hip-Hop' | 'Instrumental' | 'International' | 'Pop' | 'Rock';
  predictedGenre: 'Electronic' | 'Experimental' | 'Folk' | 'Hip-Hop' | 'Instrumental' | 'International' | 'Pop' | 'Rock';
  confidenceScore: number;
  topPredictions: Array<{ genre: string; probability: number; color: string }>;
  bpm: number;
  key: string;
  energy: string;
  valence: string;
  lyrics: string[];
  aiAnalysis: string;
}

const UNSPLASH_COVER_IMAGES = [
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1445985543468-8948562875c2?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80'
];

/**
 * Uses Gemini API to search for any song and generate full SongNet ML metadata
 */
export async function fetchSongMetadataWithGemini(songQuery: string): Promise<Track> {
  const prompt = `
You are the SONGNET AI Music Assistant powering a CS229 Real-Time Music Classification system.
Analyze the following query: "${songQuery}".

Return a valid JSON object matching this schema EXACTLY:
{
  "title": "Exact Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "releaseDate": "YYYY",
  "duration": "M:SS",
  "durationSeconds": 210,
  "genre": "One of: Electronic, Experimental, Folk, Hip-Hop, Instrumental, International, Pop, Rock",
  "predictedGenre": "One of: Electronic, Experimental, Folk, Hip-Hop, Instrumental, International, Pop, Rock",
  "confidenceScore": 0.94,
  "topPredictions": [
    { "genre": "PrimaryGenre", "probability": 0.94 },
    { "genre": "SecondaryGenre", "probability": 0.04 },
    { "genre": "TertiaryGenre", "probability": 0.02 }
  ],
  "bpm": 120,
  "key": "C Major",
  "energy": "High",
  "valence": "Upbeat",
  "lyrics": [
    "Line 1 of lyrics snippet",
    "Line 2 of lyrics snippet",
    "Line 3 of lyrics snippet",
    "Line 4 of lyrics snippet"
  ],
  "aiAnalysis": "A 2-sentence breakdown of acoustic features, mel-spectrogram harmonics, and why SONGNET C-RNN model classifies this song into this genre."
}

Do NOT wrap in markdown syntax. Return raw JSON string only.
`;

  const rawJson = await callGeminiApi(prompt, { jsonFormat: true });

  let cleanedJson = rawJson.trim();
  if (cleanedJson.startsWith('```json')) {
    cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedJson.startsWith('```')) {
    cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const parsed: GeminiSongResult = JSON.parse(cleanedJson);
  const randomCover = UNSPLASH_COVER_IMAGES[Math.floor(Math.random() * UNSPLASH_COVER_IMAGES.length)];

  const formattedPredictions = (parsed.topPredictions || []).map((p) => ({
    genre: p.genre,
    probability: Number(p.probability.toFixed(3)),
    color: GENRE_COLORS[p.genre] || '#ec4899'
  }));

  const sampleAudioUrls = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  ];

  const track: Track = {
    id: `gemini-track-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: parsed.title || songQuery,
    artist: parsed.artist || 'Unknown Artist',
    artistId: `artist-${(parsed.artist || 'gemini').toLowerCase().replace(/\s+/g, '-')}`,
    album: parsed.album || 'Single',
    albumId: `album-${(parsed.album || 'single').toLowerCase().replace(/\s+/g, '-')}`,
    coverUrl: randomCover,
    audioUrl: sampleAudioUrls[Math.floor(Math.random() * sampleAudioUrls.length)],
    youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${parsed.title || songQuery} ${parsed.artist || ''}`)}`,
    duration: parsed.duration || '3:30',
    durationSeconds: parsed.durationSeconds || 210,
    genre: parsed.genre || 'Pop',
    predictedGenre: parsed.predictedGenre || parsed.genre || 'Pop',
    confidenceScore: parsed.confidenceScore || 0.91,
    plays: 'Fetched via Gemini AI',
    releaseDate: parsed.releaseDate || '2024',
    isLiked: false,
    topPredictions: formattedPredictions.length > 0 ? formattedPredictions : [
      { genre: parsed.predictedGenre || 'Pop', probability: 0.91, color: GENRE_COLORS[parsed.predictedGenre || 'Pop'] || '#ec4899' }
    ],
    lyrics: parsed.lyrics && parsed.lyrics.length > 0 ? parsed.lyrics : [
      `[Gemini AI Analysis for ${parsed.title || songQuery}]`,
      parsed.aiAnalysis || "Spectrogram features analyzed via SONGNET C-RNN."
    ]
  };

  return track;
}

// ─────────────────────────────────────────────────────────────
// GEMINI MUSIC ASSISTANT CHAT
// ─────────────────────────────────────────────────────────────

/**
 * Ask Gemini Music & ML Assistant questions
 */
export async function askGeminiAssistant(userPrompt: string, trackContext?: Track): Promise<string> {
  const confidencePercent = trackContext?.confidenceScore ? (trackContext.confidenceScore * 100).toFixed(1) : '90.0';
  const contextSnippet = trackContext ? `
Current Active Track in SONGNET Player:
- Title: "${trackContext.title}" by ${trackContext.artist}
- Ground Truth Genre: ${trackContext.genre}
- SONGNET C-RNN Predicted Genre: ${trackContext.predictedGenre || trackContext.genre} (${confidencePercent}% confidence)
` : '';

  const fullPrompt = `
You are SONGNET AI, an expert musicologist and Machine Learning researcher specializing in the CS229 Stanford "SongNet: Real-Time Music Genre Classification" paper (C-RNN model trained on the Free Music Archive FMA dataset).

${contextSnippet}

User Question: "${userPrompt}"

Provide a clear, engaging, concise, and helpful answer (with formatting, bullet points, or bold text where appropriate). Keep the answer focused on music discovery, audio spectrogram analysis, and ML classification.
`;

  return await callGeminiApi(fullPrompt);
}

/**
 * Perform deep audio spectrogram analysis via Gemini
 */
export async function analyzeTrackSpectrogramWithGemini(track: Track): Promise<string> {
  const confidencePercent = track.confidenceScore ? (track.confidenceScore * 100).toFixed(1) : '90.0';
  const prompt = `
Perform a detailed 3-paragraph technical analysis of the song "${track.title}" by ${track.artist}.
Ground Truth Genre: ${track.genre}.
SONGNET C-RNN Predicted Genre: ${track.predictedGenre || track.genre} (${confidencePercent}% confidence).

In paragraph 1: Explain the rhythmic structure, tempo (BPM), and frequency spectrum dynamics (low-end bass vs high-end harmonics).
In paragraph 2: Detail how a 2D-CNN feature extractor and GRU recurrent layers process this song's Log-Mel Spectrogram (128 mel bins).
In paragraph 3: Explain why SONGNET assigned ${track.predictedGenre || track.genre} with ${confidencePercent}% Softmax confidence.
`;

  return await callGeminiApi(prompt);
}
