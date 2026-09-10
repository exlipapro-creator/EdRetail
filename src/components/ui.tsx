import { ReactNode, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

/** Join conditional class names. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/* ── Section header ──────────────────────────────────────────────────────────
 * One consistent header pattern for every storefront section:
 * micro-label → title → optional sub-line, with optional right-side aside.
 * -------------------------------------------------------------------------- */
export function SectionHeader({
  label,
  title,
  sub,
  aside,
}: {
  label?: string;
  title: string;
  sub?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div className="min-w-0">
        {label && <span className="section-label mb-2">{label}</span>}
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h2>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {aside && <div className="flex-shrink-0">{aside}</div>}
    </div>
  );
}

/* ── Badge ───────────────────────────────────────────────────────────────────
 * Compact status/tag pill. Tones are semantic — never decorative.
 * -------------------------------------------------------------------------- */
type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'gold' | 'neutral';

const BADGE_TONES: Record<BadgeTone, string> = {
  primary: 'bg-primary-50 text-primary-700 border-primary-200',
  success: 'bg-success-50 text-success-700 border-success-100',
  warning: 'bg-warning-50 text-warning-700 border-warning-100',
  danger:  'bg-danger-50 text-danger-600 border-danger-100',
  gold:    'bg-gold-50 text-gold-800 border-gold-200',
  neutral: 'bg-neutral-50 text-neutral-600 border-neutral-200',
};

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap',
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────────────
 * "What happened + what to do next" — used wherever a data list can be empty.
 * -------------------------------------------------------------------------- */
export function EmptyState({
  icon,
  title,
  sub,
  action,
}: {
  icon: ReactNode;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-12 text-gray-400">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {sub && <p className="text-xs mt-1 max-w-xs leading-relaxed">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ── Spinner ───────────────────────────────────────────────────────────────── */
export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn('w-8 h-8 text-primary-500 animate-spin', className)}
      aria-label="Loading"
      role="status"
    />
  );
}

/* ── Button classes ──────────────────────────────────────────────────────────
 * Shared button vocabulary. Use buttonClasses() for anchors, <Button> for
 * real buttons. One primary action per view — everything else is secondary.
 * -------------------------------------------------------------------------- */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:   'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-card',
  secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
  ghost:     'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  danger:    'bg-red-600 hover:bg-red-700 text-white',
};

export function buttonClasses(variant: ButtonVariant = 'primary', extra?: string): string {
  return cn(
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed',
    BUTTON_VARIANTS[variant],
    extra,
  );
}

/* ── Page header (admin) ───────────────────────────────────────────────────── */
export function PageHeader({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {sub && <p className="text-sm text-gray-500 mt-0.5">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

/* ── Filter pills (admin lists) ────────────────────────────────────────────── */
export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div
      className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide"
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors outline-none',
            value === o.value
              ? 'bg-primary-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ── Form field (admin) ────────────────────────────────────────────────────── */
export const inputClasses =
  'w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all';

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

/* ── Modal ───────────────────────────────────────────────────────────────────
 * Bottom sheet on mobile, centered dialog on desktop. Sticky header/footer,
 * single scroll region, Escape to close, body scroll locked while open.
 * -------------------------------------------------------------------------- */
const MODAL_SIZES = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
} as const;

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof MODAL_SIZES;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-white w-full rounded-t-2xl sm:rounded-2xl shadow-overlay max-h-[92vh] sm:max-h-[85vh] flex flex-col',
          MODAL_SIZES[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors outline-none"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">{footer}</div>
        )}
      </div>
    </div>
  );
}
