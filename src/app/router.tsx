import { createHashRouter, type RouteObject } from "react-router-dom";
import { AppShell } from "./shell/AppShell";
import { AppErrorScreen } from "./screens/AppErrorScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { SharedResultScreen } from "./screens/SharedResultScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { LevelSelectScreen } from "./screens/LevelSelectScreen";
import { LevelBriefingScreen } from "./screens/LevelBriefingScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { PrivacyScreen } from "./screens/PrivacyScreen";
import { SupportScreen } from "./screens/SupportScreen";

// Creator, AI, wallet, and authoring tools are development-only. Keeping their
// imports inside this branch prevents them and their services entering releases.
const developmentRoutes: RouteObject[] = import.meta.env.DEV ? [
  { path: "dev/levels/:levelId/author", lazy: async () => ({ Component: (await import("./screens/LevelAuthorScreen")).LevelAuthorScreen }) },
  { path: "create", lazy: async () => ({ Component: (await import("./screens/CreateScreen")).CreateScreen }) },
  { path: "enter-code", lazy: async () => ({ Component: (await import("./screens/EnterCodeScreen")).EnterCodeScreen }) },
  { path: "play/:code", lazy: async () => ({ Component: (await import("./screens/PlayScreen")).PlayScreen }) },
  { path: "code/:code", lazy: async () => ({ Component: (await import("./screens/PlayScreen")).PlayScreen }) },
  { path: "wallet", lazy: async () => ({ Component: (await import("./screens/WalletScreen")).WalletScreen }) },
  { path: "store", lazy: async () => ({ Component: (await import("./screens/StoreScreen")).StoreScreen }) },
  { path: "test/image-gen", lazy: async () => ({ Component: (await import("./screens/ImageGenTestScreen")).ImageGenTestScreen }) }
] : [];

// Hash routing keeps deep links functional on static hosts such as GitHub Pages.
export const router = createHashRouter([
  {
    path: "/",
    element: <AppShell />,
    errorElement: <AppErrorScreen />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: "welcome", element: <WelcomeScreen /> },
      { path: "levels", element: <LevelSelectScreen /> },
      { path: "levels/:levelId", element: <LevelBriefingScreen /> },
      { path: "levels/:levelId/play", lazy: async () => ({ Component: (await import("./screens/StaticPlayScreen")).StaticPlayScreen }) },
      { path: "settings", element: <SettingsScreen /> },
      { path: "privacy", element: <PrivacyScreen /> },
      { path: "support", element: <SupportScreen /> },
      { path: "result", element: <SharedResultScreen /> },
      ...developmentRoutes,
      { path: "*", element: <AppErrorScreen notFound /> }
    ]
  }
]);
