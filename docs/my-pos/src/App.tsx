/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { POSScreen } from './components/POSScreen';
import { InventoryTable } from './components/InventoryTable';
import { TransactionLog } from './components/TransactionLog';
import { AddProductModal } from './components/modals/AddProductModal';
import { RestockModal } from './components/modals/RestockModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { GoogleSheetsSetupModal } from './components/modals/GoogleSheetsSetupModal';
import { ToastNotification } from './components/ToastNotification';

const MainContent: React.FC = () => {
  const { activeTab, isLoading } = useStore();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading my tindahan...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-5 pb-24 md:pb-8">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'pos' && <POSScreen />}
      {activeTab === 'inventory' && <InventoryTable />}
      {activeTab === 'transactions' && <TransactionLog />}
    </main>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        <Navbar />
        <MainContent />
        <AddProductModal />
        <RestockModal />
        <ReceiptModal />
        <GoogleSheetsSetupModal />
        <ToastNotification />
      </div>
    </StoreProvider>
  );
}
