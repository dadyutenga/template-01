# Kibegi Frontend

Modern React + Vite dashboard for the Kibegi education platform. It delivers both the marketing landing page and the authenticated experience students and lecturers use to upload, organize, and share class resources. The app is currently hosted on Netlify and consumes the production API at `https://api.kibegi.com/api`.

## Tech Stack
- Vite + React 18 + TypeScript
- Tailwind CSS & shadcn/ui component primitives
- React Router for navigation
- React Query for server state
- Axios for API access

## Getting Started

```bash
# 1. Install dependencies (npm, pnpm, or bun all work thanks to lockfiles)
npm install

# 2. Start the dev server
npm run dev

# 3. Lint and type-check
npm run lint
npm run typecheck

# 4. Build for production / preview locally
npm run build
npm run preview
```

### Environment & API configuration
The frontend always talks to the live backend at `https://api.kibegi.com/api` (see `src/lib/api.ts`). If you need to test against a different backend, change that constant or inject your own Axios instance—no `.env` file is required for the current Netlify deployment.

## Project Structure

```
├── public/                # Static assets copied as-is by Vite
├── src/
│   ├── App.tsx            # Route map and provider tree
│   ├── main.tsx           # React entry point
│   ├── assets/            # Images used in the UI
│   ├── components/
│   │   ├── layout/        # Navbar, dashboard nav, mobile nav, protection wrapper
│   │   └── ui/            # shadcn-based primitives (button, dialog, sheet, etc.)
│   ├── contexts/          # Auth, language, and theme providers
│   ├── hooks/             # Shared hooks (toasts, responsive helpers)
│   ├── lib/               # Axios client, auth storage, translations, utility helpers
│   ├── pages/             # Routed screens (landing, auth, dashboard sections)
│   └── services/          # Typed API wrappers per feature domain
├── eslint.config.js       # Flat ESLint config
├── tailwind.config.ts     # Tailwind + shadcn design tokens
├── vite.config.ts         # Build & alias configuration
└── netlify.toml           # Netlify deploy settings
```

## Key Concepts
- **Auth & storage:** `AuthContext` persists session data using cookies + localStorage via `authStorage`. Protected routes enforce login before rendering dashboard pages.
- **Internationalization:** `LanguageContext` exposes a translator function backed by `src/lib/translations.ts`, currently supporting English and Swahili.
- **UI system:** `src/components/ui` mirrors the shadcn/ui catalog so higher-level pages can stay declarative and theme-aware.
- **Services layer:** Each file in `src/services` encapsulates one backend area (auth, classes, files, friends, notifications, sharing, uploads). All services share the configured Axios instance, so base headers/tokens live in one place.

## Deployment
The project is optimized for Netlify (see `netlify.toml` and the `_redirects` file in `public/`). Run `npm run build` and deploy the contents of `dist/`, or connect the repository to Netlify for automatic builds.

## Contributing
1. Create a feature branch.
2. Make changes and ensure `npm run lint` and `npm run typecheck` pass.
3. Build locally with `npm run build` if the change affects production assets.
4. Open a PR and link any relevant issue.
