# Product Reviews & Ratings

`product-reviews.md`

## Features

* [x] Product rating summary breakdown
  * Overall average rating score calculation
  * Rating count distribution breakdown per star level (1-star through 5-star)
* [x] Vendor customer reviews list
  * Customer name & avatar thumbnail display
  * Star rating display
  * Review title, comment body, and review submission date
  * Customer uploaded photo attachments gallery
* [x] Review filtering & Sorting
  * Filter reviews by star count (5, 4, 3, 2, 1 star)
  * Sort reviews by newest, highest rating, lowest rating
  * Pagination navigation

## Status

* Overall: 🟢 Complete
* Implemented:
  * Backend API integration (`getVendorReviews`, `getProductRatingSummary`)
  * `ReviewsList.tsx` component with rating filters and pagination range calculation
  * Rating distribution summary card integrated inside product details view
* Partially implemented:
  * None
* Missing:
  * None
* Known issues:
  * None

## Implementation

### Files & Components

* [`src/features/AddProducts/productDetails/ReviewsList.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/AddProducts/productDetails/ReviewsList.tsx): Customer reviews list, star rating display, filter tabs, and pagination
* [`src/pages/ProductDetails.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/ProductDetails.tsx): Product details page rendering ratings summary and customer reviews section

### API Endpoints

* `GET /vendor/reviews`: Fetch paginated vendor product reviews with optional rating and sort filters
* `GET /vendor/reviews/products/:productId/summary`: Retrieve rating distribution summary and average star rating for a product

### Hooks & Services

* [`src/services/reviews.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/services/reviews.ts): Vendor product reviews and rating summary service methods

## Progress

* [x] Vendor customer reviews list
* [x] Star rating visual component
* [x] Rating distribution summary breakdown (1-star to 5-star counts)
* [x] Rating filter tabs & sorting options
* [x] Customer review photo gallery attachments
