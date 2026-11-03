# Kibegi — Student App UI Kit

A high-fidelity, interactive recreation of the **authenticated Kibegi student workspace** (`kibegi-UI` → `src/pages/Dashboard`, `src/pages/Files`, `src/components/layout/*`). Open `index.html` and click around.

## Interactive flow
The prototype opens on the **Dashboard**. From there:
- **Bottom tab bar** switches between Classes · Schedule · **Home** (raised center button) · Marketplace · Profile.
- **Hamburger (top-left)** opens the slide-in **sidebar** (menu + information links + logout).
- **Stat cards / "View All" / "Open"** buttons navigate to Files and Classes screens.
- **🇹🇿 / 🇺🇸 toggle** swaps the whole UI between English and Swahili.
- **Theme button** toggles the icon (light/dark).
- **Logout** (in the sidebar) reveals the **Login** screen; sign in to return.

## What's here
- **`index.html`** — the app shell + screen router (`tab` state) wiring everything together.
- **`app-shell.jsx`**:
  - `AppTopNav` — sticky nav: hamburger + Kibegi/role, global search, theme + language toggles, notification bell (with count), avatar.
  - `AppSidebar` — slide-in sheet with user header, Menu links, Information links, logout.
  - `AppBottomNav` — fixed mobile tab bar with a raised circular center action.
- **`screens.jsx`**:
  - `LoginScreen` — centered auth card (email, password w/ forgot link, sign in, sign up).
  - `DashboardScreen` — greeting card + quick-action bar, "Today" + "Timetable" cards, three gradient stat cards, Recent Files + Your Classes lists.
- **`screens2.jsx`**:
  - `FilesScreen` — Library header, filter tabs (All / My Uploads / Shared), file-card grid with ext badges + Open/Share/Download.
  - `ClassesScreen` — class community cards with member/file stats and class codes.
  - `PlaceholderScreen` — branded empty state for Schedule, Upload, Marketplace, Profile, Notifications, Friends, Sharing, Trash, Settings.
- **`kit.css`** — design tokens + component classes (nav, cards, buttons, bottom nav, sidebar sheet, stat cards).

## Conventions
- Icons: **Lucide** via CDN (`data-lucide`, `lucide.createIcons()` re-run after each render in a `useEffect`).
- Mobile-first layout rendered in a `1120px` container; bottom nav fixed; entrance uses a subtle slide-up.
- Cosmetic recreation — content is realistic sample data (Tanzanian university context), no real API/auth.
- Assets referenced from `../../assets/`.

## Source
https://github.com/troubleman96/kibegi-UI · `src/pages/Dashboard/Dashboard.tsx`, `src/pages/Files/Files.tsx`, `src/pages/Login/Login.tsx`, `src/components/layout/{DashboardNav,Sidebar,BottomNav}.tsx`
