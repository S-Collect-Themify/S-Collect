# Authentication & Vendor Onboarding

`authentication.md`

## Features

* [x] Vendor login
  * Email & Password validation
  * Session token & refresh token storage in `localStorage`
  * Locked state handling with countdown timer (14-minute lockout UI)
  * Expired session alert banner
* [x] Vendor registration / Onboarding application
  * First name & Last name
  * Business Email & Phone number
  * Store name & Store description
  * Commercial Registration Number (CRN)
  * Password creation with validation rules
* [x] Onboarding status tracking
  * Vendor status check (`PENDING_APPROVAL`, `APPROVED`, `ACTIVE`, `REJECTED`, `DEACTIVATED`)
  * Rejection reason display for rejected applications
* [x] Password recovery / Reset flow
  * Request password reset code via email
  * Verify reset code & input new password
* [x] Protected routes & session management
  * Route guard component (`ProtectedRoute.tsx`) redirecting unauthenticated users to `/login`
  * Automated token expiration scheduler (`scheduleRefreshTokenExpiration`)
  * JWT decoding and email payload extraction
  * Automatic logout on session expiration

## Status

* Overall: 🟢 Complete
* Implemented:
  * Login page with state management (`default`, `locked`, `expired`)
  * Full registration / vendor onboarding application form
  * Password reset workflow (forgot password + OTP code verification)
  * Automatic session scheduling and token payload helper utilities
  * Onboarding status page handling vendor approval workflow
* Partially implemented:
  * Phone OTP verification endpoint available in service (`verifyPhone`), but primary onboarding relies on email/CRN application form
* Missing:
  * None
* Known issues:
  * None

## Implementation

### Files & Components

* [`src/pages/auth/Login.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/auth/Login.tsx): Login interface supporting state-driven UI (locked, expired, default)
* [`src/pages/auth/Register.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/auth/Register.tsx): Multistep/Comprehensive vendor onboarding registration form
* [`src/pages/auth/ForgetPass.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/auth/ForgetPass.tsx): Forgot password request and OTP reset handler
* [`src/pages/auth/OnboardingStatus.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/auth/OnboardingStatus.tsx): Onboarding approval status indicator page
* [`src/components/auth/ProtectedRoute.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/components/auth/ProtectedRoute.tsx): Route wrapper enforcing authentication check
* [`src/components/auth/AuthLeftPanel.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/components/auth/AuthLeftPanel.tsx): Shared left branding panel for auth screens

### API Endpoints

* `POST /vendor/auth/login`: Authenticate vendor credentials and return tokens
* `POST /vendor/auth/verify-phone`: Verify phone OTP code
* `POST /vendor/auth/resend-otp`: Resend OTP verification code
* `POST /vendor/auth/refresh`: Refresh expired access token
* `POST /vendor/auth/logout`: Invalidate session refreshToken
* `POST /vendor/auth/forgot-password`: Request password reset OTP
* `POST /vendor/auth/reset-password`: Reset password using OTP code
* `POST /vendor/onboarding/apply`: Submit vendor application
* `GET /vendor/onboarding/status`: Retrieve current vendor onboarding status

### Hooks & Services

* [`src/services/auth.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/services/auth.ts): Core authentication service and JWT management helpers
* [`src/hooks/useLogin.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/hooks/useLogin.ts): React Query mutation hook for login execution
* [`src/store/authStore.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/store/authStore.ts): Zustand store for managing auth UI toggle state and errors

## Progress

* [x] Vendor login page
* [x] Vendor registration / Onboarding form
* [x] Onboarding status view
* [x] Forgot password & Reset code flow
* [x] Token storage & Session auto-expiration scheduler
* [x] Protected routes protection
