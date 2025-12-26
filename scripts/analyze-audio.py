#!/usr/bin/env python3
import sys
import json
import librosa
import numpy as np
from pathlib import Path


def detect_key(y, sr):
    chromagram = librosa.feature.chroma_cqt(y=y, sr=sr)
    chroma_vals = chromagram.mean(axis=1)

    keys = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]
    key_idx = np.argmax(chroma_vals)

    major_profile = np.array(
        [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
    )
    minor_profile = np.array(
        [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]
    )

    major_profile = major_profile / major_profile.sum()
    minor_profile = minor_profile / minor_profile.sum()

    rotated_chroma = np.roll(chroma_vals, -key_idx)
    major_corr = np.corrcoef(rotated_chroma, major_profile)[0, 1]
    minor_corr = np.corrcoef(rotated_chroma, minor_profile)[0, 1]

    is_major = major_corr > minor_corr
    detected_key = keys[key_idx] if is_major else keys[key_idx] + "m"

    return detected_key, major_corr if is_major else minor_corr


def analyze_audio(file_path):
    try:
        y, sr = librosa.load(file_path, duration=60)

        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)

        key, confidence = detect_key(y, sr)

        rms = librosa.feature.rms(y=y)[0]
        energy = float(np.mean(rms))
        energy_normalized = min(energy * 10, 1.0)

        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        brightness = float(np.mean(spectral_centroid))

        zcr = librosa.feature.zero_crossing_rate(y)[0]
        percussiveness = float(np.mean(zcr))

        duration = librosa.get_duration(y=y, sr=sr)

        return {
            "success": True,
            "file": str(file_path),
            "tempo": float(tempo),
            "key": key,
            "key_confidence": float(confidence),
            "energy": energy_normalized,
            "brightness": brightness,
            "percussiveness": percussiveness,
            "duration": duration,
            "sample_rate": sr,
        }

    except Exception as e:
        return {"success": False, "error": str(e), "file": str(file_path)}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No audio file provided"}))
        sys.exit(1)

    file_path = Path(sys.argv[1])

    if not file_path.exists():
        print(json.dumps({"success": False, "error": f"File not found: {file_path}"}))
        sys.exit(1)

    result = analyze_audio(file_path)
    print(json.dumps(result, indent=2))
