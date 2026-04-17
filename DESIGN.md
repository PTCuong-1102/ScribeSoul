# ScribeSoul — Design System

## 1. Visual Theme & Atmosphere

### Creative North Stars

ScribeSoul operates with **two distinct personas**, each mapping to a theme:

- **Light Mode — "The Digital Curator" (The Silent Manuscript)**: A sanctuary for authors — the interface recedes like fine parchment on a dark oak desk. Warm, tĩnh lặng, mời gọi sáng tạo.
- **Dark Mode — "The Midnight Archivist" (Deep Space Editorial)**: A private library at dusk — quiet, prestigious, deeply focused. The screen is a vast, three-dimensional space where content floats at varying depths.

This design system bridges the gap between the tactile heritage of classical literature and the frictionless efficiency of modern software. We reject the "SaaS-standard" aesthetic of heavy borders and loud primary colors. Instead, we embrace a **"High-End Editorial"** approach where negative space is as functional as the content itself.

**Key Characteristics:**
- Dual-theme system: Warm Paper (Light) / Deep Space Indigo (Dark)
- Serif for creation (Newsreader), Sans-serif for operation (Inter)
- Signature "Violet Glow" for AI-powered features (`#7C3AED`)
- Tonal layering replaces borders — the **No-Line Rule** is strictly enforced
- Glassmorphism for floating menus — frosted glass, not opaque panels
- Intentional asymmetry and expansive margins — never a rigid, cramped grid
- Editorial pacing with generous whitespace — the interface breathes

## 2. Color Palette & Roles

### ⚠️ CRITICAL RULES — Read First

> **THE NO-LINE RULE**: 1px solid borders for sectioning are **STRICTLY PROHIBITED**. Boundaries between sections must be defined by shifting surface tones (e.g., from `surface` to `surface-container-low`). The eye should perceive a change in depth, not a mechanical line.

> **NO PURE BLACK**: `#000000` is **FORBIDDEN** everywhere in the system. It is too harsh. Use ink-toned or indigo-toned darks instead.

> **NO PURE WHITE (Dark Mode)**: `#FFFFFF` is **FORBIDDEN** in dark mode. It vibrates against deep backgrounds and causes eye strain. Use `#E2E8F0` off-white instead.

---

### Light Theme — "The Silent Manuscript"

The palette is rooted in the "Warm Paper" experience. We avoid sterile grays in favor of "Ink" and "Parchment" tones.

#### Surface Hierarchy (Tonal Layering)
| Token | Hex | Role |
|-------|-----|------|
| `surface` | `#fbf9f4` | The base "Desk" — primary page background |
| `surface-container-low` | `#f5f3ee` | Sidebar, navigation — the "side-table" |
| `surface-container-lowest` | `#ffffff` | Active writing sheet — maximum focus |
| `surface-container-high` | `#eae8e3` | Utility panels, secondary tools |
| `surface-variant` | 60% opacity | Floating menus (with backdrop-blur) |

#### Text & Interactive
| Token | Hex | Role |
|-------|-----|------|
| `on-surface` | `#1b1c19` | Primary text — ink-toned, NOT pure black |
| `on-surface-variant` | `#44483d` | Secondary text |
| `primary` | `#4f4e4e` | Buttons, primary actions |
| `on-primary` | `#ffffff` | Text on primary buttons |
| `secondary` | `#712ae2` | AI features accent start |
| `secondary-container` | `#8a4cfc` | AI features accent end |
| `outline-variant` | at 15% opacity | Ghost borders (fallback only) |

---

### Dark Theme — "Deep Space Editorial"

The palette rejects the harshness of pure black in favor of a layered, "Deep Space" indigo. This maintains atmospheric pressure and sophistication.

#### Surface Hierarchy (Tonal Layering)
| Token | Hex | Role |
|-------|-----|------|
| `surface` | `#0b1326` | Cosmic floor — the canvas |
| `surface-container-lowest` | `#060e20` | Sunken utility areas, footers |
| `surface-container-low` | `#131b2e` | Sidebar, secondary containers |
| `surface-container` | `#171f33` | Primary card/content container |
| `surface-container-highest` | `#2d3449` | Floating modals, active popovers |

#### Text & Interactive
| Token | Hex | Role |
|-------|-----|------|
| `on-surface` | `#E2E8F0` | Primary text — off-white, **NOT** `#FFFFFF` |
| `on-surface-variant` | `#94a3b8` | Secondary/muted text |
| `primary` | `#d2bbff` | Luminous violet — links, emphasis |
| `primary-container` | `#7c3aed` | High-impact brand moments, active states |
| `outline` | `#958da1` | Ghost button borders |
| `outline-variant` | `#4a4455` at 15% opacity | Ghost border fallback |

---

### AI Accent — "The Violet Glow"
- For AI-enhanced features or primary CTAs, use a **subtle radial gradient** from `secondary` (`#712ae2`) to `secondary-container` (`#8a4cfc`) at 45°.
- When AI is active, apply a **soft-focus outer glow**: `#7C3AED` with 20px blur at low opacity. It should feel like subtle energy, not a technical tool.
- In dark mode, use gradient from `primary` (`#d2bbff`) to `primary-container` (`#7c3aed`) for hero CTAs.

### Semantic Colors
| Token | Hex | Role |
|-------|-----|------|
| `error` | `#b53333` | Error states |
| `success` | `#2d8a4e` | Success states |
| `warning` | `#c68a19` | Warning states |
| `info` | `#3898ec` | Information, focus rings |

## 3. Typography Rules — "The Literary Spine"

We employ a high-contrast typographic scale to differentiate between the *act of creation* and the *act of management*.

### Font Families
- **Display & Headline (Creation)**: `Newsreader`, with fallback: `Georgia, serif`
- **UI & Labels (Operation)**: `Inter`, with fallback: `system-ui, -apple-system, sans-serif`

*Import via Google Fonts: `Newsreader:ital,wght@0,400;0,500;0,600;1,400;1,500` and `Inter:wght@400;500;600`*

### Hierarchy

| Token | Font | Size | Weight | Line Height | Usage |
|-------|------|------|--------|-------------|-------|
| `display-lg` | Newsreader | 3.5rem (56px) | 400 | 1.10 | Hero headlines, splash screens |
| `display-md` | Newsreader | 2.75rem (44px) | 400 | 1.15 | Page-level titles |
| `headline-md` | Newsreader | 1.75rem (28px) | 500 | 1.25 | Section headings |
| `headline-sm` | Newsreader | 1.375rem (22px) | 500 | 1.30 | Subsection headings |
| `title-md` | Inter | 1.125rem (18px) | 500 | 1.40 | Card titles, feature names |
| `title-sm` | Inter | 1rem (16px) | 500 | 1.40 | Small titles |
| `body-lg` (Editor) | Newsreader | 1.125rem (18px) | 400 | 1.70 | Editor body text — extra breathing room |
| `body-md` | Inter | 1rem (16px) | 400 | 1.60 | Standard body text |
| `body-sm` | Inter | 0.875rem (14px) | 400 | 1.50 | Compact body text |
| `label-lg` | Inter | 0.875rem (14px) | 600 | 1.25 | Primary labels, button text |
| `label-md` | Inter | 0.75rem (12px) | 600 | 1.25 | Metadata, badges |
| `label-sm` | Inter | 0.6875rem (11px) | 500 | 1.20 | Overline, small labels |

### Core Principles
- **Serif for creation, Sans-serif for operation**: Newsreader is used for any text the user *writes* or *reads as content*. Inter is used for anything the user *clicks* or uses to *navigate*.
- **Editor uses `body-lg`** with line-height 1.7 — this ensures breathability for long-form composition.
- **Display text uses light weight (400)** — the elegant letterforms of Newsreader carry authority without needing bold.
- **Labels use semi-bold (600)** — small text needs extra weight to maintain readability.
- **Use "ink" tones for text** — pure black (`#000`) is too harsh for the "Warm Paper" philosophy. Use `on-surface` tokens instead.

## 4. Component Stylings

### Buttons

**Primary (Light)**
- Background: `primary` (`#4f4e4e`)
- Text: `on-primary` (white)
- Padding: 10px 20px
- Radius: `md` (0.375rem / 6px)
- No border. No shadow.

**Primary (Dark)**
- Background: Gradient 45° from `primary` (`#d2bbff`) to `primary-container` (`#7c3aed`)
- Text: `on-primary` (`#3f008e`)
- Radius: `xl` (3rem) — pill-shaped for organic feel
- No border.

**Secondary / Ghost**
- Background: none (transparent)
- Text: `on-surface`
- Border: `outline-variant` ghost border at 15% opacity — the "Ghost Border"
- Radius: `md` (6px) light / `xl` (3rem) dark

**Tertiary / AI**
- Background: subtle gradient from `secondary-fixed-dim` to `secondary-fixed`
- Used for AI-related CTAs — "Ask Soul Assistant", "Analyze Prose"
- The Violet Glow button

### Cards & Containers

> ⚠️ **NO BORDERS**: Do not use `1px solid` borders on cards. Use tonal layering.

**Light Theme:**
- Background: `surface-container-lowest` (`#ffffff`) on `surface` (`#fbf9f4`) background
- Radius: `md` (6px) for standard, `lg` (12px) for featured
- Shadow: `0px 10px 30px rgba(27, 28, 25, 0.06)` — tinted with `on-surface`, never pure black

**Dark Theme:**
- Background: `surface-container` (`#171f33`) on `surface` (`#0b1326`)
- Radius: `lg` (2rem / 32px) — lack of border makes content feel integrated into Deep Space
- Shadow: 32px blur, 0% spread, 8% opacity using `#060e20` — never pure black

**The "Ghost Border" Fallback:** If a container lacks enough contrast, use `outline-variant` at 15% opacity. It should be felt, not seen.

### Input Fields (Editor Context)
- **Style**: Borderless. Underlines are **prohibited**.
- **Focus (Light)**: Subtle shift in background to `surface-container-highest`
- **Focus (Dark)**: 2px "Glow" using `primary` at 30% opacity with 4px blur
- **Caret**: Violet `secondary` color in both themes

### Floating Menus (Bubble/Slash)

> ⚠️ **GLASSMORPHISM REQUIRED** for all floating menus.

- **Style**: `surface-variant` at 60% opacity + `backdrop-filter: blur(12px)`
- **Radius**: `xl` (0.75rem / 12px)
- **Items**: Use `surface-bright` hover state with no hard edges
- In dark mode: "Frosted Obsidian" effect — semi-transparent `surface-container` with blur

### Lists & Panels
- **NEVER** use line dividers between list items
- Use `1.5rem` vertical whitespace OR a 1-step shift in surface container color
- **Resizable panel handle**: A single centered `outline` dot, not a full-length line

### Signature Components

**Soul Assistant Drawer (Cmd+J)**
- Right-side drawer, does not cover editor content
- Background: `surface-container-low`
- AI responses use Newsreader italic
- Citations rendered as clickable chips with `secondary` accent

**Knowledge Web (Dashboard)**
- Network graph visualization
- Nodes color-coded by document type
- Active entities: `primary-container` (`#7c3aed`)
- References: `outline-variant`
- AI analysis indicator with pulsing violet dot

**The "Archivist Scroll" (Dark Mode Only)**
- Vertical progress indicator on far left/right margin
- 1px `primary` line that grows as user reads
- Sits in the "bleed" of the margin — purely editorial

## 5. Layout Principles

### Spacing System
- Base unit: 4px
- Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 80px, 120px
- Button padding: 10px 20px (light) / 12px 24px (dark)
- Card internal padding: 24–32px
- Section vertical spacing: 80px+ on desktop — editorial pacing

### Grid & Container
- Max editor width: **800px** (centered) — focused writing area
- Dashboard: Sidebar (220px) + Main content (fluid)
- Document Editor: 3-column layout — Sidebar (220px) + Editor (max 800px) + AI Drawer (320px)
- AI Chat: Sidebar (280px history) + Chat area (fluid)

### Whitespace Philosophy
- **Embrace asymmetrical margins**: A document should feel like it has room to grow
- **Editorial pacing**: Each section breathes — generous top/bottom margins create natural reading pauses
- **Serif-driven rhythm**: Newsreader headings demand more whitespace than sans-serif designs
- **Content island approach**: Allow content to float, not fill

### Border Radius Scale
| Token | Size | Usage |
|-------|------|-------|
| `sm` | 4px | Inline elements, tags |
| `md` | 6px (0.375rem) | Standard buttons, light theme cards |
| `lg` | 12px | Featured containers, inputs |
| `xl` | 0.75rem (12px) | Floating menus (glassmorphic) |
| `2xl` | 2rem (32px) | Dark theme cards — organic feel |
| `full` | 3rem (48px) | Pill buttons (dark theme) |

## 6. Depth & Elevation

In this design system, elevation is a **whisper, not a shout**.

### Light Theme Elevation
| Level | Treatment | Use |
|-------|-----------|-----|
| Ground | No shadow | Background surface |
| Raised | Move one step down container hierarchy | Standard cards |
| Floating | `0px 10px 30px rgba(27, 28, 25, 0.06)` | Slash menu, bubble menu |
| Glassmorphic | `surface-variant` 60% + `backdrop-blur(12px)` | All floating menus |

### Dark Theme Elevation
| Level | Treatment | Use |
|-------|-----------|-----|
| Ground | `surface` (`#0b1326`) | Background |
| Raised | Shift from `surface` to `surface-container-low` | Sidebar, panels |
| Floating | `#060e20` shadow, 32px blur, 8% opacity | Dropdowns, popovers |
| Glassmorphic | Semi-transparent `surface-container` + `backdrop-blur(12px)` | "Frosted Obsidian" menus |

### Shadow Rules
- **Light mode shadow color**: Must be tinted with `on-surface`, **never pure black**
- **Dark mode shadow color**: Must use `surface-container-lowest` (`#060e20`), **never pure black**
- If a shadow looks like the element is "hovering" more than 2mm off the page, it's too heavy
- The "Ghost Border" fallback: `outline-variant` at 15% opacity — to be felt, not seen

## 7. Do's and Don'ts

### ✅ Do
- **Do** use asymmetrical margins — a document should feel like it has room to grow
- **Do** use "ink" tones for text — pure black is too harsh for the "Warm Paper" philosophy
- **Do** use Newsreader (serif) for any text the user *writes*, and Inter (sans-serif) for anything the user *clicks*
- **Do** use tonal transitions to define content blocks — shift background colors, not add borders
- **Do** let Newsreader do the heavy lifting for brand personality
- **Do** use `body-lg` with line-height 1.7 in the editor for long-form readability
- **Do** use the Violet Glow (`#7C3AED`, 20px blur) when AI features are active
- **Do** embrace negative space — allow headlines to breathe, give content wide margins (80px+)
- **Do** use glassmorphism for all floating menus — `backdrop-filter: blur(12px)`

### ❌ Don't
- **Don't** use 1px solid borders to define sections — this is the **No-Line Rule**, strictly enforced
- **Don't** use Pure Black (`#000000`) anywhere — use ink-toned darks (`#1b1c19` light / `#0b1326` dark)
- **Don't** use Pure White (`#FFFFFF`) in dark mode — use `#E2E8F0` off-white instead
- **Don't** use drop shadows with high opacity — if it "hovers" more than 2mm, it's too heavy
- **Don't** use 100% opaque borders — they interrupt flow and break the serene academic vibe
- **Don't** use high-contrast dark modes — dark mode should feel like a dimly lit library
- **Don't** crowd the UI — if it feels "busy," remove a container and use whitespace instead
- **Don't** use standard Material shadows on deep blue surfaces — they look muddy
- **Don't** reduce editor line-height below 1.6 — generous spacing supports the editorial personality
- **Don't** use sans-serif for document titles or content headings — Newsreader serif is the literary voice

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <640px | Single column, sidebar hidden, compact typography |
| Tablet | 640–1024px | 2-column, sidebar collapsible, AI drawer hidden |
| Desktop | 1024–1440px | Full 3-column editor layout |
| Wide | 1440px+ | Expanded margins, max content width maintained |

### Editor Responsive Strategy
- **Desktop**: Sidebar (220px) + Editor (max 800px, centered) + AI Drawer (320px)
- **Tablet**: Sidebar overlay + Editor full-width + AI Drawer overlay (Cmd+J)
- **Mobile**: Editor only, bottom nav, swipe for sidebar/AI

### Touch Targets
- Minimum: 44x44px
- Buttons: generous padding (10px+ vertical)
- Slash menu items: full-width touch targets

## 9. AI Integration Styling

### The Violet Glow
When AI features are active (editing assistance, brainstorming), the interface introduces a signature visual:

```css
/* Violet Glow — apply to active AI elements */
.ai-active {
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.15);
}

/* AI text block highlight */
.ai-generated {
  border-left: 2px solid #7c3aed;
  padding-left: 16px;
}

/* Inline AI suggestion hover */
.ai-suggestion:hover {
  background: linear-gradient(45deg, 
    rgba(113, 42, 226, 0.08), 
    rgba(138, 76, 252, 0.08)
  );
}
```

- The glow is NOT a solid block of purple — it's a soft-focus outer glow
- It should feel like subtle energy, not a technical indicator
- Apply to: AI drawer border, inline suggestion blocks, chat message bubbles from AI

### Citation Chips
- Background: `secondary` at 10% opacity
- Text: `secondary` / `primary` (dark mode)
- Icon: link icon in `secondary`
- Radius: `full` (pill shape)
- On click: navigate to source document

## 10. Agent Prompt Guide

### Quick Color Reference — Light Theme
| Role | Token | Hex |
|------|-------|-----|
| Page Background | `surface` | `#fbf9f4` |
| Card Surface | `surface-container-lowest` | `#ffffff` |
| Sidebar Background | `surface-container-low` | `#f5f3ee` |
| Primary Text | `on-surface` | `#1b1c19` |
| Secondary Text | `on-surface-variant` | `#44483d` |
| Primary Button | `primary` | `#4f4e4e` |
| AI Accent | `secondary` | `#712ae2` |

### Quick Color Reference — Dark Theme
| Role | Token | Hex |
|------|-------|-----|
| Page Background | `surface` | `#0b1326` |
| Card Surface | `surface-container` | `#171f33` |
| Sidebar Background | `surface-container-low` | `#131b2e` |
| Primary Text | `on-surface` | `#E2E8F0` |
| Secondary Text | `on-surface-variant` | `#94a3b8` |
| Primary Accent | `primary` | `#d2bbff` |
| AI Active | `primary-container` | `#7c3aed` |

### Rules Checklist for Every Component
1. ❌ No `border: 1px solid` for sectioning — use tonal shift instead
2. ❌ No `#000000` — use `on-surface` token
3. ❌ No `#FFFFFF` text in dark mode — use `#E2E8F0`
4. ✅ Serif (Newsreader) for content, Sans (Inter) for UI
5. ✅ Glassmorphism for floating elements — `backdrop-filter: blur(12px)`
6. ✅ Violet Glow for AI features — `#7C3AED` soft glow
7. ✅ Editor body: `body-lg` Newsreader 18px, line-height 1.7
8. ✅ Asymmetric margins, generous whitespace (80px+)
