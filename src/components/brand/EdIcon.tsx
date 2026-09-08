import { SVGProps } from 'react';

/**
 * EdIcon — EdRetail brand iconography.
 *
 * A small, deliberate icon family derived from the EdRetail identity:
 * EDR Navy (#123B6D), wellness emerald (#0E6B52), and harvest gold (#C5A059).
 * Symbols are geometric, stroke-based, and share a consistent 1.75 stroke
 * weight and rounded joins so they sit comfortably next to Lucide utility
 * icons without competing with them.
 *
 * Usage rules:
 *  - Brand/product concepts (wellness, growth, SV, distributor identity,
 *    flyer marketing) → EdIcon.
 *  - Utility controls (nav, edit, delete, arrows, phone…) → Lucide.
 *  - Decoration → remove it entirely.
 */
export type EdSymbol =
  | 'leaf' // wellness / product vitality
  | 'growth' // goals, progress, rank advancement
  | 'commerce' // sales, orders, storefront
  | 'distributor' // distributor identity / network
  | 'delivery' // logistics, zones, dispatch
  | 'flyer' // Flyer Studio / marketing
  | 'sv' // SV points — achievement value, not decoration
  | 'shield' // trust, verification, security
  | 'care' // CRM, customer relationship
  | 'radiance'; // product benefit emphasis (replaces "sparkle" semantics)

interface EdIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: EdSymbol;
  /** Defaults to currentColor so brand color comes from the context. */
  className?: string;
}

const PATHS: Record<EdSymbol, React.ReactNode> = {
  // A single organic leaf with a stem — the wellness motif.
  leaf: (
    <>
      <path d="M4 20c0-8 5-14 16-15 1 9-4 15-12 15-2.5 0-4-.5-4 0Z" />
      <path d="M4 20c4-6 9-9 13-11" />
    </>
  ),
  // Ascending steps inside a circle — measured progress, not fireworks.
  growth: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="m8.5 13.5 2.5-3 2 2 3-4" />
      <path d="M16 8.5v2.5h-2.5" />
    </>
  ),
  // A receipt + coin pairing — commerce grounded in records.
  commerce: (
    <>
      <path d="M6 3.75h9.5L19 7.25v13H6z" />
      <path d="M9 8h7M9 11.5h7M9 15h3.5" />
      <circle cx="16.5" cy="16.5" r="3.75" />
      <path d="M16.5 14.75v3.5M15 16.5h3" />
    </>
  ),
  // A person with a shared node — one distributor, connected.
  distributor: (
    <>
      <circle cx="9.5" cy="8" r="3.25" />
      <path d="M4.5 19c0-3 2.2-5 5-5s5 2 5 5" />
      <circle cx="17.5" cy="6.5" r="2" />
      <path d="M16.75 11.5c2.5.4 4 2 4 4.5" />
    </>
  ),
  // A parcel with a motion line — delivery as logistics, not rockets.
  delivery: (
    <>
      <path d="M4.75 8.25 12 4.5l7.25 3.75v7.5L12 19.5l-7.25-3.75z" />
      <path d="M4.75 8.25 12 12l7.25-3.75M12 12v7.5" />
      <path d="M2.5 16.5c1.5-.5 2.5-.5 4 0" />
    </>
  ),
  // A rectangle canvas with a brush stroke — creative marketing output.
  flyer: (
    <>
      <rect x="4.5" y="4.5" width="15" height="15" rx="1.5" />
      <path d="M8 9.5h8M8 13h5" />
      <path d="m13.5 15.5 2 2 3.5-3.5" />
    </>
  ),
  // SV — a hexagon value badge with a rising tick inside.
  sv: (
    <>
      <path d="M12 3.5 19.5 8v8L12 20.5 4.5 16V8z" />
      <path d="m9 12.5 2 2 4-4.5" />
    </>
  ),
  // A shield with a leaf vein — protection that stays on-brand.
  shield: (
    <>
      <path d="M12 3.5 19 6v6c0 4.5-3.5 7.5-7 8.5-3.5-1-7-4-7-8.5V6z" />
      <path d="M12 8v6M9.5 10.5h5" />
    </>
  ),
  // Two hands-ish arcs around a heart node — customer care.
  care: (
    <>
      <path d="M12 18.5s-6-3.6-6-8a3.4 3.4 0 0 1 6-2.2 3.4 3.4 0 0 1 6 2.2c0 4.4-6 8-6 8Z" />
      <path d="M4.5 9.5C4.5 6 7 4.5 9.5 4.5M19.5 9.5c0-3.5-2.5-5-5-5" />
    </>
  ),
  // Radiance: three measured rays — emphasis with restraint, not sparkle.
  radiance: (
    <>
      <circle cx="12" cy="13" r="3.25" />
      <path d="M12 4.5v2.75M6 6.5l1.9 1.9M18 6.5l-1.9 1.9" />
    </>
  ),
};

export function EdIcon({ name, className = 'w-4 h-4', ...rest }: EdIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
