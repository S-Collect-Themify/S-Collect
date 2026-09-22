# Receivables & Payouts

`receivables.md`

## Features

* [x] Financial metrics grid summary (`ReceivablesGrid.tsx`)
  * Eligible earnings balance
  * Total paid out amount
  * Pending balance
* [x] Payout history list table (`ReceivablesTable.tsx`)
  * Reference number & Transaction date
  * Payout amount
  * Transfer status badge (`PAID`, `PENDING`, `PROCESSING`, `FAILED`, `REJECTED`, `CANCELLED`)
  * Reference notes & Admin notes
* [x] Date range & Status filtering
  * Filter payouts by date range (`dateFrom` to `dateTo`)
  * Filter payouts by status
* [x] Excel payout export
  * Export financial receivables and payout history as `.xlsx` file download

## Status

* Overall: 🟢 Complete
* Implemented:
  * Receivables summary page (`Receivables.tsx`)
  * Payout balance endpoint integration (`getPayoutBalance`)
  * Paginated payouts history with date & status filters (`getPayouts`)
  * Excel export functionality (`exportPayouts`)
* Partially implemented:
  * None
* Missing:
  * None
* Known issues:
  * None

## Implementation

### Files & Components

* [`src/pages/Receivables.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/Receivables.tsx): Receivables page entry point
* [`src/features/Receivables/ReceivablesGrid.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/Receivables/ReceivablesGrid.tsx): Summary balance cards grid
* [`src/features/Receivables/ReceivablesTable.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/Receivables/ReceivablesTable.tsx): Receivables table with date/status filter controls and export trigger

### API Endpoints

* `GET /vendor/payouts/balance`: Retrieve vendor eligible earnings, paid out totals, and pending balance
* `GET /vendor/payouts`: Fetch paginated list of vendor payout records
* `GET /vendor/payouts/export`: Download payout history as an Excel file

### Hooks & Services

* [`src/services/payouts.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/services/payouts.ts): Vendor payouts service
* [`src/features/Receivables/hooks/usePayouts.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/Receivables/hooks/usePayouts.ts): React Query hooks for fetching balance, listing payouts, and downloading export file

## Progress

* [x] Eligible earnings & Paid out balance cards
* [x] Paginated payouts history list
* [x] Filter by status and date range
* [x] Excel payouts export download
