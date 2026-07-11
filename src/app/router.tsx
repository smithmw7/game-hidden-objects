import { createHashRouter } from "react-router-dom";
import { AppShell } from "./shell/AppShell";
import { CreateScreen } from "./screens/CreateScreen";
import { EnterCodeScreen } from "./screens/EnterCodeScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { PlayScreen } from "./screens/PlayScreen";
import { SharedResultScreen } from "./screens/SharedResultScreen";
import { StoreScreen } from "./screens/StoreScreen";
import { WalletScreen } from "./screens/WalletScreen";
import { ImageGenTestScreen } from "./screens/ImageGenTestScreen";
import { StaticPlayScreen } from "./screens/StaticPlayScreen";
import { LevelAuthorScreen } from "./screens/LevelAuthorScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { LevelSelectScreen } from "./screens/LevelSelectScreen";
import { LevelBriefingScreen } from "./screens/LevelBriefingScreen";
import { SettingsScreen } from "./screens/SettingsScreen";

// Hash routing keeps deep links functional on static hosts such as GitHub Pages.
export const router = createHashRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: "welcome", element: <WelcomeScreen /> },
      { path: "levels", element: <LevelSelectScreen /> },
      { path: "levels/:levelId", element: <LevelBriefingScreen /> },
      { path: "levels/:levelId/play", element: <StaticPlayScreen /> },
      { path: "settings", element: <SettingsScreen /> },
      { path: "dev/levels/:levelId/author", element: <LevelAuthorScreen /> },
      { path: "create", element: <CreateScreen /> },
      { path: "enter-code", element: <EnterCodeScreen /> },
      { path: "play/:code", element: <PlayScreen /> },
      { path: "code/:code", element: <PlayScreen /> },
      { path: "result", element: <SharedResultScreen /> },
      { path: "wallet", element: <WalletScreen /> },
      { path: "store", element: <StoreScreen /> },
      { path: "test/image-gen", element: <ImageGenTestScreen /> }
    ]
  }
]);
