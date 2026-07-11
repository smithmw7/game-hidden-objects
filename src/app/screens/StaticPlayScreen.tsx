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
  const [elapsedMs, setElapsedMs] = useState(0);
  const [availableHints, setAvailableHints] = useState(0);
  const [incorrectTaps, setIncorrectTaps] = useState(0);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const screenRef = useRef<HTMLElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
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

  useGSAP(() => {
    if (!paused) return;
    gsap.from(".game-pause-panel", {
      y: 20,
      scale: 0.97,
      autoAlpha: 0,
      duration: duration(motionDuration.standard),
      ease: motionEase.settle
    });
  }, { scope: screenRef, dependencies: [paused] });

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
    gameRef.current = game;
    game.scene.add("StaticHiddenObjectScene", StaticHiddenObjectScene, true, {
      level,
      onProgress: (foundObjectIds: readonly string[], total: number) => setProgress({ foundObjectIds, total }),
      onElapsed: setElapsedMs,
      onHintsChanged: setAvailableHints,
      onIncorrectTap: setIncorrectTaps,
      onComplete: async (result: LevelResult) => {
        await recordLevelResult(result);
        navigate("/result", { state: { ...result, levelId: level.id, title: level.metadata.name } });
      }
    });
    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, [level, navigate]);

  function scene(): StaticHiddenObjectScene | null {
    const activeScene = gameRef.current?.scene.getScene("StaticHiddenObjectScene");
    return activeScene instanceof StaticHiddenObjectScene ? activeScene : null;
  }

  function pauseGame() {
    scene()?.pauseSession();
    setPaused(true);
  }

  function resumeGame() {
    scene()?.resumeSession();
    setPaused(false);
  }

  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const timer = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`;

  if (error) return <section className="panel"><p className="error">{error}</p><Link to="/" className="button button-secondary">Back</Link></section>;

  return (
    <section ref={screenRef} className="static-game-screen" aria-label={level?.metadata.name ?? "Loading level"}>
      <div className="static-game-hud" onPointerDown={(event) => event.stopPropagation()}>
        <button type="button" className="game-icon-button" aria-label="Pause" onClick={pauseGame}>Ⅱ</button>
        <span>{timer} · {level?.metadata.name ?? "Loading"}</span>
        <span>{progress.foundObjectIds.length} of {progress.total}</span>
      </div>
      <div ref={containerRef} className="static-game-canvas" />
      {level && (
        <div className="static-object-tray" aria-label="Objects to find" onPointerDown={(event) => event.stopPropagation()}>
          {level.objects.map((object) => (
            <div className={progress.foundObjectIds.includes(object.id) ? "static-object-card found" : "static-object-card"} key={object.id}>
              <span>{progress.foundObjectIds.includes(object.id) ? "✓" : "○"}</span>
              <small>{object.label}</small>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        className="game-hint-button"
        disabled={availableHints === 0 || paused}
        aria-label={`${availableHints} hints available`}
        onClick={() => scene()?.requestHint()}
        onPointerDown={(event) => event.stopPropagation()}
      ><span aria-hidden="true">◌</span><small>{availableHints}</small></button>
      {incorrectTaps > 0 && <span className="incorrect-count" aria-live="polite">Misses {incorrectTaps}</span>}
      {paused && (
        <div className="game-pause-backdrop" role="dialog" aria-modal="true" aria-label="Game paused" onPointerDown={(event) => event.stopPropagation()}>
          <div className="game-pause-panel">
            <p className="eyebrow">Quiet Morning</p>
            <h2>Paused</h2>
            <button type="button" className="button" onClick={resumeGame}>Resume</button>
            <Link to="/" className="button button-secondary">Leave level</Link>
          </div>
        </div>
      )}
    </section>
  );
}
