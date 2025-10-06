// Tailwind v4 PostCSS setup
import tailwind from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default {
  plugins: [tailwind(), autoprefixer()],
}
