import { useEffect, useState } from "react";
import { ensureAnonymousAuth } from "../../services/firebase/firebaseClient";
import { ensureWallet, watchWallet } from "../../services/economy/walletService";
import type { Wallet } from "../../types/models";

export function WalletScreen() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    void (async () => {
      const uid = await ensureAnonymousAuth();
      await ensureWallet(uid);
      unsub = watchWallet(uid, (w) => {
        setWallet(w);
        setLoading(false);
      });
    })();
    return () => unsub?.();
  }, []);

  return (
    <section className="panel">
      <h2>Wallet</h2>
      {loading && <p>Loading...</p>}
      {!loading && wallet && (
        <div className="wallet-balance">
          <span>Coins: {wallet.coins}</span>
          <span>Tokens: {wallet.tokens}</span>
        </div>
      )}
      <p className="small">Balances sync from Firestore in real time.</p>
    </section>
  );
}
