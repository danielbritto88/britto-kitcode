export const MAINTENANCE_TYPES = [
  'oil',
  'tires',
  'filters',
  'revision',
  'brakes',
  'battery',
  'other',
] as const;

export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];

export const MAINTENANCE_LABELS: Record<MaintenanceType, string> = {
  oil: 'Óleo',
  tires: 'Pneus',
  filters: 'Filtros',
  revision: 'Revisão',
  brakes: 'Freios',
  battery: 'Bateria',
  other: 'Outros',
};

export const MAINTENANCE_ICONS: Record<MaintenanceType, string> = {
  oil: 'droplets',
  tires: 'circle-dot',
  filters: 'filter',
  revision: 'clipboard-list',
  brakes: 'disc',
  battery: 'battery-charging',
  other: 'wrench',
};

export interface MaintenanceLog {
  id: string;
  vehicle_id: string;
  type: MaintenanceType;
  date: string; // YYYY-MM-DD
  odometer: number | null;
  cost: number | null;
  shop: string | null;
  notes: string | null;
  next_date: string | null; // YYYY-MM-DD
  next_odometer: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export type MaintenanceStatus = 'ok' | 'soon' | 'overdue';

export interface MaintenanceWithStatus extends MaintenanceLog {
  status: MaintenanceStatus;
  daysUntilNext: number | null;
  kmUntilNext: number | null;
}
