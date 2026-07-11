import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import type { HiddenObjectDefinition } from "../../content/schema/level";
import { staticLevelRepository } from "../../content/static";
import { useEffect } from "react";
import type { LevelDefinition } from "../../content/schema/level";

type RectKey = "x" | "y" | "width" | "height";

export function LevelAuthorScreen() {
  const { levelId = "level-001" } = useParams();
  const [level, setLevel] = useState<LevelDefinition | null>(null);
  const [objects, setObjects] = useState<HiddenObjectDefinition[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void staticLevelRepository.getLevel(levelId).then((next) => {
      setLevel(next);
      setObjects(next.objects);
      setSelectedId(next.objects[0]?.id ?? "");
    });
  }, [levelId]);

  const selected = useMemo(() => objects.find((object) => object.id === selectedId), [objects, selectedId]);

  if (!import.meta.env.DEV) return <Navigate to="/" replace />;
  if (!level || !selected) return <section className="panel">Loading authoring tools…</section>;

  function updateRect(key: RectKey, value: number) {
    setObjects((current) => current.map((object) => object.id === selectedId
      ? { ...object, hitRegion: { ...object.hitRegion, [key]: Math.min(1, Math.max(0, value)) } }
      : object));
    setCopied(false);
  }

  return (
    <section className="author-screen">
      <header>
        <div><p className="eyebrow">Development tool</p><h2>{level.metadata.name} target authoring</h2></div>
        <button className="button button-secondary" type="button" onClick={async () => {
          await navigator.clipboard.writeText(JSON.stringify(objects, null, 2));
          setCopied(true);
        }}>{copied ? "Copied" : "Copy objects JSON"}</button>
      </header>
      <div className="author-layout">
        <div className="author-canvas">
          <img src={level.scene.imageAsset} alt={level.metadata.name} draggable={false} />
          {objects.map((object) => (
            <button
              type="button"
              aria-label={`Edit ${object.label}`}
              key={object.id}
              className={object.id === selectedId ? "author-target selected" : "author-target"}
              style={{ left: `${object.hitRegion.x * 100}%`, top: `${object.hitRegion.y * 100}%`, width: `${object.hitRegion.width * 100}%`, height: `${object.hitRegion.height * 100}%` }}
              onClick={() => setSelectedId(object.id)}
            ><span>{object.label}</span></button>
          ))}
        </div>
        <aside className="author-inspector">
          <label>Target<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{objects.map((object) => <option key={object.id} value={object.id}>{object.label}</option>)}</select></label>
          {(["x", "y", "width", "height"] as RectKey[]).map((key) => (
            <label key={key}>{key}<input type="number" min="0" max="1" step="0.005" value={selected.hitRegion[key]} onChange={(event) => updateRect(key, Number(event.target.value))} /></label>
          ))}
          <p className="small">Values are normalized against the original {level.scene.nativeWidth} × {level.scene.nativeHeight} scene. Copy the reviewed object JSON into the level package.</p>
        </aside>
      </div>
    </section>
  );
}
