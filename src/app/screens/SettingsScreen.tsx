import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { PlayerProgress } from "../../platform/storage/ProgressStore";
import { loadPlayerProgress, updatePlayerSettings } from "../../platform/storage/playerProgress";
import { setUserReducedMotion } from "../../motion/gsap";

export function SettingsScreen() {
  const [settings, setSettings] = useState<PlayerProgress["settings"] | null>(null);
  useEffect(() => { void loadPlayerProgress().then((progress) => setSettings(progress.settings)); }, []);
  if (!settings) return <section className="quiet-loading">Loading settings…</section>;
  async function toggle(key: keyof PlayerProgress["settings"]) {
    if (!settings) return;
    const progress = await updatePlayerSettings({ [key]: !settings[key] });
    setSettings(progress.settings);
    if (key === "reducedMotion") setUserReducedMotion(progress.settings.reducedMotion);
  }
  return <section className="settings-screen"><div className="screen-heading"><p className="eyebrow">Preferences</p><h1>Settings</h1></div><div className="settings-panel">
    {(["musicEnabled", "soundEnabled", "hapticsEnabled", "reducedMotion"] as const).map((key) => <button type="button" className="setting-row" key={key} onClick={() => void toggle(key)}><span>{settingLabel(key)}</span><span className={settings[key] ? "toggle active" : "toggle"} aria-label={settings[key] ? "On" : "Off"}><i /></span></button>)}
  </div><nav className="settings-links" aria-label="About and support">
    <Link to="/privacy">Privacy</Link>
    <Link to="/support">Support</Link>
  </nav></section>;
}

function settingLabel(key: keyof PlayerProgress["settings"]): string {
  return { musicEnabled: "Music", soundEnabled: "Sound effects", hapticsEnabled: "Haptics", reducedMotion: "Reduce motion" }[key];
}
