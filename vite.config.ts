import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig(({ command }) => ({
  root:
    command === "serve"
      ? process.cwd()
      : resolve(import.meta.dirname, "src/pages"),

  // Relative paths for file-system builds, root paths for dev server.
  base: command === "serve" ? "/" : "./",

  plugins: [tailwindcss()],

  build: {
    outDir: command === "serve" ? "dist" : resolve(import.meta.dirname, "dist"),
    rolldownOptions: {
      input: {
        index: resolve(import.meta.dirname, "src/pages/index.html"),
        sessions: resolve(import.meta.dirname, "src/pages/sessions.html"),
        tasks: resolve(import.meta.dirname, "src/pages/tasks.html"),
        logs: resolve(import.meta.dirname, "src/pages/logs.html"),
        decisions: resolve(import.meta.dirname, "src/pages/decisions.html"),
      },
    },
  },
}));
