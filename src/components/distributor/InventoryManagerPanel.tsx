import React, { useState } from 'react';
import {
  Package,
  Search,
  Check,
  X,
  Edit2,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { PRODUCTS } from '../../types';

interface InventoryManagerPanelProps {
  lang: 'en' | 'sw';
}

export const InventoryManagerPanel: React.FC<InventoryManagerPanelProps> = ({ lang }) => {
  const productOverrides = useDistributorStore((s) => s.productOverrides);
  const toggleProductStock = useDistributorStore((s) => s.toggleProductStock);
  const toggleProductVisibility = useDistributorStore((s) => s.toggleProductVisibility);
  const updateProductPrice = useDistributorStore((s) => s.updateProductPrice);
  const resetProductOverrides = useDistributorStore((s) => s.resetProductOverrides);

  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<'all' | 'p4-slimming' | 'health-wellness' | 'lifestyle-beverages'>('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPriceInput, setNewPriceInput] = useState('');

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    const matchesSearch =
      !productSearch.trim() ||
      p.name.en.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.name.sw.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSavePrice = (productId: string) => {
    const priceNum = parseInt(newPriceInput, 10);
    if (!isNaN(priceNum) && priceNum >= 1000) {
      updateProductPrice(productId, priceNum);
      setEditingPriceId(null);
      setNewPriceInput('');
    }
  };

  const hasOverrides = Object.keys(productOverrides).length > 0;

  return (
    <div className="space-y-4">
      {/* Header & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
        <div>
          <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-700" />
            <span>{lang === 'sw' ? 'Usimamizi wa Stoo & Bei za Dukani' : 'Catalog Stock & Retail Pricing'}</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {lang === 'sw'
              ? 'Badilisha hali ya mzigo (In Stock / Out of Stock) au badilisha bei dukani papo hapo.'
              : 'Toggle product stock availability or adjust customer-facing prices instantly.'}
          </p>
        </div>

        {hasOverrides && (
          <button
            onClick={() => resetProductOverrides()}
            className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'sw' ? 'Rejesha Bei za Awali' : 'Reset All Overrides'}</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder={lang === 'sw' ? 'Tafuta bidhaa (Shake Off, Splina, MRT...)' : 'Search products by name...'}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
          />
        </div>

        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl overflow-x-auto text-xs">
          <button
            onClick={() => setProductCategoryFilter('all')}
            className={`px-3 py-1 font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              productCategoryFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'sw' ? 'Zote' : 'All'}
          </button>
          <button
            onClick={() => setProductCategoryFilter('p4-slimming')}
            className={`px-3 py-1 font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              productCategoryFilter === 'p4-slimming' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            P4 Slimming
          </button>
          <button
            onClick={() => setProductCategoryFilter('health-wellness')}
            className={`px-3 py-1 font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              productCategoryFilter === 'health-wellness' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'sw' ? 'Afya' : 'Wellness'}
          </button>
          <button
            onClick={() => setProductCategoryFilter('lifestyle-beverages')}
            className={`px-3 py-1 font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              productCategoryFilter === 'lifestyle-beverages' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'sw' ? 'Vinywaji' : 'Beverages'}
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="divide-y divide-stone-100 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
        {filteredProducts.map((prod) => {
          const override = productOverrides[prod.id];
          const currentPrice = override?.price !== undefined ? override.price : prod.price;
          const isInStock = override?.inStock !== undefined ? override.inStock : prod.inStock;
          const isHidden = override?.hidden || false;
          const isEditingPrice = editingPriceId === prod.id;

          return (
            <div
              key={prod.id}
              className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                  <img
                    src={prod.image}
                    alt={prod.name.en}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-xs sm:text-sm text-stone-900">
                      {lang === 'sw' ? prod.name.sw : prod.name.en}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        isInStock
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-red-100 text-red-900'
                      }`}
                    >
                      {isInStock ? 'In Stock ✅' : 'Out of Stock ❌'}
                    </span>
                    {isHidden && (
                      <span className="px-1.5 py-0.5 bg-stone-200 text-stone-600 text-[10px] rounded font-bold">
                        Hidden Dukani
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                    <span className="font-bold text-stone-900">
                      TZS {currentPrice.toLocaleString()}
                    </span>
                    {override?.price && override.price !== prod.price && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 rounded">
                        (Asili: TZS {prod.price.toLocaleString()})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls Row */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* Price Editor */}
                {isEditingPrice ? (
                  <div className="flex items-center gap-1 bg-white p-1 border border-stone-300 rounded-xl shadow-xs">
                    <input
                      type="number"
                      value={newPriceInput}
                      onChange={(e) => setNewPriceInput(e.target.value)}
                      placeholder="Bei TZS..."
                      className="w-24 px-2 py-1 text-xs font-bold border-none focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSavePrice(prod.id)}
                      className="p-1 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingPriceId(null)}
                      className="p-1 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingPriceId(prod.id);
                      setNewPriceInput(String(currentPrice));
                    }}
                    className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                    title="Badilisha Bei"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{lang === 'sw' ? 'Badili Bei' : 'Price'}</span>
                  </button>
                )}

                {/* Stock Toggle Button */}
                <button
                  onClick={() => toggleProductStock(prod.id, !isInStock)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                    isInStock
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-red-50 hover:bg-red-100 text-red-900 border border-red-300'
                  }`}
                >
                  <span>{isInStock ? 'Ipo Stoo' : 'Imeisha'}</span>
                </button>

                {/* Visibility Toggle */}
                <button
                  onClick={() => toggleProductVisibility(prod.id, !isHidden)}
                  className={`p-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isHidden
                      ? 'bg-stone-200 text-stone-600 border-stone-300'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                  title={isHidden ? 'Onesha Dukani' : 'Ficha Dukani'}
                >
                  {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
