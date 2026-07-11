import * as Phaser from "phaser";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { staticLevelRepository } from "../../content/static";
import { StaticHiddenObjectScene } from "../../game/scenes/StaticHiddenObjectScene";
import type { LevelDefinition } from "../../content/schema/level";
import type { LevelResult } from "../../game/runtime/GameSession";
import { recordLevelResult } from "../../platform/storage/recordLevelResult";
import { gsap, motionDuration, motionEase, useGSAP, duration } from "../../motion/gsap";
import { GameFeedback } from "../../platform/feedback/GameFeedback";
import { ObjectTrayItem } from "../components/ObjectTrayItem";

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
  const feedbackRef = useRef<GameFeedback | null>(null);
  const foundCountRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    void staticLevelRepository.getLevel(levelId).then(setLevel).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "Could not load the level.");
    });
  }, [levelId]);

  useEffect(() => {
    const feedback = new GameFeedback();
    feedbackRef.current = feedback;
    void feedback.prepare();
    return () => { feedback.destroy(); feedbackRef.current = null; };
  }, []);

  useGSAP(() => {
    gsap.from(".static-object-tray", {
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
    const bounds = containerRef.current.getBoundingClientRect();
    const gameHeight = Math.round(390 * bounds.height / Math.max(1, bounds.width));
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 390,
      height: gameHeight,
      parent: containerRef.current,
      backgroundColor: "#242520",
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
    });
    gameRef.current = game;
    game.scene.add("StaticHiddenObjectScene", StaticHiddenObjectScene, true, {
      level,
      onProgress: (foundObjectIds: readonly string[], total: number) => {
        if (foundObjectIds.length > foundCountRef.current) feedbackRef.current?.cue("found");
        foundCountRef.current = foundObjectIds.length;
        setProgress({ foundObjectIds, total });
      },
      onElapsed: setElapsedMs,
      onHintsChanged: setAvailableHints,
      onIncorrectTap: (count: number) => { setIncorrectTaps(count); feedbackRef.current?.cue("miss"); },
      onLoadError: setError,
      onComplete: async (result: LevelResult) => {
        feedbackRef.current?.cue("complete");
        await recordLevelResult(result);
        navigate("/result", { state: { ...result, levelId: level.id, title: level.metadata.name } });
      }
    });
    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, [level, navigate]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && gameRef.current) {
        scene()?.pauseSession();
        setPaused(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  });

  useEffect(() => {
    const gameWindow = window as Window & { render_game_to_text?: () => string };
    gameWindow.render_game_to_text = () => JSON.stringify({
      mode: paused ? "paused" : "playing",
      coordinateSystem: "Canvas origin top-left; x increases right and y increases down.",
      levelId,
      found: progress.foundObjectIds.length,
      total: progress.total,
      hints: availableHints,
      misses: incorrectTaps,
      elapsedMs,
      camera: scene()?.getCameraState() ?? { zoom: 1, scrollX: 0, scrollY: 0, maxZoom: 2.5 }
    });
    return () => { delete gameWindow.render_game_to_text; };
  });

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

  if (error) return <section ref={screenRef} className="panel"><p className="error">{error}</p><Link to="/" className="button button-secondary">Back</Link></section>;

  return (
    <section ref={screenRef} className="static-game-screen" aria-label={level?.metadata.name ?? "Loading level"}>
      <div ref={containerRef} className="static-game-canvas" />
      {level && (
        <div className="static-object-tray" aria-label="Objects to find" onPointerDown={(event) => event.stopPropagation()}>
          <div className="static-game-status">
            <button type="button" className="tray-pause-button" aria-label="Pause" onClick={pauseGame}>Ⅱ</button>
            <span><strong>{progress.foundObjectIds.length}/{progress.total}</strong><small>Found</small></span>
            <span><strong>{timer}</strong><small>Time</small></span>
            <span><strong>{incorrectTaps}</strong><small>Misses</small></span>
            <button type="button" className="tray-hint-button" disabled={availableHints === 0 || paused} onClick={() => { if (scene()?.requestHint()) feedbackRef.current?.cue("hint"); }}>Hint{availableHints > 0 ? ` · ${availableHints}` : ""}</button>
          </div>
          <div className="static-object-list">
            {level.objects.map((object) => (
              <ObjectTrayItem object={object} found={progress.foundObjectIds.includes(object.id)} key={object.id} />
            ))}
          </div>
        </div>
      )}
      {paused && (
        <div className="game-pause-backdrop" role="dialog" aria-modal="true" aria-label="Game paused" onPointerDown={(event) => event.stopPropagation()}>
          <div className="game-pause-panel">
            <p className="eyebrow">{level?.metadata.name ?? "Scene"}</p>
            <h2>Paused</h2>
            <button type="button" className="button" onClick={resumeGame}>Resume</button>
            <Link to="/" className="button button-secondary">Leave level</Link>
          </div>
        </div>
      )}
    </section>
  );
}
