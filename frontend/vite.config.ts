/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import i18nHtmlPlugin from './vite-plugin-i18n-html'

export default defineConfig({
  plugins: [react(), tailwindcss(), i18nHtmlPlugin()],
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      '@': path.resolve(__dirname, './src'),
      '@pixi/constants': path.resolve(__dirname, './src/pixi-compat/constants.ts'),
      '@pixi/core': path.resolve(__dirname, './src/pixi-compat/core.ts'),
      '@pixi/display': path.resolve(__dirname, './src/pixi-compat/display.ts'),
      '@pixi/math': path.resolve(__dirname, './src/pixi-compat/math.ts'),
      '@pixi/sprite': path.resolve(__dirname, './src/pixi-compat/sprite.ts'),
      '@pixi/ticker': path.resolve(__dirname, './src/pixi-compat/ticker.ts'),
    },
  },
  test: {
    alias: {
      '../../module_bindings': path.resolve(__dirname, './src/__mocks__/module_bindings.ts'),
    },
  },
})
