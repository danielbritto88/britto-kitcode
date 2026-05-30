import { cn, formatCurrency } from '@/lib/utils';

interface MoneyProps {
  value: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  colorBySign?: boolean;
  className?: string;
}

const SIZE: Record<NonNullable<MoneyProps['size']>, string> = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-3xl',
  xl: 'text-5xl',
};

export function Money({ value, size = 'md', colorBySign = false, className }: MoneyProps) {
  const signColor = value < 0 ? 'text-danger' : value > 0 ? 'text-positive' : 'text-text';

  return (
    <span
      className={cn(
        'font-display tabular-nums tracking-tight',
        SIZE[size],
        colorBySign ? signColor : 'text-text',
        className,
      )}
    >
      {formatCurrency(value)}
    </span>
  );
}
