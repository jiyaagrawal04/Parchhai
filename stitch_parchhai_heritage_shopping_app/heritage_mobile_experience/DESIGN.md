---
name: Heritage Mobile Experience
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
    fontFamily: Libre Caslon Text
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
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
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  margin-mobile: 20px
  gutter-mobile: 16px
  touch-target-min: 48px
  section-gap: 40px
---

## Brand & Style

This design system is built for a premium heritage experience, blending the gravitas of historical luxury with modern mobile-first usability. The personality is curated, authoritative, and deeply tactile. 

The aesthetic style is **Modern Corporate with Editorial influence**, leveraging a high-contrast color palette and rich typography to create an "archive" feel that remains functional on small screens. The UI prioritizes generous white space (ivory) and large imagery to evoke a sense of quality and craftsmanship. Every interaction should feel intentional and weighted, avoiding excessive motion in favor of stable, confident transitions.

The target audience seeks exclusivity and depth. The emotional response should be one of "digital craftsmanship"—a feeling that the interface was built with the same care as a physical luxury good.

## Colors

The palette is rooted in a traditional, high-status spectrum:
- **Primary (Indigo):** Used for navigation headers, primary actions, and deep-background sections. It provides the "foundation" of the brand.
- **Secondary (Madder-Rust):** Reserved for moments of high importance, active states, and critical information.
- **Tertiary (Gold):** Used sparingly as a "finish" for icons, borders, and small highlights to denote premium tiers or rewards.
- **Neutral (Ivory):** The primary surface color. It replaces pure white to reduce eye strain and provide a more "paper-like" editorial feel.
- **Charcoal:** Used exclusively for high-readability text and dark-mode secondary surfaces.

The default mode is **Light**, utilizing Ivory surfaces to ensure a warm, inviting environment.

## Typography

The typography system relies on the tension between the classic **Libre Caslon Text** and the contemporary **Hanken Grotesk**.

- **Headlines:** Use Libre Caslon Text for all titles, headers, and hero moments. It conveys heritage and editorial authority.
- **UI & Body:** Use Hanken Grotesk for all body copy, inputs, and functional UI labels. To maintain the "Premium" vibe, body text must never drop below 16px to ensure accessibility and a spacious feel.
- **Labels:** Small metadata or utility labels use Hanken Grotesk in Semi-Bold with a slight letter-spacing increase and uppercase styling to provide a clean, modern contrast to the serif headings.

## Layout & Spacing

This design system uses a **Fluid Grid** for mobile devices, adhering to a strict 8px baseline rhythm.

- **Margins:** 20px on mobile to allow imagery to breathe.
- **Touch Targets:** All interactive elements must maintain a minimum height/width of 48px to ensure thumb-friendly navigation.
- **Vertical Spacing:** Generous section gaps of 40px+ are used to prevent the interface from feeling cluttered, maintaining a "luxury" sense of space.
- **Safe Zones:** Adhere strictly to mobile safe areas, specifically ensuring bottom-aligned CTAs are positioned above the home indicator.

## Elevation & Depth

Depth is established through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Surfaces:** Ivory is the base. Elements elevated above the base use a subtle border (1px) in a slightly darker tint of Ivory or Gold.
- **Bottom Sheets:** When a sheet is invoked, use a 40% Charcoal backdrop blur to focus the user’s attention on the interaction.
- **Product Cards:** Cards should appear flat on the surface with a very soft, ambient Indigo-tinted shadow (4% opacity) to suggest a subtle lift without breaking the editorial aesthetic.
- **Active States:** Tapping an element should trigger a slight inward tonal shift (inner glow) to simulate physical feedback.

## Shapes

The shape language is **Soft (Level 1)**. 

Luxury heritage brands typically avoid hyper-rounded "bubbly" shapes. We use a 4px (0.25rem) base corner radius for buttons and input fields to maintain a structured, professional appearance. 

- **Images:** Can occasionally feature a 0px (Sharp) radius to emphasize an editorial/photography-first look.
- **Bottom Sheets:** Only the top corners are rounded (12px / 0.75rem) to provide a "drawer" feel that is friendly yet architectural.

## Components

- **Buttons:** Primary buttons are Indigo with Ivory text. They must span the full width of the container or a minimum of 200px. No gradients; use solid fills for a timeless feel.
- **Sticky CTAs:** High-conversion buttons are pinned to the bottom of the screen with a subtle Ivory-to-Transparent gradient behind them to ensure they remain legible over scrolling content.
- **Product Cards:** Use a vertical layout with the image as the hero. Price is set in Hanken Grotesk Bold, while the product name is set in Libre Caslon.
- **Bottom Sheets:** Use for all complex selections (filters, sizing, share menus). They must include a "grab handle" and be dismissible via a downward swipe.
- **Input Fields:** Minimalist design with a bottom-border only (Gold or Indigo). Labels remain visible above the field at all times.
- **Chips:** Used for category selection. Pill-shaped (Level 3 roundedness) to distinguish them from the more rigid, Level 1 functional buttons.
- **Lists:** High-density lists are avoided. Use "Large List Items" with 16px vertical padding and chevron icons in Gold.