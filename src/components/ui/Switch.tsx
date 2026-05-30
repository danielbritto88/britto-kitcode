import * as RadixSwitch from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
}: SwitchProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      {label && <span className="text-sm text-muted flex-1">{label}</span>}
      <RadixSwitch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer shrink-0',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          checked ? 'bg-accent' : 'bg-border',
        )}
      >
        <RadixSwitch.Thumb className="block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
      </RadixSwitch.Root>
    </div>
  );
}
