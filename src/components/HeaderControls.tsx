import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VehicleChip } from '@/components/VehicleChip';
import { haptic } from '@/lib/haptics';

export function HeaderControls() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-1">
      <VehicleChip />
      <button
        type="button"
        onClick={() => {
          haptic('tap');
          navigate('/ajustes');
        }}
        className="p-2 text-muted active:text-accent transition-colors"
        aria-label="Configurações"
      >
        <Settings size={18} strokeWidth={1.75} />
      </button>
    </div>
  );
}
