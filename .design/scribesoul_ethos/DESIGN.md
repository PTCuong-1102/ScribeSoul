# Design System: The Silent Manuscript

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Curator"**

This design system is built to bridge the gap between the tactile heritage of classical literature and the frictionless efficiency of modern software. We reject the "SaaS-standard" aesthetic of heavy borders and loud primary colors. Instead, we embrace a "High-End Editorial" approach where negative space is as functional as the content itself. 

By utilizing intentional asymmetry and tonal depth, we create a sanctuary for authors. The interface does not shout; it recedes. The layout breaks the rigid grid by using expansive margins and overlapping elements, mimicking the experience of laying out fine parchment on a dark oak desk.

---

## 2. Colors: Tonal Atmosphere
The palette is rooted in the "Warm Paper" experience. We avoid sterile grays in favor of "Ink" and "Parchment" tones.

### Surface Hierarchy & Nesting
We utilize a system of **Tonal Layering** to define importance.
- **Surface (`#fbf9f4`)**: The base "Desk."
- **Surface-Container-Low (`#f5f3ee`)**: The primary navigation or "side-table."
- **Surface-Container-Lowest (`#ffffff`)**: The active writing sheet, providing maximum focus.
- **Surface-Container-High (`#eae8e3`)**: Utility panels and secondary tools.

### The Rules of Engagement
*   **The "No-Line" Rule:** 1px solid borders for sectioning are strictly prohibited. Boundaries are defined by shifting from `surface` to `surface-container-low`.
*   **The "Glass & Gradient" Rule:** Floating menus (Slash/Bubble) must use `surface-variant` with a 60% opacity and a 12px backdrop-blur. 
*   **Signature Textures:** For AI-enhanced features or primary CTAs, use a subtle radial gradient transitioning from `secondary` (`#712ae2`) to `secondary-container` (`#8a4cfc`) at a 45-degree angle. This provides a "glow" rather than a flat block of color.

---

## 3. Typography: The Literary Spine
We employ a high-contrast typographic scale to differentiate between the *act of creation* and the *act of management*.

*   **The Display & Headline (Newsreader/Serif):** Used for titles and book headings. This evokes the academic, "bound-book" feel.
*   **The UI (Inter/Sans-Serif):** Used for labels, buttons, and navigation. This remains invisible and functional.

| Level | Token | Font | Size | Weight |
| :--- | :--- | :--- | :--- | :--- |
| Display | `display-lg` | Newsreader | 3.5rem | 400 |
| Headline | `headline-md` | Newsreader | 1.75rem | 500 |
| Title | `title-md` | Inter | 1.125rem | 500 |
| Body (Editor) | `body-lg` | Newsreader | 1.125rem | 400 |
| Label | `label-md` | Inter | 0.75rem | 600 |

*Note: The Editor uses `body-lg` with a line height of 1.7 to ensure breathability for long-form composition.*

---

## 4. Elevation & Depth
In this design system, elevation is a whisper, not a shout.

*   **The Layering Principle:** To lift an element, move it one step down the container hierarchy (e.g., a `surface-container-lowest` card on a `surface-container-low` background).
*   **Ambient Shadows:** For floating elements like the Slash Menu, use a custom shadow: `0px 10px 30px rgba(27, 28, 25, 0.06)`. The shadow color must be a tint of `on-surface`, never pure black.
*   **The "Ghost Border" Fallback:** If a container requires definition against a similar background, use a 1px stroke of `outline-variant` at 15% opacity.
*   **Glassmorphism:** All floating menus must utilize `surface-container` with `backdrop-filter: blur(10px)`. This integrates the menu into the "atmosphere" of the document rather than making it feel like a sticker.

---

## 5. Components

### 5.1. Buttons
*   **Primary:** Fill with `primary` (`#4f4e4e`), `on-primary` text. No border. Radius: `md` (0.375rem).
*   **Secondary:** Ghost style. No background, `outline-variant` ghost border (15% opacity).
*   **Tertiary/AI:** Subtle gradient fill using `secondary-fixed-dim` to `secondary-fixed`.

### 5.2. Input Fields (The Editor Context)
*   **Style:** Borderless. Underlines are prohibited.
*   **States:** Focus state is indicated by a subtle shift in background color to `surface-container-highest` or a violet `secondary` caret.

### 5.3. Floating Menus (Bubble/Slash)
*   **Style:** Glassmorphic. Radius: `xl` (0.75rem). 
*   **Interaction:** Items use a `surface-bright` hover state with no hard edges.

### 5.4. Lists & Panels
*   **Dividers:** Do not use line dividers. Use `1.5rem` of vertical whitespace (from spacing scale) or a 1-step shift in surface container color.
*   **Resizable Panels:** The "handle" is a single, centered `outline` dot, not a full-length line.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins. A document should feel like it has room to grow.
*   **Do** use "ink" tones for text. Pure black (#000) is too harsh for the "Warm Paper" philosophy.
*   **Do** prioritize the serif font for any text the user *writes*, and sans-serif for anything the user *clicks*.

### Don't
*   **Don't** use drop shadows with high opacity. If it looks like it’s "hovering" more than 2mm off the page, it’s too heavy.
*   **Don't** use 100% opaque borders. They interrupt the flow of the eye and break the "serene" academic vibe.
*   **Don't** use high-contrast dark modes. Dark mode should feel like a dimly lit library, using `surface` (`#0F172A`) and low-contrast off-whites.

---

## 7. Signature AI Integration
When the AI features are active (editing assistance, brainstorming), the interface should introduce the "Violet Glow." This is not a solid block of purple, but a `secondary` (`#7C3AED`) soft-focus outer glow (20px blur) applied to the specific text block or floating component. It should feel like a subtle energy, not a technical tool.