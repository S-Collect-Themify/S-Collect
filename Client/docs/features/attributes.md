# Attributes Management

`attributes.md`

## Features

* [x] Attribute creation & editing
  * Attribute English & Arabic names (e.g., Color / اللون, Size / المقاس)
  * Attribute type classification (e.g., COLOR, SELECT, TEXT)
  * Initial values assignment during creation
* [x] Attribute value management
  * Add new value to attribute (English value, Arabic value, Color HEX code if type is COLOR)
  * Edit existing attribute values
  * Delete attribute value (with dependency check if used by active variants)
* [x] Attribute deletion
  * Delete custom attribute (verifying product usage)
  * Safety deletion confirmation modal (`AttributeDeleteModal.tsx`)
* [x] UI Card display
  * Attribute cards showing type badges, values list with color swatches or text pills
  * Empty state component (`AttributeEmptyState.tsx`)

## Status

* Overall: 🟢 Complete
* Implemented:
  * Full attributes management page (`Attributes.tsx`)
  * Add/Edit attribute modal (`AttributeFormModal.tsx`)
  * Add/Edit attribute value modal (`AttributeValueModal.tsx`) with color picker and HEX code resolver
  * Delete confirmation modal with error handling if attribute is bound to products
  * React Query hooks with query keys factory (`attributeKeys.ts`)
* Partially implemented:
  * None
* Missing:
  * None
* Known issues:
  * None

## Implementation

### Files & Components

* [`src/pages/Attributes.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/Attributes.tsx): Main attributes management page
* [`src/features/attributes/components/AttributeCard.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/attributes/components/AttributeCard.tsx): Card component rendering attribute title, type, and values
* [`src/features/attributes/components/AttributeFormModal.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/attributes/components/AttributeFormModal.tsx): Modal for creating/editing attributes
* [`src/features/attributes/components/AttributeValueModal.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/attributes/components/AttributeValueModal.tsx): Modal for adding/editing attribute values
* [`src/features/attributes/components/AttributeDeleteModal.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/attributes/components/AttributeDeleteModal.tsx): Deletion confirmation modal
* [`src/features/attributes/components/AttributeEmptyState.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/attributes/components/AttributeEmptyState.tsx): Visual empty state representation

### API Endpoints

* `GET /vendor/attributes`: Fetch all vendor attributes and nested values
* `POST /vendor/attributes`: Create a new vendor attribute
* `PUT /vendor/attributes/:id`: Update attribute name or sort order
* `DELETE /vendor/attributes/:id`: Delete attribute
* `POST /vendor/attributes/:id/values`: Add value to attribute
* `PUT /vendor/attributes/:id/values/:valueId`: Update attribute value
* `DELETE /vendor/attributes/:id/values/:valueId`: Delete attribute value

### Hooks & Services

* [`src/services/attributes.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/services/attributes.ts): Attribute CRUD service methods
* [`src/features/attributes/hooks/useAttributes.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/attributes/hooks/useAttributes.ts): Query and mutation hooks for attributes management

## Progress

* [x] List vendor attributes and values
* [x] Create attribute modal
* [x] Edit attribute modal
* [x] Delete attribute with dependency checks
* [x] Add attribute value (with color picker for COLOR attributes)
* [x] Edit & Delete attribute value
