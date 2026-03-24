```markdown
# Design System Specification: The Digital Vellum

## 1. Overview & Creative North Star
The "Creative North Star" for this design system is **The Digital Vellum**. 

While the functional requirement is a minimalist Android PWA for an 'Idea Journal,' our execution must transcend the "standard app" aesthetic. We are not building a utility; we are crafting a sanctuary for thought. The system abandons the rigid, boxed-in constraints of traditional Material Design in favor of an editorial, high-end stationery feel. By utilizing intentional asymmetry, expansive negative space, and a sophisticated layering of whites and off-whites, we create a "breathable" interface that prioritizes the user's intellectual content over the UI itself.

This system breaks the "template" look through:
*   **Intentional Asymmetry:** Alignment that feels human and curated, not just mathematically centered.
*   **Tonal Depth:** Replacing harsh lines with soft shifts in surface temperature.
*   **Editorial Scale:** Drastic contrast between display typography and functional metadata.

---

## 2. Colors
Our palette moves beyond simple green and blue. We use a sophisticated range of "Living Neutrals" and "Botanical Accents" to provide depth without clutter.

### The Palette
*   **Primary (`#006e1c`):** A deep, authoritative forest green used for high-impact brand moments.
*   **Secondary (`#0061a4`):** An intellectual deep blue for secondary interactive elements.
*   **Surface Hierarchy:**
    *   `surface`: `#fbf9f8` (The Base)
    *   `surface_container_low`: `#f6f3f2` (Secondary sections)
    *   `surface_container_highest`: `#e4e2e1` (Floating elements)

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders (`outline`) are prohibited for sectioning or defining cards. Boundaries must be defined solely through background color shifts. To separate a journal entry from the feed, place a `surface_container_lowest` (#ffffff) card against the `surface` (#fbf9f8) background. 

### The "Glass & Gradient" Rule
To elevate the PWA from "web-like" to "premium-native," use Glassmorphism for floating action buttons and top navigation bars. Use `surface_container` at 80% opacity with a `20px` backdrop-blur. 
*   **Signature Texture:** Use a subtle linear gradient on the Primary Button, transitioning from `primary` to `primary_container` at a 45-degree angle. This provides a "haptic" visual depth that flat green cannot achieve.

---

## 3. Typography
We pair the geometric precision of **Manrope** for headers with the high-readability of **Inter** for long-form thoughts.

*   **Display & Headlines (Manrope):** These are the "Editorial Voice." Use `display-md` (2.75rem) for empty states or journal titles to create a bold, confident entry point.
*   **Body (Inter):** The "Workhorse." Use `body-lg` (1rem) for the main text of an idea. Set line-height to 1.6 to ensure the "Vellum" feel—thoughts need room to breathe.
*   **Labels (Inter):** Use `label-md` (0.75rem) with `0.05rem` letter-spacing for tags and timestamps. This adds a "metadata" look that feels organized and professional.

---

## 4. Elevation & Depth
In this system, depth is a result of light and material, not artificial shadows.

### The Layering Principle
Stack tiers to create hierarchy. 
1.  **Level 0:** `surface` (The desk).
2.  **Level 1:** `surface_container_low` (A section or grouping).
3.  **Level 2:** `surface_container_lowest` (#ffffff) (The individual idea card).

### Ambient Shadows
If an element must float (like a "New Entry" button), use an **Ambient Shadow**:
*   **Blur:** 24px
*   **Spread:** -4px
*   **Color:** `on_surface` at 6% opacity.
*   **Tone:** Tint the shadow with a hint of `primary` to make the object feel like it is reflecting the brand's light.

### The "Ghost Border" Fallback
If contrast ratios require a border for accessibility (e.g., in high-glare environments), use the `outline_variant` token at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** `primary` background, `on_primary` text. Radius: `md` (0.375rem). Use the signature gradient.
*   **Tertiary:** No background. Use `primary` text. Use `spacing-2` (0.5rem) horizontal padding to create a "ghost" hit area.

### Idea Cards
*   **Styling:** No borders. Background: `surface_container_lowest`. Radius: `lg` (0.5rem). 
*   **Layout:** Padding: `16` (4rem) on top/bottom, `8` (2rem) on sides. This intentional "tall" padding creates an editorial feel.
*   **Separation:** Use `spacing-6` (1.5rem) of vertical white space between cards. Never use divider lines.

### Chips (Idea Tags)
*   **Styling:** Background: `surface_container_high`. Text: `on_surface_variant`. Radius: `full`.
*   **Interaction:** On selection, transition to `secondary_container` with `on_secondary_container` text.

### Input Fields (The "Thought Box")
*   **Styling:** Minimalist. No bottom line or box. 
*   **Focus State:** The background shifts from `surface` to `surface_container_low`. 
*   **Typography:** The text entry uses `title-lg` (1.375rem) to make the user's idea feel significant as they type it.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical padding (e.g., more padding on the left than the right in headers) to create a curated, "journal" feel.
*   **Do** use `surface_bright` for the "New Entry" screen to signal a psychological shift to a clean slate.
*   **Do** rely on `body-sm` (0.75rem) in `secondary_fixed_dim` for metadata to keep the interface "quiet."

### Don’t:
*   **Don’t** use black (`#000000`) for text. Use `on_surface` (`#1b1c1c`) to maintain the "Vellum" softness.
*   **Don’t** use 100% opaque lines to separate content. Use a `1px` height `surface_container_highest` div only if absolutely necessary.
*   **Don’t** cram the screen. If you feel you need more room, increase the `spacing` scale rather than shrinking the typography.

### Accessibility Note:
While we lean into "softness," always ensure the `on_surface` text against `surface` backgrounds maintains a minimum 4.5:1 contrast ratio. Use `primary` and `secondary` colors for "Actionable" items only.```