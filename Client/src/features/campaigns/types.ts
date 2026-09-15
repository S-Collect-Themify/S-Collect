export interface PushCampaign {
  id: string;
  title: string;
  titleAr: string | null;
  body: string;
  bodyAr: string | null;
  imageUrl: string | null;
  totalTokens: number;
  successCount: number;
  failureCount: number;
  createdAt: string;
  sentByVendorId: string | null;
  sentByAdminId: string | null;
}

export interface CreatePushCampaignDto {
  title: string;
  titleAr?: string;
  body: string;
  bodyAr?: string;
  imageUrl?: string;
  imageFile?: File | null;
}

export interface PushCampaignsPagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PushCampaignsResponse {
  items: PushCampaign[];
  pagination: PushCampaignsPagination;
}

export interface PushCampaignQueryParams {
  pageNum?: number;
  pageSize?: number;
}
