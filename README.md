# LifeVault

LifeVault is a simple, spacious, **multi-page** personal portfolio prototype. It is designed to tell a person's story without becoming a social feed or a one-page résumé.

## Pages

- **Home** — an introduction and links to the dedicated sections; no individual project is featured by default.
- **Experience** — each organization has its own page.
- **Experience → Projects** — related projects are linked to the organization that owns the work. For example, POS Device Health is nested under Walmart Global Tech.
- **Projects** — organized by associated experience, with a separate group for independent projects.
- **Achievements** — recognition and milestones, never conflated with ordinary projects.
- **Education** — separate education entries.
- **My Vault** — explains the planned secure document storage; no file uploads are enabled yet.

This is currently a browser-only demo. Changes persist in **localStorage on that browser**. There is no live login, real user account, verified access control, or secure private document storage. Do not enter sensitive personal documents.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm install
npm run build
```

The stylesheet is `src/redesign.css` and application data helpers are in `src/data.js`. Both are required for the build.

## Cloudflare Pages (free)

This repository is connected to Cloudflare Pages through GitHub. Configure:

| Setting | Value |
|---|---|
| Git repository | `p0g06r5/Life-Vault` |
| Production branch | `main` |
| Framework preset | `Vite` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

If a Cloudflare build says it cannot find `src/redesign.css`, inspect the **commit SHA** on that build: the stylesheet exists in the current `main` branch. Rebuilding an *old deployment* retries the old commit rather than fetching the latest changes. Trigger a **new** deployment from the latest `main` commit instead.

This repository also runs a GitHub Actions build on pushes to `main` to catch compilation errors before deployment.
