import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart2, Fuel, Home, Wrench, Plus, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptics';

import type { LucideIcon } from 'lucide-react';

interface Tab {
  to: string;
  icon: LucideIcon;
  label: string;
}

const tabs: Tab[] = [
  { to: '/inicio', icon: Home, label: 'Início' },
  { to: '/combustivel', icon: Fuel, label: 'Combustível' },
  { to: '/manutencao', icon: Wrench, label: 'Manutenção' },
  { to: '/relatorios', icon: BarChart2, label: 'Relatórios' },
];

interface FabMenuOption {
  label: string;
  icon: LucideIcon;
  action: 'fuel' | 'maint';
  color: string;
}

const FAB_OPTIONS: FabMenuOption[] = [
  {
    label: 'Abastecer',
    icon: Fuel,
    action: 'fuel',
    color: 'bg-[var(--accent)] text-[var(--accent-fg)]',
  },
  {
    label: 'Manutenção',
    icon: Wrench,
    action: 'maint',
    color: 'bg-[var(--danger)] text-white',
  },
];

export function BottomTabBarBrutal({
  onAddFuel,
  onAddMaint,
}: {
  onAddFuel?: () => void;
  onAddMaint?: () => void;
} = {}) {
  const [fabOpen, setFabOpen] = useState(false);

  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);

  function handleFab() {
    haptic('tap');
    setFabOpen((v) => !v);
  }

  return (
    <>
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            key="fab-backdrop"
            className="fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFabOpen(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') setFabOpen(false); }}
            tabIndex={-1}
            role="button"
            aria-label="Fechar menu"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fabOpen && (
          <motion.div
            key="fab-menu"
            className="fixed z-40 flex flex-col gap-2"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {FAB_OPTIONS.map(({ label, icon: Icon, action, color }) => (
              <button
                key={action}
                onClick={() => {
                  haptic('success');
                  setFabOpen(false);
                  if (action === 'fuel') onAddFuel?.();
                  if (action === 'maint') onAddMaint?.();
                }}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 rounded-xl',
                  'border-2 border-[var(--border)]',
                  'shadow-[var(--shadow-brutal-sm)]',
                  'font-semibold text-sm whitespace-nowrap',
                  'active:scale-95 transition-transform',
                  color,
                )}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        aria-label="Navegação principal"
        className="fixed z-30 bottom-4 left-4 right-4 max-w-md mx-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div
          className="relative flex items-center h-[72px] bg-[var(--surface)] rounded-[36px] border-[3px] border-[var(--border)] px-2"
          style={{ boxShadow: 'var(--shadow-brutal-md)' }}
        >
          {leftTabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => { haptic('tap'); setFabOpen(false); }}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 transition-colors h-full',
                  isActive ? 'text-[var(--text)]' : 'text-[var(--text-faint)]',
                )
              }
              aria-label={label}
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={cn('text-[10px]', isActive ? 'font-bold' : 'font-semibold')}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          <div className="flex items-center justify-center w-20 shrink-0 relative h-full">
            <button
              onClick={handleFab}
              aria-label={fabOpen ? 'Fechar menu' : 'Novo registro'}
              className={cn(
                'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[65%]',
                'w-[58px] h-[58px] rounded-[18px] flex items-center justify-center',
                'bg-[var(--accent)] text-[var(--accent-fg)]',
                'border-[3px] border-[var(--border)]',
                'active:translate-y-[calc(-65%+2px)] active:shadow-[var(--shadow-brutal-xs)]',
                'transition-[box-shadow,transform] duration-100',
              )}
              style={{ boxShadow: 'var(--shadow-brutal-md)' }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {fabOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <X size={28} strokeWidth={3} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="plus"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Plus size={32} strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {rightTabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => { haptic('tap'); setFabOpen(false); }}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 transition-colors h-full relative',
                  isActive ? 'text-[var(--text)]' : 'text-[var(--text-faint)]',
                )
              }
              aria-label={label}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={cn('text-[10px]', isActive ? 'font-bold' : 'font-semibold')}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
