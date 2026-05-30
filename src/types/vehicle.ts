export const FUEL_TYPES = ['gasoline', 'ethanol', 'flex', 'diesel', 'electric', 'hybrid'] as const;
export type FuelType = (typeof FUEL_TYPES)[number];

export const FUEL_LABELS: Record<FuelType, string> = {
  gasoline: 'Gasolina',
  ethanol: 'Etanol',
  flex: 'Flex',
  diesel: 'Diesel',
  electric: 'Elétrico',
  hybrid: 'Híbrido',
};

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number | null;
  plate: string | null;
  fuel_type: FuelType;
  photo_key: string | null;
  category: 'car' | 'motorcycle';
  color: string;
  odometer_initial: number | null;
  tank_capacity_liters: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}
