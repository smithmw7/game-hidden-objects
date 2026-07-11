import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ensureAnonymousAuth } from "../../services/firebase/firebaseClient";
import { ensureWallet } from "../../services/economy/walletService";

export function HomeScreen() {
  const [uid, setUid] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const nextUid = await ensureAnonymousAuth();
      await ensureWallet(nextUid);
      setUid(nextUid);
      setLoading(false);
    })();
  }, []);

  return (
    <section className="panel">
      <h2>Play or Create</h2>
      {loading ? <p>Signing you in...</p> : <p className="small">Guest ID: {uid}</p>}
      <div className="cta-grid">
        <Link to="/levels/level-001/play" className="button">
          Play Quiet Morning
        </Link>
        <Link to="/create" className="button">
          Create Level
        </Link>
        <Link to="/enter-code" className="button">
          Enter Code
        </Link>
        <Link to="/wallet" className="button">
          Wallet
        </Link>
        <Link to="/store" className="button">
          Store
        </Link>
      </div>
    </section>
  );
}
