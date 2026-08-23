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
  Plus,
  Sliders,
} from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { Product } from '../../types';
import { ProductEditorModal } from './ProductEditorModal';

interface InventoryManagerPanelProps {
  lang: 'en' | 'sw';
}

export const InventoryManagerPanel: React.FC<InventoryManagerPanelProps> = ({ lang }) => {
  const productOverrides = useDistributorStore((s) => s.productOverrides);
  const toggleProductStock = useDistributorStore((s) => s.toggleProductStock);
  const toggleProductVisibility = useDistributorStore((s) => s.toggleProductVisibility);
  const updateProductPrice = useDistributorStore((s) => s.updateProductPrice);
  const resetProductOverrides = useDistributorStore((s) => s.resetProductOverrides);
  const getEffectiveProducts = useDistributorStore((s) => s.getEffectiveProducts);

  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<'all' | 'p4-slimming' | 'health-wellness' | 'lifestyle-beverages'>('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPriceInput, setNewPriceInput] = useState('');

  // Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);

  const effectiveProducts = getEffectiveProducts();

  const filteredProducts = effectiveProducts.filter((p) => {
    const matchesCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    const nameEn = typeof p.name === 'string' ? p.name : p.name?.en || '';
    const nameSw = typeof p.name === 'string' ? p.name : p.name?.sw || '';
    const matchesSearch =
      !productSearch.trim() ||
      nameEn.toLowerCase().includes(productSearch.toLowerCase()) ||
      nameSw.toLowerCase().includes(productSearch.toLowerCase()) ||
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

  const handleOpenAddModal = () => {
    setSelectedProductForEdit(null);
    setIsEditorOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setSelectedProductForEdit(prod);
    setIsEditorOpen(true);
  };

  const hasOverrides = Object.keys(productOverrides).length > 0;

  return (
    <div className="space-y-4 bg-transparent text-stone-100">
      {/* Header & Master Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-950/80 p-4 sm:p-5 rounded-2xl border border-stone-800">
        <div>
          <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
            <Package className="w-4.5 h-4.5 text-emerald-400" />
            <span>{lang === 'sw' ? 'Usimamizi Mkuu wa Katalogi & Bei za Dukani' : 'Master Catalog & Retail Pricing Controller'}</span>
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            {lang === 'sw'
              ? 'Wewe ni Mdhibiti Mkuu: Ongeza bidhaa mpya, badili bei dukani papo hapo, pakia picha au dhibiti stoo.'
              : 'Master Controller: Add new products, adjust store prices instantly, upload visuals, and manage stock.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasOverrides && (
            <button
              onClick={() => resetProductOverrides()}
              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'sw' ? 'Rejesha Awali' : 'Reset Overrides'}</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{lang === 'sw' ? 'Ongeza Bidhaa Mpya' : 'Add New Product'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder={lang === 'sw' ? 'Tafuta bidhaa (Shake Off, Splina, MRT...)' : 'Search products by name...'}
            className="w-full pl-9 pr-4 py-2.5 bg-stone-950/80 border border-stone-800 rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1 bg-stone-950/80 p-1 rounded-xl border border-stone-800 overflow-x-auto text-xs">
          <button
            onClick={() => setProductCategoryFilter('all')}
            className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              productCategoryFilter === 'all' ? 'bg-amber-400 text-stone-950 shadow-2xs font-black' : 'text-stone-400 hover:text-white'
            }`}
          >
            {lang === 'sw' ? 'Zote' : 'All'}
          </button>
          <button
            onClick={() => setProductCategoryFilter('p4-slimming')}
            className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              productCategoryFilter === 'p4-slimming' ? 'bg-amber-400 text-stone-950 shadow-2xs font-black' : 'text-stone-400 hover:text-white'
            }`}
          >
            P4 Slimming
          </button>
          <button
            onClick={() => setProductCategoryFilter('health-wellness')}
            className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              productCategoryFilter === 'health-wellness' ? 'bg-amber-400 text-stone-950 shadow-2xs font-black' : 'text-stone-400 hover:text-white'
            }`}
          >
            {lang === 'sw' ? 'Afya' : 'Wellness'}
          </button>
          <button
            onClick={() => setProductCategoryFilter('lifestyle-beverages')}
            className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              productCategoryFilter === 'lifestyle-beverages' ? 'bg-amber-400 text-stone-950 shadow-2xs font-black' : 'text-stone-400 hover:text-white'
            }`}
          >
            {lang === 'sw' ? 'Vinywaji' : 'Beverages'}
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="divide-y divide-stone-800/80 bg-stone-950/80 border border-stone-800 rounded-2xl overflow-hidden shadow-2xs">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-xs">
            {lang === 'sw' ? 'Hakuna bidhaa zilizopatikana.' : 'No products found.'}
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const override = productOverrides[prod.id];
            const currentPrice = override?.price !== undefined ? override.price : prod.price;
            const isInStock = override?.inStock !== undefined ? override.inStock : prod.inStock;
            const isHidden = override?.hidden || false;
            const isEditingPrice = editingPriceId === prod.id;

            const nameSw = typeof prod.name === 'string' ? prod.name : prod.name?.sw || prod.name?.en;
            const nameEn = typeof prod.name === 'string' ? prod.name : prod.name?.en || prod.name?.sw;

            return (
              <div
                key={prod.id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-800 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                    <img
                      src={prod.image}
                      alt={nameEn}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-xs sm:text-sm text-white">
                        {lang === 'sw' ? nameSw : nameEn}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          isInStock
                            ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/60'
                            : 'bg-red-900/50 text-red-300 border border-red-700/60'
                        }`}
                      >
                        {isInStock ? 'In Stock ✅' : 'Out of Stock ❌'}
                      </span>
                      {prod.badge && (
                        <span className="px-1.5 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] rounded font-black border border-amber-400/30">
                          {prod.badge}
                        </span>
                      )}
                      {isHidden && (
                        <span className="px-1.5 py-0.5 bg-stone-800 text-stone-400 text-[10px] rounded font-bold border border-stone-700">
                          Hidden Dukani
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-stone-400 mt-1 flex items-center gap-2">
                      <span className="font-bold text-white">
                        TZS {currentPrice.toLocaleString()}
                      </span>
                      {override?.price && override.price !== prod.price && (
                        <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-800/60 px-1.5 rounded">
                          (Asili: TZS {prod.price.toLocaleString()})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls Row */}
                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  {/* Full Product Editor Modal Trigger */}
                  <button
                    onClick={() => handleOpenEditModal(prod)}
                    className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800 hover:border-amber-400/40 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                    title="Hariri Maelezo, Picha na Bei"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{lang === 'sw' ? 'Hariri Kamili' : 'Full Edit'}</span>
                  </button>

                  {/* Inline Quick Price Editor */}
                  {isEditingPrice ? (
                    <div className="flex items-center gap-1 bg-stone-900 p-1 border border-stone-700 rounded-xl shadow-xs">
                      <input
                        type="number"
                        value={newPriceInput}
                        onChange={(e) => setNewPriceInput(e.target.value)}
                        placeholder="Bei TZS..."
                        className="w-24 px-2 py-1 text-xs font-bold bg-stone-950 text-white border border-stone-700 rounded-lg focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSavePrice(prod.id)}
                        className="p-1.5 bg-emerald-500 text-stone-950 rounded-lg hover:bg-emerald-400 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                      <button
                        onClick={() => setEditingPriceId(null)}
                        className="p-1.5 text-stone-400 hover:text-white cursor-pointer"
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
                      className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      title="Badilisha Bei ya Haraka"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{lang === 'sw' ? 'Bei Haraka' : 'Quick Price'}</span>
                    </button>
                  )}

                  {/* Stock Toggle Button */}
                  <button
                    onClick={() => toggleProductStock(prod.id, !isInStock)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                      isInStock
                        ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60'
                        : 'bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700/60'
                    }`}
                  >
                    <span>{isInStock ? 'Ipo Stoo' : 'Imeisha'}</span>
                  </button>

                  {/* Visibility Toggle */}
                  <button
                    onClick={() => toggleProductVisibility(prod.id, !isHidden)}
                    className={`p-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      isHidden
                        ? 'bg-stone-900 text-stone-500 border-stone-800'
                        : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800'
                    }`}
                    title={isHidden ? 'Onesha Dukani' : 'Ficha Dukani'}
                  >
                    {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Product Management Modal */}
      <ProductEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        productToEdit={selectedProductForEdit}
        lang={lang}
      />
    </div>
  );
};
