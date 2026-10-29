import { spawnSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

const build = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', 'build', '--webpack'], {
  stdio: 'inherit',
  env: { ...process.env, GITHUB_PAGES: '1', NEXT_TELEMETRY_DISABLED: '1' },
});
if (build.status !== 0) process.exit(build.status ?? 1);
const origin = 'https://damaolucky.github.io';
// GitHub Pages has no server redirect handler; keep the legacy URL useful
// even when JavaScript is disabled.
await writeFile('out/v1/index.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0;url=/"><link rel="canonical" href="${origin}/"><title>Hua Zhou</title></head><body><a href="/">Continue to Hua Zhou’s homepage</a></body></html>`);
await writeFile('out/.nojekyll', '');
await writeFile('out/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile('out/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>\n`);
console.log('GitHub Pages export ready in out/');
