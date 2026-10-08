# LifeVault — Your story, in one place

An editorial, architecture-inspired personal archive built in React + Vite. LifeVault is not a social feed or a résumé dashboard. It gives memories, experiences, work, education, and milestones separate rooms in the same personal space.

## Experience

- **Home** — spacious personal introduction, chapter directory and only recently **user-added** items (no automatic promotion of POS Health or projects into a hero card).
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
