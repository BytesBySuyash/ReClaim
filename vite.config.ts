import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

// Vite config — https://vitejs.dev/config/
export default defineConfig({
  base: process.env.APP_BASE_PATH ?? (process.env.GITHUB_ACTIONS ? "/ReClaim/" : "/"),
  build: {
    sourcemap: false,
    minify: true,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "5173"),
    strictPort: false,
    proxy: {
      "/api": {
        target: process.env.RECLAIM_API_TARGET || "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "5173"),
  },
})

