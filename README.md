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

Holding the primary mouse button for 200 ms on empty page space starts drawing;
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

Open [http://localhost:3000/](http://localhost:3000/). Run `npm test` before
publishing to build the site and verify the final route, content, and
interactions.
