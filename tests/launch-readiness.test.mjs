import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";
import sharp from "sharp";
import ts from "typescript";
import worker from "../dist/server/index.js";

const origin = "https://mint-storyboard-home.damaoluckyy.chatgpt.site";
const assetRoot = new URL("../dist/client/", import.meta.url);
const context = { waitUntil() {}, passThroughOnException() {} };
const env = {
  ASSETS: {
    async fetch(request) {
      const pathname = new URL(request.url).pathname;
      const file = new URL(`.${pathname}`, assetRoot);
      if (!file.href.startsWith(assetRoot.href)) return new Response(null, { status: 404 });
      try {
        return new Response(await readFile(file));
      } catch {
        return new Response(null, { status: 404 });
      }
    },
  },
};
const render = (path = "/", headers = {}) => worker.fetch(new Request(`${origin}${path}`, {
  headers: { accept: "text/html", ...headers },
}), env, context);

test("ships accurate metadata, scalable mobile viewport, and canonical URLs independent of request headers", async () => {
  const html = await (await render("/", { "x-forwarded-host": "untrusted.invalid" })).text();
  assert.equal((html.match(/name="viewport"/g) ?? []).length, 1);
  assert.match(html, /name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/);
  assert.doesNotMatch(html, /maximum-scale|user-scalable=no/);
  assert.match(html, /<title>Hua Zhou · Research Portfolio<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/mint-storyboard-home.damaoluckyy.chatgpt.site\/?"/);
  assert.match(html, /property="og:url" content="https:\/\/mint-storyboard-home.damaoluckyy.chatgpt.site\/?"/);
  assert.match(html, /rel="icon" href="\/icon.svg"/);
  assert.doesNotMatch(html, /untrusted.invalid/);
  const robots = await readFile(new URL("robots.txt", assetRoot), "utf8");
  const sitemap = await readFile(new URL("sitemap.xml", assetRoot), "utf8");
  assert.ok(robots.includes(`${origin}/sitemap.xml`));
  assert.ok(sitemap.includes(`<loc>${origin}/</loc>`));
});

test("protects response headers without dropping RSC cache variation or redirect status", async () => {
  for (const [path, status] of [["/", 200], ["/does-not-exist", 404], ["/v1", 307]]) {
    const response = await render(path);
    assert.equal(response.status, status);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
    assert.equal(response.headers.get("permissions-policy"), "camera=(), microphone=(), geolocation=()");
    if (path === "/") assert.match(response.headers.get("vary"), /RSC/);
    if (path === "/v1") assert.equal(new URL(response.headers.get("location"), origin).pathname, "/");
    await response.text();
  }
});

test("resolves every local initial-load resource and keyboard navigation target", async () => {
  const html = await (await render()).text();
  const urls = new Set([...html.matchAll(/(?:src|href)="(\/[^"#]*)"/g)].map((match) => match[1]));
  for (const match of html.matchAll(/srcSet="([^"]+)"/gi)) {
    for (const candidate of match[1].split(",")) urls.add(candidate.trim().split(/\s+/)[0]);
  }
  for (const url of urls) {
    const path = new URL(url, origin).pathname;
    const asset = new URL(`.${path}`, assetRoot);
    assert.ok(asset.href.startsWith(assetRoot.href));
    assert.ok((await stat(asset)).size > 0, `${url} exists in the deployment`);
  }
  for (const id of ["top", "news", "work", "misc"]) {
    assert.match(html, new RegExp(`id="${id}"[^>]*tabindex="-1"`, "i"));
  }
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.match(html, /<time dateTime="2026-01"/i);
  assert.doesNotMatch(html, /(?:src|href)="[^"]*izumi/);
  assert.doesNotMatch(html, /(?:src|href)="[^"]*hua-profile[^" ]*\.png/);
});

test("production server returns real asset bytes and MIME types, including HEAD requests", async (t) => {
  const reservation = createServer();
  await new Promise((resolve) => reservation.listen(0, "127.0.0.1", resolve));
  const port = reservation.address().port;
  await new Promise((resolve) => reservation.close(resolve));
  const server = spawn(process.execPath, ["node_modules/vinext/dist/cli.js", "start", "--port", String(port)], {
    cwd: new URL("..", import.meta.url),
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(() => { server.kill("SIGTERM"); });
  await new Promise((resolve, reject) => {
    let output = "";
    const timer = setTimeout(() => reject(new Error(`Production server did not start: ${output}`)), 15_000);
    const consume = (data) => {
      output += data;
      if (output.includes("Production server running")) {
        clearTimeout(timer);
        resolve();
      }
    };
    server.stdout.on("data", consume);
    server.stderr.on("data", consume);
    server.once("error", (error) => { clearTimeout(timer); reject(error); });
    server.once("exit", (code) => { clearTimeout(timer); reject(new Error(`Production server exited: ${code}; ${output}`)); });
  });
  const base = `http://localhost:${port}`;
  const html = await (await fetch(base)).text();
  const resources = new Set([...html.matchAll(/(?:src|href)="(\/[^"#]*)"/g)].map((match) => match[1]));
  for (const path of ["/robots.txt", "/sitemap.xml", "/media/hua-profile-anime-clean-256.webp", "/media/izumi-idle-sprite.webp"]) resources.add(path);
  for (const path of resources) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 200, path);
    const body = Buffer.from(await response.arrayBuffer());
    const expected = await readFile(new URL(`.${new URL(path, origin).pathname}`, assetRoot));
    assert.ok(body.length > 0, `${path} must not return an empty success response`);
    assert.ok(body.equals(expected), `${path} serves the exact built asset`);
    if (path.endsWith(".webp")) assert.match(response.headers.get("content-type"), /image\/webp/);
    if (path.endsWith(".svg")) assert.match(response.headers.get("content-type"), /image\/svg\+xml/);
    if (path.includes("/_next/static/")) assert.match(response.headers.get("cache-control"), /immutable/);
  }
  const head = await fetch(`${base}/media/hua-profile-anime-clean-256.webp`, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.match(head.headers.get("content-type"), /image\/webp/);
  assert.equal((await head.arrayBuffer()).byteLength, 0);
});

test("bounds responsive portrait payload and preserves the pet artwork pixels", async () => {
  let mobileBytes = 0;
  for (const name of ["hua-profile", "hua-profile-anime-clean"]) {
    for (const width of [256, 512, 768]) {
      const file = new URL(`../public/media/${name}-${width}.webp`, import.meta.url);
      const metadata = await sharp(file.pathname).metadata();
      assert.equal(metadata.width, width);
      assert.equal(metadata.format, "webp");
      if (width === 256) mobileBytes += (await stat(file)).size;
    }
  }
  mobileBytes += (await stat(new URL("../public/media/school-icons/sdu-96.webp", import.meta.url))).size;
  assert.ok(mobileBytes < 40_000, `mobile portraits and raster school mark: ${mobileBytes} bytes`);

  const normalizeTransparentPixels = (data) => {
    for (let index = 0; index < data.length; index += 4) {
      if (data[index + 3] === 0) data.fill(0, index, index + 3);
    }
    return data;
  };
  for (const name of ["izumi-idle-sprite", "izumi-drag-sprite-v2", "izumi-turn-sprite", "izumi-reaction-sprite", "izumi-appearance-sprite"]) {
    const png = new URL(`../public/media/${name}.png`, import.meta.url);
    const webp = new URL(`../public/media/${name}.webp`, import.meta.url);
    const original = await sharp(png.pathname).ensureAlpha().raw().toBuffer();
    const optimized = await sharp(webp.pathname).ensureAlpha().raw().toBuffer();
    assert.ok(normalizeTransparentPixels(original).equals(normalizeTransparentPixels(optimized)), `${name} keeps all visible pixels`);
    assert.ok((await stat(webp)).size < (await stat(png)).size, `${name} is smaller`);
  }
});

test("motion follows system settings, explicit choices, storage changes, and listener cleanup", async () => {
  const source = await readFile(new URL("../app/components/motion-preference.ts", import.meta.url), "utf8");
  const media = Object.assign(new EventTarget(), { matches: true });
  const root = { dataset: {} };
  const window = Object.assign(new EventTarget(), {
    matchMedia: () => media,
    localStorage: { setItem() { throw new Error("Storage blocked"); } },
  });
  const exports = {};
  let snapshot;
  let unsubscribe;
  let updates = 0;
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports, window, document: { documentElement: root }, Event,
    require() {
      return {
        useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
          assert.equal(getServerSnapshot(), false);
          snapshot = getSnapshot;
          unsubscribe = subscribe(() => { updates += 1; });
          return getSnapshot();
        },
      };
    },
  });
  assert.equal(exports.useMotionEnabled(), false);
  media.matches = false;
  media.dispatchEvent(new Event("change"));
  assert.equal(snapshot(), true, "system changes take effect without a saved preference");
  exports.setMotionPreference(false);
  media.dispatchEvent(new Event("change"));
  assert.equal(snapshot(), false, "explicit Still persists even without storage");
  exports.setMotionPreference(true);
  assert.equal(snapshot(), true);
  media.matches = true;
  media.dispatchEvent(new Event("change"));
  assert.equal(snapshot(), false, "OS reduced motion always wins");
  media.matches = false;
  media.dispatchEvent(new Event("change"));
  assert.equal(snapshot(), true);
  window.dispatchEvent(Object.assign(new Event("storage"), { key: "homepage-motion", newValue: "off" }));
  assert.equal(snapshot(), false);
  window.dispatchEvent(Object.assign(new Event("storage"), { key: null, newValue: null }));
  assert.equal(snapshot(), true, "clear storage restores the system default");
  const previousUpdates = updates;
  unsubscribe();
  window.dispatchEvent(new Event("homepage-motion-change"));
  media.dispatchEvent(new Event("change"));
  assert.equal(updates, previousUpdates);
});
