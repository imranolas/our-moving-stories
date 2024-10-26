import { loadQuery } from "../sanity/lib/load-query";
import type { SanityDocument } from "@sanity/client";

export async function GET() {
  const { data: pages } = await loadQuery<SanityDocument[]>({
    query: `*[_type == "page"] {
      slug,
      _updatedAt
    }`,
  });

  const siteUrl = "https://ourmovingstories.com";

  const result = `  
<?xml version="1.0" encoding="UTF-8"?>  
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">  
  ${pages
    .map((page) => {
      const slug = page.slug.current === "index" ? "" : page.slug.current;
      return `<url><loc>${siteUrl}/${slug}</loc><lastmod>${page._updatedAt}</lastmod></url>`;
    })
    .join("\n")}  
</urlset>  
  `.trim();

  return new Response(result, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
