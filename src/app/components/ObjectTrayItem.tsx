import { useRef } from "react";
import type { HiddenObjectDefinition } from "../../content/schema/level";
import { duration, gsap, motionDuration, motionEase, useGSAP } from "../../motion/gsap";

export function ObjectTrayItem({ object, found }: { object: HiddenObjectDefinition; found: boolean }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    if (!found) return;
    gsap.timeline()
      .to(".object-icon", { scale: 0.82, y: 2, autoAlpha: 0.42, duration: duration(motionDuration.standard), ease: motionEase.settle })
      .fromTo(".object-check", { scale: 0.45, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: duration(motionDuration.standard), ease: "back.out(1.7)" }, "<0.05")
      .to(rootRef.current, { borderColor: "#96a58d", backgroundColor: "rgba(242,245,239,.9)", duration: duration(motionDuration.standard) }, 0);
  }, { scope: rootRef, dependencies: [found] });

  return (
    <div ref={rootRef} className={found ? "static-object-card found" : "static-object-card"} data-object-id={object.id}>
      <div className="object-icon-wrap">
        {object.iconAsset ? <img className="object-icon" src={object.iconAsset} alt="" draggable={false} /> : <span className="object-icon-fallback" aria-hidden="true">○</span>}
        <span className="object-check" aria-hidden="true">✓</span>
      </div>
      <small>{object.label}</small>
    </div>
  );
}
