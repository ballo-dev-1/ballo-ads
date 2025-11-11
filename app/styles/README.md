# CSS Architecture Guide

This directory contains all CSS styles for the BalloAds application, organized in a centralized structure.

## Directory Structure

```
app/styles/
├── index.css              # Main entry point - imports all CSS files
├── variables.css          # CSS custom properties and theme variables
├── utilities.css         # Utility classes (gradients, glows, scrollbar)
├── components/          # Component-specific styles
│   ├── header.css
│   ├── footer.css
│   └── coming-soon.css
└── pages/               # Page-specific styles
    ├── home.css
    ├── features.css
    ├── pricing.css
    ├── blog.css
    ├── blog-slug.css
    ├── careers.css
    ├── faq.css
    ├── how-it-works.css
    ├── knowledge-base.css
    ├── live-chat.css
    ├── privacy-policy.css
    ├── resources.css
    ├── subscription.css
    ├── subscription-form.css
    └── whats-new.css
```

## How It Works

All CSS is imported through a single entry point: `app/styles/index.css`, which is imported in `app/layout.tsx`. This ensures all styles are loaded globally and available throughout the application.

## File Organization

### Core Files
- **`variables.css`** - Contains all CSS custom properties (CSS variables) used throughout the app
- **`utilities.css`** - Contains reusable utility classes like gradients, glows, and scrollbar utilities

### Component Files (`components/`)
Component-specific styles that are used across multiple pages:
- `header.css` - Header navigation component
- `footer.css` - Footer component
- `coming-soon.css` - Coming soon component animations

### Page Files (`pages/`)
Page-specific styles organized by route:
- `home.css` - Home page (`/`)
- `features.css` - Features page (`/features`)
- `pricing.css` - Pricing page (`/pricing`)
- `blog.css` - Blog listing page (`/blog`)
- `blog-slug.css` - Individual blog post page (`/blog/[slug]`)
- `careers.css` - Careers page (`/careers`)
- `faq.css` - FAQ page (`/faq`)
- `how-it-works.css` - How it works page (`/how-it-works`)
- `knowledge-base.css` - Knowledge base page (`/knowledge-base`)
- `live-chat.css` - Live chat page (`/live-chat`)
- `privacy-policy.css` - Privacy policy page (`/privacy-policy`)
- `resources.css` - Resources page (`/resources`)
- `subscription.css` - Subscription page (`/subscription`)
- `subscription-form.css` - Subscription form page (`/subscription/form`)
- `whats-new.css` - What's new page (`/whats-new`)

## Naming Conventions

All CSS classes follow the BEM (Block Element Modifier) naming convention:

- **Block**: Main component/page name (e.g., `.home-hero`, `.pricing-page`)
- **Element**: Part of the block (e.g., `.home-hero__title`, `.pricing-page__header`)
- **Modifier**: Variation of the block/element (e.g., `.pricing-plan__cta--primary`)

## Working with Styles

1. **To add styles to a specific page**: Edit the corresponding file in `pages/`
2. **To add global utilities**: Edit `utilities.css`
3. **To add/modify CSS variables**: Edit `variables.css`
4. **To add component styles**: Edit the corresponding file in `components/`

## CSS Variables

All color and theme variables are defined in `variables.css`. Use these variables instead of hardcoded colors:

```css
/* Available variables */
--brand-color-1: #020055;
--brand-color-2: #0b4d8c;
--brand-color-3: #2273af;
--brand-color-4: #3fdbff;
--brand-color-5: #bdd4dc;
--dark-blue: #020055;
--dark-blue-2: #0e0e39;
--purple: #6b46c1;
--purple-light: #a855f7;
--cyan: #3fdbff;
--cyan-light: #67e8f9;
```

## Responsive Breakpoints

Standard breakpoints used throughout:
- Mobile: Default (no media query)
- Tablet: `@media (min-width: 768px)`
- Desktop: `@media (min-width: 1024px)`
- Large Desktop: `@media (min-width: 1280px)`

## Notes

- All page CSS files are currently placeholder files with organized class structure
- Each file includes comments indicating which page/component it corresponds to
- Styles are organized by section within each file for easy navigation
- All styles are automatically imported and available globally

