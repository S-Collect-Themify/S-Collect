# Marketing & Push Campaigns

`campaigns.md`

## Features

* [x] Push campaigns listing (`/campaigns`)
  * List all push campaigns sent by vendor to buyers
  * Campaign title, body, status, sent date, recipient count metrics
  * Pagination navigation
* [x] Create & Send push campaign modal
  * Title & Arabic Title inputs
  * Message Body & Arabic Message Body inputs
  * Push image attachment (Direct HTTPS image URL or local file upload hosted automatically)
  * FCM / APNs payload validation (ensuring valid HTTP/HTTPS image URL format)
* [x] Live push notification preview
  * Mobile notification preview card rendering title, text, and image attachment in real-time

## Status

* Overall: 🟢 Complete
* Implemented:
  * Full push campaigns management page (`Campaigns.tsx`)
  * `CampaignFormModal.tsx` for constructing notification campaigns
  * `CampaignPreview.tsx` rendering mobile notification UI preview
  * Automatic image hosting upload mechanism (`uploadCampaignImage`) converting local files to server-hosted URLs
  * React Query integration (`campaignKeys.ts`, `useCampaigns.ts`)
* Partially implemented:
  * None
* Missing:
  * None
* Known issues:
  * None

## Implementation

### Files & Components

* [`src/pages/Campaigns.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/Campaigns.tsx): Push campaigns main page container
* [`src/features/campaigns/components/CampaignCard.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/campaigns/components/CampaignCard.tsx): Card item for individual push campaign
* [`src/features/campaigns/components/CampaignFormModal.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/campaigns/components/CampaignFormModal.tsx): Form dialog for broadcasting push notifications
* [`src/features/campaigns/components/CampaignPreview.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/campaigns/components/CampaignPreview.tsx): Real-time mobile push preview card

### API Endpoints

* `GET /vendor/push-campaigns`: Fetch paginated list of vendor push campaigns
* `POST /vendor/push-campaigns`: Broadcast push notification campaign to buyers

### Hooks & Services

* [`src/services/campaigns.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/services/campaigns.ts): Push campaign API service and image uploader
* [`src/features/campaigns/hooks/useCampaigns.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/campaigns/hooks/useCampaigns.ts): Query and mutation hooks for push campaigns

## Progress

* [x] List past push campaigns
* [x] Create & Broadcast new push notification
* [x] Real-time mobile push preview
* [x] Image attachment URL & File upload handling
