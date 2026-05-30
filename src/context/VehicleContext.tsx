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
import type { Vehicle } from '@/types/vehicle';
import { loadVehicles, mergeVehicles, saveVehicles, syncVehicles, addDeletion, loadDeletions, clearDeletions } from '@/lib/sync';
import { useAuth } from './AuthContext';

interface VehicleContextValue {
  vehicles: Vehicle[];
  activeVehicles: Vehicle[];
  selectedId: string | null;
  selectedVehicle: Vehicle | null;
  isAllSelected: boolean;
  isSyncing: boolean;
  syncError: string | null;
  selectVehicle: (id: string) => void;
  addVehicle: (v: Vehicle) => void;
  updateVehicle: (v: Vehicle) => void;
  deleteVehicle: (id: string) => void;
  triggerSync: () => void;
}

const SELECTED_KEY = 'tc_selected_vehicle';
const POLL_MS = 10_000;

const VehicleContext = createContext<VehicleContextValue | null>(null);

export function VehicleProvider({ children }: { children: ReactNode }) {
  const { signing, isUnlocked } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>(loadVehicles);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => localStorage.getItem(SELECTED_KEY),
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const latestRef = useRef<Vehicle[]>(vehicles);

  useEffect(() => {
    latestRef.current = vehicles;
  }, [vehicles]);

  const doSync = useCallback(async () => {
    if (!signing) return;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const pendingDeletions = loadDeletions().filter((d) => d.type === 'vehicle');
      const server = await syncVehicles(signing, latestRef.current, pendingDeletions);
      if (pendingDeletions.length > 0) {
        clearDeletions(pendingDeletions);
      }
      const merged = mergeVehicles(server, latestRef.current);
      saveVehicles(merged);
      setVehicles(merged);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Erro de sync');
    } finally {
      setIsSyncing(false);
    }
  }, [signing]);

  // Initial sync
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isUnlocked) void doSync();
  }, [isUnlocked, doSync]);

  // Polling
  useEffect(() => {
    if (!isUnlocked) return;
    const id = setInterval(() => void doSync(), POLL_MS);
    return () => clearInterval(id);
  }, [isUnlocked, doSync]);

  // Sync on reconnect
  useEffect(() => {
    const handler = () => void doSync();
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
  }, [doSync]);

  const addVehicle = useCallback((v: Vehicle) => {
    const next = mergeVehicles(latestRef.current, [v]);
    saveVehicles(next);
    setVehicles(next);
    setSelectedId(v.id);
    localStorage.setItem(SELECTED_KEY, v.id);
    void doSync();
  }, [doSync]);

  const updateVehicle = useCallback((v: Vehicle) => {
    const next = latestRef.current.map((x) => (x.id === v.id ? v : x));
    saveVehicles(next);
    setVehicles(next);
    void doSync();
  }, [doSync]);

  const deleteVehicle = useCallback((id: string) => {
    const next = latestRef.current.filter((v) => v.id !== id);
    addDeletion('vehicle', id);
    saveVehicles(next);
    setVehicles(next);

    if (selectedId === id) {
      const first = next[0];
      const newId = first?.id ?? null;
      setSelectedId(newId);
      if (newId) localStorage.setItem(SELECTED_KEY, newId);
      else localStorage.removeItem(SELECTED_KEY);
    }
    void doSync();
  }, [selectedId, doSync]);

  const selectVehicle = useCallback((id: string) => {
    setSelectedId(id);
    localStorage.setItem(SELECTED_KEY, id);
  }, []);

  const activeVehicles = vehicles; // Since we do hard delete, all in array are active
  const isAllSelected = selectedId === '__all__';
  const selectedVehicle = isAllSelected ? null : (vehicles.find((v) => v.id === selectedId) ?? null);

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        activeVehicles,
        selectedId,
        selectedVehicle,
        isAllSelected,
        isSyncing,
        syncError,
        selectVehicle,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        triggerSync: doSync,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicles(): VehicleContextValue {
  const ctx = useContext(VehicleContext);
  if (!ctx) throw new Error('useVehicles must be used within VehicleProvider');
  return ctx;
}
