import type { Buyer, BuyerOrder } from '../types/buyers';

const ITEMS_PER_PAGE_DEFAULT = 25;
export { ITEMS_PER_PAGE_DEFAULT };

export const INITIAL_BUYERS: Buyer[] = [];

export const BUYER_MOCK_ORDERS: Record<string | number, BuyerOrder[]> = {};
