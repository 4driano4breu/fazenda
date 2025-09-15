import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import path from 'node:path'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')       // lê VITE_BASE_PATH
  return defineConfig({
    plugins: [react(), tailwind()],
    base: env.VITE_BASE_PATH || '/',                 // << /fazenda/ em produção
    resolve: {
      alias: { '@': path.resolve(process.cwd(), 'src') }
    },
    build: { outDir: 'dist', sourcemap: true }
  })
}
