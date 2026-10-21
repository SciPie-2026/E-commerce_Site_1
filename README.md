# AIDAH The Label — Handcrafted Designer Wear & Boutique

AIDAH The Label (Aidah Designer House & Boutique) is a contemporary luxury Indian boutique web application — showcasing heirloom lehengas, pure linen & silk co-ords, pre-draped saree gowns, and occasion wear hand-finished in small batches. Atelier located at Baani City Centre, Sector 63, Gurugram.

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) with [React 19](https://react.dev)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Data & State**: [TanStack Query](https://tanstack.com/query), React Context
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Components**: Radix UI Primitives & Lucide Icons
- **Bundler & Dev Server**: [Vite 8](https://vite.dev)
- **Deployment Engine**: [Nitro](https://nitro.unjs.io)

## Project Structure

```text
├── public/              # Static assets (favicons, robots.txt)
├── src/
│   ├── assets/          # Static media and design assets
│   ├── components/      # Reusable UI components & site layout
│   ├── data/            # Boutique product catalogs & mock data
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities, cart & wishlist contexts
│   ├── routes/          # File-based routes (__root.tsx, index.tsx, shop.tsx)
│   ├── router.tsx       # Router configuration & factory
│   ├── server.ts        # SSR server entry point
│   ├── start.ts         # TanStack Start middleware & CSRF
│   └── styles.css       # Tailwind CSS v4 styling & typography tokens
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Independent Vite build configuration
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- `npm`, `pnpm`, or `bun`

### Installation

```bash
npm install
```

### Development

Start the local development server:

```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

### Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Testing & Code Quality

```bash
npm run test         # Run unit & integration tests
npm run lint         # Check code quality with ESLint
npm run format       # Format code with Prettier
```
