import type { FocusTrack, SunoPrompt, FocusPhase } from "../types/index.js";

const MOOD_MAP: Record<FocusPhase, string[]> = {
  arrival: [
    "calm",
    "grounding",
    "spacious",
    "peaceful",
    "gentle",
    "serene",
    "settling",
    "soft",
    "mindful",
    "present",
  ],
  engage: [
    "curious",
    "inviting",
    "building",
    "present",
    "flowing",
    "attentive",
    "awakening",
    "gentle energy",
    "focused",
    "clear",
  ],
  flow: [
    "immersive",
    "effortless",
    "expansive",
    "deep",
    "concentrated",
    "fluid",
    "timeless",
    "absorbed",
    "rhythmic",
    "meditative",
  ],
  lockin: [
    "powerful",
    "peak",
    "concentrated",
    "dynamic",
    "sustained",
    "intense",
    "crystalline",
    "driving",
    "purposeful",
    "locked in",
  ],
  easeoff: [
    "releasing",
    "softening",
    "graceful",
    "reflective",
    "integrating",
    "gentle descent",
    "satisfied",
    "easing",
    "transitioning",
    "winding down",
  ],
  landing: [
    "complete",
    "restful",
    "grounded",
    "peaceful",
    "contemplative",
    "resolved",
    "still",
    "closing",
    "integrated",
    "whole",
  ],
};

const INSTRUMENT_LAYERS: Record<FocusPhase, string> = {
  arrival: "soft handpan, ambient pads, subtle nature sounds",
  engage: "handpan melody, light percussion, atmospheric layers",
  flow: "rich handpan, rhythmic elements, ambient textures, deep bass",
  lockin: "dynamic handpan, driving percussion, layered soundscape",
  easeoff: "melodic handpan, fading rhythm, soft pads returning",
  landing: "gentle handpan, ambient drones, nature sounds, space",
};

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function selectMoods(phase: FocusPhase, count: number = 3): string {
  const moods = MOOD_MAP[phase];
  const selected = moods.slice(0, count);
  return selected.join(", ");
}

const WEIRDNESS_MAP: Record<FocusPhase, number> = {
  arrival: 5,
  engage: 10,
  flow: 15,
  lockin: 20,
  easeoff: 12,
  landing: 5,
};

export function generateSunoPrompt(
  track: FocusTrack,
  trackName?: string,
): SunoPrompt {
  const title = trackName || `Track ${track.number}`;
  const moods = selectMoods(track.phase);
  const instruments = INSTRUMENT_LAYERS[track.phase];

  const prompt = `
[${track.targetKey}] [${track.targetBPM} BPM]
${moods} handpan meditation music,
${instruments},
deep focus music, ambient soundscape,
seamless loop structure, no vocals, instrumental only,
smooth harmonic ${track.transition} transition,
professional production, high quality mixing
  `.trim();

  return {
    trackNumber: track.number,
    title,
    duration: formatDuration(track.duration),
    tempo: track.targetBPM,
    key: track.musicalKey,
    camelotKey: track.targetKey,
    prompt,
    style: "meditation, ambient, handpan, focus music, deep work, instrumental",
    instrumental: true,
    excludeStyles:
      "vocals, singing, lyrics, drums, heavy percussion, bass drops, aggressive sounds",
    weirdness: WEIRDNESS_MAP[track.phase],
    styleInfluence: 75,
    _metadata: {
      phase: track.phase,
      energy: track.energy,
      transition: track.transition,
      transitionFrom: track.number > 1 ? track.targetKey : undefined,
      purpose: PHASE_MAP_PURPOSE[track.number],
    },
  };
}

const PHASE_MAP_PURPOSE: Record<number, string> = {
  1: "Settle nervous system, create container for focus",
  2: "Ground into present moment, release distractions",
  3: "Activate attention, build gentle momentum",
  4: "Curiosity and interest, invite deeper engagement",
  5: "Enter deep work state, effortless focus",
  6: "Sustained immersion, optimal performance",
  7: "Peak concentration, maximum cognitive capacity",
  8: "Graceful transition, maintain quality",
  9: "Gentle release, integration",
  10: "Complete the cycle, rest and reflect",
};

export function generateAlbumPrompts(
  tracks: FocusTrack[],
  trackNames?: string[],
): SunoPrompt[] {
  return tracks.map((track, index) =>
    generateSunoPrompt(track, trackNames?.[index]),
  );
}

export function formatPromptsForCLI(prompts: SunoPrompt[]): string {
  let output = "\n";
  output += "═".repeat(70) + "\n";
  output += "  SUNO V5 PROMPTS - COPY & PASTE INTO SUNO\n";
  output += "═".repeat(70) + "\n\n";

  prompts.forEach((prompt, index) => {
    output += `━━━ TRACK ${prompt.trackNumber}/10: ${prompt.title} ━━━\n\n`;
    output += `📋 COPY THIS PROMPT:\n`;
    output += "─".repeat(70) + "\n";
    output += prompt.prompt + "\n";
    output += "─".repeat(70) + "\n\n";
    output += `⚙️  SUNO V5 SETTINGS:\n`;
    output += `   • Title: ${prompt.title}\n`;
    output += `   • Duration: ${prompt.duration} (target)\n`;
    output += `   • Style Tags: ${prompt.style}\n`;
    output += `   • Instrumental: ✅ YES\n`;
    output += `   • Vocals: ❌ NO\n`;
    output += `   • Exclude Styles: ${prompt.excludeStyles}\n`;
    output += `   • Weirdness: ${prompt.weirdness}/100 (keep low for focus)\n`;
    output += `   • Style Influence: ${prompt.styleInfluence}/100 (medium-high)\n\n`;
    output += `🎵 TECHNICAL INFO:\n`;
    output += `   • Key: ${prompt.key} (${prompt.camelotKey})\n`;
    output += `   • BPM: ${prompt.tempo}\n`;
    output += `   • Phase: ${prompt._metadata.phase.toUpperCase()}\n`;
    output += `   • Energy: ${prompt._metadata.energy}\n`;
    output += `   • Transition: ${prompt._metadata.transition}\n\n`;
    output += `💡 PURPOSE:\n`;
    output += `   ${prompt._metadata.purpose}\n\n`;

    if (index < prompts.length - 1) {
      output += "\n" + "═".repeat(70) + "\n\n";
    }
  });

  output += "\n" + "═".repeat(70) + "\n";
  output += "  🚀 NEXT STEPS - CREATING IN SUNO:\n";
  output += "═".repeat(70) + "\n";
  output += "  1. Go to suno.com and click 'Create'\n";
  output += "  2. Toggle 'Custom' mode ON\n";
  output += "  3. For each track above:\n";
  output += "     • Paste the PROMPT into the Style of Music field\n";
  output += "     • Set the Title\n";
  output += "     • Add Style Tags from the settings\n";
  output += "     • Set Instrumental = YES ✅\n";
  output += "     • Set Vocals = NO ❌\n";
  output += "     • Paste Exclude Styles text into the Exclude Styles field\n";
  output += "     • Set Weirdness slider to the specified value (5-20)\n";
  output += "     • Set Style Influence slider to 75\n";
  output += "  4. Generate and download MP3s (v5 model)\n";
  output +=
    "  5. Optional: Convert to sacred frequency (432Hz, 1111Hz, etc.)\n";
  output += "  6. Upload to your Pravos.xyz music library\n";
  output += "═".repeat(70) + "\n";
  output +=
    "  💡 TIP: Keep Weirdness LOW (5-20) for calm, coherent focus music.\n";
  output += "       Higher weirdness (70+) adds experimental FX/noise.\n";
  output += "═".repeat(70) + "\n\n";

  return output;
}
