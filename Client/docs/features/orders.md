# Orders & Sub-Orders Management

`orders.md`

## Features

* [x] Incoming sub-orders list
  * Display order ID, customer details, items count, total price, order date, and sub-order status
  * Status filtering (All, PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
  * Search order list by order ID or customer name
  * Pagination navigation
* [x] Sub-order details view (`/incoming-orders/:id`)
  * Order items breakdown (Thumbnail, title, SKU, variant options, unit price, quantity, total)
  * Order status workflow transition controller (`SubOrderStatusUpdate.tsx`)
  * Order status timeline tracker (`SubOrderTimeline.tsx`)
  * Shipping details & Customer delivery info (`SubOrderInfo.tsx`)
  * Order financial summary (`SubOrderSummary.tsx`)
* [x] Vendor order statistics
  * Real-time metrics endpoint (`totalSales`, `totalOrders`, `newOrders`, `activeProducts`)
* [x] Sub-order status updates & tracking
  * Update order status (`PENDING` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`)
  * Add shipping tracking company & tracking number upon dispatch

## Status

* Overall: 🟢 Complete
* Implemented:
  * Orders listing page (`Orders.tsx`) with filter tabs and search
  * Sub-order details page (`SubOrderDetails.tsx`)
  * Status update component with status validation, tracking company selection, and tracking code submission
  * Order lifecycle timeline displaying timestamped events
  * Vendor stats integration (`getVendorOrderStats`)
* Partially implemented:
  * None
* Missing:
  * None
* Known issues:
  * None

## Implementation

### Files & Components

* [`src/pages/Orders.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/Orders.tsx): Vendor incoming orders list page
* [`src/pages/SubOrderDetails.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/SubOrderDetails.tsx): Sub-order detail view
* [`src/features/SubOrder/SubOrderInfo.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/SubOrder/SubOrderInfo.tsx): Customer delivery & shipping info card
* [`src/features/SubOrder/SubOrderItems.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/SubOrder/SubOrderItems.tsx): Ordered items list component
* [`src/features/SubOrder/SubOrderStatusUpdate.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/SubOrder/SubOrderStatusUpdate.tsx): Status change & tracking information form
* [`src/features/SubOrder/SubOrderTimeline.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/SubOrder/SubOrderTimeline.tsx): Order progress timeline
* [`src/features/SubOrder/SubOrderSummary.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/SubOrder/SubOrderSummary.tsx): Order financial totals component

### API Endpoints

* `GET /vendor/sub-orders`: Fetch paginated vendor sub-orders
* `GET /vendor/sub-orders/:id`: Fetch single sub-order details
* `GET /vendor/sub-orders/stats`: Fetch vendor order metrics
* `PATCH /vendor/sub-orders/:id`: Update sub-order status and shipping tracking details

### Hooks & Services

* [`src/services/orders.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/services/orders.ts): Sub-order API services
* [`src/features/Orders/useSubOrders.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/Orders/useSubOrders.ts): Query and mutation hooks for sub-orders

## Progress

* [x] Incoming sub-orders list with pagination
* [x] Status filter tabs (Pending, Processing, Shipped, Delivered, Cancelled)
* [x] Order search functionality
* [x] Sub-order details view & items breakdown
* [x] Order status transition workflow
* [x] Shipping tracking company & Tracking number input
* [x] Vendor order analytics stats
