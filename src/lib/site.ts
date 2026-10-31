// Absolute address of the site, for link previews, canonical URLs and the sitemap.
// Set NEXT_PUBLIC_SITE_URL once the real domain is live.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
