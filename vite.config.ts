import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves from /comfy-cloud-onboarding-prototype/ in production,
// but use '/' in dev so localhost works without the subpath.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/comfy-cloud-onboarding-prototype/' : '/',
  plugins: [react()],
  // Pin the dev server to a fixed port so the URL is the same every run.
  // strictPort: fail loudly if 5173 is already taken instead of silently
  // hopping to 5174 — that way the link in the deck always works.
  server: { port: 5173, strictPort: true },
}))
