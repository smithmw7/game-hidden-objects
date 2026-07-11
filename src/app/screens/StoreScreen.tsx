import { useState } from "react";

/** RevenueCat-ready stub: replace with native IAP / web checkout later. */
export function StoreScreen() {
  const [message, setMessage] = useState("");

  return (
    <section className="panel">
      <h2>Store</h2>
      <p className="small">Token packs ship via RevenueCat in a future build.</p>
      <div className="row">
        <button
          type="button"
          className="button"
          onClick={() => setMessage("Purchase adapter stub — hook RevenueCat here.")}
        >
          Buy Tokens (stub)
        </button>
      </div>
      {message && <p className="small">{message}</p>}
    </section>
  );
}
