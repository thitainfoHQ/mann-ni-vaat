import { ID_RE, json } from "@/lib/api";
import { getStore } from "@/lib/store";

// Does NOT burn the message, so link-preview bots that call this are harmless.
export async function GET(_req: Request, ctx: RouteContext<"/api/meta/[id]">) {
  const { id } = await ctx.params;
  if (!ID_RE.test(id)) return json({ exists: false }, 404);
  const meta = await getStore().getMeta(id);
  if (!meta) return json({ exists: false }, 404);
  return json({ exists: true, ...meta });
}
