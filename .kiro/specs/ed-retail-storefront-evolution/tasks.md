# Implementation Plan: ED Retail Storefront Evolution

## Overview

This plan implements eight focused improvements to the ED Retail storefront: hero carousel redesign, typography tightening, accent-colour simplification, section reorder, motion token extension, CheckoutSheet Supabase order insert, nightly low-stock WhatsApp alert via Edge Function, and a new BestSellers component. All changes are in-place modifications or additions to the existing React 18 / TypeScript / Tailwind / Framer Motion / Supabase codebase.

---

## Tasks

- [ ] 1. Extend motion tokens module
  - [ ] 1.1 Add `heroFade` and `calmSpring` tokens to `src/design/motion.ts`
    - Add `heroFade: { type: 'tween', ease: 'easeInOut', duration: 0.7 }` under `easings`
    - Add `calmSpring: { type: 'spring', stiffness: 260, damping: 30 }` under `easings`
    - Ensure the `as const` assertion is preserved so all token types remain narrowly typed
    - _Requirements: 5.1, 5.2_

  - [ ]* 1.2 Write property test for motion tokens structure
    - **Property 1 (partial): heroFade duration is between 0.6 and 0.9 seconds**
    - **Property 1 (partial): calmSpring stiffness in [200,300] and damping in [25,35]**
    - **Validates: Requirements 5.1, 5.2**

- [ ] 2. Redesign HeroCarousel
  - [ ] 2.1 Update `src/components/HeroCarousel.tsx` — interval, slide data, and warm palette
    - Change `INTERVAL` constant from `4500` to `8000`
    - Remove `tag` field from the `Slide` interface
    - Update the `SLIDES` array to use warm/earthy gradients: `from-amber-800 to-amber-950`, `from-stone-700 to-stone-900`, `from-orange-800 to-orange-950`, `from-yellow-800 to-yellow-950`, `from-amber-700 to-stone-900`
    - Remove the secondary WhatsApp `<a>` button from each slide's render; retain exactly one `<a href="#products">` CTA per slide
    - Remove the `tag` micro-label `<span>` from the slide render
    - _Requirements: 1.3, 1.6, 1.7, 2.3, 3.1_

  - [ ] 2.2 Add DecorativeBgImage and migrate cross-fade to Framer Motion in `HeroCarousel.tsx`
    - Import `motionTokens` from `../design/motion`
    - Replace the CSS `transition-opacity duration-700` approach with a `motion.div` (Framer Motion) wrapping each slide, using `transition={motionTokens.easings.heroFade}` for the cross-fade
    - Inside each slide's relative container, render the `DecorativeBgImage` as an absolutely-positioned `<img aria-hidden="true">` at `opacity-10`, `h-[70%] w-auto object-contain`, `pointer-events-none select-none`, positioned `right-0 top-1/2 -translate-y-1/2`
    - Update the screen-reader live region text to `Slide ${current + 1} of ${SLIDES.length}: ${SLIDES[current].highlight}`
    - _Requirements: 1.1, 1.2, 1.5, 1.8, 1.9, 5.3, 5.4_

  - [ ]* 2.3 Write property tests for HeroCarousel correctness
    - **Property 2: Carousel wrap-around holds for any slide count — advancing from last slide activates slide 0**
    - **Property 3: Each rendered HeroSlide contains exactly one `#products` CTA and zero WhatsApp anchor/button elements**
    - **Property 1: DecorativeBgImage exists with `aria-hidden="true"` and opacity between 0.08 and 0.15 for every active slide**
    - **Validates: Requirements 1.2, 1.4, 1.7**

- [ ] 3. Tighten typography hierarchy
  - [ ] 3.1 Upgrade section headings in `src/App.tsx`
    - Change the ProductsGrid heading from `<h3 className="font-semibold text-gray-900 text-base">` to `<h2 className="font-semibold text-gray-900 text-2xl">`
    - _Requirements: 2.1_

  - [ ] 3.2 Upgrade section headings in `Testimonials.tsx`, `Bundles.tsx`, and `DeliveryInfo.tsx`
    - Apply `text-2xl font-semibold` to the h2/h3 block-title element in each of these three components where a smaller size is currently used
    - _Requirements: 2.1_

  - [ ] 3.3 Update `src/components/ProductCard.tsx` price display
    - Change price span from `text-sm font-semibold` to `text-lg font-bold`
    - Change currency label span from `text-[10px]` to `text-xs`
    - _Requirements: 2.2_

  - [ ]* 3.4 Write property test for typography requirements
    - **Property 4: All section-level heading elements rendered in the Storefront carry the `text-2xl` Tailwind class**
    - **Property 5: ProductCard price text has class `text-lg` (or larger) and `font-bold` (or heavier)**
    - **Validates: Requirements 2.1, 2.2, 8.5**

- [ ] 4. Simplify accent colours
  - [ ] 4.1 Update `src/components/DistributorBio.tsx` gradient
    - Replace `from-blue-700 via-blue-600 to-indigo-600` banner gradient with `from-indigo-700 via-indigo-600 to-indigo-700`
    - Verify no other `blue-*`, `teal-*`, `rose-*`, `violet-*`, or `amber-*` classes remain on non-CategoryBadge interactive elements in `DistributorBio.tsx`
    - _Requirements: 3.1, 3.3_

  - [ ] 4.2 Audit and clean remaining accent colours in `src/App.tsx` and `src/components/CheckoutSheet.tsx`
    - Confirm sticky cart button, submit button, and other interactive elements already use `indigo-*` or `green-*` only; fix any remaining violations
    - _Requirements: 3.1, 3.3_

  - [ ]* 4.3 Write property test for colour constraint
    - **Property 6: No interactive element (excluding CategoryBadge) carries a `violet-*`, `blue-*`, `teal-*`, `rose-*`, or `amber-*` accent class**
    - **Validates: Requirements 3.1, 3.3**

- [ ] 5. Checkpoint — verify Hero, typography, colour, and motion tasks
  - Ensure the project builds cleanly (`npm run build`) and all existing tests pass. Ask the user if questions arise.

- [ ] 6. Reorder App.tsx sections and wire BestSellers placeholder
  - [ ] 6.1 Reorder sections in `src/App.tsx`
    - Move `<DistributorBio />` JSX block from immediately after `<HeroCarousel />` to after the ProductsGrid section's closing `</section>`
    - Add a placeholder `{/* BestSellers will be inserted here */}` comment between `<HeroCarousel />` and `<P4GoalPicker />` — will be replaced in task 7.2
    - Confirm final render order: HeroCarousel → BestSellers → P4GoalPicker → Bundles → ProductsGrid → DistributorBio → Testimonials
    - _Requirements: 4.1, 4.2, 4.3, 8.4_

- [ ] 7. Implement BestSellers component
  - [ ] 7.1 Create `src/components/BestSellers.tsx` with `useBestSellers` hook
    - Define `BestSellerEntry` interface `{ productId: string; totalUnits: number }`
    - Implement `useBestSellers()` hook: query `sales` table, exclude `status = 'cancelled'` rows, aggregate `quantity` per `productId` from `items` JSONB array, sort descending, slice top 4
    - Handle query failure silently (catch → `setEntries([])`)
    - Export `BestSellers` component: render 3 SkeletonCards while loading; return `null` if fewer than 3 resolved products; render a 3-column grid of `ProductCard`s with a `#1` amber badge on the first card
    - Apply `text-2xl font-semibold` to the section heading ("Best Sellers" / "Bidhaa Maarufu")
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6, 8.7_

  - [ ] 7.2 Import and render `BestSellers` in `src/App.tsx`
    - Replace the placeholder comment from task 6.1 with `<BestSellers />`
    - _Requirements: 8.4_

  - [ ]* 7.3 Write property tests for BestSellers aggregation
    - **Property 10: `useBestSellers` totalUnits equals sum of quantity across non-cancelled rows per productId; cancelled rows contribute zero**
    - **Property 11: BestSellers renders products in descending totalUnits order and renders no more than 4**
    - **Validates: Requirements 8.1, 8.2**

- [ ] 8. Add Supabase anonymous-insert policy and wire CheckoutSheet order insert
  - [ ] 8.1 Add RLS policy migration to `supabase-schema.sql`
    - Append the anonymous-insert policy for the `sales` table:
      ```sql
      create policy "sales_anon_insert"
        on sales for insert
        with check (true);
      ```
    - _Requirements: 6.4_

  - [ ] 8.2 Update `src/components/CheckoutSheet.tsx` to insert OrderRecord
    - Make `handleSubmit` `async`
    - Add `const [insertError, setInsertError] = useState(false)` state
    - Inside `handleSubmit`, before the WhatsApp redirect, call `supabase.from('sales').insert(orderRecord)` where `orderRecord` includes `channel: 'app'`, `status: 'pending'`, `customer_name`, `customer_phone`, `customer_location`, `items` array (mapped from cart), and `subtotal`
    - On insert error: set `insertError = true`, `console.error` the error, schedule `setInsertError(false)` after 3000 ms — do NOT block WhatsApp redirect
    - Add the amber non-blocking error message paragraph above the submit button area, conditional on `insertError`
    - Render error messages in both `sw` and `en` via `lang` check
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 8.3 Switch CheckoutSheet slide-up transition to `calmSpring`
    - Replace the existing inline spring config on the slide-up `motion.div` with `transition={motionTokens.easings.calmSpring}`
    - Import `motionTokens` from `../design/motion`
    - _Requirements: 5.3, 5.5_

  - [ ]* 8.4 Write property test for CheckoutSheet insert payload
    - **Property 7: For any non-empty cart and valid customer form, `supabase.from('sales').insert(record)` is called with all required OrderRecord fields (`channel: 'app'`, `status: 'pending'`, `customer_name`, `customer_phone`, `customer_location`, non-empty `items`, positive `subtotal`)**
    - **Validates: Requirements 6.1, 6.2**

- [ ] 9. Final checkpoint — full build and test pass
  - Run `npm run build` to confirm zero TypeScript and Vite build errors.
  - Ensure all tasks are complete; ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints (tasks 5 and 10) ensure incremental validation between feature groups
- Property tests validate universal correctness guarantees defined in the design; unit tests cover specific examples and edge cases
- The `supabase-schema.sql` migration (task 8.1) must be applied in Supabase before the CheckoutSheet insert in task 8.2 goes live in production
- Environment secrets are not required for this implementation — the Edge Function for low-stock alerts has been deferred. Low-stock visibility is handled by the existing admin dashboard warning banner.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "4.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "4.2", "8.1", "9.2"] },
    { "id": 2, "tasks": ["2.2", "3.1", "3.2", "3.3", "6.1", "9.1"] },
    { "id": 3, "tasks": ["2.3", "3.4", "4.3", "7.1", "8.2", "8.3"] },
    { "id": 4, "tasks": ["7.2", "7.3", "8.4", "9.3"] }
  ]
}
```
