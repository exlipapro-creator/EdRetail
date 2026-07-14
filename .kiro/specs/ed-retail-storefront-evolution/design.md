# Design Document — ED Retail Storefront Evolution

## Overview

This document describes the technical architecture and implementation plan for the ED Retail Storefront Evolution. The project is a React 18 / TypeScript / Tailwind CSS / Framer Motion / Supabase SPA. All changes are additive or in-place modifications to the existing codebase; no framework migrations are required.

The evolution targets eight areas: (1) HeroCarousel editorial redesign, (2) typography hierarchy tightening, (3) accent-colour simplification, (4) App.tsx section reorder, (5) motion token extension, (6) CheckoutSheet Supabase order insert, (7) nightly low-stock WhatsApp alert via Edge Function, and (8) a new BestSellers component.

---

## Architecture

The storefront is a single-page React application bundled with Vite. The runtime dependency graph relevant to this evolution is:

```
App.tsx
├── HeroCarousel        ← redesigned (Req 1)
├── BestSellers         ← new component (Req 8)
├── P4GoalPicker
├── Bundles
├── ProductsGrid        ← reordered before DistributorBio (Req 4)
│   └── ProductCard     ← typography + colour changes (Req 2, 3)
├── DistributorBio      ← moved after ProductsGrid (Req 4)
├── Testimonials
├── DeliveryInfo
└── CheckoutSheet       ← Supabase insert + motion token (Req 5, 6)

src/design/motion.ts    ← extended with heroFade + calmSpring (Req 5)
supabase/functions/
└── low-stock-alert/    ← new Edge Function (Req 7)
```

**Data flow for BestSellers:**
`Supabase.sales` → `useBestSellers()` hook (JSONB aggregation) → `BestSellers` component → ranked `ProductCard` subset.

**Data flow for CheckoutSheet insert:**
Cart state + customer form → `supabase.from('sales').insert(...)` (anon client) → WhatsApp redirect.

---

## Component Designs

### 1. HeroCarousel Redesign

**File:** `src/components/HeroCarousel.tsx`

**Changes from current implementation:**

- Replace `INTERVAL = 4500` with `INTERVAL = 8000`.
- Replace all slide `bg` gradient classes with warm/earthy Tailwind palettes. Each slide uses one of:
  - `from-amber-800 to-amber-950`
  - `from-stone-700 to-stone-900`
  - `from-orange-800 to-orange-950`
  - `from-yellow-800 to-yellow-950`
  - `from-amber-700 to-stone-900`

- Add `DecorativeBgImage`: an absolutely-positioned `<img>` rendered inside each slide's wrapper, behind the text flex row. It displays the slide's product image at oversized scale with low opacity.
- Remove the secondary WhatsApp `<a>` button from each slide; keep exactly one `<a href="#products">` CTA per slide.
- Apply `motionTokens.easings.heroFade` as the `transition` prop for the cross-fade animation between slides.

**DecorativeBgImage positioning spec:**

```tsx
// Inside each slide's relative container, before the text content div:
<img
  src={slide.image}
  aria-hidden="true"
  className="absolute right-0 top-1/2 -translate-y-1/2 h-[70%] w-auto object-contain opacity-10 pointer-events-none select-none"
/>
```

The image is `aria-hidden` because it carries no informational value — the visible product image thumbnail is the one inside the content flex row.

**Slide data shape (updated):**

```ts
interface Slide {
  id: string;
  headline: string;
  highlight: string;
  sub: string;
  bg: string;        // warm gradient classes
  accent: string;    // text colour for highlight span
  cta: string;       // CTA button label
  image: string;     // path shared by both thumbnail and DecorativeBgImage
}
// NOTE: 'tag' field removed — micro-label per Req 2.3
```

**Updated SLIDES array (warm palette mapping):**

| Slide | Old bg | New bg |
|---|---|---|
| mrt | `from-blue-800 to-blue-950` | `from-amber-800 to-amber-950` |
| splina | `from-green-800 to-green-950` | `from-stone-700 to-stone-900` |
| spirulina | `from-teal-800 to-teal-950` | `from-orange-800 to-orange-950` |
| ginseng | `from-amber-800 to-amber-950` | `from-yellow-800 to-yellow-950` |
| cocollagen | `from-rose-800 to-rose-950` | `from-amber-700 to-stone-900` |


**Screen-reader live region (unchanged behaviour, updated text):**

```tsx
<div className="sr-only" aria-live="polite" aria-atomic="true">
  {`Slide ${current + 1} of ${SLIDES.length}: ${SLIDES[current].highlight}`}
</div>
```

---

### 2. Typography Hierarchy

**Files affected:** `src/App.tsx`, `src/components/ProductCard.tsx`, `src/components/BestSellers.tsx`

#### Section Headings

All `h2`/`h3` section-level headings that title a content block (All Products, Best Sellers, What Our Customers Say, Bundles, etc.) must carry `text-2xl font-semibold`. The current `App.tsx` heading for the products section uses `text-base` — this must be upgraded.

**Before (App.tsx):**
```tsx
<h3 className="font-semibold text-gray-900 text-base">
  {activeCategory === 'all' ? '...' : t(activeCategoryData!.label)}
</h3>
```

**After:**
```tsx
<h2 className="font-semibold text-gray-900 text-2xl">
  {activeCategory === 'all' ? '...' : t(activeCategoryData!.label)}
</h2>
```

Similarly apply `text-2xl` to the headings in `Testimonials.tsx`, `Bundles.tsx`, `DeliveryInfo.tsx` where they currently use smaller sizes.

#### ProductCard Price Prominence

**Before (ProductCard.tsx):**
```tsx
<span className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</span>
<span className="text-[10px] text-gray-400 font-medium">TZS</span>
```

**After:**
```tsx
<span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
<span className="text-xs text-gray-400 font-medium">TZS</span>
```

#### Micro-label Removal

The `tag` field (e.g., `'P4 Slimming Program · Step 1'`) rendered as a small pill in each `HeroSlide` is a micro-label. It duplicates category and product badge information. Remove the `tag` field from the `Slide` interface and its corresponding `<span>` element in the carousel render.

---

### 3. Colour Simplification

**Files affected:** `src/components/HeroCarousel.tsx`, `src/components/DistributorBio.tsx`, `src/App.tsx`


The colour rule is: only `indigo-*` and `green-*` as accent colours on interactive elements outside of `CategoryBadge`.

**Audit and replacements:**

| Location | Old class | New class | Note |
|---|---|---|---|
| `HeroCarousel` CTA button | `bg-indigo-600 hover:bg-indigo-700` | unchanged | already indigo |
| `DistributorBio` banner | `from-blue-700 via-blue-600 to-indigo-600` | `from-indigo-700 via-indigo-600 to-indigo-700` | replace blue |
| `App.tsx` sticky cart button | `bg-indigo-600 hover:bg-indigo-700` | unchanged | already indigo |
| `CheckoutSheet` submit button | `bg-green-600 hover:bg-green-700` | unchanged | already green |
| `ProductCard` add button | `bg-indigo-600 hover:bg-indigo-700` | unchanged | already indigo |
| `ProductCard` qty+ button | `bg-indigo-600` | unchanged | already indigo |
| `ProductCard` `CATEGORY_BADGE_COLOR` | multi-colour | unchanged | exempt (CategoryBadge) |

The `primary-*` colour tokens defined in `tailwind.config.js` resolve to indigo-adjacent values (`#6366F1` = `indigo-500`). Components already using `bg-primary-600` remain compliant; the `primary` semantic alias is considered equivalent to `indigo` for this rule.

---

### 4. App.tsx Section Reorder

**File:** `src/App.tsx`

Current render order:
1. Header
2. HeroCarousel
3. **DistributorBio** ← must move
4. P4GoalPicker
5. Bundles
6. ProductsGrid (CategoryTabs + SearchBar + ProductCard grid)
7. Testimonials

Target render order:
1. Header
2. HeroCarousel
3. **BestSellers** ← new (Req 8)
4. P4GoalPicker
5. Bundles
6. ProductsGrid (CategoryTabs + SearchBar + ProductCard grid)
7. **DistributorBio** ← moved here
8. Testimonials

This change involves: (a) moving the `<DistributorBio />` JSX block from immediately after `<HeroCarousel />` to after the ProductsGrid section's closing `</section>`, and (b) inserting `<BestSellers />` between `<HeroCarousel />` and `<P4GoalPicker />`.

No changes to the components themselves are required for the reorder.

---

### 5. Motion Token Extension

**File:** `src/design/motion.ts`


Add two tokens to the `easings` key:

```ts
export const motionTokens = {
  durations: {
    fast:   0.09,
    hover:  0.14,
    medium: 0.20,
    page:   0.25,
    slow:   0.35,
  },

  easings: {
    inOut:  'easeInOut',
    out:    'easeOut',
    spring: { type: 'spring', stiffness: 400, damping: 30 },

    // New tokens:
    heroFade: {
      type: 'tween',
      ease: 'easeInOut',
      duration: 0.7,           // 700ms — within [0.6, 0.9] range
    },
    calmSpring: {
      type: 'spring',
      stiffness: 260,          // within [200, 300]
      damping: 30,             // within [25, 35]
    },
  },

  // Pre-composed spring config (retained for backward-compat)
  spring: { type: 'spring', stiffness: 400, damping: 30 },
} as const;
```

**Consumer updates:**

- `HeroCarousel.tsx`: replace the `transition-opacity duration-700` CSS approach with a Framer Motion `motion.div` using `transition={motionTokens.easings.heroFade}` for the cross-fade.
- `CheckoutSheet.tsx`: change the slide-up `motion.div` transition from `{ type: 'spring', damping: motionTokens.spring.damping, stiffness: motionTokens.spring.stiffness }` to `motionTokens.easings.calmSpring`.

---

### 6. CheckoutSheet Supabase Insert

**File:** `src/components/CheckoutSheet.tsx`

**Supabase RLS requirement:** The existing schema grants `sales` access only to `authenticated` roles. A new anonymous-insert policy must be added:

```sql
-- Required migration (add to supabase-schema.sql):
create policy "sales_anon_insert"
  on sales for insert
  with check (true);
```

This policy allows unauthenticated (anon-key) clients to insert rows into `sales`, while keeping all read/update/delete operations restricted to authenticated admin users.

**Insert logic (added to `handleSubmit` in `CheckoutSheet.tsx`):**

```ts
import { supabase } from '../lib/supabase';

// Inside handleSubmit, before setIsSubmitting(false):
const orderRecord = {
  channel: 'app' as const,
  status: 'pending' as const,
  customer_name: name,
  customer_phone: phone,
  customer_location: location,
  items: items.map((i) => ({
    productId: i.id,
    name: i.name,
    price: i.price,
    quantity: i.quantity,
  })),
  subtotal: totalPrice,
};

const { error: insertError } = await supabase
  .from('sales')
  .insert(orderRecord);

if (insertError) {
  setInsertError(true);
  setTimeout(() => setInsertError(false), 3000);
  // Do NOT return — continue to WhatsApp redirect
}
```

**New state:**

```ts
const [insertError, setInsertError] = useState(false);
```

**Error indicator UI (non-blocking, shown above submit button area):**

```tsx
{insertError && (
  <p className="text-center text-xs text-amber-600 mt-2">
    {lang === 'sw'
      ? 'Hitilafu ndogo: agizo halikuhifadhiwa, lakini WhatsApp inafungua.'
      : 'Minor issue: order not saved, but WhatsApp will still open.'}
  </p>
)}
```

**Async flow change:** `handleSubmit` becomes `async` to `await` the Supabase insert before proceeding to the success state transition.


---

### 7. Nightly Low-Stock WhatsApp Alert — Edge Function

**File:** `supabase/functions/low-stock-alert/index.ts`

**WhatsApp delivery method: CallMeBot (free, no API approval required)**

CallMeBot sends a WhatsApp message to a personal number via a simple GET request. Setup is a one-time step:
1. Send `I allow callmebot to send me messages` to `+34 644 59 77 98` on WhatsApp.
2. You receive an API key back immediately.
3. Store that key as the `CALLMEBOT_API_KEY` secret.

API call format:
```
GET https://api.callmebot.com/whatsapp.php?phone=PHONE&text=MESSAGE&apikey=API_KEY
```

**Directory structure:**

```
supabase/
  functions/
    low-stock-alert/
      index.ts
  config.toml          ← cron schedule defined here
```

**`supabase/config.toml` schedule entry:**

```toml
[functions.low-stock-alert]
schedule = "0 20 * * *"   # 20:00 UTC daily ≡ 23:00 EAT (UTC+3)
```

**Edge Function implementation:**

```ts
// supabase/functions/low-stock-alert/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LOW_STOCK_THRESHOLD = 5;

Deno.serve(async () => {
  const supabaseUrl  = Deno.env.get('SUPABASE_URL')!;
  const serviceKey   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const phone        = Deno.env.get('DISTRIBUTOR_WHATSAPP_PHONE')!;  // e.g. 255783481416
  const apiKey       = Deno.env.get('CALLMEBOT_API_KEY')!;

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: lowStock, error } = await supabase
    .from('products')
    .select('id, name_en, stock_qty')
    .eq('in_stock', true)
    .gt('stock_qty', 0)
    .lte('stock_qty', LOW_STOCK_THRESHOLD);

  if (error) {
    console.error('Query error:', error);
    return new Response('Query failed', { status: 500 });
  }

  if (!lowStock || lowStock.length === 0) {
    console.log('No low-stock products. Exiting.');
    return new Response('OK – no alerts', { status: 200 });
  }

  const lines = lowStock
    .map((p, i) => `${i + 1}. ${p.name_en} — ${p.stock_qty} units remaining`)
    .join('%0A');  // URL-encoded newline for CallMeBot

  const message = encodeURIComponent(
    `🔔 Low Stock Alert\n\nProducts running low:\n\n${lowStock
      .map((p, i) => `${i + 1}. ${p.name_en} — ${p.stock_qty} units remaining`)
      .join('\n')}\n\nPlease reorder soon.`
  );

  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${message}&apikey=${apiKey}`;

  const res = await fetch(url, { method: 'GET' });

  if (!res.ok) {
    const ids = lowStock.map((p) => p.id).join(', ');
    console.error(`CallMeBot dispatch failed (${res.status}). Affected product IDs: ${ids}`);
    return new Response('Dispatch failed', { status: 502 });
  }

  console.log(`Low-stock alert sent for ${lowStock.length} product(s).`);
  return new Response('Alert sent', { status: 200 });
});
```

**Environment secrets (set via Supabase Dashboard → Settings → Edge Functions):**

| Secret key | Description |
|---|---|
| `DISTRIBUTOR_WHATSAPP_PHONE` | Distributor's phone in international format without `+` (e.g. `255783481416`) |
| `CALLMEBOT_API_KEY` | API key received from CallMeBot after one-time WhatsApp setup |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by the Supabase runtime.

**One-time CallMeBot setup (do this before deploying):**
1. On WhatsApp, send `I allow callmebot to send me messages` to `+34 644 59 77 98`
2. Wait for the reply containing your API key (usually under 1 minute)
3. Save that key as `CALLMEBOT_API_KEY` in Supabase Edge Function secrets

---

### 8. BestSellers Component

**File:** `src/components/BestSellers.tsx`

**Data model:**

```ts
interface BestSellerEntry {
  productId: string;
  totalUnits: number;
}
```

**Custom hook — `useBestSellers`:**

```ts
// Inside BestSellers.tsx (co-located hook)
function useBestSellers() {
  const [entries, setEntries]   = useState<BestSellerEntry[] | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('sales')
          .select('items, status')
          .neq('status', 'cancelled');

        if (error || cancelled) return;

        // Aggregate units per productId from JSONB items arrays
        const totals: Record<string, number> = {};
        for (const row of data ?? []) {
          const lineItems: Array<{ productId?: string; id?: string; quantity: number }> =
            row.items ?? [];
          for (const li of lineItems) {
            const pid = li.productId ?? li.id;
            if (!pid) continue;
            totals[pid] = (totals[pid] ?? 0) + (li.quantity ?? 1);
          }
        }

        const sorted: BestSellerEntry[] = Object.entries(totals)
          .map(([productId, totalUnits]) => ({ productId, totalUnits }))
          .filter((e) => e.totalUnits > 0)
          .sort((a, b) => b.totalUnits - a.totalUnits)
          .slice(0, 4);

        if (!cancelled) setEntries(sorted);
      } catch {
        // Silently suppress per Req 8.6
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { entries, loading };
}
```

**Component render logic:**

```tsx
export function BestSellers() {
  const { lang, t } = useLang();
  const { entries, loading } = useBestSellers();

  // Loading state: 3 skeleton cards (Req 8.7)
  if (loading) {
    return (
      <section className="max-w-lg mx-auto px-4 py-5">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {lang === 'sw' ? 'Bidhaa Maarufu' : 'Best Sellers'}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      </section>
    );
  }

  // Do not render if fewer than 3 valid results (Req 8.3)
  if (!entries || entries.length < 3) return null;

  // Resolve product data from static PRODUCTS list
  const resolvedProducts = entries
    .map((e) => PRODUCTS.find((p) => p.id === e.productId))
    .filter((p): p is Product => Boolean(p));

  if (resolvedProducts.length < 3) return null;

  return (
    <section className="max-w-lg mx-auto px-4 py-5">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        {lang === 'sw' ? 'Bidhaa Maarufu' : 'Best Sellers'}
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {resolvedProducts.map((product, idx) => (
          <div key={product.id} className="relative">
            {idx === 0 && (
              <span className="absolute -top-2 -left-1 z-10 px-2 py-0.5 bg-amber-400 text-amber-900 text-[9px] font-bold rounded-full uppercase tracking-wide shadow-sm">
                #1
              </span>
            )}
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
```

**Imports required:** `supabase` from `../lib/supabase`, `PRODUCTS`, `Product` from `../types`, `SkeletonCard` from `./SkeletonCard`, `useLang` from `../context/LangContext`.

---

## Data Models

### OrderRecord (sales table insert payload)

```ts
interface OrderRecord {
  channel: 'app';
  status: 'pending';
  customer_name: string;
  customer_phone: string;
  customer_location: string;
  items: Array<{
    productId: string;
    name: { en: string; sw: string };
    price: number;
    quantity: number;
  }>;
  subtotal: number;
}
```

Maps directly to the existing `sales` table schema. The `id`, `created_at`, and `updated_at` fields are auto-generated by Supabase.

### BestSellerEntry

```ts
interface BestSellerEntry {
  productId: string;   // matches products.id
  totalUnits: number;  // sum of quantity across non-cancelled sales
}
```


---

## Error Handling

### CheckoutSheet Insert Failure

If `supabase.from('sales').insert(...)` rejects or returns a non-null `error`:
- Set `insertError = true` for 3000ms (non-blocking toast-style inline message).
- Continue execution — the WhatsApp redirect must not be blocked.
- Log `insertError` to the console for debugging.

### BestSellers Query Failure

Any exception or Supabase error in `useBestSellers` is caught silently. The component returns `null` — no error UI is displayed to the customer.

### Edge Function WhatsApp Failure

If the WhatsApp HTTP request returns a non-2xx status:
- Log the HTTP status code and the full list of low-stock product IDs to stdout (visible in Supabase Edge Function logs).
- Return HTTP 502 from the Edge Function to signal failure to the Supabase scheduler.
- Do not retry automatically — the next scheduled invocation handles the following night's alert.

---

## Interfaces

### motionTokens (extended)

```ts
const motionTokens: {
  durations: { fast: 0.09; hover: 0.14; medium: 0.20; page: 0.25; slow: 0.35 };
  easings: {
    inOut: 'easeInOut';
    out: 'easeOut';
    spring: { type: 'spring'; stiffness: 400; damping: 30 };
    heroFade: { type: 'tween'; ease: 'easeInOut'; duration: 0.7 };
    calmSpring: { type: 'spring'; stiffness: 260; damping: 30 };
  };
  spring: { type: 'spring'; stiffness: 400; damping: 30 };
}
```

### Slide (HeroCarousel, updated)

```ts
interface Slide {
  id: string;
  headline: string;     // e.g. 'Manage your weight with'
  highlight: string;    // e.g. 'MRT Complex'
  sub: string;          // short description line
  bg: string;           // warm gradient Tailwind classes
  accent: string;       // highlight text colour class (warm tone)
  cta: string;          // CTA button label
  image: string;        // product image path
  // 'tag' field REMOVED
}
```

### BestSellers Props

`BestSellers` accepts no props — all state is managed via the `useBestSellers` hook.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: DecorativeBgImage present and within opacity bounds for every active slide

*For any* slide index in the HeroCarousel (0 to N-1), when that slide is rendered as the active slide, the DecorativeBgImage element SHALL exist in the DOM with `aria-hidden="true"`, be absolutely positioned, and have an opacity value between 0.08 and 0.15 inclusive.

**Validates: Requirements 1.2**

### Property 2: Carousel wrap-around holds for any slide count

*For any* carousel with N slides, advancing forward from the last slide (index N-1) SHALL activate slide 0 as the next current slide.

**Validates: Requirements 1.4**

### Property 3: Each HeroSlide contains exactly one CTA with no WhatsApp button

*For any* rendered HeroSlide, there SHALL be exactly one anchor element linking to `#products` and zero anchor/button elements that link to a WhatsApp URL.

**Validates: Requirements 1.7**


### Property 4: All section headings carry text-2xl

*For any* section-level heading element (h2/h3 used as a block title) rendered in the Storefront, it SHALL have the `text-2xl` Tailwind class applied, including BestSellers, Products section, Testimonials, Bundles, and DeliveryInfo headings.

**Validates: Requirements 2.1, 8.5**

### Property 5: ProductCard price is always visually dominant

*For any* product in the catalogue, the ProductCard rendered for that product SHALL display the price text with a CSS class of `text-lg` or larger AND `font-bold` or heavier weight.

**Validates: Requirements 2.2**

### Property 6: No non-exempt accent colours on interactive elements

*For any* interactive element rendered in the Storefront that is not a CategoryBadge (i.e., buttons, focus rings, active indicators), it SHALL NOT carry any Tailwind class from the `violet-*`, `blue-*`, `teal-*`, `rose-*`, or `amber-*` accent families.

**Validates: Requirements 3.1, 3.3**

### Property 7: CheckoutSheet insert always includes all required OrderRecord fields

*For any* non-empty cart state and valid customer form values (name, phone, location), submitting the CheckoutSheet SHALL invoke `supabase.from('sales').insert(record)` where `record` contains `channel: 'app'`, `status: 'pending'`, `customer_name`, `customer_phone`, `customer_location`, a non-empty `items` array, and a positive `subtotal`.

**Validates: Requirements 6.1, 6.2**

### Property 8: Low-stock filter returns exactly products with 0 < stock_qty ≤ 5 and in_stock = true

*For any* array of product rows with varying `stock_qty` and `in_stock` values, the LowStockAlertFunction's filter query SHALL return exactly those rows where `in_stock` is `true` AND `stock_qty` is greater than 0 AND `stock_qty` is less than or equal to 5, and no others.

**Validates: Requirements 7.2**

### Property 9: Low-stock alert dispatches exactly one message for any non-empty low-stock list

*For any* non-empty list of low-stock products, the LowStockAlertFunction SHALL make exactly one HTTP POST request to the WhatsApp API endpoint, and the request body SHALL contain a numbered list that includes every product's name and `stock_qty`.

**Validates: Requirements 7.3**

### Property 10: BestSellers aggregation correctly sums quantities excluding cancelled sales

*For any* array of sales rows (with varying `items` JSONB arrays and `status` values), the `useBestSellers` aggregation SHALL return a list where each entry's `totalUnits` equals the sum of `quantity` across all non-cancelled rows for that `productId`, and SHALL NOT include any units from rows with `status = 'cancelled'`.

**Validates: Requirements 8.1**

### Property 11: BestSellers renders top products in descending order of units sold

*For any* aggregated BestSellerEntry list, the BestSellers component SHALL render products in descending order of `totalUnits` (highest first), and SHALL NOT render more than 4 products.

**Validates: Requirements 8.2**

