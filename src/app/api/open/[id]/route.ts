import { ID_RE, json, rateLimited } from "@/lib/api";
import { getStore } from "@/lib/store";

// POST on purpose: crawlers and link previews issue GETs, so they can never burn a message.
export async function POST(req: Request, ctx: RouteContext<"/api/open/[id]">) {
  const { id } = await ctx.params;
  if (!ID_RE.test(id)) return json({ gone: true }, 404);
  if (await rateLimited(req, "open", 120)) return json({ error: "Too many requests" }, 429);
  const ct = await getStore().take(id);
  if (!ct) return json({ gone: true }, 404);
  return json({ ct });
}
