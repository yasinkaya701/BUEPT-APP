// Post-build SEO/AEO step: writes static SEO assets (sitemap.xml, robots.txt,
// og-cover.png) into the variant's deploy dir after the webpack build so
// GitHub Pages serves them at the variant's base path.
//
// Usage:
//   node scripts/postbuild-seo.js           → BUEPT edition (WEB_VARIANT=buept or unset)
//   WEB_VARIANT=odtu node scripts/postbuild-seo.js  → ODTÜ edition
const fs = require('fs');
const path = require('path');

const variant = process.env.WEB_VARIANT || 'buept';
const isOdtu = variant === 'odtu';

// Deploy dir matches webpack's variant output (web-rnw/dist for buept,
// web-rnw/dist-odtu for odtu).
const dist = path.resolve(__dirname, '..', 'web-rnw', isOdtu ? 'dist-odtu' : 'dist');

// Base path the variant is served under on GitHub Pages.
const basePath = isOdtu ? '/BUEPT-ODTU/' : '/BUEPT-APP/';

// Both editions live under the same GitHub Pages root URL; only the base
// path differs (/BUEPT-APP/ vs /BUEPT-ODTU/).
const baseUrl = isOdtu
  ? 'https://yasinkaya701.github.io/BUEPT-ODTU/'
  : 'https://yasinkaya701.github.io/BUEPT-APP/';

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

const robots = `User-agent: *
Allow: /

# Primary surfaces for AI assistants and crawlers
Sitemap: ${baseUrl}sitemap.xml
`;

// Social card used by og:image / twitter:image (referenced with a fixed name).
const cover = path.resolve(__dirname, '..', 'assets', 'og-cover.png');

// Variant-specific index.html meta overrides: for the ODTÜ edition, rewrite
// the remaining BUSEPT-specific Open Graph / canonical / twitter tags so the
// static HTML shell matches the edition that is being deployed.
const indexPath = path.join(dist, 'index.html');
let html = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';
if (html) {
  // Script src may be written as an absolute path (/app.<hash>.js) without the
  // variant's base path — rewrite it so the bundle resolves under the right
  // subfolder after staging. (BUSEPT dist is deployed at repo root of
  // /BUEPT-APP/, so this only matters for the ODTÜ variant.)
  html = html.replace(/src="(\/app\.[a-f0-9]+\.js)"/g, (m, p1) => {
    const target = basePath.replace(/\/$/, '') + p1;
    return `src="${target}"`;
  });
}
if (isOdtu && html) {
  // Minified builds collapse whitespace, so replace BUSEPT-APP URLs wholesale
  // (works for canonical, og:url, og:image, twitter:image and any stray refs).
  html = html.split('BUEPT-APP').join('BUEPT-ODTU');
  html = html.split('BUSEPT Exam Prep').join('ODTÜ-EPE Prep');
  // Minified HTML may reorder attributes, so replace meta CONTENTS with
  // attribute-order-agnostic regexes.
  const contentReplacements = [
    // og:title
    [/og:title" content="[^"]*"/g, 'og:title" content="ODTÜ-EPE Prep | ODTÜ İYS English Proficiency Practice"'],
    // og:description
    [/og:description" content="[^"]*"/g, 'og:description" content="Official-format ODTÜ İYS mock exams with listening, reading, note-taking, writing and speaking, AI scoring, and adaptive study plans — built for METU prep students."'],
    // og:image:alt
    [/og:image:alt" content="[^"]*"/g, 'og:image:alt" content="ODTÜ-EPE Prep dashboard — ODTÜ İYS English Proficiency practice app"'],
    // twitter:title
    [/twitter:title" content="[^"]*"/g, 'twitter:title" content="ODTÜ-EPE Prep | ODTÜ İYS English Proficiency Practice"'],
    // twitter:description
    [/twitter:description" content="[^"]*"/g, 'twitter:description" content="Official-format ODTÜ İYS mock exams with AI scoring and adaptive study plans for METU prep students."'],
    // twitter:image:alt
    [/twitter:image:alt" content="[^"]*"/g, 'twitter:image:alt" content="ODTÜ-EPE Prep dashboard"'],
    // og:site_name
    [/og:site_name" content="[^"]*"/g, 'og:site_name" content="ODTÜ-EPE Prep"'],
  ];
  for (const [pattern, replacement] of contentReplacements) {
    if (!pattern.test(html)) {
      console.warn(`postbuild-seo (odtu): meta pattern not found: ${pattern}`);
    }
    html = html.replace(pattern, replacement);
  }
  fs.writeFileSync(indexPath, html);
  console.log('postbuild-seo (odtu): index.html OG/twitter/canonical meta rewritten');
} else if (html) {
  fs.writeFileSync(indexPath, html);
}

fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(dist, 'robots.txt'), robots);
if (fs.existsSync(cover)) {
  fs.mkdirSync(path.join(dist, 'assets'), { recursive: true });
  fs.copyFileSync(cover, path.join(dist, 'assets', 'og-cover.png'));
}
console.log(`postbuild-seo (${variant}): sitemap.xml, robots.txt, assets/og-cover.png written to ${dist}`);
