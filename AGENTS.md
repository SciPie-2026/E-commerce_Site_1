# AIDAH — Agent Instructions

## Overview
AIDAH is a modern Indian fashion boutique web application built with **TanStack Start**, **React 19**, and **Tailwind CSS v4**.

## Architecture & Conventions
- **Routing**: File-based routing located in `src/routes/`. The app shell is `src/routes/__root.tsx`.
- **Styling**: Tailwind CSS v4 configured in `src/styles.css` with custom design tokens for luxury boutique aesthetics (Cormorant Garamond, Jost typography, palette tokens).
- **Icons**: Lucide React (`lucide-react`).
- **UI Components**: Accessible components based on Radix UI primitives (`@radix-ui/*`) located in `src/components/ui/`.
- **State Management**: React Context providers (`CartProvider` in `src/lib/cart-context.tsx`, `WishlistProvider` in `src/lib/wishlist-context.tsx`) wrapped with TanStack Query.

## Development Workflow
- `npm run dev`: Starts the Vite development server on `localhost:8080`.
- `npm run build`: Builds the production bundle using Vite and Nitro.
- `npm run test`: Runs test suite via Vitest.
- `npm run lint`: Runs ESLint checks.
