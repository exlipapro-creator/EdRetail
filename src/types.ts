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

export type PaymentNetwork = 'mpesa' | 'tigopesa' | 'airtel' | 'halopesa' | 'bank' | 'cash';
export type PaymentAccountType = 'till' | 'paybill' | 'phone' | 'bank_account' | 'cash';

export interface DistributorPaymentAccount {
  id: string;
  network: PaymentNetwork;
  networkName: string; // e.g. 'Vodacom M-Pesa'
  accountType: PaymentAccountType;
  accountTypeName: string; // e.g. 'Lipa Kwa Simu (Till)'
  accountNumber: string; // e.g. '543210' or '0783481416'
  accountName: string; // e.g. 'Mwanahamisi Lissu (ED Retail)'
  isDefault?: boolean;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  location: string;
  paymentMethod?: PaymentNetwork;
  selectedPaymentAccount?: DistributorPaymentAccount;
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

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  action: string;
  category: 'price_change' | 'product_management' | 'stock_toggle' | 'sale_logged' | 'debt_payment' | 'backup_export' | 'backup_restore' | 'settings_update' | 'security_login' | 'ad_management';
  details: string;
  user: string;
  ip?: string;
}

export type AdPlacement = 'storefront_hero' | 'products_banner' | 'product_detail_modal' | 'checkout_footer';

export type AdNetworkMode = 'hybrid' | 'custom_sponsors_only' | 'adsense_only';

export interface AdSenseConfig {
  publisherId: string; // e.g. ca-pub-1234567890123456
  autoAdsEnabled: boolean;
  testMode: boolean; // renders realistic preview banner in development/test
  slotIds: {
    storefront_hero?: string;
    products_banner?: string;
    product_detail_modal?: string;
    checkout_footer?: string;
  };
  customScriptSnippet?: string;
}

export interface AdMonetizationConfig {
  enabled: boolean;
  mode: AdNetworkMode;
  adsense: AdSenseConfig;
  customPartnerSlotsEnabled: boolean;
}

export interface SponsorAd {
  id: string;
  title: I18nString;
  tagline: I18nString;
  sponsorName: string;
  badgeText: string;
  bannerImage: string;
  ctaText: I18nString;
  targetUrl: string; // WhatsApp or web url
  placement: AdPlacement;
  enabled: boolean;
  impressions: number;
  clicks: number;
  monthlyFee?: number; // In TZS, e.g. 50,000 TZS/month
  contactPhone?: string;
  expiryDate?: string;
}

export interface DatabaseBackupPayload {
  version: string;
  exportedAt: string;
  exportedBy: string;
  productOverrides: Record<string, any>;
  customProducts: any[];
  savedDistributors: any[];
  sales: any[];
  tasks: any[];
  platformSettings: any;
  auditLogs: AuditLogRecord[];
  sponsorAds: SponsorAd[];
  monetizationConfig?: AdMonetizationConfig;
}

export const CATEGORIES = categoriesData as Category[];
export const PRODUCTS = productsData as Product[];
export const BUNDLES = bundlesData as Bundle[];
export const TESTIMONIALS = testimonialsData as Testimonial[];
export const DELIVERY_ZONES = deliveryZonesData as DeliveryZone[];

