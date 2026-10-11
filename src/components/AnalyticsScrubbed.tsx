"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { sanitizeUrl } from "@/lib/analytics";

// A client component, because the beforeSend functions can't be passed down from a server layout.
// Both tools report page addresses, so both get the same scrub: no #key, no query, no secret id.
export default function AnalyticsScrubbed() {
  return (
    <>
      <Analytics beforeSend={(event) => ({ ...event, url: sanitizeUrl(event.url) })} />
      <SpeedInsights beforeSend={(event) => ({ ...event, url: sanitizeUrl(event.url) })} />
    </>
  );
}
