import { ID_RE, json, rateLimited } from "@/lib/api";
import { getStore } from "@/lib/store";

// POST on purpose: crawlers and link previews issue GETs, so they can never burn a message.
export async function POST(req: Request, ctx: RouteContext<"/api/open/[id]">) {
  const { id } = await ctx.params;
  if (!ID_RE.test(id)) return json({ gone: true }, 404);
  if (await rateLimited(req, "open", 120)) return json({ error: "Too many requests" }, 429);
  const store = getStore();
  // A scheduled secret stays locked (and is not burned) until its time.
  const meta = await store.getMeta(id);
  if (meta?.opensAt && meta.opensAt > Date.now()) {
    return json({ tooEarly: true, opensAt: meta.opensAt, now: Date.now() }, 425);
  }
  const ct = await store.take(id);
  if (!ct) return json({ gone: true }, 404);
  return json({ ct });
}
