import { execa } from "execa";
import { basename } from "path";

export type SacredFrequency = 432 | 444 | 528 | 639 | 741 | 852 | 963 | 1111;

const FREQUENCY_INFO: Record<
  SacredFrequency,
  { name: string; purpose: string }
> = {
  432: {
    name: "Natural Tuning",
    purpose: "Grounding, earth connection, harmony",
  },
  444: {
    name: "Spiritual Clarity",
    purpose: "Higher consciousness, divine connection",
  },
  528: {
    name: "Love Frequency",
    purpose: "DNA repair, transformation, miracles",
  },
  639: { name: "Connection", purpose: "Relationships, communication, harmony" },
  741: { name: "Awakening", purpose: "Intuition, problem-solving, expression" },
  852: { name: "Intuition", purpose: "Spiritual awakening, inner strength" },
  963: { name: "Divine Connection", purpose: "Pineal gland activation, unity" },
  1111: {
    name: "Manifestation",
    purpose: "Alignment, angel numbers, spiritual awakening",
  },
};

export interface ConversionOptions {
  inputFile: string;
  outputFile: string;
  targetFrequency: SacredFrequency;
  baseFrequency?: number;
}

export async function convertToSacredFrequency(
  options: ConversionOptions,
): Promise<{ success: boolean; outputFile: string; error?: string }> {
  const {
    inputFile,
    outputFile,
    targetFrequency,
    baseFrequency = 440,
  } = options;

  const info = FREQUENCY_INFO[targetFrequency];
  console.log(
    `Converting to ${targetFrequency}Hz (${info.name}): ${info.purpose}`,
  );

  try {
    const sampleRate = 44100;
    const ratio = targetFrequency / baseFrequency;

    await execa("ffmpeg", [
      "-i",
      inputFile,
      "-af",
      `asetrate=${sampleRate}*${ratio},aresample=${sampleRate},atempo=${baseFrequency}/${targetFrequency}`,
      "-y",
      outputFile,
    ]);

    return { success: true, outputFile };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { success: false, outputFile, error: errorMessage };
  }
}

export async function convertAlbumToFrequency(
  inputDir: string,
  outputDir: string,
  targetFrequency: SacredFrequency,
): Promise<void> {
  const { readdirSync, mkdirSync, existsSync } = await import("fs");

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const files = readdirSync(inputDir).filter(
    (f) => f.endsWith(".mp3") || f.endsWith(".wav"),
  );

  console.log(
    `\nConverting ${files.length} tracks to ${targetFrequency}Hz...\n`,
  );

  for (const file of files) {
    const inputPath = `${inputDir}/${file}`;
    const baseName = basename(file, file.endsWith(".mp3") ? ".mp3" : ".wav");
    const outputPath = `${outputDir}/${baseName}-${targetFrequency}hz.mp3`;

    const result = await convertToSacredFrequency({
      inputFile: inputPath,
      outputFile: outputPath,
      targetFrequency,
    });

    if (result.success) {
      console.log(`✅ ${file} → ${baseName}-${targetFrequency}hz.mp3`);
    } else {
      console.error(`❌ Failed: ${file} - ${result.error}`);
    }
  }

  console.log(`\n✅ Album converted! Output: ${outputDir}\n`);
}

export function listSacredFrequencies(): void {
  console.log("\n🎵 Sacred Frequencies:\n");

  Object.entries(FREQUENCY_INFO).forEach(([freq, info]) => {
    console.log(`${freq} Hz - ${info.name}`);
    console.log(`   ${info.purpose}\n`);
  });
}
