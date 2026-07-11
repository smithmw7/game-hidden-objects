import * as Phaser from "phaser";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { staticLevelRepository } from "../../content/static";
import { StaticHiddenObjectScene } from "../../game/scenes/StaticHiddenObjectScene";
import type { LevelDefinition } from "../../content/schema/level";
import type { LevelResult } from "../../game/runtime/GameSession";
import { recordLevelResult } from "../../platform/storage/recordLevelResult";
import { gsap, motionDuration, motionEase, useGSAP, duration } from "../../motion/gsap";

export function StaticPlayScreen() {
  const { levelId = "level-001" } = useParams();
  const [level, setLevel] = useState<LevelDefinition | null>(null);
  const [progress, setProgress] = useState<{ foundObjectIds: readonly string[]; total: number }>({ foundObjectIds: [], total: 0 });
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const screenRef = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    void staticLevelRepository.getLevel(levelId).then(setLevel).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "Could not load the level.");
    });
  }, [levelId]);

  useGSAP(() => {
    gsap.from([".static-game-hud", ".static-object-tray"], {
      y: 18,
      autoAlpha: 0,
      stagger: 0.08,
      duration: duration(motionDuration.standard),
      ease: motionEase.settle
    });
  }, { scope: screenRef, dependencies: [level] });

  useEffect(() => {
    if (!level || !containerRef.current) return;
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 390,
      height: 700,
      parent: containerRef.current,
      backgroundColor: "#242520",
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
    });
    game.scene.add("StaticHiddenObjectScene", StaticHiddenObjectScene, true, {
      level,
      onProgress: (foundObjectIds: readonly string[], total: number) => setProgress({ foundObjectIds, total }),
      onComplete: async (result: LevelResult) => {
        await recordLevelResult(result);
        navigate("/result", { state: { ...result, levelId: level.id, title: level.metadata.name } });
      }
    });
    return () => game.destroy(true);
  }, [level, navigate]);

  if (error) return <section className="panel"><p className="error">{error}</p><Link to="/" className="button button-secondary">Back</Link></section>;

  return (
    <section ref={screenRef} className="static-game-screen" aria-label={level?.metadata.name ?? "Loading level"}>
      <div className="static-game-hud">
        <Link to="/" className="game-icon-button" aria-label="Pause">Ⅱ</Link>
        <span>{level?.metadata.name ?? "Loading"}</span>
        <span>{progress.foundObjectIds.length} of {progress.total}</span>
      </div>
      <div ref={containerRef} className="static-game-canvas" />
      {level && (
        <div className="static-object-tray" aria-label="Objects to find">
          {level.objects.map((object) => (
            <div className={progress.foundObjectIds.includes(object.id) ? "static-object-card found" : "static-object-card"} key={object.id}>
              <span>{progress.foundObjectIds.includes(object.id) ? "✓" : "○"}</span>
              <small>{object.label}</small>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
