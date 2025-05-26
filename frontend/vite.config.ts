import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    tsconfigPaths(),
    {
      name: "custom-middleware",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (
            req.method === "GET" &&
            !req.url?.startsWith("/api") &&
            !req.url?.includes(".")
          ) {
            req.url = "/index.html";
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          "react-router": ["react-router-dom"],
          "react-query": ["@tanstack/react-query"],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Adjust the warning limit if needed
  },
  server: {
    middlewareMode: true, // Enable middleware mode for custom SPA fallback
  },
});
