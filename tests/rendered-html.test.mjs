import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the final Lavender Academy homepage at the canonical root", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Hua Zhou/);
  assert.match(html, /I&#x27;m Hua/);
  assert.doesNotMatch(html, /Recent notes|id="news"/);
  assert.match(html, /Selected work/);
  assert.match(html, /Misc/);
  assert.match(html, /Historical Map/);
  assert.equal((html.match(/<article\b/g) ?? []).length, 1);
  assert.doesNotMatch(html, /Curriculum vitae|My contributions|projectStats/);
  assert.doesNotMatch(html, /Multi-view 3D Reconstruction for Ergonomic Analysis|Style Transfer Models on Pokémon Images|Evaluating VR Tutorials/);
  assert.doesNotMatch(html, /hua-profile|data-portrait-mode|Current portrait:/);
  assert.match(html, /Prof\. Hadar Averbuch-Elor/);
  assert.match(html, /Prof\. Yin Li/);
  assert.match(html, /Prof\. Icy Zhang/);
  assert.match(html, /Cornell Tech/);
  assert.match(html, /Shandong University/);
  assert.doesNotMatch(html, /data-(?:academy-page|backdrop|page-font|heart|pet|topic)=/);
  assert.doesNotMatch(html, /Damaolucky · back to top|Compare designs/);
  assert.match(html, /href="#top"[^>]*aria-current="location"[^>]*>About/);
  assert.doesNotMatch(html, /href="#news"/);
  assert.match(html, /href="#work">Work/);
  assert.doesNotMatch(html, /Open appearance choices|Look/);
  assert.match(html, /Turn motion (?:off|on)/);
  assert.match(html, /Show Izumi desktop pet/);
  assert.match(html, /Switch to dark mode/);
  assert.match(html, /Last updated: October 28, 2026/);
  assert.match(html, /I was born and raised in Changshu, Suzhou/);
  assert.match(html, /I enjoy building something beautiful/);
  assert.match(html, /media\/map-options\/layered-map.svg/);
  assert.doesNotMatch(html, /2025\.Fall|Academic Excellence Scholarship/);
  assert.doesNotMatch(html, /V1 visual variants|data-v1-variant|五套可爱版本|丝带编辑部|猫咪研究社|原画工作台|兔兔图书室/);
});

test("prevents browser translation from mutating English text before hydration", async () => {
  const [layout, profilePage] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/profile.tsx", import.meta.url), "utf8"),
  ]);
  const response = await render("/");
  const html = await response.text();

  assert.match(layout, /<html[\s\S]*?lang="en"[\s\S]*?className="notranslate"[\s\S]*?translate="no"/);
  assert.match(layout, /<meta name="google" content="notranslate" \/>/);
  assert.match(layout, /<body className="notranslate" translate="no">/);
  assert.match(profilePage, /className=\{`\$\{styles\.page\} notranslate`\}[\s\S]*?translate="no"/);
  assert.match(html, /<meta[^>]*name="google"[^>]*content="notranslate"/);
  assert.match(html, /<html[^>]*class="notranslate"[^>]*translate="no"/);
  assert.match(html, /Skip to selected work/);
  assert.doesNotMatch(html, /跳至所选作品/);
});

test("redirects the legacy /v1 URL to the canonical homepage", async () => {
  const response = await render("/v1");
  assert.ok(response.status === 307 || response.status === 308, `unexpected redirect status: ${response.status}`);
  assert.equal(new URL(response.headers.get("location") ?? "", "http://localhost").pathname, "/");
});

test("returns About to the page top and highlights the current section while scrolling", async () => {
  const [navSource, navCss, pageSource, pageCss] = await Promise.all([
    readFile(new URL("../app/components/section-nav.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/section-nav.module.css", import.meta.url), "utf8"),
    readFile(new URL("../app/profile.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/profile.module.css", import.meta.url), "utf8"),
  ]);
  const response = await render("/");
  const html = await response.text();
  const navHtml = html.match(/<nav[^>]*aria-label="Primary navigation"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";

  assert.match(pageSource, /<SectionNav className=\{styles\.primaryNav\} \/>/);
  assert.match(pageSource, /className=\{`\$\{styles\.page\} notranslate`\}[\s\S]*?id="top"/);
  assert.doesNotMatch(pageSource, /data-(?:academy-page|backdrop|page-font|heart|pet|topic)=/);
  assert.doesNotMatch(pageSource, /<main[^>]*id="top"/);
  assert.match(navHtml, /href="#top"[^>]*aria-current="location"[^>]*>About<\/a>/);
  assert.doesNotMatch(navHtml, /href="#about"/);
  assert.equal((navHtml.match(/aria-current="location"/g) ?? []).length, 1);
  assert.equal((html.match(/id="top"/g) ?? []).length, 1);
  assert.match(navSource, /useState<SectionId>\("top"\)/);
  assert.match(navSource, /requestAnimationFrame/);
  assert.match(navSource, /addEventListener\("scroll", scheduleUpdate, \{ passive: true \}\)/);
  assert.match(navSource, /removeEventListener\("scroll", scheduleUpdate\)/);
  assert.match(navSource, /cancelAnimationFrame/);
  assert.match(navSource, /scrollHeight/);
  assert.match(navSource, /window\.innerHeight/);
  assert.match(navSource, /nextSection = "misc"/);
  assert.match(navSource, /id === "top"[\s\S]*?\? 0/);
  assert.doesNotMatch(navSource, /useState\(\(\)\s*=>[\s\S]{0,200}(?:window|document)/);
  assert.match(navCss, /\[aria-current="location"\]/);
  assert.match(pageCss, /scroll-margin-top: 96px/);
  assert.match(pageCss, /scroll-margin-top: calc\(126px \+ env\(safe-area-inset-top, 0px\)\)/);
});

test("removes superseded routes and their obsolete implementation files", async () => {
  for (const pathname of ["/credits", "/v2", "/v3", "/v1/ribbon", "/v1/cat", "/v1/cel", "/v1/garden"]) {
    const response = await render(pathname);
    assert.equal(response.status, 404, pathname);
  }

  for (const file of [
    "../app/content/v1-variants.ts",
    "../app/v1/ribbon/page.tsx",
    "../app/v1/cat/page.tsx",
    "../app/v1/cel/page.tsx",
    "../app/v1/garden/page.tsx",
    "../app/v2/page.tsx",
    "../app/v3/page.tsx",
    "../app/credits/page.tsx",
    "../app/credits/credits.module.css",
    "../app/content/media.ts",
    "../app/components/motion-media.tsx",
  ]) {
    await assert.rejects(access(new URL(file, import.meta.url)));
  }
});

test("shows black icon contacts, reveals a selectable round email, and disables Scholar navigation", async () => {
  const [profileConfig, profilePage, css] = await Promise.all([
    readFile(new URL("../app/content/profile.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/profile.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/profile.module.css", import.meta.url), "utf8"),
  ]);
  const response = await render("/");
  const html = await response.text();

  assert.doesNotMatch(html, /<dt>Email<\/dt>/);
  assert.match(html, /mailto:damaoluckyy@gmail\.com/);
  assert.match(html, /damaoluckyy@gmail\.com/);
  assert.match(html, /href="https:\/\/github\.com\/Damaolucky"/);
  assert.match(html, /href="https:\/\/x\.com\/lovvvyo3"/);
  assert.match(html, /aria-label="X · @lovvvyo3"/);
  assert.doesNotMatch(html, /href="https:\/\/scholar\.google\.com/);
  assert.match(html, /Google Scholar — coming soon/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /University of Wisconsin–Madison/);
  assert.match(html, /Vision · GenAI/);
  assert.doesNotMatch(html, /Vision · GenAI · VR/);
  assert.match(html, /<details[^>]*emailContact/);
  assert.match(html, /aria-label="Show email address"/);
  assert.match(css, /\.profileIcon\s*\{[\s\S]*?color: var\(--text\)/);
  assert.match(css, /\.emailPopover\s*\{[\s\S]*?color: #201c24 !important/);
  assert.match(css, /\.emailPopover\s*\{[\s\S]*?font-family: ui-rounded/);
  assert.match(css, /\.emailPopover\s*\{[\s\S]*?font-weight: 400/);
  assert.match(css, /\.emailPopover\s*\{[\s\S]*?user-select: text/);
  assert.match(html, /title="Select to copy or click to compose"/);
  assert.doesNotMatch(html, /Experience|Reveal email address|href="https:\/\/www\.wisc\.edu/);
  assert.match(profileConfig, /email: "damaoluckyy@gmail\.com"/);
  assert.match(profileConfig, /https:\/\/github\.com\/Damaolucky/);
  assert.match(profileConfig, /id: "scholar", label: "Google Scholar", href: null/);
  assert.doesNotMatch(profileConfig, /experienceNote|https:\/\/www\.wisc\.edu/);
  assert.doesNotMatch(`${profileConfig}\n${profilePage}`, /(?:\+?1[ .-]?)?\(?608\)?[ .-]?630[ .-]?2261|hzhou397@wisc\.edu/);

  const footer = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/)?.[1] ?? "";
  assert.match(footer, /<p>Hua Zhou · 2026<\/p>/);
  assert.match(footer, /<time[^>]*2026-10-28[^>]*>Last updated: October 28, 2026<\/time>/);
  assert.doesNotMatch(footer, /<a\b|@|Lavender|薰衣草/);
});

test("defaults to bright mode, restores saved dark mode, and hydrates from a stable snapshot", async () => {
  const [controls, globals, css, layout] = await Promise.all([
    readFile(new URL("../app/components/theme-controls.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/profile.module.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  const response = await render("/");
  const html = await response.text();
  const initializationScript = layout.match(/__html:\s*`([\s\S]*?)`,/)?.[1] ?? "";

  const initializeTheme = (savedTheme, systemPrefersDark) => {
    const root = { dataset: {}, style: {} };
    const mediaQueries = [];

    runInNewContext(initializationScript, {
      document: { documentElement: root },
      localStorage: {
        getItem(key) {
          return key === "homepage-theme" ? savedTheme : null;
        },
      },
      matchMedia(query) {
        mediaQueries.push(query);
        return { matches: query === "(prefers-color-scheme: dark)" && systemPrefersDark };
      },
    });

    return { root, mediaQueries };
  };

  assert.ok(initializationScript, "theme initialization script is present");
  const firstVisit = initializeTheme(null, true);
  assert.equal(firstVisit.root.dataset.theme, "light");
  assert.equal(firstVisit.root.style.colorScheme, "light");
  assert.equal(firstVisit.mediaQueries.includes("(prefers-color-scheme: dark)"), false);

  const returningDarkVisit = initializeTheme("dark", false);
  assert.equal(returningDarkVisit.root.dataset.theme, "dark");
  assert.equal(returningDarkVisit.root.style.colorScheme, "dark");

  assert.match(controls, /useSyncExternalStore/);
  assert.match(controls, /\(\) => "light"/);
  assert.match(controls, /THEME_PREFERENCE_EVENT = "homepage-theme-change"/);
  assert.doesNotMatch(controls, /useState<Theme>/);
  assert.match(layout, /var theme='light'/);
  assert.match(layout, /savedTheme=localStorage\.getItem\('homepage-theme'\)/);
  assert.match(layout, /theme=savedTheme==='dark'\?'dark':'light'/);
  assert.doesNotMatch(layout, /prefers-color-scheme/);
  assert.match(html, /aria-label="Switch to dark mode"/);
  assert.match(html, /aria-pressed="false"/);
  assert.match(controls, /startViewTransition/);
  assert.match(controls, /prefers-reduced-motion: reduce/);
  assert.match(globals, /::view-transition-old\(root\)/);
  assert.match(globals, /::view-transition-new\(root\)/);
  assert.match(globals, /theme-fade-in/);
  assert.match(globals, /data-motion="off"/);
  assert.match(css, /\.page\s*\{[\s\S]*?transition: background-color 460ms/);
  assert.match(css, /\.topbar\s*\{[\s\S]*?transition: background-color 460ms/);
});

test("keeps pet preferences consistent across resizing, storage events, and blocked storage", async () => {
  const [source, layout] = await Promise.all([
    readFile(new URL("../app/components/pet-preference.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  const script = layout.match(/__html:\s*`([\s\S]*?)`,/)?.[1] ?? "";
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const root = { dataset: {}, style: {} };
  const media = Object.assign(new EventTarget(), { matches: true });
  const values = new Map();
  let storageBlocked = false;
  const localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem(key, value) {
      if (storageBlocked) throw new Error("Storage blocked");
      values.set(key, value);
    },
  };
  const window = Object.assign(new EventTarget(), {
    localStorage,
    matchMedia(query) {
      assert.equal(query, "(max-width: 780px), (hover: none) and (pointer: coarse)");
      return media;
    },
  });
  const exports = {};
  let unsubscribe;
  let snapshot;
  let updates = 0;
  const context = {
    exports, window, localStorage, document: { documentElement: root }, Event,
    matchMedia: (query) => query.includes("max-width") ? media : { matches: false },
    require(name) {
      assert.equal(name, "react");
      return {
        useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
          assert.equal(getServerSnapshot(), false, "stable hydration snapshot");
          snapshot = getSnapshot;
          unsubscribe = subscribe(() => { updates += 1; });
          return getSnapshot();
        },
      };
    },
  };
  runInNewContext(script, context);
  runInNewContext(compiled, context);
  assert.equal(exports.usePetVisible(), false, "mobile bootstrap and client agree");
  const resize = (mobile) => {
    media.matches = mobile;
    media.dispatchEvent(new Event("change"));
  };
  const storageEvent = (key, newValue) => {
    window.dispatchEvent(Object.assign(new Event("storage"), { key, newValue }));
  };

  resize(false);
  assert.equal(snapshot(), false, "desktop default remains off on resize");
  resize(true);
  assert.equal(snapshot(), false, "mobile default on resize");
  exports.setPetPreference(true);
  assert.equal(snapshot(), true);
  assert.equal(values.get("homepage-pet"), "on");
  resize(false);
  resize(true);
  assert.equal(snapshot(), true, "explicit opt-in survives resizing");

  storageEvent("homepage-pet", "off");
  resize(false);
  assert.equal(snapshot(), false, "another tab's opt-out survives resizing");
  storageEvent("homepage-pet", null);
  assert.equal(snapshot(), false, "removing a preference restores the off default");
  resize(true);
  assert.equal(snapshot(), false);
  storageEvent("homepage-theme", "dark");
  assert.equal(snapshot(), false, "unrelated storage changes are ignored");
  storageEvent("homepage-pet", "on");
  assert.equal(snapshot(), true);
  storageEvent(null, null);
  assert.equal(snapshot(), false, "clearing storage restores the mobile default");

  storageBlocked = true;
  exports.setPetPreference(true);
  resize(false);
  resize(true);
  assert.equal(snapshot(), true, "page preference works with blocked storage");
  exports.setPetPreference(false);
  assert.equal(snapshot(), false);
  const previousUpdates = updates;
  unsubscribe();
  resize(false);
  storageEvent("homepage-pet", "on");
  assert.equal(updates, previousUpdates, "all event listeners are cleaned up");
});

test("uses Lavender as the only page background and removes the background switch", async () => {
  const [layout, page, css] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/profile.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/profile.module.css", import.meta.url), "utf8"),
  ]);
  const response = await render("/");
  const html = await response.text();
  const displayPreferences = html.match(/<div[^>]*aria-label="Display preferences"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? "";
  const lightPage = css.match(/^\.page\s*\{([\s\S]*?)\n\}/m)?.[1] ?? "";
  const darkPage = css.match(/:global\(:root\[data-theme="dark"\]\) \.page\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";

  await assert.rejects(access(new URL("../app/components/background-toggle.tsx", import.meta.url)));
  assert.ok(displayPreferences, "display preferences are rendered");
  assert.equal((displayPreferences.match(/<button\b/g) ?? []).length, 3);
  assert.match(displayPreferences, /Turn motion (?:off|on)/);
  assert.match(displayPreferences, /Show Izumi desktop pet/);
  assert.match(displayPreferences, /Switch to dark mode/);
  assert.doesNotMatch(html, /aria-label="Use (?:white|lavender) page background"/i);
  assert.doesNotMatch(html, />White<\/span>/i);

  assert.doesNotMatch(page, /BackgroundToggle|background-toggle|backgroundPreferenceButton/);
  assert.doesNotMatch(layout, /homepage-background|savedBackground|dataset\.background/);
  assert.match(lightPage, /--bg: #faf8fd/);
  assert.equal((lightPage.match(/radial-gradient/g) ?? []).length, 3);
  assert.match(lightPage, /var\(--bg\)/);
  assert.match(darkPage, /--bg: #1c1823/);
  assert.doesNotMatch(css, /--bg:\s*#ffffff/i);
  assert.doesNotMatch(css, /data-background|backgroundPreferenceButton/);
});

test("defaults Izumi off on every device, honors saved choices, and keeps entrance and exit sequences", async () => {
  const [layout, controls, preference, customizer, petCss, appearanceSprite, sources] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/theme-controls.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/pet-preference.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/academy-customizer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/academy-customizer.module.css", import.meta.url), "utf8"),
    stat(new URL("../public/media/izumi-appearance-sprite.png", import.meta.url)),
    readFile(new URL("../public/media/SOURCES.md", import.meta.url), "utf8"),
  ]);
  const initializationScript = layout.match(/__html:\s*`([\s\S]*?)`,/)?.[1] ?? "";

  const initializePet = (savedPet, { width = 1440, touchOnly = false, storageBlocked = false } = {}) => {
    const root = { dataset: {}, style: {} };
    runInNewContext(initializationScript, {
      document: { documentElement: root },
      localStorage: {
        getItem(key) {
          if (storageBlocked) throw new Error("Storage blocked");
          return key === "homepage-pet" ? savedPet : null;
        },
      },
      matchMedia(query) {
        return { matches: query === "(max-width: 780px), (hover: none) and (pointer: coarse)" && (width <= 780 || touchOnly) };
      },
    });
    return root;
  };

  assert.equal(initializePet(null).dataset.pet, "off");
  assert.equal(initializePet("off").dataset.pet, "off");
  for (const width of [320, 375, 390, 430, 560, 768, 780]) {
    assert.equal(initializePet(null, { width }).dataset.pet, "off", `first visit at ${width}px`);
    assert.equal(initializePet("on", { width }).dataset.pet, "on", `explicit opt-in at ${width}px`);
    assert.equal(initializePet("invalid", { width }).dataset.pet, "off");
    assert.equal(initializePet(null, { width, storageBlocked: true }).dataset.pet, "off");
  }
  assert.equal(initializePet(null, { width: 781 }).dataset.pet, "off");
  assert.equal(initializePet(null, { width: 932, touchOnly: true }).dataset.pet, "off", "landscape phone");
  assert.equal(initializePet(null, { width: 1024, touchOnly: true }).dataset.pet, "off", "touch-only tablet");
  assert.equal(initializePet("on", { touchOnly: true }).dataset.petPreference, "on");
  assert.equal(initializePet(null).dataset.petPreference, undefined);
  assert.match(layout, /savedPet=localStorage\.getItem\('homepage-pet'\)/);
  assert.match(controls, /export function PetToggle/);
  assert.match(controls, /Hide Izumi desktop pet/);
  assert.match(controls, /Show Izumi desktop pet/);
  assert.match(preference, /useSyncExternalStore/);
  assert.match(preference, /\(\) => false/);
  assert.match(preference, /homepage-pet-change/);
  assert.match(preference, /localStorage\.setItem\("homepage-pet", value\)/);
  assert.match(customizer, /usePetVisible\(\)/);
  assert.match(customizer, /if \(visibilityPhase === "hidden"\) return null/);
  assert.match(customizer, /type PetVisibilityPhase = "hidden" \| "entering" \| "visible" \| "exiting"/);
  assert.match(customizer, /data-visibility=\{visibilityPhase\}/);
  assert.match(customizer, /tabIndex=\{visibilityPhase === "visible" \? 0 : -1\}/);
  assert.match(customizer, /PET_ENTRANCE_MS\s*=\s*1_050/);
  assert.match(customizer, /PET_EXIT_MS\s*=\s*980/);
  assert.match(customizer, /PET_ENTRANCE_COPY\s*=\s*"I'm here!"/);
  assert.match(customizer, /PET_EXIT_COPY\s*=\s*"See you soon!"/);
  assert.match(customizer, /function IzumiAppearanceIllustration\(\)/);
  assert.match(customizer, /src="\/media\/izumi-appearance-sprite\.webp"/);
  assert.match(customizer, /width=\{960\}[\s\S]*?height=\{680\}/);
  assert.match(customizer, /updateVisibilityPhase\("entering"\)[\s\S]*?PET_ENTRANCE_COPY[\s\S]*?updateVisibilityPhase\("visible"\)/);
  assert.match(customizer, /else if \(visibilityPhaseRef\.current === "hidden"\)[\s\S]*?setBubbleVisible\(false\)/);
  assert.match(customizer, /updateVisibilityPhase\("exiting"\)[\s\S]*?PET_EXIT_COPY[\s\S]*?updateVisibilityPhase\("hidden"\)/);
  assert.match(petCss, /\.petLayer\[data-visibility="hidden"\] \.stage\s*\{[\s\S]*?opacity: 0;[\s\S]*?scale: 0\.96;[\s\S]*?translate: 0 18px/);
  assert.match(petCss, /\.petLayer\[data-visibility="hidden"\] \.petButton\s*\{[\s\S]*?pointer-events: none;[\s\S]*?visibility: hidden/);
  assert.match(petCss, /data-visibility="entering"\][\s\S]*?izumiAppearanceEnter 1\.05s/);
  assert.match(petCss, /data-visibility="exiting"\][\s\S]*?izumiAppearanceExit 980ms/);
  assert.match(petCss, /@keyframes izumiAppearanceEnter/);
  assert.match(petCss, /@keyframes izumiAppearanceExit/);
  assert.match(petCss, /@keyframes appearancePetals/);
  assert.match(petCss, /\.petLayer\[data-visibility="hidden"\] \.bubble\s*\{[\s\S]*?opacity: 0/);
  assert.match(petCss, /\.petLayer\[data-motion="off"\] \.stage\s*\{[\s\S]*?transition: none/);
  assert.doesNotMatch(`${customizer}\n${petCss}`, /izumiAppearanceHead|izumiAppearanceTorso|izumiAppearanceLower/);
  assert.ok(appearanceSprite.size > 100_000 && appearanceSprite.size < 1_500_000, `unexpected appearance sprite size: ${appearanceSprite.size}`);
  assert.match(sources, /izumi-appearance-sprite\.png/);
  assert.match(sources, /Entrance-and-exit sprite generation prompt/);
});

test("uses one maintainable paper list and keeps content out of page components", async () => {
  const paperConfig = await readFile(new URL("../app/content/papers.ts", import.meta.url), "utf8");
  const profilePage = await readFile(new URL("../app/profile.tsx", import.meta.url), "utf8");

  assert.match(paperConfig, /this is the homepage's only publication data source/i);
  assert.match(paperConfig, /export const papers/);
  assert.match(paperConfig, /topics: readonly/);
  assert.doesNotMatch(paperConfig, /featured|mediaId/);
  assert.match(profilePage, /from "\.\/content\/papers"/);
  assert.doesNotMatch(profilePage, /const papers\s*=/);
  assert.doesNotMatch(profilePage, /news\.map\(\(item,\s*index\)/);

  const response = await render("/");
  const html = await response.text();
  assert.equal((html.match(/<article\b/g) ?? []).length, 1);
  assert.match(html, /id="histmappairs"/);
  assert.doesNotMatch(html, /0\.124|79\.7%|661 test/);
});

test("renders a two-paragraph biography with official school marks and linked mentors", async () => {
  const [profileConfig, profilePage, css] = await Promise.all([
    readFile(new URL("../app/content/profile.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/profile.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/profile.module.css", import.meta.url), "utf8"),
  ]);
  const response = await render("/");
  const html = await response.text();
  const bio = html.match(/<div class="[^"]*bioText[^"]*">([\s\S]*?)<\/div>/)?.[1] ?? "";

  assert.match(profileConfig, /bioParagraphs:/);
  assert.doesNotMatch(profileConfig, /bioSegments:/);
  assert.equal((bio.match(/<p>/g) ?? []).length, 2);
  for (const school of ["University of Wisconsin–Madison", "Cornell Tech", "Shandong University"]) {
    assert.match(bio, new RegExp(`<strong>${school}`));
  }
  for (const icon of ["sdu-96.webp", "uw-madison.svg", "cornell-tech.svg"]) {
    assert.match(bio, new RegExp(icon.replaceAll(".", "\\.")));
  }
  for (const link of [
    "https://www.hadarelor.com/",
    "https://yinli-vision.github.io/",
    "https://edpsych.education.wisc.edu/fac-staff/zhang-icy/",
  ]) {
    assert.match(bio, new RegExp(`href="${link.replaceAll(".", "\\.")}"`));
  }
  assert.ok(bio.indexOf("University of Wisconsin–Madison") < bio.indexOf("Prof. Yin Li"));
  assert.ok(bio.indexOf("Prof. Icy Zhang") < bio.indexOf("Prof. Hadar Averbuch-Elor"));
  assert.ok(bio.indexOf("Prof. Hadar Averbuch-Elor") < bio.indexOf("Cornell Tech"));
  assert.match(profilePage, /alt=""/);
  assert.match(profilePage, /aria-hidden="true"/);
  assert.match(css, /\.bioText strong\s*\{[\s\S]*?color: var\(--text\)/);
  assert.match(css, /\.bioText a\s*\{[\s\S]*?color: var\(--accent\)/);
  assert.match(css, /\.schoolMark\s*\{[\s\S]*?vertical-align:/);
});

test("implements smooth 0.1-second drawing and bounded lavender click motifs", async () => {
  const [component, css, customizer, events] = await Promise.all([
    readFile(new URL("../app/components/academy-interactions.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/academy-interactions.module.css", import.meta.url), "utf8"),
    readFile(new URL("../app/components/academy-customizer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/academy-events.ts", import.meta.url), "utf8"),
  ]);
  const source = `${component}\n${css}`;

  assert.match(component, /LONG_PRESS_MS = 100/);
  assert.match(component, /STROKE_HOLD_MS = 2_000/);
  assert.match(component, /STROKE_FADE_MS = 900/);
  assert.match(component, /requestAnimationFrame/);
  assert.match(component, /quadraticCurveTo/);
  assert.match(component, /getCoalescedEvents/);
  assert.match(component, /devicePixelRatio/);
  assert.match(component, /Math\.sqrt\(4_000_000 \/ \(width \* height\)\)/);
  assert.match(component, /pointerType === "mouse"/);
  assert.match(component, /INTERACTIVE_SELECTOR/);
  assert.match(component, /EFFECT_EXCLUSION_SELECTOR/);
  assert.match(component, /data-academy-no-effect/);
  for (const textTarget of ["p", "h1", "h2", "h3", "h4", "li", "dt", "dd", "time", "figcaption"]) {
    assert.match(component, new RegExp(`"${textTarget}"`));
  }
  assert.match(component, /prefers-reduced-motion: reduce|useMotionEnabled/);
  for (const motif of ["paw", "flower", "bow", "sparkle", "flourish", "ripple"]) {
    assert.match(component, new RegExp(`"${motif}"`));
  }
  assert.match(css, /pointer-events: none/);
  assert.doesNotMatch(source, /heart-line|hua-profile|cursor:\s*none|background-image/);
  assert.match(events, /ACADEMY_CLICK_EFFECT_EVENT = "academy:click-effect"/);
  assert.match(events, /ACADEMY_DRAWING_COMPLETE_EVENT = "academy:drawing-complete"/);
  assert.match(component, /created && isMouse/);
  assert.match(component, /new CustomEvent<AcademyClickEffectDetail>/);
  assert.match(component, /detail: \{ clientX: event\.clientX, clientY: event\.clientY \}/);
  assert.equal((component.match(/new Event\(ACADEMY_DRAWING_COMPLETE_EVENT\)/g) ?? []).length, 1);
  assert.match(component, /if \(pending\.drawing\) \{[\s\S]*?finishStroke\(event\)[\s\S]*?return;[\s\S]*?\}[\s\S]*?if \(canceled\) return;/);
  assert.match(customizer, /addEventListener\(ACADEMY_CLICK_EFFECT_EVENT, handleClickEffect\)/);
  assert.match(customizer, /removeEventListener\(ACADEMY_CLICK_EFFECT_EVENT, handleClickEffect\)/);
  assert.doesNotMatch(customizer, /addEventListener\(["']pointermove["']/);
  assert.doesNotMatch(customizer, /handlePointerMove|POINTER_TURN_DEBOUNCE_MS|POINTER_TURN_COOLDOWN_MS|pointerTurnTimerRef|pointerRequestRef/);
});

test("routes completed paintings and the brand heart to dedicated full-body Izumi reactions", async () => {
  const [events, interactions, brand, customizer, css, reactionSprite] = await Promise.all([
    readFile(new URL("../app/components/academy-events.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/academy-interactions.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/academy-brand.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/academy-customizer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/academy-customizer.module.css", import.meta.url), "utf8"),
    readFile(new URL("../public/media/izumi-reaction-sprite.png", import.meta.url)),
  ]);
  const endPress = interactions.match(/const endPress = \(event: PointerEvent, canceled: boolean\) => \{([\s\S]*?)\n\s*\};/)?.[1] ?? "";
  const drawingBranch = endPress.match(/if \(pending\.drawing\) \{([\s\S]*?)\n\s*\}/)?.[1] ?? "";
  const blurHandler = interactions.match(/const handleWindowBlur = \(\) => \{([\s\S]*?)\n\s*\};/)?.[1] ?? "";
  const activate = brand.match(/const activate = \(\) => \{([\s\S]*?)\n\s*\};/)?.[1] ?? "";
  const actions = customizer.match(/const ACTIONS:[\s\S]*?= \[([\s\S]*?)\];/)?.[1] ?? "";
  const specialReaction = customizer.match(/const runSpecialAction = useCallback\(\(next: SpecialPetAction\) => \{([\s\S]*?)\n\s*\}, \[[\s\S]*?\]\);/)?.[1] ?? "";
  const specialArt = customizer.match(/function IzumiReactionIllustration\(\) \{([\s\S]*?)\n\}/)?.[1] ?? "";
  const reactionCss = css.match(/\.izumiReactionArt\s*\{[\s\S]*?(?=\.izumiTurnArt\s*\{)/)?.[0] ?? "";

  assert.match(events, /ACADEMY_DRAWING_COMPLETE_EVENT = "academy:drawing-complete"/);
  assert.match(events, /ACADEMY_BRAND_HEART_EVENT = "academy:brand-heart"/);

  // Only a real, non-cancelled drawing release emits the painting event.
  assert.match(drawingBranch, /finishStroke\(event\)/);
  assert.match(drawingBranch, /!canceled/);
  assert.match(drawingBranch, /new Event\(ACADEMY_DRAWING_COMPLETE_EVENT\)/);
  assert.doesNotMatch(blurHandler, /ACADEMY_DRAWING_COMPLETE_EVENT/);
  assert.match(interactions, /handlePointerCancel = \(event: PointerEvent\) => endPress\(event, true\)/);
  assert.equal((interactions.match(/new Event\(ACADEMY_DRAWING_COMPLETE_EVENT\)/g) ?? []).length, 1);

  // The top-left mark has its own semantic event and remains excluded from the
  // generic click motif/turning channel.
  assert.match(brand, /ACADEMY_BRAND_HEART_EVENT/);
  assert.match(activate, /window\.dispatchEvent\(new Event\(ACADEMY_BRAND_HEART_EVENT\)\)/);
  assert.match(brand, /className=\{styles\.brand\} data-academy-no-effect/);
  assert.doesNotMatch(brand, /ACADEMY_CLICK_EFFECT_EVENT/);

  assert.match(customizer, /type SpecialPetAction = "painting" \| "heart"/);
  assert.match(customizer, /type PetAction = "idle" \| StandardPetAction \| SpecialPetAction/);
  assert.doesNotMatch(actions, /"painting"|"heart"/);
  assert.match(customizer, /painting: "Nice painting!"/);
  assert.match(customizer, /heart: "♥︎"/);
  assert.doesNotMatch(customizer, /❤️/);
  assert.match(customizer, /addEventListener\(ACADEMY_DRAWING_COMPLETE_EVENT/);
  assert.match(customizer, /removeEventListener\(ACADEMY_DRAWING_COMPLETE_EVENT/);
  assert.match(customizer, /addEventListener\(ACADEMY_BRAND_HEART_EVENT/);
  assert.match(customizer, /removeEventListener\(ACADEMY_BRAND_HEART_EVENT/);
  assert.match(specialReaction, /dragPhaseRef\.current !== "idle"/);
  assert.match(specialReaction, /dragSessionRef\.current !== null/);
  assert.match(specialReaction, /clearActionTimers\(\)/);
  assert.match(specialReaction, /clearTurnTimers\(\)/);
  assert.match(specialReaction, /setAction\(next\)/);
  assert.match(specialReaction, /setBubbleVisible\(true\)/);
  assert.match(specialReaction, /scheduleAutoAction/);
  assert.doesNotMatch(specialReaction, /!motionEnabled[\s\S]*?return/);
  assert.doesNotMatch(specialReaction, /beginTurn\(/);

  // One transparent 960×680 sprite contains two complete 480×680 character
  // frames. The page swaps whole frames rather than stretching body regions.
  assert.equal(reactionSprite.readUInt32BE(16), 960);
  assert.equal(reactionSprite.readUInt32BE(20), 680);
  assert.ok(reactionSprite.byteLength > 50_000 && reactionSprite.byteLength < 500_000);
  assert.match(customizer, /function IzumiReactionIllustration\(\)/);
  assert.match(specialArt, /src="\/media\/izumi-reaction-sprite\.webp"/);
  assert.match(specialArt, /width=\{960\}/);
  assert.match(specialArt, /height=\{680\}/);
  assert.match(customizer, /<IzumiReactionIllustration \/>/);
  assert.match(reactionCss, /data-action="painting"/);
  assert.match(reactionCss, /data-action="heart"/);
  assert.match(reactionCss, /\.izumiReactionArt/);
  assert.match(reactionCss, /\.izumiReactionSprite/);
  assert.doesNotMatch(reactionCss, /izumiHead|izumiTorso|izumiLower|clipPath|scaleX|scaleY|rotateY/);
});

test("locks the selected appearance and keeps Izumi as the only visible companion", async () => {
  const [component, css, layout, page] = await Promise.all([
    readFile(new URL("../app/components/academy-customizer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/academy-customizer.module.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/profile.tsx", import.meta.url), "utf8"),
  ]);
  const source = `${component}\n${css}`;

  assert.doesNotMatch(page, /data-(?:academy-page|backdrop|page-font|heart|pet|topic)=/);
  assert.match(page, /<AcademyCustomizer \/>/);
  assert.doesNotMatch(page, /styles\.themeList|Open appearance choices/);
  for (const action of ["sleep", "move", "happy", "cheer", "jump", "drowsy"]) {
    assert.match(component, new RegExp(`"${action}"`));
    assert.match(css, new RegExp(`data-action="${action}"`));
  }
  assert.match(component, /AUTO_ACTION_MIN = 18_000/);
  assert.match(component, /AUTO_ACTION_RANGE = 12_000/);
  assert.doesNotMatch(component, /localStorage|academy-page-font|academy-brand-heart|dataset\.pageFont|dataset\.heart/);
  assert.match(component, /cheer: "Hi! www"/);
  assert.match(component, /data\.facing|dataset\.facing/);
  assert.match(component, /izumi-idle-sprite\.webp/);
  assert.match(component, /IZUMI_FRAME_WIDTH = 480/);
  assert.match(component, /IZUMI_FRAME_HEIGHT = 680/);
  assert.doesNotMatch(component, /IZUMI_CROP_TOP|IZUMI_FRAME_OFFSETS|sakurai-izumi-pet\.png/);
  assert.match(component, /width=\{IZUMI_FRAME_WIDTH \* 4\}[\s\S]*?height=\{IZUMI_FRAME_HEIGHT\}/);
  assert.match(css, /\.izumiSprite\s*\{[\s\S]*?width:\s*400%[\s\S]*?height:\s*100%/);
  for (const frame of [0, 1, 2, 3]) {
    assert.match(css, new RegExp(`\.izumiFrame\\[data-frame="${frame}"\\]`));
  }
  assert.doesNotMatch(component, /height="819"/);
  assert.doesNotMatch(component, /izumiHead|izumiTorso|izumiLower|clipPath/);
  assert.match(component, /--pet-roam-x/);
  assert.match(component, /startCampusWalk/);
  assert.match(component, /PET_TURN_TOTAL_MS = 420/);
  assert.match(component, /PET_TURN_FIRST_FRAME_MS = 48/);
  assert.match(component, /PET_TURN_FRAME_INTERVAL_MS = 64/);
  assert.match(component, /PET_TURN_SETTLE_MS = 372/);
  assert.doesNotMatch(component, /POINTER_TURN_DEBOUNCE_MS|POINTER_TURN_COOLDOWN_MS/);
  assert.match(component, /data-turning="idle"/);
  assert.match(component, /data-travel="resting"/);
  assert.match(component, /data-academy-no-effect/);
  assert.match(component, /createPortal/);
  assert.match(component, /createPortal\(<AcademyPet \/>/);
  assert.doesNotMatch(component, /legend="Companion"|legend="Avatar frame"|academy-desktop-pet|academy-avatar-frame/);
  assert.doesNotMatch(component, /CatIllustration|BunnyIllustration|MochiIllustration|AcademyPetKind/);
  assert.match(component, /useMotionEnabled/);
  assert.match(css, /position: fixed/);
  assert.match(css, /image-rendering: auto/);
  assert.match(css, /@keyframes izumiWholeIdle/);
  assert.match(css, /@keyframes izumiWholeWalk/);
  assert.doesNotMatch(css, /@keyframes petTurnCollapse|@keyframes petTurnExpand/);
  assert.doesNotMatch(css, /scaleX\(0\.055\)|rotateY\(/);
  assert.doesNotMatch(css, /@keyframes izumiHead|@keyframes izumiTorso|@keyframes izumiLower/);
  assert.match(css, /font-size: 14px/);
  assert.match(css, /font-family: ui-rounded/);
  assert.match(css, /pointer-events: auto/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(source, /background-image|--pet-x/);
  assert.doesNotMatch(layout, /SakuraiPet|sakurai-pet/);
});

test("keeps Izumi's drag, illustrated turn, and crisp bubble interactions coherent", async () => {
  const [component, css, interactions, dragSprite, turnSprite] = await Promise.all([
    readFile(new URL("../app/components/academy-customizer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/academy-customizer.module.css", import.meta.url), "utf8"),
    readFile(new URL("../app/components/academy-interactions.tsx", import.meta.url), "utf8"),
    stat(new URL("../public/media/izumi-drag-sprite-v2.png", import.meta.url)),
    stat(new URL("../public/media/izumi-turn-sprite.png", import.meta.url)),
  ]);
  const source = `${component}\n${css}`;
  const pointerDown = component.match(/onPointerDown=\{\(event\) => \{([\s\S]*?)\n\s*\}\}\s*\n\s*onPointerMove/)?.[1] ?? "";
  const pointerMove = component.match(/onPointerMove=\{\(event\) => \{([\s\S]*?)\n\s*\}\}\s*\n\s*onPointerUp/)?.[1] ?? "";
  const pointerUp = component.match(/onPointerUp=\{\(event\) => \{([\s\S]*?)\n\s*\}\}\s*\n\s*onPointerCancel/)?.[1] ?? "";
  const click = component.match(/onClick=\{\(event\) => \{([\s\S]*?)\n\s*\}\}\s*\n\s*>/)?.[1] ?? "";
  const beginTurn = component.match(/const beginTurn = useCallback\(\(nextFacing:[\s\S]*?\n\s*\}, \[motionEnabled\]\);/)?.[0] ?? "";
  const startCampusWalk = component.match(/const startCampusWalk = useCallback\(\(\) => \{[\s\S]*?\n\s*\}, \[\]\);/)?.[0] ?? "";
  const updateDraggedPosition = component.match(/const updateDraggedPosition = useCallback\(\(clientX: number, clientY: number\) => \{[\s\S]*?\n\s*\}, \[setUserPosition\]\);/)?.[0] ?? "";
  const beginDrag = component.match(/const beginDrag = useCallback\(\(pointerId: number\) => \{[\s\S]*?\n\s*\}\, \[[\s\S]*?\n\s*\]\);/)?.[0] ?? "";
  const clearTurnTimers = component.match(/const clearTurnTimers = useCallback\(\(\) => \{[\s\S]*?\n\s*\}, \[\]\);/)?.[0] ?? "";
  const petButtonMarkup = component.match(/<button[\s\S]*?<\/button>/)?.[0] ?? "";
  const petLayerCss = css.match(/\.petLayer\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
  const dragSpriteCss = css.match(/\.izumiDragSprite\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
  const turnSpriteCss = css.match(/\.izumiTurnSprite\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
  const bubbleCss = css.match(/\.bubble\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
  const visibleBubbleCss = css.match(/\.bubble\[data-visible="true"\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
  const dragReactionCss = css.match(/\/\* Drag reactions[\s\S]*?(?=\.petLayer\[data-motion="off"\])/)?.[0] ?? "";

  const dragMotionCss = css.match(/@keyframes petWholePickup[\s\S]*?(?=@keyframes izumiWholeIdle)/)?.[0] ?? "";

  assert.doesNotMatch(component, /PET_LONG_PRESS_MS|longPressTimerRef|"pressing"/);
  assert.match(component, /PET_HOLD_MS\s*=\s*100/);
  assert.match(component, /Hold for 0\.1 seconds, then drag to move her/);
  assert.match(component, /Hold 0\.1 seconds, then drag to move Izumi/);
  assert.match(component, /PET_DRAG_MOVE_THRESHOLD\s*=\s*5/);
  for (const requirement of [/event\.pointerType !== "mouse"/, /event\.button !== 0/, /!event\.isPrimary/]) {
    assert.match(pointerDown, requirement);
  }
  assert.doesNotMatch(pointerDown, /!motionEnabled/);
  assert.match(pointerDown, /setPointerCapture\(event\.pointerId\)/);
  assert.match(pointerDown, /holdTimerRef\.current = window\.setTimeout\([\s\S]*?session\.hasMoved = true[\s\S]*?suppressClickRef\.current = true[\s\S]*?beginDrag\(event\.pointerId\)[\s\S]*?PET_HOLD_MS/);
  assert.match(pointerMove, /dragPhaseRef\.current === "idle"[\s\S]*?PET_DRAG_MOVE_THRESHOLD[\s\S]*?clearTimeout\(holdTimerRef\.current\)/);
  assert.match(pointerUp, /dragPhaseRef\.current === "idle"[\s\S]*?clearTimeout\(holdTimerRef\.current\)[\s\S]*?dragSessionRef\.current = null[\s\S]*?releasePointerCapture/);
  assert.match(component, /clearDragTimers[\s\S]*?clearTimeout\(holdTimerRef\.current\)/);
  for (const handler of ["onPointerDown", "onPointerMove", "onPointerUp", "onPointerCancel", "onLostPointerCapture"]) {
    assert.match(component, new RegExp(`${handler}=`));
  }
  assert.match(component, /setPointerCapture\(pointerId\)/);
  assert.match(component, /hasPointerCapture\(/);
  assert.match(component, /releasePointerCapture\(/);
  assert.match(component, /window\.innerWidth\s*-\s*button\.offsetWidth\s*-\s*PET_VIEWPORT_MARGIN/);
  assert.match(component, /window\.innerHeight\s*-\s*button\.offsetHeight\s*-\s*PET_VIEWPORT_MARGIN/);
  assert.match(component, /Math\.min\(maximumLeft,\s*Math\.max\(PET_VIEWPORT_MARGIN,\s*rawLeft\)\)/);
  assert.match(component, /Math\.min\(maximumTop,\s*Math\.max\(PET_VIEWPORT_MARGIN,\s*rawTop\)\)/);

  assert.match(component, /data-drag-phase=\{dragPhase\}/);
  assert.match(component, /data-drag-art=\{dragArt\}/);
  for (const phase of ["idle", "lifting", "dragging", "dropping", "landing", "recovering", "celebrating"]) {
    assert.match(component, new RegExp(`"${phase}"`));
  }
  assert.match(
    component,
    /setPetDragFrame\(4\)[\s\S]*?setPetDragPhase\("dropping"\)[\s\S]*?setPetDragFrame\(5\)[\s\S]*?setPetDragPhase\("landing"\)[\s\S]*?setPetDragFrame\(6\)[\s\S]*?setPetDragPhase\("recovering"\)[\s\S]*?setDragArt\("idle"\)[\s\S]*?setPetDragPhase\("celebrating"\)[\s\S]*?setPetDragFrame\(0\)[\s\S]*?setPetDragPhase\("idle"\)/,
  );
  assert.doesNotMatch(component, /setPetDragFrame\(7\)/);
  assert.match(component, /src="\/media\/izumi-drag-sprite-v2\.webp"/);
  assert.match(component, /width=\{1920\}[\s\S]*?height=\{1360\}/);
  assert.match(component, /airFrame: 2 \| 3/);
  assert.match(pointerDown, /airFrame: facingRef\.current === "left" \? 2 : 3/);
  assert.match(beginDrag, /setPetDragFrame\(session\.airFrame\)[\s\S]*?setPetDragPhase\("lifting"\)/);
  assert.equal((beginDrag.match(/setPetDragFrame\(session\.airFrame\)/g) ?? []).length, 2);
  assert.doesNotMatch(beginDrag, /setPetDragFrame\(activeSession|setPetDragFrame\([23]\)/);
  assert.doesNotMatch(component, /PET_CARRY_FRAME_DISTANCE|carryFrame|carryAnchorClient/);
  assert.doesNotMatch(updateDraggedPosition, /setPetDragFrame|beginTurn|dataset\.facing|facingRef\.current\s*=(?!=)/);
  assert.ok(dragSprite.size > 500_000 && dragSprite.size < 2_000_000, `unexpected drag sprite size: ${dragSprite.size}`);
  assert.match(component, /suppressClickRef\.current = true/);
  for (const requirement of [/suppressClickRef\.current/, /event\.preventDefault\(\)/, /event\.stopPropagation\(\)/, /return;/]) {
    assert.match(click, requirement);
  }
  assert.match(component, /dragPhaseRef\.current !== "idle"[\s\S]*?schedule\(2_000\)[\s\S]*?return;/);

  // Picking Izumi up cancels every pending turn and locks the purpose-drawn
  // airborne illustration selected from her facing at pointer-down.
  assert.match(component, /PET_PICKUP_ART_MS\s*=\s*52/);
  assert.match(beginDrag, /clearTurnTimers\(\)[\s\S]*?setDragArt\("idle"\)[\s\S]*?setPetDragFrame\(session\.airFrame\)[\s\S]*?setPetDragPhase\("lifting"\)/);
  assert.match(beginDrag, /setDragArt\("sprite"\)[\s\S]*?PET_PICKUP_ART_MS/);
  assert.doesNotMatch(beginDrag, /beginTurn\(|dataset\.facing|facingRef\.current\s*=(?!=)/);
  assert.match(clearTurnTimers, /turnTokenRef\.current \+= 1/);
  assert.match(clearTurnTimers, /turnTimersRef\.current\.forEach\(\(timer\) => window\.clearTimeout\(timer\)\)/);
  assert.match(beginTurn, /dragPhaseRef\.current !== "idle"[\s\S]*?dragSessionRef\.current !== null/);
  assert.match(beginTurn, /turnTokenRef\.current !== token[\s\S]*?dragPhaseRef\.current !== "idle"[\s\S]*?dragSessionRef\.current !== null/);

  // Turning is a purpose-drawn five-frame sequence in both directions. Campus
  // roaming itself must not silently invoke a turn; click-effect direction does.
  assert.match(component, /type PetTurnFrame = 0 \| 1 \| 2 \| 3 \| 4/);
  assert.match(component, /PET_TURN_TOTAL_MS\s*=\s*420/);
  assert.match(component, /PET_TURN_FIRST_FRAME_MS\s*=\s*48/);
  assert.match(component, /PET_TURN_FRAME_INTERVAL_MS\s*=\s*64/);
  assert.match(component, /PET_TURN_SETTLE_MS\s*=\s*372/);
  assert.match(beginTurn, /\? \[0, 1, 2, 3, 4\][\s\S]*?: \[4, 3, 2, 1, 0\]/);
  for (const state of ["preparing", "frames", "settling", "idle"]) {
    assert.match(beginTurn, new RegExp(`dataset\\.turning = "${state}"`));
  }
  for (const frame of [0, 1, 2, 3, 4]) {
    assert.match(css, new RegExp(`data-turn-frame="${frame}"`));
  }
  assert.match(component, /function IzumiTurnIllustration\(\)/);
  assert.match(component, /src="\/media\/izumi-turn-sprite\.webp"/);
  assert.match(component, /width=\{2400\}[\s\S]*?height=\{680\}/);
  assert.match(component, /<span className=\{styles\.facing\}>[\s\S]*?<IzumiIllustration \/>[\s\S]*?<IzumiReactionIllustration \/>[\s\S]*?<\/span>\s*<IzumiDragIllustration \/>\s*<IzumiTurnIllustration \/>/);
  assert.match(turnSpriteCss, /width:\s*500%/);
  assert.match(turnSpriteCss, /height:\s*100%/);
  assert.doesNotMatch(turnSpriteCss, /scaleX|rotateY|transition/);
  assert.match(css, /\.petButton\[data-turning="frames"\] \.facing\s*\{[\s\S]*?opacity:\s*0[\s\S]*?visibility:\s*hidden/);
  assert.match(css, /\.petButton\[data-turning="frames"\] \.izumiTurnArt\s*\{[\s\S]*?opacity:\s*1[\s\S]*?visibility:\s*visible/);
  assert.doesNotMatch(source, /PET_TURN_COLLAPSE_MS|PET_TURN_EXPAND_MS|petTurnCollapse|petTurnExpand|scaleX\(0\.055\)|rotateY\(/);
  assert.doesNotMatch(startCampusWalk, /beginTurn\(/);
  assert.match(component, /const handleClickEffect[\s\S]*?beginTurn\(detail\.clientX < centerX \? "left" : "right"\)/);
  assert.ok(turnSprite.size > 300_000 && turnSprite.size < 1_500_000, `unexpected turn sprite size: ${turnSprite.size}`);

  // The release seam returns to the original, consistently sized wave pose,
  // rather than inventing an eighth drag frame before idle.
  assert.match(component, /setPetDragFrame\(6\)[\s\S]*?setPetDragPhase\("recovering"\)[\s\S]*?setDragArt\("idle"\)[\s\S]*?setPetDragPhase\("celebrating"\)/);
  assert.match(css, /data-drag-phase="celebrating"\] \.izumiPose\[data-pose="idle"\][\s\S]*?opacity:\s*0/);
  assert.match(css, /data-drag-phase="celebrating"\] \.izumiPose\[data-pose="wave"\][\s\S]*?opacity:\s*1/);

  // Airborne art is selected once from the pickup-facing direction and never
  // alternates while moving. The deliberately slower landing chain preserves
  // each illustrated beat long enough to read before returning to idle.
  assert.match(component, /PET_DROP_MS\s*=\s*160/);
  assert.match(component, /PET_LAND_MS\s*=\s*480/);
  assert.match(component, /PET_RECOVER_MS\s*=\s*520/);
  assert.match(component, /PET_CELEBRATE_MS\s*=\s*860/);
  assert.match(component, /PET_STILL_LAND_MS\s*=\s*360/);
  assert.match(css, /data-drag-phase="dropping"\] \.stage\s*\{[\s\S]*?petWholeDrop 160ms/);
  assert.match(css, /data-drag-phase="dropping"\]\s*\{[\s\S]*?transition: transform 160ms/);
  assert.match(css, /data-drag-phase="landing"\] \.stage\s*\{[\s\S]*?petWholeLanding 480ms/);
  assert.match(css, /data-drag-phase="recovering"\] \.stage\s*\{[\s\S]*?petWholeRecovery 520ms/);
  assert.match(css, /data-drag-phase="celebrating"\] \.stage\s*\{[\s\S]*?petWholeCelebrate 860ms/);

  assert.match(css, /--pet-user-x:\s*0px/);
  assert.match(css, /--pet-user-y:\s*0px/);
  assert.match(css, /cursor:\s*grab/);
  assert.match(css, /cursor:\s*grabbing/);
  assert.match(css, /translate3d\(calc\(var\(--pet-user-x\) \+ var\(--pet-roam-x\)\), var\(--pet-user-y\), 0\)/);
  assert.match(dragSpriteCss, /width:\s*400%/);
  assert.match(dragSpriteCss, /height:\s*200%/);
  assert.doesNotMatch(dragSpriteCss, /transition/);
  for (const frame of [0, 1, 2, 3, 4, 5, 6]) {
    assert.match(css, new RegExp(`data-drag-frame="${frame}"`));
  }
  assert.doesNotMatch(css, /data-drag-frame="7"/);
  for (const phase of ["lifting", "dragging", "dropping", "landing", "recovering", "celebrating"]) {
    assert.match(css, new RegExp(`\\.petButton\\[data-drag-phase="${phase}"\\] \\.stage`));
  }
  for (const keyframe of ["petWholePickup", "petWholeDrop", "petWholeLanding", "petWholeRecovery", "petWholeCelebrate"]) {
    assert.match(css, new RegExp(`@keyframes ${keyframe}`));
  }
  assert.match(css, /data-drag-art="sprite"\] \.izumiDragArt/);
  assert.doesNotMatch(dragReactionCss, /scaleX|scaleY|izumiHead|izumiTorso|izumiLower|clipPath/);
  assert.doesNotMatch(dragMotionCss, /scale\(|rotate\(/);
  assert.match(component, /const roundedX = Math\.round\(x\)[\s\S]*?const roundedY = Math\.round\(y\)/);
  assert.doesNotMatch(source, /izumiHead|izumiTorso|izumiLower|clipPath/);
  assert.match(css, /\.petLayer\[data-motion="off"\] \.petButton\s*\{[\s\S]*?var\(--pet-user-x\)[\s\S]*?var\(--pet-user-y\)[\s\S]*?transition:\s*none/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.petLayer/);

  // Keep copy in a separate fixed sibling layer, snapped to device-friendly
  // integer coordinates and unscaled when visible so glyphs remain crisp.
  assert.doesNotMatch(petButtonMarkup, /styles\.bubble|bubbleRef/);
  assert.match(component, /<\/button>\s*<span\s*ref=\{bubbleRef\}\s*className=\{styles\.bubble\}/);
  assert.match(component, /Math\.round\(left\)/);
  assert.match(component, /Math\.round\(top\)/);
  assert.doesNotMatch(petLayerCss, /transform|filter|will-change/);
  assert.match(bubbleCss, /position:\s*fixed/);
  assert.match(bubbleCss, /font-size:\s*15px/);
  assert.match(bubbleCss, /font-weight:\s*500/);
  assert.match(bubbleCss, /font-synthesis:\s*none/);
  assert.match(bubbleCss, /text-rendering:\s*geometricPrecision/);
  assert.doesNotMatch(bubbleCss, /scale\(|translate3d|will-change|filter/);
  assert.match(visibleBubbleCss, /opacity:\s*1/);
  assert.match(visibleBubbleCss, /transform:\s*none/);

  assert.match(component, /data-academy-no-effect/);
  assert.match(interactions, /const EFFECT_EXCLUSION_SELECTOR = \[[\s\S]*?"\[data-academy-no-effect\]"/);
  assert.doesNotMatch(component, /window\.dispatchEvent\(/);
});

test("keeps the requested text comfortably legible and responsive", async () => {
  const css = await readFile(new URL("../app/profile.module.css", import.meta.url), "utf8");

  assert.match(css, /\.page\s*\{[\s\S]*?font-size: 17px/);
  assert.match(css, /\.facts dt\s*\{[\s\S]*?font-size: 13px/);
  assert.match(css, /\.facts dd\s*\{[\s\S]*?font-size: 15px/);
  assert.doesNotMatch(css, /\.themeList/);
  assert.match(css, /\.summary\s*\{[\s\S]*?font-size: 16px/);
  assert.match(css, /\.footer\s*\{[\s\S]*?font-size: 15px/);
  assert.match(css, /\.profileIcon\s*\{[\s\S]*?color: var\(--text\)/);
  assert.match(css, /\.profileIcon svg\s*\{[\s\S]*?stroke: currentColor/);
  assert.match(css, /--page-font: ui-rounded/);
  assert.doesNotMatch(css, /data-page-font=/);
  assert.match(css, /\.introHeading h2\s*\{[\s\S]*?clamp\(34px, 3\.3vw, 45px\)/);
  assert.match(css, /\.sectionHeading p\s*\{[\s\S]*?font-size: 18px/);
  assert.match(css, /\.bioText\s*\{[\s\S]*?font-size: clamp\(17px, 1\.34vw, 19px\)/);
  assert.match(css, /\.news time\s*\{[\s\S]*?font-size: 17px;[\s\S]*?font-weight: 780/);
  assert.match(css, /\.miscText\s*\{[\s\S]*?font-size: 17px/);
  assert.match(css, /\.edgeDecorations\s*\{[\s\S]*?position: absolute/);
  assert.match(css, /span:nth-child\(24\)/);
  for (const decoration of [17, 18, 19, 20, 21, 22, 23, 24]) {
    assert.match(css, new RegExp(`span:nth-child\\(${decoration}\\)`));
  }
  assert.doesNotMatch(css, /\.edgeDecorations\s*\{[\s\S]*?position: fixed/);

  assert.doesNotMatch(css, /data-backdrop=/);
  assert.match(css, /@media \(max-width:/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(css, /data-v1-variant/);
});

test("omits the homepage portrait while preserving its component for rollback", async () => {
  const [page, portrait, css, brand, brandCss] = await Promise.all([
    readFile(new URL("../app/profile.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/profile-portrait.tsx", import.meta.url), "utf8"),
    Promise.all([readFile(new URL("../app/profile.module.css", import.meta.url), "utf8"), readFile(new URL("../app/components/profile-portrait.module.css", import.meta.url), "utf8")]).then((parts) => parts.join("\n")),
    readFile(new URL("../app/components/academy-brand.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/academy-brand.module.css", import.meta.url), "utf8"),
  ]);
  const response = await render("/");
  const html = await response.text();

  assert.doesNotMatch(page, /import \{ ProfilePortrait \}|<ProfilePortrait/);
  assert.match(portrait, /src="\/media\/hua-profile-768\.webp"/);
  assert.match(portrait, /src="\/media\/hua-profile-anime-clean-768\.webp"/);
  assert.match(portrait, /PORTRAIT_STORAGE_KEY/);
  assert.match(portrait, /PORTRAIT_STORAGE_KEY = "academy-profile-portrait-v2"/);
  assert.match(portrait, /useState<PortraitMode>\("clip"\)/);
  assert.doesNotMatch(portrait, /academy-profile-portrait-v1/);
  assert.match(portrait, /mode === "oval" \? "clip" : "oval"/);
  assert.match(portrait, /data-portrait-mode=\{mode\}/);
  assert.match(portrait, /data-academy-no-effect/);
  assert.doesNotMatch(portrait, /figcaption|Hua Zhou · UW–Madison/);
  assert.match(portrait, /unoptimized/);
  assert.doesNotMatch(html, /hua-profile|data-portrait-mode|Current portrait:/);
  assert.doesNotMatch(html, /_vinext\/image\?url=%2Fmedia%2Fhua-profile/);
  assert.match(css, /data-portrait-mode="oval"/);
  assert.match(css, /data-portrait-mode="clip"/);
  assert.match(css, /opacity 420ms ease/);
  assert.match(css, /transform 620ms cubic-bezier/);
  assert.doesNotMatch(brand, /Damaolucky/);
  assert.match(brand, /viewBox="0 0 24 24"/);
  assert.equal((brand.match(/className=\{styles\.heartShape\}/g) ?? []).length, 1);
  assert.doesNotMatch(brand, /data-heart-shape=/);
  assert.doesNotMatch(brandCss, /data-heart=/);
  assert.match(brand, /data-academy-no-effect/);
  assert.match(brand, /className=\{styles\.mark\}[\s\S]*?<\/button>/);
  assert.doesNotMatch(brand, /<button[\s\S]*?Damaolucky[\s\S]*?<\/button>/);
  assert.doesNotMatch(portrait, /portraitSwitchHint|↻/);
  assert.doesNotMatch(css, /\.portraitSwitchHint/);
  assert.match(brandCss, /@keyframes bubblePop/);
  assert.match(brandCss, /\.mark:hover/);
  assert.match(brandCss, /place-items: center/);
  assert.match(css, /\.helloBubble\s*\{[\s\S]*?width: 64px;[\s\S]*?height: 64px/);
});

test("keeps only the final homepage assets and implementation surface", async () => {
  const [motionPreference, sources, idleSprite] = await Promise.all([
    readFile(new URL("../app/components/motion-preference.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/media/SOURCES.md", import.meta.url), "utf8"),
    stat(new URL("../public/media/izumi-idle-sprite.png", import.meta.url)),
  ]);

  assert.match(motionPreference, /prefers-reduced-motion: reduce/);
  assert.match(motionPreference, /homepage-motion-change/);
  assert.match(sources, /hua-profile\.png/);
  assert.match(sources, /hua-profile-anime-clean\.png/);
  assert.match(sources, /Built-in ImageGen precise-object edit/);
  assert.match(sources, /izumi-idle-sprite\.png/);
  assert.doesNotMatch(sources, /fourier-series-transform|lissajous-morph|moire-clock|sprott-attractors/);
  assert.ok(idleSprite.size > 500_000 && idleSprite.size < 1_500_000, `unexpected idle sprite size: ${idleSprite.size}`);

  const portrait = await stat(new URL("../public/media/hua-profile.png", import.meta.url));
  assert.ok(portrait.size > 10_000);
  const editedPortrait = await stat(new URL("../public/media/hua-profile-anime-clean.png", import.meta.url));
  assert.ok(editedPortrait.size > 100_000);

  for (const file of [
    "../app/chatgpt-auth.ts",
    "../app/content/media.ts",
    "../app/components/motion-media.tsx",
    "../app/credits",
    "../db",
    "../drizzle",
    "../drizzle.config.ts",
    "../examples",
    "../public/media/fourier-series-transform.gif",
    "../public/media/lissajous-morph.gif",
    "../public/media/moire-clock.gif",
    "../public/media/sprott-attractors.gif",
    "../public/media/heart-line.png",
    "../public/media/sakurai-izumi-pet.png",
    "../public/media/izumi-drag-sprite.png",
    "../public/og.png",
    "../public/file.svg",
    "../public/globe.svg",
    "../public/window.svg",
    "../public/favicon.svg",
    "../public/media/school-icons/README.md",
  ]) {
    await assert.rejects(access(new URL(file, import.meta.url)), file);
  }
});
