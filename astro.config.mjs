// @ts-check
import { defineConfig } from 'astro/config';
import { visualizer } from "rollup-plugin-visualizer";

import tailwindcss from "@tailwindcss/vite";

import svelte from "@astrojs/svelte";

export default defineConfig({
  vite: {
      plugins: [visualizer({
          emitFile: true,
          filename: "stats.html",
      }), tailwindcss()]
  },

  integrations: [svelte()]
});