import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  PlusCircle, 
  RotateCcw, 
  Coins, 
  ArrowUpRight,
  Boxes,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPeso, formatNumber, formatDate } from '../utils/formatters';
import { Product } from '../types';

export const Dashboard: React.FC = () => {
  const { 
    products, 
    transactions, 
    setActiveTab, 
    setIsAddProductOpen, 
    setIsRestockModalOpen, 
    setRestockTargetProduct,
    resetToSampleData
  } = useStore();

  // Metric 1: Total Inventory Value (cost * stock) & Total Potential Retail Value
  const { totalInventoryCost, totalRetailValue } = useMemo(() => {
    let cost = 0;
    let retail = 0;
    for (const p of products) {
      cost += (p.costPrice || 0) * (p.stock || 0);
      retail += (p.unitPrice || 0) * (p.stock || 0);
    }
    return { totalInventoryCost: cost, totalRetailValue: retail };
  }, [products]);

  // Metric 2: Unique Products Count
  const totalProductsCount = products.length;

  // Metric 3: Low Stock Alerts
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stock <= p.reorderLevel);
  }, [products]);

  // Metric 4: Today's Sales & Profit
  const { todaySalesTotal, todayProfitTotal, todaySalesCount } = useMemo(() => {
    const today = new Date().toDateString();
    let sales = 0;
    let cost = 0;
    let count = 0;

    for (const tx of transactions) {
      if (tx.type === 'SALE' && new Date(tx.timestamp).toDateString() === today) {
        sales += tx.totalAmount || 0;
        cost += tx.totalCost || 0;
        count += 1;
      }
    }
    return {
      todaySalesTotal: sales,
      todayProfitTotal: Math.max(0, sales - cost),
      todaySalesCount: count,
    };
  }, [transactions]);

  // Category summary
  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; stock: number; value: number }> = {};
    for (const p of products) {
      if (!map[p.category]) {
        map[p.category] = { count: 0, stock: 0, value: 0 };
      }
      map[p.category].count += 1;
      map[p.category].stock += p.stock;
      map[p.category].value += p.costPrice * p.stock;
    }
    return Object.entries(map).map(([name, stat]) => ({
      name,
      ...stat,
    })).sort((a, b) => b.value - a.value);
  }, [products]);

  const handleQuickRestock = (product: Product) => {
    setRestockTargetProduct(product);
    setIsRestockModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 md:pb-8">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Tindahan Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time stock balance, sales summaries, and reorder warnings.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm shadow-emerald-600/20 whitespace-nowrap active:scale-[0.98]"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>New Sale (POS)</span>
          </button>
          
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Add Item</span>
          </button>

          <button
            onClick={() => {
              setRestockTargetProduct(null);
              setIsRestockModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Restock</span>
          </button>
        </div>
      </div>

      {/* 0 Products Recovery Banner */}
      {products.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/60 p-4 rounded-2xl border border-amber-200 dark:border-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Walang paninda na nakalista (0 products currently loaded)
            </h3>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
              Click the button to restore all 38 default sari-sari store products into your local inventory!
            </p>
          </div>
          <button
            onClick={resetToSampleData}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ibalik ang 38 Paninda (Restore 38 Products)</span>
          </button>
        </div>
      )}

      {/* Primary KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Inventory Value */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Inventory Capital</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatPeso(totalInventoryCost)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span>Potential Sales:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
              {formatPeso(totalRetailValue)}
            </span>
          </div>
        </div>

        {/* Metric 2: Unique Products Count */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Products</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {totalProductsCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span>Across {categoryStats.length} store categories</span>
          </div>
        </div>

        {/* Metric 3: Low Stock Alerts Count */}
        <div 
          onClick={() => lowStockProducts.length > 0 && setActiveTab('inventory')}
          className={`bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border transition-colors shadow-xs ${
            lowStockProducts.length > 0
              ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20 cursor-pointer hover:bg-amber-50/40'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Low Stock Alerts</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              lowStockProducts.length > 0
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold font-mono tabular-nums ${
            lowStockProducts.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
          }`}>
            {lowStockProducts.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {lowStockProducts.length > 0 ? 'Needs restock soon' : 'All stock levels healthy'}
          </div>
        </div>

        {/* Metric 4: Today's Benta (Sales) */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Today's Sales</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatPeso(todaySalesTotal)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span>Est. Profit:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
              {formatPeso(todayProfitTotal)}
            </span>
            <span className="text-slate-400">({todaySalesCount} sales)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Low Stock Alert Warning Box & Recent Activity / Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Low Stock Warning Box with Quick Restock Action */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Critical & Low Stock Items
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
            >
              <span>View Full Inventory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Lahat ay may laman! (All stock levels are sufficient)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                No items are currently below their reorder threshold.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {lowStockProducts.slice(0, 6).map(prod => {
                const isOutOfStock = prod.stock <= 0;
                return (
                  <div 
                    key={prod.sku} 
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors"
                  >
                    {/* Left / Main Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between sm:justify-start gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {prod.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {prod.sku}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {prod.category}
                        </span>
                        <span>·</span>
                        <span>Reorder: {prod.reorderLevel}</span>
                        <span>·</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 font-mono">
                          {formatPeso(prod.unitPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Right / Stock Status & Action Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-slate-100 dark:border-slate-800 sm:border-t-0 shrink-0">
                      <div className="text-left sm:text-right">
                        <div className={`text-sm font-bold font-mono tabular-nums ${
                          isOutOfStock ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {prod.stock} {prod.unit || 'units'} left
                        </div>
                        <span className="text-[10px] font-semibold tracking-wide uppercase block text-slate-400 dark:text-slate-500">
                          {isOutOfStock ? '🔴 UBOS NA' : '⚠️ PAUBOS NA'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleQuickRestock(prod)}
                        className="px-3.5 py-2 sm:py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 dark:text-emerald-300 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shadow-sm"
                      >
                        + Restock
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Category Breakdown & Recent Transactions */}
        <div className="space-y-6">
          {/* Category Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-600" />
              <span>Category Value</span>
            </h2>
            <div className="space-y-2.5">
              {categoryStats.slice(0, 5).map(cat => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate block">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {cat.count} items · {cat.stock} in stock
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums shrink-0">
                    {formatPeso(cat.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Transactions Log preview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Recent Activity</span>
              </h2>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                View All
              </button>
            </div>

            {transactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No sales or restocks recorded yet.
              </p>
            ) : (
              <div className="space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.slice(0, 4).map(tx => (
                  <div key={tx.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                        <span className={`w-2 h-2 rounded-full ${
                          tx.type === 'SALE' ? 'bg-emerald-500' : 'bg-blue-500'
                        }`} />
                        <span>{tx.type === 'SALE' ? 'Benta' : 'Restock'}</span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          ({tx.items.length} {tx.items.length === 1 ? 'item' : 'items'})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {formatDate(tx.timestamp)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`font-mono font-bold tabular-nums ${
                        tx.type === 'SALE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {formatPeso(tx.totalAmount)}
                      </span>
                      <span className="text-[10px] text-slate-400 block uppercase">
                        {tx.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
