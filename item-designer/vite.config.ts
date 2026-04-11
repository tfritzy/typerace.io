import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

const iconsSourceDir = path.resolve(__dirname, '../frontend/public/futuristic_pixel_icons')
const iconsDestDir = path.resolve(__dirname, 'public/icons')

function copyIcons() {
  if (!fs.existsSync(iconsSourceDir)) return
  if (!fs.existsSync(iconsDestDir)) {
    fs.mkdirSync(iconsDestDir, { recursive: true })
  }
  for (const file of fs.readdirSync(iconsSourceDir)) {
    if (file.endsWith('.png')) {
      fs.copyFileSync(path.join(iconsSourceDir, file), path.join(iconsDestDir, file))
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-icons',
      configureServer(server) {
        server.middlewares.use('/icons', (req, res, next) => {
          if (!req.url) return next()
          const fileName = decodeURIComponent(req.url.replace(/^\//, ''))
          if (!fileName.endsWith('.png') || fileName.includes('..')) return next()
          const filePath = path.resolve(iconsSourceDir, fileName)
          if (!filePath.startsWith(iconsSourceDir)) return next()
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'image/png')
            res.setHeader('Cache-Control', 'max-age=31536000, immutable')
            fs.createReadStream(filePath).pipe(res)
          } else {
            next()
          }
        })
      },
      buildStart() {
        copyIcons()
      },
    },
  ],
})
