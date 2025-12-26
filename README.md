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

# Generate album prompts
npm run generate

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

```bash
# Generate full album with prompts
npm run generate

# Options:
#   -n, --name <name>        Album name (default: "Focus Session")
#   -k, --start-key <key>    Starting Camelot key (default: "1A")
#   --start-bpm <bpm>        Starting BPM (default: 60)
#   --peak-bpm <bpm>         Peak BPM (default: 85)
#   -o, --output <dir>       Output directory (default: "./output")

# Preview arc without generating prompts
npm run generate -- --preview
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

## 🔮 Roadmap

- [ ] Audio analysis (YouTube → BPM/key detection)
- [ ] AI-powered mood analysis (Gemini/OpenAI)
- [ ] Web admin panel
- [ ] Direct integration with Pravos.xyz

## 📝 License

MIT

## 🙏 Credits

Built for [Pravos.xyz](https://pravos.xyz) - Focus music platform
