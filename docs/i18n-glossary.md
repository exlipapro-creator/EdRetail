# EdRetail English ↔ Kiswahili UI Glossary

Canonical terminology for all customer-facing EdRetail strings. One concept, one
translation — never five variants. Terms here are the source of truth; UI code
should use exactly these, with natural Tanzanian Kiswahili (not literal
machine translation).

## Rules

1. **Never translate** brand/trademark/product names: `EdRetail`, `ED Retail`,
   `Edmark`, `MRT Complex`, `Shake Off Phyto Fiber`, `Hawaiian Spirulina`,
   `Cafe Troika`, `CoCollagen`, product SKUs, `WhatsApp`, `Google`,
   `M-Pesa`, `Airtel Money`, `Tigo Pesa`, `Halo Pesa`, `Lipa Namba`,
   `Dar es Salaam`, `Zanzibar`.
2. Kiswahili must read naturally to a Tanzanian customer — prefer the terms
   already proven in the live storefront below over literal dictionary swaps.
3. No mixing within a single screen: pick one language mode and stay in it.
4. Validation/error/success/empty-state strings follow the same glossary.

## Glossary

| English | Kiswahili (canonical) | Notes / established usage |
|---|---|---|
| Cart | **Mkoba** | Storefront label (`Mkoba`). `Kikapu` is deprecated — fixed in 2026-09 sweep. |
| Checkout | **Malipo ya WhatsApp** / Checkout | Storefront: "Mkoba & Malipo ya WhatsApp". |
| Order | **Agizo** | Plural: **Maagizo** ("Orders & Help" = "Maagizo & Msaada"). |
| Delivery | **Uwasilishaji** | Storefront: "Delivery Info" = "Uwasilishaji". |
| Account | **Akaunti** | |
| Password | **Neno la siri** | Storefront uses "Neno la siri". |
| Sign in | **Ingia** | |
| Sign up / Create account | **Fungua akaunti** | |
| Logout | **Toka** (button) / **Ondoka** | "Ondoka (Logout)" → use plain **Toka**. |
| Goal | **Lengo** | |
| Goal Finder | **Kipataji Lengo** | Storefront screen label. |
| Wellness | **Afya / Ustawi** | "wellness products" = "bidhaa za afya". |
| Product | **Bidhaa** | |
| Bundle | **Pakiti** | |
| Savings | **Akiba** | "Save 10%" = "Akiba 10%". |
| Discount | **Punguzo** | Gym offer: "punguzo la 20%". |
| Payment | **Malipo** | |
| Cash on Delivery | **Malipo ukiwapokea** | COD acceptable in parentheses if needed. |
| Available | **Inapatikana** | |
| Out of stock | **Imeisha** | |
| In stock only | **Zilizopo tu** | Products filter. |
| Remove | **Ondoa** | |
| Add to cart | **Weka kwenye mkoba** | Storefront aria: "Weka {product} kwenye mkoba". |
| Continue shopping | **Endelea kununua** | |
| Continue as guest | **Endelea kuvinjari bila akaunti** | Storefront guest button. |
| Back | **Rudi** | |
| Close | **Funga** | |
| Save | **Hifadhi** | |
| Save draft | **Hifadhi rasimu** | Flyer Studio. |
| View / See all | **Angalia / Ona zote** | |
| Search | **Tafuta** | Header placeholder "Tafuta bidhaa". |
| Phone number | **Namba ya simu** | |
| Location | **Eneo / Mahali** | Checkout "Eneo" + zone. |
| Quantity | **Kiasi** | |
| Total | **Jumla** | |
| Subtotal | **Jumla ndogo** | |
| Featured | **Zilizoteuliwa** | Storefront "Bidhaa Zilizoteuliwa". |
| Best seller | **BESTSELLER** (badge) / **Bidhaa zinazouzwa zaidi** | |
| Flyer / Campaign | **Kampeni** | "View Flyers" = "Angalia Kampeni". |
| Privacy | **Faragha** | |
| Terms | **Masharti** | "Privacy & Terms" = "Faragha & Masharti". |
| Help / Support | **Msaada** | |
| Profile | **Wasifu** | |
| Dashboard | **Dashibodi** | Distributor/admin portal. |
| Home | **Mwanzo** | |
| Language | **Lugha** | |
| Email | **Barua pepe** | |
| Name | **Jina** | "Full name" = "Jina kamili". |
| Send | **Tuma** | |
| Loading | **Inapakia…** | "Submitting…" = "Inatuma…". |
| Success | **Imefanikiwa** | |
| Error | **Hitilafu** | |
| Retry | **Jaribu tena** | |
| Confirm | **Thibitisha** | |
| Cancel | **Ghairi** | |

## Coverage status

- **Storefront (customer)**: fully bilingual — every user-facing screen has
  EN/SW variants. Audited 2026-09; mixed-language fixes applied (cart term,
  distributor profile box, assistant pills, WhatsApp prefill).
- **Distributor portal**: fully bilingual. Pages were already bilingual; the
  2026-09 sweep wrapped the remaining unconditional strings in the shared
  panels (FieldLedger metrics, Maintenance tracker, AdminDashboard/Crm goal
  labels, Flyer Studio/WhatsApp buttons, ProductEditor empty state).
- **Admin / Super Admin**: fully bilingual. All pages (Dashboard, Products,
  Distributors, Sales, Loans, Cash Flow, Testimonials, Security, Settings)
  plus the shell (AdminLayout, LoginPage) use this glossary; `/admin` is now
  wrapped in `LangProvider` so the switcher applies there too.

## Procedure for adding strings

1. Look up the concept here; reuse the canonical term.
2. Both `lang === 'sw'` branches must exist for every new user-facing string.
3. Keep brand/product names untranslated.
4. If the term is missing, add it here with the storefront-established usage
   rather than inventing a new translation.