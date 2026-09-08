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
    <div className="space-y-4 text-gray-900">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 panel-inner p-4 sm:p-5">
        <div>
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 flex items-center gap-2">
            <Package className="w-4.5 h-4.5 text-primary-600" />
            <span>{lang === 'sw' ? 'Katalogi & Bei za Dukani' : 'Catalog & Retail Pricing'}</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {lang === 'sw'
              ? 'Ongeza bidhaa mpya, badili bei, na dhibiti stoo na uonekano dukani.'
              : 'Add products, adjust prices, and manage stock and store visibility.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasOverrides && (
            <button
              onClick={() => resetProductOverrides()}
              className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'sw' ? 'Rejesha Awali' : 'Reset Overrides'}</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'sw' ? 'Ongeza Bidhaa' : 'Add Product'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder={lang === 'sw' ? 'Tafuta bidhaa (Shake Off, Splina, MRT...)' : 'Search products by name...'}
            className="portal-input pl-9"
          />
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md border border-gray-200 overflow-x-auto text-xs">
          <button
            onClick={() => setProductCategoryFilter('all')}
            className={`px-3 py-1.5 font-semibold rounded whitespace-nowrap transition-all cursor-pointer ${
              productCategoryFilter === 'all' ? 'bg-primary-600 text-white shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {lang === 'sw' ? 'Zote' : 'All'}
          </button>
          <button
            onClick={() => setProductCategoryFilter('p4-slimming')}
            className={`px-3 py-1.5 font-semibold rounded whitespace-nowrap transition-all cursor-pointer ${
              productCategoryFilter === 'p4-slimming' ? 'bg-primary-600 text-white shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            P4 Slimming
          </button>
          <button
            onClick={() => setProductCategoryFilter('health-wellness')}
            className={`px-3 py-1.5 font-semibold rounded whitespace-nowrap transition-all cursor-pointer ${
              productCategoryFilter === 'health-wellness' ? 'bg-primary-600 text-white shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {lang === 'sw' ? 'Afya' : 'Wellness'}
          </button>
          <button
            onClick={() => setProductCategoryFilter('lifestyle-beverages')}
            className={`px-3 py-1.5 font-semibold rounded whitespace-nowrap transition-all cursor-pointer ${
              productCategoryFilter === 'lifestyle-beverages' ? 'bg-primary-600 text-white shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {lang === 'sw' ? 'Vinywaji' : 'Beverages'}
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="divide-y divide-gray-100 panel-surface overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">
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
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
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
                      <h4 className="font-semibold text-xs sm:text-sm text-gray-900">
                        {lang === 'sw' ? nameSw : nameEn}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          isInStock
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {isInStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      {prod.badge && (
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] rounded font-semibold border border-amber-200">
                          {prod.badge}
                        </span>
                      )}
                      {isHidden && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded font-medium border border-gray-200">
                          Hidden Dukani
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        TZS {currentPrice.toLocaleString()}
                      </span>
                      {override?.price && override.price !== prod.price && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 rounded">
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
                    className="px-2.5 py-1.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                    title="Hariri Maelezo, Picha na Bei"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{lang === 'sw' ? 'Hariri Kamili' : 'Full Edit'}</span>
                  </button>

                  {/* Inline Quick Price Editor */}
                  {isEditingPrice ? (
                    <div className="flex items-center gap-1 bg-white p-1 border border-gray-300 rounded-md shadow-xs">
                      <input
                        type="number"
                        value={newPriceInput}
                        onChange={(e) => setNewPriceInput(e.target.value)}
                        placeholder="Bei TZS..."
                        className="w-24 px-2 py-1 text-xs font-semibold bg-white text-gray-900 border border-gray-300 rounded focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSavePrice(prod.id)}
                        className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingPriceId(null)}
                        className="p-1.5 text-gray-400 hover:text-gray-900 cursor-pointer"
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
                      className="px-2.5 py-1.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                      title="Badilisha Bei ya Haraka"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{lang === 'sw' ? 'Bei Haraka' : 'Quick Price'}</span>
                    </button>
                  )}

                  {/* Stock Toggle Button */}
                  <button
                    onClick={() => toggleProductStock(prod.id, !isInStock)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      isInStock
                        ? 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'
                        : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                    }`}
                  >
                    <span>{isInStock ? 'Ipo Stoo' : 'Imeisha'}</span>
                  </button>

                  {/* Visibility Toggle */}
                  <button
                    onClick={() => toggleProductVisibility(prod.id, !isHidden)}
                    className={`p-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                      isHidden
                        ? 'bg-gray-100 text-gray-400 border-gray-200'
                        : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
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
