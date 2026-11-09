/** The deployed Sanity Studio (click-to-edit links from draft-mode pages open here). */
export const STUDIO_URL = "https://ourmovingstories.sanity.studio";

/**
 * Where the Studio runs: deployed, plus `sanity dev` when developing locally. Only these may frame the site
 * (middleware.ts) or send draft-mode pages live edits (components/live-text.ts).
 */
export const STUDIO_ORIGINS = [STUDIO_URL, ...(import.meta.env.DEV ? ["http://localhost:3333"] : [])];
