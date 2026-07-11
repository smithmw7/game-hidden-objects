import { useState } from "react";
import { Link } from "react-router-dom";

const DEFAULT_PROMPT =
  "Cozy sunlit living room, hidden-object mobile game scene, warm wooden UI frame style, " +
  "plants, books, pets, decorative clutter, painterly detail, portrait composition, no text, no UI chrome";

const DEFAULT_EDIT_PROMPT =
  "Using this photo as reference, create a polished hidden-object game scene in the same layout and subject matter. " +
  "Warm cozy lighting, rich painterly detail, slightly stylized, suitable for finding small objects; no text or HUD.";

function fileToBase64(file: File): Promise<{ base64: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string" || !result.includes(",")) {
        reject(new Error("Could not read image"));
        return;
      }
      const [, b64] = result.split(",", 2);
      resolve({ base64: b64, mime: file.type || "image/jpeg" });
    };
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

export function ImageGenTestScreen() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [editPrompt, setEditPrompt] = useState(DEFAULT_EDIT_PROMPT);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  async function handleGenerate() {
    setBusy(true);
    setError("");
    setImageSrc(null);
    try {
      const res = await fetch("/__dev/openai-image-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          size: "1024x1536",
          quality: "medium"
        })
      });
      const data = (await res.json()) as { b64_json?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      if (!data.b64_json) {
        throw new Error("No image returned");
      }
      setImageSrc(`data:image/png;base64,${data.b64_json}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerateFromPhoto() {
    if (!referenceFile) {
      setError("Choose a photo first.");
      return;
    }
    setBusy(true);
    setError("");
    setImageSrc(null);
    try {
      const { base64, mime } = await fileToBase64(referenceFile);
      const res = await fetch("/__dev/openai-image-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: editPrompt,
          image_base64: base64,
          mime_type: mime,
          size: "1024x1536",
          quality: "medium"
        })
      });
      const data = (await res.json()) as { b64_json?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      if (!data.b64_json) {
        throw new Error("No image returned");
      }
      setImageSrc(`data:image/png;base64,${data.b64_json}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Edit failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <h2>OpenAI GPT Image 2 (dev only)</h2>
      <p className="small">
        Uses <code>gpt-image-2-2026-04-21</code> (or <code>OPENAI_IMAGE_MODEL</code>) via{" "}
        <code>/v1/images/generations</code> and <code>/v1/images/edits</code>. Runs only
        under <code>npm run dev</code>; key stays on the dev server. No Firebase.
      </p>

      <h3 className="small" style={{ marginBottom: "0.35rem" }}>
        A — Generate from prompt
      </h3>
      <label>
        Prompt
        <textarea
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ width: "100%", marginTop: "0.35rem", fontFamily: "inherit", fontSize: "0.95rem" }}
        />
      </label>
      <div className="row" style={{ marginTop: "0.5rem" }}>
        <button type="button" className="button" disabled={busy || !prompt.trim()} onClick={handleGenerate}>
          {busy ? "Working…" : "Generate (text only)"}
        </button>
      </div>

      <hr style={{ margin: "1.25rem 0", border: "none", borderTop: "1px solid #c9b89a" }} />

      <h3 className="small" style={{ marginBottom: "0.35rem" }}>
        B — Reference photo → new scene
      </h3>
      <label>
        Photo
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setReferenceFile(e.target.files?.[0] ?? null)}
          style={{ display: "block", marginTop: "0.35rem" }}
        />
      </label>
      <label>
        Edit prompt
        <textarea
          rows={3}
          value={editPrompt}
          onChange={(e) => setEditPrompt(e.target.value)}
          style={{ width: "100%", marginTop: "0.35rem", fontFamily: "inherit", fontSize: "0.95rem" }}
        />
      </label>
      <div className="row" style={{ marginTop: "0.5rem" }}>
        <button
          type="button"
          className="button"
          disabled={busy || !referenceFile || !editPrompt.trim()}
          onClick={handleGenerateFromPhoto}
        >
          {busy ? "Working…" : "Generate from photo"}
        </button>
        <Link to="/" className="button button-secondary">
          Home
        </Link>
      </div>

      {error && <p className="error">{error}</p>}
      {imageSrc && (
        <div style={{ marginTop: "1rem" }}>
          <p className="small">Result (not saved)</p>
          <img
            src={imageSrc}
            alt="GPT Image 2 output"
            style={{ width: "100%", maxWidth: 512, borderRadius: 12, border: "2px solid #4a3728" }}
          />
        </div>
      )}
    </section>
  );
}
