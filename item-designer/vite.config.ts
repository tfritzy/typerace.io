import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

function copyIcons() {
  const src = path.resolve(__dirname, '../frontend/public/futuristic_pixel_icons')
  const dest = path.resolve(__dirname, 'public/icons')
  if (!fs.existsSync(src)) return
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }
  for (const file of fs.readdirSync(src)) {
    if (file.endsWith('.png')) {
      fs.copyFileSync(path.join(src, file), path.join(dest, file))
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-icons-on-build',
      buildStart() {
        copyIcons()
      },
      configureServer() {
        copyIcons()
      },
    },
  ],
})
