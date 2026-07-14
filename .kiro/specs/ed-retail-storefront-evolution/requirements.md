# Requirements Document

## Introduction

This document specifies the requirements for the ED Retail Storefront Evolution — a focused visual and functional upgrade to the existing React 18 / TypeScript / Tailwind / Framer Motion / Supabase storefront. The evolution covers six priorities: (1) a full-bleed editorial hero with 8-second auto-advance and a decorative oversized background product image; (2) a tighter typography hierarchy; (3) accent colour simplification to indigo and green; (4) repositioning the owner profile section below the products grid; (5) centralising all motion easing into `motionTokens.ts`; and (6) admin automation — automatic order status, a nightly low-stock WhatsApp alert via Supabase Edge Function, and a Best Sellers component derived from sales data.

---

## Glossary

- **Storefront**: The customer-facing React SPA located in `src/App.tsx` and its child components.
- **HeroCarousel**: The full-bleed banner section at the top of the Storefront (`src/components/HeroCarousel.tsx`).
- **HeroSlide**: A single auto-advancing slide within the HeroCarousel. Each HeroSlide features one featured product.
- **DecorativeBgImage**: A large, faded, oversized product image rendered behind the text content of a HeroSlide as atmospheric decoration. It is not a thumbnail.
- **DistributorBio**: The owner profile card component (`src/components/DistributorBio.tsx`).
- **ProductsGrid**: The two-column product listing section inside `App.tsx`.
- **BestSellers**: A new UI component that displays the top-ranked products derived from sales data.
- **MotionTokens**: The centralised motion configuration module at `src/design/motion.ts` (currently `motionTokens`). Extended to include a `heroFade` easing token.
- **AccentColour**: A colour used for interactive emphasis. Only indigo and green are permitted as accent colours, except inside CategoryBadges.
- **CategoryBadge**: A small pill-shaped label that identifies a product category; exempt from the accent-colour restriction.
- **SalesTable**: The `sales` table in Supabase, with an `items` column of type `jsonb` containing an array of order line objects, each carrying a `productId` (or `id`) and `quantity` field.
- **LowStockThreshold**: The stock quantity at or below which a product is considered low-stock. Default value: 5 units.
- **LowStockAlertFunction**: A Supabase Edge Function that runs on a nightly schedule, queries the `products` table for items at or below `LowStockThreshold`, and dispatches a WhatsApp message to the distributor.
- **CheckoutSheet**: The bottom-sheet checkout component (`src/components/CheckoutSheet.tsx`).
- **OrderRecord**: A row inserted into the `SalesTable` by the checkout flow, representing a customer's app order.

---

## Requirements

### Requirement 1 — Hero Redesign

**User Story:** As a storefront visitor, I want a full-bleed editorial hero banner with a warm atmospheric feel, so that the page makes a strong first impression and guides me to the primary action.

#### Acceptance Criteria

1. THE HeroCarousel SHALL render as a full-bleed section that spans the full viewport width with no horizontal padding or margin on the outer container.

2. WHEN a HeroSlide is active, THE HeroCarousel SHALL display a DecorativeBgImage for that slide, positioned absolutely behind the text content, rendered at an oversized scale (minimum 60% of the slide height), with opacity between 0.08 and 0.15, and not enclosed in a thumbnail box or bordered container.

3. WHEN the HeroCarousel initialises, THE HeroCarousel SHALL display the first HeroSlide and auto-advance to the next HeroSlide every 8000 milliseconds.

4. WHEN the HeroCarousel reaches the last HeroSlide during auto-advance, THE HeroCarousel SHALL wrap around and display the first HeroSlide.

5. WHEN a user's pointer enters the HeroCarousel on a device with a pointing device, THE HeroCarousel SHALL pause auto-advance until the pointer leaves the HeroCarousel.

6. THE HeroCarousel SHALL apply warm and earthy background tones drawn from amber, stone, or warm-brown Tailwind palette classes in place of the existing cool blue/green/teal/rose gradients.

7. EACH HeroSlide SHALL contain exactly one primary CTA button that links to the `#products` anchor, and SHALL NOT contain a secondary WhatsApp button.

8. WHEN a HeroSlide transition occurs, THE HeroCarousel SHALL animate the incoming slide using the `motionTokens.heroFade` easing token with a duration between 600 ms and 900 ms.

9. THE HeroCarousel SHALL include a screen-reader live region that announces the current slide position and product name on every slide change.

---

### Requirement 2 — Typography Hierarchy

**User Story:** As a storefront visitor, I want clear section titles and prominent price display, so that I can scan the page quickly and understand the value of each product at a glance.

#### Acceptance Criteria

1. THE Storefront SHALL apply the Tailwind class `text-2xl` (or equivalent) to all section heading elements (h2-level titles such as "All Products", "Best Sellers", and "What Our Customers Say").

2. THE ProductCard SHALL render the product price as the visually dominant text element within the card, using a font size of at least `text-lg` and a font weight of at least `font-bold`.

3. THE Storefront SHALL remove or suppress micro-label elements — defined as non-essential descriptive labels shorter than 20 characters that duplicate information already visible in the product name, badge, or category tab — from the ProductCard and HeroCarousel tag line.

---

### Requirement 3 — Colour Simplification

**User Story:** As a storefront visitor, I want a consistent colour scheme, so that the interface feels coherent and professional.

#### Acceptance Criteria

1. THE Storefront SHALL use indigo (`indigo-*`) and green (`green-*`) Tailwind colour classes as the only accent colours for interactive elements, including buttons, focus rings, active indicators, and progress bars.

2. WHERE a CategoryBadge is rendered, THE Storefront SHALL apply category-specific colour classes to that CategoryBadge regardless of the accent-colour restriction in criterion 1.

3. THE Storefront SHALL replace any violet, blue, teal, rose, or amber accent colour classes on non-CategoryBadge interactive elements with the equivalent indigo or green class.

---

### Requirement 4 — Page Layout Reorder

**User Story:** As a storefront visitor, I want the product grid to appear before the owner profile, so that I can browse products immediately after the hero without interruption.

#### Acceptance Criteria

1. THE Storefront SHALL render the ProductsGrid section before the DistributorBio section in the DOM and visual order.

2. THE Storefront SHALL render the DistributorBio section after the ProductsGrid section and before the Testimonials section in the DOM and visual order.

3. WHEN the Storefront renders the page layout, THE DistributorBio SHALL NOT appear between the HeroCarousel and the ProductsGrid.

---

### Requirement 5 — Motion Centralisation

**User Story:** As a developer maintaining the storefront, I want all animation easing and duration values sourced from a single module, so that motion changes can be made in one place and propagate consistently.

#### Acceptance Criteria

1. THE MotionTokens module SHALL export a `heroFade` token under the `easings` key, defined as a Framer Motion `Tween` config object with `ease: 'easeInOut'` and `duration` between 0.6 and 0.9 seconds.

2. THE MotionTokens module SHALL export a `calmSpring` token under the `easings` key, defined as a Framer Motion `Spring` config object with `stiffness` between 200 and 300 and `damping` between 25 and 35, to replace abrupt spring transitions.

3. WHEN any Storefront component applies a Framer Motion `transition` prop, THE component SHALL reference a value exported from MotionTokens and SHALL NOT define an inline numeric duration or easing string that duplicates a MotionTokens value.

4. THE HeroCarousel SHALL use `motionTokens.easings.heroFade` as the transition for cross-fade animations between HeroSlides.

5. THE CheckoutSheet SHALL use `motionTokens.easings.calmSpring` as the transition for its slide-up entry and exit animations.

---

### Requirement 6 — Admin Automation: Order Status

**User Story:** As an admin, I want app orders to be automatically recorded with a pending status, so that I can track incoming orders without manual data entry.

#### Acceptance Criteria

1. WHEN the CheckoutSheet submits a completed order, THE CheckoutSheet SHALL insert an OrderRecord into the SalesTable with `channel` set to `'app'` and `status` set to `'pending'` before opening the WhatsApp redirect.

2. THE OrderRecord SHALL include `customer_name`, `customer_phone`, `customer_location`, `items` (serialised from cart items as a JSONB array), and `subtotal` fields populated from the current cart and customer form state.

3. IF the SalesTable insert operation fails, THEN THE CheckoutSheet SHALL continue to open the WhatsApp redirect and SHALL display a non-blocking error indicator visible to the user for at least 3000 milliseconds.

4. THE SalesTable insert SHALL be performed using the anonymous Supabase client already initialised in `src/lib/supabase.ts`, without requiring user authentication.

---

### Requirement 7 — Admin Automation: Nightly Low-Stock WhatsApp Alert

**User Story:** As an admin, I want to receive a WhatsApp message each night listing products that are running low on stock, so that I can reorder before items sell out.

#### Acceptance Criteria

1. THE LowStockAlertFunction SHALL be deployed as a Supabase Edge Function and SHALL be invoked on a nightly schedule between 20:00 and 23:59 in the Africa/Dar_es_Salaam timezone.

2. WHEN the LowStockAlertFunction executes, THE LowStockAlertFunction SHALL query the `products` table for all rows where `in_stock` is `true` and `stock_qty` is greater than 0 and less than or equal to `LowStockThreshold` (5).

3. IF the query returns one or more products, THEN THE LowStockAlertFunction SHALL dispatch a single WhatsApp message to the distributor's phone number containing each low-stock product's name and current `stock_qty`, formatted as a numbered list.

4. IF the query returns zero products, THEN THE LowStockAlertFunction SHALL terminate without dispatching a WhatsApp message.

5. IF the WhatsApp dispatch HTTP request returns a non-2xx status code, THEN THE LowStockAlertFunction SHALL log the error and the list of affected product IDs to Supabase Edge Function logs.

6. THE LowStockAlertFunction SHALL read the distributor phone number and WhatsApp API credentials exclusively from Supabase Edge Function environment secrets and SHALL NOT hardcode those values in source code.

---

### Requirement 8 — Admin Automation: Best Sellers Component

**User Story:** As a storefront visitor, I want to see which products are most popular, so that I can make a confident purchasing decision quickly.

#### Acceptance Criteria

1. THE BestSellers component SHALL query the SalesTable on mount and aggregate total units sold per product by summing the `quantity` field of each element in the `items` JSONB array across all rows where `status` is not `'cancelled'`.

2. THE BestSellers component SHALL render the top 3 to 4 products ranked by total units sold in descending order.

3. WHEN the BestSellers query returns fewer than 3 products with at least 1 unit sold, THE BestSellers component SHALL NOT render.

4. THE BestSellers component SHALL be placed in the Storefront between the HeroCarousel and the ProductsGrid.

5. THE BestSellers component heading SHALL use the `text-2xl` class in accordance with Requirement 2, Criterion 1.

6. IF the SalesTable query fails, THEN THE BestSellers component SHALL silently suppress the error and SHALL NOT render.

7. WHEN the BestSellers component is loading data, THE BestSellers component SHALL render skeleton placeholder cards matching the count of products it expects to display (3).
