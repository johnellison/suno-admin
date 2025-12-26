import { execa } from "execa";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { AudioAnalysis } from "../types/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PythonAnalysisResult {
  success: boolean;
  file?: string;
  tempo?: number;
  key?: string;
  key_confidence?: number;
  energy?: number;
  brightness?: number;
  percussiveness?: number;
  duration?: number;
  sample_rate?: number;
  error?: string;
}

export async function analyzeAudioFile(
  filePath: string,
): Promise<AudioAnalysis | null> {
  try {
    const scriptPath = join(__dirname, "../../scripts/analyze-audio.py");
    const projectRoot = join(__dirname, "../..");
    const venvPython = join(projectRoot, "venv/bin/python3");

    const { stdout } = await execa(venvPython, [scriptPath, filePath]);
    const result: PythonAnalysisResult = JSON.parse(stdout);

    if (!result.success || !result.tempo || !result.key) {
      console.error("Audio analysis failed:", result.error);
      return null;
    }

    return {
      tempo: Math.round(result.tempo),
      key: result.key as any,
      camelotKey: "1A",
      energy: result.energy || 0.5,
      mood: [],
      duration: result.duration || 0,
      sampleRate: result.sample_rate || 44100,
    };
  } catch (error) {
    console.error("Failed to analyze audio:", error);
    return null;
  }
}
