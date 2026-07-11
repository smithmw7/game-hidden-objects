import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import type { PlayerProgress } from "../storage/ProgressStore";
import { loadPlayerProgress } from "../storage/playerProgress";

type FeedbackCue = "found" | "miss" | "hint" | "complete";

export class GameFeedback {
  private settings?: PlayerProgress["settings"];
  private audioContext?: AudioContext;

  async prepare(): Promise<void> {
    this.settings = (await loadPlayerProgress()).settings;
  }

  cue(type: FeedbackCue): void {
    const settings = this.settings;
    if (!settings) return;
    if (settings.hapticsEnabled) void this.haptic(type);
    if (settings.soundEnabled) this.tone(type);
  }

  destroy(): void {
    void this.audioContext?.close();
    this.audioContext = undefined;
  }

  private async haptic(type: FeedbackCue): Promise<void> {
    try {
      if (type === "complete") await Haptics.notification({ type: NotificationType.Success });
      else if (type === "miss") await Haptics.notification({ type: NotificationType.Warning });
      else await Haptics.impact({ style: type === "hint" ? ImpactStyle.Medium : ImpactStyle.Light });
    } catch {
      if (typeof navigator.vibrate === "function") navigator.vibrate(type === "complete" ? [25, 40, 25] : 18);
    }
  }

  private tone(type: FeedbackCue): void {
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;
    this.audioContext ??= new AudioContextClass();
    if (this.audioContext.state === "suspended") void this.audioContext.resume();
    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const frequency = { found: 620, miss: 180, hint: 440, complete: 740 }[type];
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    if (type === "complete") oscillator.frequency.exponentialRampToValueAtTime(980, now + 0.22);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(type === "miss" ? 0.025 : 0.045, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (type === "complete" ? 0.3 : 0.13));
    oscillator.connect(gain).connect(this.audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + (type === "complete" ? 0.32 : 0.15));
  }
}
