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
    output += `⚙️  SUNO SETTINGS:\n`;
    output += `   • Title: ${prompt.title}\n`;
    output += `   • Duration: ${prompt.duration} (target)\n`;
    output += `   • Style Tags: ${prompt.style}\n`;
    output += `   • Instrumental: YES\n`;
    output += `   • Vocals: NO\n\n`;
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
  output += "  NEXT STEPS:\n";
  output += "  1. Go to suno.com\n";
  output += "  2. Paste each prompt above\n";
  output += "  3. Set Instrumental = true, Vocals = false\n";
  output += "  4. Generate and download MP3s\n";
  output += "  5. Upload to your Pravos.xyz music library\n";
  output += "═".repeat(70) + "\n\n";

  return output;
}
