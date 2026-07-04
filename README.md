# ED Retail

A mobile-first WhatsApp commerce storefront for an authorized Edmark wellness products distributor in Tanzania. No backend, no payment gateway — customers browse, build a cart, and check out directly into a pre-filled WhatsApp order sent to the distributor.

Built with React, TypeScript, Vite, Tailwind CSS, and Framer Motion.

## Features

- **WhatsApp-native checkout** — orders compile into a formatted message and open directly in WhatsApp; zero backend required
- **Message preview** — customers can see the exact WhatsApp message before it's sent
- **Bilingual (English / Swahili)** — every string in the app, toggleable at runtime
- **Persistent cart & favourites** — via Zustand + localStorage (customer PII is explicitly excluded from persistence)
- **Goal-based product picker** — recommends a P4 product or bundle based on the customer's stated goal
- **Bundle deals** — pre-configured discounted product bundles
- **Distributor bio card** — photo, credentials, response-time expectation, direct WhatsApp CTA
- **Referral sharing** — native Web Share API with a WhatsApp fallback
- **Search & category filtering**
- **Installable PWA** — manifest, service worker, offline app-shell caching
- **Data-driven catalogue** — products, bundles, testimonials, and delivery zones all live in `src/data/*.json`, editable without touching code
- **Accessible, validated checkout form** — inline errors, autocomplete hints, disabled-state handling

## Tech Stack

| | |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| State | Zustand (persist middleware) |
| Icons | Lucide React |

## Getting Started

```bash
npm install
npm run dev       # start dev server
npm run build     # type-check + production build
npm run preview   # preview the production build locally
```

## Configuration

The distributor's WhatsApp number and display name are set once, in `src/utils/whatsappCompiler.ts`:

```typescript
export const TARGET_PHONE = '255683171345';
export const DISTRIBUTOR_NAME = 'Mwanahamisi Lissu';
```

Every WhatsApp CTA in the app (hero, checkout, distributor bio) reads from these two constants — update them here and the whole app updates.

## Editing content without code changes

Product catalogue, bundle deals, testimonials, and delivery zones are all plain JSON under `src/data/`:

```
src/data/
├── categories.json
├── products.json       # prices, stock, usage instructions, EN/SW copy
├── bundles.json
├── testimonials.json
└── deliveryZones.json
```

**Before going live:** `testimonials.json` currently contains placeholder/sample reviews for demonstration purposes. Replace these with real, consented customer testimonials before launch — publishing invented quotes as genuine customer results would be misleading.

## Product & brand images

- `public/logo/wordmark.png` — full ED Retail logo (header, footer)
- `public/logo/distributor-circle.png` — distributor avatar (bio card)
- `public/icons/`, `public/favicon-*.png` — PWA and browser icons
- `public/products/` — currently empty; product cards render an icon placeholder until real product photos are added here

## Project Structure

```
src/
├── components/
│   ├── ProductCard.tsx        # Product card + detail sheet
│   ├── CheckoutSheet.tsx      # Cart, form, message preview, WhatsApp handoff
│   ├── HeroCarousel.tsx       # Auto-rotating product hero banners
│   ├── DistributorBio.tsx     # Distributor trust card
│   ├── P4GoalPicker.tsx       # Goal-based product recommender
│   ├── Bundles.tsx            # Bundle deal cards
│   ├── Testimonials.tsx
│   ├── DeliveryInfo.tsx
│   ├── ReferralShare.tsx      # Share-with-a-friend button
│   ├── SearchBar.tsx / CategoryTabs.tsx / CartBadge.tsx / SkeletonCard.tsx
│   └── ErrorBoundary.tsx
├── context/
│   └── LangContext.tsx        # EN/SW language state
├── store/
│   └── cartStore.ts           # Cart + favourites (Zustand, persisted)
├── utils/
│   └── whatsappCompiler.ts    # Message building, phone sanitisation, validation
├── data/                      # Editable JSON content (see above)
├── types.ts                   # Shared TypeScript types
└── App.tsx
```

## Order Flow

1. Customer browses products, uses the goal picker, or adds a bundle
2. Cart persists across page reloads
3. Customer opens checkout, fills name / phone / delivery location (validated inline)
4. Can preview the exact WhatsApp message before sending
5. Taps send — redirected to WhatsApp with the pre-filled order, addressed to the distributor
6. Success screen offers a "share with a friend" prompt and a reminder to save the distributor's contact

## License

MIT
