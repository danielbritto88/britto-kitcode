import { cn, formatDistance } from '@/lib/utils';

interface DistanceProps {
  km: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE: Record<NonNullable<DistanceProps['size']>, string> = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-3xl',
  xl: 'text-5xl',
};

export function Distance({ km, size = 'md', className }: DistanceProps) {
  return (
    <span
      className={cn(
        'font-display tabular-nums tracking-tight text-text',
        SIZE[size],
        className,
      )}
    >
      {formatDistance(km)}
    </span>
  );
}
