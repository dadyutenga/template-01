# Kibegi — Design System

**Kibegi** is *“Your Digital School Bag.”* It is a web platform that lets students and lecturers **store, share, and access study materials in one secure place** — past papers, lecture notes, handouts, revision packs — organised by class and subject, with a study timetable and class-based sharing on top. The product is built for the East African student market (Tanzania-first): the entire UI ships **bilingual in English and Swahili**, uses Tanzania locale formatting, and is **powered by camelTech**.

The app is a mobile-first React PWA hosted on Netlify, consuming a production API at `api.kibegi.com`. It pairs a marketing landing page with an authenticated student/lecturer workspace.

> Tagline: **“Never Lose Notes Again.”** · Sub: *Store past papers, share notes, organize your semester, and stay ahead — all in one secure digital system built for students.*

---

## Sources

This system was reverse-engineered from the official frontend repository. The reader may not have access, but these are the canonical inputs — explore them to build more faithfully:

- **Frontend (UI):** https://github.com/troubleman96/kibegi-UI — React 18 + Vite + TypeScript, Tailwind CSS + shadcn/ui, React Router, React Query, framer-motion. Design tokens live in `src/index.css` and `tailwind.config.ts`. Key screens in `src/pages/*`, layout in `src/components/layout/*`, primitives in `src/components/ui/*` (shadcn catalog).
- **API:** https://github.com/troubleman96/kibegi_API — the production backend (not used for visual reference).
- Live: `https://kibegi.com` · API base: `https://api.kibegi.com/api`

The brand belongs to the camelTech ecosystem (sibling products referenced in-app include KOKOTOA and *Vilivyopotea na Kupatikana*).

---

## What's in this design system

| File / folder | What it holds |
|---|---|
| `README.md` | This document — context, content & visual foundations, iconography, index. |
| `colors_and_type.css` | All design tokens: brand colors (HSL), gradients, shadows, radii, type scale + semantic type classes. |
| `assets/` | Brand logo (the teal/orange backpack mark), hero photography & illustration. |
| `preview/` | Small HTML specimen cards that populate the **Design System** tab (type, color, spacing, components). |
| `ui_kits/marketing/` | High-fidelity recreation of the **marketing landing page** (hero, features, comparison, footer). |
| `ui_kits/app/` | High-fidelity recreation of the **authenticated student app** (dashboard, files, top/bottom nav, sidebar, login). |
| `SKILL.md` | Agent-Skill manifest so this folder can be used as a Claude Skill. |

---

## CONTENT FUNDAMENTALS

**Voice — warm, encouraging, student-to-student.** Kibegi speaks like a helpful senior classmate, not a corporation. Copy is motivational and benefit-led, never feature-dumping. It names the real pain (“the WhatsApp note chaos”, *“send me that file again”* messages) and promises calm and order in return.

- **Person:** Addresses the reader as **“you / your”** (“Build *your* study timetable”, “Keep *your* semester easier to manage”). Kibegi refers to itself in the third person (“Kibegi gives students one clean system…”).
- **Casing:** Headlines use **Title Case** and are short, punchy, often imperative: *“Never Lose Notes Again.”*, *“Start Organizing”*, *“Share With Your Class Instantly”*. Eyebrow labels are **UPPERCASE**, widely letter-spaced (“EVERYTHING YOU NEED”, “WHY KIBEGI”). Body copy is sentence case.
- **Tone words:** *organized, clean, secure, reliable, calm, ahead, instantly, in one place, in seconds.* The recurring promise is **one place** vs. *scattered / messy / lost*.
- **Bilingual, always.** Every string has an English and Swahili form, kept side-by-side in code (`enCopy` / `swCopy`, `translations.ts`). Swahili is natural and conversational, not a literal translation, and freely mixes in English study-terms students actually use (*“Pakia notes na past papers”*, *“revision materials”*, *“class library”*). When writing new copy, provide both languages.
- **Emoji:** Used **sparingly and purposefully** — country flags for the language switch (🇹🇿 / 🇺🇸 / 🇬🇧) and a single 👋 in the dashboard greeting (“Good morning, Asha 👋”). Not used decoratively in marketing body copy.
- **Trust microcopy:** Reassurance lines sit under CTAs — *“Takes less than 30 seconds · Free to get started”*, *“Works on mobile and desktop”*, *“Built for students”*.
- **Examples of the vibe:**
  - Hero: *“Never Lose Notes Again.”*
  - Section eyebrow → title: *“WHY KIBEGI” → “Why Students Choose Kibegi”*
  - Comparison framing: **“The messy way”** vs **“The Kibegi way”**
  - Empty states are kind and directive: *“You don’t have any study materials yet — Upload your first file or join a class to start building your digital study space.”*
  - Dashboard greeting adapts to time of day & language (“Good morning” / “Habari za asubuhi”).

---

## VISUAL FOUNDATIONS

**Overall feel:** friendly, soft, modern-academic. Rounded everything, airy spacing, cool off-white canvases warmed by a teal-to-orange brand pairing. It reads like a calm, trustworthy study companion — the opposite of cluttered.

### Color
- **Primary — Kibegi teal `hsl(187 85% 43%)`.** The brand anchor: primary buttons, links, active states, icon chips, focus rings. Lighter teal `(187 85% 55%)` is the gradient companion.
- **Secondary — warm orange `hsl(25 95% 65%)`** (from the backpack logo). Used as a warm accent / blurred glow, occasionally in the hero gradient. Never the main action color.
- **Accent — green `hsl(142 70% 55%)`** for positive/success and the “shared” tone.
- **Neutrals:** cool slate family. Canvas `hsl(210 40% 98%)`, ink `hsl(215 25% 15%)`, secondary text `hsl(215 15% 50%)`, hairline borders `hsl(215 25% 88%)`. Cards are pure white.
- **Destructive** red `hsl(0 72% 51%)`. A full dark mode exists (same hues, lifted lightness on a `215 28% 12%` canvas).
- **Tints are core to the look:** primary at 5–10% opacity fills icon chips, badges and “next up” panels (`bg-primary/10`, `border-primary/15`). Other categorical tints appear as soft 10% washes (violet for classes, emerald for shared).

### Type
- **Poppins** for display/headings (semibold–black, tracking `-0.02em`). Hero & section titles are **font-black**, large (36–60px), tight.
- **Outfit** for body & UI; **Inter** as fallback. Base body is 15px (mobile) → 16px (≥640px), line-height ~1.65.
- **Eyebrows:** tiny uppercase, letter-spacing `0.2em+`, in primary teal, sitting above big headings — a recurring rhythm device.

### Backgrounds
- Pages use a **soft wash**: a faint radial teal glow at top over a slate gradient (`--bg-wash`). No flat white.
- The hero scatters **large, low-opacity blurred color “blobs”** (teal, cyan, orange) behind content — `blur-3xl`, 10–30% opacity.
- Marketing imagery: bright, optimistic **photography of students** (color-blocked backgrounds) and friendly **flat vector illustration** (rounded, warm teal/coral palette). No grain, no black & white — always warm and upbeat.

### Cards & surfaces
- **Oversized soft radii are the signature**: big surface cards use `26–34px` radius (not the 12px shadcn default, which is reserved for buttons/inputs/small chips).
- Cards are **semi-transparent white over the wash** (`bg-card/85`) with **backdrop-blur**, a hairline border at ~70% opacity (`border-border/70`), and a soft `shadow-sm`.
- A heavier **floating shadow** (`0 30px 80px -35px rgba(15,23,42,.35)`) lifts hero imagery and the final CTA panel.
- Nested “mini-preview” panels sit inside cards on a `muted/60` fill with their own rounded border.

### Borders, shadows, transparency
- Borders are **thin and low-contrast** (hairline, often translucent). Buttons are the exception: the `outline` variant uses a **2px primary border** that inverts to filled on hover.
- Shadow system is **slate-tinted, never pure black**, in a soft `sm → xl` ramp.
- **Transparency + blur** are used deliberately: sticky nav (`bg-background/95` + `backdrop-blur`), card surfaces, and overlay sheets. Glassy, light.

### Motion
- **framer-motion** throughout. Entrances are gentle **fade-up** (`opacity 0→1`, `y 18–24px→0`) with **staggered children** (~0.08s) and `easeOut` over 0.4–0.55s. Reveal-on-scroll uses `whileInView` (once).
- **Hover:** cards **lift** (`-translate-y-0.5` to `-translate-y-1`) and deepen shadow; links/icons shift to primary teal; buttons darken (`primary/90`) or grow shadow (hero). Transitions ~200–300ms.
- **Press:** interactive nav items **shrink slightly** (`active:scale-95`). No bouncy/elastic easing — everything is smooth and calm.
- The loading splash gently **pulses the logo** with a spinning ring beneath.

### Layout
- **Mobile-first.** Authenticated app has a **sticky top nav** (hamburger → slide-in sidebar, global search, theme + language toggles, notifications, avatar) and a **fixed bottom tab bar** with a raised circular center action (Upload / Home).
- Content is centered in a `max-w-7xl` container with generous `px-4 → lg:px-8` padding and `gap`-based grids; sections breathe with `py-16 → py-28`.
- Radii, tints and the eyebrow→title→body rhythm repeat across every screen to tie marketing and app together.

---

## ICONOGRAPHY

- **Icon library: [Lucide](https://lucide.dev) (`lucide-react`), used pervasively.** Clean, rounded, **outline / stroke icons** (≈2px stroke, no fills) — they pair naturally with Kibegi’s soft, rounded aesthetic. Standard sizes are `h-4 w-4` (inline/buttons), `h-5 w-5` (nav, chips) and `h-7 w-7` (empty-state hero icons).
- **Usage pattern:** icons frequently sit in a **rounded tint chip** — `rounded-2xl bg-primary/10 p-3 text-primary` — as the visual lead of a card or stat. In nav, muted icons shift to primary teal on hover.
- **Common glyphs:** `FolderOpen`, `FileText`, `CloudUpload`, `Upload`, `Share2`, `Users`, `GraduationCap`, `CalendarDays`, `Clock3`, `ShieldCheck`, `Lock`, `Globe`, `Bell`, `Search`, `Settings`, `LogOut`, `Menu`, `ArrowRight`, `CheckCircle2`, `Sparkles`, `Sun`/`Moon`.
- **This kit links Lucide from CDN** (`https://unpkg.com/lucide@latest`) for the UI-kit recreations — it is the exact library the product uses, so no substitution is needed. Reference icons by name via `data-lucide="folder-open"` then call `lucide.createIcons()`.
- **Logo / app icon:** a **teal rounded-square tile holding an orange backpack** stuffed with notes & a pencil — literally the “school bag.” Outline-drawn in a darker brown stroke, matching the Lucide outline language. Provided as PNG in `assets/kibegi-logo.png` (512px) and `assets/kibegi-logo-192.png`. *(The repo’s `favicon.svg` is only an embedded-image wrapper and imported empty, so the PNG mark is the source of truth here.)*
- **Emoji as icons:** only flags for the language switch (🇹🇿 🇺🇸 🇬🇧) and one 👋 in the dashboard greeting. No other emoji or unicode-glyph icons.
- **Avatars:** circular, with a teal `bg-primary` fallback showing 2-letter initials in white.

---

## Index / manifest

- **`colors_and_type.css`** — import for all tokens & type classes.
- **`assets/`** — `kibegi-logo.png`, `kibegi-logo-192.png`, `hero-students.jpeg` (color-blocked student photography), `hero-education.jpg` (flat vector illustration).
- **`preview/`** — specimen cards (typography, color palettes, semantic colors, radii, shadows, buttons, badges, inputs, cards, icon chips). Rendered in the Design System tab.
- **`ui_kits/marketing/`** — `index.html` + JSX components for the landing page. See its README.
- **`ui_kits/app/`** — `index.html` + JSX components for the authenticated student app. See its README.
- **`SKILL.md`** — use this folder as an Agent Skill.

### Caveats / substitutions
- The brand **logo SVG imported empty** (it was a base64-image wrapper); the PNG renditions are used instead. If you have a true vector logo, drop it into `assets/` and update references.
- Fonts (Outfit / Poppins / Inter) are all on Google Fonts — no substitution needed; they load via CDN.
- Lucide icons load from CDN — matching the product exactly.
