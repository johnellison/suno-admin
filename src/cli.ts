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
import type { CamelotKey, GenerateOptions } from "./types/index.js";

const program = new Command();

program
  .name("suno-admin")
  .description("AI-powered Suno v5 prompt generator for focus music albums")
  .version("0.1.0");

program
  .command("generate")
  .description("Generate Suno prompts for a 10-track focus album")
  .option("-n, --name <name>", "Album name", "Focus Session")
  .option("-k, --start-key <key>", "Starting Camelot key (e.g., 1A)", "1A")
  .option("--start-bpm <bpm>", "Starting BPM", "60")
  .option("--peak-bpm <bpm>", "Peak BPM", "85")
  .option("-o, --output <dir>", "Output directory", "./output")
  .action((options: GenerateOptions) => {
    const spinner = ora("Designing focus session arc...").start();

    try {
      const startBPM = parseInt(options.startBPM?.toString() || "60");
      const peakBPM = parseInt(options.peakBPM?.toString() || "85");
      const startKey = (options.startKey || "1A") as CamelotKey;

      const arc = designFocusArc({
        startBPM,
        peakBPM,
        startKey,
      });

      spinner.succeed("Arc designed successfully!");

      console.log(chalk.cyan("\n" + visualizeArc(arc)));

      spinner.start("Generating Suno prompts...");
      const prompts = generateAlbumPrompts(arc);
      spinner.succeed(`Generated ${prompts.length} Suno prompts!`);

      const outputDir = options.output || "./output";
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().split("T")[0];
      const albumName = options.name || "Focus Session";
      const fileName = `${albumName.toLowerCase().replace(/\s+/g, "-")}-${timestamp}.json`;
      const filePath = join(outputDir, fileName);

      const albumData = {
        name: albumName,
        createdAt: new Date().toISOString(),
        totalTracks: arc.length,
        totalDuration: arc.reduce((sum, t) => sum + t.duration, 0),
        arc,
        prompts,
      };

      writeFileSync(filePath, JSON.stringify(albumData, null, 2));

      console.log(chalk.green(`\n✅ Album data saved to: ${filePath}`));

      console.log(formatPromptsForCLI(prompts));

      console.log(
        chalk.yellow(
          "\n📌 TIP: Copy each prompt above and paste into suno.com",
        ),
      );
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

program.parse();
