import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { loadPlayerProgress } from "../../platform/storage/playerProgress";
import { setUserReducedMotion } from "../../motion/gsap";

export function AppShell() {
  const location = useLocation();
  const immersive = location.pathname === "/welcome" || location.pathname.endsWith("/play");
  useEffect(() => { void loadPlayerProgress().then((progress) => setUserReducedMotion(progress.settings.reducedMotion)); }, [location.pathname]);
  return (
    <div className={immersive ? "app-shell immersive" : "app-shell"}>
      {!immersive && <header className="header"><Link to="/" className="wordmark">Stillroom</Link><Link to="/settings" className="shell-icon" aria-label="Settings">⌘</Link></header>}
      <main className={immersive ? "content immersive-content" : "content"}>
        <Outlet />
      </main>
    </div>
  );
}
