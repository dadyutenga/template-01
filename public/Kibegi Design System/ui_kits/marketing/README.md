# Kibegi — Marketing UI Kit

Two landing-page directions, both bilingual (EN/SW):

- **`index.html`** — ⭐ the current **premium 2026 SaaS** redesign (OpenRouter-inspired): Inter typography, fluid `clamp()` headings, crisp bordered cards, mono-accented stat rows, a bento feature grid, scroll reveals, and a mobile nav drawer. Fully responsive (hamburger < 880px; grids collapse 4→2→1). Styles in **`premium.css`**, logic inline (vanilla JS i18n + reveals + drawer). Keeps the Kibegi teal/orange/green palette.
- **`index-classic.html`** + `components.jsx` / `copy.jsx` / `kit.css` — the original React recreation faithful to the live `kibegi-UI` landing page (Poppins/Outfit). Kept for reference.

Open `index.html` for the premium page.

## What's here
- **`index.html`** — assembles the full landing page. Includes a working **language toggle** (🇹🇿 / 🇺🇸) in the navbar that swaps all copy between English and Swahili, exactly like the product.
- **`components.jsx`** — reusable React components:
  - `MktNavbar` — sticky glassy nav with logo lockup, icon links, theme + language toggles.
  - `MktHero` — split hero: black Poppins headline, check-bullet cards, hero/outline CTAs, floating photo card, blurred color blobs.
  - `MktFeatures` / `FeatureCard` — eyebrow→title→description head + 3-col feature grid (icon tint chip + outline badge, hover lift).
  - `MktComparison` / `ComparisonPanel` — "messy way" (rose) vs "Kibegi way" (teal) tinted panels.
  - `MktShowcase` / `FolderPreview` — showcase block with a nested file-list mini-preview.
  - `MktFinalCTA` — bordered CTA panel with eyebrow pill + trust chips.
  - `MktFooter` / `FooterCol` — brand column + link columns, "Powered by camelTech".
- **`copy.jsx`** — bilingual copy object (`MKT_COPY.en` / `.sw`), lifted from the source.
- **`kit.css`** — design tokens + component classes (buttons, cards, nav, pills).

## Conventions
- Icons: **Lucide** via CDN (`data-lucide="…"`, then `lucide.createIcons()` after each render).
- Fonts: Poppins (display) / Outfit (body) from Google Fonts.
- Assets referenced from `../../assets/`.
- This is a cosmetic recreation — no routing or real auth. Buttons are inert.

## Source
https://github.com/troubleman96/kibegi-UI · `src/pages/Index/Index.tsx`, `src/components/layout/Navbar.tsx`
