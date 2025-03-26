// @ts-check
import { defineConfig } from 'astro/config';
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
    vite: {
        plugins: [visualizer({
            emitFile: true,
            filename: "stats.html",
        })]
    }
});