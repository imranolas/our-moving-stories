import { sanityClient } from "sanity:client";
import { createImageUrlBuilder } from "@sanity/image-url";

const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}

/**
 * `src` and `srcset` for a Sanity image cropped to `ratio` (width ÷ height), one candidate per width, in
 * AVIF/WebP where the browser takes them. Spread onto an <img> and add `sizes`; `src` is the widest.
 */
export function srcset(source: Parameters<typeof builder.image>[0], ratio: number, widths: number[]) {
  const url = (w: number) => urlFor(source).width(w).height(Math.round(w / ratio)).fit("crop").auto("format").url();
  return { src: url(widths[widths.length - 1]), srcset: widths.map((w) => `${url(w)} ${w}w`).join(", ") };
}

/** Pixel size of a Sanity image from its asset id ("image-<hash>-600x400-png"), or undefined. */
export function imageSize(source: { asset?: { _ref?: string; _id?: string } } | undefined) {
  const m = /-(\d+)x(\d+)-/.exec(source?.asset?._ref ?? source?.asset?._id ?? "");
  return m ? { width: Number(m[1]), height: Number(m[2]) } : undefined;
}
