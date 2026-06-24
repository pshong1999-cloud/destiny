import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages 需要设置 base 为仓库名
  // 如果仓库名是 destiny，则 base 为 '/destiny/'
  // 如果用自定义域名，则 base 为 '/'
  base: process.env.GITHUB_PAGES ? '/destiny/' : '/',
  server: {
    port: 5173,
    open: true
  },
  plugins: [
    tailwindcss()
  ]
})
