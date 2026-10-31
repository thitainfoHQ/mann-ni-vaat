import { json, MAX_BODY_BYTES, rateLimited, validateReport } from "@/lib/api";
import { getStore } from "@/lib/store";

// A receiver can choose to send us the secret they just opened. We never see a secret otherwise.
export async function POST(req: Request) {
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return json({ error: "Report is too large" }, 413);
  }
  if (await rateLimited(req, "report", 10)) return json({ error: "Too many reports" }, 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid body" }, 400);
  }

  const parsed = validateReport(body);
  if (typeof parsed === "string") return json({ error: parsed }, 400);

  await getStore().addReport({ ...parsed, at: Date.now() });
  return json({ ok: true }, 201);
}
