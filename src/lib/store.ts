import { Redis } from "@upstash/redis";

export const TTL_SECONDS = 7 * 24 * 60 * 60;

export type Meta = { hasPassphrase: boolean; salt?: string; hint?: string };

export interface Store {
  put(id: string, ct: string, meta: Meta): Promise<void>;
  getMeta(id: string): Promise<Meta | null>;
  /** Atomically returns the ciphertext and deletes everything for this id. */
  take(id: string): Promise<string | null>;
  /** Increments a counter that expires after `windowSeconds`; returns the new count. */
  hit(key: string, windowSeconds: number): Promise<number>;
}

class MemoryStore implements Store {
  private msgs = new Map<string, { ct: string; exp: number }>();
  private metas = new Map<string, { meta: Meta; exp: number }>();
  private hits = new Map<string, { n: number; exp: number }>();

  async put(id: string, ct: string, meta: Meta) {
    const exp = Date.now() + TTL_SECONDS * 1000;
    this.msgs.set(id, { ct, exp });
    this.metas.set(id, { meta, exp });
  }
  async getMeta(id: string) {
    const m = this.metas.get(id);
    if (!m || m.exp < Date.now()) return null;
    return m.meta;
  }
  async take(id: string) {
    const m = this.msgs.get(id);
    this.msgs.delete(id);
    this.metas.delete(id);
    return m && m.exp >= Date.now() ? m.ct : null;
  }
  async hit(key: string, windowSeconds: number) {
    const now = Date.now();
    const h = this.hits.get(key);
    if (!h || h.exp < now) {
      this.hits.set(key, { n: 1, exp: now + windowSeconds * 1000 });
      return 1;
    }
    return ++h.n;
  }
}

class UpstashStore implements Store {
  constructor(private redis: Redis) {}

  async put(id: string, ct: string, meta: Meta) {
    await Promise.all([
      this.redis.set(`msg:${id}`, ct, { ex: TTL_SECONDS }),
      this.redis.set(`meta:${id}`, JSON.stringify(meta), { ex: TTL_SECONDS }),
    ]);
  }
  async getMeta(id: string) {
    const raw = await this.redis.get<string | Meta>(`meta:${id}`);
    if (!raw) return null;
    return typeof raw === "string" ? (JSON.parse(raw) as Meta) : raw;
  }
  async take(id: string) {
    const ct = await this.redis.getdel<string>(`msg:${id}`);
    await this.redis.del(`meta:${id}`);
    return ct ?? null;
  }
  async hit(key: string, windowSeconds: number) {
    const k = `rl:${key}`;
    const n = await this.redis.incr(k);
    if (n === 1) await this.redis.expire(k, windowSeconds);
    return n;
  }
}

const g = globalThis as unknown as { __store?: Store };

export function getStore(): Store {
  if (g.__store) return g.__store;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (url && token) {
    g.__store = new UpstashStore(new Redis({ url, token }));
  } else {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Redis is not configured (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)");
    }
    g.__store = new MemoryStore();
  }
  return g.__store;
}

/** Test helper. */
export function __setStore(s: Store | undefined) {
  g.__store = s;
}
export { MemoryStore };
