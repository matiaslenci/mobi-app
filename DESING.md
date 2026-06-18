---
version: alpha
name: mobi
description: A clean, calm multi-tenant SaaS CRM for real estate agencies. Operational and trustworthy, premium but approachable — built around a persistent app shell rather than a marketing page.
colors:
  primary: "#181811"
  secondary: "#5b5b4b"
  tertiary: "#e8e8e3"
  neutral: "#fafaf7"
  surface: "#f4f4f0"
  on-surface: "#0c0c09"
  on-primary: "#f4f4f0"
  border: "#e8e8e3"
  muted: "#6f6f60"
  accent: "#000000"
  error: "#b42318"
typography:
  headline-display:
    fontFamily: Geist
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: -1.2px
  headline-md:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: 600
    lineHeight: 40px
    letterSpacing: -0.9px
  headline-sm:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: 600
    lineHeight: 36px
    letterSpacing: -0.75px
  headline-xs:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: 600
    lineHeight: 22px
    letterSpacing: 0px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: 400
    lineHeight: 29.25px
    letterSpacing: 0px
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0px
  label-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0px
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: 0px
  nav-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0px
  nav-lg:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0px
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 14px
  xl: 18px
  full: 9999px
spacing:
  xs: 6px
  sm: 14px
  md: 24px
  lg: 40px
  xl: 56px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    padding: "17px 24px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    padding: "17px 24px"
    height: "48px"
    border: "1px solid {colors.border}"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "16px"
    border: "1px solid {colors.border}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.full}"
    padding: "6px 10px"
  sidebar-item:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    typography: "{typography.nav-md}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  sidebar-item-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.nav-lg}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  table:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    headerTypography: "{typography.label-sm}"
    rowBorder: "1px solid {colors.border}"
  badge:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
---

# CRM Inmobiliario

## Overview
This is an internal SaaS workspace for real estate agencies, not a marketing site. It should feel restrained, trustworthy, and product-focused — a tool an agency uses every day to manage rentals, calculators, listings, and documents. The energy is quiet: a warm off-white canvas, thin borders, and a small number of strong near-black actions. The aesthetic is operational and calm rather than loud or startup-flashy, aimed at owners and agents who want clarity and confidence. The product is multi-tenant: every agency (inmobiliaria) sees only its own data, so the shell must communicate "which agency am I in" clearly and quietly.

## Colors
- *Primary (#181811):* Deep near-black for the strongest emphasis: primary buttons (e.g. "Nueva propiedad"), key headings, active icons. Gives the product a serious, operational tone.
- *Secondary (#5b5b4b):* Warm gray-green for supporting copy, inactive navigation links, and low-emphasis actions. Keeps the interface calm and readable.
- *Neutral (#fafaf7):* Main app background — a slightly warm off-white that makes cards and tables feel integrated rather than floating.
- *Surface (#f4f4f0):* Subtle warm tone for raised/inset elements: input fills, active sidebar item, chips, hover states.
- *On-surface (#0c0c09):* Primary text and icon color for cards, menus, tables, and dense UI areas. Strong contrast while keeping the soft-black character.
- *On-primary (#f4f4f0):* Light text on dark buttons so the primary CTA stays legible and premium.
- *Border (#e8e8e3):* Thin dividers and outlines for cards, panels, table rows, and the sidebar edge. Structure without heavy chrome.
- *Muted (#6f6f60):* Tertiary metadata, helper labels, badges, empty-state copy.
- *Accent (#000000):* Reserved for the sharpest black elements (small icons, tiny highlights) when fully neutral black is needed.
- *Error (#b42318):* Semantic red for validation, destructive states (delete in the rentals table), and alerts. Restrained, never dominant.

## Typography
Geist is the sole typographic voice, reinforcing the modern, technical feel. Page and section titles use 600 weight with tight negative tracking, looking compact and confident. Body text stays regular at 16px with generous line height; labels, table headers, and navigation lean medium weight at 14px for a clean SaaS rhythm.

Preserve minimal casing: no forced uppercase, no decorative label treatment, little to no letter-spacing beyond the slight headline compression. In an app context, lean on the smaller end of the scale — use headline-sm / headline-xs for page titles and panel headers, body-md / body-sm for content and helper text, label-md for buttons and interactive text, label-sm for table headers and badges, and nav-md / nav-lg for sidebar items.

## Layout
The layout is an **app shell**, not a centered landing page. Three regions:

1. **Left sidebar (fixed, ~256px):** Brand/logo at the top, then a single high-emphasis primary action button (e.g. "Nueva propiedad"), then the vertical navigation list. The bottom of the sidebar pins a subscription/trial indicator and a "Configuración" link. The sidebar is collapsible on smaller screens. Use a thin right border to separate it from the content; no shadow.
2. **Top bar:** A sidebar toggle, then an **inmobiliaria switcher** showing the current agency name with a small plan badge (this is the multi-tenant context cue, equivalent to the org name in the reference). On the right: a search field with a "Ctrl K" hint, a "Ayuda" button, and a circular avatar with the user's initials.
3. **Content area:** Generous padding, a page title in headline-sm/xs with a short body-sm subtitle, and the working content below — cards, checklists, or data tables depending on the section.

Whitespace is broad and the rhythm is steady, using the xs–xl scale. Sections breathe with large vertical gaps. Avoid dense grids; prefer clear alignment and predictable vertical spacing. On the welcome/dashboard screen, use the onboarding-checklist pattern from the reference: collapsible grouped steps, each row with a checkbox, title, helper line, and a primary action, plus a progress counter (e.g. "0/5") on the group header.

## Elevation & Depth
Depth comes from contrast, borders, and layered tonal surfaces — not heavy shadows. Cards and tables are light surfaces with a 1px border. The sidebar and top bar are flat, separated only by thin borders. Reserve a single soft, diffused shadow for at most one transient/elevated element (a dropdown menu, dialog, or command palette). Everything else stays flat to keep attention on content and the primary action.

## Shapes
Rounded but disciplined. Interactive elements (buttons, inputs) use a 14px radius — friendly and contemporary, never pill-shaped. Cards use 18px. Sidebar items and small controls use 8px for a tighter, utilitarian feel. Chips, avatars, and status dots use full rounding. Badges (plan, counters) use 4px.

## Components
- **button-primary:** main action per screen — dark fill, light text, 48px height. One per view ideally (e.g. "Nueva propiedad", "Completar datos", "Guardar").
- **button-secondary:** lower-emphasis actions on light backgrounds — quiet, light fill with a 1px border, same size/rhythm.
- **button-link:** tertiary text-only actions, no chrome (e.g. "Ver todo", "Cancelar").
- **card:** warm neutral background, subtle border, 18px radius, moderate padding. Content panels, not floating apps-within-apps. Use for dashboard widgets and grouped onboarding sections.
- **table:** the rentals CRUD and listings use a clean data table — label-sm uppercase-free headers in muted tone, 1px row borders, comfortable row height, right-aligned actions. No zebra striping; rely on borders and whitespace.
- **input:** same rounded geometry as buttons, light surface fill, clear text contrast. Pair with shadcn Form + label-md labels.
- **chip / badge:** soft, small, understated. Chips (rounded-full) for filters/tags; badges (4px) for the plan indicator and step counters. Muted text, never loud color.
- **sidebar-item / sidebar-item-active:** text-first with a thin monochrome leading icon. Inactive items are secondary-colored; the active item gets a surface fill, on-surface text, and medium weight. No underlines.
- **avatar:** circular, initials on surface fill, used in the top bar and user menus.

Navigation stays text-first with minimal iconography and no underline-like decoration. Avoid stacked shadows, gradient chrome, and decorative borders. Keep icons thin and monochrome (lucide-react), matching the operational tone.

## Do's and Don'ts
- Do build around a calm, persistent app shell: fixed sidebar, quiet top bar, spacious content.
- Do make the current inmobiliaria obvious and switchable in the top bar (multi-tenant context).
- Do use Geist everywhere and rely on strong black actions for hierarchy — sparingly.
- Do separate surfaces with light borders and warm off-whites instead of shadows.
- Do keep tables and lists airy: borders and whitespace over heavy chrome.
- Don't introduce bright accent colors that compete with the near-black.
- Don't overuse shadows; one soft shadow for a single elevated/transient element is enough.
- Don't make buttons pill-shaped or ornate; keep the 14px radius discipline.
- Don't crowd content into dense grids; preserve the spacious, editorial rhythm.
- Don't gate the whole sidebar by role visually — show only the sections the current user has permission for (see project AGENT.md).
