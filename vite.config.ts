import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import configToAlias from "@astropub/config-to-alias/vite";
import Unfonts from "unplugin-fonts/vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    configToAlias(),
    react(),
    Unfonts({ fontsource: { families: ["Inter"] } }),
    visualizer(),
  ],
  envPrefix: ["VITE_", "CF_"],
  server: {
    watch: {
      // Don't do a full reload on changes to functions.
      ignored: ["functions/**", "migrations/**", "scripts/**"],
    },
  },
});
