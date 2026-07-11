import { Link, useRouteError } from "react-router-dom";

export function AppErrorScreen({ notFound = false }: { notFound?: boolean }) {
  const routeError = useRouteError();
  const message = notFound
    ? "That page is not part of this collection."
    : routeError instanceof Error ? routeError.message : "Stillroom could not open this view.";
  return (
    <section className="release-message" role="alert">
      <p className="eyebrow">{notFound ? "Not found" : "Something went quiet"}</p>
      <h1>{notFound ? "Nothing here" : "Let’s try that again"}</h1>
      <p>{message}</p>
      <div className="release-message-actions">
        {!notFound && <button type="button" className="button" onClick={() => window.location.reload()}>Try again</button>}
        <Link className="button button-secondary" to="/">Return home</Link>
      </div>
    </section>
  );
}
