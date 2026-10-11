import { ID_RE, json, rateLimited } from "@/lib/api";
import { getStore } from "@/lib/store";

// Does NOT burn the message, so link-preview bots that call this are harmless.
// Limits are generous on purpose: many phones share one carrier IP.
export async function GET(req: Request, ctx: RouteContext<"/api/meta/[id]">) {
  const { id } = await ctx.params;
  if (!ID_RE.test(id)) return json({ exists: false }, 404);
  if (await rateLimited(req, "meta", 300)) return json({ error: "Too many requests" }, 429);
  const meta = await getStore().getMeta(id);
  if (!meta) return json({ exists: false }, 404);
  return json({ exists: true, ...meta });
}
