import { create } from 'zustand';

export type EmailModalStep = 'request' | 'verify';

interface AccountSettingsStore {
  // Password Section UI State
  pwOpen: boolean;
  setPwOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  togglePwOpen: () => void;

  // Email Change Modal UI State
  emailModalOpen: boolean;
  emailStep: EmailModalStep;
  newEmail: string;
  otpCode: string;
  currentEmailDisplay: string;
  emailError: string | null;
  emailSuccessMsg: string | null;

  setEmailModalOpen: (open: boolean) => void;
  setEmailStep: (step: EmailModalStep) => void;
  setNewEmail: (email: string) => void;
  setOtpCode: (code: string) => void;
  setCurrentEmailDisplay: (email: string) => void;
  setEmailError: (error: string | null) => void;
  setEmailSuccessMsg: (msg: string | null) => void;
  openEmailModal: () => void;
  closeEmailModal: () => void;
  resetEmailModal: () => void;
}

export const useAccountSettingsStore = create<AccountSettingsStore>((set) => ({
  pwOpen: false,
  setPwOpen: (open) =>
    set((state) => ({
      pwOpen: typeof open === 'function' ? open(state.pwOpen) : open,
    })),
  togglePwOpen: () => set((state) => ({ pwOpen: !state.pwOpen })),

  emailModalOpen: false,
  emailStep: 'request',
  newEmail: '',
  otpCode: '',
  currentEmailDisplay: '',
  emailError: null,
  emailSuccessMsg: null,

  setEmailModalOpen: (open) => set({ emailModalOpen: open }),
  setEmailStep: (step) => set({ emailStep: step }),
  setNewEmail: (email) => set({ newEmail: email }),
  setOtpCode: (code) => set({ otpCode: code }),
  setCurrentEmailDisplay: (email) => set({ currentEmailDisplay: email }),
  setEmailError: (error) => set({ emailError: error }),
  setEmailSuccessMsg: (msg) => set({ emailSuccessMsg: msg }),

  openEmailModal: () =>
    set({
      emailModalOpen: true,
      emailStep: 'request',
      emailError: null,
      emailSuccessMsg: null,
    }),
  closeEmailModal: () =>
    set({
      emailModalOpen: false,
      emailStep: 'request',
      newEmail: '',
      otpCode: '',
      emailError: null,
      emailSuccessMsg: null,
    }),
  resetEmailModal: () =>
    set({
      emailStep: 'request',
      newEmail: '',
      otpCode: '',
      emailError: null,
      emailSuccessMsg: null,
    }),
}));
