// Web Push implementation using Web Crypto API (RFC 8291 + RFC 8188)

function base64urlToBytes(s: string): Uint8Array {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(s.length + ((4 - (s.length % 4)) % 4), '=');
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

function bytesToBase64url(b: Uint8Array): string {
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) { out.set(a, offset); offset += a.length; }
  return out;
}

const enc = new TextEncoder();

// Import VAPID private key (stored as base64url of raw d parameter)
async function importVapidPrivate(dB64u: string, pubB64u: string): Promise<CryptoKey> {
  const pub = base64urlToBytes(pubB64u); // 65 bytes: 0x04 || x (32) || y (32)
  const x = bytesToBase64url(pub.slice(1, 33));
  const y = bytesToBase64url(pub.slice(33, 65));
  return crypto.subtle.importKey(
    'jwk',
    { kty: 'EC', crv: 'P-256', d: dB64u, x, y },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );
}

function base64urlEncodeStr(s: string): string {
  return bytesToBase64url(enc.encode(s));
}

// Creates a VAPID JWT for authenticating push requests
export async function createVapidAuthHeader(
  endpoint: string,
  vapidPublicB64u: string,
  vapidPrivateB64u: string,
  subject: string,
): Promise<string> {
  const privateKey = await importVapidPrivate(vapidPrivateB64u, vapidPublicB64u);
  const origin = new URL(endpoint).origin;
  const now = Math.floor(Date.now() / 1000);

  const header = base64urlEncodeStr(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const claims = base64urlEncodeStr(JSON.stringify({ aud: origin, exp: now + 43200, sub: subject }));
  const sigInput = `${header}.${claims}`;

  const sig = new Uint8Array(
    await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, enc.encode(sigInput)),
  );

  return `vapid t=${sigInput}.${bytesToBase64url(sig)},k=${vapidPublicB64u}`;
}

// Derive CEK and nonce per RFC 8291
async function deriveKeys(
  ecdhSecret: ArrayBuffer,
  authSecret: Uint8Array,
  uaPublic: Uint8Array,
  asPublic: Uint8Array,
  salt: Uint8Array,
): Promise<{ cek: Uint8Array; nonce: Uint8Array }> {
  const keyInfo = concat(enc.encode('WebPush: info\x00'), uaPublic, asPublic);

  const ikmRaw = await crypto.subtle.importKey('raw', ecdhSecret, 'HKDF', false, ['deriveBits']);
  const ikm = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt: authSecret, info: keyInfo },
      ikmRaw, 256,
    ),
  );

  const ikmKey = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);

  const cek = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt, info: enc.encode('Content-Encoding: aes128gcm\x00') },
      ikmKey, 128,
    ),
  );
  const nonce = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt, info: enc.encode('Content-Encoding: nonce\x00') },
      ikmKey, 96,
    ),
  );

  return { cek, nonce };
}

// Encrypt payload per RFC 8188 (aes128gcm)
async function encryptPayload(
  message: string,
  p256dhB64u: string,
  authB64u: string,
): Promise<Uint8Array> {
  const uaPublic = base64urlToBytes(p256dhB64u);
  const authSecret = base64urlToBytes(authB64u);

  const ephemeral = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'],
  ) as CryptoKeyPair;
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', ephemeral.publicKey) as ArrayBuffer);

  const uaKey = await crypto.subtle.importKey(
    'raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, [],
  );
  const ecdhSecret = await crypto.subtle.deriveBits(
    { name: 'ECDH', $public: uaKey }, ephemeral.privateKey, 256,
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const { cek, nonce } = await deriveKeys(ecdhSecret, authSecret, uaPublic, asPublic, salt);

  const cekKey = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt']);
  const plaintext = concat(enc.encode(message), new Uint8Array([0x02]));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, cekKey, plaintext),
  );

  // RFC 8188 header: salt (16) + rs (4 big-endian) + idlen (1) + asPublic (65)
  const header = new Uint8Array(86);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, 4096, false);
  header[20] = 65;
  header.set(asPublic, 21);

  return concat(header, ciphertext);
}

export interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendWebPush(
  sub: PushSubscription,
  payload: { title: string; body: string; url?: string },
  vapidPublicB64u: string,
  vapidPrivateB64u: string,
  subject: string,
): Promise<void> {
  const body = await encryptPayload(JSON.stringify(payload), sub.p256dh, sub.auth);
  const authHeader = await createVapidAuthHeader(sub.endpoint, vapidPublicB64u, vapidPrivateB64u, subject);

  const res = await fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      TTL: '86400',
    },
    body,
  });

  if (!res.ok && res.status !== 201) {
    throw new PushSubscriptionError(`push failed: ${res.status}`, res.status);
  }
}

// Custom error that carries the HTTP status for cleanup logic
export class PushSubscriptionError extends Error {
  public readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'PushSubscriptionError';
    this.status = status;
  }
}
