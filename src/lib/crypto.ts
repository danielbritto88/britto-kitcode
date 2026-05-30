// Helpers de WebCrypto para Telemetria Íntima v1.5.
// PROJETO §7/§7.1 — PBKDF2-SHA256 (600k iters) + AES-GCM 256.

const enc = new TextEncoder();
const dec = new TextDecoder();

const PBKDF2_ITERATIONS = 600_000;
const AES_KEY_LENGTH = 256;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error('hex inválido');
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export function randomBytes(n: number): Uint8Array {
  const buf = new Uint8Array(n);
  crypto.getRandomValues(buf);
  return buf;
}

export function randomHex(n: number): string {
  return bytesToHex(randomBytes(n));
}

// === PBKDF2 — deriva chave AES-GCM da senha do cofre + salt ===
export async function deriveVaultKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: AES_KEY_LENGTH },
    false, // não exportável
    ['encrypt', 'decrypt'],
  );
}

// === AES-GCM — sela payload em string base64 ===
export interface SealedBlob {
  iv: string;     // base64
  data: string;   // base64 ciphertext+tag
}

export async function sealString(key: CryptoKey, plaintext: string): Promise<SealedBlob> {
  const iv = randomBytes(12);
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    enc.encode(plaintext),
  );
  return { iv: bytesToBase64(iv), data: bytesToBase64(new Uint8Array(ct)) };
}

export async function openString(key: CryptoKey, blob: SealedBlob): Promise<string> {
  const iv = base64ToBytes(blob.iv);
  const ct = base64ToBytes(blob.data);
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    ct as BufferSource,
  );
  return dec.decode(pt);
}

// === HMAC-SHA256 — usado para assinar requests ao Worker ===
export async function hmacSignHex(secretHex: string, message: string): Promise<string> {
  const raw = hexToBytes(secretHex);
  const key = await crypto.subtle.importKey(
    'raw',
    raw as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return bytesToHex(new Uint8Array(sig));
}

export async function sha256Hex(input: ArrayBuffer | string): Promise<string> {
  const buf = typeof input === 'string' ? enc.encode(input) : new Uint8Array(input);
  const digest = await crypto.subtle.digest('SHA-256', buf as BufferSource);
  return bytesToHex(new Uint8Array(digest));
}

export const cryptoUtils = { bytesToBase64, base64ToBytes, bytesToHex, hexToBytes };
