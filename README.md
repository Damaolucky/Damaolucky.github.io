# Hua Zhou · personal homepage

The repository contains one finished research homepage. The canonical route is
`/`; the legacy `/v1` route only redirects to it.

## Content

- `app/content/profile.ts` controls the biography, contact links, Misc
  text, and last-updated date.
- `app/content/papers.ts` is the single source of truth for **Selected Work**.
  The array order is the display order.

To add or edit a project, update the `papers` array in
`app/content/papers.ts`. See [`EDITING_GUIDE.md`](./EDITING_GUIDE.md) for a
field-by-field example.

## Final appearance and interactions

The public design uses Round typography, the Lavender Petals background, and
the Classic heart. There is no separate background selector.

The profile is displayed without a portrait. The first visit opens in Bright mode; visitors can
switch Motion/Still and Bright/Dark preferences, and an explicit Dark choice is
remembered for later visits.

Izumi starts hidden on every device. The Pet toggle remembers
an explicit choice; without one, the default is off. Hidden pet artwork is not loaded. Mobile layouts keep section navigation
visible, use larger touch targets, and account for screen safe areas.

Text blocks remain selectable; an active selection takes priority over drawing. Holding the primary mouse button for 100 ms on empty page space starts drawing;
the completed lavender line fades after two seconds and Izumi responds in her
artist pose. The brand heart triggers her matching heart gesture. Izumi is the only desktop
companion. Clicking her requests an action, while dragging starts immediately.
Her direction is chosen when she is picked up and stays fixed in the air, with
dedicated turning and landing animation sequences.

## GitHub Pages

The public homepage targets https://damaolucky.github.io/. Deployment uses `npm run build:pages`, `npm run test:pages`, and `.github/workflows/pages.yml`. See [GITHUB_PAGES.md](./GITHUB_PAGES.md) for deployment and maintenance instructions.

## Local preview

```bash
npm install
npm run dev
```

Open [http://localhost:3000/](http://localhost:3000/). Run `npm run check` before
publishing: it checks lint, TypeScript, the production build, route and preference
behavior, release assets and metadata, lossless pet image fidelity, and the
dependency audit. `npm run assets:optimize` regenerates production images after
editing their PNG sources.

The deployment target is the existing Sites project in `.openai/hosting.json`.
Its current audience is owner-only. Saving a release version does not publish it
or change access. Before switching to a custom domain, update the canonical
origin in `app/layout.tsx`, `public/robots.txt`, and `public/sitemap.xml` together.

Historical Map is the only project shown, using the original compact project layout. The purple design, original pet, X link, and heart-only brand are retained. `/mono` remains a separate comparison route.

## Snowy little hideaway

One text-free snow-and-fireplace scene sits beside Research & projects (below the project on narrow screens). All variant selectors, labels, and instructions are removed. A larger snowy window, a smaller hearth, and a padded lavender cat bed use a soft lavender, cream, and peach palette coordinated with the homepage. The case inherits the page theme colors, and the scene has a matching dark-mode palette. Pixel compositions are original code-native SVG, not generated images.

The cat starts asleep. Clicking the scene wakes it, shows three floating hearts, and returns it to sleep after 3.4 seconds. Repeated clicks restart the cycle; effect cleanup cancels the previous timers and cleans up on unmount. Two snow layers, breathing, occasional ear twitching, blinking, tail movement, and layered fireplace animation respect page Motion and reduced-motion preferences. Click feedback and automatic settling still work with animation off. The sole scene has no variant preference storage. Profile, Historical Map card and Izumi pet remain unchanged.


Historical Map uses the selected layered lavender map illustration. Earlier thumbnail experiments are archived locally outside the published files.
