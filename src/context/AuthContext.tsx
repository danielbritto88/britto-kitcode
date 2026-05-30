/* eslint-disable react-refresh/only-export-components */
// Acessibilidade: senha e endpoint usam aria-label/placeholder em SettingsPage.tsx.
// PROJETO §7 — sessão por device_id + device_secret HMAC.
// Senha do cofre é usada apenas para derivar a chave AES-GCM que abre o secret no IndexedDB,
// nunca persistida em lugar nenhum.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  persistSession,
  unlockSession,
  unlockSessionBypass,
  readSessionStatus,
  purgeSession,
  storeSecretPlain,
  clearSecretPlain,
  storeWebAuthnCredentialId,
  getWebAuthnCredentialId,
  clearWebAuthnCredentialId,
  loadAuthPrefs,
  saveAuthPrefs,
  type UnlockedSession,
  type AuthPrefs,
} from '@/lib/secureStore';
import { isBiometricAvailable, registerBiometric, assertBiometric } from '@/lib/biometric';
import type { SigningContext } from '@/lib/signedFetch';

export interface AuthContextValue {
  endpoint: string;
  userTag: string | null;
  deviceId: string | null;
  /** Indica que existe uma sessão guardada (cifrada) — pode estar travada ou destravada. */
  hasSession: boolean;
  /** Indica que a sessão está destravada e pronta pra assinar requests. */
  isUnlocked: boolean;
  /** Modo local — app funciona sem servidor. */
  isLocalMode: boolean;
  /** Contexto pra signedFetch — null se não destravada ou modo local. */
  signing: SigningContext | null;
  /** True se o bootstrap inicial ainda está rodando. */
  isInitializing: boolean;
  /** Preferências de autenticação (requirePassword / useBiometric). */
  authPrefs: AuthPrefs;
  /** true se o dispositivo suporta biometria de plataforma. */
  biometricAvailable: boolean;
  /** Configura modo local (sem servidor). */
  setupLocal: (userTag: string) => Promise<void>;
  /** Provisiona o cofre pela primeira vez ou troca dispositivo. */
  login: (endpoint: string, password: string, deviceLabel: string) => Promise<void>;
  /** Destrava uma sessão já existente fornecendo a senha do cofre. */
  unlock: (password: string) => Promise<boolean>;
  /** Destrava via bypass (sem senha) ou biometria, conforme authPrefs. */
  autoUnlock: () => Promise<boolean>;
  /** Apaga credenciais locais (não revoga no servidor). */
  logout: () => Promise<void>;
  /** Ativa/desativa exigência de senha. Requer sessão destravada. */
  setRequirePassword: (value: boolean) => Promise<void>;
  /** Ativa/desativa biometria. Requer requirePassword=false e sessão destravada. */
  setBiometric: (value: boolean) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface ServerAuthResponse {
  device_id: string;
  device_secret: string;
  user_tag: string;
  label: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [endpoint, setEndpoint] = useState<string>('');
  const [hasSession, setHasSession] = useState(false);
  const [unlocked, setUnlocked] = useState<UnlockedSession | null>(null);
  const [authPrefs, setAuthPrefsState] = useState<AuthPrefs>(loadAuthPrefs);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false);

  // Bootstrap: verifica sessão guardada e faz auto-unlock se aplicável
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      // Verifica suporte a biometria
      const bioAvail = await isBiometricAvailable();
      if (!cancelled) setBiometricAvailable(bioAvail);

      // Lê modo local ANTES do try (não depende de IDB)
      const localUser = localStorage.getItem('tc_local_user');

      try {
        const status = await readSessionStatus();
        if (cancelled) return;
        if (status.endpoint) setEndpoint(status.endpoint);
        setHasSession(status.hasSession);

        // Detecta modo local (só se não há sessão no servidor)
        if (!status.hasSession && localUser) {
          setIsLocalMode(true);
        }

        // Migração one-shot: detecta JWT antigo em localStorage
        const oldToken = localStorage.getItem('tc_token');
        if (oldToken && !status.hasSession) {
          localStorage.removeItem('tc_token');
          localStorage.removeItem('tc_user_tag');
        }
        const oldEndpoint = localStorage.getItem('tc_endpoint');
        if (oldEndpoint && !status.endpoint) setEndpoint(oldEndpoint);

        // Auto-unlock silencioso (sem biometria — só bypass direto)
        if (status.hasSession) {
          const prefs = loadAuthPrefs();
          if (!cancelled) setAuthPrefsState(prefs);

          if (!prefs.requirePassword && !prefs.useBiometric) {
            const session = await unlockSessionBypass();
            if (!cancelled && session) {
              setEndpoint(session.endpoint);
              setUnlocked(session);
            }
          }
        }
      } catch {
        // IDB indisponível — fallback: ativa modo local se tiver usuário local
        if (localUser && !cancelled) {
          setIsLocalMode(true);
        }
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function setupLocal(userTag: string): Promise<void> {
    const tag = userTag.trim() || 'Usuário';
    // Modo local: salva userTag sem endpoint/secret
    localStorage.setItem('tc_local_user', tag);
    setIsLocalMode(true);
    setAuthPrefsState({ requirePassword: false, useBiometric: false });
    saveAuthPrefs({ requirePassword: false, useBiometric: false });
  }

  async function login(ep: string, password: string, deviceLabel: string): Promise<void> {
    const userTag = deviceLabel.trim() || 'Daniel';
    const res = await fetch(`${ep}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, deviceLabel, userTag }),
    });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      throw new Error(typeof data['error'] === 'string' ? data['error'] : 'Erro ao autenticar');
    }
    const auth: ServerAuthResponse = {
      device_id: String(data['device_id']),
      device_secret: String(data['device_secret']),
      user_tag: String(data['user_tag']),
      label: String(data['label']),
    };

    await persistSession({
      password,
      endpoint: ep,
      device_id: auth.device_id,
      device_secret: auth.device_secret,
      user_tag: auth.user_tag,
      label: auth.label,
    });

    // IDB escrito antes de mutar estado React — evita estado inconsistente se IDB falhar
    await storeSecretPlain(auth.device_secret);
    saveAuthPrefs({ requirePassword: false, useBiometric: false });
    setAuthPrefsState({ requirePassword: false, useBiometric: false });

    setEndpoint(ep);
    setHasSession(true);
    setUnlocked({
      endpoint: ep,
      device_id: auth.device_id,
      device_secret: auth.device_secret,
      user_tag: auth.user_tag,
      label: auth.label,
    });

    localStorage.removeItem('tc_token');
    localStorage.removeItem('tc_user_tag');
    localStorage.removeItem('tc_endpoint');
  }

  async function unlock(password: string): Promise<boolean> {
    const session = await unlockSession(password);
    if (!session) return false;
    setEndpoint(session.endpoint);
    setUnlocked(session);
    setHasSession(true);
    return true;
  }

  async function autoUnlock(): Promise<boolean> {
    const prefs = loadAuthPrefs();
    if (prefs.requirePassword) return false;

    if (prefs.useBiometric) {
      const credentialId = await getWebAuthnCredentialId();
      if (!credentialId) return false;
      const ok = await assertBiometric(credentialId);
      if (!ok) return false;
    }

    const session = await unlockSessionBypass();
    if (!session) return false;
    setEndpoint(session.endpoint);
    setUnlocked(session);
    setHasSession(true);
    return true;
  }

  async function logout(): Promise<void> {
    await purgeSession();
    saveAuthPrefs({ requirePassword: true, useBiometric: false });
    setAuthPrefsState({ requirePassword: true, useBiometric: false });
    localStorage.removeItem('tc_token');
    localStorage.removeItem('tc_user_tag');
    localStorage.removeItem('tc_endpoint');
    setUnlocked(null);
    setHasSession(false);
  }

  async function setRequirePassword(value: boolean): Promise<void> {
    if (value) {
      // Reativa proteção por senha: apaga bypass e biometria
      await clearSecretPlain();
      const newPrefs: AuthPrefs = { requirePassword: true, useBiometric: false };
      saveAuthPrefs(newPrefs);
      setAuthPrefsState(newPrefs);
    } else {
      // Desativa: persiste device_secret em claro (sessão deve estar desbloqueada)
      if (!unlocked) return;
      await storeSecretPlain(unlocked.device_secret);
      const newPrefs: AuthPrefs = { requirePassword: false, useBiometric: false };
      saveAuthPrefs(newPrefs);
      setAuthPrefsState(newPrefs);
    }
  }

  async function setBiometric(value: boolean): Promise<boolean> {
    if (!value) {
      await clearWebAuthnCredentialId();
      const newPrefs: AuthPrefs = { ...authPrefs, useBiometric: false };
      saveAuthPrefs(newPrefs);
      setAuthPrefsState(newPrefs);
      return true;
    }

    // Registra nova credencial biométrica
    const userId = unlocked?.device_id ?? 'tanquecheio';
    const credentialId = await registerBiometric(userId);
    if (!credentialId) return false;

    await storeWebAuthnCredentialId(credentialId);
    const newPrefs: AuthPrefs = { requirePassword: false, useBiometric: true };
    saveAuthPrefs(newPrefs);
    setAuthPrefsState(newPrefs);
    return true;
  }

  const signing: SigningContext | null = unlocked
    ? {
        endpoint: unlocked.endpoint,
        device_id: unlocked.device_id,
        device_secret: unlocked.device_secret,
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        endpoint,
        userTag: unlocked?.user_tag ?? (isLocalMode ? localStorage.getItem('tc_local_user') : null),
        deviceId: unlocked?.device_id ?? null,
        hasSession,
        isUnlocked: !!unlocked || isLocalMode,
        isLocalMode,
        isInitializing,
        signing,
        authPrefs,
        biometricAvailable,
        setupLocal,
        login,
        unlock,
        autoUnlock,
        logout,
        setRequirePassword,
        setBiometric,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
