import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { landingSlugs } from './src/config/landing-slugs.ts'

// `npm run build:single` (mode "single") bundles the whole site, images included, into one
// self-contained HTML file for a shareable preview. Settings for that mode live in .env.single.
/** Writes sitemap.xml and robots.txt, and makes the social preview image URL absolute, when VITE_SITE_URL (the live domain) is set. */
function sitemap(siteUrl?: string): Plugin {
  return {
    name: 'motion-sitemap',
    generateBundle() {
      if (!siteUrl) return
      const base = siteUrl.replace(/\/$/, '')
      const paths = ['/', '/fleet', ...landingSlugs.map((s) => `/${s}`), '/reservations', '/privacy', '/terms']
      const urls = paths.map((p) => `  <url><loc>${base}${p}</loc></url>`).join('\n')
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nDisallow: /staff\nDisallow: /book\nSitemap: ${base}/sitemap.xml\n` })
    },
    // Link previews (iMessage, Facebook, X) need the full https:// address of the image.
    transformIndexHtml(html) {
      if (!siteUrl) return html
      return html.replace(/content="\/og-image\.jpg"/g, `content="${siteUrl.replace(/\/$/, '')}/og-image.jpg"`)
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), sitemap(loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL), ...(mode === 'single' ? [viteSingleFile()] : [])],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: mode === 'single' ? { outDir: 'dist-single' } : undefined,
}))
