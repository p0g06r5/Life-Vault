# LifeVault

A simple, friendly personal-journey portfolio frontend built with React + Vite. Includes interactive dashboard, editable profile, career/education timeline, projects, achievements, and an entry editor. Local browser storage only; there is **no live login, cloud storage, or backend** in this MVP.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Free Cloudflare Pages deployment

1. Open Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. Select `p0g06r5/Life-Vault`.
3. Choose framework **Vite**, build command **npm run build**, output directory **dist**.
4. Deploy and open the generated `*.pages.dev` URL.

Do not invite real users to upload sensitive documents until proper authentication, backend storage and authorization have been implemented.