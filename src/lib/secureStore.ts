// IndexedDB store para o device_secret cifrado em AES-GCM.
// PROJETO §7.1. Salt fica em claro (apenas anti-rainbow-table).
// Chave é derivada da senha do cofre via PBKDF2 — nunca persistida.

import { openDB, type IDBPDatabase } from 'idb';
import { deriveVaultKey, randomBytes, sealString, openString, type SealedBlob, cryptoUtils } from './crypto';

const DB_NAME = 'tc-secure';
const DB_VERSION = 1;
const STORE = 'meta';

interface MetaShape {
  // Identidade do dispositivo (em claro — não é segredo)
  device_id?: string;
  user_tag?: string;
  endpoint?: string;
  label?: string;

  // Salt do PBKDF2 (em claro — necessário para derivar a chave)
  kdf_salt?: string;        // base64, 16 bytes

  // device_secret cifrado por AES-GCM(vault_key)
  secret_blob?: SealedBlob;

  // Bypass: device_secret em claro (presente apenas quando requirePassword=false)
  secret_plain?: string;

  // ID da credencial WebAuthn para biometria (base64)
  webauthn_credential_id?: string;
}

// ─── Auth prefs (localStorage, não IDB) ──────────────────────────────────────

export interface AuthPrefs {
  requirePassword: boolean;
  useBiometric: boolean;
}

const AUTH_PREFS_KEY = 'tc_auth_prefs';
const DEFAULT_PREFS: AuthPrefs = { requirePassword: false, useBiometric: false };

export function loadAuthPrefs(): AuthPrefs {
  try {
    const raw = localStorage.getItem(AUTH_PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const p = JSON.parse(raw) as Partial<AuthPrefs>;
    return {
      requirePassword: p.requirePassword ?? true,
      useBiometric: p.useBiometric ?? false,
    };
  } catch {
    return { requirePassword: true, useBiometric: false };
  }
}

export function saveAuthPrefs(prefs: AuthPrefs): void {
  localStorage.setItem(AUTH_PREFS_KEY, JSON.stringify(prefs));
}

function dbPromise(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    },
  });
}

async function readMeta(): Promise<MetaShape> {
  const db = await dbPromise();
  const value = (await db.get(STORE, 'meta')) as MetaShape | undefined;
  return value ?? {};
}

async function writeMeta(meta: MetaShape): Promise<void> {
  const db = await dbPromise();
  await db.put(STORE, meta, 'meta');
}

async function clearMeta(): Promise<void> {
  const db = await dbPromise();
  await db.delete(STORE, 'meta');
}

// === Criação inicial: tem device_id mas ainda não veio do servidor ===
export async function persistSession(args: {
  password: string;
  endpoint: string;
  device_id: string;
  device_secret: string;
  user_tag: string;
  label: string;
}): Promise<void> {
  const salt = randomBytes(16);
  const key = await deriveVaultKey(args.password, salt);
  const secret_blob = await sealString(key, args.device_secret);
  await writeMeta({
    endpoint: args.endpoint,
    device_id: args.device_id,
    user_tag: args.user_tag,
    label: args.label,
    kdf_salt: cryptoUtils.bytesToBase64(salt),
    secret_blob,
  });
}

// === Leitura: requer a senha do cofre para abrir o secret ===
export interface UnlockedSession {
  endpoint: string;
  device_id: string;
  device_secret: string;
  user_tag: string;
  label: string;
}

export async function unlockSession(password: string): Promise<UnlockedSession | null> {
  const meta = await readMeta();
  if (!meta.endpoint || !meta.device_id || !meta.kdf_salt || !meta.secret_blob || !meta.user_tag) {
    return null;
  }
  const salt = cryptoUtils.base64ToBytes(meta.kdf_salt);
  const key = await deriveVaultKey(password, salt);
  let device_secret: string;
  try {
    device_secret = await openString(key, meta.secret_blob);
  } catch {
    return null; // senha errada
  }
  return {
    endpoint: meta.endpoint,
    device_id: meta.device_id,
    user_tag: meta.user_tag,
    label: meta.label ?? '',
    device_secret,
  };
}

// === Status público (sem senha): há sessão guardada? ===
export interface SessionStatus {
  hasSession: boolean;
  endpoint?: string;
  device_id?: string;
  user_tag?: string;
  label?: string;
}

export async function readSessionStatus(): Promise<SessionStatus> {
  const meta = await readMeta();
  return {
    hasSession: !!(meta.device_id && meta.secret_blob),
    endpoint: meta.endpoint,
    device_id: meta.device_id,
    user_tag: meta.user_tag,
    label: meta.label,
  };
}

export async function purgeSession(): Promise<void> {
  await clearMeta();
}

// Atualiza apenas endpoint (caso o usuário troque o Worker URL).
export async function updateEndpoint(endpoint: string): Promise<void> {
  const meta = await readMeta();
  await writeMeta({ ...meta, endpoint });
}

// ─── Bypass de senha (requirePassword = false) ────────────────────────────────

// Persiste device_secret em claro (chamado ao desativar requirePassword).
export async function storeSecretPlain(deviceSecret: string): Promise<void> {
  const meta = await readMeta();
  await writeMeta({ ...meta, secret_plain: deviceSecret });
}

// Remove o secret em claro (chamado ao reativar requirePassword).
export async function clearSecretPlain(): Promise<void> {
  const meta = await readMeta();
  const next = { ...meta };
  delete next.secret_plain;
  delete next.webauthn_credential_id;
  await writeMeta(next);
}

// Destrava sessão sem senha (requer secret_plain presente).
export async function unlockSessionBypass(): Promise<UnlockedSession | null> {
  const meta = await readMeta();
  if (!meta.endpoint || !meta.device_id || !meta.user_tag || !meta.secret_plain) {
    return null;
  }
  return {
    endpoint: meta.endpoint,
    device_id: meta.device_id,
    user_tag: meta.user_tag,
    label: meta.label ?? '',
    device_secret: meta.secret_plain,
  };
}

// ─── WebAuthn (biometria) ─────────────────────────────────────────────────────

export async function storeWebAuthnCredentialId(id: string): Promise<void> {
  const meta = await readMeta();
  await writeMeta({ ...meta, webauthn_credential_id: id });
}

export async function getWebAuthnCredentialId(): Promise<string | null> {
  const meta = await readMeta();
  return meta.webauthn_credential_id ?? null;
}

export async function clearWebAuthnCredentialId(): Promise<void> {
  const meta = await readMeta();
  const next = { ...meta };
  delete next.webauthn_credential_id;
  await writeMeta(next);
}
