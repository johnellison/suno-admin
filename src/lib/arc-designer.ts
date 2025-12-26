import type {
  ArcConfig,
  FocusTrack,
  FocusPhase,
  EnergyLevel,
} from "../types/index.js";
import {
  getMusicalKey,
  planHarmonicProgression,
  getTransitionType,
} from "./camelot-wheel.js";

const PHASE_MAP: Record<
  number,
  { phase: FocusPhase; energy: EnergyLevel; purpose: string }
> = {
  1: {
    phase: "arrival",
    energy: "low",
    purpose: "Settle nervous system, create container for focus",
  },
  2: {
    phase: "arrival",
    energy: "low",
    purpose: "Ground into present moment, release distractions",
  },
  3: {
    phase: "engage",
    energy: "building",
    purpose: "Activate attention, build gentle momentum",
  },
  4: {
    phase: "engage",
    energy: "building",
    purpose: "Curiosity and interest, invite deeper engagement",
  },
  5: {
    phase: "flow",
    energy: "peak",
    purpose: "Enter deep work state, effortless focus",
  },
  6: {
    phase: "flow",
    energy: "peak",
    purpose: "Sustained immersion, optimal performance",
  },
  7: {
    phase: "lockin",
    energy: "sustained",
    purpose: "Peak concentration, maximum cognitive capacity",
  },
  8: {
    phase: "easeoff",
    energy: "descending",
    purpose: "Graceful transition, maintain quality",
  },
  9: {
    phase: "easeoff",
    energy: "descending",
    purpose: "Gentle release, integration",
  },
  10: {
    phase: "landing",
    energy: "low",
    purpose: "Complete the cycle, rest and reflect",
  },
};

function calculateBPMArc(
  trackNumber: number,
  startBPM: number,
  peakBPM: number,
  endBPM: number,
): number {
  if (trackNumber <= 2) {
    return startBPM + (trackNumber - 1) * 2.5;
  }

  if (trackNumber <= 4) {
    return startBPM + 5 + (trackNumber - 2) * 2.5;
  }

  if (trackNumber <= 6) {
    return startBPM + 10 + (trackNumber - 4) * 2.5;
  }

  if (trackNumber === 7) {
    return peakBPM;
  }

  if (trackNumber <= 9) {
    const descendSteps = trackNumber - 7;
    return peakBPM - descendSteps * 5;
  }

  return endBPM;
}

export function designFocusArc(config: Partial<ArcConfig> = {}): FocusTrack[] {
  const fullConfig: ArcConfig = {
    totalTracks: config.totalTracks || 10,
    totalDuration: config.totalDuration || 1500,
    startBPM: config.startBPM || 60,
    peakBPM: config.peakBPM || 85,
    endBPM: config.endBPM || 60,
    startKey: config.startKey || "1A",
    allowedTransitions: config.allowedTransitions || [
      "perfect-fifth",
      "relative",
    ],
  };

  const harmonicProgression = planHarmonicProgression(
    fullConfig.startKey,
    fullConfig.totalTracks,
    fullConfig.allowedTransitions,
  );

  const trackDuration = Math.floor(
    fullConfig.totalDuration / fullConfig.totalTracks,
  );

  return Array.from({ length: fullConfig.totalTracks }, (_, index) => {
    const trackNumber = index + 1;
    const phaseInfo = PHASE_MAP[trackNumber];
    const targetKey = harmonicProgression[index];
    const previousKey = index > 0 ? harmonicProgression[index - 1] : targetKey;

    return {
      number: trackNumber,
      phase: phaseInfo.phase,
      targetBPM: calculateBPMArc(
        trackNumber,
        fullConfig.startBPM,
        fullConfig.peakBPM,
        fullConfig.endBPM,
      ),
      targetKey,
      musicalKey: getMusicalKey(targetKey),
      energy: phaseInfo.energy,
      transition: getTransitionType(previousKey, targetKey),
      duration: trackDuration,
    };
  });
}

export function getPhaseDescription(phase: FocusPhase): string {
  const descriptions: Record<FocusPhase, string> = {
    arrival:
      "Grounding into stillness, releasing external noise, settling the nervous system",
    engage: "Gentle activation, curiosity building, attention coming online",
    flow: "Deep immersion, effortless focus, time disappears",
    lockin: "Peak performance, maximum clarity, sustained concentration",
    easeoff: "Graceful descent, maintaining quality while releasing intensity",
    landing: "Integration, completion, rest and reflection",
  };

  return descriptions[phase];
}

export function visualizeArc(tracks: FocusTrack[]): string {
  let output =
    "\n╔══════════════════════════════════════════════════════════════╗\n";
  output +=
    "║         FOCUS SESSION ARC (25-Minute Journey)                 ║\n";
  output +=
    "╚══════════════════════════════════════════════════════════════╝\n\n";

  tracks.forEach((track) => {
    const bar = "█".repeat(Math.floor(track.targetBPM / 5));
    const phaseEmoji = {
      arrival: "🌅",
      engage: "🎯",
      flow: "🌊",
      lockin: "🔥",
      easeoff: "🌙",
      landing: "✨",
    }[track.phase];

    output += `Track ${track.number.toString().padStart(2)}  ${phaseEmoji}  ${track.targetKey.padEnd(4)} `;
    output += `${track.targetBPM.toString().padStart(3)} BPM  ${bar}\n`;
    output += `         ${track.phase.toUpperCase().padEnd(10)} ${track.energy}\n`;
    output += `         ${PHASE_MAP[track.number].purpose}\n\n`;
  });

  return output;
}
