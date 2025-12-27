#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { designFocusArc, visualizeArc } from "./lib/arc-designer.js";
import {
  generateAlbumPrompts,
  formatPromptsForCLI,
} from "./lib/prompt-generator.js";
import { analyzeAudioFile } from "./analyzers/audio-analyzer.js";
import { analyzeWithGemini } from "./analyzers/gemini-analyzer.js";
import { getCamelotKey } from "./lib/camelot-wheel.js";
import type { CamelotKey, GenerateOptions } from "./types/index.js";

const program = new Command();

program
  .name("suno-admin")
  .description("AI-powered Suno v5 prompt generator for focus music albums")
  .version("0.1.0");

program
  .command("generate")
  .description("Generate Suno prompts for a 10-track focus album")
  .option("-s, --source <path>", "Audio file to analyze for inspiration")
  .option("-n, --name <name>", "Album name", "Focus Session")
  .option("-k, --start-key <key>", "Starting Camelot key (e.g., 1A)")
  .option("--start-bpm <bpm>", "Starting BPM")
  .option("--peak-bpm <bpm>", "Peak BPM")
  .option("-o, --output <dir>", "Output directory", "./output")
  .action(async (options: GenerateOptions) => {
    const { showIntro, showAlbumReveal, showOutro } = await import(
      "./lib/tui-effects.js"
    );

    await showIntro();
    let startBPM = 60;
    let peakBPM = 85;
    let startKey: CamelotKey = "1A";

    if (options.source) {
      const spinner = ora("Analyzing audio file...").start();

      try {
        const analysis = await analyzeAudioFile(options.source);

        if (!analysis) {
          spinner.fail("Audio analysis failed");
          console.log(
            chalk.yellow("\n⚠️  Continuing with default settings...\n"),
          );
        } else {
          spinner.succeed(
            `Analyzed audio: ${analysis.tempo} BPM, ${analysis.key}`,
          );

          const geminiSpinner = ora(
            "Getting AI insights from Gemini...",
          ).start();
          const geminiAnalysis = await analyzeWithGemini(analysis);
          geminiSpinner.succeed("AI analysis complete!");

          console.log(chalk.cyan("\n📊 Audio Analysis:"));
          console.log(chalk.gray(`   Detected Tempo: ${analysis.tempo} BPM`));
          console.log(chalk.gray(`   Detected Key: ${analysis.key}`));
          console.log(
            chalk.gray(
              `   Energy Level: ${(analysis.energy * 100).toFixed(0)}%`,
            ),
          );

          console.log(chalk.cyan("\n🤖 AI Insights:"));
          console.log(chalk.gray(`   Mood: ${geminiAnalysis.mood.join(", ")}`));
          console.log(chalk.gray(`   Style: ${geminiAnalysis.style}`));
          console.log(
            chalk.gray(
              `   Instruments: ${geminiAnalysis.instruments.join(", ")}`,
            ),
          );
          console.log(
            chalk.gray(`   Atmosphere: ${geminiAnalysis.atmosphere}`),
          );
          console.log(
            chalk.gray(
              `   Suggested BPM Range: ${geminiAnalysis.suggestedBPMRange.min}-${geminiAnalysis.suggestedBPMRange.max}\n`,
            ),
          );

          startBPM = geminiAnalysis.suggestedBPMRange.min;
          peakBPM = geminiAnalysis.suggestedBPMRange.max;

          const detectedCamelotKey = getCamelotKey(analysis.key as any);
          if (detectedCamelotKey) {
            startKey = detectedCamelotKey;
          }
        }
      } catch (error) {
        spinner.fail("Analysis error");
        console.error(
          chalk.red(error instanceof Error ? error.message : "Unknown error"),
        );
        console.log(
          chalk.yellow("\n⚠️  Continuing with default settings...\n"),
        );
      }
    }

    if (options.startBPM) startBPM = parseInt(options.startBPM.toString());
    if (options.peakBPM) peakBPM = parseInt(options.peakBPM.toString());
    if (options.startKey) startKey = options.startKey as CamelotKey;

    const spinner = ora("Designing focus session arc...").start();

    try {
      const arc = designFocusArc({
        startBPM,
        peakBPM,
        startKey,
      });

      spinner.succeed("Arc designed successfully!");

      console.log(chalk.cyan("\n" + visualizeArc(arc)));

      spinner.start("Generating creative names...");
      const { generateCreativeNames } = await import(
        "./lib/creative-naming.js"
      );
      const phaseSequence = arc.map((t) => t.phase);
      const creativeNames = await generateCreativeNames(
        phaseSequence,
        options.source,
      );
      spinner.succeed("Creative names generated!");

      await showAlbumReveal(creativeNames.album, creativeNames.tracks);

      spinner.start("Generating Suno prompts...");
      const prompts = generateAlbumPrompts(arc, creativeNames.tracks);
      spinner.succeed(`Generated ${prompts.length} Suno prompts!`);

      const outputDir = options.output || "./output";
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().split("T")[0];
      const albumName = options.name || creativeNames.album;
      const fileName = `${albumName.toLowerCase().replace(/\s+/g, "-")}-${timestamp}.json`;
      const filePath = join(outputDir, fileName);

      const albumData = {
        name: albumName,
        trackNames: creativeNames.tracks,
        createdAt: new Date().toISOString(),
        totalTracks: arc.length,
        totalDuration: arc.reduce((sum, t) => sum + t.duration, 0),
        inspirationSource: options.source,
        arc,
        prompts,
      };

      writeFileSync(filePath, JSON.stringify(albumData, null, 2));

      console.log(chalk.green(`\n✅ Album data saved to: ${filePath}`));

      console.log(formatPromptsForCLI(prompts));

      await showOutro();
      console.log(
        chalk.yellow("   Make sure to set: Instrumental=true, Vocals=false\n"),
      );
    } catch (error) {
      spinner.fail("Failed to generate prompts");
      console.error(
        chalk.red(error instanceof Error ? error.message : "Unknown error"),
      );
      process.exit(1);
    }
  });

program
  .command("analyze")
  .description("Analyze an audio file (test the AI analysis)")
  .argument("<file>", "Audio file path")
  .action(async (file: string) => {
    const spinner = ora("Analyzing audio...").start();

    try {
      const analysis = await analyzeAudioFile(file);

      if (!analysis) {
        spinner.fail("Analysis failed");
        process.exit(1);
      }

      spinner.succeed("Audio analysis complete!");

      console.log(chalk.cyan("\n📊 Technical Analysis:"));
      console.log(JSON.stringify(analysis, null, 2));

      const geminiSpinner = ora("Getting AI insights...").start();
      const geminiAnalysis = await analyzeWithGemini(analysis);
      geminiSpinner.succeed("AI analysis complete!");

      console.log(chalk.cyan("\n🤖 AI Insights:"));
      console.log(JSON.stringify(geminiAnalysis, null, 2));
      console.log("");
    } catch (error) {
      spinner.fail("Analysis failed");
      console.error(
        chalk.red(error instanceof Error ? error.message : "Unknown error"),
      );
      process.exit(1);
    }
  });

program
  .command("preview")
  .description("Preview the focus arc structure without generating prompts")
  .option("-k, --start-key <key>", "Starting Camelot key (e.g., 1A)", "1A")
  .option("--start-bpm <bpm>", "Starting BPM", "60")
  .option("--peak-bpm <bpm>", "Peak BPM", "85")
  .action((options) => {
    const startBPM = parseInt(options.startBpm || "60");
    const peakBPM = parseInt(options.peakBpm || "85");
    const startKey = (options.startKey || "1A") as CamelotKey;

    const arc = designFocusArc({
      startBPM,
      peakBPM,
      startKey,
    });

    console.log(chalk.cyan(visualizeArc(arc)));
  });

program
  .command("convert")
  .description(
    "Convert audio to sacred frequencies (432Hz, 444Hz, 528Hz, 1111Hz, etc.)",
  )
  .argument("<input>", "Input audio file or directory")
  .option(
    "-f, --frequency <freq>",
    "Target frequency (432, 444, 528, 639, 741, 852, 963, 1111)",
    "432",
  )
  .option("-o, --output <path>", "Output file or directory")
  .action(
    async (input: string, options: { frequency: string; output?: string }) => {
      const {
        convertToSacredFrequency,
        convertAlbumToFrequency,
        listSacredFrequencies,
      } = await import("./lib/frequency-converter.js");
      const { showFrequencyBanner } = await import("./lib/tui-effects.js");
      const { statSync } = await import("fs");

      const targetFreq = parseInt(options.frequency) as any;
      const validFreqs = [432, 444, 528, 639, 741, 852, 963, 1111];

      if (!validFreqs.includes(targetFreq)) {
        console.error(chalk.red(`❌ Invalid frequency: ${targetFreq}`));
        console.log(chalk.yellow("\nValid frequencies:"));
        listSacredFrequencies();
        process.exit(1);
      }

      const freqNames: Record<number, string> = {
        432: "Natural Tuning",
        444: "Spiritual Clarity",
        528: "Love Frequency",
        639: "Connection",
        741: "Awakening",
        852: "Intuition",
        963: "Divine Connection",
        1111: "Manifestation",
      };

      await showFrequencyBanner(targetFreq, freqNames[targetFreq]);

      const spinner = ora("Converting to sacred frequency...").start();

      try {
        const isDirectory = statSync(input).isDirectory();

        if (isDirectory) {
          spinner.stop();
          const outputDir = options.output || `${input}-${targetFreq}hz`;
          await convertAlbumToFrequency(input, outputDir, targetFreq);
        } else {
          const outputFile =
            options.output ||
            input.replace(/\.(mp3|wav)$/, `-${targetFreq}hz.$1`);
          const result = await convertToSacredFrequency({
            inputFile: input,
            outputFile,
            targetFrequency: targetFreq,
          });

          if (result.success) {
            spinner.succeed(
              `Converted to ${targetFreq}Hz: ${result.outputFile}`,
            );
          } else {
            spinner.fail(`Conversion failed: ${result.error}`);
            process.exit(1);
          }
        }
      } catch (error) {
        spinner.fail("Conversion failed");
        console.error(
          chalk.red(error instanceof Error ? error.message : "Unknown error"),
        );
        process.exit(1);
      }
    },
  );

program
  .command("master")
  .description("Master tracks with reference matching or presets, optionally convert to sacred frequency")
  .argument("<input>", "Audio file or directory to master")
  .option(
    "-p, --preset <preset>",
    "Mastering preset: warm-handpan, meditation, ambient, acoustic",
    "warm-handpan",
  )
  .option(
    "-r, --reference <path>",
    "Reference track to match (uses AI-powered matchering)",
  )
  .option(
    "-f, --frequency <freq>",
    "Sacred frequency conversion (432, 444, 528, 639, 741, 852, 963, 1111)",
  )
  .option("-s, --suffix <suffix>", "Output filename suffix")
  .option("-b, --bit-depth <depth>", "Output bit depth for reference mastering (16, 24, 32)", "24")
  .action(
    async (
      input: string,
      options: { preset: string; reference?: string; frequency?: string; suffix?: string; bitDepth: string },
    ) => {
      const { existsSync, statSync } = await import("fs");
      const { basename, join } = await import("path");
      const { convertAlbumToFrequency, convertToSacredFrequency } = await import("./lib/frequency-converter.js");

      const validFreqs = [432, 444, 528, 639, 741, 852, 963, 1111];
      const sacredFreq = options.frequency ? parseInt(options.frequency) : undefined;

      if (sacredFreq && !validFreqs.includes(sacredFreq)) {
        console.error(chalk.red(`❌ Invalid frequency: ${sacredFreq}`));
        console.log(chalk.yellow(`\nValid frequencies: ${validFreqs.join(", ")}`));
        process.exit(1);
      }

      if (!existsSync(input)) {
        console.error(chalk.red(`❌ Input not found: ${input}`));
        process.exit(1);
      }

      const isDirectory = statSync(input).isDirectory();
      let masteredDir = isDirectory ? join(input, "mastered") : join(input, "..", "mastered");
      let trackCount = 0;

      if (options.reference) {
        const { batchMasterWithReference, masterWithReference } = await import(
          "./lib/audio-mastering.js"
        );

        if (!existsSync(options.reference)) {
          console.error(chalk.red(`❌ Reference file not found: ${options.reference}`));
          process.exit(1);
        }

        console.log(chalk.magenta.bold("\n🎚️  REFERENCE MASTERING\n"));
        console.log(chalk.cyan(`Reference Track: ${basename(options.reference)}`));
        console.log(chalk.dim("Using matchering to match your tracks to the reference's sound profile"));
        console.log(chalk.dim(`Bit Depth: ${options.bitDepth}-bit`));
        if (sacredFreq) {
          console.log(chalk.yellow(`Sacred Frequency: ${sacredFreq}Hz (applied after mastering)`));
        }
        console.log("");

        const spinner = ora("Processing tracks with reference matching...").start();

        try {
          if (isDirectory) {
            const outputPaths = batchMasterWithReference(input, {
              referencePath: options.reference,
              bitDepth: parseInt(options.bitDepth) as 16 | 24 | 32,
            });
            trackCount = outputPaths.length;
          } else {
            const ext = input.endsWith(".wav") ? ".wav" : ".mp3";
            const outName = `${basename(input, ext)}_mastered${ext}`;
            const { mkdirSync } = await import("fs");
            mkdirSync(masteredDir, { recursive: true });
            const outPath = join(masteredDir, outName);
            const result = masterWithReference(input, outPath, {
              referencePath: options.reference,
              bitDepth: parseInt(options.bitDepth) as 16 | 24 | 32,
            });
            if (!result.success) throw new Error(result.error);
            trackCount = 1;
          }

          spinner.succeed(`Mastered ${trackCount} track${trackCount > 1 ? "s" : ""} to match reference!`);
        } catch (error) {
          spinner.fail("Reference mastering failed");
          console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
          process.exit(1);
        }
      } else {
        const { batchMasterTracks, masterTrack, getPresetDescription } = await import(
          "./lib/audio-mastering.js"
        );

        const validPresets = ["warm-handpan", "meditation", "ambient", "acoustic"];

        if (!validPresets.includes(options.preset)) {
          console.error(chalk.red(`❌ Invalid preset: ${options.preset}`));
          console.log(chalk.yellow("\nAvailable presets:"));
          validPresets.forEach((p) => {
            console.log(chalk.cyan(`  • ${p}: `) + chalk.dim(getPresetDescription(p as any)));
          });
          process.exit(1);
        }

        console.log(chalk.magenta.bold("\n🎚️  MASTERING TRACKS\n"));
        console.log(chalk.cyan(`Preset: ${options.preset}`));
        console.log(chalk.dim(getPresetDescription(options.preset as any)));
        if (sacredFreq) {
          console.log(chalk.yellow(`\nSacred Frequency: ${sacredFreq}Hz (applied after mastering)`));
        }

        const spinner = ora("Processing tracks...").start();

        try {
          if (isDirectory) {
            const outputPaths = batchMasterTracks(input, {
              preset: options.preset as any,
              outputSuffix: options.suffix,
            });
            trackCount = outputPaths.length;
          } else {
            const ext = input.endsWith(".wav") ? ".wav" : ".mp3";
            const outName = `${basename(input, ext)}${options.suffix || ""}_mastered${ext}`;
            const { mkdirSync } = await import("fs");
            mkdirSync(masteredDir, { recursive: true });
            const outPath = join(masteredDir, outName);
            masterTrack(input, outPath, { preset: options.preset as any });
            trackCount = 1;
          }

          spinner.succeed(`Mastered ${trackCount} track${trackCount > 1 ? "s" : ""}!`);
        } catch (error) {
          spinner.fail("Mastering failed");
          console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
          process.exit(1);
        }
      }

      if (sacredFreq) {
        const freqNames: Record<number, string> = {
          432: "Natural Tuning", 444: "Spiritual Clarity", 528: "Love Frequency",
          639: "Connection", 741: "Awakening", 852: "Intuition",
          963: "Divine Connection", 1111: "Manifestation",
        };

        console.log(chalk.magenta.bold(`\n🎵  CONVERTING TO ${sacredFreq}Hz (${freqNames[sacredFreq]})\n`));

        const spinner = ora(`Converting to ${sacredFreq}Hz...`).start();
        const finalDir = isDirectory ? join(input, `final-${sacredFreq}hz`) : masteredDir;

        try {
          if (isDirectory) {
            await convertAlbumToFrequency(masteredDir, finalDir, sacredFreq as any);
          } else {
            const { readdirSync } = await import("fs");
            const files = readdirSync(masteredDir).filter(f => f.endsWith(".mp3") || f.endsWith(".wav"));
            for (const file of files) {
              const ext = file.endsWith(".wav") ? ".wav" : ".mp3";
              const inPath = join(masteredDir, file);
              const outPath = join(finalDir, file.replace(ext, `-${sacredFreq}hz${ext}`));
              await convertToSacredFrequency({ inputFile: inPath, outputFile: outPath, targetFrequency: sacredFreq as any });
            }
          }
          spinner.succeed(`Converted to ${sacredFreq}Hz!`);
          console.log(chalk.green("\n✅ Complete!"));
          console.log(chalk.cyan(`   Mastered: ${masteredDir}/`));
          console.log(chalk.cyan(`   Final (${sacredFreq}Hz): ${finalDir}/\n`));
        } catch (error) {
          spinner.fail("Frequency conversion failed");
          console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
          process.exit(1);
        }
      } else {
        console.log(chalk.green("\n✅ Complete!"));
        console.log(chalk.cyan(`   Output: ${masteredDir}/\n`));
      }
    },
  );

program
  .command("frequencies")
  .description("List all available sacred frequencies")
  .action(async () => {
    const { listSacredFrequencies } = await import(
      "./lib/frequency-converter.js"
    );
    listSacredFrequencies();
  });

program
  .command("help-full")
  .description("Show comprehensive usage guide with all presets and options")
  .action(async () => {
    const { getPresetDescription } = await import("./lib/audio-mastering.js");

    console.log(chalk.magenta.bold(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              SUNO MASTERING TOOLKIT - FULL GUIDE              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`));

    console.log(chalk.cyan.bold("OVERVIEW"));
    console.log(chalk.dim("─".repeat(60)));
    console.log(`
Master your Suno-generated tracks for upload to Pravos.xyz.
Two mastering modes: Reference Matching (AI) or EQ Presets.
Optional sacred frequency conversion (432Hz, etc).
`);

    console.log(chalk.cyan.bold("QUICK START"));
    console.log(chalk.dim("─".repeat(60)));
    console.log(`
${chalk.yellow("# Reference mastering (match your tracks to a reference)")}
npm run master ./my-album -- --reference ./reference-track.mp3

${chalk.yellow("# Reference mastering + 432Hz conversion")}
npm run master ./my-album -- --reference ./ref.mp3 --frequency 432

${chalk.yellow("# Preset mastering (use built-in EQ profiles)")}
npm run master ./my-album -- --preset warm-handpan

${chalk.yellow("# Single file")}
npm run master ./track.wav -- --reference ./ref.mp3 --frequency 432
`);

    console.log(chalk.cyan.bold("MASTERING PRESETS"));
    console.log(chalk.dim("─".repeat(60)));
    const presets = ["warm-handpan", "meditation", "ambient", "acoustic"] as const;
    presets.forEach((p) => {
      console.log(`\n  ${chalk.yellow(p)}`);
      console.log(`  ${chalk.dim(getPresetDescription(p))}`);
    });

    console.log(chalk.cyan.bold("\n\nREFERENCE MASTERING"));
    console.log(chalk.dim("─".repeat(60)));
    console.log(`
Uses ${chalk.yellow("matchering")} (AI-powered) to analyze a reference track and 
match your tracks to its sonic profile (EQ, dynamics, loudness).

${chalk.yellow("Best for:")} When you have a professionally mastered track you 
want your music to sound like.

${chalk.yellow("Options:")}
  --reference, -r   Path to reference audio file
  --bit-depth, -b   Output quality: 16, 24 (default), or 32 bit
`);

    console.log(chalk.cyan.bold("SACRED FREQUENCIES"));
    console.log(chalk.dim("─".repeat(60)));
    console.log(`
Convert from standard 440Hz tuning to alternative frequencies.
Applied ${chalk.yellow("after")} mastering for best quality.

  ${chalk.yellow("432 Hz")} - Natural Tuning
           Grounding, earth connection, harmony

  ${chalk.yellow("444 Hz")} - Spiritual Clarity  
           Higher consciousness, divine connection

  ${chalk.yellow("528 Hz")} - Love Frequency
           DNA repair, transformation, miracles

  ${chalk.yellow("639 Hz")} - Connection
           Relationships, communication, harmony

  ${chalk.yellow("741 Hz")} - Awakening
           Intuition, problem-solving, expression

  ${chalk.yellow("852 Hz")} - Intuition
           Spiritual awakening, inner strength

  ${chalk.yellow("963 Hz")} - Divine Connection
           Pineal gland activation, unity

  ${chalk.yellow("1111 Hz")} - Manifestation
           Alignment, angel numbers, spiritual awakening
`);

    console.log(chalk.cyan.bold("OUTPUT STRUCTURE"));
    console.log(chalk.dim("─".repeat(60)));
    console.log(`
${chalk.yellow("Input:")}  ./my-album/
           ├── track1.mp3
           ├── track1.wav
           └── track2.mp3

${chalk.yellow("After mastering:")}
         ./my-album/
           ├── mastered/
           │   ├── track1_mastered.mp3
           │   ├── track1_mastered.wav
           │   └── track2_mastered.mp3

${chalk.yellow("After mastering + frequency:")}
         ./my-album/
           ├── mastered/           ${chalk.dim("(intermediate)")}
           └── final-432hz/        ${chalk.dim("(upload these)")}
               ├── track1_mastered-432hz.mp3
               ├── track1_mastered-432hz.wav
               └── track2_mastered-432hz.mp3
`);

    console.log(chalk.cyan.bold("FORMAT HANDLING"));
    console.log(chalk.dim("─".repeat(60)));
    console.log(`
${chalk.yellow("MP3")} → MP3  (for regular users, smaller files)
${chalk.yellow("WAV")} → WAV  (for pro users, lossless quality)

Both formats are preserved throughout the pipeline.
`);

    console.log(chalk.cyan.bold("ALL COMMANDS"));
    console.log(chalk.dim("─".repeat(60)));
    console.log(`
  ${chalk.yellow("npm run master")}      Master tracks (reference or preset)
  ${chalk.yellow("npm run convert")}     Convert frequency only (no mastering)
  ${chalk.yellow("npm run analyze")}     Analyze audio file (BPM, key, energy)
  ${chalk.yellow("npm run generate")}    Generate Suno prompts for new album
  ${chalk.yellow("npm run frequencies")} List sacred frequencies
  ${chalk.yellow("npm run help-full")}   Show this guide
`);

    console.log(chalk.dim("─".repeat(60)));
    console.log(chalk.cyan("For Pravos.xyz | Built with matchering + ffmpeg\n"));
  });

program.parse();
