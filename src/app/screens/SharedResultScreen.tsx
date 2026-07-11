import { useRef } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { duration, gsap, motionDuration, motionEase, useGSAP } from "../../motion/gsap";

interface ResultState { elapsedMs: number; score: number; stars: 1 | 2 | 3; incorrectTaps: number; hintsUsed: number; levelId: string; title?: string; }

export function SharedResultScreen() {
  const state = useLocation().state as ResultState | null;
  const rootRef = useRef<HTMLElement | null>(null);
  useGSAP(() => {
    if (!state) return;
    gsap.from(".result-star", { scale: 0.4, autoAlpha: 0, stagger: 0.14, duration: duration(motionDuration.expressive), ease: "back.out(1.7)" });
    gsap.from([".result-heading", ".result-stats", ".result-actions"], { y: 16, autoAlpha: 0, stagger: 0.08, delay: duration(0.15), duration: duration(motionDuration.standard), ease: motionEase.settle });
  }, { scope: rootRef });
  if (!state?.levelId) return <Navigate to="/levels" replace />;
  const seconds = Math.floor(state.elapsedMs / 1000);
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <section ref={rootRef} className="result-screen">
      <div className="result-heading"><p className="eyebrow">Scene complete</p><h1>{state.title ?? "Quiet Morning"}</h1><p>You found every detail.</p></div>
      <div className="result-stars" aria-label={`${state.stars} stars`}>{[1, 2, 3].map((star) => <span className={star <= state.stars ? "result-star earned" : "result-star"} key={star}>★</span>)}</div>
      <div className="result-stats"><div><span>Time</span><strong>{time}</strong></div><div><span>Score</span><strong>{state.score.toLocaleString()}</strong></div><div><span>Hints</span><strong>{state.hintsUsed}</strong></div><div><span>Misses</span><strong>{state.incorrectTaps}</strong></div></div>
      <div className="result-actions"><Link className="button" to="/levels">Continue</Link><Link className="button button-secondary" to={`/levels/${state.levelId}/play`}>Replay</Link></div>
    </section>
  );
}
