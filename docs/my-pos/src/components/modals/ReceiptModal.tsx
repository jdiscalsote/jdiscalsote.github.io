import React, { useRef, useState } from 'react';
import { X, Printer, Check, Copy, Download, Share2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPeso, formatDate } from '../../utils/formatters';

export const ReceiptModal: React.FC = () => {
  const { receiptTransaction, setReceiptTransaction, settings } = useStore();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  if (!receiptTransaction) return null;

  const isSale = receiptTransaction.type === 'SALE';
  const storeName = settings.storeName || "Nanay's Sari-Sari Store";
  const cashierName = settings.cashierName || 'Ate Tindera';
  const sukiName = receiptTransaction.customerName || (receiptTransaction.paymentMethod === 'UTANG' ? 'Suki (Utang)' : 'Walk-in Suki');
  const footerNote = settings.receiptFooterNote || 'Maraming salamat sa suki! Balik po kayo muli.';
  const dateFormatted = formatDate(receiptTransaction.timestamp);
  const totalFormatted = formatPeso(receiptTransaction.totalAmount);
  const cashFormatted = formatPeso(receiptTransaction.cashTendered || receiptTransaction.totalAmount);
  const changeFormatted = formatPeso(receiptTransaction.changeAmount || 0);

  // Generates clean formatted plain text receipt
  const generateReceiptText = () => {
    const itemsText = receiptTransaction.items
      .map(item => `• ${item.name}\n  ${item.quantity} x ${formatPeso(item.price)} = ${formatPeso(item.subtotal)}`)
      .join('\n');

    let cashText = '';
    if (isSale && receiptTransaction.paymentMethod === 'CASH') {
      cashText = `\nBayad (Cash): ${cashFormatted}\nSUKLI: ${changeFormatted}`;
    }

    return `================================\n${storeName.toUpperCase()}\nOfficial Sales Resibo\n${dateFormatted}\nTRX: ${receiptTransaction.id}\n--------------------------------\nCashier: ${cashierName}\nBayad: ${receiptTransaction.paymentMethod || 'CASH'}\nSuki: ${sukiName}\n--------------------------------\n${itemsText}\n--------------------------------\nKABUUANG HALAGA: ${totalFormatted}${cashText}\n--------------------------------\n"${footerNote}"\n================================`;
  };

  // Direct Browser & Thermal Printing
  const handlePrint = () => {
    // Focus window and trigger browser print dialog cleanly
    window.focus();
    window.print();
  };

  // Copy Plain Text Resibo (for SMS, Messenger, or Viber)
  const handleCopyText = async () => {
    const textReceipt = generateReceiptText();
    try {
      await navigator.clipboard.writeText(textReceipt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // Download Receipt File (.txt) for mobile Bluetooth thermal apps (RawBT, POS-58, etc.)
  const handleDownloadFile = () => {
    const textReceipt = generateReceiptText();
    const blob = new Blob([textReceipt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Resibo-${receiptTransaction.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 2500);
  };

  return (
    <div 
      id="printable-receipt-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div 
        id="printable-receipt-card"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-5 sm:p-6 animate-in zoom-in-95 duration-150 my-auto"
      >
        
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Resibo ng Tindahan
            </span>
          </div>
          <button
            onClick={() => setReceiptTransaction(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Isara"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div 
          ref={receiptRef} 
          id="printable-receipt"
          className="mt-4 p-5 sm:p-6 bg-amber-50/70 dark:bg-slate-800/80 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-600/50 font-mono text-xs text-slate-800 dark:text-slate-200 space-y-3.5 shadow-xs"
        >
          {/* Header */}
          <div className="text-center space-y-1">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white uppercase tracking-tight break-words">
              {storeName}
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Official Sales Resibo</p>
            <div className="text-[11px] text-slate-500 pt-0.5">
              {dateFormatted}
            </div>
            <div className="text-[10px] text-slate-400 tracking-wider">
              TRX: {receiptTransaction.id}
            </div>
          </div>

          {/* Cashier & Payment Metadata */}
          <div className="border-t border-dashed border-amber-300/80 dark:border-slate-700 pt-2.5 text-[11px] flex items-center justify-between gap-2">
            <span className="truncate">Cashier: <strong className="text-slate-900 dark:text-white font-semibold">{cashierName}</strong></span>
            <span className="shrink-0">Payment: <strong className="text-slate-900 dark:text-white font-semibold">{receiptTransaction.paymentMethod || 'CASH'}</strong></span>
          </div>

          {receiptTransaction.customerName && (
            <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
              Suki: <span className="font-bold text-slate-900 dark:text-white">{sukiName}</span>
            </div>
          )}

          {/* Itemized List - With min-w-0, pr-2, break-words so it fits comfortably within the border */}
          <div className="border-t border-b border-dashed border-amber-300/80 dark:border-slate-700 py-3 space-y-2 text-[11px]">
            {receiptTransaction.items.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 pr-1">
                  <div className="font-semibold text-slate-900 dark:text-white break-words leading-snug">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {item.quantity} × {formatPeso(item.price)}
                  </div>
                </div>
                <div className="font-bold font-mono tabular-nums shrink-0 text-right text-slate-900 dark:text-white pl-2">
                  {formatPeso(item.subtotal)}
                </div>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-2 text-xs pt-0.5">
            <div className="flex items-center justify-between gap-2 font-bold text-slate-900 dark:text-white">
              <span className="shrink-0 text-xs uppercase tracking-tight">TOTAL AMOUNT:</span>
              <span className="font-mono tabular-nums text-right text-base text-slate-900 dark:text-white font-extrabold">
                {totalFormatted}
              </span>
            </div>

            {isSale && receiptTransaction.paymentMethod === 'CASH' && (
              <>
                <div className="flex items-center justify-between gap-2 text-slate-600 dark:text-slate-300 text-[11px]">
                  <span className="shrink-0">Bayad (Cash Tendered):</span>
                  <span className="font-mono tabular-nums text-right font-semibold">{cashFormatted}</span>
                </div>
                <div className="flex items-center justify-between gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-xs bg-emerald-100/70 dark:bg-emerald-950/60 px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800">
                  <span className="shrink-0 uppercase tracking-wide">SUKLI (Change):</span>
                  <span className="font-mono tabular-nums text-right text-base font-extrabold">{changeFormatted}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer note */}
          <div className="border-t border-dashed border-amber-300/80 dark:border-slate-700 pt-3 text-center text-[10px] text-slate-500 dark:text-slate-400 italic break-words px-2">
            "{footerNote}"
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-5 space-y-2.5 print:hidden">
          <div className="grid grid-cols-2 gap-2">
            {/* Copy receipt text button */}
            <button
              onClick={handleCopyText}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Kopyahin para sa Messenger/SMS"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            {/* Download receipt file (.txt) */}
            <button
              onClick={handleDownloadFile}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
              title="I-download bilang text file para sa Bluetooth POS printers"
            >
              {isDownloaded ? (
                <>
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-700 dark:text-blue-300 font-bold">Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>Download .txt</span>
                </>
              )}
            </button>
          </div>

          {/* Primary Print Button */}
          <button
            onClick={handlePrint}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt (Thermal / Paper)</span>
          </button>

          {/* Dismiss button */}
          <button
            onClick={() => setReceiptTransaction(null)}
            className="w-full py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-medium transition-colors cursor-pointer text-center"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
