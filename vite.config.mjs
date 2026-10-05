import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  build: {
    outDir: "dist/client",
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replaceAll("\\", "/");
          if (normalizedId.includes("/src/data/curriculum.ts")) return "curriculum";
          if (
            normalizedId.includes("/node_modules/react") ||
            normalizedId.includes("/node_modules/scheduler")
          ) {
            return "react-vendor";
          }
          if (
            normalizedId.includes("/node_modules/@radix-ui") ||
            normalizedId.includes("/node_modules/lucide-react")
          ) {
            return "ui-vendor";
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.tsx"],
    },
  },
  plugins: [react(), tailwindcss()],
});
