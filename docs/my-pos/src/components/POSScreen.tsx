import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  BookOpen, 
  CheckCircle2, 
  X, 
  Sparkles, 
  AlertCircle,
  QrCode,
  Tag
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPeso, formatNumber } from '../utils/formatters';
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

export const POSScreen: React.FC = () => {
  const { 
    products, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart, 
    cartTotal, 
    cartItemCount,
    checkoutSale,
    isSyncing
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'GCASH' | 'UTANG'>('CASH');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [saleNote, setSaleNote] = useState<string>('');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on mount or keypress '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesQuery = !query || 
        p.name.toLowerCase().includes(query) || 
        p.sku.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [products, searchQuery, selectedCategory]);

  // Numeric Tendered & Sukli calculation
  const numericTendered = parseFloat(cashTendered) || 0;
  const sukliAmount = paymentMethod === 'CASH' ? numericTendered - cartTotal : 0;
  const isInsufficientCash = paymentMethod === 'CASH' && cart.length > 0 && numericTendered < cartTotal;

  // Quick cash tender helper buttons
  const cashDenominations = [20, 50, 100, 200, 500, 1000];

  const handleQuickCash = (amount: number) => {
    setCashTendered(amount.toString());
  };

  const handleAddExactCash = () => {
    setCashTendered(cartTotal.toFixed(2));
  };

  const handleAddMoreCash = (denomination: number) => {
    const current = parseFloat(cashTendered) || 0;
    setCashTendered((current + denomination).toString());
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'CASH' && isInsufficientCash) {
      alert(`Kulang ang bayad! Cash tendered is ₱${numericTendered.toFixed(2)}, but total is ₱${cartTotal.toFixed(2)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await checkoutSale({
        cashTendered: paymentMethod === 'CASH' ? (numericTendered || cartTotal) : cartTotal,
        paymentMethod,
        customerName: customerName.trim(),
        note: saleNote.trim(),
      });

      if (res.success) {
        // Reset form
        setCashTendered('');
        setCustomerName('');
        setSaleNote('');
        setIsMobileDrawerOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 lg:pb-8">
      {/* 2-Column Responsive Layout: Left Catalog, Right Cart Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols): Catalog, Search & Categories */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          
          {/* Search Bar & Fast Lookup */}
          <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search item name, brand, or SKU... (Press '/' to focus)"
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm border-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {searchQuery && (
              <span className="text-xs text-slate-500 whitespace-nowrap hidden sm:inline">
                {filteredProducts.length} items found
              </span>
            )}
          </div>

          {/* Category Filter Pills (Functional interactive buttons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(category => {
              const isSelected = selectedCategory === category;
              const count = category === 'All' 
                ? products.length 
                : products.filter(p => p.category === category).length;

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span>{category}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-emerald-700/80 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Walang nahanap na item (No items found)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try searching with another keyword or pick another category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                const inCart = cart.find(c => c.product.sku === product.sku);
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= product.reorderLevel;

                return (
                  <button
                    key={product.sku}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    disabled={isOutOfStock}
                    className={`relative text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between group active:scale-[0.98] ${
                      isOutOfStock
                        ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
                        : inCart
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-700 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-xs'
                    }`}
                  >
                    {/* In Cart Badge */}
                    {inCart && (
                      <span className="absolute top-2.5 right-2.5 w-6 h-6 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-xs">
                        {inCart.quantity}
                      </span>
                    )}

                    <div>
                      {/* Quiet Category & SKU text */}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                        <span className="font-mono">{product.sku}</span>
                        <span>·</span>
                        <span className="truncate">{product.unit || 'pc'}</span>
                      </div>

                      {/* Product Name */}
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      {/* Price in Peso */}
                      <div>
                        <span className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                          {formatPeso(product.unitPrice)}
                        </span>
                      </div>

                      {/* Stock indicator badge */}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        isOutOfStock
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : isLowStock
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {isOutOfStock ? 'Ubos' : `${product.stock} left`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (4-5 cols): Cart / Checkout Panel (Desktop) */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
            
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Kasalukuyang Cart
                </h2>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:text-rose-700 font-medium transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Walang laman ang cart
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
                  Pumili ng mga paninda sa kaliwa para idagdag sa benta.
                </p>
              </div>
            ) : (
              <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                {cart.map(item => (
                  <div key={item.product.sku} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {item.product.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {formatPeso(item.product.unitPrice)} x {item.quantity} = {formatPeso(item.product.unitPrice * item.quantity)}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateCartQuantity(item.product.sku, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-mono font-bold text-xs tabular-nums text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.sku, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.sku)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors ml-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total Calculation & Checkout Details */}
            {cart.length > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                {/* Subtotal Row */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Kabuuang Halaga (Total):
                  </span>
                  <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                    {formatPeso(cartTotal)}
                  </span>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Paraan ng Bayad (Payment Method):
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
                    <button
                      onClick={() => setPaymentMethod('CASH')}
                      className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                        paymentMethod === 'CASH'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cash</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('GCASH')}
                      className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                        paymentMethod === 'GCASH'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5 text-blue-600" />
                      <span>GCash</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('UTANG')}
                      className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                        paymentMethod === 'UTANG'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                      <span>Utang</span>
                    </button>
                  </div>
                </div>

                {/* Cash Tendered & Sukli helper for Cash */}
                {paymentMethod === 'CASH' && (
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Bayad (Cash Tendered):
                      </label>
                      <button
                        onClick={handleAddExactCash}
                        className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        Exact Amount (₱{cartTotal.toFixed(0)})
                      </button>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">
                        ₱
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={cashTendered}
                        onChange={e => setCashTendered(e.target.value)}
                        placeholder={cartTotal.toFixed(2)}
                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Quick Bill Tender Buttons */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {cashDenominations.map(bill => (
                        <button
                          key={bill}
                          onClick={() => handleQuickCash(bill)}
                          className="px-2 py-1 text-[11px] font-mono font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          ₱{bill}
                        </button>
                      ))}
                    </div>

                    {/* Sukli Calculation Box */}
                    <div className={`mt-2 p-2.5 rounded-lg flex items-center justify-between ${
                      isInsufficientCash
                        ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                        : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                    }`}>
                      <div className="text-xs font-semibold">
                        {isInsufficientCash ? 'Kulang ang bayad:' : 'Sukli (Change):'}
                      </div>
                      <div className="text-base font-extrabold font-mono tabular-nums">
                        {isInsufficientCash
                          ? `- ${formatPeso(cartTotal - numericTendered)}`
                          : formatPeso(sukliAmount)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Suki Name (Mandatory for Utang, optional for Cash/GCash) */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {paymentMethod === 'UTANG' ? 'Pangalan ng May Utang (Customer Name) *' : 'Pangalan ng Customer (Optional):'}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder={paymentMethod === 'UTANG' ? 'e.g. Aling Marites' : 'e.g. Suki'}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Complete Sale Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting || (paymentMethod === 'CASH' && isInsufficientCash) || (paymentMethod === 'UTANG' && !customerName.trim())}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isSubmitting ? 'Recording Sale...' : `Kolekta Bayad (${formatPeso(cartTotal)})`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Sticky Bottom Floating Cart Bar */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 p-3 z-30 pointer-events-none">
        {cart.length > 0 && (
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs font-mono">
                  {cartItemCount}
                </div>
                <div className="text-left">
                  <div className="text-xs text-emerald-100 font-medium">Benta Subtotal</div>
                  <div className="text-sm font-extrabold font-mono tabular-nums leading-tight">
                    {formatPeso(cartTotal)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold bg-white text-emerald-800 px-3.5 py-1.5 rounded-xl shadow-xs">
                <span>Magbayad / Sukli</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet Drawer for Cart & Sukli */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end px-2">
          <div 
            onClick={() => setIsMobileDrawerOpen(false)} 
            className="flex-1"
          />
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            
            {/* Grab handle & Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Checkout Cart ({cartItemCount} items)
                </h3>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items list in drawer */}
            <div className="max-h-[200px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 space-y-2">
              {cart.map(item => (
                <div key={item.product.sku} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {item.product.name}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {formatPeso(item.product.unitPrice)} x {item.quantity}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => updateCartQuantity(item.product.sku, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.sku, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total:</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {formatPeso(cartTotal)}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 ${
                  paymentMethod === 'CASH' ? 'bg-white dark:bg-slate-700 shadow-xs font-bold' : ''
                }`}
              >
                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cash</span>
              </button>
              <button
                onClick={() => setPaymentMethod('GCASH')}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 ${
                  paymentMethod === 'GCASH' ? 'bg-white dark:bg-slate-700 shadow-xs font-bold' : ''
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-blue-600" />
                <span>GCash</span>
              </button>
              <button
                onClick={() => setPaymentMethod('UTANG')}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 ${
                  paymentMethod === 'UTANG' ? 'bg-white dark:bg-slate-700 shadow-xs font-bold' : ''
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>Utang</span>
              </button>
            </div>

            {/* Cash Tendered & Sukli helper for Cash */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Bayad (Cash Tendered):
                  </label>
                  <button
                    onClick={handleAddExactCash}
                    className="text-[11px] font-semibold text-emerald-600"
                  >
                    Exact (₱{cartTotal.toFixed(0)})
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={cashTendered}
                    onChange={e => setCashTendered(e.target.value)}
                    placeholder={cartTotal.toFixed(2)}
                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white text-base"
                  />
                </div>

                {/* Quick Bills */}
                <div className="flex flex-wrap gap-1">
                  {cashDenominations.map(bill => (
                    <button
                      key={bill}
                      onClick={() => handleQuickCash(bill)}
                      className="px-2.5 py-1 text-xs font-mono font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
                    >
                      ₱{bill}
                    </button>
                  ))}
                </div>

                {/* Sukli Result */}
                <div className={`p-2.5 rounded-lg flex items-center justify-between ${
                  isInsufficientCash
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  <div className="text-xs font-semibold">
                    {isInsufficientCash ? 'Kulang ang bayad:' : 'Sukli (Change):'}
                  </div>
                  <div className="text-base font-extrabold font-mono tabular-nums">
                    {isInsufficientCash
                      ? `- ${formatPeso(cartTotal - numericTendered)}`
                      : formatPeso(sukliAmount)}
                  </div>
                </div>
              </div>
            )}

            {/* Suki Customer Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {paymentMethod === 'UTANG' ? 'Pangalan ng May Utang *' : 'Customer Name (Optional):'}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder={paymentMethod === 'UTANG' ? 'e.g. Aling Marites' : 'e.g. Suki'}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {/* Mobile Submit Button */}
            <button
              onClick={handleCheckout}
              disabled={isSubmitting || (paymentMethod === 'CASH' && isInsufficientCash) || (paymentMethod === 'UTANG' && !customerName.trim())}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting ? 'Recording...' : `Kolekta Bayad (${formatPeso(cartTotal)})`}
              </span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
