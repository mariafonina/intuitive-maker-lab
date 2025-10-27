import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    cssTarget: ['chrome87', 'safari14', 'firefox78', 'edge88'],
    modulePreload: {
      polyfill: true,
    },
    cssMinify: 'lightningcss',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
}));
