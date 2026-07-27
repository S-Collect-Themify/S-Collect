import type { TableItem } from '../types';

export const BASE_REFUNDS: TableItem[] = [
  { id: 'r1', code: '#REF-77492-CS', orderId: '#ORD-77492-CS', customer: 'Yousef Al-Harbi', vendor: 'Al-Falah Crafts', reason: 'Wrong product received', date: 'Oct 24, 2026', total: 450, totalFormatted: '450.00 SAR', status: 'Pending' },
  { id: 'r2', code: '#REF-77491-CS', orderId: '#ORD-77491-CS', customer: 'Layan Mansour', vendor: 'Desert Bloom', reason: 'Damaged item', date: 'Oct 24, 2026', total: 1200, totalFormatted: '1,200.00 SAR', status: 'Approved' },
  { id: 'r3', code: '#REF-77490-CS', orderId: '#ORD-77490-CS', customer: 'Fahad Al-Otaibi', vendor: 'Oasis Tech', reason: 'Canceled by customer', date: 'Oct 24, 2026', total: 85, totalFormatted: '85.00 SAR', status: 'Rejected' },
  { id: 'r4', code: '#REF-77489-CS', orderId: '#ORD-77489-CS', customer: 'Sarah Khalid', vendor: 'Red Sea Styles', reason: 'Wrong size delivered', date: 'Oct 23, 2026', total: 320, totalFormatted: '320.00 SAR', status: 'Pending' },
  { id: 'r5', code: '#REF-77488-CS', orderId: '#ORD-77488-CS', customer: 'Abdulrahman Ali', vendor: 'Dates & Co', reason: 'Item not needed', date: 'Oct 23, 2026', total: 150, totalFormatted: '150.00 SAR', status: 'Approved' },
];

export const MOCK_REFUNDS: TableItem[] = Array.from({ length: 25 }, (_, i) => {
  const base = BASE_REFUNDS[i % BASE_REFUNDS.length];
  const num = 77492 - i;
  return {
    ...base,
    id: `r_${i + 1}`,
    code: `#REF-${num}-CS`,
    orderId: `#ORD-${num}-CS`,
  };
});
