import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { LevelDefinition } from "../../content/schema/level";
import { staticLevelRepository } from "../../content/static";
import { duration, gsap, motionDuration, motionEase, useGSAP } from "../../motion/gsap";

export function LevelBriefingScreen() {
  const { levelId = "level-001" } = useParams();
  const [level, setLevel] = useState<LevelDefinition | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  useEffect(() => { void staticLevelRepository.getLevel(levelId).then(setLevel); }, [levelId]);
  useGSAP(() => { if (level) gsap.from([".briefing-art", ".briefing-copy > *"], { y: 16, autoAlpha: 0, stagger: 0.07, duration: duration(motionDuration.standard), ease: motionEase.settle }); }, { scope: rootRef, dependencies: [level] });
  if (!level) return <section ref={rootRef} className="quiet-loading">Preparing the scene…</section>;
  return (
    <section ref={rootRef} className="briefing-screen">
      <div className="briefing-art"><img src={level.scene.thumbnailAsset} alt={level.metadata.name} /></div>
      <div className="briefing-copy">
        <p className="eyebrow">{level.metadata.chapter}</p><h1>{level.metadata.name}</h1>
        <p>Morning light has settled across the room. Find all {level.objects.length} objects hidden among the details.</p>
        <div className="briefing-facts"><span><strong>{level.objects.length}</strong> objects</span><span><strong>Untimed</strong> relax and explore</span><span><strong>{level.rules.availableHints}</strong> hints</span></div>
        <Link className="button briefing-play" to={`/levels/${level.id}/play`}>Enter the room</Link>
        <Link className="quiet-link" to="/levels">Choose another scene</Link>
      </div>
    </section>
  );
}
