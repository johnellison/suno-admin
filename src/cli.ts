#!/usr/bin/env node
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
  .command("frequencies")
  .description("List all available sacred frequencies")
  .action(async () => {
    const { listSacredFrequencies } = await import(
      "./lib/frequency-converter.js"
    );
    listSacredFrequencies();
  });

program.parse();
