import React, { useState } from 'react';
import {
  X,
  Upload,

  Image as ImageIcon,
  Languages,
  List,
  CheckCircle2,
  Eye,
  Edit3,
  Save,
  Package,
  Star,
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { useDistributorStore } from '../../store/distributorStore';
import { EdIcon } from '../brand/EdIcon';

interface ProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  lang: 'en' | 'sw';
}

const EDMARK_PRESET_IMAGES = [
  { name: 'Shake Off Phyto Fiber', url: '/products/shake-off-phyto.png' },
  { name: 'Shake Off Pandan', url: '/products/shake-off-pandan.png' },
  { name: 'Splina Liquid Chlorophyll (500ml)', url: '/products/splina-chlorophyll.png' },
  { name: 'MRT Complex (Chocolate)', url: '/products/mrt-complex.png' },
  { name: 'Bio-Elixir (Anti-Aging HGH)', url: '/products/bio-elixir.png' },
  { name: 'Cafe 73 (Ganoderma Coffee)', url: '/products/cafe-73.png' },
  { name: 'Ginseng Coffee', url: '/products/ginseng-coffee.png' },
  { name: 'Bubble C (Vitamin C Calcium)', url: '/products/bubble-c.png' },
  { name: 'Edmark Spirulina', url: '/products/spirulina.png' },
  { name: 'CoCollagen (Fish Collagen)', url: '/products/cocollagen.png' },
  { name: 'Troika (3-in-1 Coffee)', url: '/products/troika.png' },
];

export const ProductEditorModal: React.FC<ProductEditorModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  lang,
}) => {
  const addMasterProduct = useDistributorStore((s) => s.addMasterProduct);
  const updateMasterProduct = useDistributorStore((s) => s.updateMasterProduct);
  const updateProductPrice = useDistributorStore((s) => s.updateProductPrice);
  const toggleProductStock = useDistributorStore((s) => s.toggleProductStock);
  const addAuditLog = useDistributorStore((s) => s.addAuditLog);

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [targetLangTab, setTargetLangTab] = useState<'sw' | 'en'>('sw');

  // Form states
  const productId = productToEdit?.id || '';
  const [nameEn, setNameEn] = useState(productToEdit?.name?.en || '');
  const [nameSw, setNameSw] = useState(productToEdit?.name?.sw || '');
  const [category, setCategory] = useState<ProductCategory>(productToEdit?.category || 'health-wellness');
  const [price, setPrice] = useState<number>(productToEdit?.price || 35000);
  const [priceUsd, setPriceUsd] = useState<number>(productToEdit?.priceUsd || 15);
  const [badge, setBadge] = useState(productToEdit?.badge || 'BESTSELLER');
  const [inStock, setInStock] = useState<boolean>(productToEdit ? productToEdit.inStock : true);
  const [image, setImage] = useState(productToEdit?.image || '/products/shake-off-phyto.png');

  const [descEn, setDescEn] = useState(productToEdit?.description?.en || '');
  const [descSw, setDescSw] = useState(productToEdit?.description?.sw || '');
  const [usageEn, setUsageEn] = useState(productToEdit?.usage?.en || '');
  const [usageSw, setUsageSw] = useState(productToEdit?.usage?.sw || '');

  // Translation indicator
  const [isTranslating, setIsTranslating] = useState(false);
  const [uploadError, setUploadError] = useState('');

  if (!isOpen) return null;

  // Handle local image file upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Tafadhali chagua picha sahihi (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setUploadError('Picha isizidi 4MB.');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Smart Auto-Translation between Swahili and English
  const handleAutoTranslate = (direction: 'to_sw' | 'to_en') => {
    setIsTranslating(true);
    setTimeout(() => {
      if (direction === 'to_sw') {
        // Translate English to Swahili
        if (!nameSw && nameEn) setNameSw(nameEn);
        if (descEn && (!descSw || descSw.length < 5)) {
          let translated = descEn
            .replace(/Helps cleanse the colon/gi, 'Husaidia kusafisha utumbo mpana ndani ya masaa 8')
            .replace(/Rich in chlorophyll/gi, 'Ina klorofili nyingi kusafisha na kuupa mwili oksijeni')
            .replace(/Burns fat and aids weight loss/gi, 'Huyeyusha mafuta mwilini na kusaidia kupunguza uzito')
            .replace(/Boosts energy and stamina/gi, 'Huongeza nguvu, uchangamfu na kupunguza uchovu')
            .replace(/Take 1 sachet before bed/gi, 'Kunywa pakiti 1 kabla ya kulala na maji baridi au ya uvuguvugu')
            .replace(/Drink at least 2 to 3 liters of water/gi, 'Kunywa maji mengi lita 2 hadi 3 kwa siku');
          setDescSw(translated);
        }
        if (usageEn && (!usageSw || usageSw.length < 5)) {
          let translatedUsage = usageEn
            .replace(/Pour 1 sachet into a shaker with 250ml of cold water, shake well, and drink immediately/gi, 'Mimina pakiti 1 kwenye shaker na maji baridi 250ml, tikisa haraka, kisha unywe mara moja.')
            .replace(/Mix 1 tablespoon in 500ml water and drink throughout the day/gi, 'Weka kijiko 1 cha chakula kwenye maji lita 0.5 kisha unywe kutwa nzima.');
          setUsageSw(translatedUsage);
        }
      } else {
        // Translate Swahili to English
        if (!nameEn && nameSw) setNameEn(nameSw);
        if (descSw && (!descEn || descEn.length < 5)) {
          let translated = descSw
            .replace(/Husaidia kusafisha utumbo/gi, 'Helps cleanse the colon and remove toxic waste')
            .replace(/Klorofili safi/gi, 'Pure Liquid Chlorophyll for cellular detox and blood oxygenation')
            .replace(/Hupunguza kitambi na uzito/gi, 'Targets visceral belly fat and promotes healthy slimming')
            .replace(/Huongeza nguvu/gi, 'Boosts physical stamina and overall immune resilience');
          setDescEn(translated);
        }
        if (usageSw && (!usageEn || usageEn.length < 5)) {
          let translatedUsage = usageSw
            .replace(/Mimina pakiti 1/gi, 'Pour 1 sachet into a shaker with 250ml cold water, shake well and drink immediately.')
            .replace(/Kunywa kabla ya kulala/gi, 'Drink 1 sachet before bedtime with plenty of clean water.');
          setUsageEn(translatedUsage);
        }
      }
      setIsTranslating(false);
    }, 300);
  };

  // Rich Text Insertion Helper
  const insertFormatting = (field: 'desc' | 'usage', prefix: string, suffix: string = '') => {
    if (field === 'desc') {
      if (targetLangTab === 'sw') {
        setDescSw((prev) => prev + (prev ? '\n' : '') + prefix + suffix);
      } else {
        setDescEn((prev) => prev + (prev ? '\n' : '') + prefix + suffix);
      }
    } else {
      if (targetLangTab === 'sw') {
        setUsageSw((prev) => prev + (prev ? '\n' : '') + prefix + suffix);
      } else {
        setUsageEn((prev) => prev + (prev ? '\n' : '') + prefix + suffix);
      }
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const id = productId.trim() || nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newProduct: Product = {
      id,
      name: {
        en: nameEn.trim() || nameSw.trim() || 'New Product',
        sw: nameSw.trim() || nameEn.trim() || 'Bidhaa Mpya',
      },
      category,
      price: Number(price) || 35000,
      priceUsd: Number(priceUsd) || 15,
      currency: 'TZS',
      description: {
        en: descEn.trim() || 'Premium Edmark Health Product',
        sw: descSw.trim() || 'Bidhaa bora ya afya ya Edmark',
      },
      usage: {
        en: usageEn.trim() || 'Follow package instructions.',
        sw: usageSw.trim() || 'Fuata maelekezo ya kifurushi.',
      },
      image: image || '/products/shake-off-phyto.png',
      badge: badge.trim() || undefined,
      inStock,
    };

    if (productToEdit) {
      updateMasterProduct(productToEdit.id, newProduct);
      updateProductPrice(productToEdit.id, newProduct.price);
      toggleProductStock(productToEdit.id, newProduct.inStock);
      addAuditLog({
        action: 'Bidhaa Imesasishwa Kwenye Katalogi Kuu',
        category: 'product_management',
        details: `Bidhaa ${newProduct.name.sw} (ID: ${newProduct.id}) imesasishwa: Bei TZS ${newProduct.price.toLocaleString()}, Hali: ${newProduct.inStock ? 'In Stock' : 'Out of Stock'}.`,
        user: 'Distributor / Master Admin',
      });
    } else {
      addMasterProduct(newProduct);
      updateProductPrice(newProduct.id, newProduct.price);
      toggleProductStock(newProduct.id, newProduct.inStock);
      addAuditLog({
        action: 'Bidhaa Mpya Imeongezwa Kwenye Katalogi',
        category: 'product_management',
        details: `Bidhaa mpya ${newProduct.name.sw} (Bei TZS ${newProduct.price.toLocaleString()}) imeongezwa dukani.`,
        user: 'Distributor / Master Admin',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-gray-200 rounded-lg shadow-overlay overflow-hidden text-gray-900 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary-50 text-primary-700 border border-primary-200">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                {productToEdit
                  ? lang === 'sw'
                    ? 'Hariri Bidhaa & Bei Dukani'
                    : 'Edit Product & Retail Pricing'
                  : lang === 'sw'
                  ? 'Ongeza Bidhaa Mpya Dukani'
                  : 'Add New Product to Storefront'}
              </h2>
              <p className="text-xs text-gray-500">
                {lang === 'sw'
                  ? 'Dhibiti picha, bei, maelezo ya Kiswahili/Kiingereza, na stoo.'
                  : 'Manage images, pricing, bilingual descriptions, and inventory.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: Edit Form vs Live Card Preview */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-3 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
                activeTab === 'edit'
                  ? 'border-primary-600 text-primary-700 bg-primary-50/50'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{lang === 'sw' ? 'Mhariri wa Bidhaa' : 'Product Editor'}</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
                activeTab === 'preview'
                  ? 'border-primary-600 text-primary-700 bg-primary-50/50'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{lang === 'sw' ? 'Hakiki Kadi ya Dukani' : 'Live Storefront Card'}</span>
            </button>
          </div>

          {/* Language Switcher for Fields */}
          {activeTab === 'edit' && (
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md border border-gray-200 text-[11px] mb-1">
              <button
                type="button"
                onClick={() => setTargetLangTab('sw')}
                className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                  targetLangTab === 'sw' ? 'bg-primary-600 text-white font-bold' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                🇹🇿 Kiswahili
              </button>
              <button
                type="button"
                onClick={() => setTargetLangTab('en')}
                className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                  targetLangTab === 'en' ? 'bg-primary-600 text-white font-bold' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {activeTab === 'edit' ? (
            <form id="product-editor-form" onSubmit={handleSaveProduct} className="space-y-5">
              {/* Row 1: Names & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {lang === 'sw' ? 'Jina la Bidhaa (Kiswahili)' : 'Product Name (Swahili)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameSw}
                    onChange={(e) => setNameSw(e.target.value)}
                    placeholder="Mf: Shake Off Phyto Fiber (Pandan)"
                    className="portal-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {lang === 'sw' ? 'Jina la Bidhaa (Kiingereza)' : 'Product Name (English)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="E.g. Shake Off Phyto Fiber"
                    className="portal-input"
                  />
                </div>
              </div>

              {/* Row 2: Category, Badge, Prices */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {lang === 'sw' ? 'Kundi / Jamii' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="portal-input cursor-pointer"
                  >
                    <option value="p4-slimming">P4 Slimming</option>
                    <option value="health-wellness">Afya & Kinga (Wellness)</option>
                    <option value="lifestyle-beverages">Vinywaji & Kahawa (Beverages)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {lang === 'sw' ? 'Lebo / Badge' : 'Badge / Tag'}
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Mf: INAYOPENDEZWA, BESTSELLER"
                    className="portal-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {lang === 'sw' ? 'Bei Dukani (TZS)' : 'Retail Price (TZS)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={500}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="portal-input font-semibold text-primary-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {lang === 'sw' ? 'Bei ya USD ($)' : 'USD Price ($)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(Number(e.target.value))}
                    className="portal-input"
                  />
                </div>
              </div>

              {/* Stock Status Switch */}
              <div className="flex items-center justify-between p-3.5 panel-inner">
                <div>
                  <span className="text-xs font-semibold text-gray-900 block">
                    {lang === 'sw' ? 'Hali ya Mzigo Stoo' : 'Inventory Availability'}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {inStock
                      ? lang === 'sw'
                        ? 'Wateja wanaweza kuagiza kwenye duka mtandao.'
                        : 'Available for immediate checkout on the web store.'
                      : lang === 'sw'
                      ? 'Itaonekana kama Imeisha Stoo (Out of Stock).'
                      : 'Marked as Out of Stock on storefront.'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setInStock(!inStock)}
                  className={`px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    inStock
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                  }`}
                >
                  {inStock ? 'In Stock (Ipo)' : 'Out of Stock (Imeisha)'}
                </button>
              </div>

              {/* Section: Image Upload & Preset Selector */}
              <div className="p-4 panel-inner space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-primary-600" />
                    <span>{lang === 'sw' ? 'Picha ya Bidhaa' : 'Product Visual'}</span>
                  </label>
                  {image && (
                    <span className="text-[10px] text-green-700 font-semibold">
                      {lang === 'sw' ? 'Picha Imechaguliwa' : 'Image Loaded'}
                    </span>
                  )}
                </div>

                {uploadError && (
                  <p className="text-xs text-red-700 font-semibold bg-red-50 p-2 rounded-md border border-red-200">
                    {uploadError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  {/* Image Preview Box */}
                  <div className="h-28 rounded-md bg-white border border-gray-200 p-2 flex items-center justify-center relative group">
                    {image ? (
                      <img
                        src={image}
                        alt="Product Preview"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/products/shake-off-phyto.png';
                        }}
                      />
                    ) : (
                      <span className="text-[11px] text-gray-400">Hakuna Picha</span>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-xs font-semibold rounded-md cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-primary-600" />
                        <span>{lang === 'sw' ? 'Pakia Kutoka Simu / Kompyuta' : 'Upload Image File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="Au weka link ya picha (URL)..."
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md text-[11px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />

                    {/* Quick Preset Picker */}
                    <div className="pt-1">
                      <span className="text-[10px] text-gray-500 font-semibold block mb-1">
                        {lang === 'sw' ? 'Chagua Kutoka Picha Rasmi za Edmark:' : 'Quick Select Preset Image:'}
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {EDMARK_PRESET_IMAGES.map((preset) => (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() => setImage(preset.url)}
                            className={`px-2 py-1 rounded text-[10px] font-semibold shrink-0 border transition-all cursor-pointer ${
                              image === preset.url
                                ? 'bg-primary-600 text-white border-primary-600 font-bold'
                                : 'bg-white text-gray-500 border-gray-200 hover:text-gray-900'
                            }`}
                          >
                            {preset.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Bilingual Rich Descriptions & Translation Bar */}
              <div className="space-y-3 p-4 panel-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <EdIcon name="leaf" className="w-4 h-4 text-primary-600" />
                    <span className="text-xs font-semibold text-gray-900">
                      {targetLangTab === 'sw' ? 'Maelezo ya Kiswahili' : 'English Description & Benefits'}
                    </span>
                  </div>

                  {/* Auto-Translation Actions */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <button
                      type="button"
                      disabled={isTranslating}
                      onClick={() => handleAutoTranslate(targetLangTab === 'sw' ? 'to_sw' : 'to_en')}
                      className="px-2.5 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Languages className="w-3 h-3" />
                      <span>
                        {isTranslating
                          ? 'Inatafsiri...'
                          : targetLangTab === 'sw'
                          ? 'Tafsiri Kutoka English'
                          : 'Auto-Translate to English'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Rich Text Toolbar */}
                <div className="flex items-center gap-1 bg-white p-1.5 rounded-md border border-gray-200 flex-wrap text-xs">
                  <button
                    type="button"
                    onClick={() => insertFormatting('desc', '✅ Faida: ')}
                    className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-green-700 rounded font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>+ Faida</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('desc', '• ')}
                    className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <List className="w-3 h-3" />
                    <span>+ Orodha</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('desc', '⭐ Muhimu: ')}
                    className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-amber-700 rounded font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Star className="w-3 h-3" />
                    <span>+ Muhimu</span>
                  </button>
                </div>

                {/* Description Textarea */}
                <div>
                  <textarea
                    rows={3}
                    value={targetLangTab === 'sw' ? descSw : descEn}
                    onChange={(e) =>
                      targetLangTab === 'sw' ? setDescSw(e.target.value) : setDescEn(e.target.value)
                    }
                    placeholder={
                      targetLangTab === 'sw'
                        ? 'Andika faida kuu za bidhaa kwa Kiswahili...'
                        : 'Write product benefits in English...'
                    }
                    className="w-full p-3 bg-white border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 leading-relaxed font-sans"
                  />
                </div>

                {/* Usage Instructions */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {targetLangTab === 'sw' ? 'Jinsi ya Kutumia (Usage):' : 'Directions for Use:'}
                  </label>
                  <textarea
                    rows={2}
                    value={targetLangTab === 'sw' ? usageSw : usageEn}
                    onChange={(e) =>
                      targetLangTab === 'sw' ? setUsageSw(e.target.value) : setUsageEn(e.target.value)
                    }
                    placeholder={
                      targetLangTab === 'sw'
                        ? 'Mf: Kunywa pakiti 1 kabla ya kulala na maji baridi 250ml...'
                        : 'E.g. Drink 1 sachet before bed with 250ml water...'
                    }
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 leading-relaxed"
                  />
                </div>
              </div>
            </form>
          ) : (
            /* Live Storefront Card Preview Tab */
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800">
                {lang === 'sw'
                  ? 'Hivi ndivyo wateja wataona bidhaa hii kwenye orodha ya duka na kurasa za oda:'
                  : 'Here is exactly how customers will view this product card on the live storefront:'}
              </div>

              <div className="max-w-sm mx-auto bg-white border border-gray-200 rounded-lg p-4 shadow-card space-y-3">
                {/* Image + Badge */}
                <div className="relative aspect-square rounded-md bg-gray-50 border border-gray-200 p-4 flex items-center justify-center overflow-hidden">
                  {badge && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                      {badge}
                    </span>
                  )}
                  <span
                    className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      inStock
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                  <img
                    src={image || '/products/shake-off-phyto.png'}
                    alt={nameEn || 'Product'}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Content Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {lang === 'sw' ? nameSw || nameEn : nameEn || nameSw}
                  </h3>
                  <div className="text-base font-bold text-primary-700 mt-1">
                    TZS {Number(price || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                    {lang === 'sw' ? descSw || descEn : descEn || descSw}
                  </p>
                </div>

                {/* Usage Snippet */}
                <div className="p-2.5 rounded-md bg-gray-50 border border-gray-200 text-[11px] text-gray-600">
                  <span className="font-semibold text-primary-700 block mb-0.5">
                    {lang === 'sw' ? 'Matumizi:' : 'How to use:'}
                  </span>
                  <p>{lang === 'sw' ? usageSw || usageEn : usageEn || usageSw}</p>
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-md text-xs shadow-md"
                >
                  {lang === 'sw' ? 'Weka Kwenye Kikapu 🛒' : 'Add to Cart 🛒'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-md bg-white border border-gray-300 transition-colors cursor-pointer"
          >
            {lang === 'sw' ? 'Ghairi' : 'Cancel'}
          </button>

          <button
            type="submit"
            form="product-editor-form"
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-md transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>
              {productToEdit
                ? lang === 'sw'
                  ? 'Hifadhi Mabadiliko'
                  : 'Save Product Updates'
                : lang === 'sw'
                ? 'Ongeza Kwenye Duka'
                : 'Publish to Storefront'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};