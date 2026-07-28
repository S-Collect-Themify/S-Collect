import type { Vendor } from '../types/vendors';

export const VENDOR_CATEGORIES = [
  'Handicrafts',
  'Florals',
  'Electronics',
  'Apparel',
  'Food',
  'Beauty',
  'Sports',
  'Home & Garden',
  'Fashion',
];

export const INITIAL_VENDORS: Vendor[] = [
  // ── Pending ──────────────────────────────────────
  {
    id: '1',
    businessName: 'Al-Fatah Crafts',
    owner: 'Ibrahim Ali',
    email: 'info@alfatah.sa',
    submittedDate: 'Oct 22, 2024',
    category: 'Handicrafts',
    status: 'pending',
    phone: '+966 50 123 4567',
    location: 'Riyadh, Saudi Arabia',
    taxId: '1012345678',
    description:
      'Al-Fatah Crafts specializes in traditional Saudi handicrafts, offering handwoven baskets, pottery, and artisanal woodwork crafted by local artisans.',
  },
  {
    id: '2',
    businessName: 'Desert Bloom',
    owner: 'Sarah Mansour',
    email: 'sarah@desertbloom.com',
    submittedDate: 'Oct 21, 2024',
    category: 'Florals',
    status: 'pending',
    phone: '+966 55 987 6543',
    location: 'Jeddah, Saudi Arabia',
    taxId: '2034567890',
    description:
      'Desert Bloom curates premium floral arrangements and dried flower décor inspired by the beauty of the Arabian desert landscape.',
  },
  {
    id: '3',
    businessName: 'Al-Falah Crafts',
    owner: 'Yusuf Al-Falah',
    email: 'yusuf@alfalah.sa',
    submittedDate: 'Oct 21, 2024',
    category: 'Handicrafts',
    status: 'pending',
    phone: '+966 50 555 1234',
    location: 'Mecca, Saudi Arabia',
    taxId: '3045678901',
    description:
      'Al-Falah Crafts is a family business offering curated handicraft products including embroidered textiles and ceramic art, focusing on quality and sustainability.',
  },
  {
    id: '4',
    businessName: 'Oasis Tech',
    owner: 'Khalid Fahad',
    email: 'khalid@oasistech.sa',
    submittedDate: 'Oct 20, 2024',
    category: 'Electronics',
    status: 'pending',
    phone: '+966 56 234 5678',
    location: 'Dammam, Saudi Arabia',
    taxId: '4056789012',
    description:
      'Oasis Tech brings cutting-edge consumer electronics and smart home solutions to the Saudi market, focusing on affordable premium tech.',
  },
  {
    id: '5',
    businessName: 'Red Sea Styles',
    owner: 'Layla Hassan',
    email: 'layla@redsea.com',
    submittedDate: 'Oct 19, 2024',
    category: 'Apparel',
    status: 'pending',
    phone: '+966 54 345 6789',
    location: 'Jeddah, Saudi Arabia',
    taxId: '5067890123',
    description:
      'Red Sea Styles offers contemporary modest fashion for women, blending modern design with cultural values.',
  },
  {
    id: '6',
    businessName: 'Palm Threads',
    owner: 'Hessa Al-Nasser',
    email: 'hessa@palmthreads.sa',
    submittedDate: 'Oct 19, 2024',
    category: 'Apparel',
    status: 'pending',
    phone: '+966 53 456 7890',
    location: 'Riyadh, Saudi Arabia',
    taxId: '6078901234',
    description:
      'Palm Threads is a sustainable apparel brand crafting high-quality garments using eco-friendly fabrics sourced from across the GCC region.',
  },
  {
    id: '7',
    businessName: 'Dates & Co',
    owner: 'Ahmed Saeed',
    email: 'ahmed@datesco.sa',
    submittedDate: 'Oct 18, 2024',
    category: 'Food',
    status: 'pending',
    phone: '+966 50 567 8901',
    location: 'Al Qassim, Saudi Arabia',
    taxId: '7089012345',
    description:
      'Dates & Co specializes in premium Saudi dates, date-based confections, and artisanal food gifts — straight from Al-Qassim farms to your door.',
  },

  // ── Approved (All Vendors) ────────────────────────
  {
    id: '8',
    businessName: 'Urban Elegance',
    owner: 'Noura Al-Said',
    email: 'noura@urban.sa',
    submittedDate: 'Oct 12, 2024',
    category: 'Fashion',
    status: 'approved',
    revenue: 452390,
    orders: 1842,
    active: true,
    phone: '+966 50 123 4567',
    location: 'Riyadh, Saudi Arabia',
    taxId: '1012345678',
    joinedDate: 'Oct 12, 2023',
    products: 128,
    totalDue: 120000,
    invoices: 45000,
    pendingPayout: 79000,
    description:
      'Urban Elegance is a premium fashion brand offering content, sun-wear, and style clothing for everyday use. We focus on quality, sustainability, and customer satisfaction.',
  },
  {
    id: '9',
    businessName: 'Sajek Styles',
    owner: 'Ahmed Sajek',
    email: 'ahmed@sajek.sa',
    submittedDate: 'Oct 14, 2024',
    category: 'Apparel',
    status: 'approved',
    revenue: 124500,
    orders: 890,
    active: true,
    phone: '+966 55 234 5678',
    location: 'Jeddah, Saudi Arabia',
    taxId: '2023456789',
    joinedDate: 'Sep 5, 2023',
    products: 64,
    totalDue: 44000,
    invoices: 18000,
    pendingPayout: 26000,
    description:
      'Sajek Styles offers a modern take on traditional Arabic fashion, blending cultural heritage with contemporary design for men and women.',
  },
  {
    id: '10',
    businessName: 'Vintage Vault',
    owner: 'Layla Ibrahim',
    email: 'layla@vintagevault.sa',
    submittedDate: 'Oct 10, 2024',
    category: 'Handicrafts',
    status: 'approved',
    revenue: 12400,
    orders: 120,
    active: true,
    phone: '+966 54 345 6789',
    location: 'Mecca, Saudi Arabia',
    taxId: '3034567890',
    joinedDate: 'Nov 3, 2023',
    products: 32,
    totalDue: 5200,
    invoices: 2100,
    pendingPayout: 3100,
    description:
      'Vintage Vault curates rare and antique handicraft items sourced from across the Arab world, giving them a second life in modern homes.',
  },
  {
    id: '11',
    businessName: 'Eco Living',
    owner: 'Khalid Mansour',
    email: 'khalid@ecoliving.sa',
    submittedDate: 'Oct 8, 2024',
    category: 'Home & Garden',
    status: 'approved',
    revenue: 89200,
    orders: 620,
    active: true,
    phone: '+966 56 456 7890',
    location: 'Dammam, Saudi Arabia',
    taxId: '4045678901',
    joinedDate: 'Aug 20, 2023',
    products: 87,
    totalDue: 32000,
    invoices: 14000,
    pendingPayout: 18000,
    description:
      'Eco Living offers sustainable home and garden products made from natural materials, promoting eco-conscious living across Saudi Arabia.',
  },
  {
    id: '12',
    businessName: 'Saffron House',
    owner: 'Nora Al-Rashid',
    email: 'nora@saffronhouse.sa',
    submittedDate: 'Oct 17, 2024',
    category: 'Food',
    status: 'approved',
    revenue: 54800,
    orders: 340,
    active: true,
    phone: '+966 53 567 8901',
    location: 'Abha, Saudi Arabia',
    taxId: '5056789012',
    joinedDate: 'Jul 15, 2023',
    products: 45,
    totalDue: 19000,
    invoices: 8500,
    pendingPayout: 10500,
    description:
      'Saffron House brings the finest saffron-infused products to market — from spice blends to ready-made gourmet sauces — all sourced from trusted farms.',
  },
  {
    id: '13',
    businessName: 'Gulf Gadgets',
    owner: 'Faisal Nasser',
    email: 'faisal@gulfgadgets.com',
    submittedDate: 'Oct 16, 2024',
    category: 'Electronics',
    status: 'approved',
    revenue: 312000,
    orders: 1120,
    active: false,
    phone: '+966 50 678 9012',
    location: 'Riyadh, Saudi Arabia',
    taxId: '6067890123',
    joinedDate: 'Jun 1, 2023',
    products: 210,
    totalDue: 95000,
    invoices: 40000,
    pendingPayout: 55000,
    description:
      'Gulf Gadgets is a leading electronics retailer providing the latest consumer gadgets, accessories, and smart devices at competitive prices.',
  },
  {
    id: '14',
    businessName: 'Pearl Beauty',
    owner: 'Hana Al-Amin',
    email: 'hana@pearlbeauty.sa',
    submittedDate: 'Oct 15, 2024',
    category: 'Beauty',
    status: 'approved',
    revenue: 78600,
    orders: 445,
    active: true,
    phone: '+966 55 789 0123',
    location: 'Jeddah, Saudi Arabia',
    taxId: '7078901234',
    joinedDate: 'May 10, 2023',
    products: 76,
    totalDue: 28000,
    invoices: 12000,
    pendingPayout: 16000,
    description:
      'Pearl Beauty offers a curated collection of luxury skincare and beauty products, specializing in natural ingredients and halal-certified formulations.',
  },

  // ── Suspended ─────────────────────────────────────
  {
    id: '21',
    businessName: 'Riyadh Rugs',
    owner: 'Omar Khalil',
    email: 'omar@riyadhrugs.sa',
    submittedDate: 'Oct 14, 2024',
    category: 'Home & Garden',
    status: 'suspended',
  },
  {
    id: '22',
    businessName: 'Al-Noor Sports',
    owner: 'Tariq Salam',
    email: 'tariq@alnoor.sa',
    submittedDate: 'Oct 13, 2024',
    category: 'Sports',
    status: 'suspended',
  },
];

// ── Per-vendor mock detail data ────────────────────────────────────────────────

export interface MockOrder {
  id: string;
  submittedDate: string;
  customerName: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  price: number;
}

export interface MockProduct {
  name: string;
  category: string;
  price: number;
  status: 'active' | 'inactive';
}

export interface MockPayout {
  id: string;
  date: string;
  amount: number;
  referenceNumber: string;
  adminName: string;
  status: 'completed' | 'accepted' | 'pending' | 'rejected';
}

export const VENDOR_MOCK_ORDERS: Record<number, MockOrder[]> = {
  8: [
    { id: '#ORD-0031', submittedDate: 'Oct 25, 2024', customerName: 'Customer Name 1', status: 'active', price: 240 },
    { id: '#ORD-0221', submittedDate: 'Oct 25, 2024', customerName: 'Customer Name 1', status: 'active', price: 240 },
    { id: '#ORD-0422', submittedDate: 'Oct 25, 2024', customerName: 'Customer Name 2', status: 'active', price: 240 },
    { id: '#ORD-0322', submittedDate: 'Oct 25, 2023', customerName: 'Customer Name 2', status: 'active', price: 240 },
    { id: '#ORD-0511', submittedDate: 'Oct 22, 2023', customerName: 'Customer Name 3', status: 'active', price: 240 },
  ],
  9: [
    { id: '#ORD-1100', submittedDate: 'Oct 20, 2024', customerName: 'Ali Hassan', status: 'completed', price: 180 },
    { id: '#ORD-1101', submittedDate: 'Oct 18, 2024', customerName: 'Fatima Said', status: 'active', price: 320 },
    { id: '#ORD-1102', submittedDate: 'Oct 15, 2024', customerName: 'Mohammed Al-Ali', status: 'pending', price: 95 },
    { id: '#ORD-1103', submittedDate: 'Oct 12, 2024', customerName: 'Sara Omar', status: 'completed', price: 450 },
    { id: '#ORD-1104', submittedDate: 'Oct 8, 2024', customerName: 'Khalid Fahad', status: 'cancelled', price: 200 },
  ],
  10: [
    { id: '#ORD-2200', submittedDate: 'Oct 22, 2024', customerName: 'Noura Al-Said', status: 'active', price: 350 },
    { id: '#ORD-2201', submittedDate: 'Oct 20, 2024', customerName: 'Hana Al-Amin', status: 'completed', price: 120 },
    { id: '#ORD-2202', submittedDate: 'Oct 17, 2024', customerName: 'Tariq Salam', status: 'active', price: 85 },
  ],
  11: [
    { id: '#ORD-3300', submittedDate: 'Oct 24, 2024', customerName: 'Ibrahim Ali', status: 'active', price: 680 },
    { id: '#ORD-3301', submittedDate: 'Oct 21, 2024', customerName: 'Sarah Mansour', status: 'completed', price: 1200 },
    { id: '#ORD-3302', submittedDate: 'Oct 19, 2024', customerName: 'Faisal Nasser', status: 'pending', price: 450 },
    { id: '#ORD-3303', submittedDate: 'Oct 16, 2024', customerName: 'Layla Hassan', status: 'active', price: 890 },
  ],
  12: [
    { id: '#ORD-4400', submittedDate: 'Oct 25, 2024', customerName: 'Omar Khalil', status: 'active', price: 290 },
    { id: '#ORD-4401', submittedDate: 'Oct 22, 2024', customerName: 'Hessa Al-Nasser', status: 'completed', price: 150 },
    { id: '#ORD-4402', submittedDate: 'Oct 18, 2024', customerName: 'Ahmed Saeed', status: 'active', price: 420 },
  ],
  13: [
    { id: '#ORD-5500', submittedDate: 'Oct 23, 2024', customerName: 'Khalid Mansour', status: 'active', price: 8900 },
    { id: '#ORD-5501', submittedDate: 'Oct 20, 2024', customerName: 'Nora Al-Rashid', status: 'completed', price: 12400 },
    { id: '#ORD-5502', submittedDate: 'Oct 18, 2024', customerName: 'Ahmed Sajek', status: 'pending', price: 5600 },
    { id: '#ORD-5503', submittedDate: 'Oct 15, 2024', customerName: 'Noura Al-Said', status: 'cancelled', price: 3200 },
    { id: '#ORD-5504', submittedDate: 'Oct 10, 2024', customerName: 'Layla Ibrahim', status: 'active', price: 7800 },
  ],
  14: [
    { id: '#ORD-6600', submittedDate: 'Oct 24, 2024', customerName: 'Ibrahim Ali', status: 'active', price: 580 },
    { id: '#ORD-6601', submittedDate: 'Oct 21, 2024', customerName: 'Sarah Mansour', status: 'completed', price: 340 },
    { id: '#ORD-6602', submittedDate: 'Oct 17, 2024', customerName: 'Faisal Nasser', status: 'active', price: 920 },
    { id: '#ORD-6603', submittedDate: 'Oct 13, 2024', customerName: 'Hana Al-Amin', status: 'pending', price: 260 },
  ],
};

export const VENDOR_MOCK_PRODUCTS: Record<number, MockProduct[]> = {
  8: [
    { name: 'Premium Cotton T-Shirt', category: 'Apparel', price: 120, status: 'active' },
    { name: 'Premium Cotton T-Shirt', category: 'Apparel', price: 120, status: 'active' },
    { name: 'Minimalist Sneakers', category: 'Footwear', price: 450, status: 'active' },
    { name: 'Minimalist Sneakers', category: 'Footwear', price: 450, status: 'active' },
    { name: 'Denim Jacket', category: 'Apparel', price: 380, status: 'inactive' },
  ],
  9: [
    { name: 'Linen Thobe', category: 'Apparel', price: 280, status: 'active' },
    { name: 'Cotton Kandura', category: 'Apparel', price: 195, status: 'active' },
    { name: 'Silk Abaya', category: 'Apparel', price: 650, status: 'active' },
  ],
  10: [
    { name: 'Handwoven Basket', category: 'Handicrafts', price: 85, status: 'active' },
    { name: 'Clay Pottery Set', category: 'Handicrafts', price: 220, status: 'active' },
    { name: 'Brass Coffee Dallah', category: 'Handicrafts', price: 340, status: 'inactive' },
  ],
  11: [
    { name: 'Bamboo Plant Stand', category: 'Home & Garden', price: 180, status: 'active' },
    { name: 'Organic Herb Seedlings', category: 'Home & Garden', price: 45, status: 'active' },
    { name: 'Eco Candle Set', category: 'Home & Garden', price: 120, status: 'active' },
    { name: 'Natural Jute Rug', category: 'Home & Garden', price: 680, status: 'active' },
  ],
  12: [
    { name: 'Premium Saffron 5g', category: 'Food', price: 145, status: 'active' },
    { name: 'Saffron Rice Mix', category: 'Food', price: 65, status: 'active' },
    { name: 'Cardamom Blend', category: 'Food', price: 48, status: 'active' },
  ],
  13: [
    { name: 'Wireless Earbuds Pro', category: 'Electronics', price: 450, status: 'active' },
    { name: 'Smart Watch Series 5', category: 'Electronics', price: 1200, status: 'active' },
    { name: 'Portable Power Bank', category: 'Electronics', price: 180, status: 'inactive' },
    { name: 'USB-C Hub 7-in-1', category: 'Electronics', price: 220, status: 'active' },
    { name: 'Bluetooth Speaker', category: 'Electronics', price: 380, status: 'active' },
  ],
  14: [
    { name: 'Rose Water Serum', category: 'Beauty', price: 285, status: 'active' },
    { name: 'Argan Oil Hair Mask', category: 'Beauty', price: 190, status: 'active' },
    { name: 'Natural Loofah Set', category: 'Beauty', price: 75, status: 'active' },
    { name: 'Oud Perfume Oil', category: 'Beauty', price: 420, status: 'active' },
  ],
};

export const VENDOR_MOCK_PAYOUTS: Record<number, MockPayout[]> = {
  8: [
    { id: '#PAY-041', date: 'Oct 28, 2024', amount: 25000, referenceNumber: 'REF-98234', adminName: 'Ahmed Al-Shamri', status: 'completed' },
    { id: '#PAY-040', date: 'Oct 15, 2024', amount: 18500, referenceNumber: 'REF-87123', adminName: 'Sara Al-Otaibi', status: 'completed' },
    { id: '#PAY-039', date: 'Oct 1, 2024', amount: 32000, referenceNumber: 'REF-76012', adminName: 'Mohammed Al-Qahtani', status: 'completed' },
    { id: '#PAY-038', date: 'Sep 20, 2024', amount: 22750, referenceNumber: 'REF-64901', adminName: 'Noura Al-Dosari', status: 'completed' },
    { id: '#PAY-037', date: 'Sep 5, 2024', amount: 15300, referenceNumber: 'REF-53790', adminName: 'Khalid Al-Malki', status: 'pending' },
    { id: '#PAY-036', date: 'Aug 20, 2024', amount: 19800, referenceNumber: 'REF-42680', adminName: 'Ahmed Al-Shamri', status: 'completed' },
    { id: '#PAY-035', date: 'Aug 5, 2024', amount: 14600, referenceNumber: 'REF-31570', adminName: 'Sara Al-Otaibi', status: 'completed' },
    { id: '#PAY-034', date: 'Jul 22, 2024', amount: 11200, referenceNumber: 'REF-20460', adminName: 'Mohammed Al-Qahtani', status: 'rejected' },
    { id: '#PAY-033', date: 'Jul 8, 2024', amount: 28400, referenceNumber: 'REF-19350', adminName: 'Noura Al-Dosari', status: 'completed' },
    { id: '#PAY-032', date: 'Jun 25, 2024', amount: 17900, referenceNumber: 'REF-08240', adminName: 'Khalid Al-Malki', status: 'completed' },
    { id: '#PAY-031', date: 'Jun 10, 2024', amount: 21300, referenceNumber: 'REF-07130', adminName: 'Ahmed Al-Shamri', status: 'completed' },
    { id: '#PAY-030', date: 'May 28, 2024', amount: 16700, referenceNumber: 'REF-06020', adminName: 'Sara Al-Otaibi', status: 'accepted' },
    { id: '#PAY-029', date: 'May 15, 2024', amount: 23100, referenceNumber: 'REF-05910', adminName: 'Mohammed Al-Qahtani', status: 'completed' },
    { id: '#PAY-028', date: 'May 1, 2024', amount: 12800, referenceNumber: 'REF-04800', adminName: 'Noura Al-Dosari', status: 'completed' },
    { id: '#PAY-027', date: 'Apr 18, 2024', amount: 9500, referenceNumber: 'REF-03690', adminName: 'Khalid Al-Malki', status: 'pending' },
    { id: '#PAY-026', date: 'Apr 5, 2024', amount: 31200, referenceNumber: 'REF-02580', adminName: 'Ahmed Al-Shamri', status: 'completed' },
    { id: '#PAY-025', date: 'Mar 22, 2024', amount: 18000, referenceNumber: 'REF-01470', adminName: 'Sara Al-Otaibi', status: 'completed' },
    { id: '#PAY-024', date: 'Mar 8, 2024', amount: 13500, referenceNumber: 'REF-00360', adminName: 'Mohammed Al-Qahtani', status: 'completed' },
    { id: '#PAY-023', date: 'Feb 23, 2024', amount: 27600, referenceNumber: 'REF-99250', adminName: 'Noura Al-Dosari', status: 'completed' },
    { id: '#PAY-022', date: 'Feb 10, 2024', amount: 14100, referenceNumber: 'REF-88140', adminName: 'Khalid Al-Malki', status: 'accepted' },
  ],
  9: [
    { id: '#PAY-101', date: 'Oct 25, 2024', amount: 5400, referenceNumber: 'REF-11111', adminName: 'Ahmed Al-Shamri', status: 'completed' },
    { id: '#PAY-102', date: 'Oct 10, 2024', amount: 3800, referenceNumber: 'REF-22222', adminName: 'Sara Al-Otaibi', status: 'pending' },
    { id: '#PAY-103', date: 'Sep 28, 2024', amount: 6200, referenceNumber: 'REF-33333', adminName: 'Mohammed Al-Qahtani', status: 'completed' },
    { id: '#PAY-104', date: 'Sep 12, 2024', amount: 4100, referenceNumber: 'REF-44444', adminName: 'Noura Al-Dosari', status: 'completed' },
    { id: '#PAY-105', date: 'Aug 30, 2024', amount: 7800, referenceNumber: 'REF-55555', adminName: 'Khalid Al-Malki', status: 'accepted' },
  ],
  10: [
    { id: '#PAY-201', date: 'Oct 20, 2024', amount: 1800, referenceNumber: 'REF-66666', adminName: 'Ahmed Al-Shamri', status: 'completed' },
    { id: '#PAY-202', date: 'Oct 5, 2024', amount: 950, referenceNumber: 'REF-77777', adminName: 'Sara Al-Otaibi', status: 'rejected' },
    { id: '#PAY-203', date: 'Sep 22, 2024', amount: 2100, referenceNumber: 'REF-88888', adminName: 'Mohammed Al-Qahtani', status: 'completed' },
  ],
  11: [
    { id: '#PAY-301', date: 'Oct 26, 2024', amount: 9200, referenceNumber: 'REF-11211', adminName: 'Ahmed Al-Shamri', status: 'pending' },
    { id: '#PAY-302', date: 'Oct 12, 2024', amount: 7400, referenceNumber: 'REF-22322', adminName: 'Sara Al-Otaibi', status: 'completed' },
    { id: '#PAY-303', date: 'Sep 30, 2024', amount: 5600, referenceNumber: 'REF-33433', adminName: 'Mohammed Al-Qahtani', status: 'accepted' },
    { id: '#PAY-304', date: 'Sep 15, 2024', amount: 8900, referenceNumber: 'REF-44544', adminName: 'Noura Al-Dosari', status: 'completed' },
  ],
  12: [
    { id: '#PAY-401', date: 'Oct 22, 2024', amount: 4500, referenceNumber: 'REF-55655', adminName: 'Ahmed Al-Shamri', status: 'completed' },
    { id: '#PAY-402', date: 'Oct 8, 2024', amount: 3200, referenceNumber: 'REF-66766', adminName: 'Sara Al-Otaibi', status: 'pending' },
    { id: '#PAY-403', date: 'Sep 24, 2024', amount: 5800, referenceNumber: 'REF-77877', adminName: 'Mohammed Al-Qahtani', status: 'completed' },
  ],
  13: [
    { id: '#PAY-501', date: 'Oct 27, 2024', amount: 28000, referenceNumber: 'REF-88988', adminName: 'Ahmed Al-Shamri', status: 'completed' },
    { id: '#PAY-502', date: 'Oct 13, 2024', amount: 18500, referenceNumber: 'REF-99099', adminName: 'Sara Al-Otaibi', status: 'accepted' },
    { id: '#PAY-503', date: 'Sep 29, 2024', amount: 22000, referenceNumber: 'REF-10100', adminName: 'Mohammed Al-Qahtani', status: 'completed' },
    { id: '#PAY-504', date: 'Sep 15, 2024', amount: 16800, referenceNumber: 'REF-21211', adminName: 'Noura Al-Dosari', status: 'completed' },
    { id: '#PAY-505', date: 'Sep 1, 2024', amount: 31000, referenceNumber: 'REF-32322', adminName: 'Khalid Al-Malki', status: 'pending' },
  ],
  14: [
    { id: '#PAY-601', date: 'Oct 24, 2024', amount: 7800, referenceNumber: 'REF-43433', adminName: 'Ahmed Al-Shamri', status: 'completed' },
    { id: '#PAY-602', date: 'Oct 9, 2024', amount: 5200, referenceNumber: 'REF-54544', adminName: 'Sara Al-Otaibi', status: 'pending' },
    { id: '#PAY-603', date: 'Sep 25, 2024', amount: 6400, referenceNumber: 'REF-65655', adminName: 'Mohammed Al-Qahtani', status: 'accepted' },
    { id: '#PAY-604', date: 'Sep 10, 2024', amount: 9100, referenceNumber: 'REF-76766', adminName: 'Noura Al-Dosari', status: 'completed' },
  ],
};
