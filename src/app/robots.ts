import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Secret links and the sender's own list are private; the API is not for search engines.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/m/", "/mine", "/api/"] }],
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
