# Architecture & Design Decisions

This document logs significant architectural and design choices, trade-offs, and decisions made during the conversion from the domain-specific codebase into a reusable frontend template.

## Phase 0 & 1: Source Discovery & Classification

### 1. Source Stack & Domain Assessment
- **Finding**: The source codebase is an academic campus platform ("Kibegi - Your Digital School Bag") built with Vite 5, React 18, TypeScript, Tailwind CSS, Radix UI / shadcn/ui, and TanStack React Query.
- **Decision**: Keep the modern Vite + React 18 + Tailwind + Radix UI foundation. It is an excellent, flexible, modern stack.
- **Reason**: The existing UI design system (HSL tokens, typography, component styling) is modern and clean. Rebuilding from scratch would discard great UI styling, whereas generalizing and modernizing it yields a clean, enterprise-ready template.

### 2. TypeScript Strict Mode & Compiler Options
- **Finding**: Original `tsconfig.app.json` had `"strict": false` and `"noImplicitAny": false`, and an invalid `"ignoreDeprecations": "6.0"` setting.
- **Decision**: Modernize compiler options to `"strict": true`, enforce zero unhandled `any` types, and configure standard modern TypeScript settings.
- **Reason**: A reusable template must ensure strong type safety so downstream developers have full autocomplete, prop validation, and refactoring confidence.

### 3. Routing Architecture & Unified Config Array
- **Finding**: Original routing used JSX `<Routes>` with eager imports in `src/App.tsx`, requiring manual updates to both sidebar markup and router trees when adding a new page.
- **Decision**: Migrate to React Router's `createBrowserRouter` driven by a unified navigation/route config array (`src/app/routes.config.ts`), with `React.lazy` code-splitting, custom error elements, and automatic breadcrumb/sidebar generation.
- **Reason**: Meets the core requirement: adding a new page requires only creating a page file and adding a single entry to the config array.

### 4. Pruning Domain Services and Hardware Integrations
- **Finding**: 14 domain service files (`classService`, `marketplaceService`, `channelService`, `sharingService`, etc.) and camera QR scanning (`html5-qrcode`, `qrcode.react`) were tightly coupled to the Kibegi Django backend.
- **Decision**: Remove all domain-specific REST services and QR scanner packages. Implement a clean, generic API client (Axios wrapper with request/response interceptors, baseURL configuration, and normalized errors) along with typed mock hooks demonstrating TanStack Query query and mutation patterns.
- **Reason**: Templates should never ship with broken, dead domain backend calls; they must provide clean API abstractions and mock data ready for customization.

### 5. Cleaning Branding, Assets, and Unused Lockfiles
- **Finding**: Proprietary assets (logos, marketing kits under `public/Kibegi Design System`, educational photos) and redundant lockfiles (`bun.lockb`, `pnpm-lock.yaml`) were cluttering the repo.
- **Decision**: Remove proprietary assets and redundant lockfiles. Standardize on `npm` (`package-lock.json`), and replace branding with neutral "Frontend Template" / "Your App" placeholders and clean geometric SVGs.
- **Reason**: Ensures the template is lightweight, domain-neutral, free of proprietary branding, and has a single source of truth for dependencies.
