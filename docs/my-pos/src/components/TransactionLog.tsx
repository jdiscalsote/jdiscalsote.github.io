import React, { useState, useMemo } from 'react';
import { 
  ReceiptText, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileText, 
  Eye, 
  RotateCcw,
  ShoppingCart,
  Calendar
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPeso, formatDate } from '../utils/formatters';
import { Transaction } from '../types';

export const TransactionLog: React.FC = () => {
  const { transactions, setReceiptTransaction } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SALE' | 'RESTOCK'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'CASH' | 'GCASH' | 'UTANG'>('ALL');

  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return transactions.filter(tx => {
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
      if (paymentFilter !== 'ALL' && tx.paymentMethod !== paymentFilter) return false;

      if (q) {
        const matchesId = tx.id.toLowerCase().includes(q);
        const matchesCustomer = (tx.customerName || '').toLowerCase().includes(q);
        const matchesItem = tx.items.some(item => item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q));
        return matchesId || matchesCustomer || matchesItem;
      }

      return true;
    });
  }, [transactions, searchQuery, typeFilter, paymentFilter]);

  // Aggregate stats
  const { totalSalesSum, totalRestockSum, salesCount } = useMemo(() => {
    let sales = 0;
    let restocks = 0;
    let sCount = 0;

    for (const tx of transactions) {
      if (tx.type === 'SALE') {
        sales += tx.totalAmount;
        sCount += 1;
      } else {
        restocks += tx.totalAmount;
      }
    }

    return { totalSalesSum: sales, totalRestockSum: restocks, salesCount: sCount };
  }, [transactions]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-20 md:pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Transaction History & Audit Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Chronological records of sales, customer payments, and supplier restocks.
          </p>
        </div>

        {/* Quick summary stats strip */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-100 dark:border-emerald-900">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block font-medium">Total Benta Recorded</span>
            <span className="text-sm font-extrabold font-mono text-emerald-800 dark:text-emerald-200 tabular-nums">
              {formatPeso(totalSalesSum)}
            </span>
          </div>

          <div className="px-3.5 py-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-100 dark:border-blue-900">
            <span className="text-[10px] text-blue-700 dark:text-blue-300 block font-medium">Total Restock Puhunan</span>
            <span className="text-sm font-extrabold font-mono text-blue-800 dark:text-blue-200 tabular-nums">
              {formatPeso(totalRestockSum)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search transaction ID, customer name, or item..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Types</option>
            <option value="SALE">Sales Only</option>
            <option value="RESTOCK">Restocks Only</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Payment</option>
            <option value="CASH">Cash</option>
            <option value="GCASH">GCash</option>
            <option value="UTANG">Utang (Credit)</option>
          </select>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Items / Details</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const isSale = tx.type === 'SALE';
                  const totalItemsCount = tx.items.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <tr 
                      key={tx.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {formatDate(tx.timestamp)}
                        </div>
                      </td>

                      {/* Transaction ID */}
                      <td className="py-3 px-4 font-mono font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {tx.id}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isSale
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                        }`}>
                          {isSale ? 'Benta (Sale)' : 'Restock'}
                        </span>
                      </td>

                      {/* Items Summary */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-slate-900 dark:text-white font-medium truncate">
                          {tx.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} · {tx.customerName || 'Walk-in'}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                          {tx.paymentMethod || 'CASH'}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4 text-right">
                        <span className={`font-mono font-bold text-sm tabular-nums ${
                          isSale ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                        }`}>
                          {formatPeso(tx.totalAmount)}
                        </span>
                      </td>

                      {/* Receipt Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setReceiptTransaction(tx)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Digital Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
