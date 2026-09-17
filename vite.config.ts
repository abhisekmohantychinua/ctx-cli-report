import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "src/pages/index.html"),
        sessions: resolve(import.meta.dirname, "src/pages/sessions.html"),
        tasks: resolve(import.meta.dirname, "src/pages/tasks.html"),
        logs: resolve(import.meta.dirname, "src/pages/logs.html"),
        decisions: resolve(import.meta.dirname, "src/pages/decisions.html"),
      },
    },
  },
});
