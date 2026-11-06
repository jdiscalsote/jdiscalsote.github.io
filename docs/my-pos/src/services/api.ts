import { Product, Transaction, ApiResponse } from '../types';

/**
 * API Service for interacting with Google Sheets via Google Apps Script Web App URL.
 * Also handles offline fallback and local cache seamlessly.
 */

const LOCAL_STORAGE_KEY_PRODUCTS = 'tindahan_products_v1';
const LOCAL_STORAGE_KEY_TRANSACTIONS = 'tindahan_transactions_v1';
const LOCAL_STORAGE_KEY_SETTINGS = 'tindahan_settings_v1';

export class ApiService {
  /**
   * Helper to perform POST to Google Apps Script.
   * Note: 'Content-Type': 'text/plain;charset=utf-8' prevents browser preflight CORS failure
   * when communicating with Google Apps Script Web App.
   */
  private static async sendPostRequest(url: string, payload: any): Promise<ApiResponse> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      console.warn('Google Apps Script POST failed, will update locally:', err);
      return {
        status: 'error',
        message: err.message || 'Network error communicating with Google Sheets',
      };
    }
  }

  /**
    * Test connection to Google Apps Script Web App
   */
  static async testConnection(url: string): Promise<{ success: boolean; message: string; data?: any }> {
    const trimmed = (url || '').trim();

    if (trimmed.includes('docs.google.com/spreadsheets')) {
      return {
        success: false,
        message: 'You entered the Google Sheets spreadsheet URL! Please open Extensions > Apps Script > Deploy > New deployment > Web app, and copy the Web App URL (starts with https://script.google.com/macros/s/.../exec).',
      };
    }

    if (!trimmed.startsWith('https://script.google.com/')) {
      return {
        success: false,
        message: 'Invalid URL. Must be a Google Apps Script Web App URL starting with https://script.google.com/macros/s/.../exec',
      };
    }

    if (trimmed.endsWith('/dev')) {
      return {
        success: false,
        message: 'The URL ends in /dev (developer test URL). Please use the public Web App URL ending in /exec from Deploy > Manage deployments.',
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const res = await fetch(trimmed, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          success: false,
          message: `Endpoint returned HTTP ${res.status}: ${res.statusText}`,
        };
      }

      const json = await res.json();
      if (json.status === 'success') {
        const prodCount = json.products?.length || 0;
        return {
          success: true,
          message: prodCount > 0 
            ? `Connected successfully! Found ${prodCount} products in Google Sheets.`
            : `Connected successfully! Google Sheets is linked (0 products currently in sheet).`,
          data: json,
        };
      } else {
        return {
          success: false,
          message: json.message || 'Google Sheets script returned an error status.',
        };
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return {
          success: false,
          message: 'Request timed out after 9s. Please verify your Apps Script is deployed as Web App.',
        };
      }

      const errMsg = (err.message || '').toLowerCase();
      if (errMsg.includes('failed to fetch') || errMsg.includes('networkerror') || errMsg.includes('cors')) {
        return {
          success: false,
          message: '"Failed to fetch" error: In Google Apps Script, "Who has access" was likely left as "Only myself". To fix: Click Deploy > Manage deployments > click the Edit (Pencil) icon > set "Who has access" to "Anyone" > click Deploy!',
        };
      }

      return {
        success: false,
        message: err.message || 'Failed to fetch from Google Sheets',
      };
    }
  }

  /**
   * Upload all local products to Google Sheets in bulk with automatic fallback
   */
  static async uploadAllProductsToGoogleSheets(
    url: string,
    products: Product[],
    onProgress?: (current: number, total: number) => void
  ): Promise<ApiResponse> {
    if (!url || !url.trim()) {
      return { status: 'error', message: 'No Google Apps Script URL provided' };
    }

    // Attempt 1: Fast bulk upload via INITIALIZE_CATALOG
    try {
      const bulkRes = await this.sendPostRequest(url, {
        action: 'INITIALIZE_CATALOG',
        products: products,
      });

      if (bulkRes && bulkRes.status === 'success') {
        if (onProgress) onProgress(products.length, products.length);
        return bulkRes;
      }
      console.warn('Bulk INITIALIZE_CATALOG not recognized, falling back to ADD_PRODUCT batching:', bulkRes?.message);
    } catch (err) {
      console.warn('Bulk INITIALIZE_CATALOG failed, trying ADD_PRODUCT batching:', err);
    }

    // Attempt 2: Fallback to ADD_PRODUCT for each product (compatible with ANY deployed version)
    let successCount = 0;
    const batchSize = 3;

    for (let i = 0; i < products.length; i += batchSize) {
      const chunk = products.slice(i, i + batchSize);
      await Promise.all(
        chunk.map(async (prod) => {
          try {
            const res = await this.addProduct(url, prod);
            if (res.status === 'success') {
              successCount++;
            }
          } catch (e) {
            console.warn(`Failed adding ${prod.sku}:`, e);
          }
        })
      );
      if (onProgress) {
        onProgress(Math.min(i + batchSize, products.length), products.length);
      }
    }

    if (successCount > 0) {
      return {
        status: 'success',
        message: `Successfully uploaded ${successCount} of ${products.length} products to Google Sheets!`,
      };
    }

    return {
      status: 'error',
      message: 'Failed to upload products. Make sure your Apps Script Web App is deployed with access set to "Anyone".',
    };
  }

  /**
   * Fetch products and transactions from Google Apps Script (or return null to fallback to local)
   */
  static async fetchFromBackend(url?: string): Promise<{ products: Product[]; transactions: Transaction[] } | null> {
    if (!url || !url.trim()) return null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const data = await res.json();

      if (data && data.status === 'success' && Array.isArray(data.products)) {
        return {
          products: data.products,
          transactions: Array.isArray(data.transactions) ? data.transactions : [],
        };
      }
      return null;
    } catch (err) {
      console.warn('Could not fetch from Google Apps Script endpoint:', err);
      return null;
    }
  }

  /**
   * Record a sale: deducts stock and logs transaction in Google Sheets
   */
  static async recordSale(
    url: string | undefined,
    saleData: {
      transactionId: string;
      items: Array<{ sku: string; name: string; quantity: number; price: number; subtotal: number }>;
      totalAmount: number;
      cashTendered: number;
      changeAmount: number;
      paymentMethod: 'CASH' | 'GCASH' | 'UTANG';
      customerName: string;
    }
  ): Promise<ApiResponse> {
    if (!url || !url.trim()) {
      return { status: 'success', message: 'Saved locally' };
    }

    return await this.sendPostRequest(url, {
      action: 'RECORD_SALE',
      ...saleData,
    });
  }

  /**
   * Add a new product to Google Sheets
   */
  static async addProduct(url: string | undefined, product: Product): Promise<ApiResponse> {
    if (!url || !url.trim()) {
      return { status: 'success', message: 'Saved locally' };
    }

    return await this.sendPostRequest(url, {
      action: 'ADD_PRODUCT',
      sku: product.sku,
      name: product.name,
      category: product.category,
      unitPrice: product.unitPrice,
      costPrice: product.costPrice,
      stock: product.stock,
      reorderLevel: product.reorderLevel,
      unit: product.unit || 'pc',
    });
  }

  /**
   * Update stock count in Google Sheets
   */
  static async updateStock(
    url: string | undefined,
    sku: string,
    newStock: number,
    logRestock?: { name: string; addedQuantity: number; costPrice: number; restockCost: number }
  ): Promise<ApiResponse> {
    if (!url || !url.trim()) {
      return { status: 'success', message: 'Updated locally' };
    }

    return await this.sendPostRequest(url, {
      action: 'UPDATE_STOCK',
      sku: sku,
      newStock: newStock,
      logRestock: !!logRestock,
      ...(logRestock || {}),
    });
  }

  // --- LocalStorage helpers for instant offline persistence ---

  static getLocalProducts(): Product[] | null {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PRODUCTS);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  static saveLocalProducts(products: Product[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (err) {
      console.error('Failed saving products to localStorage:', err);
    }
  }

  static getLocalTransactions(): Transaction[] | null {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_TRANSACTIONS);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  static saveLocalTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    } catch (err) {
      console.error('Failed saving transactions to localStorage:', err);
    }
  }

  static getLocalSettings(): any | null {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  static saveLocalSettings(settings: any): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.error('Failed saving settings to localStorage:', err);
    }
  }
}
