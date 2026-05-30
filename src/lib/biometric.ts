// WebAuthn platform authenticator (biometric) helpers.
// Suporte: Android Chrome (fingerprint/face), iOS 16+ Safari (Face/Touch ID).
// Requer HTTPS — funciona no PWA instalado.

export async function isBiometricAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

// Registra credencial biométrica e retorna o ID em base64.
// Retorna null se o usuário cancelar ou o dispositivo não suportar.
export async function registerBiometric(userId: string): Promise<string | null> {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'Tanque Cheio', id: location.hostname === 'localhost' || location.hostname === '127.0.0.1' ? undefined : location.hostname },
        user: {
          id: new TextEncoder().encode(userId),
          name: 'tanquecheio',
          displayName: 'Tanque Cheio',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },   // ES256
          { alg: -257, type: 'public-key' },  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60_000,
      },
    })) as PublicKeyCredential | null;

    if (!credential) return null;
    return bytesToBase64(new Uint8Array(credential.rawId));
  } catch {
    return null;
  }
}

// Pede verificação biométrica para credencial já registrada.
// Retorna true se o usuário autenticar com sucesso.
export async function assertBiometric(credentialId: string): Promise<boolean> {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const rawId = base64ToBytes(credentialId);

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{ id: rawId.buffer as ArrayBuffer, type: 'public-key', transports: ['internal'] }],
        userVerification: 'required',
        timeout: 60_000,
      },
    });

    return !!assertion;
  } catch {
    return false;
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}
