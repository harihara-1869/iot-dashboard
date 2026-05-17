---
name: Kinetic Industrial
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474a'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777a'
  outline-variant: '#c5c6ca'
  surface-tint: '#5d5e61'
  primary: '#000101'
  on-primary: '#ffffff'
  primary-container: '#1a1c1e'
  on-primary-container: '#838486'
  inverse-primary: '#c6c6c9'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#010000'
  on-tertiary: '#ffffff'
  tertiary-container: '#2f1500'
  on-tertiary-container: '#c86c00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e5'
  primary-fixed-dim: '#c6c6c9'
  on-primary-fixed: '#1a1c1e'
  on-primary-fixed-variant: '#454749'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  data-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
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
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1440px
---

## Brand & Style

The design system is engineered for precision industrial motor control, where high-stakes monitoring meets modern data visualization. The target audience includes plant operators and engineers who require immediate situational awareness and reliable control interfaces.

The design style combines **Corporate Modern** efficiency with **Glassmorphism** accents. While the overall environment is structured and utilitarian to minimize cognitive load, a signature "Fluid Status Indicator" provides a high-fidelity visual heartbeat of the system. This approach balances the rugged reliability of industrial equipment with the intuitive, forward-looking aesthetic of high-end technical software. The interface evokes a sense of controlled power, safety, and technological sophistication.

## Colors

The palette is anchored in high-contrast functionalism. Surfaces utilize a refined hierarchy of whites and light grays to reduce glare in industrial environments while maintaining a clean, professional aesthetic.

- **Primary:** Deep charcoal (#1A1C1E) for high-contrast text and structural elements.
- **Status - Good:** Emerald Green (#059669) for "Running," "Ready," and "Optimal."
- **Status - Warning:** Amber (#D97706) for "Maintenance Required" and "Threshold Warning."
- **Status - Bad:** Crimson (#DC2626) for "Emergency Stop," "Critical Failure," and "Overload."
- **Fluid Gradient:** A dynamic, multi-stop linear gradient blending these status colors is reserved for large-scale status indicators, representing the motor's current energy state and health through movement and light.

## Typography

This design system employs a dual-font strategy. **Inter** provides high legibility for UI labels, navigation, and instructional text, ensuring a modern and accessible interface. **JetBrains Mono** is utilized for all technical data points, motor RPMs, temperature readings, and log timestamps. The monospaced nature of the data font prevents "jumping" numbers during real-time updates, which is critical for monitoring fluctuating industrial metrics. Headlines use tight letter spacing to appear authoritative, while data labels use increased tracking to ensure clarity at small sizes.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a hard 4px baseline rhythm. This ensures that every element—from the smallest toggle to the largest gauge—aligns to a consistent mechanical grid.

- **Desktop:** A 12-column grid with 16px gutters. Control panels should be grouped in cards that span 3, 4, or 6 columns depending on the complexity of the motor subsystem.
- **Mobile/HMI Tablet:** A 4-column grid. Controls must prioritize vertical stacking for easy thumb-reach during floor operations.
- **Rhythm:** Use 8px (2 units) for internal component spacing and 24px (6 units) for section spacing. This generous padding prevents accidental activations of high-risk controls.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Low-Contrast Outlines**. 

- **Level 0 (Background):** Solid Slate-50 (#F8FAFC) creates a clean, industrial foundation.
- **Level 1 (Cards/Containers):** Pure white surfaces with a 1px border (#E2E8F0). No shadows are used here to maintain a flat, architectural feel.
- **Level 2 (Interactive Controls):** Buttons and inputs feature a subtle 2px bottom "press" border to indicate clickability without the use of complex shadows.
- **Status Overlay:** The "Fluid Status Indicator" uses a backdrop-blur (12px) when appearing in modals or floating panels, creating a "glass" effect that suggests a digital lens over physical machinery.

## Shapes

The design system adopts a **Soft** shape language. A 4px (0.25rem) radius is applied to buttons, input fields, and containers. This provides a balance between the precision of "sharp" industrial hardware and the approachability of "rounded" modern software. Large status visualization containers may use a higher radius (8px) to feel more like a tactile screen or high-tech glass panel.

## Components

- **Buttons:** Primary buttons are Solid Charcoal with white text. Secondary buttons use a 1px border. "Emergency Stop" is the only component allowed to use a heavy Crimson fill with white, bold typography.
- **Status Chips:** Small, pill-shaped indicators using low-opacity versions of the status colors (Emerald, Amber, Crimson) with high-contrast text of the same hue.
- **Input Fields:** Squared-off with a subtle gray border. Focus state uses a 2px primary charcoal border.
- **Fluid Indicator:** A large-format component used for the master motor status. It should feature a "lava-lamp" style animated gradient that speeds up or slows down based on RPM data.
- **Data Cards:** Grouped monospaced metrics. Labels are placed above the data in uppercase `label-caps`. 
- **Toggle Switches:** Mechanical-style sliders that provide a clear visual "on/off" state using the Status-Good emerald color when active.