"use client";

import { Analytics } from "@vercel/analytics/next";
import { sanitizeUrl } from "@/lib/analytics";

// A client component, because the beforeSend function can't be passed down from a server layout.
export default function AnalyticsScrubbed() {
  return <Analytics beforeSend={(event) => ({ ...event, url: sanitizeUrl(event.url) })} />;
}
