# Frontend Development Standards

## Core Stack

- React + TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- React Hook Form
- Zustand
- React Query (@tanstack/react-query)
- Axios
- React Hot Toast

## Component Architecture

### Rules

- Never create large monolithic components.
- Split UI into small, focused, reusable components.
- Each component should have a single responsibility.
- Extract repeated UI into reusable components.
- Extract repeated logic into custom hooks.
- Avoid duplicated code.

### Preferred Structure

src/
├── components/
├── pages/
├── hooks/
├── services/
├── store/
├── routes/
├── types/
├── constants/
└── utils/

## Forms

- Always use React Hook Form.
- Use Zod for validation when needed.
- Avoid complex form state with useState.

## State Management

- Use Zustand for global state.
- Keep stores small and feature-focused.

## Data Fetching

- Use React Query + Axios.
- Never place API calls directly inside components.
- Keep API logic in service files.
- Create reusable query and mutation hooks.

## Routing

- Use React Router DOM.
- Centralize route configuration.
- Use protected route wrappers when needed.

## Notifications

- Use React Hot Toast.
- Never use browser alerts.

## Code Quality

- Use TypeScript everywhere.
- Avoid any.
- Extract business logic from UI.
- Prefer composition over large components.
- Create reusable hooks and utilities.

## Styling

- Use Tailwind CSS.
- Extract repeated patterns into reusable UI components.

## Golden Rules

1. Split UI into reusable components.
2. Keep components small.
3. Use React Hook Form for forms.
4. Use Zustand for state management.
5. Use React Query + Axios for API communication.
6. Use React Router DOM for navigation.
7. Use React Hot Toast for notifications.
8. Extract logic into hooks.
9. Extract API calls into services.
10. Prioritize maintainability, scalability, and reusability.
