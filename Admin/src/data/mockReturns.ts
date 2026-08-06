export interface ReturnItem {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  productTitle: string;
  productSku: string;
  productVariant: string;
  productQty: number;
  productPrice: string;
  productImage: string;
  reason: string;
  customerNote?: string;
  uploadedImages?: string[];
  requestedDate: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'AWAITING_ITEM' | 'COMPLETED';
  timeline?: Array<{
    title: string;
    date: string;
    subtext: string;
    completed: boolean;
    active: boolean;
  }>;
}

export const MOCK_RETURNS: ReturnItem[] = [];
