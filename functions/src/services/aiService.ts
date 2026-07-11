import OpenAI from "openai";

export interface HiddenObjectPayload {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function fallbackObjects(): HiddenObjectPayload[] {
  return [
    { label: "Book", x: 0.26, y: 0.41, width: 0.1, height: 0.08 },
    { label: "Plant", x: 0.67, y: 0.52, width: 0.09, height: 0.13 },
    { label: "Lamp", x: 0.78, y: 0.24, width: 0.07, height: 0.14 }
  ];
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function normalizeObjects(raw: unknown): HiddenObjectPayload[] {
  if (!Array.isArray(raw)) {
    return fallbackObjects();
  }

  const out: HiddenObjectPayload[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const o = item as Record<string, unknown>;
    const label = typeof o.label === "string" ? o.label : "Item";
    out.push({
      label,
      x: clamp01(Number(o.x)),
      y: clamp01(Number(o.y)),
      width: clamp01(Number(o.width)),
      height: clamp01(Number(o.height))
    });
  }

  return out.length > 0 ? out.slice(0, 12) : fallbackObjects();
}

/**
 * Server-only: analyzes image URL via OpenAI when OPENAI_API_KEY is set; otherwise returns fallback.
 */
export async function suggestHiddenObjectsFromImageUrl(imageUrl: string): Promise<HiddenObjectPayload[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallbackObjects();
  }

  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You output JSON only. Given an image, propose 3 hidden-object hunt targets with bounding boxes as fractions of image width/height (0-1). Keys: label, x, y, width, height."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              'Return strict JSON: {"objects":[{"label":"string","x":0.2,"y":0.3,"width":0.08,"height":0.09}]} — normalized coordinates only.'
          },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ],
    max_tokens: 500
  });

  const text = completion.choices[0]?.message?.content ?? "";
  try {
    const parsed = JSON.parse(text) as { objects?: unknown };
    return normalizeObjects(parsed.objects);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as { objects?: unknown };
        return normalizeObjects(parsed.objects);
      } catch {
        return fallbackObjects();
      }
    }
    return fallbackObjects();
  }
}
