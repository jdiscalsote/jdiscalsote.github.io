import React, { useState, useMemo } from 'react';
import { 
  Search, 
  PlusCircle, 
  RotateCcw, 
  Download, 
  Trash2, 
  Edit3, 
  Plus, 
  Minus, 
  Filter, 
  ArrowUpDown,
  AlertTriangle,
  Package,
  Layers,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPeso, calculateMargin } from '../utils/formatters';
import { Product, ProductCategory } from '../types';

const CATEGORIES: Array<'All' | ProductCategory> = [
  'All',
  'Instant Noodles & Canned',
  'Beverages & Coffee',
  'Snacks & Biscuits',
  'Sachet & Personal Care',
  'Condiments & Cooking',
  'Household & Cigarettes',
  'School & General',
];

type SortField = 'name' | 'stock' | 'unitPrice' | 'costPrice' | 'margin';

export const InventoryTable: React.FC = () => {
  const { 
    products, 
    adjustStock, 
    deleteProduct, 
    setIsAddProductOpen, 
    setIsRestockModalOpen, 
    setRestockTargetProduct,
    resetToSampleData
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ProductCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'in_stock' | 'low_stock' | 'out_of_stock'>('All');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products
      .filter(p => {
        // Category check
        if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;

        // Status check
        if (statusFilter === 'out_of_stock' && p.stock > 0) return false;
        if (statusFilter === 'low_stock' && (p.stock <= 0 || p.stock > p.reorderLevel)) return false;
        if (statusFilter === 'in_stock' && p.stock <= p.reorderLevel) return false;

        // Search query
        if (query) {
          return (
            p.name.toLowerCase().includes(query) ||
            p.sku.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
          );
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortField === 'stock') {
          comparison = a.stock - b.stock;
        } else if (sortField === 'unitPrice') {
          comparison = a.unitPrice - b.unitPrice;
        } else if (sortField === 'costPrice') {
          comparison = a.costPrice - b.costPrice;
        } else if (sortField === 'margin') {
          comparison = calculateMargin(a.unitPrice, a.costPrice) - calculateMargin(b.unitPrice, b.costPrice);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [products, searchQuery, categoryFilter, statusFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleRestock = (product: Product) => {
    setRestockTargetProduct(product);
    setIsRestockModalOpen(true);
  };

  const handleDelete = (sku: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
      deleteProduct(sku);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['SKU', 'Item Name', 'Category', 'Unit Price', 'Cost Price', 'Current Stock', 'Reorder Level', 'Unit'];
    const rows = products.map(p => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.unitPrice.toFixed(2),
      p.costPrice.toFixed(2),
      p.stock,
      p.reorderLevel,
      `"${p.unit || 'pc'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tindahan_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-20 md:pb-8">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Inventory Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage product catalog, supplier costs, selling prices, and reorder levels.
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {/* Export CSV Button */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            title="Export CSV file"
          >
            <Download className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="inline sm:hidden">CSV</span>
          </button>

          {/* Restock Item Button */}
          <button
            onClick={() => {
              setRestockTargetProduct(null);
              setIsRestockModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            title="Restock Item"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Restock Item</span>
            <span className="inline sm:hidden">Restock</span>
          </button>

          {/* Add New Product Button */}
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm shadow-emerald-600/20 whitespace-nowrap shrink-0"
            title="Add New Product"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Add New Product</span>
            <span className="inline sm:hidden">Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by SKU, product name, or category..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Select */}
          <div className="md:col-span-4">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Segmented Buttons */}
          <div className="md:col-span-3 flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] font-medium">
            <button
              onClick={() => setStatusFilter('All')}
              className={`flex-1 py-1 rounded-lg transition-colors text-center ${
                statusFilter === 'All' ? 'bg-white dark:bg-slate-700 font-bold shadow-xs text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('low_stock')}
              className={`flex-1 py-1 rounded-lg transition-colors text-center ${
                statusFilter === 'low_stock' ? 'bg-white dark:bg-slate-700 font-bold shadow-xs text-amber-600 dark:text-amber-400' : 'text-slate-500'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setStatusFilter('out_of_stock')}
              className={`flex-1 py-1 rounded-lg transition-colors text-center ${
                statusFilter === 'out_of_stock' ? 'bg-white dark:bg-slate-700 font-bold shadow-xs text-rose-600 dark:text-rose-400' : 'text-slate-500'
              }`}
            >
              Out
            </button>
          </div>
        </div>

        {/* Status count summary */}
        <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
          <span>Showing <strong>{filteredProducts.length}</strong> of {products.length} products</span>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">SKU / Code</th>
                <th 
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Product Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Category</th>
                <th 
                  onClick={() => handleSort('costPrice')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cost (Puhunan)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('unitPrice')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Price (Tinda)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('margin')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Margin %</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('stock')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Current Stock</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <p className="text-slate-600 dark:text-slate-300 font-semibold mb-2">
                      Walang paninda sa inventory (0 products loaded).
                    </p>
                    <button
                      type="button"
                      onClick={resetToSampleData}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore 38 Default Products</span>
                    </button>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    No products matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = product.stock > 0 && product.stock <= product.reorderLevel;
                  const margin = calculateMargin(product.unitPrice, product.costPrice);

                  return (
                    <tr 
                      key={product.sku}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* SKU */}
                      <td className="py-3 px-4 font-mono font-semibold text-slate-600 dark:text-slate-300">
                        {product.sku}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white max-w-xs">
                        <div className="truncate font-semibold">{product.name}</div>
                        <div className="text-[11px] text-slate-400">Unit: {product.unit || 'pc'}</div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {product.category}
                      </td>

                      {/* Cost Price */}
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                        {formatPeso(product.costPrice)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatPeso(product.unitPrice)}
                      </td>

                      {/* Margin % */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        +{margin}%
                      </td>

                      {/* Current Stock with Quick +/- Buttons */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => adjustStock(product.sku, -1)}
                            disabled={product.stock <= 0}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 disabled:opacity-30 text-slate-600 flex items-center justify-center"
                            title="Decrease 1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <span className={`w-10 text-center font-mono font-bold text-sm tabular-nums ${
                            isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-slate-900 dark:text-white'
                          }`}>
                            {product.stock}
                          </span>

                          <button
                            onClick={() => adjustStock(product.sku, 1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 flex items-center justify-center"
                            title="Add 1"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                        }`}>
                          {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleRestock(product)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap"
                            title="Add inventory"
                          >
                            Restock
                          </button>

                          <button
                            onClick={() => handleDelete(product.sku, product.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
