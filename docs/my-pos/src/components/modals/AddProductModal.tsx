import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles, Tag, DollarSign, Package, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory } from '../../types';
import { generateSku } from '../../utils/formatters';

const CATEGORIES: ProductCategory[] = [
  'Instant Noodles & Canned',
  'Beverages & Coffee',
  'Snacks & Biscuits',
  'Sachet & Personal Care',
  'Condiments & Cooking',
  'Household & Cigarettes',
  'School & General',
];

const COMMON_UNITS = ['pc', 'pack', 'sachet', 'can', 'bottle', 'stick', 'bar', 'pouch', 'roll'];

export const AddProductModal: React.FC = () => {
  const { isAddProductOpen, setIsAddProductOpen, addProduct, products } = useStore();

  const [category, setCategory] = useState<ProductCategory>('Instant Noodles & Canned');
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [reorderLevel, setReorderLevel] = useState('5');
  const [unit, setUnit] = useState('pack');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto generate SKU when category changes or modal opens
  useEffect(() => {
    if (isAddProductOpen && !sku) {
      handleAutoGenerateSku(category);
    }
  }, [isAddProductOpen, category]);

  const handleAutoGenerateSku = (cat: ProductCategory) => {
    const existing = products.map(p => p.sku);
    const newSku = generateSku(cat, existing);
    setSku(newSku);
  };

  if (!isAddProductOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }
    if (!sku.trim()) {
      setErrorMsg('SKU is required.');
      return;
    }

    const numUnitPrice = parseFloat(unitPrice);
    const numCostPrice = parseFloat(costPrice) || 0;
    const numStock = parseInt(stock, 10);
    const numReorder = parseInt(reorderLevel, 10);

    if (isNaN(numUnitPrice) || numUnitPrice <= 0) {
      setErrorMsg('Please enter a valid selling price (greater than ₱0).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addProduct({
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category,
        unitPrice: numUnitPrice,
        costPrice: numCostPrice,
        stock: isNaN(numStock) ? 0 : numStock,
        reorderLevel: isNaN(numReorder) ? 5 : numReorder,
        unit: unit.trim() || 'pc',
      });

      if (res.success) {
        // Reset and close
        setName('');
        setUnitPrice('');
        setCostPrice('');
        setStock('10');
        setReorderLevel('5');
        setSku('');
        setIsAddProductOpen(false);
      } else {
        setErrorMsg(res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Sticky Fixed Header */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              Add New Product (Bagong Paninda)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Enter details for inventory catalog and POS cashier.
            </p>
          </div>
          <button
            onClick={() => setIsAddProductOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors shrink-0"
            title="Isara"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={e => {
                const newCat = e.target.value as ProductCategory;
                setCategory(newCat);
                handleAutoGenerateSku(newCat);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Product Name */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Product Name (Pangalan ng Paninda) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. San Miguel Pale Pilsen 330ml Can"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* SKU & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  SKU / Barcode *
                </label>
                <button
                  type="button"
                  onClick={() => handleAutoGenerateSku(category)}
                  className="text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Generate
                </button>
              </div>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="e.g. BEV-009"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Packaging Unit
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                {COMMON_UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Selling Price (Presyo ng Benta ₱) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">₱</span>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  required
                  value={unitPrice}
                  onChange={e => setUnitPrice(e.target.value)}
                  placeholder="20.00"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Cost Price (Puhunan ₱)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">₱</span>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={costPrice}
                  onChange={e => setCostPrice(e.target.value)}
                  placeholder="15.00"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Initial Stock & Reorder Alert Level */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Initial Stock Count
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={e => setStock(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Reorder Alert Level
              </label>
              <input
                type="number"
                min="1"
                value={reorderLevel}
                onChange={e => setReorderLevel(e.target.value)}
                placeholder="5"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Sticky Form Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddProductOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98]"
            >
              {isSubmitting ? 'Saving...' : 'Add Product'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
