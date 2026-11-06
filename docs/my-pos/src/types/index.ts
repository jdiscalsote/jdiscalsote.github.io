export type ProductCategory =
  | 'Instant Noodles & Canned'
  | 'Beverages & Coffee'
  | 'Snacks & Biscuits'
  | 'Sachet & Personal Care'
  | 'Condiments & Cooking'
  | 'Household & Cigarettes'
  | 'School & General';

export interface Product {
  sku: string;
  name: string;
  category: ProductCategory;
  unitPrice: number;   // Selling price in Philippine Pesos
  costPrice: number;   // Purchase cost / puhunan
  stock: number;
  reorderLevel: number; // Low stock threshold
  unit?: string;        // 'pc', 'pack', 'sachet', 'bottle', 'can', 'stick'
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type TransactionType = 'SALE' | 'RESTOCK';

export interface TransactionItem {
  sku: string;
  name: string;
  quantity: number;
  price: number;
  cost?: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  timestamp: string;
  type: TransactionType;
  items: TransactionItem[];
  totalAmount: number;
  totalCost?: number;
  cashTendered?: number;
  changeAmount?: number;
  paymentMethod?: 'CASH' | 'GCASH' | 'UTANG';
  customerName?: string;
  note?: string;
}

export interface StoreSettings {
  storeName: string;
  appsScriptUrl: string;
  cashierName: string;
  receiptFooterNote: string;
  currencySymbol: string;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  products?: Product[];
  transactions?: Transaction[];
  data?: T;
}

export type ActiveTab = 'dashboard' | 'pos' | 'inventory' | 'transactions';
