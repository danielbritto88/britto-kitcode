import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, BellOff, ChevronDown, ChevronUp, Download, Eye, EyeOff, Fingerprint, Lock, LogOut, RefreshCw, Server, ShieldOff, Trash2, User, Wifi } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { useVehicles } from '@/context/VehicleContext';
import { useFuel } from '@/context/FuelContext';
import { useMaintenance } from '@/context/MaintenanceContext';
import { useSyncAll } from '@/hooks/useSyncAll';
import { loadLastSyncTime } from '@/lib/sync';
import { useToast } from '@/components/ui/Toast';
import { BottomTabBarBrutal } from '@/components/BottomTabBarBrutal';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { GaugeSpinner } from '@/components/identity/GaugeSpinner';
import { TimelineDot } from '@/components/identity/TimelineDot';
import {
  isSupported,
  currentPermission,
  notificationsEnabled,
  enableNotifications,
  disableNotifications,
  PushError,
} from '@/lib/pushNotifications';
import { signedJsonFetch, type SigningContext } from '@/lib/signedFetch';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';

interface Device {
  id: string;
  label: string;
  user_tag: string;
  created_at: string;
  last_seen_at: string | null;
  revoked_at: string | null;
}

export function SettingsPage() {
  const {
    endpoint,
    userTag,
    deviceId,
    hasSession,
    isUnlocked,
    isLocalMode,
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
  } = useAuth();
  const { isSyncing: syncingVehicles, syncError: vehicleError } = useVehicles();
  const { isSyncing: syncingFuel, syncError: fuelError } = useFuel();
  const { isSyncing: syncingMaint, syncError: maintError } = useMaintenance();
  const syncAll = useSyncAll();
  const isSyncing = syncingVehicles || syncingFuel || syncingMaint;
  const syncError = vehicleError ?? fuelError ?? maintError;
  const { toast } = useToast();
  const navigate = useNavigate();

  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => loadLastSyncTime());

  // Onboarding state
  const [localName, setLocalName] = useState('');
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  // Server connection state (advanced settings)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [epEdited, setEpEdited] = useState<string | null>(null);
  const ep = epEdited ?? endpoint;
  const setEp = (v: string) => setEpEdited(v);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deviceLabel, setDeviceLabel] = useState('');
  const [serverLoading, setServerLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Notifications
  const [notifEnabled, setNotifEnabled] = useState(notificationsEnabled);
  const [notifLoading, setNotifLoading] = useState(false);

  const pushSupported = isSupported();
  const permDenied = currentPermission() === 'denied';

  // ─── Onboarding: primeiro uso, sem sessão ───────────────────────────────
  async function handleOnboarding(e: React.FormEvent) {
    e.preventDefault();
    if (!localName.trim()) return;
    setOnboardingLoading(true);
    try {
      await setupLocal(localName.trim());
      haptic('ignition');
      toast(`Bem-vindo, ${localName.trim()}!`, 'success');
      navigate('/inicio', { replace: true });
    } catch (err) {
      haptic('error');
      const msg = err instanceof Error ? err.message : 'Erro ao configurar';
      toast(msg, 'error');
    } finally {
      setOnboardingLoading(false);
    }
  }

  // ─── Conectar ao servidor ───────────────────────────────────────────────
  async function handleConnectServer(e: React.FormEvent) {
    e.preventDefault();
    if (!ep.trim() || !password) return;
    setConnecting(true);
    try {
      const label = deviceLabel.trim() || userTag || 'Dispositivo';
      await login(ep.trim(), password, label);
      haptic('ignition');
      toast('Conectado ao servidor!', 'success');
      setPassword('');
      setDeviceLabel('');
      setShowAdvanced(false);
    } catch (err) {
      haptic('error');
      const msg = err instanceof Error ? err.message : 'Erro ao conectar';
      toast(msg, 'error');
    } finally {
      setConnecting(false);
    }
  }

  // ── Destravar sessão existente ─────────────────────────────────────────
  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setServerLoading(true);
    try {
      const ok = await unlock(password);
      if (!ok) {
        haptic('error');
        toast('Senha incorreta.', 'error');
      } else {
        haptic('ignition');
        toast('Cofre destravado.', 'success');
        setPassword('');
      }
    } catch (err) {
      haptic('error');
      const msg = err instanceof Error ? err.message : 'Erro ao destravar';
      toast(msg, 'error');
    } finally {
      setServerLoading(false);
    }
  }

  // ─── Biometria ──────────────────────────────────────────────────────────
  async function handleBiometricUnlock() {
    setServerLoading(true);
    try {
      const ok = await autoUnlock();
      if (ok) {
        haptic('ignition');
        toast('Destravado!', 'success');
      } else {
        haptic('error');
        toast('Biometria não reconhecida.', 'error');
      }
    } finally {
      setServerLoading(false);
    }
  }

  // ─── Sync manual ───────────────────────────────────────────────────────
  function handleSyncNow() {
    syncAll();
    setTimeout(() => setLastSyncTime(loadLastSyncTime()), 3000);
  }

  function handleRedownload() {
    haptic('warning');
    localStorage.removeItem('tc_vehicles');
    localStorage.removeItem('tc_fuel_logs');
    localStorage.removeItem('tc_maintenance_logs');
    localStorage.removeItem('tc_last_sync');
    toast('Dados locais apagados. Baixando do servidor…', 'info');
    window.location.reload();
  }

  // ─── Logout / Desconectar ───────────────────────────────────────────────
  async function handleLogout() {
    haptic('warning');
    await logout();
    setPassword('');
    toast('Sessão encerrada.', 'info');
  }

  async function handleDisconnectServer() {
    haptic('warning');
    await logout();
    setEpEdited(null);
    setPassword('');
    toast('Desconectado do servidor. Modo local ativado.', 'info');
  }

  // ─── Notificações ───────────────────────────────────────────────────────
  async function handleNotifToggle(value: boolean) {
    if (notifLoading || !signing) return;
    setNotifLoading(true);
    try {
      if (value) {
        await enableNotifications(signing);
        setNotifEnabled(true);
        haptic('success');
        toast('Lembretes ativados!', 'success');
      } else {
        await disableNotifications(signing);
        setNotifEnabled(false);
        toast('Lembretes desativados.', 'info');
      }
    } catch (err) {
      haptic('error');
      if (err instanceof PushError) {
        const msgs: Record<typeof err.code, string> = {
          NOT_SUPPORTED: 'Este dispositivo não suporta notificações.',
          VAPID_MISSING: 'Configuração do servidor incompleta (VAPID).',
          PERMISSION_DENIED: 'Permissão negada. Libere nas configurações do Android.',
          SW_NOT_READY: 'App não está instalado como PWA. Adicione à tela inicial primeiro.',
          SUBSCRIBE_FAILED: 'Falha ao registrar notificação: ' + err.message,
          SERVER_ERROR: 'Erro no servidor ao salvar assinatura.',
        };
        toast(msgs[err.code], 'error');
      } else {
        toast('Erro inesperado ao configurar notificações.', 'error');
      }
    } finally {
      setNotifLoading(false);
    }
  }

  // ─── Render: Onboarding (primeiro uso) ──────────────────────────────────
  if (!hasSession && !isLocalMode && !isUnlocked) {
    return (
      <div className="min-h-dvh bg-transparent flex flex-col">
        <header
          className="pt-[env(safe-area-inset-top,0px)] px-6 py-4 border-b-2 border-[var(--border)] border-opacity-10"
          aria-label="Cabeçalho"
        >
          <span className="font-bold tracking-tight" style={{ fontFamily: "'Bodoni Moda Variable', Georgia, serif", fontSize: 20, color: '#0D0D0D' }}>
            Tanque Cheio
          </span>
        </header>

        <div className="flex-1 flex flex-col px-6 pb-[calc(env(safe-area-inset-bottom,0px)+96px)]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0, 0, 1] }}
            className="w-full max-w-sm mx-auto pt-12"
          >
            <div className="mb-8">
              <h1
                className="font-bold leading-none tracking-tight mb-2"
                style={{
                  fontFamily: "'Bodoni Moda Variable', Georgia, serif",
                  fontVariationSettings: "'opsz' 72, 'wght' 700",
                  fontSize: 32,
                  color: '#0D0D0D',
                }}
              >
                Como podemos te chamar?
              </h1>
              <p className="text-muted text-sm mt-1">
                Seu nome fica salvo neste dispositivo. Você pode conectar a um servidor depois.
              </p>
            </div>

            <form onSubmit={handleOnboarding} className="flex flex-col gap-5">
              <Field label="Seu nome">
                <div className="relative">
                  <Input
                    type="text"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value.slice(0, 30))}
                    placeholder="Ex: Daniel, Maria..."
                    className="pr-10"
                    required
                    autoCapitalize="words"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={30}
                    autoFocus
                  />
                  <User
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none"
                  />
                </div>
              </Field>

              <button
                type="submit"
                disabled={onboardingLoading || !localName.trim()}
                className={cn(
                  "w-full mt-2 py-4 rounded-[var(--radius-xl)] flex items-center justify-center font-bold uppercase tracking-[0.1em]",
                  "border-2 border-[var(--border)] disabled:opacity-50 transition-transform active:translate-x-[2px] active:translate-y-[2px]"
                )}
                style={{
                  background: 'var(--accent)',
                  color: '#1A1816',
                  fontSize: 14,
                  boxShadow: 'var(--shadow-brutal-md)',
                }}
              >
                {onboardingLoading ? 'Configurando…' : 'Começar'}
              </button>
            </form>
          </motion.div>
        </div>
        <BottomTabBarBrutal />
      </div>
    );
  }

  // ── Render: Configurações (modo local ou conectado) ────────────────────
  return (
    <div className="min-h-dvh bg-transparent flex flex-col">
      <header
        className="pt-[env(safe-area-inset-top,0px)] px-6 py-4 border-b-2 border-[var(--border)] border-opacity-10 flex items-center justify-between"
        aria-label="Cabeçalho de configurações"
      >
        <span className="font-bold tracking-tight" style={{ fontFamily: "'Bodoni Moda Variable', Georgia, serif", fontSize: 20, color: '#0D0D0D' }}>
          Configurações
        </span>
        {(hasSession || isLocalMode) && (
          <button
            onClick={() => void (hasSession ? handleLogout() : handleDisconnectServer())}
            className="flex items-center gap-1.5 text-muted text-sm active:text-danger transition-colors"
            aria-label="Sair desta sessão"
          >
            <LogOut size={16} />
            <span>{hasSession ? 'Sair' : 'Resetar'}</span>
          </button>
        )}
      </header>

      <div className="flex-1 flex flex-col px-6 pb-[calc(env(safe-area-inset-bottom,0px)+96px)]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0, 0, 1] }}
          className="w-full max-w-sm mx-auto pt-8"
        >
          {/* Perfil */}
          <div className="mb-6">
            <p className="text-instrument-label">Perfil</p>
            <p className="text-text text-lg font-medium mt-1">
              {userTag || 'Usuário local'}
            </p>
            <p className="text-muted text-xs mt-1">
              {isLocalMode ? 'Modo local — dados neste dispositivo' : `Conectado · ${endpoint ? new URL(endpoint).hostname : 'servidor'}`}
            </p>
          </div>

          {/* Sessão travada: pede senha para destravar */}
          {hasSession && !isUnlocked && (
            <>
              {/* Biometria */}
              {!authPrefs.requirePassword && authPrefs.useBiometric && (
                <div className="flex flex-col gap-5 mb-6">
                  <button
                    type="button"
                    onClick={() => void handleBiometricUnlock()}
                    disabled={serverLoading}
                    className="w-full flex flex-col items-center gap-3 py-8 rounded-[var(--radius-xl)] border-2 border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-brutal-sm)] active:translate-x-[2px] active:translate-y-[2px] transition-transform disabled:opacity-50"
                  >
                    <Fingerprint size={48} strokeWidth={1.25} className="text-[var(--accent)]" />
                    <span className="text-sm font-bold text-[#0D0D0D] uppercase tracking-[0.1em]">
                      {serverLoading ? 'Verificando…' : 'Usar digital'}
                    </span>
                  </button>
                </div>
              )}

              {/* Senha — sempre visível quando sessão travada, independe de prefs */}
              {hasSession && !isUnlocked && (
                <form onSubmit={handleUnlock} className="flex flex-col gap-5 mb-6">
                  <Field label="Senha do cofre">
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="pr-12 text-lg tracking-widest"
                        required
                        autoComplete="current-password"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-faint active:text-muted p-1"
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </Field>

                  <button
                    type="submit"
                    disabled={serverLoading || !password}
                    className={cn(
                      "w-full py-4 rounded-[var(--radius-xl)] flex items-center justify-center font-bold uppercase tracking-[0.1em]",
                      "border-2 border-[var(--border)] disabled:opacity-50 transition-transform active:translate-x-[2px] active:translate-y-[2px]"
                    )}
                    style={{
                      background: 'var(--accent)',
                      color: '#1A1816',
                      fontSize: 14,
                      boxShadow: 'var(--shadow-brutal-md)',
                    }}
                  >
                    {serverLoading ? 'Destravando…' : 'Destravar'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Configurações — visíveis quando desbloqueado ou modo local */}
          {(isUnlocked || isLocalMode) && (
            <>
              {/* Notificações */}
              {pushSupported && (
                <div className="mt-2 pt-6 border-t-2 border-[var(--border)] border-opacity-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {notifEnabled ? (
                        <Bell size={18} className="text-accent" />
                      ) : (
                        <BellOff size={18} className="text-faint" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-text">Lembretes</p>
                        <p className="text-xs text-muted">
                          {permDenied
                            ? 'Bloqueado nas configurações do Android'
                            : 'Alertas de manutenção às 8h'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifEnabled}
                      onCheckedChange={(v) => void handleNotifToggle(v)}
                      disabled={notifLoading || permDenied || !signing}
                    />
                  </div>
                </div>
              )}

              {/* Status de sincronização */}
              {hasSession && (
                <div className="mt-2 pt-6 border-t-2 border-[var(--border)] border-opacity-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <RefreshCw
                        size={18}
                        className={isSyncing ? 'animate-spin text-accent' : syncError ? 'text-danger' : 'text-faint'}
                      />
                      <div>
                        <p className="text-sm font-medium text-text">Sincronização</p>
                        <p className={['text-xs', syncError ? 'text-danger' : 'text-muted'].join(' ')}>
                          {syncError
                            ? syncError
                            : lastSyncTime
                              ? `Último sync ${formatDistanceToNow(new Date(lastSyncTime), { locale: ptBR, addSuffix: true })}`
                              : 'Nunca sincronizado'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSyncNow}
                      disabled={isSyncing}
                      className="text-xs font-bold uppercase tracking-[0.1em] text-accent disabled:opacity-40 active:opacity-60 transition-opacity"
                    >
                      {isSyncing ? 'Sincronizando…' : 'Sincronizar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Segurança */}
              {hasSession && (
                <SecuritySection
                  authPrefs={authPrefs}
                  biometricAvailable={biometricAvailable}
                  onSetRequirePassword={(v) => void setRequirePassword(v)}
                  onSetBiometric={async (v) => {
                    const ok = await setBiometric(v);
                    if (!ok && v) toast('Biometria não disponível ou cancelada.', 'error');
                    else if (ok && v) toast('Digital ativada!', 'success');
                    else toast('Digital desativada.', 'info');
                  }}
                />
              )}

              {/* Dispositivos */}
              {signing && (
                <DevicesSection signing={signing} currentDeviceId={deviceId} />
              )}

              {/* Configurações Avançadas */}
              <div className="mt-6 pt-6 border-t-2 border-[var(--border)] border-opacity-10">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <Server size={18} className="text-faint" />
                    <div>
                      <p className="text-sm font-medium text-text">Configurações Avançadas</p>
                      <p className="text-xs text-muted">
                        {hasSession ? 'Servidor conectado' : 'Conectar a um servidor remoto'}
                      </p>
                    </div>
                  </div>
                  {showAdvanced ? <ChevronUp size={18} className="text-faint" /> : <ChevronDown size={18} className="text-faint" />}
                </button>

                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    {hasSession ? (
                      // Já conectado: mostrar info + botão desconectar
                      <div className="flex flex-col gap-4">
                        <div className="p-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
                          <p className="text-xs text-muted uppercase tracking-wider mb-1">Servidor</p>
                          <p className="text-sm font-mono text-text break-all">{endpoint}</p>
                          <p className="text-xs text-muted mt-2">Dispositivo: {deviceId}</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRedownload}
                          className="w-full py-3 rounded-[var(--radius-md)] border-2 border-[var(--border)] font-bold uppercase tracking-[0.1em] text-sm active:translate-x-[2px] active:translate-y-[2px] transition-transform flex items-center justify-center gap-2"
                          style={{ background: 'var(--surface)', color: '#0D0D0D' }}
                        >
                          <Download size={15} />
                          Baixar tudo do servidor
                        </button>
                        <p className="text-xs text-muted text-center -mt-1">
                          Apaga dados locais e re-baixa tudo. Útil ao trocar de dispositivo.
                        </p>
                        <button
                          onClick={() => void handleDisconnectServer()}
                          className="w-full py-3 rounded-[var(--radius-md)] border-2 border-danger text-danger font-bold uppercase tracking-[0.1em] text-sm active:translate-x-[2px] active:translate-y-[2px] transition-transform"
                        >
                          Desconectar do servidor
                        </button>
                      </div>
                    ) : (
                      // Não conectado: formulário para conectar
                      <form onSubmit={handleConnectServer} className="flex flex-col gap-4">
                        <Field label="URL do servidor">
                          <div className="relative">
                            <Input
                              type="url"
                              value={ep}
                              onChange={(e) => setEp(e.target.value)}
                              placeholder="https://..."
                              className="pr-10 text-sm font-mono"
                              required
                              autoCapitalize="none"
                              autoCorrect="off"
                              spellCheck={false}
                            />
                            <Wifi
                              size={16}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none"
                            />
                          </div>
                        </Field>

                        <Field label="Senha do cofre">
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="pr-12 text-sm tracking-widest"
                              required
                              autoComplete="current-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint active:text-muted p-1"
                              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </Field>

                        <Field label="Nome do dispositivo (opcional)">
                          <Input
                            type="text"
                            value={deviceLabel}
                            onChange={(e) => setDeviceLabel(e.target.value.slice(0, 30))}
                            placeholder="Ex: iPhone da Maria"
                            className="text-sm"
                            autoCapitalize="words"
                            maxLength={30}
                          />
                        </Field>

                        <button
                          type="submit"
                          disabled={connecting || !ep.trim() || !password}
                          className={cn(
                            "w-full py-3 rounded-[var(--radius-md)] flex items-center justify-center font-bold uppercase tracking-[0.1em] text-sm",
                            "border-2 border-[var(--border)] disabled:opacity-50 transition-transform active:translate-x-[2px] active:translate-y-[2px]"
                          )}
                          style={{
                            background: 'var(--accent)',
                            color: '#1A1816',
                            boxShadow: 'var(--shadow-brutal-sm)',
                          }}
                        >
                          {connecting ? 'Conectando…' : 'Conectar ao servidor'}
                        </button>

                        <p className="text-xs text-muted text-center">
                          Seus dados locais serão sincronizados com o servidor.
                        </p>
                      </form>
                    )}
                  </motion.div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
      <BottomTabBarBrutal />
    </div>
  );
}

function DevicesSection({
  signing,
  currentDeviceId,
}: {
  signing: SigningContext;
  currentDeviceId: string | null;
}) {
  const { toast } = useToast();
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const reloadRef = useRef(0);
  const [reloadTick, setReloadTick] = useState(0);

  function refresh() {
    reloadRef.current += 1;
    setReloadTick(reloadRef.current);
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const res = await signedJsonFetch<{ devices: Device[]; current_device_id: string }>(
          signing,
          '/api/devices',
        );
        if (!cancelled) setDevices(res.devices);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Erro';
        toast(`Falha ao carregar dispositivos: ${msg}`, 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signing, reloadTick, toast]);

  async function handleRevoke(id: string, label: string) {
    setRevoking(id);
    try {
      await signedJsonFetch(signing, `/api/devices/${id}/revoke`, { method: 'POST' });
      haptic('warning');
      toast(`${label} revogado.`, 'info');
      refresh();
    } catch (err) {
      haptic('error');
      const msg = err instanceof Error ? err.message : 'Erro';
      toast(`Falha ao revogar: ${msg}`, 'error');
    } finally {
      setRevoking(null);
    }
  }

  return (
    <div className="mt-6 pt-6 border-t-2 border-[var(--border)] border-opacity-10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-instrument-label">Dispositivos confiáveis</p>
          <p className="text-xs text-muted mt-0.5">
            Revogar bloqueia o acesso na próxima sincronização (≤ 10s).
          </p>
        </div>
        {loading && <GaugeSpinner size={20} label="Carregando" />}
      </div>

      {devices == null ? (
        <p className="text-faint text-xs py-2">Buscando…</p>
      ) : devices.length === 0 ? (
        <p className="text-faint text-xs py-2">Nenhum dispositivo encontrado.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {devices.map((d) => {
            const isCurrent = d.id === currentDeviceId;
            const isRevoked = !!d.revoked_at;
            const lastSeen = d.last_seen_at
              ? formatDistanceToNow(new Date(d.last_seen_at), { locale: ptBR, addSuffix: true })
              : 'nunca visto';
            const created = format(new Date(d.created_at), "d 'de' MMM yyyy", { locale: ptBR });
            return (
              <li
                key={d.id}
                className="flex items-start gap-3 py-2 border-b border-border-soft last:border-b-0"
              >
                <span className="pt-1.5">
                  <TimelineDot
                    status={isRevoked ? 'overdue' : isCurrent ? 'soon' : 'ok'}
                  />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-text text-sm">
                    {d.label}
                    {isCurrent && (
                      <span className="text-accent text-xs ml-2">· este aparelho</span>
                    )}
                    {isRevoked && (
                      <span className="text-danger text-xs ml-2">· revogado</span>
                    )}
                  </p>
                  <p className="text-faint text-xs">
                    {d.user_tag} · adicionado {created} · visto {lastSeen}
                  </p>
                </div>
                {!isCurrent && !isRevoked && (
                  <button
                    onClick={() => void handleRevoke(d.id, d.label)}
                    className="text-faint active:text-danger text-xs flex items-center gap-1"
                    disabled={revoking === d.id}
                    aria-label={`Revogar ${d.label}`}
                  >
                    {revoking === d.id ? (
                      <GaugeSpinner size={14} />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    revogar
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SecuritySection({
  authPrefs,
  biometricAvailable,
  onSetRequirePassword,
  onSetBiometric,
}: {
  authPrefs: { requirePassword: boolean; useBiometric: boolean };
  biometricAvailable: boolean;
  onSetRequirePassword: (v: boolean) => void;
  onSetBiometric: (v: boolean) => Promise<void>;
}) {
  const { toast } = useToast();
  const [confirmingDisable, setConfirmingDisable] = useState(false);

  function handlePasswordToggle(value: boolean) {
    if (!value) {
      if (!confirmingDisable) {
        setConfirmingDisable(true);
        setTimeout(() => setConfirmingDisable(false), 4000);
        return;
      }
      setConfirmingDisable(false);
      onSetRequirePassword(false);
      toast('Proteção por senha desativada.', 'info');
    } else {
      setConfirmingDisable(false);
      onSetRequirePassword(true);
      toast('Proteção por senha ativada.', 'success');
    }
  }

  return (
    <div className="mt-2 pt-6 border-t-2 border-[var(--border)] border-opacity-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {authPrefs.requirePassword ? (
            <Lock size={18} className="text-accent" />
          ) : (
            <ShieldOff size={18} className="text-faint" />
          )}
          <div>
            <p className="text-sm font-medium text-text">Pedir senha ao entrar</p>
            <p className={['text-xs', confirmingDisable ? 'text-warning' : 'text-muted'].join(' ')}>
              {confirmingDisable
                ? 'Toque novamente para confirmar'
                : authPrefs.requirePassword
                  ? 'Necessário ao abrir o app'
                  : 'App abre sem senha'}
            </p>
          </div>
        </div>
        <Switch
          checked={authPrefs.requirePassword}
          onCheckedChange={handlePasswordToggle}
        />
      </div>

      {biometricAvailable && !authPrefs.requirePassword && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <Fingerprint
              size={18}
              className={authPrefs.useBiometric ? 'text-accent' : 'text-faint'}
            />
            <div>
              <p className="text-sm font-medium text-text">Usar digital</p>
              <p className="text-xs text-muted">
                {authPrefs.useBiometric
                  ? 'Biometria solicitada ao entrar'
                  : 'App abre sem autenticação'}
              </p>
            </div>
          </div>
          <Switch
            checked={authPrefs.useBiometric}
            onCheckedChange={(v) => void onSetBiometric(v)}
          />
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block mb-1.5 uppercase tracking-[0.14em] text-[10px] font-bold"
        style={{ color: 'rgba(13,13,13,0.7)' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
