import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.hiddenobjects.game",
  appName: "Hidden Objects",
  webDir: "dist",
  server: {
    androidScheme: "https",
    cleartext: true
  }
};

export default config;
