---
name: StaySync
description: A calm, clear workspace for everyday room operations.
colors:
  blue: "#2563d9"
  deep-blue: "#174ea6"
  pale-blue: "#edf3ff"
  orange: "#ed7622"
  orange-pale: "#fff2e7"
  ink: "#1c2b43"
  muted-text: "#64758d"
  faint-text: "#8b98aa"
  ground: "#f5f8fc"
  surface: "#ffffff"
  divider: "#e3eaf3"
  strong-divider: "#d5dfeb"
  table-header: "#f4f7fb"
  green: "#16835c"
  green-pale: "#e8f6ef"
  red: "#bf4545"
  red-pale: "#fff0ef"
  amber: "#a96710"
  amber-pale: "#fff5dc"
typography:
  headline:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "25px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 680
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    letterSpacing: "0.04em"
rounded:
  control: "6px"
  panel: "8px"
  pill: "12px"
  sheet: "16px"
spacing:
  tight: "4px"
  small: "8px"
  medium: "12px"
  comfortable: "16px"
  section: "24px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "36px"
  button-priority:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "36px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "#365170"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "36px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "36px"
  navigation-active:
    backgroundColor: "{colors.pale-blue}"
    textColor: "{colors.deep-blue}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "37px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "15px"
---

# Design System: StaySync

## Overview

**Creative North Star: "StaySync"**

StaySync's landlord workspace should feel friendly, light, and modern while giving daily work a calm, predictable rhythm. The same neutral system sans stack serves every screen; clear labels, compact rows, and repeatable table alignment carry the hierarchy instead of decorative display lettering.

Blue identifies navigation and ordinary primary actions, pale blue holds selected or contextual data, and orange marks a high-priority next step. White surfaces over a cool light ground keep long data views easy to scan. Green, amber, and red stay tied to operational status. Borders and tonal shifts separate most surfaces; a soft shadow appears only on layers that move above the page, such as mobile navigation and the room detail sheet.

**Key Characteristics:**
- Calm blue-and-white surfaces for information-dense work.
- Room, tenant, latest reading, invoice balance, and next action stay connected.
- Compact labels and aligned rows make repeated tasks easy to scan.
- Orange is reserved for a small number of priority actions.

## Colors

The palette pairs restrained blue controls with pale cool surfaces, navy text, and a limited orange accent; semantic colors mark saved, cautionary, and blocked states.

### Primary
- **Clear Work Blue:** navigation, links, primary actions, and chart emphasis.
- **Deep Navigation Blue:** brand text and selected navigation emphasis.
- **Pale Selection Blue:** selected room rows and contextual surfaces.

### Secondary
- **Quiet Priority Orange:** time-sensitive actions and debt emphasis.
- **Soft Priority Tint:** low-area orange backgrounds around the same action family.

### Neutral
- **Room Ink:** main headings, room identifiers, and key values.
- **Muted Slate:** supporting copy and table content.
- **Faint Slate:** tertiary labels.
- **Cool Workspace Ground:** the page canvas behind white panels.
- **White Surface:** forms, cards, navigation, and table bodies.
- **Fine Divider:** panel edges and row separators.
- **Strong Divider:** control edges and focused boundaries.
- **Quiet Table Header:** header bands behind column labels.

### Semantic
- **Confirm Green / Soft Confirm:** successful and active states.
- **Error Red / Soft Error:** failed or overdue states.
- **Caution Amber / Soft Caution:** waiting and attention states.

**The Quiet Priority Rule.** Keep orange for the next action that deserves attention; blue remains the everyday navigation and action color.

## Typography

**Display Font:** No separate display family; page titles use the same UI sans stack as the rest of the workspace.
**Body Font:** `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
**Label/Mono Font:** No separate label or monospaced family.

**Character:** Neutral, legible, and compact. Weight and size shifts make the hierarchy clear without introducing a second type voice.

### Hierarchy
- **Headline** (700, 25px desktop / 22px narrow, 1.2 line-height): page names and primary task titles.
- **Title** (650–700, 13–16px): panel headings and room detail names.
- **Body** (400, 14px base): normal interface copy; helper text is usually 10–12px.
- **Label** (650–700, 9–11px, occasional 0.04em tracking): filters, table columns, and metadata.

**The Scan Hierarchy Rule.** Use size and weight to distinguish the task, panel, and supporting label; do not add a decorative display face.

## Layout

The desktop workspace uses a fixed 238px left navigation, a 68px utility bar, and centered content capped at 1580px. The content begins with 29px side padding, dropping to 21px at narrower desktop widths. Data pages keep their filters above a bordered work surface; tables align labels and values in compact rows, while panels use consistent internal spacing.

At 760px and below, the sidebar becomes a slide-in menu, the utility bar drops to 56px, and page content uses 13px horizontal padding. Dashboard room rows become compact cards that show the room, tenant, latest utility reading, unpaid invoice count, and balance without horizontal table scrolling. Selecting a card opens a bottom detail sheet with a close control, Escape dismissal, and focus return to the selected row.

**The Room-First Rule.** Keep the room identity and the details needed for its next action together; make mobile cards summarize the same operational facts as the desktop row.

## Elevation & Depth

Default panels are flat, separated by a thin border and a quiet surface change. Soft shadows are reserved for transient layers: the mobile sidebar uses a lateral shadow, and the mobile room sheet lifts from the bottom over a dim scrim. The interface honors reduced-motion preferences by shortening animation and transition durations.

## Shapes

Controls use gently rounded 6px corners; panels use 8px corners, and compact status badges use a pill shape. Inputs and buttons share a 36px minimum height. The mobile detail sheet rounds its two upper corners and keeps a safe-area inset at the bottom. Thin full borders define panel edges; do not pair those borders with a permanent wide card shadow.

## Components

### Buttons
- **Shape:** compact rounded controls (6px radius, 36px minimum height, 12px horizontal padding).
- **Primary:** blue fill with white text for ordinary save, view, or continue actions.
- **Priority:** orange fill for the next action that needs extra attention.
- **Secondary / Ghost:** white or transparent fill with a restrained blue-gray label and border.
- **Hover / Focus:** shift the fill or border slightly; keep a visible focus outline and respect reduced motion.

### Chips
- **Style:** small status pills with semantic text and a soft tinted surface.
- **State:** blue for general workflow, green for success, amber for waiting, red for overdue or blocked, gray for neutral.

### Cards / Containers
- **Corner Style:** quiet 8px panel corners.
- **Background:** white over the cool page ground.
- **Shadow Strategy:** flat at rest; use a soft shadow only for floating navigation or the mobile detail sheet.
- **Border:** a single fine outline with row separators inside data tables.
- **Internal Padding:** 12–16px for the work surface and 15px for detail content.

### Inputs / Fields
- **Style:** white surface, 1px cool border, 6px corners, 36px minimum height, and 10px horizontal padding.
- **Focus:** blue border with a pale blue outline.
- **Error / Disabled:** red-tinted validation message or visibly reduced control opacity.

### Navigation
- **Style:** fixed white desktop rail with 37px rows, lucide line icons, and a pale blue active row.
- **Mobile:** menu opens as a left drawer behind a scrim; route selection closes the drawer.

### Room Control Row and Detail Sheet
Desktop rows keep room, tenant, latest reading, unpaid invoice count, and balance in one scan line. On mobile, a summary card shows those same facts; selecting it opens a detail sheet with invoice state and direct links to the room's invoice and meter history.

## Do's and Don'ts

### Do:
- **Do** keep room, tenant, meter reading, invoice balance, and next action connected in the control desk.
- **Do** reserve orange for a clearly prioritized action and use blue for everyday navigation and primary controls.
- **Do** label each semantic status in text as well as color.
- **Do** keep the mobile room summary readable without horizontal scrolling.
- **Do** preserve visible keyboard focus and reduced-motion behavior.

### Don't:
- **Don't** present invented occupancy, payment, or debt figures as live data.
- **Don't** add permanent shadows to flat panels; reserve elevation for floating layers.
- **Don't** rely on color alone to explain an invoice or room state.
- **Don't** make mobile users pan through a wide dashboard table to identify the next task.
