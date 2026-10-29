import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';
const root = new URL('../../out/', import.meta.url);
const origin = 'https://damaolucky.github.io';

test('exports the GitHub homepage with matching metadata and static resources', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  assert.match(html, /rel="canonical" href="https:\/\/damaolucky.github.io\/?"/);
  assert.match(html, /property="og:url" content="https:\/\/damaolucky.github.io\/?"/);
  assert.doesNotMatch(html, /mint-storyboard-home|id="news"|Recent notes/);
  assert.match(html, /I enjoy building something beautiful/);
  assert.match(html, /Changshu, Suzhou/);
  assert.match(html, /Last updated: October 28, 2026/);
  assert.match(html, /Show Izumi desktop pet/);
  assert.match(html, /map-options\/layered-map.svg/);
  const resources = new Set([...html.matchAll(/<(?:script|link|img)\b[^>]*?\b(?:src|href)="(\/[^"#]*)"/g)].map(m => m[1]));
  for (const resource of resources) {
    const path = new URL(resource, origin).pathname;
    assert.ok((await stat(new URL(`.${path}`, root))).size > 0, resource);
  }
  for (const id of ['top', 'work', 'misc']) assert.ok(html.includes(`id="${id}"`));
  assert.ok((await readFile(new URL('robots.txt', root), 'utf8')).includes(`${origin}/sitemap.xml`));
  assert.ok((await readFile(new URL('sitemap.xml', root), 'utf8')).includes(`<loc>${origin}/</loc>`));
  await stat(new URL('.nojekyll', root));
});

test('exports comparison, 404, and a usable legacy redirect', async () => {
  for (const file of ['mono/index.html', '404.html']) assert.ok((await stat(new URL(file, root))).size > 0);
  const legacy = await readFile(new URL('v1/index.html', root), 'utf8');
  assert.match(legacy, /http-equiv="refresh" content="0;url=\/"/i);
});
