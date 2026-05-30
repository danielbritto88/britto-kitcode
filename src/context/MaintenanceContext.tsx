/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { MaintenanceLog } from '@/types/maintenance';
import {
  loadMaintenanceLogs,
  mergeMaintenanceLogs,
  saveMaintenanceLogs,
} from '@/lib/maintenance';
import { signedJsonFetch } from '@/lib/signedFetch';
import { loadDeletions, loadVehicles, addDeletion, clearDeletions } from '@/lib/sync';
import { useAuth } from './AuthContext';

interface MaintenanceContextValue {
  maintenanceLogs: MaintenanceLog[];
  isSyncing: boolean;
  syncError: string | null;
  logsForVehicle: (vehicleId: string) => MaintenanceLog[];
  addMaintenanceLog: (log: MaintenanceLog) => void;
  updateMaintenanceLog: (log: MaintenanceLog) => void;
  deleteMaintenanceLog: (id: string) => void;
  triggerSync: () => void;
}

const POLL_MS = 10_000;

const MaintenanceContext = createContext<MaintenanceContextValue | null>(null);

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const { signing, isUnlocked } = useAuth();
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(loadMaintenanceLogs);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const latestRef = useRef<MaintenanceLog[]>(maintenanceLogs);

  useEffect(() => {
    latestRef.current = maintenanceLogs;
  }, [maintenanceLogs]);

  const doSync = useCallback(async () => {
    if (!signing) return;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const pendingDeletions = loadDeletions().filter((d) => d.type === 'maintenance_log');
      // Filtra maintenance_logs órfãos (vehicle_id sem veículo correspondente) para evitar FK violation no D1
      const currentVehicles = loadVehicles();
      const validVehicleIds = new Set(currentVehicles.map((v) => v.id));
      const validMaintLogs = latestRef.current.filter((m) => validVehicleIds.has(m.vehicle_id));
      const data = await signedJsonFetch<{ maintenance_logs: MaintenanceLog[] }>(
        signing,
        '/api/sync',
        {
          method: 'POST',
          body: JSON.stringify({ vehicles: currentVehicles, maintenance_logs: validMaintLogs, deletions: pendingDeletions }),
        },
      );
      if (pendingDeletions.length > 0) {
        clearDeletions(pendingDeletions);
      }
      const merged = mergeMaintenanceLogs(
        data.maintenance_logs ?? [],
        latestRef.current,
      );
      saveMaintenanceLogs(merged);
      setMaintenanceLogs(merged);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Erro de sync');
    } finally {
      setIsSyncing(false);
    }
  }, [signing]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isUnlocked) void doSync();
  }, [isUnlocked, doSync]);

  useEffect(() => {
    if (!isUnlocked) return;
    const id = setInterval(() => void doSync(), POLL_MS);
    return () => clearInterval(id);
  }, [isUnlocked, doSync]);

  useEffect(() => {
    const handler = () => void doSync();
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
  }, [doSync]);

  const addMaintenanceLog = useCallback((log: MaintenanceLog) => {
    const next = mergeMaintenanceLogs(latestRef.current, [log]);
    saveMaintenanceLogs(next);
    setMaintenanceLogs(next);
    void doSync();
  }, [doSync]);

  const updateMaintenanceLog = useCallback((log: MaintenanceLog) => {
    const next = latestRef.current.map((l) => (l.id === log.id ? log : l));
    saveMaintenanceLogs(next);
    setMaintenanceLogs(next);
    void doSync();
  }, [doSync]);

  const deleteMaintenanceLog = useCallback((id: string) => {
    const next = latestRef.current.filter((l) => l.id !== id);
    addDeletion('maintenance_log', id);
    saveMaintenanceLogs(next);
    setMaintenanceLogs(next);
    void doSync();
  }, [doSync]);

  const logsForVehicle = useCallback((vehicleId: string): MaintenanceLog[] => {
    return maintenanceLogs.filter((l) => l.vehicle_id === vehicleId);
  }, [maintenanceLogs]);

  return (
    <MaintenanceContext.Provider
      value={{
        maintenanceLogs,
        isSyncing,
        syncError,
        logsForVehicle,
        addMaintenanceLog,
        updateMaintenanceLog,
        deleteMaintenanceLog,
        triggerSync: doSync,
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
}

export function useMaintenance(): MaintenanceContextValue {
  const ctx = useContext(MaintenanceContext);
  if (!ctx) throw new Error('useMaintenance must be used within MaintenanceProvider');
  return ctx;
}
