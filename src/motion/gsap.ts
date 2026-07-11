import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export { gsap, useGSAP };

export const motionDuration = {
  fast: 0.18,
  standard: 0.32,
  expressive: 0.55
} as const;

export const motionEase = {
  enter: "power2.out",
  exit: "power2.in",
  settle: "power3.out"
} as const;

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function duration(value: number): number {
  return prefersReducedMotion() ? 0 : value;
}
