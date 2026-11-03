# Migration Notes

## License: Review Required
- **Status**: No `LICENSE` file was found in the original source repository.
- **Notice**: Users adopting this template should ensure they have appropriate rights to any original design assets or add an appropriate open-source license (such as MIT or Apache 2.0) before distributing downstream projects.

## Credentials and Sensitive Information Audit
- **Findings**:
  - Found Google Analytics tag `G-YMV2K4WS09` in `index.html` — removed and replaced with neutral placeholder.
  - Domain URLs (`https://kibegi.com`, `https://api.kibegi.com`) in `index.html` and `vite.config.ts` — removed and replaced with environment variables.
  - Baseline cleanup removed sensitive verbose debug logging from Axios interceptors and auth storage that previously printed request bodies and auth response tokens.
  - No secret API keys, private passwords, or production credentials were found in the source or repository environment files.
  - `.env.example` will define all required configuration variables (`VITE_APP_TITLE`, `VITE_API_BASE_URL`, `VITE_APP_ENV`).

## Upgrade and Migration Summary
- **Source Project**: Kibegi UI (education file sharing & timetable platform)
- **Target Project**: Reusable, domain-neutral frontend template (`frontend-template`)
- **Modernization Goals**:
  1. Strict TypeScript mode (`strict: true`).
  2. Data router with `createBrowserRouter` + code-splitting (`React.lazy`).
  3. Single-config navigation & route management (`routes.config.ts`).
  4. App shell with collapsible sidebar, responsive topbar, mobile drawer, breadcrumbs, footer.
  5. Rich component catalog: UI primitives, data tables, Recharts visualizations, feedback dialogs, forms with RHF + Zod.
  6. Domain-scrubbed neutral placeholders ("Your App") and full i18n support (English + Swahili).
  7. Automated tests with Vitest + Testing Library, multi-stage Dockerfile, and GitHub Actions CI workflow.
