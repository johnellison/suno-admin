import type { CamelotKey, MusicalKey, TransitionType } from "../types/index.js";

interface CamelotPosition {
  key: MusicalKey;
  compatible: CamelotKey[];
}

export const CAMELOT_WHEEL: Record<CamelotKey, CamelotPosition> = {
  "1A": { key: "A♭m", compatible: ["1A", "1B", "2A", "12A"] },
  "1B": { key: "B", compatible: ["1A", "1B", "2B", "12B"] },
  "2A": { key: "E♭m", compatible: ["2A", "2B", "1A", "3A"] },
  "2B": { key: "F♯", compatible: ["2A", "2B", "1B", "3B"] },
  "3A": { key: "B♭m", compatible: ["3A", "3B", "2A", "4A"] },
  "3B": { key: "D♭", compatible: ["3A", "3B", "2B", "4B"] },
  "4A": { key: "Fm", compatible: ["4A", "4B", "3A", "5A"] },
  "4B": { key: "A♭", compatible: ["4A", "4B", "3B", "5B"] },
  "5A": { key: "Cm", compatible: ["5A", "5B", "4A", "6A"] },
  "5B": { key: "E♭", compatible: ["5A", "5B", "4B", "6B"] },
  "6A": { key: "Gm", compatible: ["6A", "6B", "5A", "7A"] },
  "6B": { key: "B♭", compatible: ["6A", "6B", "5B", "7B"] },
  "7A": { key: "Dm", compatible: ["7A", "7B", "6A", "8A"] },
  "7B": { key: "F", compatible: ["7A", "7B", "6B", "8B"] },
  "8A": { key: "Am", compatible: ["8A", "8B", "7A", "9A"] },
  "8B": { key: "C", compatible: ["8A", "8B", "7B", "9B"] },
  "9A": { key: "Em", compatible: ["9A", "9B", "8A", "10A"] },
  "9B": { key: "G", compatible: ["9A", "9B", "8B", "10B"] },
  "10A": { key: "Bm", compatible: ["10A", "10B", "9A", "11A"] },
  "10B": { key: "D", compatible: ["10A", "10B", "9B", "11B"] },
  "11A": { key: "F♯m", compatible: ["11A", "11B", "10A", "12A"] },
  "11B": { key: "A", compatible: ["11A", "11B", "10B", "12B"] },
  "12A": { key: "C♯m", compatible: ["12A", "12B", "11A", "1A"] },
  "12B": { key: "E", compatible: ["12A", "12B", "11B", "1B"] },
};

export function getMusicalKey(camelotKey: CamelotKey): MusicalKey {
  return CAMELOT_WHEEL[camelotKey].key;
}

export function getCamelotKey(musicalKey: MusicalKey): CamelotKey | null {
  for (const [camelot, info] of Object.entries(CAMELOT_WHEEL)) {
    if (info.key === musicalKey) {
      return camelot as CamelotKey;
    }
  }
  return null;
}

export function isCompatible(from: CamelotKey, to: CamelotKey): boolean {
  return CAMELOT_WHEEL[from].compatible.includes(to);
}

export function getTransitionType(
  from: CamelotKey,
  to: CamelotKey,
): TransitionType {
  if (from === to) {
    return "same-key";
  }

  const fromNumber = parseInt(from.slice(0, -1));
  const fromLetter = from.slice(-1);
  const toNumber = parseInt(to.slice(0, -1));
  const toLetter = to.slice(-1);

  if (fromNumber === toNumber && fromLetter !== toLetter) {
    return "relative";
  }

  const diff = (toNumber - fromNumber + 12) % 12;

  if (diff === 1 || diff === 11) {
    return "perfect-fifth";
  }

  if (diff === 7) {
    return "energy-boost";
  }

  if (diff === 5) {
    return "energy-drop";
  }

  return "perfect-fifth";
}

export function getSmoothTransitions(from: CamelotKey): CamelotKey[] {
  const fromNumber = parseInt(from.slice(0, -1));
  const fromLetter = from.slice(-1);

  const nextNumber = (fromNumber % 12) + 1;
  const prevNumber = fromNumber === 1 ? 12 : fromNumber - 1;

  const transitions: CamelotKey[] = [
    from,
    `${fromNumber}${fromLetter === "A" ? "B" : "A"}` as CamelotKey,
    `${nextNumber}${fromLetter}` as CamelotKey,
    `${prevNumber}${fromLetter}` as CamelotKey,
  ];

  return transitions.filter((key) => CAMELOT_WHEEL[key] !== undefined);
}

export function getEnergyBoostTransition(from: CamelotKey): CamelotKey {
  const fromNumber = parseInt(from.slice(0, -1));
  const fromLetter = from.slice(-1);
  const targetNumber = ((fromNumber + 6) % 12) + 1;
  return `${targetNumber}${fromLetter}` as CamelotKey;
}

export function getEnergyDropTransition(from: CamelotKey): CamelotKey {
  const fromNumber = parseInt(from.slice(0, -1));
  const fromLetter = from.slice(-1);
  const targetNumber = fromNumber - 6 <= 0 ? fromNumber + 6 : fromNumber - 6;
  return `${targetNumber}${fromLetter}` as CamelotKey;
}

export function planHarmonicProgression(
  startKey: CamelotKey,
  steps: number,
  preferredTransitions: TransitionType[] = ["perfect-fifth", "relative"],
): CamelotKey[] {
  const progression: CamelotKey[] = [startKey];
  let currentKey = startKey;

  for (let i = 1; i < steps; i++) {
    const availableTransitions = getSmoothTransitions(currentKey);

    const preferredKeys = availableTransitions.filter((key) => {
      const transitionType = getTransitionType(currentKey, key);
      return preferredTransitions.includes(transitionType);
    });

    const nextKey =
      preferredKeys.length > 0
        ? preferredKeys[Math.floor(Math.random() * preferredKeys.length)]
        : availableTransitions[1];

    progression.push(nextKey);
    currentKey = nextKey;
  }

  return progression;
}
