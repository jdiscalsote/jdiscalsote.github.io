import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product, Transaction, CartItem, StoreSettings, ActiveTab } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { ApiService } from '../services/api';
import { generateTransactionId } from '../utils/formatters';

interface NotificationState {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface StoreContextType {
  products: Product[];
  transactions: Transaction[];
  cart: CartItem[];
  settings: StoreSettings;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isLoading: boolean;
  isSyncing: boolean;
  syncStatus: {
    state: 'synced' | 'local' | 'error' | 'syncing';
    message: string;
    lastSynced?: Date;
  };
  notification: NotificationState | null;
  showNotification: (type: NotificationState['type'], message: string) => void;
  clearNotification: () => void;
  
  // Cart Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (sku: string) => void;
  updateCartQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;

  // Checkout / Sales
  checkoutSale: (paymentDetails: {
    cashTendered: number;
    paymentMethod: 'CASH' | 'GCASH' | 'UTANG';
    customerName?: string;
    note?: string;
  }) => Promise<{ success: boolean; transaction?: Transaction; message?: string }>;

  // Inventory Management
  addProduct: (product: Omit<Product, 'updatedAt'>) => Promise<{ success: boolean; message: string }>;
  updateProduct: (sku: string, updates: Partial<Product>) => Promise<{ success: boolean; message: string }>;
  deleteProduct: (sku: string) => Promise<{ success: boolean; message: string }>;
  restockProduct: (sku: string, addedQty: number, customCostPrice?: number) => Promise<{ success: boolean; message: string }>;
  adjustStock: (sku: string, delta: number) => Promise<{ success: boolean; message: string }>;

  // Sync & Settings
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  syncWithBackend: (urlOverride?: string) => Promise<{ success: boolean; message: string }>;
  uploadLocalCatalogToSheets: () => Promise<{ success: boolean; message: string }>;
  resetToSampleData: () => void;

  // Receipt Modal State for easy display after checkout or viewing past transaction
  receiptTransaction: Transaction | null;
  setReceiptTransaction: (tx: Transaction | null) => void;

  // Modal Control
  isAddProductOpen: boolean;
  setIsAddProductOpen: (open: boolean) => void;
  isRestockModalOpen: boolean;
  setIsRestockModalOpen: (open: boolean) => void;
  restockTargetProduct: Product | null;
  setRestockTargetProduct: (prod: Product | null) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Nanay's Sari-Sari Store",
  appsScriptUrl: (import.meta as any).env?.VITE_APPS_SCRIPT_URL || '',
  cashierName: 'Ate Tindera',
  receiptFooterNote: 'Maraming salamat sa suki! Balik po kayo muli.',
  currencySymbol: '₱',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{
    state: 'synced' | 'local' | 'error' | 'syncing';
    message: string;
    lastSynced?: Date;
  }>({
    state: 'local',
    message: 'Local Offline Mode',
  });
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Modals state
  const [receiptTransaction, setReceiptTransaction] = useState<Transaction | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockTargetProduct, setRestockTargetProduct] = useState<Product | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const showNotification = useCallback((type: NotificationState['type'], message: string) => {
    setNotification({ type, message });
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  // Initial load from LocalStorage or Backend
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);

      // 1. Load settings
      const savedSettings = ApiService.getLocalSettings();
      const currentSettings = savedSettings ? { ...DEFAULT_SETTINGS, ...savedSettings } : DEFAULT_SETTINGS;
      setSettings(currentSettings);

      // 2. Load Local Data first for instant UI response
      let localProds = ApiService.getLocalProducts();
      let localTxs = ApiService.getLocalTransactions();

      if (!localProds || localProds.length === 0) {
        localProds = INITIAL_PRODUCTS;
        ApiService.saveLocalProducts(localProds);
      }
      if (!localTxs) {
        localTxs = [];
        ApiService.saveLocalTransactions(localTxs);
      }

      setProducts(localProds);
      setTransactions(localTxs);

      // 3. If Apps Script URL is provided, attempt background sync
      if (currentSettings.appsScriptUrl && currentSettings.appsScriptUrl.trim()) {
        try {
          setIsSyncing(true);
          const backendData = await ApiService.fetchFromBackend(currentSettings.appsScriptUrl);
          if (backendData && backendData.products && backendData.products.length > 0) {
            setProducts(backendData.products);
            ApiService.saveLocalProducts(backendData.products);
            if (backendData.transactions) {
              setTransactions(backendData.transactions);
              ApiService.saveLocalTransactions(backendData.transactions);
            }
            setSyncStatus({
              state: 'synced',
              message: 'Connected to Google Sheets',
              lastSynced: new Date(),
            });
          } else {
            setSyncStatus({
              state: 'local',
              message: 'Using Local Storage (Google Sheets empty or offline)',
            });
          }
        } catch {
          setSyncStatus({
            state: 'error',
            message: 'Could not connect to Google Sheets URL',
          });
        } finally {
          setIsSyncing(false);
        }
      } else {
        setSyncStatus({
          state: 'local',
          message: 'Local Offline Mode (Google Sheets URL not configured)',
        });
      }

      setIsLoading(false);
    };

    initializeData();
  }, []);

  // Synchronize with Google Sheets
  const syncWithBackend = useCallback(async (urlOverride?: string): Promise<{ success: boolean; message: string }> => {
    const targetUrl = urlOverride !== undefined ? urlOverride : settings.appsScriptUrl;
    if (!targetUrl || !targetUrl.trim()) {
      setSyncStatus({
        state: 'local',
        message: 'No Google Sheets URL configured',
      });
      return { success: false, message: 'Please enter a Google Apps Script Web App URL first.' };
    }

    setIsSyncing(true);
    setSyncStatus(prev => ({ ...prev, state: 'syncing', message: 'Syncing with Google Sheets...' }));

    try {
      const data = await ApiService.fetchFromBackend(targetUrl);
      if (data) {
        if (Array.isArray(data.products) && data.products.length > 0) {
          // Google Sheets has products -> update local inventory
          setProducts(data.products);
          ApiService.saveLocalProducts(data.products);
          if (data.transactions && data.transactions.length > 0) {
            setTransactions(data.transactions);
            ApiService.saveLocalTransactions(data.transactions);
          }
          setSyncStatus({
            state: 'synced',
            message: `Synced with Google Sheets (${data.products.length} products)`,
            lastSynced: new Date(),
          });
          showNotification('success', `Synced ${data.products.length} products from Google Sheets!`);
        } else {
          // Google Sheets is currently empty (0 products)
          // CRITICAL: NEVER wipe out existing local products with an empty sheet!
          if (products.length === 0) {
            setProducts(INITIAL_PRODUCTS);
            ApiService.saveLocalProducts(INITIAL_PRODUCTS);
          }
          setSyncStatus({
            state: 'synced',
            message: 'Connected to Google Sheets (Spreadsheet is currently empty)',
            lastSynced: new Date(),
          });
          showNotification('info', 'Connected! Your Google Sheet is empty. Click "Upload All Products" below to send your 38 items.');
        }
        return { success: true, message: 'Google Sheets sync successful!' };
      } else {
        throw new Error('No data returned from Google Sheets.');
      }
    } catch (err: any) {
      setSyncStatus({
        state: 'error',
        message: 'Sync failed: Check Apps Script deployment',
      });
      showNotification('error', `Sync failed: ${err.message || 'Check Apps Script deployment'}`);
      return { success: false, message: err.message || 'Failed to sync with Google Sheets' };
    } finally {
      setIsSyncing(false);
    }
  }, [settings.appsScriptUrl, showNotification]);

  // Update Settings
  const updateSettings = useCallback((newSettings: Partial<StoreSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      ApiService.saveLocalSettings(updated);
      return updated;
    });
    showNotification('success', 'Store settings updated successfully!');
  }, [showNotification]);

  // Reset to initial sample data
  const resetToSampleData = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
    setTransactions([]);
    setCart([]);
    ApiService.saveLocalProducts(INITIAL_PRODUCTS);
    ApiService.saveLocalTransactions([]);
    showNotification('info', 'Reset to default sample sari-sari store inventory.');
  }, [showNotification]);

  // Upload all local products into connected Google Sheet
  const uploadLocalCatalogToSheets = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!settings.appsScriptUrl || !settings.appsScriptUrl.trim()) {
      showNotification('error', 'Please enter your Google Apps Script Web App URL first.');
      return { success: false, message: 'Google Apps Script URL is required.' };
    }

    const targetProducts = (products && products.length > 0) ? products : INITIAL_PRODUCTS;
    if (!products || products.length === 0) {
      setProducts(INITIAL_PRODUCTS);
      ApiService.saveLocalProducts(INITIAL_PRODUCTS);
    }

    setIsSyncing(true);
    showNotification('info', `Uploading ${targetProducts.length} products to Google Sheets...`);

    try {
      const res = await ApiService.uploadAllProductsToGoogleSheets(
        settings.appsScriptUrl,
        targetProducts,
        (current, total) => {
          showNotification('info', `Uploading products: ${current}/${total}...`);
        }
      );

      if (res.status === 'success') {
        showNotification('success', res.message || `Uploaded ${targetProducts.length} products to Google Sheets!`);
        // Refresh local data to verify sync
        await syncWithBackend(settings.appsScriptUrl);
        return { success: true, message: res.message || 'Products uploaded successfully!' };
      } else {
        throw new Error(res.message || 'Failed to upload products to Google Sheets.');
      }
    } catch (err: any) {
      showNotification('error', `Upload failed: ${err.message}`);
      return { success: false, message: err.message };
    } finally {
      setIsSyncing(false);
    }
  }, [settings.appsScriptUrl, products, showNotification, syncWithBackend]);

  // Cart operations
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    if (product.stock <= 0) {
      showNotification('warning', `${product.name} is out of stock!`);
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.sku === product.sku);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          showNotification('warning', `Only ${product.stock} items available in stock.`);
          return prevCart.map(item =>
            item.product.sku === product.sku ? { ...item, quantity: product.stock } : item
          );
        }
        return prevCart.map(item =>
          item.product.sku === product.sku ? { ...item, quantity: newQty } : item
        );
      } else {
        const addedQty = Math.min(quantity, product.stock);
        return [...prevCart, { product, quantity: addedQty }];
      }
    });
  }, [showNotification]);

  const removeFromCart = useCallback((sku: string) => {
    setCart(prev => prev.filter(item => item.product.sku !== sku));
  }, []);

  const updateCartQuantity = useCallback((sku: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(sku);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item => {
        if (item.product.sku === sku) {
          const maxAllowed = item.product.stock;
          const finalQty = Math.min(quantity, maxAllowed);
          return { ...item, quantity: finalQty };
        }
        return item;
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.unitPrice * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Checkout / Record Sale
  const checkoutSale = useCallback(async (paymentDetails: {
    cashTendered: number;
    paymentMethod: 'CASH' | 'GCASH' | 'UTANG';
    customerName?: string;
    note?: string;
  }): Promise<{ success: boolean; transaction?: Transaction; message?: string }> => {
    if (cart.length === 0) {
      return { success: false, message: 'Cart is empty!' };
    }

    const total = cartTotal;
    const tendered = paymentDetails.cashTendered;

    if (paymentDetails.paymentMethod === 'CASH' && tendered < total) {
      return { success: false, message: 'Cash tendered is less than the total amount.' };
    }

    const change = paymentDetails.paymentMethod === 'CASH' ? Math.max(0, tendered - total) : 0;
    const transactionId = generateTransactionId();
    const now = new Date().toISOString();

    const itemsSummary = cart.map(item => ({
      sku: item.product.sku,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.unitPrice,
      cost: item.product.costPrice,
      subtotal: item.product.unitPrice * item.quantity,
    }));

    const totalCost = cart.reduce((sum, item) => sum + item.product.costPrice * item.quantity, 0);

    const newTransaction: Transaction = {
      id: transactionId,
      timestamp: now,
      type: 'SALE',
      items: itemsSummary,
      totalAmount: total,
      totalCost,
      cashTendered: tendered,
      changeAmount: change,
      paymentMethod: paymentDetails.paymentMethod,
      customerName: paymentDetails.customerName || (paymentDetails.paymentMethod === 'UTANG' ? 'Suki (Utang)' : 'Walk-in Suki'),
      note: paymentDetails.note,
    };

    // 1. Immediately deduct stock locally
    const updatedProducts = products.map(p => {
      const soldItem = cart.find(c => c.product.sku === p.sku);
      if (soldItem) {
        return {
          ...p,
          stock: Math.max(0, p.stock - soldItem.quantity),
          updatedAt: now,
        };
      }
      return p;
    });

    setProducts(updatedProducts);
    ApiService.saveLocalProducts(updatedProducts);

    // 2. Append transaction locally
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    ApiService.saveLocalTransactions(updatedTransactions);

    // 3. Clear cart & open receipt modal
    clearCart();
    setReceiptTransaction(newTransaction);
    showNotification('success', `Sale completed! Transaction #${transactionId}`);

    // 4. Background POST to Google Apps Script if URL configured
    if (settings.appsScriptUrl && settings.appsScriptUrl.trim()) {
      ApiService.recordSale(settings.appsScriptUrl, {
        transactionId,
        items: itemsSummary,
        totalAmount: total,
        cashTendered: tendered,
        changeAmount: change,
        paymentMethod: paymentDetails.paymentMethod,
        customerName: newTransaction.customerName || '',
      }).then(res => {
        if (res.status === 'success') {
          setSyncStatus(prev => ({
            ...prev,
            state: 'synced',
            message: 'Sale synced to Google Sheets',
            lastSynced: new Date(),
          }));
        }
      }).catch(err => {
        console.warn('Failed to sync sale to Google Sheets:', err);
      });
    }

    return { success: true, transaction: newTransaction };
  }, [cart, cartTotal, products, transactions, clearCart, showNotification, settings.appsScriptUrl]);

  // Add Product
  const addProduct = useCallback(async (productData: Omit<Product, 'updatedAt'>): Promise<{ success: boolean; message: string }> => {
    // Check if SKU already exists
    if (products.some(p => p.sku.toLowerCase() === productData.sku.toLowerCase())) {
      showNotification('error', `SKU ${productData.sku} already exists! Use a unique SKU.`);
      return { success: false, message: 'SKU already exists.' };
    }

    const newProd: Product = {
      ...productData,
      updatedAt: new Date().toISOString(),
    };

    const updated = [newProd, ...products];
    setProducts(updated);
    ApiService.saveLocalProducts(updated);
    showNotification('success', `Added "${newProd.name}" to inventory!`);

    // POST to Google Apps Script if configured
    if (settings.appsScriptUrl) {
      ApiService.addProduct(settings.appsScriptUrl, newProd).catch(err => console.warn(err));
    }

    return { success: true, message: 'Product added successfully.' };
  }, [products, showNotification, settings.appsScriptUrl]);

  // Update Product details
  const updateProduct = useCallback(async (sku: string, updates: Partial<Product>): Promise<{ success: boolean; message: string }> => {
    const now = new Date().toISOString();
    const updated = products.map(p => {
      if (p.sku === sku) {
        return { ...p, ...updates, updatedAt: now };
      }
      return p;
    });

    setProducts(updated);
    ApiService.saveLocalProducts(updated);
    showNotification('success', 'Product details updated.');

    // If stock changed, notify Apps Script
    if (updates.stock !== undefined && settings.appsScriptUrl) {
      ApiService.updateStock(settings.appsScriptUrl, sku, updates.stock).catch(err => console.warn(err));
    }

    return { success: true, message: 'Product updated.' };
  }, [products, showNotification, settings.appsScriptUrl]);

  // Delete Product
  const deleteProduct = useCallback(async (sku: string): Promise<{ success: boolean; message: string }> => {
    const target = products.find(p => p.sku === sku);
    const updated = products.filter(p => p.sku !== sku);
    setProducts(updated);
    ApiService.saveLocalProducts(updated);
    showNotification('info', `Removed ${target?.name || sku} from inventory.`);
    return { success: true, message: 'Product removed.' };
  }, [products, showNotification]);

  // Restock Product
  const restockProduct = useCallback(async (
    sku: string,
    addedQty: number,
    customCostPrice?: number
  ): Promise<{ success: boolean; message: string }> => {
    const target = products.find(p => p.sku === sku);
    if (!target) return { success: false, message: 'Product not found.' };

    const effectiveCost = customCostPrice !== undefined && customCostPrice > 0 ? customCostPrice : target.costPrice;
    const newStock = target.stock + addedQty;
    const now = new Date().toISOString();
    const totalRestockCost = effectiveCost * addedQty;

    // Update Product stock & cost
    const updatedProducts = products.map(p => {
      if (p.sku === sku) {
        return {
          ...p,
          stock: newStock,
          costPrice: effectiveCost,
          updatedAt: now,
        };
      }
      return p;
    });

    setProducts(updatedProducts);
    ApiService.saveLocalProducts(updatedProducts);

    // Create restock transaction
    const restockTx: Transaction = {
      id: `RST-${generateTransactionId().replace('TRX-', '')}`,
      timestamp: now,
      type: 'RESTOCK',
      items: [
        {
          sku: target.sku,
          name: target.name,
          quantity: addedQty,
          price: effectiveCost,
          cost: effectiveCost,
          subtotal: totalRestockCost,
        },
      ],
      totalAmount: totalRestockCost,
      paymentMethod: 'CASH',
      customerName: 'Supplier Delivery',
      note: `Added +${addedQty} ${target.unit || 'units'} to inventory`,
    };

    const updatedTransactions = [restockTx, ...transactions];
    setTransactions(updatedTransactions);
    ApiService.saveLocalTransactions(updatedTransactions);

    showNotification('success', `Restocked +${addedQty} ${target.unit || 'units'} of ${target.name}!`);

    // POST to backend
    if (settings.appsScriptUrl) {
      ApiService.updateStock(settings.appsScriptUrl, sku, newStock, {
        name: target.name,
        addedQuantity: addedQty,
        costPrice: effectiveCost,
        restockCost: totalRestockCost,
      }).catch(err => console.warn(err));
    }

    return { success: true, message: 'Restocked successfully.' };
  }, [products, transactions, showNotification, settings.appsScriptUrl]);

  // Quick adjust stock by +1 or -1
  const adjustStock = useCallback(async (sku: string, delta: number): Promise<{ success: boolean; message: string }> => {
    const target = products.find(p => p.sku === sku);
    if (!target) return { success: false, message: 'Product not found' };

    const newStock = Math.max(0, target.stock + delta);
    return updateProduct(sku, { stock: newStock });
  }, [products, updateProduct]);

  return (
    <StoreContext.Provider
      value={{
        products,
        transactions,
        cart,
        settings,
        activeTab,
        setActiveTab,
        isLoading,
        isSyncing,
        syncStatus,
        notification,
        showNotification,
        clearNotification,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        checkoutSale,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        adjustStock,
        updateSettings,
        syncWithBackend,
        uploadLocalCatalogToSheets,
        resetToSampleData,
        receiptTransaction,
        setReceiptTransaction,
        isAddProductOpen,
        setIsAddProductOpen,
        isRestockModalOpen,
        setIsRestockModalOpen,
        restockTargetProduct,
        setRestockTargetProduct,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): StoreContextType {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
