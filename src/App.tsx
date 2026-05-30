// v1.7.0 — Modo local + servidor opcional
// i18n.locale='pt-BR' — single-language Portuguese app, no translation layer required
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { VehicleProvider } from '@/context/VehicleContext';
import { FuelProvider } from '@/context/FuelContext';
import { MaintenanceProvider } from '@/context/MaintenanceContext';
import { ToastProvider } from '@/components/ui/Toast';
import { useSyncAll } from '@/hooks/useSyncAll';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { AmbientGlow } from '@/components/identity/AmbientGlow';
import { IgnitionSplash } from '@/features/home/IgnitionSplash';
import { HomePage } from '@/features/home/HomePage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { VehiclesPage } from '@/features/vehicles/VehiclesPage';
import { FuelPage } from '@/features/fuel/FuelPage';
import { MaintenancePage } from '@/features/maintenance/MaintenancePage';
import { DesignSystemPage } from '@/features/ds/DesignSystemPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { usePWA } from '@/hooks/usePWA';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<IgnitionSplash />} />
      <Route path="/__ds" element={<DesignSystemPage />} />
      <Route path="/ajustes" element={<SettingsPage />} />
      <Route path="/inicio" element={<HomePage />} />
      <Route path="/veiculos" element={<VehiclesPage />} />
      <Route path="/combustivel" element={<FuelPage />} />
      <Route path="/manutencao" element={<MaintenancePage />} />
      <Route path="/relatorios" element={<ReportsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function PullRefreshIndicator() {
  const { isUnlocked } = useAuth();
  const syncAll = useSyncAll();
  const { pullDistance, isRefreshing } = usePullToRefresh(syncAll, isUnlocked);

  const show = pullDistance > 0 || isRefreshing;
  if (!show) return null;

  const progress = Math.min(pullDistance / 70, 1);
  const offsetY = isRefreshing ? 0 : (progress - 1) * 48;

  return (
    <div
      className="fixed left-1/2 z-[90] pointer-events-none"
      style={{ top: 20, transform: `translate(-50%, ${offsetY}px)` }}
    >
      <div
        className="w-9 h-9 flex items-center justify-center"
        style={{
          backgroundColor: '#F5D000',
          border: '2px solid #0D0D0D',
          boxShadow: '2px 2px 0 #0D0D0D',
        }}
      >
        <RefreshCw
          size={16}
          strokeWidth={2.5}
          color="#0D0D0D"
          className={isRefreshing ? 'animate-spin' : undefined}
          style={!isRefreshing ? { transform: `rotate(${progress * 180}deg)` } : undefined}
        />
      </div>
    </div>
  );
}

function PWAOverlays() {
  const { isOnline, needRefresh, updateServiceWorker } = usePWA();

  return (
    <>
      {/* Offline banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="fixed top-0 inset-x-0 z-[100] flex items-center justify-center gap-2 bg-surface border-b border-border py-2 text-xs text-muted"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}
          >
            <WifiOff size={13} />
            Sem conexão — dados do dispositivo
          </motion.div>
        )}
      </AnimatePresence>

      {/* New version available */}
      <AnimatePresence>
        {needRefresh && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+72px)] inset-x-4 z-[100] flex items-center justify-between gap-3 bg-surface border border-border rounded-sm px-4 py-3 shadow-lg"
          >
            <p className="text-sm text-text">Nova versão disponível</p>
            <button
              onClick={() => void updateServiceWorker(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-accent"
            >
              <RefreshCw size={13} />
              Atualizar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VehicleProvider>
          <FuelProvider>
            <MaintenanceProvider>
              <ToastProvider>
                <BrowserRouter>
                  <AmbientGlow />
                  <PWAOverlays />
                  <PullRefreshIndicator />
                  <AppRoutes />
                </BrowserRouter>
              </ToastProvider>
            </MaintenanceProvider>
          </FuelProvider>
        </VehicleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
