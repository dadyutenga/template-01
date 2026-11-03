# Source audit (preliminary)

The supplied directory had no `.git` history. The application is an education and file-sharing UI, not the POS application described in the request. This inventory is a preliminary classification based on file roles and entry-point/import inspection; it is not yet a complete line-by-line audit, and deletion decisions need verification before execution.

## Domain vocabulary (initial, not exhaustive)

Education and collaboration terms found in source include: school, student, lecturer, class, classmate, course, study, examination, exam, schedule, calendar, library, resource, upload, file, sharing, friend, channel, marketplace, listing, seller, registration and storage. The original brand is Kibegi. This list still requires a comprehensive text and asset review before scrubbing.

No test runner or automated test script is configured in `package.json`; standalone HTML and shell test artifacts exist. npm, pnpm and Bun lockfiles are present. No LICENSE file was found.

## Stack and configuration

React 18.3, Vite 5.4, TypeScript 5.8, React Router 6.30, TanStack Query 5, Tailwind 3.4, Radix/shadcn-style components, Recharts 2, React Hook Form and Zod 3. Flat ESLint configuration exists. The application compiler disables strict checks. Vite config includes branding, a PWA and a domain-specific API cache. `main.tsx` suppresses console methods in production. `App.tsx` eagerly imports pages and uses `BrowserRouter`/`Routes`.

## Folder map and data flow

- `src/pages`: application screens and page-local helpers, enumerated below.
- `src/components/ui`: reusable Radix-based primitives; `src/components/layout` and other components combine UI and application-specific navigation.
- `src/contexts`: authentication, language and theme providers; `src/hooks`: toast, mobile breakpoint and page-title hooks.
- `src/services`: domain API operations; `src/lib`: API, storage, translation and utility helpers.
- `src/assets` and `public`: application branding, educational imagery, generated PWA and design-system artifacts.

The entry point mounts App; App nests query, theme, language, auth and tooltip providers around the router. Protected routes consult auth context. Page components call service modules, which use the Axios client and auth storage. State is mostly local React state and contexts; TanStack Query is configured, but use should be checked per page. Tailwind utilities and CSS variables in `src/index.css` implement styling, with additional design-system CSS under `public`.

## Dead code and uncertainty

There are multiple lockfiles, generated `dev-dist` files, helper scripts and a static design-system export. Their reachability and dependency use have not yet been established. No item is asserted dead solely because it is not imported by the entry point. The inventory below is a proposed disposition, not proof of unused code.

## File classification

Every source file is listed individually. KEEP means a reusable candidate requiring compatibility and accessibility checks; GENERALIZE means retain useful patterns while removing coupling; DELETE means domain-specific implementation or asset proposed for removal after extracting reusable behavior. Barrel files follow their page's disposition.

| File | Classification | Rationale |
| --- | --- | --- |
| `src/App.tsx` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/assets/hero-education.jpg` | DELETE | Application-specific imagery. |
| `src/assets/hero-photo.jpeg` | DELETE | Application-specific imagery. |
| `src/components/FilePreview.tsx` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/components/NavLink.tsx` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/components/NavigationIndicator.tsx` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/components/ProtectedRoute.tsx` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/components/QrScanner.tsx` | DELETE | Domain-specific integration or form; extract general patterns first. |
| `src/components/dashboard/DashboardHeader.tsx` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/components/layout/BottomNav.tsx` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/components/layout/DashboardNav.tsx` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/components/layout/InfoLayout.tsx` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/components/layout/Navbar.tsx` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/components/layout/Sidebar.tsx` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/components/library/ShareResourceForm.tsx` | DELETE | Domain-specific integration or form; extract general patterns first. |
| `src/components/ui/accordion.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/alert-dialog.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/alert.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/aspect-ratio.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/avatar.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/badge.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/breadcrumb.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/button.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/calendar.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/card.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/carousel.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/chart.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/checkbox.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/collapsible.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/command.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/context-menu.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/dialog.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/drawer.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/dropdown-menu.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/form.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/hover-card.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/input-otp.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/input.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/label.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/menubar.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/navigation-menu.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/pagination.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/popover.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/progress.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/radio-group.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/resizable.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/scroll-area.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/select.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/separator.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/sheet.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/sidebar.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/skeleton.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/slider.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/sonner.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/switch.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/table.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/tabs.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/textarea.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/toast.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/toaster.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/toggle-group.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/toggle.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/tooltip.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/components/ui/use-toast.ts` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/contexts/AuthContext.tsx` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/contexts/LanguageContext.tsx` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/contexts/ThemeContext.tsx` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/hooks/use-mobile.tsx` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/hooks/use-toast.ts` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/hooks/usePageTitle.ts` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/index.css` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/lib/api.ts` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/lib/authStorage.ts` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/lib/ics.ts` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/lib/media.ts` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/lib/translations.ts` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/lib/utils.ts` | KEEP | Reusable UI primitive or general helper; verify compatibility. |
| `src/main.tsx` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `src/pages/About/About.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/About/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Channel/PublicRegister.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Channel/index.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/ClassDetails/ClassDetails.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/ClassDetails/Contact/Contact.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/ClassDetails/Contact/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/ClassDetails/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Classes/Classes.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Classes/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Dashboard/Dashboard.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Dashboard/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Files/Files.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Files/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/ForgotPassword/ForgotPassword.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/ForgotPassword/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Friends/Friends.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Friends/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/HowToUse/HowToUse.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/HowToUse/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Index/Index.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Index/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Library/index.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Login/Login.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Login/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Marketplace/Marketplace.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Marketplace/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/NotFound/NotFound.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/NotFound/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Notifications/Notifications.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Notifications/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/PasswordResetConfirm/PasswordResetConfirm.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/PasswordResetConfirm/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/PasswordResetRequest/PasswordResetRequest.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/PasswordResetRequest/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/PasswordResetVerify/PasswordResetVerify.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/PasswordResetVerify/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Privacy/Privacy.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Privacy/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Profile/Profile.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Profile/ProfileChangePassword.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Profile/ProfileEdit.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Profile/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Schedule/Schedule.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Schedule/components.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Schedule/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Schedule/schedule-utils.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Settings/Settings.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Settings/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Sharing/Sharing.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Sharing/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Signup/Signup.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Signup/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Storage/Storage.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Storage/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Trash/Trash.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Trash/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Upload/Upload.tsx` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/pages/Upload/index.ts` | GENERALIZE | Screen or helper contains application-specific behavior; extract reusable layout and patterns. |
| `src/services/authService.ts` | DELETE | Application-specific endpoint and data contracts; extract generic client patterns first. |
| `src/services/channelService.ts` | DELETE | Application-specific endpoint and data contracts; extract generic client patterns first. |
| `src/services/classService.ts` | DELETE | Application-specific endpoint and data contracts; extract generic client patterns first. |
| `src/services/classmatesService.ts` | DELETE | Application-specific endpoint and data contracts; extract generic client patterns first. |
| `src/services/fileService.ts` | DELETE | Application-specific endpoint and data contracts; extract generic client patterns first. |
| `src/services/friendService.ts` | DELETE | Application-specific endpoint and data contracts; extract generic client patterns first. |
| `src/services/friendsService.ts` | DELETE | Application-specific endpoint and data contracts; extract generic client patterns first. |
| `src/services/libraryService.ts` | DELETE | Application-specific endpoint and data contracts; extract generic client patterns first. |
| `src/services/marketplaceService.ts` | DELETE | Application-specific endpoint and data contracts; extract generic client patterns first. |
| `src/services/notificationService.ts` | DELETE | Application-specific endpoint and data contracts; extract generic client patterns first. |
| `src/services/scheduleService.ts` | DELETE | Application-specific endpoint and data contracts; extract generic client patterns first. |
| `src/services/searchService.ts` | DELETE | Application-specific endpoint and data contracts; extract generic client patterns first. |
| `src/services/sharingService.ts` | DELETE | Application-specific endpoint and data contracts; extract generic client patterns first. |
| `src/services/storageService.ts` | DELETE | Application-specific endpoint and data contracts; extract generic client patterns first. |
| `src/services/uploadService.ts` | DELETE | Application-specific endpoint and data contracts; extract generic client patterns first. |
| `src/vite-env.d.ts` | GENERALIZE | Useful infrastructure or UI coupled to current app; review and decouple. |
| `public/Kibegi Design System/.thumbnail` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/README.md` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/SKILL.md` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/assets/hero-education.jpg` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/assets/hero-students.jpeg` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/assets/kibegi-logo-192.png` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/assets/kibegi-logo.png` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/colors_and_type.css` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/brand-iconography.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/brand-imagery.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/brand-logo.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/color-gradients.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/color-neutrals.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/color-primary.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/color-secondary-accent.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/color-semantic.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/component-avatars.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/component-badges.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/component-buttons.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/component-card.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/component-icon-chips.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/component-inputs.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/spacing-radii.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/spacing-scale.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/spacing-shadows.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/type-body.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/type-display.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/type-eyebrow.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/preview/type-scale.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/ui_kits/app/README.md` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/ui_kits/app/app-shell.jsx` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/ui_kits/app/index.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/ui_kits/app/kit.css` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/ui_kits/app/screens.jsx` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/ui_kits/app/screens2.jsx` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/ui_kits/marketing/README.md` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/ui_kits/marketing/components.jsx` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/ui_kits/marketing/copy.jsx` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/ui_kits/marketing/index-classic.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/ui_kits/marketing/index.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/ui_kits/marketing/kit.css` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/ui_kits/marketing/premium.css` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/uploads/pasted-1780213930813-0.png` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/uploads/pasted-1780213945641-0.png` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/uploads/pasted-1780213963689-0.png` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/Kibegi Design System/uploads/pasted-1780213980085-0.png` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/_redirects` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/apple-touch-icon.png` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/favicon/apple-touch-icon.png` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/favicon/favicon-96x96.png` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/favicon/favicon.ico` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/favicon/favicon.svg` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/favicon/site.webmanifest` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/favicon/web-app-manifest-192x192.png` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/favicon/web-app-manifest-512x512.png` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/favicon-96x96.png` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/favicon.ico` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/favicon.svg` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/placeholder.svg` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/robots.txt` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/site.webmanifest` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/sitemap.xml` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/test-storage.html` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/web-app-manifest-192x192.png` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |
| `public/web-app-manifest-512x512.png` | DELETE | Existing brand, static export, deployment artifact or application-specific asset; review before removal. |

## Baseline validation

- `npm install`: completed; npm reported 37 vulnerabilities and deprecated dependencies.
- `npm run dev`: started and returned HTTP 200 at the local root; Vite emitted browser-data and Tailwind warnings.
- `npm run build`: completed with outdated browser-data, invalid Tailwind utility, mixed dynamic/static import and large bundle warnings.
- `npm run lint`: failed with 198 errors and 30 warnings, including 141 explicit-any errors. The initial parallel run also encountered a transient Vite config file race; the reported count is from a subsequent standalone run.
- No automated test script is configured.

This audit is incomplete: individual file behavior, full vocabulary, dependency reachability, secrets, and actual dead code must be reviewed before the classification is executed.
