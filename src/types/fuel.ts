import type { FuelType } from './vehicle';

export interface FuelLog {
  id: string;
  vehicle_id: string;
  date: string; // YYYY-MM-DD
  odometer: number;
  liters: number;
  total_cost: number;
  price_per_liter: number;
  full_tank: boolean;
  fuel_type: FuelType | null;
  gas_station: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface FuelStats {
  lastConsumption: number | null; // km/L
  monthAvgConsumption: number | null; // km/L
  monthCost: number; // R$
  monthLiters: number;
}

export interface ChartPoint {
  date: string;
  ppl: number; // price per liter
  kml: number | null; // km/L for full-tank entries
}
