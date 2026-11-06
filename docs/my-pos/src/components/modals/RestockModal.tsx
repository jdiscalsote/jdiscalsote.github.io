import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Package, DollarSign, Calculator } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPeso } from '../../utils/formatters';
import { Product } from '../../types';

export const RestockModal: React.FC = () => {
  const { 
    isRestockModalOpen, 
    setIsRestockModalOpen, 
    restockTargetProduct, 
    products, 
    restockProduct 
  } = useStore();

  const [selectedSku, setSelectedSku] = useState<string>('');
  const [addedQuantity, setAddedQuantity] = useState<string>('12');
  const [costPrice, setCostPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selected product when modal opens or target changes
  useEffect(() => {
    if (restockTargetProduct) {
      setSelectedSku(restockTargetProduct.sku);
      setCostPrice(restockTargetProduct.costPrice.toString());
    } else if (products.length > 0 && !selectedSku) {
      setSelectedSku(products[0].sku);
      setCostPrice(products[0].costPrice.toString());
    }
  }, [restockTargetProduct, products]);

  // Update cost price when user changes selected SKU
  const handleSkuChange = (sku: string) => {
    setSelectedSku(sku);
    const prod = products.find(p => p.sku === sku);
    if (prod) {
      setCostPrice(prod.costPrice.toString());
    }
  };

  if (!isRestockModalOpen) return null;

  const currentProduct = products.find(p => p.sku === selectedSku);
  const numQty = parseInt(addedQuantity, 10) || 0;
  const numCost = parseFloat(costPrice) || (currentProduct?.costPrice || 0);
  const totalRestockInvestment = numQty * numCost;
  const newStockProjected = (currentProduct?.stock || 0) + numQty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSku || numQty <= 0) return;

    setIsSubmitting(true);
    try {
      const res = await restockProduct(selectedSku, numQty, numCost);
      if (res.success) {
        setIsRestockModalOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Sticky Fixed Header */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                Restock Item (Dagdagan ng Stock)
              </h2>
              <p className="text-[11px] text-slate-500 truncate">Record incoming supplier delivery</p>
            </div>
          </div>
          <button
            onClick={() => setIsRestockModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors shrink-0"
            title="Isara"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
          {/* Select Product */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Select Product *
            </label>
            <select
              value={selectedSku}
              onChange={e => handleSkuChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {products.map(p => (
                <option key={p.sku} value={p.sku}>
                  {p.name} (Current: {p.stock} {p.unit || 'pc'})
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock info banner */}
          {currentProduct && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Kasalukuyang Stock:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {currentProduct.stock} {currentProduct.unit || 'units'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Bagong Stock:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                  {newStockProjected} {currentProduct.unit || 'units'}
                </span>
              </div>
            </div>
          )}

          {/* Quantity to Add */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Quantity to Add (Karagdagang Bilang) *
              </label>
            </div>
            <input
              type="number"
              min="1"
              required
              value={addedQuantity}
              onChange={e => setAddedQuantity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            {/* Quick Batch Buttons */}
            <div className="flex items-center gap-1.5 mt-1.5">
              {[6, 12, 24, 48].map(qty => (
                <button
                  type="button"
                  key={qty}
                  onClick={() => setAddedQuantity(qty.toString())}
                  className="px-2.5 py-1 text-xs font-mono font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                >
                  +{qty}
                </button>
              ))}
            </div>
          </div>

          {/* Supplier Cost Price */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Supplier Cost per Unit (Puhunan ₱)
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
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Total Delivery Investment Summary */}
          <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900 flex items-center justify-between text-xs">
            <span className="font-medium text-blue-900 dark:text-blue-200">
              Total Supplier Puhunan:
            </span>
            <span className="font-mono font-extrabold text-blue-900 dark:text-blue-200 text-sm tabular-nums">
              {formatPeso(totalRestockInvestment)}
            </span>
          </div>

          {/* Sticky Footer Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setIsRestockModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || numQty <= 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 active:scale-[0.98]"
            >
              {isSubmitting ? 'Updating...' : `Confirm Restock (+${numQty})`}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
