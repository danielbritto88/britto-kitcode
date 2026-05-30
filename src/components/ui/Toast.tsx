/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const COLOR_BY_TYPE: Record<ToastType, string> = {
  success: 'var(--accent)',
  info: 'var(--accent)',
  warning: 'var(--warning)',
  error: 'var(--danger)',
};

// Telemetria Íntima v1.5 — HUDToast como provider padrão.
// Sem fundo, apenas glow âmbar/warning/danger via text-shadow.
// Mantém a API existente useToast() para callers ficarem inalterados.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3500) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed inset-x-0 z-[110] pointer-events-none flex flex-col items-center gap-2"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 14px)' }}
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <HUDPill key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function HUDPill({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const color = COLOR_BY_TYPE[item.type];

  // Hide haptic-noise: no auto-haptic on display; emitter decides.
  useEffect(() => {
    /* nothing — provider handles auto-dismiss */
  }, []);

  const role = item.type === 'error' ? 'alert' : 'status';

  return (
    <motion.div
      role={role}
      aria-live={item.type === 'error' ? 'assertive' : 'polite'}
      layout
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -24, opacity: 0 }}
      drag="y"
      dragConstraints={{ top: -80, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.y < -24) onDismiss();
      }}
      transition={{ type: 'spring', damping: 22, stiffness: 280, mass: 0.6 }}
      className="px-4 py-2 rounded-full glass pointer-events-auto"
      style={{
        color,
        textShadow: `0 0 24px ${color}66`,
        border: `1px solid ${color}33`,
        fontFamily: '"Jost Variable", "Jost", system-ui, sans-serif',
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: 0.2,
      }}
    >
      {item.message}
    </motion.div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
