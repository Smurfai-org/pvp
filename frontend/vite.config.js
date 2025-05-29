import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // default; just make sure this is known on backend
  },
  base: '/', // important if deploying under root domain
});
