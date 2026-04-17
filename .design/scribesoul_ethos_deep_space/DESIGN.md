# Design System: Deep Space Editorial

## 1. Overview & Creative North Star: "The Midnight Archivist"
The Creative North Star for this design system is **The Midnight Archivist**. This vision moves away from the clinical, flat "SaaS" look and toward a high-end, digital-literary experience. It is designed to feel like a private library at dusk—quiet, prestigious, and deeply focused. 

To break the "template" look, we avoid rigid, symmetrical grids. Instead, we utilize **intentional asymmetry** and **tonal layering**. This system treats the screen not as a flat surface, but as a vast, three-dimensional space where content floats at varying depths. We prioritize the "Scribe" through Newsreader’s elegant serifs, framed by the "Space" of our deep indigo-blue foundations.

---

## 2. Colors: Tonal Depth vs. Flat Borders
Our palette rejects the harshness of pure black (#000000) in favor of a layered, "Deep Space" indigo. This maintains a sense of atmospheric pressure and sophistication.

### The Foundation
*   **Surface / Background (`#0b1326`):** Our cosmic floor. All elements emerge from this ink-blue depth.
*   **Primary Accent (`#d2bbff`):** A luminous, desaturated violet that ensures AAA accessibility against dark backgrounds while maintaining the signature brand soul.
*   **Primary Container (`#7c3aed`):** Used for high-impact brand moments and active states.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. 
Boundaries must be created through **Tonal Transitions**. To separate a sidebar from a main feed, use a shift from `surface` to `surface-container-low`. The eye should perceive a change in depth, not a mechanical line.

### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of fine, semi-transparent paper.
1.  **Lowest Tier:** `surface-container-lowest` (#060e20) – Use for "sunken" utility areas like footers.
2.  **Base Tier:** `surface` (#0b1326) – The canvas.
3.  **Raised Tier:** `surface-container` (#171f33) – The primary card or content container.
4.  **Highest Tier:** `surface-container-highest` (#2d3449) – Used for floating modals or active popovers.

### The "Glass & Gradient" Rule
To add "soul" to the digital interface, use a subtle **linear gradient** (45deg) from `primary` to `primary-container` for hero CTAs. For floating navigation, apply a `backdrop-blur` of 12px to a semi-transparent `surface-container` color to achieve a premium "frosted obsidian" effect.

---

## 3. Typography: The Literary Voice
We lead with **Newsreader**, a serif that evokes the prestige of editorial publishing. By pairing it with **Inter** for utility, we create a clear distinction between "Reading" and "Operating."

*   **Display (L/M/S):** Newsreader. Use these for poetic, asymmetric hero headers. High tracking (-0.02em) and tight line-heights.
*   **Headline & Title:** Newsreader. The primary "voice" of the page.
*   **Body (L/M/S):** Newsreader. Use `#E2E8F0` (on-surface) to reduce eye strain. The slight off-white color prevents the "vibration" common in white-on-black text.
*   **Labels (M/S):** Inter. Reserved for metadata, buttons, and micro-copy. This provides a functional contrast to the literary body text.

---

## 4. Elevation & Depth: Tonal Layering
In this system, elevation is conveyed through color luminosity, not drop shadows.

*   **The Layering Principle:** Place a `surface-container-low` card on a `surface` background. The subtle shift from `#131b2e` to `#0b1326` provides enough contrast to signify a new layer without visual clutter.
*   **Ambient Shadows:** If a component must "float" (e.g., a dropdown), use a shadow with a 32px blur, 0% spread, and 8% opacity. The shadow color should be `#060e20` (the lowest surface color), never pure black.
*   **The "Ghost Border" Fallback:** If a container lacks enough contrast on a specific background, use a "Ghost Border": `outline-variant` (#4a4455) at 15% opacity. It should be felt, not seen.

---

## 5. Components: Minimalist Implementation

### Buttons
*   **Primary:** A soft gradient from `primary` to `primary-container`. Typography is `label-md` (Inter) in `on-primary` (#3f008e).
*   **Secondary:** No fill. A "Ghost Border" of `outline` (#958da1). 
*   **Rounding:** All buttons must follow the **xl (3rem)** rounding scale for a pill-shaped, organic feel that contrasts with the sharp serif typography.

### Cards & Lists
*   **Forbid Dividers:** Do not use lines to separate list items. Use 16px or 24px of vertical whitespace.
*   **Card Styling:** Use `surface-container` with **lg (2rem)** corner radius. The lack of a border makes the content feel integrated into the "Deep Space" environment.

### Inputs & Fields
*   **State:** Background should be `surface-container-highest`.
*   **Focus:** Instead of a thick border, use a 2px "Glow" using the `primary` color at 30% opacity with a 4px blur.

### Signature Component: The "Archivist Scroll"
A custom component for this system: A vertical progress indicator on the far left or right margin using a 1px `primary` line that grows as the user reads. It sits in the "bleed" of the margin, emphasizing the editorial nature of the experience.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Negative Space:** Allow headlines to breathe. Give content wide margins (80px+ on desktop).
*   **Use Tonal Transitions:** Shift background colors to define content blocks.
*   **Prioritize Newsreader:** Let the serif font do the heavy lifting for the brand's personality.

### Don’t:
*   **Don't use 1px solid borders:** This shatters the "Deep Space" immersion.
*   **Don't use Pure White (#FFFFFF):** It is too aggressive for a dark-mode literary experience; stick to `#E2E8F0`.
*   **Don't use standard Material Shadows:** They look muddy on deep blue surfaces. Use our Ambient Shadow rules.
*   **Don't crowd the UI:** If it feels "busy," remove a container and use whitespace instead.