/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

declare namespace App {
  interface Locals {
    /** Set in draft mode (src/middleware.ts); pass it to every loadQuery call. */
    preview?: import("./sanity/lib/draft-mode").Preview;
    /** Per-request caches; see src/lib/data.ts. */
    siteData?: Promise<import("./lib/data").SiteData>;
    events?: Promise<import("./lib/schedule").Event[]>;
  }
}

/** Alpine ships no types. */
declare module "alpinejs";

/** Alpine's morph plugin ships no types; preview-refresh.ts types the part it uses. */
declare module "@alpinejs/morph";
