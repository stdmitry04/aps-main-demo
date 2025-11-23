# Theme Colors Quick Guide

## Tailwind Classes (Recommended)

Use these Tailwind classes in your components for consistent theming:

### Primary Colors
```tsx
// Background
className="bg-primary"              // Main blue
className="bg-primary-hover"        // Darker blue for hover
className="bg-primary-light"        // Light blue
className="bg-primary-dark"         // Dark blue

// Text
className="text-primary"
className="text-primary-hover"
className="text-primary-light"
className="text-primary-dark"

// Border
className="border-primary"
className="border-primary-hover"
```

### Accent Colors (Full Palette)
```tsx
className="bg-accent-50"   // Lightest blue
className="bg-accent-100"
className="bg-accent-200"
// ... 300-400 ...
className="bg-accent-500"  // Main blue (same as bg-primary)
className="bg-accent-600"  // Darker (same as bg-primary-hover)
// ... 700-900 ...
className="bg-accent-950"  // Darkest blue
```

### Hover States
```tsx
// Automatic hover - no JavaScript needed!
className="bg-primary hover:bg-primary-hover"
className="text-primary hover:text-primary-dark"
```

## Examples

### Button
```tsx
<button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md">
  Click Me
</button>
```

### Icon Container
```tsx
<div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
  SD
</div>
```

### Badge
```tsx
<span className="bg-primary-light text-primary-dark px-2 py-1 rounded text-sm">
  New
</span>
```

## Changing Theme Colors

To change the entire app's color scheme, update the CSS variables in:
`/frontend/app/globals.css`

```css
:root {
  --accent-500: 59, 130, 246;  /* Change RGB values here */
  --accent-600: 37, 99, 235;   /* Hover state */
  /* etc. */
}
```

All components using `bg-primary`, `text-primary`, etc. will automatically update!

## Advanced: JavaScript Usage

If you need colors in TypeScript/JavaScript (rare):

```tsx
import { getPrimaryColor, getAccentColor } from '@/lib/theme';

// Inline styles (avoid if possible - use Tailwind classes instead)
style={{ backgroundColor: getPrimaryColor('primary') }}
style={{ color: getAccentColor(500) }}
```

**Note**: Prefer Tailwind classes over inline styles for better performance and maintainability.
