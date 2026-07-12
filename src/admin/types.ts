// ─── Admin-side database types ───────────────────────────────────────────────

export interface AdminProduct {
  id: string;
  name_en: string;
  name_sw: string;
  category: 'p4-slimming' | 'health-wellness' | 'lifestyle-beverages';
  price: number;
  price_usd: number;
  description_en: string;
  description_sw: string;
  usage_en: string;
  usage_sw: string;
  image: string;
  badge: string | null;
  in_stock: boolean;
  stock_qty: number;
  created_at: string;
  updated_at: string;
}

export type SaleChannel = 'app' | 'cash' | 'loan';
export type SaleStatus  = 'pending' | 'confirmed' | 'delivered' | 'cancelled';
export type LoanStatus  = 'active' | 'partial' | 'cleared';

export interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Sale {
  id: string;
  channel: SaleChannel;
  status: SaleStatus;
  customer_name: string;
  customer_phone: string;
  customer_location: string;
  items: SaleItem[];
  subtotal: number;
  amount_paid: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoanRecord {
  id: string;
  sale_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_location: string;
  items: SaleItem[];
  total_amount: number;
  amount_paid: number;
  balance: number;
  due_date: string | null;
  status: LoanStatus;
  notes: string | null;
  payments: LoanPayment[];
  created_at: string;
  updated_at: string;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  amount: number;
  paid_at: string;
  notes: string | null;
}
