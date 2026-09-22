# Return Requests & Refunds Management

`returns.md`

## Features

* [x] Return requests listing (`/returns`)
  * Display return request ID, order ID, customer details, refund amount, items count, request date, and status badge
  * Filter by status (`ALL`, `PENDING`, `APPROVED`, `REJECTED`)
  * Search return requests by return number or order number
  * Pagination navigation
* [x] Return request details view (`/returns/:id`)
  * Detailed breakdown of items returned (Product name, variant, unit price, refund amount, reason)
  * Return evidence images gallery view
  * Customer & delivery information
  * Internal vendor notes section (`setRefundInternalNotes`)
* [x] Return request actions
  * Approve return request (`approveRefund`)
  * Reject return request with mandatory rejection reason (`rejectRefund`)
  * Process refund payout trigger (`processRefund`)

## Status

* Overall: 🟢 Complete
* Implemented:
  * Returns listing page (`ReturnRequests.tsx`)
  * Detailed return request inspection view (`ReturnRequestDetails.tsx`)
  * Approve / Reject workflow modal with rejection reason text area
  * Internal notes addition
  * Backend endpoints fallback mechanism handling `/vendor/refunds/:id/approve` and status PATCH endpoints
* Partially implemented:
  * None
* Missing:
  * None
* Known issues:
  * None

## Implementation

### Files & Components

* [`src/pages/ReturnRequests.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/ReturnRequests.tsx): Vendor return requests list page
* [`src/pages/ReturnRequestDetails.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/ReturnRequestDetails.tsx): Return request details page
* [`src/features/Returns/components/ReturnRequestCard.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/Returns/components/ReturnRequestCard.tsx): Return item summary card
* [`src/features/Returns/components/ReturnActionModal.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/Returns/components/ReturnActionModal.tsx): Approve/Reject confirmation dialog

### API Endpoints

* `GET /vendor/refunds`: Fetch paginated vendor refund requests
* `GET /vendor/refunds/:id`: Fetch single refund request details
* `PATCH /vendor/refunds/:id/approve`: Approve refund request
* `PATCH /vendor/refunds/:id/reject`: Reject refund request with reason
* `PATCH /vendor/refunds/:id/notes`: Set vendor internal notes on refund
* `POST /vendor/refunds/:id/process`: Trigger refund payout process

### Hooks & Services

* [`src/services/refunds.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/services/refunds.ts): Vendor refunds/returns service
* [`src/features/Returns/hooks/useReturns.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/Returns/hooks/useReturns.ts): React Query hook for fetching and updating return requests

## Progress

* [x] Return requests list with status filters
* [x] Search by return / order number
* [x] Return request detail view & photo evidence view
* [x] Approve return request
* [x] Reject return request with reason
* [x] Internal notes management
