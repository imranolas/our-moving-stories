/**
 * Fills empty SEO fields (search-result title and meta description) on the site's pages.
 * Copy is from the SEO audit: docs/seo/ourmovingstories.com-audit/findings/content.md.
 *
 * Run from the studio folder, against the *production* dataset only:
 *   SANITY_STUDIO_DATASET=production npx sanity exec scripts/seed-seo.ts --with-user-token
 *
 * Only fills fields that are empty on the published documents, so edits made in Studio are kept and it's
 * safe to re-run.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2024-10-17" });
const { dataset } = client.config();

if (dataset !== "production") {
  console.error(`Refusing to run: this script only writes to the "production" dataset (current: "${dataset}").`);
  process.exit(1);
}

const PAGES: Record<string, { seoTitle?: string; description: string }> = {
  index: {
    seoTitle: "Our Moving Stories: free baby & toddler dance and art, Southall",
    description:
      "Free dance, movement and art sessions for babies, toddlers and their grown-ups in Southall and Acton, West London, plus family events for all ages.",
  },
  testimonials: {
    seoTitle: "What parents say about Move and Make · Our Moving Stories",
    description:
      "Southall parents on Move and Make, our free movement and art sessions for under-5s: “unique to anything else we have participated in locally”.",
  },
  "safeguarding-policy": {
    description:
      "How Our Moving Stories CIC keeps children and adults safe: DBS-checked staff, safe-touch guidance, photo consent and how to reach our safeguarding lead.",
  },
};

async function run() {
  const pages: { _id: string; slug: string; seoTitle?: string; description?: string }[] = await client.fetch(
    `*[_type == "page" && slug.current in $slugs && !(_id in path("drafts.**"))]{ _id, "slug": slug.current, seoTitle, description }`,
    { slugs: Object.keys(PAGES) },
  );

  const tx = client.transaction();
  for (const page of pages) {
    const copy = PAGES[page.slug];
    const set: Record<string, string> = {};
    if (copy.seoTitle && !page.seoTitle?.trim()) set.seoTitle = copy.seoTitle;
    if (!page.description?.trim()) set.description = copy.description;
    if (Object.keys(set).length) {
      tx.patch(page._id, (p) => p.set(set));
      console.log(`${page.slug}: setting ${Object.keys(set).join(", ")}`);
    } else {
      console.log(`${page.slug}: already filled, leaving it`);
    }
  }
  const missing = Object.keys(PAGES).filter((slug) => !pages.some((p) => p.slug === slug));
  if (missing.length) console.warn(`Not found (published): ${missing.join(", ")}`);

  const res = await tx.commit();
  console.log(`Updated ${res.results.length} documents in "${dataset}".`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
