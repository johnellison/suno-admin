export type CamelotKey =
  | "1A"
  | "1B"
  | "2A"
  | "2B"
  | "3A"
  | "3B"
  | "4A"
  | "4B"
  | "5A"
  | "5B"
  | "6A"
  | "6B"
  | "7A"
  | "7B"
  | "8A"
  | "8B"
  | "9A"
  | "9B"
  | "10A"
  | "10B"
  | "11A"
  | "11B"
  | "12A"
  | "12B";

export type MusicalKey =
  | "C"
  | "C♯"
  | "D♭"
  | "D"
  | "D♯"
  | "E♭"
  | "E"
  | "F"
  | "F♯"
  | "G♭"
  | "G"
  | "G♯"
  | "A♭"
  | "A"
  | "A♯"
  | "B♭"
  | "B"
  | "Cm"
  | "C♯m"
  | "D♭m"
  | "Dm"
  | "D♯m"
  | "E♭m"
  | "Em"
  | "Fm"
  | "F♯m"
  | "G♭m"
  | "Gm"
  | "G♯m"
  | "A♭m"
  | "Am"
  | "A♯m"
  | "B♭m"
  | "Bm";

export type TransitionType =
  | "same-key"
  | "relative"
  | "perfect-fifth"
  | "energy-boost"
  | "energy-drop";

export type EnergyLevel =
  | "low"
  | "building"
  | "peak"
  | "sustained"
  | "descending";

export type FocusPhase =
  | "arrival"
  | "engage"
  | "flow"
  | "lockin"
  | "easeoff"
  | "landing";

export interface AudioAnalysis {
  tempo: number;
  key: MusicalKey;
  camelotKey: CamelotKey;
  energy: number;
  mood: string[];
  duration: number;
  sampleRate: number;
}

export interface FocusTrack {
  number: number;
  phase: FocusPhase;
  targetBPM: number;
  targetKey: CamelotKey;
  musicalKey: MusicalKey;
  energy: EnergyLevel;
  transition: TransitionType;
  duration: number;
}

export interface ArcConfig {
  totalTracks: number;
  totalDuration: number;
  startBPM: number;
  peakBPM: number;
  endBPM: number;
  startKey: CamelotKey;
  allowedTransitions: TransitionType[];
}

export interface SunoPrompt {
  trackNumber: number;
  title: string;
  duration: string;
  tempo: number;
  key: MusicalKey;
  camelotKey: CamelotKey;
  prompt: string;
  lyrics: string;
  style: string;
  instrumental: boolean;
  excludeStyles: string;
  weirdness: number;
  styleInfluence: number;
  _metadata: {
    phase: FocusPhase;
    energy: EnergyLevel;
    transition: TransitionType;
    transitionFrom?: CamelotKey;
    purpose: string;
  };
}

export interface FocusAlbum {
  name: string;
  description: string;
  totalDuration: number;
  trackCount: number;
  arc: FocusTrack[];
  prompts: SunoPrompt[];
  createdAt: Date;
  inspirationSource?: string;
}

export interface GenerateOptions {
  source?: string;
  name?: string;
  startKey?: CamelotKey;
  startBPM?: number;
  peakBPM?: number;
  tracks?: number;
  output?: string;
  analyze?: boolean;
}

export interface AnalyzeOptions {
  source: string;
  output?: string;
}
