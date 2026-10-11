import { clientIp, json, newId, validateCreate } from "@/lib/api";
import { getStore } from "@/lib/store";

const LIMIT_PER_HOUR = 30;

export async function POST(req: Request) {
  const store = getStore();

  if ((await store.hit(`create:${clientIp(req)}`, 3600)) > LIMIT_PER_HOUR) {
    return json({ error: "Too many secrets from your network. Try again later." }, 429);
  }

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
