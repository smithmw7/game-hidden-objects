import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { LevelSummary } from "../../content/schema/level";
import { staticLevelRepository } from "../../content/static";
import { loadPlayerProgress } from "../../platform/storage/playerProgress";
import type { PlayerProgress } from "../../platform/storage/ProgressStore";
import { duration, gsap, motionDuration, motionEase, useGSAP } from "../../motion/gsap";

export function LevelSelectScreen() {
  const [levels, setLevels] = useState<LevelSummary[]>([]);
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => { void Promise.all([staticLevelRepository.listLevels(), loadPlayerProgress()]).then(([nextLevels, nextProgress]) => { setLevels(nextLevels); setProgress(nextProgress); }); }, []);
  useGSAP(() => { if (levels.length) gsap.from(".level-card", { y: 18, autoAlpha: 0, stagger: 0.08, duration: duration(motionDuration.standard), ease: motionEase.settle }); }, { scope: rootRef, dependencies: [levels] });

  return (
    <section ref={rootRef} className="levels-screen">
      <div className="screen-heading"><p className="eyebrow">The collection</p><h1>Choose a scene</h1><p>Take your time. There is always more to notice.</p></div>
      <div className="level-list">
        {levels.map((level, index) => {
          const record = progress?.levels[level.id];
          const unlocked = progress?.unlockedLevelIds.includes(level.id) ?? false;
          const content = <>
              <img src={level.thumbnailAsset} alt="" />
              <div className="level-card-copy"><span>{level.chapter} · {String(index + 1).padStart(2, "0")}</span><h2>{level.name}</h2><p>{!unlocked ? "Complete the previous scene" : record?.completed ? `${"★".repeat(record.bestStars)}${"☆".repeat(3 - record.bestStars)} · Best ${formatTime(record.bestTimeMs)}` : "New scene"}</p></div>
              <span className="level-card-arrow" aria-hidden="true">{unlocked ? "→" : "○"}</span>
            </>;
          return unlocked
            ? <Link className="level-card" to={`/levels/${level.id}`} key={level.id}>{content}</Link>
            : <div className="level-card level-card-locked" aria-label={`${level.name} locked`} key={level.id}>{content}</div>;
        })}
        <div className="level-card level-card-locked" aria-label="More scenes coming soon"><div className="locked-art">{String(levels.length + 1).padStart(2, "0")}</div><div className="level-card-copy"><span>Next chapter</span><h2>More scenes soon</h2><p>The collection will continue.</p></div></div>
      </div>
    </section>
  );
}

function formatTime(ms: number | null): string {
  if (ms == null) return "—";
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
