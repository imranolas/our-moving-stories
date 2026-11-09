/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

declare namespace App {
  interface Locals {
    /** Set in draft mode (src/middleware.ts); pass it to every loadQuery call. */
    preview?: import("./sanity/lib/draft-mode").Preview;
  }
}

/** Alpine's morph plugin ships no types; preview-refresh.ts types the part it uses. */
declare module "@alpinejs/morph";
