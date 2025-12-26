import type { FocusPhase } from "../types/index.js";

interface CreativeNames {
  album: string;
  tracks: string[];
}

export async function generateCreativeNames(
  phaseSequence: FocusPhase[],
  inspirationContext?: string,
): Promise<CreativeNames> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return generateFallbackNames(phaseSequence);
  }

  const phaseDescriptions = {
    arrival: "grounding into stillness, settling the nervous system",
    engage: "gentle activation, curiosity building",
    flow: "deep immersion, effortless focus",
    lockin: "peak concentration, sustained clarity",
    easeoff: "graceful descent, gentle release",
    landing: "integration, completion, rest",
  };

  const prompt = `You are a creative musician crafting a 25-minute focus music album with 10 tracks.

The album follows this emotional arc:
${phaseSequence.map((phase, i) => `Track ${i + 1} (${phase}): ${phaseDescriptions[phase]}`).join("\n")}

${inspirationContext ? `Musical inspiration: ${inspirationContext}\n` : ""}

Create:
1. An evocative album name (2-4 words, poetic, memorable)
2. Individual track titles that flow together as a narrative journey

Guidelines:
- Album name should evoke deep work, focus, or flow states
- Track names should be poetic, not clinical (avoid "Track 1", "Opening", etc.)
- Use imagery: nature, light, water, breath, space, time
- Create a narrative arc across the 10 tracks
- Think like Brian Eno, Jon Hopkins, or Nils Frahm
- Keep each track name under 6 words

Respond in JSON:
{
  "album": "Album Title Here",
  "tracks": [
    "Track 1 Name",
    "Track 2 Name",
    ...10 total
  ],
  "rationale": "Brief explanation of the naming concept"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No response from Gemini");
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from Gemini response");
    }

    const result = JSON.parse(jsonMatch[0]);

    if (!result.album || !result.tracks || result.tracks.length !== 10) {
      throw new Error("Invalid response format from Gemini");
    }

    return {
      album: result.album,
      tracks: result.tracks,
    };
  } catch (error) {
    console.error("Creative naming failed, using fallback:", error);
    return generateFallbackNames(phaseSequence);
  }
}

function generateFallbackNames(phaseSequence: FocusPhase[]): CreativeNames {
  const poeticNames = [
    "First Light",
    "Settling In",
    "Opening the Gate",
    "Building Momentum",
    "The Deep Waters",
    "Flow State",
    "The Peak",
    "Gentle Descent",
    "Coming Home",
    "Integration",
  ];

  return {
    album: "Deep Work Journey",
    tracks: poeticNames.slice(0, phaseSequence.length),
  };
}
