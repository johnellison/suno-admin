import { execSync } from "child_process";
import { existsSync, readdirSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type MasteringPreset =
  | "warm-handpan"
  | "meditation"
  | "ambient"
  | "acoustic";

export interface MasteringOptions {
  preset: MasteringPreset;
  sacredFrequency?: number;
  outputSuffix?: string;
}

const SACRED_FREQUENCIES: Record<number, number> = {
  432: 432 / 440,
  444: 444 / 440,
  528: 528 / 440,
  1111: 1111 / 440,
};

function getSoxPreset(preset: MasteringPreset): string[] {
  const presets: Record<MasteringPreset, string[]> = {
    "warm-handpan": [
      "highpass 40",
      "equalizer 150 0.5q +2.5",
      "equalizer 500 0.8q +1",
      "equalizer 3000 1q -1",
      "equalizer 8000 1.5q -3",
      "equalizer 15000 2q -2",
      "reverb 20 50 100",
      "compand 0.3,1 6:-70,-60,-20 -5 -90 0.2",
      "norm -1",
    ],
    meditation: [
      "highpass 30",
      "equalizer 100 0.5q +2",
      "equalizer 400 0.8q +1.5",
      "equalizer 6000 2q -2",
      "equalizer 10000 2q -3",
      "reverb 30 50 100",
      "compand 0.3,1 6:-70,-60,-20 -5 -90 0.2",
      "norm -0.5",
    ],
    ambient: [
      "highpass 35",
      "equalizer 200 0.5q +2",
      "equalizer 1000 0.8q +0.5",
      "equalizer 5000 1.5q -1.5",
      "equalizer 12000 2q -2.5",
      "reverb 40 50 100",
      "compand 0.3,1 6:-70,-60,-20 -5 -90 0.2",
      "norm -1",
    ],
    acoustic: [
      "highpass 40",
      "equalizer 200 0.5q +2",
      "equalizer 800 0.8q +1",
      "equalizer 4000 1q -1",
      "equalizer 10000 1.5q -2",
      "compand 0.3,1 6:-70,-60,-20 -5 -90 0.2",
      "norm -1",
    ],
  };

  return presets[preset];
}

export function masterTrack(
  inputPath: string,
  outputPath: string,
  options: MasteringOptions,
): void {
  if (!existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const soxEffects = getSoxPreset(options.preset);
  let tempo = 1.0;

  if (options.sacredFrequency && SACRED_FREQUENCIES[options.sacredFrequency]) {
    tempo = SACRED_FREQUENCIES[options.sacredFrequency];
    soxEffects.unshift(`tempo -s ${tempo}`);
  }

  const command = `sox "${inputPath}" "${outputPath}" ${soxEffects.join(" ")}`;

  try {
    execSync(command, { stdio: "pipe" });
  } catch (error: any) {
    throw new Error(
      `Failed to master track: ${error.message}\nCommand: ${command}`,
    );
  }
}

export function batchMasterTracks(
  inputDir: string,
  options: MasteringOptions,
): string[] {
  if (!existsSync(inputDir)) {
    throw new Error(`Input directory not found: ${inputDir}`);
  }

  const files = readdirSync(inputDir).filter(
    (f: string) => f.endsWith(".mp3") || f.endsWith(".wav"),
  );

  if (files.length === 0) {
    throw new Error(`No audio files found in ${inputDir}`);
  }

  const outputDir = path.join(inputDir, "mastered");
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputPaths: string[] = [];

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const originalFormat = path.extname(file);
    const baseName = path.basename(file, originalFormat);
    const suffix = options.outputSuffix || "";
    const freqSuffix = options.sacredFrequency
      ? `_${options.sacredFrequency}Hz`
      : "";
    const outputName = `${baseName}${suffix}${freqSuffix}_mastered${originalFormat}`;
    const outputPath = path.join(outputDir, outputName);

    console.log(`\n🎚️  Mastering: ${file}`);
    console.log(`    Preset: ${options.preset}`);
    if (options.sacredFrequency) {
      console.log(`    Frequency: ${options.sacredFrequency}Hz`);
    }

    masterTrack(inputPath, outputPath, options);
    outputPaths.push(outputPath);

    console.log(`✅  Saved: ${outputName}`);
  }

  return outputPaths;
}

export function getPresetDescription(preset: MasteringPreset): string {
  const descriptions: Record<MasteringPreset, string> = {
    "warm-handpan":
      "Reduces tinny highs (8kHz-15kHz), boosts warm lows (150Hz-500Hz), gentle compression, subtle reverb. Perfect for Suno handpan tracks.",
    meditation:
      "Extra warmth, reduced high frequencies, soft reverb, gentle compression. Ideal for deep meditation and sleep music.",
    ambient:
      "Balanced warmth, moderate reverb, smooth high-end rolloff. Great for ambient soundscapes.",
    acoustic:
      "Natural warmth, preserves acoustic detail, gentle compression. Perfect for piano, guitar, strings.",
  };

  return descriptions[preset];
}

export interface ReferenceMasteringOptions {
  referencePath: string;
  bitDepth?: 16 | 24 | 32;
}

export interface ReferenceMasteringResult {
  success: boolean;
  output?: string;
  error?: string;
}

export function masterWithReference(
  inputPath: string,
  outputPath: string,
  options: ReferenceMasteringOptions,
): ReferenceMasteringResult {
  if (!existsSync(inputPath)) {
    return { success: false, error: `Input file not found: ${inputPath}` };
  }

  if (!existsSync(options.referencePath)) {
    return { success: false, error: `Reference file not found: ${options.referencePath}` };
  }

  const scriptPath = path.join(__dirname, "../../scripts/reference-master.py");
  const projectRoot = path.join(__dirname, "../..");
  const venvPython = path.join(projectRoot, "venv/bin/python3");

  const bitDepth = options.bitDepth || 24;

  const command = `"${venvPython}" "${scriptPath}" "${inputPath}" --reference "${options.referencePath}" --output "${outputPath}" --bit-depth ${bitDepth}`;

  try {
    const result = execSync(command, { stdio: "pipe", encoding: "utf-8" });
    const parsed = JSON.parse(result);

    if (parsed.success) {
      return { success: true, output: parsed.output };
    } else {
      return { success: false, error: parsed.error };
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to master track: ${error.message}`,
    };
  }
}

export function batchMasterWithReference(
  inputDir: string,
  options: ReferenceMasteringOptions,
): string[] {
  if (!existsSync(inputDir)) {
    throw new Error(`Input directory not found: ${inputDir}`);
  }

  const files = readdirSync(inputDir).filter(
    (f: string) => f.endsWith(".mp3") || f.endsWith(".wav"),
  );

  if (files.length === 0) {
    throw new Error(`No audio files found in ${inputDir}`);
  }

  const outputDir = path.join(inputDir, "mastered");
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputPaths: string[] = [];

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const originalFormat = path.extname(file);
    const baseName = path.basename(file, originalFormat);
    const outputName = `${baseName}_mastered${originalFormat}`;
    const outputPath = path.join(outputDir, outputName);

    console.log(`\n🎚️  Reference Mastering: ${file}`);
    console.log(`    Reference: ${path.basename(options.referencePath)}`);

    const result = masterWithReference(inputPath, outputPath, options);

    if (result.success) {
      outputPaths.push(outputPath);
      console.log(`✅  Saved: ${outputName}`);
    } else {
      console.error(`❌  Failed: ${result.error}`);
    }
  }

  return outputPaths;
}
