import { useCallback } from 'react';
import { useVehicles } from '@/context/VehicleContext';
import { useFuel } from '@/context/FuelContext';
import { useMaintenance } from '@/context/MaintenanceContext';

export function useSyncAll(): () => void {
  const { triggerSync: syncVehicles } = useVehicles();
  const { triggerSync: syncFuel } = useFuel();
  const { triggerSync: syncMaintenance } = useMaintenance();

  return useCallback(() => {
    syncVehicles();
    syncFuel();
    syncMaintenance();
  }, [syncVehicles, syncFuel, syncMaintenance]);
}
