import React from 'react';
import { 
  Store, 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  ReceiptText, 
  RefreshCw, 
  Sheet, 
  Settings as SettingsIcon,
  AlertTriangle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ActiveTab } from '../types';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    settings, 
    cartItemCount, 
    products, 
    syncStatus, 
    isSyncing, 
    syncWithBackend,
    setIsSettingsModalOpen
  } = useStore();

  const lowStockCount = products.filter(p => p.stock <= p.reorderLevel).length;

  const navLinks: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { 
      id: 'pos', 
      label: 'Cashier (POS)', 
      icon: <ShoppingCart className="w-4 h-4" />, 
      badge: cartItemCount > 0 ? cartItemCount : undefined 
    },
    { 
      id: 'inventory', 
      label: 'Inventory', 
      icon: <Package className="w-4 h-4" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined
    },
    { id: 'transactions', label: 'History', icon: <ReceiptText className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Bar (Adheres to 3-zone Top Bar Contract) */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap block leading-tight">
                {settings.storeName || 'Tindahan POS'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-normal">
                Sari-Sari Store Management
              </span>
            </div>
          </div>

          {/* Zone 2: Clean single-line navigation links */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map(link => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                  {link.badge !== undefined && (
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                      link.id === 'inventory' 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary action & Sync / Settings triggers */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sync Status / Trigger Button */}
            <button
              onClick={() => {
                if (settings.appsScriptUrl) {
                  syncWithBackend();
                } else {
                  setIsSettingsModalOpen(true);
                }
              }}
              title={syncStatus.message}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                syncStatus.state === 'synced'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : syncStatus.state === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">
                {isSyncing ? 'Syncing...' : syncStatus.state === 'synced' ? 'Sheets Connected' : 'Google Sheets'}
              </span>
            </button>

            {/* Google Sheets / Settings Configuration Button */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Store & Google Sheets Settings"
              aria-label="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* Quick POS Trigger on desktop */}
            <button
              onClick={() => setActiveTab('pos')}
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20 whitespace-nowrap shrink-0"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Benta (New Sale)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Fixed at bottom for thumb-zone ergonomics) */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe shadow-lg"
      >
        <div className="grid grid-cols-4 items-center h-16">
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`relative flex flex-col items-center justify-center h-full transition-colors ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  {link.icon}
                  {link.badge !== undefined && (
                    <span className={`absolute -top-1.5 -right-2 text-[10px] font-bold px-1 min-w-[16px] h-4 flex items-center justify-center rounded-full leading-none ${
                      link.id === 'inventory' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] tracking-tight mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {link.label.split(' ')[0]}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-5 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
