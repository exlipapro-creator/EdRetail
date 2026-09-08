import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PRODUCTS } from '../types';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
import { SkeletonCard } from './SkeletonCard';
import { useLang } from '../context/LangContext';

interface BestSellerEntry {
  productId: string;
  totalUnits: number;
}

function useBestSellers() {
  const [entries, setEntries] = useState<BestSellerEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Server-side aggregate RPC — sales rows hold customer PII and are
        // not world-readable under RLS, so the storefront must never SELECT
        // them directly. The RPC returns only { product_id, total_units }.
        const { data, error } = await supabase
          .rpc('public_best_sellers', { _limit: 8 });

        if (error || cancelled) {
          if (!cancelled) setEntries([]);
          return;
        }

        const rpcRows = (data ?? []) as Array<{ product_id: string; total_units: number | string }>;
        const sorted: BestSellerEntry[] = rpcRows
          .map((row) => ({
            productId: row.product_id,
            totalUnits: Number(row.total_units) || 0,
          }))
          .filter((e: BestSellerEntry) => e.totalUnits > 0)
          .sort((a: BestSellerEntry, b: BestSellerEntry) => b.totalUnits - a.totalUnits)
          .slice(0, 4);

        if (!cancelled) setEntries(sorted);
      } catch {
        // Silently suppress — Best Sellers is non-critical
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { entries, loading };
}

export function BestSellers() {
  const { lang } = useLang();
  const { entries, loading } = useBestSellers();

  // Loading — show 3 skeleton cards
  if (loading) {
    return (
    <section className="container-page py-5">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        {lang === 'sw' ? 'Bidhaa Maarufu' : 'Best Sellers'}
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        {lang === 'sw' ? 'Bidhaa zinazonunuliwa zaidi' : 'Most purchased products'}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
      </div>
    </section>
    );
  }

  // Fewer than 3 qualifying products — don't render
  if (!entries || entries.length < 3) return null;

  // Resolve product data from static catalogue
  const resolved: Product[] = entries
    .map((e) => PRODUCTS.find((p) => p.id === e.productId))
    .filter((p): p is Product => Boolean(p));

  if (resolved.length < 3) return null;

  return (
    <section className="container-page py-5">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        {lang === 'sw' ? 'Bidhaa Maarufu' : 'Best Sellers'}
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        {lang === 'sw' ? 'Bidhaa zinazonunuliwa zaidi' : 'Most purchased products'}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {resolved.map((product, idx) => (
          <div key={product.id} className="relative">
            {idx === 0 && (
              <span className="absolute -top-2 -left-1 z-10 px-2 py-0.5 bg-gold-400 text-gold-900 text-[9px] font-bold rounded-full uppercase tracking-wide">
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
