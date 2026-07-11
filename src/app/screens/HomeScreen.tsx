import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { loadPlayerProgress } from "../../platform/storage/playerProgress";
import type { PlayerProgress } from "../../platform/storage/ProgressStore";
import { duration, gsap, motionDuration, motionEase, useGSAP } from "../../motion/gsap";
import { staticLevelRepository } from "../../content/static";
import type { LevelSummary } from "../../content/schema/level";

export function HomeScreen() {
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [levels, setLevels] = useState<LevelSummary[]>([]);
  const rootRef = useRef<HTMLElement | null>(null);
  useEffect(() => { void Promise.all([loadPlayerProgress(), staticLevelRepository.listLevels()]).then(([nextProgress, nextLevels]) => { setProgress(nextProgress); setLevels(nextLevels); }); }, []);
  useGSAP(() => { if (progress) gsap.from([".home-hero", ".home-card"], { y: 18, autoAlpha: 0, stagger: 0.08, duration: duration(motionDuration.standard), ease: motionEase.settle }); }, { scope: rootRef, dependencies: [progress] });
  if (!progress) return <section ref={rootRef} className="quiet-loading">Opening the collection…</section>;
  if (!progress.onboardingCompleted) return <Navigate to="/welcome" replace />;
  const unlocked = levels.filter((level) => progress.unlockedLevelIds.includes(level.id));
  const current = unlocked.find((level) => !progress.levels[level.id]?.completed) ?? unlocked.at(-1);
  if (!current) return <section ref={rootRef} className="quiet-loading">Preparing the collection…</section>;
  const record = progress.levels[current.id];
  return (
    <section ref={rootRef} className="home-screen">
      <div className="home-hero"><img src={current.thumbnailAsset} alt="A richly detailed hidden-object scene" /><div className="home-hero-shade" /><div className="home-hero-copy"><p className="eyebrow">{record?.completed ? "Return to the scene" : "Continue exploring"}</p><h1>{current.name}</h1><p>{record?.completed ? `Your best: ${"★".repeat(record.bestStars)}${"☆".repeat(3 - record.bestStars)}` : "A new scene is waiting."}</p><Link className="button" to={`/levels/${current.id}`}>{record?.completed ? "Play again" : "Begin next scene"}</Link></div></div>
      <Link className="home-card" to="/levels"><div><p className="eyebrow">The collection</p><h2>Browse scenes</h2><p>{levels.length} handcrafted rooms to explore.</p></div><span>→</span></Link>
    </section>
  );
}
