# Google API data: ourmovingstories.com (LIVE), pulled 9 Nov 2026

Credential tier: 2 (service account claude-seo@adloop-493408.iam.gserviceaccount.com). Despite that, **no Google data exists for this site**: the account is only attached to another client's properties. Nothing was submitted to the Indexing API; no properties or sitemaps were changed.

## Summary table

| Source | Result | Applies to |
|---|---|---|
| Search Console properties | Account sees only `sc-domain:southbankart.co.uk` and `https://www.southbankart.co.uk/` (siteFullUser). Not ourmovingstories.com | LIVE |
| GSC queries/pages (16 mo) | Permission denied for `sc-domain:ourmovingstories.com`, `https://ourmovingstories.com/`, `https://www.ourmovingstories.com/` | LIVE |
| Sitemaps | Not retrievable (no access). LIVE `/sitemap.xml` is a 0-byte 200, so nothing valid could be submitted anyway | LIVE |
| URL Inspection (`/`, `/testimonials`, `/safeguarding-policy`) | Not possible without property access (API returns permission denied against the wrong property) | LIVE |
| CrUX origin and URL level | 404 "insufficient Chrome traffic": no field data | LIVE |
| CrUX History | Same, no data | LIVE |
| GA4 | Configured property `399854207` belongs to **a different site** (landing pages `/products/custom-window-mount`, `/blogs/journal/...`; Shopify-style, matches southbankart). Not this site. Its data was NOT used | n/a |

## Findings

1. **High (process/cutover): Search Console access missing.** Without it there is no query/page data, so the cutover redirect map cannot be built from Google's data. Owner action: in Search Console, add/verify the property **`sc-domain:ourmovingstories.com`** (DNS TXT verification; DNS is on Cloudflare, so this is easy) and under Settings > Users and permissions add `claude-seo@adloop-493408.iam.gserviceaccount.com` as **Full** user (Owner needed only if the Indexing API is to be used). Also enable the Search Console API on that GCP project (already working for the other property). If the owner already has a property under their personal Google account, add the service account there instead, or export Performance > Pages as CSV.
2. **Info: CrUX has no data** for the origin or the 3 URLs. Expected for a tiny site; judge performance from lab tests and from `web/src`. Revisit after LOCAL is live for a few months (CrUX needs sufficient traffic; may stay absent).
3. **High (cutover): No analytics at all** (neither LIVE nor LOCAL has a tag, per brief). No GA4 property for this site could be identified via the service account. Create a GA4 property, add the tag to `web/src/layouts/Layout.astro` (or use Cloudflare Web Analytics), and grant the service account Viewer if reporting is wanted. Do not reuse property 399854207.

## Redirect map (derived from inventory only, since GSC URL list unavailable)

Google-known URLs presumably = LIVE's 3 real pages. All three exist on LOCAL at the same paths, so **no redirects are required for them**: `/` -> `/`, `/testimonials` -> `/testimonials`, `/safeguarding-policy` -> `/safeguarding-policy`. Unknown: any historic URLs (older site versions, Netlify previews, `www.`, `/events`-style paths that LIVE soft-404s) Google may still hold. Once GSC access exists, pull Performance > Pages for 16 months and Pages indexing report to confirm; any URL not in LOCAL's inventory needs a 301 (or a 410). Note LOCAL returns 302 to /404 for unknown URLs; real 404 status is preferable (separate finding, owner: crawl/technical agent).

## Cutover checklist (Google-specific)
- Verify the domain property before cutover so the first crawl of the new site is observable.
- After cutover: submit `https://ourmovingstories.com/sitemap.xml` (LOCAL's lists only 3 pages; should add events/people/sessions), run URL Inspection on the 3 URLs, and request indexing manually in the UI if needed.
- Data freshness notes: CrUX 28-day rolling, GSC 2-3 day lag (16-month retention), GA4 ~1 day lag.

Scores: not scoreable from Google data (LIVE n/a, LOCAL n/a).
