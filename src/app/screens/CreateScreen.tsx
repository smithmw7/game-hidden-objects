import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ensureAnonymousAuth } from "../../services/firebase/firebaseClient";
import {
  callCreateLevel,
  callSuggestHiddenObjects
} from "../../services/level/cloudFunctions";
import { resolveObjectsFallback, uploadLevelImage } from "../../services/level/levelService";

export function CreateScreen() {
  const [title, setTitle] = useState("Cozy Room");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [useAi, setUseAi] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedImage) {
      setError("Choose an image first.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const uid = await ensureAnonymousAuth();
      const levelId = crypto.randomUUID();
      const imagePath = `levels/${uid}/${levelId}/main.jpg`;
      const thumbnailPath = `levels/${uid}/${levelId}/thumb.jpg`;
      const imageUrl = await uploadLevelImage(uid, levelId, selectedImage);

      let objects;
      if (useAi) {
        objects = await callSuggestHiddenObjects(imageUrl);
      } else {
        objects = await resolveObjectsFallback();
      }

      const { code } = await callCreateLevel({
        title,
        imagePath,
        thumbnailPath,
        imageUrl,
        objects,
        visibility: "public"
      });

      navigate(`/play/${code}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Failed to create level.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <h2>Create Level</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={48} />
        </label>
        <label>
          Image
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setSelectedImage(event.target.files?.[0] ?? null)}
          />
        </label>
        <label className="row" style={{ alignItems: "center" }}>
          <input
            type="checkbox"
            checked={useAi}
            onChange={(event) => setUseAi(event.target.checked)}
          />
          <span>Use AI object suggestions (spends 1 token)</span>
        </label>
        <button className="button" disabled={busy} type="submit">
          {busy ? "Publishing..." : "Publish Level"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </section>
  );
}
