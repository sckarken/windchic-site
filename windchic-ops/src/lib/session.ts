// Session signée HMAC-SHA256 (Web Crypto : fonctionne dans le middleware et côté serveur).
export type Session = { uid: string; name: string; role: "ADMIN" | "PM" | "PARTNER"; exp: number };
export const COOKIE = "wc_session";

const enc = new TextEncoder();
// base64url sans Buffer (compatible runtime Edge du middleware)
function b64u(buf: ArrayBuffer | Uint8Array) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64u(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) throw new Error("SESSION_SECRET manquant (16 caractères minimum)");
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function sign(s: Session) {
  const body = b64u(enc.encode(JSON.stringify(s)));
  const sig = await crypto.subtle.sign("HMAC", await key(), enc.encode(body));
  return `${body}.${b64u(sig)}`;
}

export async function verify(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const ok = await crypto.subtle.verify("HMAC", await key(), fromB64u(sig), enc.encode(body));
  if (!ok) return null;
  const s = JSON.parse(new TextDecoder().decode(fromB64u(body))) as Session;
  return s.exp > Date.now() ? s : null;
}
