import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { loadPlayerProgress } from "../../platform/storage/playerProgress";
import { setUserReducedMotion } from "../../motion/gsap";

export function AppShell() {
  const location = useLocation();
  const [offline, setOffline] = useState(!navigator.onLine);
  const immersive = location.pathname === "/welcome" || location.pathname.endsWith("/play");
  useEffect(() => { void loadPlayerProgress().then((progress) => setUserReducedMotion(progress.settings.reducedMotion)); }, [location.pathname]);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  return (
    <div className={immersive ? "app-shell immersive" : "app-shell"}>
      {offline && <div className="offline-banner" role="status">Offline · downloaded levels remain available</div>}
      {!immersive && <header className="header"><Link to="/" className="wordmark">Stillroom</Link><Link to="/settings" className="shell-icon" aria-label="Settings">⌘</Link></header>}
      <main className={immersive ? "content immersive-content" : "content"}>
        <Outlet />
      </main>
    </div>
  );
}
