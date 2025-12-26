# Suno Admin - AI-Powered Music Prompt Generator

Generate perfectly-structured Suno v5 prompts for 25-minute focus music albums using harmonic mixing (Camelot wheel) and ecstatic dance arc principles.

## 🎯 What This Does

Creates **10-track focus session albums** with:

- ✅ DJ-style harmonic mixing (Camelot wheel transitions)
- ✅ Ecstatic dance energy arc (60 → 85 → 60 BPM)
- ✅ Perfect phase progression (Arrival → Flow → Lock-in → Landing)
- ✅ Copy-paste ready Suno v5 prompts

## 🚀 Quick Start

```bash
# Install dependencies
npm install
pip3 install -r requirements.txt  # For audio analysis

# Set up Gemini API (optional, for AI insights)
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Generate album prompts (default settings)
npm run generate

# 🎯 AI-Powered: Analyze audio and generate inspired prompts
npm run generate -- --source ../suno-inspiration/samples-4min/Healing\ Frequency\ 1111Hz\ -\ 4min\ sample.mp3

# Test audio analysis
npm run analyze ../suno-inspiration/samples-4min/your-audio.mp3

# Preview arc structure
npm run generate -- --preview

# Custom settings
npm run generate -- --name "Deep Work Session" --start-key 5A --peak-bpm 90
```

## 📋 Output Example

```
Track 01  🌅  1A   60 BPM  ████████████
         ARRIVAL     low
         Settle nervous system, create container for focus

Track 07  🔥  7A   85 BPM  █████████████████
         LOCKIN      sustained
         Peak concentration, maximum cognitive capacity

Track 10  ✨  12A  60 BPM  ████████████
         LANDING     low
         Complete the cycle, rest and reflect
```

## ✨ NEW: Creative Musician-Worthy Naming

No more boring "Track 1", "Opening 2"! **Gemini AI generates poetic, evocative track and album names** inspired by your music:

**Example output:**

```
Album: "Depths of Stillness"

🎨 Track Names:
   1. First Light Breaking
   2. Gentle Settling
   3. Opening the Portal
   4. Building the Current
   5. Deep Water Flow
   6. Endless Horizon
   7. The Crystalline Peak
   8. Soft Unwinding
   9. Homeward Drift
   10. Silent Integration
```

AI creates names that feel like a **musician's creative work**, not a technical spec.

## 🎵 NEW: Sacred Frequency Converter

Musicians often tune to **sacred frequencies** (432Hz, 444Hz, 528Hz, 1111Hz) instead of standard 440Hz. After generating tracks in Suno, **convert them to your desired frequency**:

```bash
# Convert single track to 432Hz (Natural Tuning)
npm run convert track.mp3 -- --frequency 432

# Convert entire album to 1111Hz (Manifestation)
npm run convert album-folder/ -- --frequency 1111 --output album-1111hz/

# List all available frequencies
npm run frequencies
```

**Available Sacred Frequencies:**

- **432 Hz** - Natural Tuning (grounding, earth connection)
- **444 Hz** - Spiritual Clarity (higher consciousness)
- **528 Hz** - Love Frequency (DNA repair, transformation)
- **1111 Hz** - Manifestation (alignment, spiritual awakening)
- Plus: 639Hz, 741Hz, 852Hz, 963Hz

## 🤖 AI-Powered Audio Analysis

**Analyze existing audio files** to generate prompts inspired by their vibe:

```bash
npm run generate -- --source /path/to/your/audio.mp3
```

**What it does:**

1. **Audio Analysis** (Python/librosa): Detects BPM, key, energy, brightness
2. **AI Insights** (Gemini 2.0): Analyzes mood, style, instruments, atmosphere
3. **Smart Prompts**: Generates Suno prompts that match the source music's character

**Example output:**

```
📊 Audio Analysis:
   Detected Tempo: 72 BPM
   Detected Key: Bm
   Energy Level: 45%

🤖 AI Insights:
   Mood: meditative, grounding, peaceful
   Style: ambient handpan with nature soundscape
   Instruments: handpan, soft pads, gentle percussion
   Atmosphere: Calming and centering, perfect for deep focus
   Suggested BPM Range: 65-78
```

## 🎵 How It Works

### 1. Arc Designer

Builds 10-track structure following ecstatic dance principles adapted for deep work:

- **Tracks 1-2**: Arrival (60-65 BPM) - Ground and settle
- **Tracks 3-4**: Engage (70-75 BPM) - Activate attention
- **Tracks 5-6**: Flow (80-85 BPM) - Deep work state
- **Track 7**: Lock-in (85 BPM) - Peak focus
- **Tracks 8-9**: Ease-off (75-70 BPM) - Graceful descent
- **Track 10**: Landing (60 BPM) - Integration

### 2. Harmonic Mixing (Camelot Wheel)

Ensures smooth transitions between tracks:

- **Perfect Fifth**: Adjacent keys (1A → 2A)
- **Relative Major/Minor**: Same number (1A → 1B)
- **Energy Boost**: +7 jump (1A → 8A)

### 3. Prompt Generation

Creates Suno-optimized prompts with:

- Exact BPM and key specifications
- Phase-appropriate moods and instruments
- Seamless loop structure
- Professional mixing tags

## 💻 CLI Commands

### Generate Album Prompts

```bash
# Generate with AI analysis + creative names (RECOMMENDED!)
npm run generate -- --source /path/to/audio.mp3

# Generate with manual settings
npm run generate -- --name "Deep Work" --start-key 5A --peak-bpm 90

# Preview arc structure
npm run generate -- --preview

# Options:
#   -s, --source <path>      Audio file to analyze for inspiration
#   -n, --name <name>        Album name (overrides AI-generated name)
#   -k, --start-key <key>    Starting Camelot key (overrides analysis)
#   --start-bpm <bpm>        Starting BPM (overrides analysis)
#   --peak-bpm <bpm>         Peak BPM (overrides analysis)
#   -o, --output <dir>       Output directory (default: "./output")
```

### Sacred Frequency Conversion

```bash
# Convert single file to 432Hz
npm run convert track.mp3 -- --frequency 432

# Convert entire album directory
npm run convert album-folder/ -- --frequency 1111 --output album-1111hz/

# List all sacred frequencies
npm run frequencies
```

### Audio Analysis

```bash
# Test audio analysis (see BPM, key, mood)
npm run analyze /path/to/audio.mp3
```

## 📂 Project Structure

```
suno-admin/
├── src/
│   ├── lib/
│   │   ├── camelot-wheel.ts      # Harmonic mixing engine
│   │   ├── arc-designer.ts       # Focus session arc builder
│   │   └── prompt-generator.ts   # Suno prompt creator
│   ├── types/
│   │   └── index.ts              # TypeScript definitions
│   └── cli.ts                    # Command-line interface
├── output/                       # Generated prompts (JSON)
└── package.json
```

## 🎹 Camelot Wheel Reference

| Key      | Compatible With | Use For      |
| -------- | --------------- | ------------ |
| 1A (A♭m) | 1B, 2A, 12A     | Smooth flow  |
| 1B (B)   | 1A, 2B, 12B     | Energy match |
| ...      | ...             | ...          |

**Transition Rules:**

- **Same Number** (1A → 1B): Perfect energy match
- **±1** (1A → 2A): Smooth fifth
- **+7** (1A → 8A): Dramatic boost

## 🎯 Complete Workflow

**1. Generate Suno Prompts (with AI naming)**

```bash
npm run generate -- --source handpan-sample.mp3
# → Get 10 creative prompts + poetic track names
```

**2. Create Music in Suno**

- Copy each prompt to suno.com
- Generate & download 10 tracks

**3. Convert to Sacred Frequency**

```bash
npm run convert suno-tracks/ -- --frequency 1111 --output album-1111hz/
# → All tracks tuned to 1111Hz manifestation frequency
```

**4. Upload to Pravos.xyz**

- Add converted tracks to your focus music library

## 🔮 Roadmap

- [x] Audio analysis (BPM/key detection with librosa)
- [x] AI-powered mood analysis (Gemini 2.0 Flash)
- [x] Creative track & album naming (Gemini-powered)
- [x] Sacred frequency converter (432Hz, 444Hz, 528Hz, 1111Hz, etc.)
- [ ] YouTube download integration (yt-dlp)
- [ ] Web admin panel
- [ ] Direct integration with Pravos.xyz
- [ ] Batch processing (analyze multiple files at once)

## 📝 License

MIT

## 🙏 Credits

Built for [Pravos.xyz](https://pravos.xyz) - Focus music platform
