# LifeVault — Collection Studio and Professional Import

This release uses existing GitHub/Cloudflare deployment and adds no subscription, paid AI provider, storage bucket, or billing requirement.

## Create a collection
1. Sign in, open **Collections** and choose **Make a collection**.
2. Enter a title; drag photos directly into the drop zone or click to choose files (up to 12 files, maximum 10 MB each).
3. Add optional place and **month + year**. Turn on "Include the exact day" only if you choose to record it.
4. Write an optional memory and review the full collection in the new three-step studio.
5. Rearrange manually with desktop drag-and-drop. **Smart visual mix** analyzes pixels locally and alternates contrasting photos. **AI story order** is optional and submits **only user-written photo captions and randomized photo IDs** to the existing Cloudflare Workers AI function, after clicking the control. It does not inspect image content or transmit image files.
6. Save the collection.

### Photo storage and sharing
Photographs selected from your device are still stored **on this browser**, not on Cloudflare R2. D1 stores account-owned collection titles, places, dates, and stories; the device-photo cache is keyed to your account ID. Images are not synchronized to another device and **do not appear in shared snapshot links**. A shared page from these new uploads therefore contains the text, not uploaded photographs.

For cloud photo synchronization and shareable galleries later, a protected media API backed by R2 will be required. The new local upload interface does not promise that functionality today. Large photo collections may exceed browser storage quotas.

## Import a résumé
1. Open **Professional → Import résumé**.
2. Drop a searchable PDF, Word DOCX, or text résumé (up to 8 MB; 20 pages maximum for PDF).
3. LifeVault extracts the file in your **browser** and suggests profile, experience, education, certifications, projects, and skills.
4. Review section counts, opt in to the sections you want to import, then edit the resulting entries for accuracy.

An image-only/scanned PDF cannot be parsed without OCR. The local section detector is heuristic, not a semantic AI model. Re-check dates, organizations, and grouping, particularly from multi-column résumés. The original résumé file is not uploaded; only sections you approve are merged into your existing D1-backed account portfolio.

## Certification uploads
Open **Professional → Certifications → Add entry**. Choose a PDF or an image file (up to 6 MB) and enter its title/issuer. The PDF or image is saved in device-local IndexedDB, scoped to your account. Certificate title and basic metadata are synced to D1, but the **binary file remains on this device**. The attachment may be unavailable when opening the account elsewhere.

## AI and costs
- Default photo mixing and résumé extraction run locally with no paid AI calls.
- Opt-in AI suggestions reuse the existing Pages `AI` binding only if that binding is configured and free quota remains. The service returns an explanatory error if it isn't configured; it does not silently purchase usage or enable a paid service.
- No Cloudflare R2 media storage was created and no D1 schema additions were needed for this release.

## Validation
GitHub Actions runs `npm test` for résumé section extraction and `npm run build` for the full React app; separate deployment smoke tests verify the public login endpoint and private homepage redirect. Browser upload/download flows should also be manually tested because headless end-to-end file-upload tests have not been added yet.
