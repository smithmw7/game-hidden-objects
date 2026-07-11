import type { IncomingMessage } from "node:http";
import type { Plugin } from "vite";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

type GenBody = {
  prompt?: string;
  size?: string;
  quality?: string;
};

type EditBody = {
  prompt?: string;
  image_base64?: string;
  mime_type?: string;
  size?: string;
  quality?: string;
};

async function firstImageB64FromResponse(data: unknown): Promise<string | null> {
  const d = data as {
    data?: { b64_json?: string; url?: string }[];
  };
  const item = d.data?.[0];
  if (!item) {
    return null;
  }
  if (item.b64_json) {
    return item.b64_json;
  }
  if (item.url) {
    const img = await fetch(item.url);
    if (!img.ok) {
      return null;
    }
    const buf = Buffer.from(await img.arrayBuffer());
    return buf.toString("base64");
  }
  return null;
}

/** Pinned snapshot — see https://developers.openai.com/api/docs/models/gpt-image-2 */
export const DEFAULT_OPENAI_IMAGE_MODEL = "gpt-image-2-2026-04-21";

export function openAiImageGenDevPlugin(
  apiKey: string | undefined,
  imageModel: string = DEFAULT_OPENAI_IMAGE_MODEL
): Plugin {
  return {
    name: "openai-image-gen-dev",
    configureServer(server) {
      server.middlewares.use("/__dev/openai-image-gen", async (req, res, next) => {
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }
        if (req.method !== "POST") {
          next();
          return;
        }

        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "OPENAI_API_KEY missing in .env (dev server only)" }));
          return;
        }

        let raw: string;
        try {
          raw = await readBody(req);
        } catch {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Bad request body" }));
          return;
        }

        try {
          const json = JSON.parse(raw || "{}") as GenBody;
          const prompt = typeof json.prompt === "string" ? json.prompt.trim() : "";
          if (!prompt) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "prompt required" }));
            return;
          }

          const size = typeof json.size === "string" && json.size ? json.size : "1024x1536";
          const quality = typeof json.quality === "string" && json.quality ? json.quality : "medium";

          const r = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: imageModel,
              prompt,
              n: 1,
              size,
              quality
            })
          });

          const data = (await r.json()) as { error?: { message?: string } };

          if (!r.ok) {
            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: data.error?.message || r.statusText }));
            return;
          }

          const b64 = await firstImageB64FromResponse(data);
          if (!b64) {
            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "No image in response" }));
            return;
          }

          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ b64_json: b64 }));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }));
        }
      });

      server.middlewares.use("/__dev/openai-image-edit", async (req, res, next) => {
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }
        if (req.method !== "POST") {
          next();
          return;
        }

        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "OPENAI_API_KEY missing in .env (dev server only)" }));
          return;
        }

        let raw: string;
        try {
          raw = await readBody(req);
        } catch {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Bad request body" }));
          return;
        }

        try {
          const json = JSON.parse(raw || "{}") as EditBody;
          const prompt = typeof json.prompt === "string" ? json.prompt.trim() : "";
          const imageBase64 = typeof json.image_base64 === "string" ? json.image_base64.trim() : "";
          const mimeType =
            typeof json.mime_type === "string" && json.mime_type ? json.mime_type : "image/jpeg";

          if (!prompt) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "prompt required" }));
            return;
          }
          if (!imageBase64) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "image_base64 required" }));
            return;
          }

          let bytes: Buffer;
          try {
            bytes = Buffer.from(imageBase64, "base64");
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "invalid base64 image" }));
            return;
          }

          if (bytes.length > 15 * 1024 * 1024) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "image too large (max ~15MB)" }));
            return;
          }

          const size = typeof json.size === "string" && json.size ? json.size : "1024x1536";
          const quality = typeof json.quality === "string" && json.quality ? json.quality : "medium";

          const blob = new Blob([new Uint8Array(bytes)], { type: mimeType });
          const form = new FormData();
          form.set("model", imageModel);
          form.set("prompt", prompt);
          form.set("size", size);
          form.set("quality", quality);
          form.append("image[]", blob, "reference.jpg");

          const r = await fetch("https://api.openai.com/v1/images/edits", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`
            },
            body: form
          });

          const data = (await r.json()) as { error?: { message?: string } };

          if (!r.ok) {
            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: data.error?.message || r.statusText }));
            return;
          }

          const b64 = await firstImageB64FromResponse(data);
          if (!b64) {
            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "No image in edit response" }));
            return;
          }

          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ b64_json: b64 }));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }));
        }
      });
    }
  };
}
