import * as Phaser from "phaser";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiddenObjectScene } from "../../game/scenes/HiddenObjectScene";
import { ensureAnonymousAuth } from "../../services/firebase/firebaseClient";
import {
  callRecordLevelComplete,
  callRegisterPlay
} from "../../services/level/cloudFunctions";
import { lookupLevelByCode } from "../../services/level/levelService";
import type { Level } from "../../types/models";

export function PlayScreen() {
  const { code = "" } = useParams();
  const [level, setLevel] = useState<Level | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const foundLevel = await lookupLevelByCode(code);
      if (!foundLevel) {
        setError("Game code not found.");
        setLoading(false);
        return;
      }
      await callRegisterPlay(foundLevel.id);
      setLevel(foundLevel);
      setLoading(false);
    })();
  }, [code]);

  useEffect(() => {
    if (!level || !containerRef.current) {
      return;
    }

    const parent = containerRef.current;
    const scenePayload = {
      imageUrl: level.imageUrl,
      objects: level.objects.map((item) => ({ ...item })),
      onComplete: async (elapsedMs: number) => {
        await ensureAnonymousAuth();
        await callRecordLevelComplete(level.id);
        navigate("/result", { state: { elapsedMs, code: level.code } });
      }
    };

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 390,
      height: 700,
      parent,
      backgroundColor: "#2d2a27",
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    });
    game.scene.add("HiddenObjectScene", HiddenObjectScene, true, scenePayload);
    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, [level, navigate]);

  return (
    <section className="panel">
      <h2>Play</h2>
      {loading && <p>Loading level...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <div>
          <p className="small">Code: {level?.code}</p>
          <div ref={containerRef} className="game-shell" />
        </div>
      )}
    </section>
  );
}
