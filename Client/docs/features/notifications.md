# Notifications System

`notifications.md`

## Features

* [x] Top header notification bell (`NotificationBell.tsx`)
  * Displays unread notification count badge with pulsing indicator
  * Dropdown trigger button
* [x] Notification dropdown panel (`NotificationDropdown.tsx`)
  * Scrollable list of vendor notifications with notification type icons
  * Unread indicator dot per item
  * Empty state and skeleton loader
* [x] Notification read status management
  * Mark individual notification as read (`markVendorNotificationRead`)
  * Mark all notifications as read (`markAllVendorNotificationsRead`)
* [x] Polling & Query caching
  * Auto-fetching notifications periodically via React Query (`useVendorNotifications`)

## Status

* Overall: 🟢 Complete
* Implemented:
  * Top navigation header integration (`AppLayout.tsx`) with notification bell
  * Notification dropdown container with item list and quick read actions
  * Single and bulk read API endpoints
  * Query key factory and automatic cache invalidation
* Partially implemented:
  * None
* Missing:
  * None
* Known issues:
  * None

## Implementation

### Files & Components

* [`src/features/notifications/components/NotificationBell.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/notifications/components/NotificationBell.tsx): Header bell icon button with unread badge counter
* [`src/features/notifications/components/NotificationDropdown.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/notifications/components/NotificationDropdown.tsx): Dropdown menu listing active notifications
* [`src/features/notifications/components/NotificationItem.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/notifications/components/NotificationItem.tsx): Individual notification row item
* [`src/features/notifications/components/NotificationSkeleton.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/notifications/components/NotificationSkeleton.tsx): Skeleton loading placeholder

### API Endpoints

* `GET /vendor/notifications`: Fetch vendor notifications list
* `PATCH /vendor/notifications/:id/read`: Mark notification as read
* `PATCH /vendor/notifications/read-all`: Mark all vendor notifications as read

### Hooks & Services

* [`src/services/notifications.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/services/notifications.ts): Notifications API service methods
* [`src/features/notifications/hooks/useVendorNotifications.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/notifications/hooks/useVendorNotifications.ts): Query and mutation hooks for fetching and marking notifications read

## Progress

* [x] Header bell button with unread count badge
* [x] Notification dropdown list
* [x] Mark individual notification as read
* [x] Mark all notifications as read
* [x] Notification type icon indicators & timestamp formatting
