/**
 * Currency & Formatting Utilities for Philippine Sari-Sari Store
 */

export function formatPeso(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₱0.00';
  }
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0';
  }
  return new Intl.NumberFormat('en-PH').format(amount);
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-PH', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return '';
  }
}

export function calculateMargin(price: number, cost: number): number {
  if (!price || price <= 0) return 0;
  const profit = price - cost;
  return Math.round((profit / price) * 100);
}

export function generateSku(categoryPrefix: string = 'ITEM', existingSkus: string[] = []): string {
  const prefixMap: Record<string, string> = {
    'Instant Noodles & Canned': 'CAN',
    'Beverages & Coffee': 'BEV',
    'Snacks & Biscuits': 'SNK',
    'Sachet & Personal Care': 'PER',
    'Condiments & Cooking': 'CND',
    'Household & Cigarettes': 'HOU',
    'School & General': 'SCH',
  };

  const code = prefixMap[categoryPrefix] || 'SKU';
  let counter = 1;
  let testSku = `${code}-${String(counter).padStart(3, '0')}`;
  
  while (existingSkus.includes(testSku)) {
    counter++;
    testSku = `${code}-${String(counter).padStart(3, '0')}`;
  }
  
  return testSku;
}

export function generateTransactionId(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TRX-${ymd}-${randomPart}`;
}
