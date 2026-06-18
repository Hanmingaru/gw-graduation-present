import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` must match the GitHub repo name so assets resolve under
// https://<user>.github.io/gw-graduation-present/
export default defineConfig({
  plugins: [react()],
  base: '/gw-graduation-present/',
})
