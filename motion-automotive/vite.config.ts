import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build:single` (mode "single") bundles the whole site, images included, into one
// self-contained HTML file for a shareable preview. Settings for that mode live in .env.single.
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: mode === 'single' ? { outDir: 'dist-single' } : undefined,
}))
