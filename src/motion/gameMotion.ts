import type * as Phaser from "phaser";
import { duration, gsap, motionDuration, motionEase } from "./gsap";

export function animateFoundRing(ring: Phaser.GameObjects.Arc, onComplete: () => void): gsap.core.Tween {
  return gsap.to(ring, {
    radius: 32,
    alpha: 0,
    duration: duration(motionDuration.expressive),
    ease: motionEase.enter,
    onComplete
  });
}

export function animateHintRing(ring: Phaser.GameObjects.Arc, onComplete: () => void): gsap.core.Timeline {
  return gsap.timeline({ onComplete })
    .fromTo(ring, { alpha: 0, radius: 20 }, { alpha: 0.9, radius: 34, duration: duration(0.45), ease: motionEase.enter })
    .to(ring, { alpha: 0.25, radius: 44, repeat: 2, yoyo: true, duration: duration(0.65), ease: "sine.inOut" })
    .to(ring, { alpha: 0, duration: duration(motionDuration.standard), ease: motionEase.exit });
}

export function animateIncorrectTap(marker: Phaser.GameObjects.Arc, onComplete: () => void): gsap.core.Timeline {
  return gsap.timeline({ onComplete })
    .fromTo(marker, { alpha: 0, scale: 0.6 }, { alpha: 0.62, scale: 1, duration: duration(motionDuration.fast), ease: motionEase.enter })
    .to(marker, { alpha: 0, scale: 1.35, duration: duration(motionDuration.standard), ease: motionEase.exit });
}
