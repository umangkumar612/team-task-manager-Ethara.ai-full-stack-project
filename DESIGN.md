# Design Brief — Team Task Manager

## Purpose & Tone
Professional productivity app. Refined minimalism with functional sophistication. Transparent, predictable tool for efficient team collaboration. Zero decoration—clarity first.

## Palette

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| Primary | `0.55 0.16 258` (Blue-Teal) | `0.68 0.16 258` | Actions, buttons, links |
| Secondary | `0.92 0 0` (Neutral) | `0.2 0 0` | Structure, borders |
| Accent | `0.68 0.14 86` (Amber) | `0.78 0.14 86` | Highlights, notifications |
| Destructive | `0.55 0.22 25` (Red) | `0.62 0.19 22` | Delete, overdue tasks |
| Success | `0.65 0.18 142` (Green) | `0.72 0.18 142` | Completed tasks |

## Typography
- **Display**: Space Grotesk (bold, geometric, professional tech)
- **Body**: Figtree (clean, readable, screen-optimized)
- **Mono**: JetBrains Mono (technical content, task IDs)

## Shape Language
- Border radius: 8px (balanced, not overly rounded)
- Strict grid-based spacing (8px increments)
- Minimal shadows (only for elevation, never decorative)
- Flat cards with subtle border (no gradients)

## Structural Zones

| Zone | Background | Border | Shadow | Purpose |
|------|------------|--------|--------|---------|
| Header/Sidebar | Dark (`0.22 0`) | `sidebar-border` | None | Navigation, primary actions |
| Content | Light (`0.99 0`) / Dark (`0.12 0`) | `border` | None | Main information area |
| Cards | `card` | `border` | `sm` | Projects, tasks, team info |
| Input Fields | `input` | `border` | None | Form elements |
| Footer | `muted/40` | `border` | None | Secondary info, pagination |

## Component Patterns
- **Task Cards**: Headline, description, assignee badge, status badge (color-coded), due date, actions
- **Status Badges**: Inline semantic colors (Complete: green, Pending: amber, Overdue: red)
- **Team Badges**: Admin (blue), Member (slate)
- **Dashboard Widgets**: Stats cards with metric + count + trend indicator
- **Data Tables**: High-contrast rows, subtle hover, compact density

## Motion
- Transitions: `transition-smooth` (0.3s ease)
- No entrance animations; focus on interaction feedback
- Hover states: border color shift, text color lift

## Signature Detail
Semantic status indicators inline with tasks — color badges eliminate need for separate status columns, reducing visual clutter while maintaining clarity. Sidebar dark treatment creates depth and separates navigation from content zones.

## Constraints
- **No**: Gradients, decorative effects, rounded extremes, full-page backgrounds, generic colors
- **Yes**: Token-first design, high information density, grid-based spacing, semantic colors, consistent radius

