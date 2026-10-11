/**
 * Strips everything private from a page address before it goes to analytics:
 * the #fragment (it holds the decryption key), the query string, and the secret's id.
 */
export function sanitizeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    u.hash = "";
    u.search = "";
    u.pathname = u.pathname.replace(/^\/m\/[^/]+/, "/m/[id]");
    return u.toString();
  } catch {
    // If we can't parse it, send nothing identifying.
    return "";
  }
}
