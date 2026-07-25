import type { CategoryCommissionItem } from '../types';

export const INITIAL_CATEGORY_COMMISSIONS: CategoryCommissionItem[] = [
  {
    id: 'c1',
    categoryName: 'Smartphones & Tablets',
    rate: 8.0,
    status: 'Custom',
    lastUpdated: '2024-10-22',
  },
  {
    id: 'c2',
    categoryName: 'Home Appliances',
    rate: 12.0,
    status: 'Custom',
    lastUpdated: '2024-10-19',
  },
  {
    id: 'c3',
    categoryName: 'Laptops & Computers',
    rate: 10.0,
    status: 'Default',
    lastUpdated: '2024-10-15',
  },
  {
    id: 'c4',
    categoryName: 'Audio & Headphones',
    rate: 10.0,
    status: 'Default',
    lastUpdated: '2024-10-10',
  },
  {
    id: 'c5',
    categoryName: 'Gaming & Accessories',
    rate: 15.0,
    status: 'Custom',
    lastUpdated: '2024-10-05',
  },
];
