import { doc, increment, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseClient";
import type { Wallet } from "../../types/models";

function walletRef(uid: string) {
  return doc(db, "users", uid);
}

export async function ensureWallet(uid: string): Promise<void> {
  await setDoc(
    walletRef(uid),
    {
      uid,
      coins: 100,
      tokens: 3,
      createdAt: Date.now()
    },
    { merge: true }
  );
}

export function watchWallet(uid: string, onData: (wallet: Wallet) => void): () => void {
  return onSnapshot(walletRef(uid), (snapshot) => {
    const data = snapshot.data();
    if (!data) {
      return;
    }

    onData({
      uid: data.uid ?? uid,
      coins: data.coins ?? 0,
      tokens: data.tokens ?? 0
    });
  });
}

export async function grantWinCoins(uid: string, amount = 10): Promise<void> {
  await updateDoc(walletRef(uid), { coins: increment(amount) });
}

export async function spendToken(uid: string, amount = 1): Promise<void> {
  await updateDoc(walletRef(uid), { tokens: increment(-Math.abs(amount)) });
}
