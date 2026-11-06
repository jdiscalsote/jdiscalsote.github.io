import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // Instant Noodles & Canned
  {
    sku: "CAN-001",
    name: "Lucky Me! Instant Pancit Canton Kalamansi 80g",
    category: "Instant Noodles & Canned",
    unitPrice: 17.00,
    costPrice: 13.50,
    stock: 24,
    reorderLevel: 8,
    unit: "pack",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "CAN-002",
    name: "Lucky Me! Instant Pancit Canton Chilimansi 80g",
    category: "Instant Noodles & Canned",
    unitPrice: 17.00,
    costPrice: 13.50,
    stock: 18,
    reorderLevel: 8,
    unit: "pack",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "CAN-003",
    name: "Lucky Me! Instant Pancit Canton Original 80g",
    category: "Instant Noodles & Canned",
    unitPrice: 17.00,
    costPrice: 13.50,
    stock: 12,
    reorderLevel: 6,
    unit: "pack",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "CAN-004",
    name: "Lucky Me! Beef Mami Soup 55g",
    category: "Instant Noodles & Canned",
    unitPrice: 15.00,
    costPrice: 12.00,
    stock: 15,
    reorderLevel: 5,
    unit: "pack",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "CAN-005",
    name: "555 Sardines in Tomato Sauce 155g",
    category: "Instant Noodles & Canned",
    unitPrice: 26.00,
    costPrice: 21.00,
    stock: 4, // Low stock alert
    reorderLevel: 6,
    unit: "can",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "CAN-006",
    name: "Argentina Corned Beef 150g",
    category: "Instant Noodles & Canned",
    unitPrice: 38.00,
    costPrice: 31.00,
    stock: 3, // Low stock alert
    reorderLevel: 5,
    unit: "can",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "CAN-007",
    name: "Mega Sardines Green (with Chili) 155g",
    category: "Instant Noodles & Canned",
    unitPrice: 28.00,
    costPrice: 22.50,
    stock: 14,
    reorderLevel: 5,
    unit: "can",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "CAN-008",
    name: "San Marino Corned Tuna 150g",
    category: "Instant Noodles & Canned",
    unitPrice: 39.00,
    costPrice: 32.00,
    stock: 7,
    reorderLevel: 4,
    unit: "can",
    updatedAt: new Date().toISOString()
  },

  // Beverages & Coffee
  {
    sku: "BEV-001",
    name: "Kopiko Blanca 3-in-1 Coffee Sachet 30g",
    category: "Beverages & Coffee",
    unitPrice: 14.00,
    costPrice: 10.50,
    stock: 35,
    reorderLevel: 10,
    unit: "sachet",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "BEV-002",
    name: "Great Taste White Twin Pack Sachet 50g",
    category: "Beverages & Coffee",
    unitPrice: 20.00,
    costPrice: 15.50,
    stock: 25,
    reorderLevel: 8,
    unit: "sachet",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "BEV-003",
    name: "Nescafe Classic Stick Sachet 2g",
    category: "Beverages & Coffee",
    unitPrice: 6.00,
    costPrice: 4.20,
    stock: 45,
    reorderLevel: 12,
    unit: "sachet",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "BEV-004",
    name: "Bear Brand Fortified Powdered Milk 33g",
    category: "Beverages & Coffee",
    unitPrice: 16.00,
    costPrice: 12.50,
    stock: 22,
    reorderLevel: 6,
    unit: "sachet",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "BEV-005",
    name: "Coca-Cola Mismo 290ml PET Bottle",
    category: "Beverages & Coffee",
    unitPrice: 20.00,
    costPrice: 15.00,
    stock: 16,
    reorderLevel: 6,
    unit: "bottle",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "BEV-006",
    name: "Royal Tru-Orange Mismo 290ml PET Bottle",
    category: "Beverages & Coffee",
    unitPrice: 20.00,
    costPrice: 15.00,
    stock: 2, // Low stock alert
    reorderLevel: 6,
    unit: "bottle",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "BEV-007",
    name: "Nature's Spring Mineral Water 500ml",
    category: "Beverages & Coffee",
    unitPrice: 15.00,
    costPrice: 10.00,
    stock: 20,
    reorderLevel: 6,
    unit: "bottle",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "BEV-008",
    name: "San Miguel Pale Pilsen 330ml Can",
    category: "Beverages & Coffee",
    unitPrice: 65.00,
    costPrice: 52.00,
    stock: 12,
    reorderLevel: 4,
    unit: "can",
    updatedAt: new Date().toISOString()
  },

  // Snacks & Biscuits
  {
    sku: "SNK-001",
    name: "Piattos Cheese Flavored Potato Crisps 40g",
    category: "Snacks & Biscuits",
    unitPrice: 20.00,
    costPrice: 15.50,
    stock: 15,
    reorderLevel: 5,
    unit: "pack",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "SNK-002",
    name: "Chippy Barbecue Corn Chips 27g",
    category: "Snacks & Biscuits",
    unitPrice: 12.00,
    costPrice: 9.00,
    stock: 18,
    reorderLevel: 6,
    unit: "pack",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "SNK-003",
    name: "Oishi Prawn Crackers 24g",
    category: "Snacks & Biscuits",
    unitPrice: 10.00,
    costPrice: 7.50,
    stock: 14,
    reorderLevel: 5,
    unit: "pack",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "SNK-004",
    name: "Choc-Nut Peanut Milk Chocolate (5 pcs pack)",
    category: "Snacks & Biscuits",
    unitPrice: 15.00,
    costPrice: 11.00,
    stock: 24,
    reorderLevel: 6,
    unit: "pack",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "SNK-005",
    name: "Rebisco Crackers Original 32g",
    category: "Snacks & Biscuits",
    unitPrice: 9.00,
    costPrice: 6.80,
    stock: 28,
    reorderLevel: 8,
    unit: "pack",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "SNK-006",
    name: "Fudgee Barr Chocolate 42g",
    category: "Snacks & Biscuits",
    unitPrice: 12.00,
    costPrice: 9.20,
    stock: 16,
    reorderLevel: 5,
    unit: "pc",
    updatedAt: new Date().toISOString()
  },

  // Sachet & Personal Care
  {
    sku: "PER-001",
    name: "Safeguard Pure White Bar Soap 60g",
    category: "Sachet & Personal Care",
    unitPrice: 25.00,
    costPrice: 19.50,
    stock: 10,
    reorderLevel: 4,
    unit: "bar",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "PER-002",
    name: "Sunsilk Smooth & Manageable Shampoo Sachet 13ml",
    category: "Sachet & Personal Care",
    unitPrice: 8.00,
    costPrice: 5.80,
    stock: 35,
    reorderLevel: 10,
    unit: "sachet",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "PER-003",
    name: "Creamsilk Standout Straight Conditioner Sachet",
    category: "Sachet & Personal Care",
    unitPrice: 8.50,
    costPrice: 6.20,
    stock: 25,
    reorderLevel: 8,
    unit: "sachet",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "PER-004",
    name: "Colgate Maximum Cavity Protection Toothpaste 20g",
    category: "Sachet & Personal Care",
    unitPrice: 12.00,
    costPrice: 9.00,
    stock: 15,
    reorderLevel: 5,
    unit: "sachet",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "PER-005",
    name: "Tide Plus Downy Laundry Detergent Powder 40g",
    category: "Sachet & Personal Care",
    unitPrice: 14.00,
    costPrice: 10.50,
    stock: 32,
    reorderLevel: 8,
    unit: "sachet",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "PER-006",
    name: "Downy Sunrise Fresh Fabric Conditioner 20ml",
    category: "Sachet & Personal Care",
    unitPrice: 10.00,
    costPrice: 7.50,
    stock: 30,
    reorderLevel: 8,
    unit: "sachet",
    updatedAt: new Date().toISOString()
  },

  // Condiments & Cooking
  {
    sku: "CND-001",
    name: "Datu Puti White Vinegar 200ml Pouch",
    category: "Condiments & Cooking",
    unitPrice: 12.00,
    costPrice: 9.00,
    stock: 15,
    reorderLevel: 4,
    unit: "pouch",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "CND-002",
    name: "Silver Swan Soy Sauce 200ml Pouch",
    category: "Condiments & Cooking",
    unitPrice: 14.00,
    costPrice: 10.50,
    stock: 14,
    reorderLevel: 4,
    unit: "pouch",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "CND-003",
    name: "Maggi Magic Sarap All-in-One Seasoning 8g",
    category: "Condiments & Cooking",
    unitPrice: 6.00,
    costPrice: 4.20,
    stock: 50,
    reorderLevel: 15,
    unit: "sachet",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "CND-004",
    name: "Mang Tomas All-Around Sarsa 325g Bottle",
    category: "Condiments & Cooking",
    unitPrice: 38.00,
    costPrice: 30.00,
    stock: 6,
    reorderLevel: 3,
    unit: "bottle",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "CND-005",
    name: "Cooking Oil Tingi 250ml Pouch",
    category: "Condiments & Cooking",
    unitPrice: 25.00,
    costPrice: 19.00,
    stock: 12,
    reorderLevel: 4,
    unit: "pouch",
    updatedAt: new Date().toISOString()
  },

  // Household & Cigarettes
  {
    sku: "HOU-001",
    name: "Marlboro Red Cigarette (per stick)",
    category: "Household & Cigarettes",
    unitPrice: 10.00,
    costPrice: 7.50,
    stock: 40,
    reorderLevel: 10,
    unit: "stick",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "HOU-002",
    name: "Cricket Disposable Lighter",
    category: "Household & Cigarettes",
    unitPrice: 25.00,
    costPrice: 18.00,
    stock: 8,
    reorderLevel: 4,
    unit: "pc",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "HOU-003",
    name: "Champion Blue Detergent Bar (1 cut)",
    category: "Household & Cigarettes",
    unitPrice: 15.00,
    costPrice: 11.00,
    stock: 12,
    reorderLevel: 4,
    unit: "bar",
    updatedAt: new Date().toISOString()
  },

  // School & General
  {
    sku: "SCH-001",
    name: "Mongol Pencil #2",
    category: "School & General",
    unitPrice: 10.00,
    costPrice: 6.50,
    stock: 15,
    reorderLevel: 5,
    unit: "pc",
    updatedAt: new Date().toISOString()
  },
  {
    sku: "SCH-002",
    name: "HBW Matrix Ballpen 0.5 Black",
    category: "School & General",
    unitPrice: 10.00,
    costPrice: 6.00,
    stock: 20,
    reorderLevel: 5,
    unit: "pc",
    updatedAt: new Date().toISOString()
  }
];
