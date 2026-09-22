# Settings

`settings.md`

## Features

* [x] Store profile management
  * Store name & Store name (Arabic)
  * Store description
  * Public email & Public phone number
  * Location (City, Address, Geo-location)
  * Store logo upload with crop and preview
* [x] Bank account configuration
  * Bank name
  * Account holder name
  * IBAN input with Saudi Arabia (`SA`) prefix validation and length check (24 characters)
  * IBAN masking for sensitive display
* [x] Account settings management
  * First name & Last name
  * User primary email
  * Phone number
  * Low stock threshold configuration (persisted locally and synced with inventory store)
* [x] Security & authentication settings
  * Password change form (Current password, new password, confirm password)
  * Email change request modal
* [x] Save rate limiting / cooldown protection
  * 60-second cooldown timer between saves to prevent spam requests

## Status

* Overall: 🟢 Complete
* Implemented:
  * Store Details tab with full form, logo upload, live store card preview
  * Bank Account tab with SA IBAN validation, error handling, and reset actions
  * Account Settings page with personal details, low stock threshold, password update
  * Cooldown timer implementation for save actions (`useCooldown`)
  * Local storage synchronization for user email and inventory thresholds
* Partially implemented:
  * Email change verification modal (UI modal built, backend OTP confirmation step pending server workflow)
* Missing:
  * None
* Known issues:
  * None

## Implementation

### Files & Components

* [`src/pages/Settings.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/Settings.tsx): Main Tabbed Settings page container (Store Profile & Bank Account)
* [`src/pages/AccountSettings.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/AccountSettings.tsx): Vendor Account & Security Settings page
* [`src/features/settings/StoreProfileForm.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/settings/StoreProfileForm.tsx): Form controller for store profile updates
* [`src/features/settings/BankSettings.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/settings/BankSettings.tsx): Form component for bank account & IBAN updates
* [`src/features/settings/AccountSettingsForm.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/settings/AccountSettingsForm.tsx): Form controller for user details, password change, and low stock threshold
* [`src/features/settings/components/StoreLogoUpload.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/settings/components/StoreLogoUpload.tsx): Interactive store logo uploader with crop modal
* [`src/features/settings/components/StorePreviewCard.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/settings/components/StorePreviewCard.tsx): Live preview component of vendor store front
* [`src/features/settings/components/EmailChangeModal.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/settings/components/EmailChangeModal.tsx): Modal dialog for initiating email changes

### API Endpoints

* `GET /vendor/profile`: Fetch vendor profile details
* `PATCH /vendor/profile`: Update vendor store profile (multipart form data for logo)
* `GET /vendor/profile/bank-info`: Fetch vendor bank account details
* `PATCH /vendor/profile/bank-info`: Update vendor bank account information
* `POST /vendor/auth/change-password`: Update account password

### Hooks & Services

* [`src/services/vendorProfile.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/services/vendorProfile.ts): Vendor profile API service handlers
* [`src/services/account.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/services/account.ts): Account settings and local storage state persistence
* [`src/features/settings/hooks/useStoreProfile.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/settings/hooks/useStoreProfile.ts): Query hook for store profile
* [`src/features/settings/hooks/useUpdateStoreProfile.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/settings/hooks/useUpdateStoreProfile.ts): Mutation hook for store profile update
* [`src/features/settings/hooks/useBankInfo.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/settings/hooks/useBankInfo.ts): Query hook for bank information
* [`src/features/settings/hooks/useUpdateBankInfo.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/settings/hooks/useUpdateBankInfo.ts): Mutation hook for bank information update
* [`src/features/settings/hooks/useAccountSettings.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/settings/hooks/useAccountSettings.ts): Query hook for user account settings
* [`src/features/settings/hooks/useUpdateAccountSettings.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/settings/hooks/useUpdateAccountSettings.ts): Mutation hook for account settings update
* [`src/features/settings/hooks/useChangePassword.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/settings/hooks/useChangePassword.ts): Mutation hook for password change
* [`src/hooks/useCooldown.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/hooks/useCooldown.ts): Cooldown hook managing 60s save delay

### Stores

* [`src/features/settings/store/useAccountSettingsStore.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/settings/store/useAccountSettingsStore.ts): UI state store for email change modal and password fields
* [`src/store/inventorySettingsStore.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/store/inventorySettingsStore.ts): Global store for low stock threshold setting

## Progress

* [x] Store profile view & edit
* [x] Store logo upload & live preview
* [x] Bank account view & edit (with SA IBAN validation)
* [x] Account profile view & edit
* [x] Low stock threshold configuration
* [x] Change password functionality
* [x] Save rate-limiting cooldown
* [~] Email change OTP verification workflow
