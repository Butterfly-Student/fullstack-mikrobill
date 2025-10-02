import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from 'vite-tsconfig-paths';
import { socketPlugin } from './src/socket-server';


// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart({ customViteReactPlugin: true }),
    socketPlugin(),
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ["buffer"],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})