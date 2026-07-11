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
