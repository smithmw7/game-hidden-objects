import { NavLink, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="header">
        <h1>Hidden Objects</h1>
      </header>
      <main className="content">
        <Outlet />
      </main>
      <nav className="nav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/create">Create</NavLink>
        <NavLink to="/enter-code">Enter Code</NavLink>
        <NavLink to="/wallet">Wallet</NavLink>
        <NavLink to="/test/image-gen">AI image</NavLink>
      </nav>
    </div>
  );
}
