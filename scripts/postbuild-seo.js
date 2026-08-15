// Post-build SEO/AEO step: copies static SEO assets into the deploy dir
// (web-rnw/dist) after `web:rnw:build` so GitHub Pages serves them at root.
const fs = require('fs');
const path = require('path');

const dist = path.resolve(__dirname, '..', 'web-rnw', 'dist');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yasinkaya701.github.io/BUEPT-APP/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

const robots = `User-agent: *
Allow: /

# Primary surfaces for AI assistants and crawlers
Sitemap: https://yasinkaya701.github.io/BUEPT-APP/sitemap.xml
`;

// Social card used by og:image / twitter:image (referenced with a fixed name).
const cover = path.resolve(__dirname, '..', 'assets', 'og-cover.png');

fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(dist, 'robots.txt'), robots);
if (fs.existsSync(cover)) {
  fs.mkdirSync(path.join(dist, 'assets'), { recursive: true });
  fs.copyFileSync(cover, path.join(dist, 'assets', 'og-cover.png'));
}
console.log('postbuild-seo: sitemap.xml, robots.txt, assets/og-cover.png written to', dist);
