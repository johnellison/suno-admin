# Suno Mastering Toolkit

Master your Suno-generated tracks for upload to [Pravos.xyz](https://pravos.xyz). Reference-based AI mastering, EQ presets, and sacred frequency conversion.

## Features

- **Reference Mastering** - Match your tracks to any professional reference using AI (matchering)
- **EQ Presets** - Built-in profiles for handpan, meditation, ambient, acoustic
- **Sacred Frequencies** - Convert to 432Hz, 528Hz, 1111Hz, and more
- **Dual Format** - Preserves both MP3 (regular users) and WAV (pro/lossless)
- **Batch Processing** - Process entire albums or single files in one command
- **Prompt Generation** - AI-powered Suno v5 prompts with harmonic mixing

## Quick Start

```bash
# Install dependencies
npm install

# Set up Python environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Master an album with reference matching + 432Hz
npm run master ./my-album -- --reference ./reference-track.mp3 --frequency 432

# Show full help
npm run help-full
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run master` | Master tracks (reference or preset mode) |
| `npm run convert` | Convert frequency only (no mastering) |
| `npm run analyze` | Analyze audio file (BPM, key, energy) |
| `npm run generate` | Generate Suno prompts for new album |
| `npm run frequencies` | List all sacred frequencies |
| `npm run help-full` | Show comprehensive usage guide |

## Mastering

### One Command Does Everything

```bash
# Reference mastering + 432Hz conversion
npm run master ./my-album -- --reference ./professional-track.mp3 --frequency 432

# Single file
npm run master ./track.wav -- --reference ./ref.mp3 --frequency 432

# Preset mastering (no reference needed)
npm run master ./my-album -- --preset warm-handpan --frequency 432
```

### Reference Mastering

Uses AI-powered [matchering](https://github.com/sergree/matchering) to analyze a reference track and match your tracks to its sonic profile (EQ, dynamics, loudness, stereo width).

**Best for:** When you have a professionally mastered track you want your music to sound like.

```bash
npm run master ./my-album -- --reference ./pro-track.mp3
npm run master ./my-album -- --reference ./ref.mp3 --bit-depth 24
```

### Preset Mastering

Use built-in EQ profiles when you don't have a reference track.

| Preset | Description |
|--------|-------------|
| `warm-handpan` | Reduces tinny highs (8-15kHz), boosts warm lows (150-500Hz), gentle compression, subtle reverb. Perfect for Suno handpan tracks. |
| `meditation` | Extra warmth, reduced high frequencies, soft reverb, gentle compression. Ideal for deep meditation and sleep music. |
| `ambient` | Balanced warmth, moderate reverb, smooth high-end rolloff. Great for ambient soundscapes. |
| `acoustic` | Natural warmth, preserves acoustic detail, gentle compression. Perfect for piano, guitar, strings. |

```bash
npm run master ./my-album -- --preset meditation
npm run master ./my-album -- --preset warm-handpan --frequency 432
```

## Sacred Frequencies

Convert from standard 440Hz tuning to alternative frequencies. Applied after mastering for best quality.

| Frequency | Name | Purpose |
|-----------|------|---------|
| **432 Hz** | Natural Tuning | Grounding, earth connection, harmony |
| **444 Hz** | Spiritual Clarity | Higher consciousness, divine connection |
| **528 Hz** | Love Frequency | DNA repair, transformation, miracles |
| **639 Hz** | Connection | Relationships, communication, harmony |
| **741 Hz** | Awakening | Intuition, problem-solving, expression |
| **852 Hz** | Intuition | Spiritual awakening, inner strength |
| **963 Hz** | Divine Connection | Pineal gland activation, unity |
| **1111 Hz** | Manifestation | Alignment, angel numbers, spiritual awakening |

```bash
# Applied automatically with --frequency flag
npm run master ./my-album -- --reference ./ref.mp3 --frequency 432

# Or convert existing files (no mastering)
npm run convert ./my-album -- --frequency 432
```

## Output Structure

```
./my-album/
├── track1.mp3              # Original
├── track1.wav              # Original (pro)
├── mastered/               # After mastering
│   ├── track1_mastered.mp3
│   └── track1_mastered.wav
└── final-432hz/            # After frequency conversion
    ├── track1_mastered-432hz.mp3
    └── track1_mastered-432hz.wav   # Upload these!
```

## Format Handling

| Input | Output | Use Case |
|-------|--------|----------|
| MP3 | MP3 | Regular users, smaller files |
| WAV | WAV | Pro users, lossless quality |

Both formats are preserved throughout the entire pipeline.

## Suno Prompt Generation

Generate AI-powered prompts for creating new 10-track focus albums:

```bash
# Generate prompts inspired by a reference track
npm run generate -- --source ./inspiration.mp3

# Preview arc structure
npm run generate -- --preview

# Custom settings
npm run generate -- --name "Deep Focus" --start-key 5A --peak-bpm 90
```

Features:
- DJ-style harmonic mixing (Camelot wheel transitions)
- Ecstatic dance energy arc (60 → 85 → 60 BPM)
- AI-generated poetic track names (via Gemini)
- Copy-paste ready Suno v5 prompts

## Audio Analysis

Analyze any audio file:

```bash
npm run analyze ./track.mp3
```

Returns: BPM, key, energy level, brightness, AI insights on mood/style.

## Complete Workflow

```bash
# 1. Generate prompts for a new album
npm run generate -- --source ./inspiration.mp3

# 2. Create tracks in Suno (manual - copy prompts to suno.com)

# 3. Download both MP3 and WAV from Suno

# 4. Master with reference matching + 432Hz
npm run master ./my-new-album -- \
  --reference ./inspiration.mp3 \
  --frequency 432

# 5. Upload final-432hz/ folder to Pravos.xyz
```

## Requirements

- Node.js 18+
- Python 3.8+
- ffmpeg (frequency conversion)
- sox (preset mastering)

```bash
# macOS
brew install ffmpeg sox

# Ubuntu/Debian
sudo apt install ffmpeg sox
```

## Project Structure

```
suno-admin/
├── src/
│   ├── lib/
│   │   ├── audio-mastering.ts    # Preset + reference mastering
│   │   ├── frequency-converter.ts # Sacred frequency conversion
│   │   ├── arc-designer.ts       # Focus session arc builder
│   │   ├── prompt-generator.ts   # Suno prompt creator
│   │   └── camelot-wheel.ts      # Harmonic mixing engine
│   ├── analyzers/
│   │   ├── audio-analyzer.ts     # Python bridge
│   │   └── gemini-analyzer.ts    # AI insights
│   └── cli.ts                    # Command-line interface
├── scripts/
│   ├── analyze-audio.py          # Audio analysis (librosa)
│   └── reference-master.py       # Reference mastering (matchering)
└── output/                       # Generated prompts
```

## Tech Stack

- **TypeScript** - CLI and core logic
- **matchering** - AI-powered reference mastering
- **ffmpeg** - Frequency conversion
- **sox** - EQ preset mastering
- **librosa** - Audio analysis (Python)
- **Gemini API** - AI insights for prompt generation

## Roadmap

- [x] Reference mastering (matchering)
- [x] EQ preset mastering (sox)
- [x] Sacred frequency conversion
- [x] Dual format preservation (MP3/WAV)
- [x] Single command workflow
- [x] Suno prompt generation
- [x] Audio analysis
- [ ] Custom EQ preset builder
- [ ] Web admin panel
- [ ] Direct Pravos.xyz integration

## License

MIT

## Credits

Built for [Pravos.xyz](https://pravos.xyz) - Focus music platform
