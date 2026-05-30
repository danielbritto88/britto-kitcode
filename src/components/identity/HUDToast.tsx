import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

// HUD Toast — substitui o Toast padrão. Sem fundo: apenas texto âmbar com glow,
// posição superior, swipe-up dispensa. PROJETO.md §8.5/§8.6.
export type HUDToastVariant = 'success' | 'warning' | 'error' | 'info';

type HUDToastProps = {
  open: boolean;
  message: string;
  variant?: HUDToastVariant;
  onDismiss?: () => void;
  durationMs?: number;
};

const COLOR_BY_VARIANT: Record<HUDToastVariant, string> = {
  success: 'var(--accent)',
  info: 'var(--accent)',
  warning: 'var(--warning)',
  error: 'var(--danger)',
};

export function HUDToast({
  open,
  message,
  variant = 'info',
  onDismiss,
  durationMs = 3500,
}: HUDToastProps) {
  useEffect(() => {
    if (!open || !onDismiss) return;
    const id = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(id);
  }, [open, onDismiss, durationMs]);

  const color = COLOR_BY_VARIANT[variant];
  const role = variant === 'error' ? 'alert' : 'status';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role={role}
          aria-live={variant === 'error' ? 'assertive' : 'polite'}
          initial={{ y: -32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -32, opacity: 0 }}
          drag="y"
          dragConstraints={{ top: -80, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.y < -24) onDismiss?.();
          }}
          transition={{ type: 'spring', damping: 22, stiffness: 280, mass: 0.6 }}
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
          }}
          className={cn(
            'fixed inset-x-4 top-0 z-[110] flex justify-center pointer-events-none',
          )}
        >
          <div
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
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
