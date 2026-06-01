---
name: Parchhai
colors:
  surface: '#fef9f0'
  surface-dim: '#ded9d1'
  surface-bright: '#fef9f0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f3ea'
  surface-container: '#f2ede4'
  surface-container-high: '#ece8df'
  surface-container-highest: '#e7e2d9'
  on-surface: '#1d1c16'
  on-surface-variant: '#45464e'
  inverse-surface: '#32302a'
  inverse-on-surface: '#f5f0e7'
  outline: '#75777f'
  outline-variant: '#c5c6cf'
  surface-tint: '#4f5e81'
  primary: '#041534'
  on-primary: '#ffffff'
  primary-container: '#1b2a4a'
  on-primary-container: '#8392b7'
  inverse-primary: '#b7c6ee'
  secondary: '#a23e30'
  on-secondary: '#ffffff'
  secondary-container: '#fc8270'
  on-secondary-container: '#721b12'
  tertiary: '#221400'
  on-tertiary: '#ffffff'
  tertiary-container: '#3c2700'
  on-tertiary-container: '#b98a3c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b7c6ee'
  on-primary-fixed: '#0a1a3a'
  on-primary-fixed-variant: '#384668'
  secondary-fixed: '#ffdad4'
  secondary-fixed-dim: '#ffb4a8'
  on-secondary-fixed: '#410000'
  on-secondary-fixed-variant: '#82271c'
  tertiary-fixed: '#ffddaf'
  tertiary-fixed-dim: '#f3be6a'
  on-tertiary-fixed: '#281800'
  on-tertiary-fixed-variant: '#614000'
  background: '#fef9f0'
  on-background: '#1d1c16'
  surface-variant: '#e7e2d9'
typography:
  display-lg:
    fontFamily: Bodoni Moda
    fontSize: 80px
    fontWeight: '700'
    lineHeight: 90px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Bodoni Moda
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Bodoni Moda
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
  headline-lg-mobile:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.15em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
spacing:
  unit: 8px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style

The design system is rooted in the concept of *Parchhai* (Shadow/Reflection)—the intersection of ancestral artisanal heritage and the sharp silhouettes of modern high fashion. It targets a discerning global audience that values the slow-fashion movement, textile provenance, and contemporary Indian aesthetics.

The visual style is **Editorial Minimalism** with a **Tactile** edge. It treats the digital interface like a physical gallery or a high-end lookbook. 
- **Emotional Response:** Sophisticated, rhythmic, unhurried, and culturally grounded.
- **Visual Strategy:** Large amounts of negative space (unbleached ivory) serve as a canvas for high-contrast textile photography. We use asymmetric layouts to break the monotony of standard e-commerce, reflecting the organic nature of hand-printed fabrics like Ajrakh and Dabu.
- **Texture:** Subtle grain or "paper" overlays are applied to background layers to evoke the feeling of handmade cotton and traditional block-printing surfaces.

## Colors

The palette is a tribute to natural dyes and organic materials.
- **Base (Ivory #F4EFE6):** Used for primary backgrounds and "Paper" surfaces. It provides a warm, sophisticated alternative to pure white.
- **Primary (Indigo #1B2A4A):** Represents depth and tradition. Used for primary navigation, heavy typography, and deep-section backgrounds.
- **Accent (Madder-Rust #9E3B2E):** A grounding, earthy red used for CTAs, highlights, and status indicators.
- **Detail (Muted Gold #B8893B):** Reserved for luxury markers, iconography, and subtle borders.
- **Ink (Charcoal #1C1A17):** Used for maximum legibility in body text and high-contrast borders.

## Typography

This design system utilizes a high-contrast serif for narrative elements and a precise grotesque sans for functional information.
- **Bodoni Moda:** Set with tight tracking for large displays to emphasize its elegant thick-to-thin strokes. It conveys "The Editorial Voice."
- **Hanken Grotesk:** Chosen for its clarity and contemporary feel. It remains neutral to let the serif headings and textile imagery lead.
- **Styling Note:** Product categories and small labels must always use `label-caps` with 15% letter-spacing to maintain a luxury, spaced-out appearance.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid** grid that prioritizes negative space.
- **Desktop:** A 12-column grid with generous 64px side margins. Key featured products should break the grid (e.g., spanning columns 2 through 7) to create an asymmetric, curated gallery feel.
- **Mobile:** A 4-column grid. Large full-width imagery is preferred over small thumbnails to maintain the "luxury" scale.
- **Rhythm:** We use a "Breathing" spacing model. Section gaps are intentionally large (120px+) to ensure the user doesn't feel rushed, encouraging a slow-scrolling exploration of the craft details.

## Elevation & Depth

To maintain a "flat luxury" editorial feel, this design system avoids traditional drop shadows. Depth is achieved through:
- **Tonal Layering:** Using the Indigo (#1B2A4A) and Ivory (#F4EFE6) as overlapping planes. A product card might sit on an Ivory background, but a quick-view modal will use a solid Indigo surface.
- **Low-Contrast Outlines:** Instead of shadows, we use 1px borders in Muted Gold or semi-transparent Charcoal to define containers.
- **Glassmorphism (Subtle):** In navigation overlays, use a very high-density background blur (40px+) with a 5% Indigo tint to mimic silk-screen transparency.

## Shapes

The shape language is **Sharp and Architectural**. 
- **Corners:** 0px radius for all primary elements (buttons, images, inputs) to reflect the precision of modern tailoring and the straight lines of traditional looms.
- **Dividers:** Use ultra-thin (0.5px) horizontal lines for content separation, evoking the threads of a textile.

## Components

- **Buttons:** Primary buttons are solid Indigo with Ivory text, sharp-edged. Secondary buttons use a 1px Indigo border with a "fill" hover effect. Label text in buttons always uses `label-caps`.
- **Cards:** Product cards are borderless. The image takes priority, with typography placed below in an asymmetric alignment (e.g., Title left-aligned, Price right-aligned).
- **Inputs:** Minimalist bottom-border only. On focus, the border transitions from Charcoal to Muted Gold.
- **Chips/Tags:** Used for "Artisan Technique" labels (e.g., "Hand-blocked"). These use the Ivory background with a 1px Muted Gold border and `label-sm` typography.
- **Interactive States:** Hovering over an image should trigger a "Slow Zoom" (1.05x) to mimic the feeling of leaning in to inspect fabric quality.
- **Asymmetric Grids:** Homepage layouts should feature "Staggered Image Tiles" where the right column is offset by 40px vertically from the left, creating a rhythmic, non-commercial flow.