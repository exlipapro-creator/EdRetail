import categoriesData from './data/categories.json';
import productsData from './data/products.json';
import bundlesData from './data/bundles.json';
import testimonialsData from './data/testimonials.json';
import deliveryZonesData from './data/deliveryZones.json';

// ─── Core types ──────────────────────────────────────────────────────────────

export type Lang = 'en' | 'sw';

export interface I18nString {
  en: string;
  sw: string;
}

export type ProductCategory = 'p4-slimming' | 'health-wellness' | 'lifestyle-beverages';

export interface Product {
  id: string;
  name: I18nString;
  category: ProductCategory;
  price: number;       // TZS
  priceUsd: number;    // USD approximate — update periodically, not live-converted
  currency: string;
  description: I18nString;
  usage: I18nString;   // How to use
  image: string;
  badge?: string;
  steps?: string[];
  inStock: boolean;
}

export interface Bundle {
  id: string;
  name: I18nString;
  description: I18nString;
  productIds: string[];
  discountPercent: number;
}

export interface CartItem extends Omit<Product, 'name' | 'description' | 'usage'> {
  name: I18nString;
  description: I18nString;
  usage: I18nString;
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  location: string;
}

export interface Category {
  id: string;
  label: I18nString;
  color: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  product: string;
  text: I18nString;
  result: string;
}

export interface DeliveryZone {
  zone: string;
  days: string;
  note?: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────
// All content below is loaded from src/data/*.json — edit those files directly
// to add products, change prices, or update stock. No code changes required.
//
// NOTE: TESTIMONIALS in src/data/testimonials.json are SAMPLE/PLACEHOLDER
// content for demonstration purposes only. Replace with real, consented
// customer testimonials before this app goes live — do not publish fabricated
// reviews as genuine customer results.

export const CATEGORIES = categoriesData as Category[];
export const PRODUCTS = productsData as Product[];
export const BUNDLES = bundlesData as Bundle[];
export const TESTIMONIALS = testimonialsData as Testimonial[];
export const DELIVERY_ZONES = deliveryZonesData as DeliveryZone[];
