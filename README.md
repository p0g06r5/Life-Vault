# LifeVault — Your story, in one place

An editorial, architecture-inspired personal archive built in React + Vite. LifeVault is not a social feed or a résumé dashboard. It gives memories, experiences, work, education, and milestones separate rooms in the same personal space.

## Experience

- **Home** — spacious personal introduction, chapter directory and personal moments and collections rather than default work examples.
- **Timeline** — chronological year-grouped chapters.
- **Archive** — full-text browser search, category filters, and deep links.
- **Experience** — each organization opens to its own page; projects can link to their related experience.
- **Projects** — organized by the experience they belong to, or as independent work.
- **Achievements** and **Education** — independent categories and detail views.
- **Moments** — personal notes, memories, milestones with optional dates.
- **My Vault** — explicitly marks secure upload as a future capability; offers local JSON backup and restore.

All entry categories can be created, edited, and deleted. Profile introduction is editable. Universal capture defaults to a moment, with additional categories revealed on demand. On mobile, bottom navigation makes Home, Timeline, Archive and Add thumb-friendly. Dark theme and reduced-motion preferences are supported.

## Start locally

```sh
npm install
npm run dev
```

Build with `npm run build`.

## Deploy on Cloudflare Pages

| Field | Value |
|---|---|
| Git repository | `p0g06r5/Life-Vault` |
| Production branch | `main` |
| Framework | Vite |
| Build command | `npm run build` |
| Output folder | `dist` |
| Root | `/` |

The `public/_redirects` fallback enables client-side routes on Pages. GitHub Actions checks the production build after pushes.

## Browser-only prototype and privacy

**LifeVault is not a production-secure document vault yet.** There is no account authentication, access control, cloud storage, backend encryption, or multi-device synchronization. Profile entries are stored in `localStorage` on this device. The **Public/Private** field is only a display label; **Preview** merely hides marked-private entries in the UI. Do not put sensitive information, identity documents, or confidential files into the app.

For migration, existing `lifevault-v2` records are retained and earlier `lifevault-items` records are converted where possible. The expanded model adds a `memories` array without removing existing categories. Export a backup under **My Vault** before clearing site data or switching browsers.

## Creative direction

Warm ivory / charcoal, muted evergreen accent, editorial display serif with legible UI sans, restrained lines instead of dashboard cards, page-like detail views, context-preserving categories, subtle interaction feedback, accessible keyboard focus, and mobile-first navigation.

## Collections & page-specific sharing (prototype)

Choose **Collections → Make a collection** to create a page for a trip, visit, event, or personal story. Each collection can contain a title, date, location, story and up to 12 photos. In the collection page:

- **Share this page** opens the mobile share sheet where supported, or copies the URL.
- **See friend's view** opens the same standalone `/share#...` page that someone receiving the link sees.
- That share page intentionally has no navigation into the sender's profile, other collections, or vault.
- Only the selected collection's title, place, date, text and **public HTTPS photo URLs** are included in the snapshot link.
- Photos added directly from a device are compressed and stored **locally in the creator's browser**. They appear locally but are **not included** in share links. To make photos shareable, use publicly hosted HTTPS URLs until a secure upload backend is built.
- Links contain the page snapshot encoded into the URL fragment; anyone with the URL can view it. **No account permissions, expiration, revocation, passwords, or real access controls** are implemented. The snapshot does not update if the creator edits the collection. Do not put secrets or sensitive documents in snapshots.
- Browser localStorage has size limits; large photo collections can fill it. The editor reports storage failures.

The `/share` route renders **only** the share viewer, bypassing the normal app completely. `/collections` and `/collections/:id` are browser-local editing pages. Existing `lifevault-v2` entries remain unchanged; collections use a separate `lifevault-collections-v1` key.

The next production milestone is authenticated, encrypted-at-rest cloud photo storage and server-side per-collection access controls, so uploaded photos can actually travel with shared pages.

## Neutral first-use experience

New visitors begin with an empty personal space, without any hardcoded employer, employee name or POS project. The data loader strips only the exact untouched legacy demonstration records from older browser storage while retaining edited entries and other saved content. Collections are stored separately and are unchanged.
