import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { normalizeGameCode } from "../../services/share/gameCode";

const RECENT_CODES_KEY = "hidden-objects-recent-codes";

function readRecentCodes(): string[] {
  const raw = localStorage.getItem(RECENT_CODES_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistRecentCode(code: string): void {
  const previous = readRecentCodes();
  const next = [code, ...previous.filter((item) => item !== code)].slice(0, 6);
  localStorage.setItem(RECENT_CODES_KEY, JSON.stringify(next));
}

export function EnterCodeScreen() {
  const [code, setCode] = useState("");
  const [recentCodes, setRecentCodes] = useState<string[]>(() => readRecentCodes());
  const navigate = useNavigate();

  function launchPlay(rawCode: string) {
    const cleaned = normalizeGameCode(rawCode);
    if (!cleaned) {
      return;
    }
    persistRecentCode(cleaned);
    setRecentCodes(readRecentCodes());
    navigate(`/play/${cleaned}`);
  }

  return (
    <section className="panel">
      <h2>Enter Game Code</h2>
      <div className="form">
        <input
          value={code}
          placeholder="DOG-4821"
          onChange={(event) => setCode(event.target.value.toUpperCase())}
        />
        <div className="row">
          <button className="button" onClick={() => launchPlay(code)} type="button">
            Play
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={async () => {
              const text = await navigator.clipboard.readText();
              setCode(normalizeGameCode(text));
            }}
          >
            Paste
          </button>
        </div>
      </div>
      {recentCodes.length > 0 && (
        <div>
          <h3>Recent Codes</h3>
          <div className="chip-group">
            {recentCodes.map((item) => (
              <button type="button" className="chip" key={item} onClick={() => launchPlay(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
