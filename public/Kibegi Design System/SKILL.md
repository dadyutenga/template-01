---
name: kibegi-design
description: Use this skill to generate well-branded interfaces and assets for Kibegi ("Your Digital School Bag" — a bilingual English/Swahili study-materials platform for students and lecturers), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference
- **Brand:** Kibegi — "Your Digital School Bag." Bilingual (English + Swahili), Tanzania-first, powered by camelTech. Warm, encouraging, student-to-student voice. Address the reader as "you."
- **Colors:** primary teal `hsl(187 85% 43%)`, secondary orange `hsl(25 95% 65%)`, accent green `hsl(142 70% 55%)`; cool-slate neutrals on an off-white `hsl(210 40% 98%)` canvas. Full tokens in `colors_and_type.css`.
- **Type:** Poppins (display, black for hero titles, tracking -0.02em), Outfit (body/UI), Inter (fallback). Teal uppercase eyebrows above big titles.
- **Look:** oversized soft card radii (26–34px), semi-transparent white cards with backdrop-blur over a soft teal-glow wash, slate-tinted shadows, gentle fade-up motion, hover lift, rounded tint icon-chips.
- **Icons:** Lucide (outline, ~2px). Load from CDN. Emoji only for language flags 🇹🇿/🇺🇸 and a 👋 greeting.

## Files
- `README.md` — full context, content & visual foundations, iconography, manifest.
- `colors_and_type.css` — all design tokens + semantic type classes (import this first).
- `assets/` — logo (teal/orange backpack mark) + hero photography & illustration.
- `preview/` — design-system specimen cards.
- `ui_kits/marketing/` — landing-page recreation (components + index.html).
- `ui_kits/app/` — authenticated student app recreation (components + interactive index.html).

When matching the brand, lift exact token values from `colors_and_type.css` and reuse the component patterns in the UI kits rather than inventing new ones. Always provide bilingual copy (EN + SW) where the product would.
