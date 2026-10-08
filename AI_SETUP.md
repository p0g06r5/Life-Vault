# Free AI setup for LifeVault

LifeVault includes **optional, click-to-use AI writing suggestions**. No chatbot, paid API key, R2 bucket, database, Vectorize subscription, or credit card is required for the implementation.

## What is implemented

- Collections: suggest a title, improve a story, and suggest chapter headings from **text and captions provided by the user**.
- My Space memory editor: suggest improved prose and topical tags.
- Professional: polish a profile summary, project description, or experience description.
- Every suggestion is shown for review. The original text is only replaced if the user clicks **Use suggestion**.
- Original text remains in the browser; the selected source text is sent to Cloudflare only when the user clicks the AI button.
- Free-tier exhaustion or missing setup is handled with an error rather than a paid fallback.

**Not included:** image understanding, face recognition, automatic photo clustering, cloud image uploads, semantic vector search, or a public authenticated portfolio. Those require additional infrastructure and consent decisions. Local collection photo uploads remain local and cannot appear in share links.

## Required one-time Cloudflare configuration

1. Open the Cloudflare dashboard and select **Workers & Pages → your LifeVault Pages project**.
2. In **Settings → Functions**, add a **Workers AI binding** named exactly `AI`. Deploy again after adding the binding. (The exact dashboard navigation may change.)
3. Confirm that Pages Functions are enabled and that the deployment includes `functions/api/assist.js`.
4. Visit Collections → Create/Edit → enter some text → click **Suggest a better story**.
5. If the binding is missing, the UI will explain what to configure. No content is modified.

Workers AI free usage is limited by Cloudflare's current free allocation. Do not enable a paid Workers plan or add paid AI Gateway credits if you want to remain on free usage.

## Security and privacy limitations

This prototype uses browser localStorage and does not have user authentication. The `/api/assist` endpoint is public after deployment, and someone could invoke it outside the UI, consuming your free quota. Before a public launch, add bot protection, authentication, and rate limits. Do not send secrets, private identity documents, or other sensitive records to AI. For personal photos, no image data is sent to the AI service.

This endpoint enforces input length and output limits and does not use a paid-provider fallback, but **free usage limits are not a guarantee of future $0 costs** if the Cloudflare account is later upgraded or billing settings change. Review the current Cloudflare billing and usage settings before deployment.
