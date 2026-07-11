import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { DEFAULT_OPENAI_IMAGE_MODEL, openAiImageGenDevPlugin } from "./vite/openai-image-dev";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const openAiKey = env.OPENAI_API_KEY;
  const imageModel = env.OPENAI_IMAGE_MODEL?.trim() || DEFAULT_OPENAI_IMAGE_MODEL;

  return {
    base: "./",
    plugins: [react(), openAiImageGenDevPlugin(openAiKey, imageModel)],
    server: {
      host: true,
      port: 5173
    }
  };
});
