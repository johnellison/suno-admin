import type { AudioAnalysis } from "../types/index.js";

interface GeminiAnalysisResult {
  mood: string[];
  style: string;
  instruments: string[];
  atmosphere: string;
  suggestedBPMRange: { min: number; max: number };
}

export async function analyzeWithGemini(
  basicAnalysis: AudioAnalysis,
): Promise<GeminiAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set, using basic analysis only");
    return {
      mood: ["focused", "meditative", "calm"],
      style: "handpan meditation",
      instruments: ["handpan", "ambient pads"],
      atmosphere: "peaceful and centering",
      suggestedBPMRange: { min: 60, max: 85 },
    };
  }

  const prompt = `Analyze this audio sample for music production. The basic analysis shows:
- Tempo: ${basicAnalysis.tempo} BPM
- Key: ${basicAnalysis.key}
- Energy level: ${basicAnalysis.energy.toFixed(2)}

Please provide:
1. Mood descriptors (3-5 words like: calm, meditative, flowing, energetic, grounding)
2. Musical style (be specific: "ambient handpan meditation", "rhythmic percussion focus music", etc.)
3. Detected instruments (handpan, flute, percussion, pads, drone, etc.)
4. Overall atmosphere (1 sentence)
5. Suggested BPM range for similar music (min and max)

Respond in JSON format:
{
  "mood": ["word1", "word2", "word3"],
  "style": "style description",
  "instruments": ["instrument1", "instrument2"],
  "atmosphere": "one sentence description",
  "suggestedBPMRange": { "min": 60, "max": 75 }
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

    const result: GeminiAnalysisResult = JSON.parse(jsonMatch[0]);
    return result;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      mood: ["focused", "meditative", "calm"],
      style: "handpan meditation",
      instruments: ["handpan", "ambient pads"],
      atmosphere: "peaceful and centering",
      suggestedBPMRange: {
        min: basicAnalysis.tempo - 10,
        max: basicAnalysis.tempo + 10,
      },
    };
  }
}
