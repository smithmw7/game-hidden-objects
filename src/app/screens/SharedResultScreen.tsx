import { useLocation, Link } from "react-router-dom";

export function SharedResultScreen() {
  const location = useLocation();
  const elapsedMs = location.state?.elapsedMs as number | undefined;
  const code = location.state?.code as string | undefined;
  const elapsedSec = elapsedMs ? Math.floor(elapsedMs / 1000) : null;
  const score = location.state?.score as number | undefined;
  const stars = location.state?.stars as number | undefined;
  const levelId = location.state?.levelId as string | undefined;

  return (
    <section className="panel">
      <h2>Result</h2>
      <p>You completed the level.</p>
      {elapsedSec !== null && <p>Time: {elapsedSec}s</p>}
      {score !== undefined && <p>Score: {score}</p>}
      {stars !== undefined && <p aria-label={`${stars} stars`}>{"★".repeat(stars)}{"☆".repeat(3 - stars)}</p>}
      {code && (
        <p>
          Share this code: <strong>{code}</strong>
        </p>
      )}
      <div className="row">
        {levelId && <Link className="button" to={`/levels/${levelId}/play`}>Replay</Link>}
        {code && (
          <button
            type="button"
            className="button"
            onClick={async () => {
              const payload = {
                title: "Try my Hidden Objects level",
                text: `Try my Hidden Objects level: ${code}`,
                url: `${window.location.origin}/play/${code}`
              };
              if (typeof navigator.share === "function") {
                await navigator.share(payload);
              } else {
                await navigator.clipboard.writeText(`${payload.text} ${payload.url}`);
              }
            }}
          >
            Native Share
          </button>
        )}
        <Link className="button button-secondary" to="/">
          Back Home
        </Link>
      </div>
    </section>
  );
}
