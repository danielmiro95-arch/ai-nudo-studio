# Design System Documentation: The Cinematic Curator

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Cinematic Curator."** 

Unlike standard functional interfaces that prioritize density, this system treats the screen as a gallery wall. It is designed to evoke emotion, using high-contrast typography and vast negative space to frame content as if it were a high-end editorial spread. We move beyond the "template" look by utilizing intentional asymmetry, overlapping elements, and a focus on center-weighted compositions that draw the eye toward the "hero" moment—whether that is a wedding film, a curated gift box, or a flagship event.

The experience should feel "quiet." Every interaction is a soft transition; every surface is a deliberate choice of tone. We are not just building a platform; we are designing a digital heirloom.

---

## 2. Colors & Tonal Architecture
The palette is rooted in a warm, premium minimalism. We use a sophisticated scale of off-whites and grays to create depth without relying on artificial structural elements.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be achieved solely through background color shifts. For example, a `surface-container-low` (`#f3f4ee`) section should sit against a `surface` (`#fafaf5`) background to create a soft, organic break.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers, like stacked sheets of fine heavy-weight paper.
- **Base Layer:** `surface` (#fafaf5) for the main canvas.
- **Elevated Cards:** Use `surface-container-lowest` (#ffffff) to create a clean "lift."
- **Recessed Areas:** Use `surface-container-high` (#e5eae0) for utility areas or sidebars to imply a "carved-out" feel.

### The "Glass & Gradient" Rule
To elevate beyond flat design, use **Glassmorphism** for floating headers or navigation bars. Apply a semi-transparent `surface` color with a `backdrop-blur` of 20px. 
**Signature Texture:** Main Call-to-Actions (CTAs) should utilize a subtle linear gradient from `primary` (#5e5e5e) to `primary-dim` (#525252) at a 45-degree angle. This provides a "satin" finish that flat hex codes cannot replicate.

---

## 3. Typography
The typography is the voice of the brand. We pair the geometric authority of **Manrope** with the modern clarity of **Inter**.

- **Display & Headlines (Manrope):** These are the "editorial" moments. Use `display-lg` (3.5rem) for hero statements. High contrast is key—tighten the letter-spacing (tracking) by -2% for display styles to give them a premium, "locked-in" feel.
- **Body & Labels (Inter):** Inter handles the functional heavy lifting. Use `body-lg` (1rem) for descriptions to maintain readability. 
- **The Visual Rhythm:** Always maintain a significant scale jump between a `headline-lg` and `body-md`. This "high-low" contrast is what creates the editorial aesthetic.

---

## 4. Elevation & Depth
In this design system, depth is a whisper, not a shout. We achieve hierarchy through **Tonal Layering** rather than traditional drop shadows.

### The Layering Principle
Stacking surface tiers creates a natural lift. A card using `surface-container-lowest` placed on a `surface-container-low` background creates a "soft lift" that feels architectural.

### Ambient Shadows
When a physical "floating" effect is required (e.g., a primary modal), use an **Ambient Shadow**:
- **X/Y Offset:** 0, 8px
- **Blur:** 32px
- **Color:** `on-surface` (#2e342d) at **4% to 6% opacity**. 
This mimics natural light diffusion rather than a digital "drop shadow."

### The "Ghost Border" Fallback
If a border is required for accessibility, it must be a **Ghost Border**: use the `outline-variant` token (#aeb4aa) at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components

### Cards (The "Revolut" Influence)
Cards are the primary container.
- **Styling:** Use `surface-container-lowest` (#ffffff) with a corner radius of `xl` (0.75rem).
- **Constraint:** No internal dividers. Use `spacing-6` (2rem) or `spacing-8` (2.75rem) to separate internal content clusters.
- **Interaction:** On hover, a card should scale slightly (1.02x) and the shadow opacity should increase by 2%.

### Buttons
- **Primary:** A "satin" gradient of `primary` to `primary-dim`. Radius `full` (pill-shape). Padding: `spacing-3` top/bottom, `spacing-6` left/right.
- **Secondary:** Transparent background with a `Ghost Border`. Text color `on-surface`.
- **Tertiary:** Text only, using `label-md` in all caps with 0.1rem letter-spacing.

### Input Fields
- **Style:** Underline-only or subtle `surface-container-low` fills. 
- **States:** The label should "float" using `label-sm` when the field is active. The active indicator is a 1px `primary` line—the only time a 100% opaque line is permitted.

### Narrative Image Cards (Bespoke)
A custom component for wedding/event galleries. A full-bleed image with a `surface-container-lowest` card overlapping the bottom-left corner by `spacing-4` (1.4rem). This "intentional asymmetry" breaks the grid and feels bespoke.

---

## 6. Do’s and Don’ts

### Do
- **Embrace White Space:** Use `spacing-16` (5.5rem) and `spacing-20` (7rem) between major sections to let the content breathe.
- **Center-Focus:** Keep key narrative content in a narrow center column (max-width: 800px) while allowing imagery to go full-width.
- **Cinematic Transitions:** Use "Fade + Slide Up" transitions (duration: 400ms, easing: cubic-bezier(0.22, 1, 0.36, 1)) for all page entries.

### Don't
- **Don't use Divider Lines:** Use background tonal shifts or `spacing-10` gaps instead of horizontal rules.
- **Don't use Pure Black for Text:** Use `on-surface` (#2e342d) for body text to maintain a "warm" editorial feel; pure black is too harsh for high-end digital paper.
- **Don't Crowd the Frame:** If a screen feels busy, remove an element. The luxury feel comes from what you leave out.