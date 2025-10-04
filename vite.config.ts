import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { env } from "process";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: env.NODE_ENV === "production" ? "/mahjong-score-manager/" : "/",
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});
