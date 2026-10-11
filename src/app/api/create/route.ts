import { json, MAX_BODY_BYTES, newId, rateLimited, validateCreate } from "@/lib/api";
import { getStore } from "@/lib/store";

export async function POST(req: Request) {
  // Refuse oversized bodies before reading them. (A missing header is still caught by validateCreate.)
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return json({ error: "Message is too large" }, 413);
  }
  if (await rateLimited(req, "create", 30)) {
    return json({ error: "Too many secrets from your network. Try again later." }, 429);
  }
  const store = getStore();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid body" }, 400);
  }

  const parsed = validateCreate(body);
  if (typeof parsed === "string") return json({ error: parsed }, 400);

  const id = newId();
  await store.put(id, parsed.ct, {
    hasPassphrase: !!parsed.salt,
    ...(parsed.salt ? { salt: parsed.salt } : {}),
    ...(parsed.hint ? { hint: parsed.hint } : {}),
  });
  return json({ id }, 201);
}
