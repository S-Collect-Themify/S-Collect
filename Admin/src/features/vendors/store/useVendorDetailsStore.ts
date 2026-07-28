import { create } from 'zustand';

interface VendorDetailsState {
  showSuspend: boolean;
  showActivate: boolean;
  showReject: boolean;
  showApprove: boolean;
  openSuspend: () => void;
  closeSuspend: () => void;
  openActivate: () => void;
  closeActivate: () => void;
  openReject: () => void;
  closeReject: () => void;
  openApprove: () => void;
  closeApprove: () => void;
  reset: () => void;
  handleNavigate: (productId: string , navigate:any) => void;
}

export const useVendorDetailsStore = create<VendorDetailsState>((set) => ({
  showSuspend: false,
  showActivate: false,
  showReject: false,
  showApprove: false,
  openSuspend: () => set({ showSuspend: true }),
  closeSuspend: () => set({ showSuspend: false }),
  openActivate: () => set({ showActivate: true }),
  closeActivate: () => set({ showActivate: false }),
  openReject: () => set({ showReject: true }),
  closeReject: () => set({ showReject: false }),
  openApprove: () => set({ showApprove: true }),
  closeApprove: () => set({ showApprove: false }),
  reset: () =>
    set({
      showSuspend: false,
      showActivate: false,
      showReject: false,
      showApprove: false,
    }),
    handleNavigate: (productId: string , navigate: any) => {
      navigate(`/products/${productId}`);
    },
}));
