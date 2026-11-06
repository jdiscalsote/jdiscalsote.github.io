import React, { useState } from 'react';
import { 
  X, 
  Sheet, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Settings,
  Database,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { GOOGLE_APPS_SCRIPT_CODE } from '../../services/googleAppsScriptCode';
import { ApiService } from '../../services/api';
import { INITIAL_PRODUCTS } from '../../data/initialProducts';

export const GoogleSheetsSetupModal: React.FC = () => {
  const { 
    isSettingsModalOpen, 
    setIsSettingsModalOpen, 
    settings, 
    products,
    isSyncing,
    updateSettings, 
    syncWithBackend, 
    uploadLocalCatalogToSheets,
    resetToSampleData 
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'sheets' | 'store'>('sheets');
  const [urlInput, setUrlInput] = useState(settings.appsScriptUrl);
  const [storeName, setStoreName] = useState(settings.storeName);
  const [cashierName, setCashierName] = useState(settings.cashierName);
  const [receiptNote, setReceiptNote] = useState(settings.receiptFooterNote);

  const [isCopied, setIsCopied] = useState(false);
  const [isTsvCopied, setIsTsvCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);

  if (!isSettingsModalOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      alert('Could not copy automatically. Please select the code manually.');
    }
  };

  const handleCopyTsvForSheets = async () => {
    const list = products && products.length > 0 ? products : INITIAL_PRODUCTS;
    const headers = ['SKU', 'Name', 'Category', 'UnitPrice', 'CostPrice', 'Stock', 'ReorderLevel', 'Unit', 'UpdatedAt'].join('\t');
    const rows = list.map(p => [
      p.sku,
      p.name,
      p.category,
      p.unitPrice,
      p.costPrice,
      p.stock,
      p.reorderLevel,
      p.unit || 'pc',
      new Date().toISOString()
    ].join('\t'));
    const tsvContent = [headers, ...rows].join('\n');
    try {
      await navigator.clipboard.writeText(tsvContent);
      setIsTsvCopied(true);
      setTimeout(() => setIsTsvCopied(false), 3000);
    } catch {
      alert('Could not copy automatically.');
    }
  };

  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      setTestResult({
        success: false,
        message: 'Please paste your Google Apps Script Web App URL first.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await ApiService.testConnection(urlInput.trim());
    setTestResult(res);
    setIsTesting(false);

    if (res.success) {
      // Auto save the working URL
      updateSettings({ appsScriptUrl: urlInput.trim() });
      // Only sync if Google Sheets actually has products (> 0)
      if (res.data?.products && Array.isArray(res.data.products) && res.data.products.length > 0) {
        syncWithBackend(urlInput.trim());
      }
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      appsScriptUrl: urlInput.trim(),
      storeName: storeName.trim(),
      cashierName: cashierName.trim(),
      receiptFooterNote: receiptNote.trim(),
    });
    setIsSettingsModalOpen(false);
  };

  const activeProductsCount = products.length > 0 ? products.length : 38;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Sticky Fixed Header - Always visible on mobile, tablet, and desktop */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Sheet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                Google Sheets & Store Settings
              </h2>
              <p className="text-[11px] text-slate-500 truncate hidden xs:block sm:block">
                Connect Google Sheets database or customize tindahan branding
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
            title="Isara"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sticky Sub-tab Navigation */}
        <div className="shrink-0 px-4 sm:px-6 pt-3 pb-2 bg-slate-50/60 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('sheets')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 truncate ${
                activeSubTab === 'sheets'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Sheets Connection</span>
            </button>
            <button
              onClick={() => setActiveSubTab('store')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 truncate ${
                activeSubTab === 'store'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Store Info & Resibo</span>
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
          {activeSubTab === 'sheets' ? (
            <div className="space-y-4">
              
              {/* URL Input & Test Row */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Google Apps Script Web App URL:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Testing...' : 'Test & Connect'}</span>
                  </button>
                </div>

                {testResult && (
                  <div className="space-y-2">
                    <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                      testResult.success
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                        : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                    }`}>
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                      )}
                      <span className="leading-relaxed">{testResult.message}</span>
                    </div>

                    {/* If products count is 0, show recovery alert */}
                    {products.length === 0 && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-2">
                        <div className="text-xs text-rose-800 dark:text-rose-300 font-medium">
                          Your app currently has 0 products loaded.
                        </div>
                        <button
                          type="button"
                          onClick={resetToSampleData}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold whitespace-nowrap transition-colors"
                        >
                          Restore 38 Default Products
                        </button>
                      </div>
                    )}

                    {(testResult.success || (urlInput && urlInput.trim())) && (
                      <div className="space-y-2 pt-1">
                        <button
                          type="button"
                          disabled={isSyncing}
                          onClick={() => uploadLocalCatalogToSheets()}
                          className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                          <Database className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
                          <span>
                            {isSyncing 
                              ? 'Uploading products to Google Sheets...' 
                              : `Upload All Local Products (${activeProductsCount} Items) via API`}
                          </span>
                        </button>

                        <div className="relative flex items-center justify-center text-[10px] uppercase font-bold text-slate-400 my-1">
                          <span className="bg-white dark:bg-slate-900 px-2 z-10">or 1-second instant paste</span>
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
                        </div>

                        <button
                          type="button"
                          onClick={handleCopyTsvForSheets}
                          className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2"
                        >
                          {isTsvCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                          <span>
                            {isTsvCopied 
                              ? 'Copied to Clipboard! Now press Ctrl+V in Google Sheets cell A1' 
                              : `Copy All ${activeProductsCount} Products for Direct Paste into Google Sheets (Ctrl+V)`}
                          </span>
                        </button>
                        <p className="text-[10px] text-slate-400 text-center">
                          Tip: Click the button above, go to your Google Sheet, select cell A1, and press <strong>Ctrl+V</strong>!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick deployment guide card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    <span>How to deploy your Google Sheets backend</span>
                  </h3>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Code Copied!' : 'Copy Script Code'}</span>
                  </button>
                </div>

                <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Create a new spreadsheet at <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-semibold inline-flex items-center gap-0.5">sheets.new <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Inside Sheets, click <strong>Extensions</strong> → <strong>Apps Script</strong>.</li>
                  <li>Delete everything and paste the copied script code (button above).</li>
                  <li>Click <strong>Deploy</strong> → <strong>New deployment</strong> → Select <strong>Web app</strong>.</li>
                  <li>Set <strong>Execute as:</strong> "Me" and <strong>Who has access:</strong> <span className="font-bold text-emerald-700 dark:text-emerald-400">"Anyone"</span> (Crucial! If left as "Only myself", you will get "Failed to fetch").</li>
                  <li>Click <strong>Deploy</strong>, authorize permissions, and copy the Web App URL (ends in <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono text-[11px]">/exec</code>) into the box above!</li>
                </ol>

                <div className="mt-3 space-y-2">
                  {/* Collapsible FAQ: Do I need to add products first? */}
                  <div className="bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-900 overflow-hidden transition-all">
                    <button
                      type="button"
                      onClick={() => setIsFaqOpen(!isFaqOpen)}
                      className="w-full p-3 flex items-center justify-between text-left text-xs font-bold text-blue-900 dark:text-blue-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 pr-2">
                        <Database className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Do I need to add products first?</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-blue-600 shrink-0 transition-transform duration-200 ${
                          isFaqOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isFaqOpen && (
                      <div className="px-3 pb-3 pt-1 text-[11px] leading-relaxed text-blue-900/90 dark:text-blue-200/90 border-t border-blue-200/60 dark:border-blue-900/60">
                        <p>
                          <strong>No!</strong> Your Google Sheet can be completely blank. The script automatically creates the "Products" and "Transactions" tabs and headers for you. Once connected, you can click <em>"Upload All Local Products"</em> to populate all {activeProductsCount} sari-sari items directly into your sheet!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Collapsible Warning Helper */}
                  <div className="bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-200 dark:border-amber-900 overflow-hidden transition-all">
                    <button
                      type="button"
                      onClick={() => setIsWarningOpen(!isWarningOpen)}
                      className="w-full p-3 flex items-center justify-between text-left text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 pr-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Seeing "Google hasn't verified" or "Failed to fetch"?</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-amber-600 shrink-0 transition-transform duration-200 ${
                          isWarningOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isWarningOpen && (
                      <div className="px-3 pb-3 pt-1 text-[11px] text-amber-900 dark:text-amber-200 border-t border-amber-200/60 dark:border-amber-900/60">
                        <div className="pl-2 border-l-2 border-amber-400 dark:border-amber-600 space-y-1.5">
                          <div>
                            • <strong>"Google hasn't verified this app":</strong> Click <span className="font-bold underline">Advanced</span> at the bottom-left → Click <span className="font-bold underline">Go to Untitled project (unsafe)</span> → Click <span className="font-bold">Allow</span>.
                          </div>
                          <div>
                            • <strong>"Failed to fetch":</strong> Make sure <strong>"Who has access"</strong> is set to <strong>"Anyone"</strong>. In Apps Script, click <em>Deploy &gt; Manage deployments &gt; Edit (Pencil) &gt; Who has access: Anyone &gt; Deploy</em>.
                          </div>
                          <div>
                            • <strong>URL check:</strong> Ensure the link ends in <code className="font-mono font-bold">/exec</code> (not <code className="font-mono">/dev</code> or the spreadsheet link).
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Local Offline Reset fallback */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
                <span>Offline Local Mode active when URL is empty.</span>
                <button
                  type="button"
                  onClick={resetToSampleData}
                  className="text-xs text-slate-600 hover:text-rose-600 flex items-center gap-1 font-semibold hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Sample Sari-Sari Catalog</span>
                </button>
              </div>

            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Store Name */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Store Name (Pangalan ng Tindahan):
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  placeholder="e.g. Nanay's Sari-Sari Store"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Cashier Name */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Cashier / Tindera Name:
                </label>
                <input
                  type="text"
                  value={cashierName}
                  onChange={e => setCashierName(e.target.value)}
                  placeholder="e.g. Ate Tindera"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Receipt Footer Note */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Receipt Footer Greeting / Note:
                </label>
                <input
                  type="text"
                  value={receiptNote}
                  onChange={e => setReceiptNote(e.target.value)}
                  placeholder="e.g. Maraming salamat sa suki! Balik po kayo muli."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Save Settings
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
