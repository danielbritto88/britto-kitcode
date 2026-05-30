// signedFetch — wrapper de fetch que injeta header HMAC para o Worker.
// PROJETO §7. Mensagem assinada: METHOD\nPATH\nUNIX_TS\nSHA256(body).

import { hmacSignHex, sha256Hex } from './crypto';

export interface SigningContext {
  endpoint: string;        // ex: https://tanquecheio-api.danielbritto88.workers.dev
  device_id: string;
  device_secret: string;   // hex
}

// Converte BodyInit em ArrayBuffer determinístico para o hash.
async function bodyToArrayBuffer(body: BodyInit | null | undefined): Promise<ArrayBuffer> {
  if (body == null) return new ArrayBuffer(0);
  if (body instanceof ArrayBuffer) return body;
  if (ArrayBuffer.isView(body)) {
    const view = body as ArrayBufferView;
    return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength) as ArrayBuffer;
  }
  if (body instanceof Blob) return body.arrayBuffer();
  if (body instanceof FormData) {
    // Serialize FormData via Response to get the exact multipart bytes
    // the browser will send. This ensures the HMAC covers the full body.
    return new Response(body).arrayBuffer();
  }
  if (typeof body === 'string') return new TextEncoder().encode(body).buffer as ArrayBuffer;
  // URLSearchParams ou outros
  return new TextEncoder().encode(String(body)).buffer as ArrayBuffer;
}

export async function signedFetch(
  ctx: SigningContext,
  pathOrUrl: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = pathOrUrl.startsWith('http')
    ? new URL(pathOrUrl)
    : new URL(pathOrUrl, ctx.endpoint);

  const method = (init.method ?? 'GET').toUpperCase();
  const ts = Math.floor(Date.now() / 1000);

  const bodyBuf = await bodyToArrayBuffer(init.body);
  const bodyHash = await sha256Hex(bodyBuf);
  const message = `${method}\n${url.pathname}\n${ts}\n${bodyHash}`;
  const sig = await hmacSignHex(ctx.device_secret, message);

  const headers = new Headers(init.headers);
  headers.set('Authorization', `TC-HMAC ${ctx.device_id}:${ts}:${sig}`);

  return fetch(url.toString(), { ...init, headers });
}

// Helper para JSON
export async function signedJsonFetch<T = unknown>(
  ctx: SigningContext,
  pathOrUrl: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await signedFetch(ctx, pathOrUrl, { ...init, headers });
  if (!res.ok) {
    let message: string | undefined;
    try {
      const data = (await res.json()) as { error?: string };
      message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message ?? `Request falhou: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
