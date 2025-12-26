import chalk from "chalk";
import gradient from "gradient-string";
import figlet from "figlet";
import boxen from "boxen";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const purpleGradient = gradient(["#9D50BB", "#6E48AA", "#4776E6"]);
const pinkGradient = gradient(["#FF6EC7", "#B490FF", "#7FDBFF"]);
const blueGradient = gradient(["#667eea", "#764ba2"]);

export async function showIntro() {
  console.clear();

  const waveFrames = [
    "  ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿",
    " ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿",
    "∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿",
  ];

  for (let i = 0; i < 3; i++) {
    const coloredWave = pinkGradient(waveFrames[i % 3]);
    process.stdout.write("\r" + coloredWave);
    await sleep(150);
  }

  console.log("\n");

  const title = figlet.textSync("SUNO ADMIN", {
    font: "ANSI Shadow",
    horizontalLayout: "default",
  });

  console.log(purpleGradient(title));

  const subtitle = "  ♪  AI-Powered Music Prompt Generator  ♪";
  console.log(pinkGradient(subtitle));

  console.log(
    "\n" +
      blueGradient(
        "  ═══════════════════════════════════════════════════════\n",
      ),
  );

  await sleep(800);
}

export async function showAlbumReveal(albumName: string, trackNames: string[]) {
  console.log("\n");

  const box = boxen(
    chalk.bold.white("🎨  ALBUM CREATED  🎨\n\n") +
      purpleGradient(albumName) +
      "\n\n" +
      chalk.gray("━".repeat(40)) +
      "\n\n" +
      trackNames
        .map(
          (name, idx) =>
            `  ${pinkGradient(`${(idx + 1).toString().padStart(2, " ")}. ${name}`)}`,
        )
        .join("\n"),
    {
      padding: 1,
      margin: 1,
      borderStyle: "round",
      borderColor: "magenta",
      dimBorder: false,
    },
  );

  console.log(box);
  await sleep(500);
}

export async function showFrequencyBanner(frequency: number, name: string) {
  const banner = `
╔═══════════════════════════════════════════╗
║                                           ║
║         SACRED FREQUENCY CONVERTER        ║
║                                           ║
║            ${frequency} Hz - ${name.padEnd(20)}║
║                                           ║
╚═══════════════════════════════════════════╝
  `;

  console.log(pinkGradient(banner));
  await sleep(400);
}

export async function showOutro() {
  console.log("\n");

  const notes = ["♪", "♫", "♬", "♩", "♭", "♮", "♯"];
  const line = notes.map((n) => purpleGradient(` ${n} `)).join("");

  console.log(line);
  console.log(pinkGradient("\n  🎵  Album generation complete!  🎵\n"));
  console.log(
    blueGradient("  ═══════════════════════════════════════════════════════\n"),
  );

  const farewell = [
    "  Next steps:",
    "  1. Copy each prompt to suno.com",
    "  2. Generate your tracks",
    "  3. Convert to sacred frequency (optional)",
    "  4. Upload to Pravos.xyz",
    "",
    "  Happy creating! ✨",
  ];

  console.log(chalk.cyan(farewell.join("\n")));
  console.log("\n");
}

export function createWaveformSpinner() {
  const frames = [
    "▁▂▃▄▅▆▇█",
    "▂▃▄▅▆▇█▁",
    "▃▄▅▆▇█▁▂",
    "▄▅▆▇█▁▂▃",
    "▅▆▇█▁▂▃▄",
    "▆▇█▁▂▃▄▅",
    "▇█▁▂▃▄▅▆",
    "█▁▂▃▄▅▆▇",
  ];

  return {
    interval: 100,
    frames: frames.map((f) => pinkGradient(f)),
  };
}

export function createEqualizerSpinner() {
  const frames = [
    "┃┃┃┃┃┃┃┃",
    "┃┃┃┃┃┃┃█",
    "┃┃┃┃┃┃█┃",
    "┃┃┃┃┃█┃┃",
    "┃┃┃┃█┃┃┃",
    "┃┃┃█┃┃┃┃",
    "┃┃█┃┃┃┃┃",
    "┃█┃┃┃┃┃┃",
    "█┃┃┃┃┃┃┃",
    "┃█┃┃┃┃┃┃",
    "┃┃█┃┃┃┃┃",
    "┃┃┃█┃┃┃┃",
    "┃┃┃┃█┃┃┃",
    "┃┃┃┃┃█┃┃",
    "┃┃┃┃┃┃█┃",
    "┃┃┃┃┃┃┃█",
  ];

  return {
    interval: 80,
    frames: frames.map((f) => purpleGradient(f)),
  };
}

export async function animateText(text: string) {
  const chars = text.split("");

  for (let i = 0; i <= chars.length; i++) {
    process.stdout.write("\r" + pinkGradient(chars.slice(0, i).join("")));
    await sleep(30);
  }

  console.log("\n");
}

export function showSoundWave() {
  const wave = `
    ╭─────────────────────────────────────╮
    │  ∿∿∿   ∿∿∿   ∿∿∿   ∿∿∿   ∿∿∿   ∿∿∿ │
    │ ∿   ∿ ∿   ∿ ∿   ∿ ∿   ∿ ∿   ∿ ∿   │
    │∿     ∿     ∿     ∿     ∿     ∿     │
    ╰─────────────────────────────────────╯
  `;

  console.log(pinkGradient(wave));
}
