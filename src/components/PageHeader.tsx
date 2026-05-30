import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: ReactNode;
  chip?: string;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  back,
  action,
  chip,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      title={title}
      aria-label={title}
      className={cn(
        'px-5 pb-3 border-b-2 border-[var(--border)] bg-transparent',
        className,
      )}
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 1rem)' }}
    >
      <div className="flex items-center gap-3">
        {back && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-9 w-9 flex items-center justify-center rounded-full transition-colors cursor-pointer"
            style={{ color: 'rgba(13,13,13,0.5)' }}
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1
              className="font-bold leading-tight truncate"
              style={{
                fontFamily: "'Bodoni Moda Variable', Georgia, serif",
                fontVariationSettings: "'opsz' 72, 'wght' 700",
                fontSize: 22,
                color: '#0D0D0D',
              }}
            >
              {title}
            </h1>
            {chip && (
              <span
                className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-[var(--border)] uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#1A1816',
                }}
              >
                {chip}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm mt-0.5" style={{ color: 'rgba(13,13,13,0.6)' }}>{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
