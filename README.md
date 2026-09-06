# Hua Zhou · personal homepage

The repository contains one finished research homepage. The canonical route is
`/`; the legacy `/v1` route only redirects to it.

## Content

- `app/content/profile.ts` controls the biography, contact links, news, Misc
  text, and last-updated date.
- `app/content/papers.ts` is the single source of truth for **Selected Work**.
  The array order is the display order.

To add or edit a project, update the `papers` array in
`app/content/papers.ts`. See [`EDITING_GUIDE.md`](./EDITING_GUIDE.md) for a
field-by-field example.

## Final appearance and interactions

The public design uses Round typography, the Lavender Petals background, and
the Classic heart. There is no separate background selector.

The profile opens with the anime portrait. Clicking it smoothly switches to the
painted portrait and back. The first visit opens in Bright mode; visitors can
switch Motion/Still and Bright/Dark preferences, and an explicit Dark choice is
remembered for later visits.

On phones and touch-only devices, Izumi starts hidden. The Pet toggle remembers
an explicit choice; without one, the default follows the screen size and input
device. Hidden pet artwork is not loaded. Mobile layouts keep section navigation
visible, use larger touch targets, and account for screen safe areas.

Holding the primary mouse button for 100 ms on empty page space starts drawing;
the completed lavender line fades after two seconds and Izumi responds in her
artist pose. The brand heart triggers her matching heart gesture. Izumi is the only desktop
companion. Clicking her requests an action, while dragging starts immediately.
Her direction is chosen when she is picked up and stays fixed in the air, with
dedicated turning and landing animation sequences.

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
