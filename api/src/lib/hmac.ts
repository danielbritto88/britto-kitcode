// HMAC-SHA256 helpers via Web Crypto (Cloudflare Workers nativo).
// PROJETO §7 — assinatura por request: METHOD\nPATH\nUNIX_TS\nSHA256(body).

const enc = new TextEncoder();

function hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(s: string): Uint8Array {
  if (s.length % 2 !== 0) throw new Error('invalid hex');
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function importHmacKey(secretHex: string): Promise<CryptoKey> {
  const raw = hexToBytes(secretHex);
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function sha256Hex(input: ArrayBuffer | string): Promise<string> {
  const buf = typeof input === 'string' ? enc.encode(input) : new Uint8Array(input);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return hex(digest);
}

export async function hmacSignHex(secretHex: string, message: string): Promise<string> {
  const key = await importHmacKey(secretHex);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return hex(sig);
}

// Constant-time comparison that does not leak length.
// Both strings are hashed first, then the fixed-length hashes are compared.
export async function constantTimeEqual(a: string, b: string): Promise<boolean> {
  const ha = await crypto.subtle.digest('SHA-256', enc.encode(a));
  const hb = await crypto.subtle.digest('SHA-256', enc.encode(b));
  const aBytes = new Uint8Array(ha);
  const bBytes = new Uint8Array(hb);
  let result = 0;
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i];
  }
  return result === 0;
}

// Mensagem canônica que cliente e servidor devem assinar/verificar.
export function buildSignaturePayload(
  method: string,
  path: string,
  unixTs: number,
  bodyHashHex: string,
): string {
  return `${method.toUpperCase()}\n${path}\n${unixTs}\n${bodyHashHex}`;
}

export function generateRandomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const TS_DRIFT_SECONDS = 60;
