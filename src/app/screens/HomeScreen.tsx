import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { loadPlayerProgress } from "../../platform/storage/playerProgress";
import type { PlayerProgress } from "../../platform/storage/ProgressStore";
import { duration, gsap, motionDuration, motionEase, useGSAP } from "../../motion/gsap";

export function HomeScreen() {
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  useEffect(() => { void loadPlayerProgress().then(setProgress); }, []);
  useGSAP(() => { if (progress) gsap.from([".home-hero", ".home-card"], { y: 18, autoAlpha: 0, stagger: 0.08, duration: duration(motionDuration.standard), ease: motionEase.settle }); }, { scope: rootRef, dependencies: [progress] });
  if (!progress) return <section ref={rootRef} className="quiet-loading">Opening the collection…</section>;
  if (!progress.onboardingCompleted) return <Navigate to="/welcome" replace />;
  const level = progress.levels["level-001"];
  return (
    <section ref={rootRef} className="home-screen">
      <div className="home-hero"><img src="content/level-001/scene.png" alt="A sunlit room filled with hidden details" /><div className="home-hero-shade" /><div className="home-hero-copy"><p className="eyebrow">Continue exploring</p><h1>Quiet Morning</h1><p>{level?.completed ? `Your best: ${"★".repeat(level.bestStars)}${"☆".repeat(3 - level.bestStars)}` : "Your first scene is waiting."}</p><Link className="button" to="/levels/level-001">{level?.completed ? "Play again" : "Begin Level 1"}</Link></div></div>
      <Link className="home-card" to="/levels"><div><p className="eyebrow">The collection</p><h2>Browse scenes</h2><p>One handcrafted room, with more to come.</p></div><span>→</span></Link>
    </section>
  );
}
