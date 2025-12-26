import type { FocusTrack, SunoPrompt, FocusPhase } from "../types/index.js";
import chalk from "chalk";

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
  arrival:
    "soft acoustic handpan, natural resonance, subtle nature sounds, organic tones",
  engage:
    "acoustic handpan melody, gentle natural percussion, warm atmospheric layers",
  flow: "rich acoustic handpan, metallic resonance, natural rhythmic elements, deep organic bass",
  lockin:
    "dynamic acoustic handpan, natural percussion, layered organic soundscape",
  easeoff:
    "melodic acoustic handpan, fading natural rhythm, warm organic textures",
  landing:
    "gentle acoustic handpan, natural drones, nature sounds, spacious organic atmosphere",
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
${moods} acoustic handpan meditation music,
${instruments},
natural organic sounds, metallic handpan resonance,
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
      "vocals, singing, lyrics, drums, heavy percussion, bass drops, aggressive sounds, synthesizers, synth pads, electronic pads, digital sounds, artificial sounds, high-pitched synths, synthetic instruments, electric sounds, keyboard, electric piano",
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
  output += chalk.magenta.bold("═".repeat(70) + "\n");
  output += chalk.magenta.bold(
    "  🎵 SUNO V5 PROMPTS - READY TO COPY & PASTE\n",
  );
  output += chalk.magenta.bold("═".repeat(70) + "\n\n");

  prompts.forEach((prompt, index) => {
    output +=
      chalk.cyan.bold(`\n━━━ TRACK ${prompt.trackNumber}/10 ━━━ `) +
      chalk.white.bold(`${prompt.title}\n\n`);

    output += chalk.yellow.bold(`📋 COPY THIS PROMPT:\n`);
    output += chalk.gray("─".repeat(70) + "\n");
    output += chalk.green(prompt.prompt + "\n");
    output += chalk.gray("─".repeat(70) + "\n\n");

    output += chalk.blue.bold(`⚙️  SUNO V5 SETTINGS:\n`);
    output += chalk.cyan(`   ${chalk.bold("Title:")} ${prompt.title}\n`);
    output += chalk.cyan(
      `   ${chalk.bold("Duration:")} ${prompt.duration} (target)\n`,
    );
    output += chalk.cyan(
      `   ${chalk.bold("Style Tags:")} ${chalk.white(prompt.style)}\n`,
    );
    output += chalk.green(`   ${chalk.bold("Instrumental:")} ✅ YES\n`);
    output += chalk.red(`   ${chalk.bold("Vocals:")} ❌ NO\n`);
    output += chalk.yellow(
      `   ${chalk.bold("Exclude Styles:")} ${chalk.dim(prompt.excludeStyles)}\n`,
    );
    output += chalk.magenta(
      `   ${chalk.bold("Weirdness:")} ${prompt.weirdness}/100 ${chalk.dim("(keep low for focus)")}\n`,
    );
    output += chalk.magenta(
      `   ${chalk.bold("Style Influence:")} ${prompt.styleInfluence}/100 ${chalk.dim("(medium-high)")}\n\n`,
    );

    output += chalk.gray.bold(`🎵 TECHNICAL INFO:\n`);
    output += chalk.gray(`   • Key: ${prompt.key} (${prompt.camelotKey})\n`);
    output += chalk.gray(`   • BPM: ${prompt.tempo}\n`);
    output += chalk.gray(
      `   • Phase: ${prompt._metadata.phase.toUpperCase()}\n`,
    );
    output += chalk.gray(`   • Energy: ${prompt._metadata.energy}\n`);
    output += chalk.gray(`   • Transition: ${prompt._metadata.transition}\n\n`);

    output += chalk.blue.bold(`💡 PURPOSE:\n`);
    output += chalk.blue(`   ${prompt._metadata.purpose}\n`);

    if (index < prompts.length - 1) {
      output += "\n" + chalk.dim("═".repeat(70)) + "\n";
    }
  });

  output += "\n\n" + chalk.magenta.bold("═".repeat(70) + "\n");
  output += chalk.magenta.bold("  🚀 NEXT STEPS - CREATING IN SUNO\n");
  output += chalk.magenta.bold("═".repeat(70) + "\n");
  output +=
    chalk.white("  1. Go to ") +
    chalk.cyan.underline("suno.com") +
    chalk.white(" and click 'Create'\n");
  output +=
    chalk.white("  2. Toggle ") +
    chalk.yellow.bold("'Custom'") +
    chalk.white(" mode ON\n");
  output += chalk.white("  3. For each track above:\n");
  output +=
    chalk.cyan("     • Paste the ") +
    chalk.yellow.bold("PROMPT") +
    chalk.cyan(" into the Style of Music field\n");
  output += chalk.cyan("     • Set the Title\n");
  output += chalk.cyan("     • Add Style Tags from the settings\n");
  output += chalk.green("     • Set Instrumental = YES ✅\n");
  output += chalk.red("     • Set Vocals = NO ❌\n");
  output += chalk.yellow(
    "     • Paste Exclude Styles text into the Exclude Styles field\n",
  );
  output += chalk.magenta(
    "     • Set Weirdness slider to the specified value (5-20)\n",
  );
  output += chalk.magenta("     • Set Style Influence slider to 75\n");
  output += chalk.white("  4. Generate and download MP3s (v5 model)\n");
  output += chalk.white(
    "  5. Optional: Convert to sacred frequency (432Hz, 1111Hz, etc.)\n",
  );
  output += chalk.white("  6. Upload to your Pravos.xyz music library\n");
  output += chalk.magenta.bold("═".repeat(70) + "\n");
  output +=
    chalk.yellow("  💡 TIP: ") +
    chalk.white("Keep Weirdness ") +
    chalk.bold("LOW (5-20)") +
    chalk.white(" for calm, coherent focus music.\n");
  output += chalk.dim(
    "       Higher weirdness (70+) adds experimental FX/noise.\n",
  );
  output += chalk.magenta.bold("═".repeat(70) + "\n\n");

  return output;
}
