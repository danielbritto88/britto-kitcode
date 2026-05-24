# HTML + Tailwind Guidelines

> Auto-generated from `html-tailwind.csv`. Sections enable targeted reads.

## Animation

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Use Tailwind animate utilities | Built-in animations are optimized and respect reduced-motion | Use animate-pulse animate-spin animate-ping | Custom @keyframes for simple effects | animate-pulse | @keyframes pulse {...} | Medium | https://tailwindcss.com/docs/animation |
| 2 | Limit bounce animations | Continuous bounce is distracting and causes motion sickness | Use animate-bounce sparingly on CTAs only | Multiple bounce animations on page | Single CTA with animate-bounce | 5+ elements with animate-bounce | High |  |
| 3 | Transition duration | Use appropriate transition speeds for UI feedback | duration-150 to duration-300 for UI | duration-1000 or longer for UI elements | transition-all duration-200 | transition-all duration-1000 | Medium | https://tailwindcss.com/docs/transition-duration |
| 4 | Hover transitions | Add smooth transitions on hover state changes | Add transition class with hover states | Instant hover changes without transition | hover:bg-gray-100 transition-colors | hover:bg-gray-100 (no transition) | Low |  |

## Z-Index

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | Use Tailwind z-* scale | Consistent stacking context with predefined scale | z-0 z-10 z-20 z-30 z-40 z-50 | Arbitrary z-index values | z-50 for modals | z-[9999] | Medium | https://tailwindcss.com/docs/z-index |
| 6 | Fixed elements z-index | Fixed navigation and modals need explicit z-index | z-50 for nav z-40 for dropdowns | Relying on DOM order for stacking | fixed top-0 z-50 | fixed top-0 (no z-index) | High |  |
| 7 | Negative z-index for backgrounds | Use negative z-index for decorative backgrounds | z-[-1] for background elements | Positive z-index for backgrounds | -z-10 for decorative | z-10 for background | Low |  |

## Layout

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 8 | Container max-width | Limit content width for readability | max-w-7xl mx-auto for main content | Full-width content on large screens | max-w-7xl mx-auto px-4 | w-full (no max-width) | Medium | https://tailwindcss.com/docs/container |
| 9 | Responsive padding | Adjust padding for different screen sizes | px-4 md:px-6 lg:px-8 | Same padding all sizes | px-4 sm:px-6 lg:px-8 | px-8 (same all sizes) | Medium |  |
| 10 | Grid gaps | Use consistent gap utilities for spacing | gap-4 gap-6 gap-8 | Margins on individual items | grid gap-6 | grid with mb-4 on each item | Medium | https://tailwindcss.com/docs/gap |
| 11 | Flexbox alignment | Use flex utilities for alignment | items-center justify-between | Multiple nested wrappers | flex items-center justify-between | Nested divs for alignment | Low |  |
| 48 | Container Queries | Use @container for component-based responsiveness | Use @container and @lg: etc. | Media queries for component internals | @container @lg:grid-cols-2 | @media (min-width: ...) inside component | Medium | https://github.com/tailwindlabs/tailwindcss-container-queries |
| 53 | Use shrink-0 shorthand | Shorter class name for flex-shrink-0 | shrink-0 shrink | flex-shrink-0 flex-shrink | shrink-0 | flex-shrink-0 | Low | https://tailwindcss.com/docs/flex-shrink |
| 54 | Use size-* for square dimensions | Single utility for equal width and height | size-4 size-8 size-12 | Separate h-* w-* for squares | size-6 | h-6 w-6 | Low | https://tailwindcss.com/docs/size |

## Images

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 12 | Aspect ratio | Maintain consistent image aspect ratios | aspect-video aspect-square | No aspect ratio on containers | aspect-video rounded-lg | No aspect control | Medium | https://tailwindcss.com/docs/aspect-ratio |
| 13 | Object fit | Control image scaling within containers | object-cover object-contain | Stretched distorted images | object-cover w-full h-full | No object-fit | Medium | https://tailwindcss.com/docs/object-fit |
| 14 | Lazy loading | Defer loading of off-screen images | loading='lazy' on images | All images eager load | <img loading='lazy'> | <img> without lazy | High |  |
| 15 | Responsive images | Serve appropriate image sizes | srcset and sizes attributes | Same large image all devices | srcset with multiple sizes | 4000px image everywhere | High |  |
| 55 | SVG explicit dimensions | Add width/height attributes to SVGs to prevent layout shift before CSS loads | <svg class='size-6' width='24' height='24'> | SVG without explicit dimensions | <svg class='size-6' width='24' height='24'> | <svg class='size-6'> | High |  |

## Typography

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 16 | Prose plugin | Use @tailwindcss/typography for rich text | prose prose-lg for article content | Custom styles for markdown | prose prose-lg max-w-none | Custom text styling | Medium | https://tailwindcss.com/docs/typography-plugin |
| 17 | Line height | Use appropriate line height for readability | leading-relaxed for body text | Default tight line height | leading-relaxed (1.625) | leading-none or leading-tight | Medium | https://tailwindcss.com/docs/line-height |
| 18 | Font size scale | Use consistent text size scale | text-sm text-base text-lg text-xl | Arbitrary font sizes | text-lg | text-[17px] | Low | https://tailwindcss.com/docs/font-size |
| 19 | Text truncation | Handle long text gracefully | truncate or line-clamp-* | Overflow breaking layout | line-clamp-2 | No overflow handling | Medium | https://tailwindcss.com/docs/text-overflow |

## Colors

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 20 | Opacity utilities | Use color opacity utilities | bg-black/50 text-white/80 | Separate opacity class | bg-black/50 | bg-black opacity-50 | Low | https://tailwindcss.com/docs/background-color |
| 21 | Dark mode | Support dark mode with dark: prefix | dark:bg-gray-900 dark:text-white | No dark mode support | dark:bg-gray-900 | Only light theme | Medium | https://tailwindcss.com/docs/dark-mode |
| 22 | Semantic colors | Use semantic color naming in config | primary secondary danger success | Generic color names in components | bg-primary | bg-blue-500 everywhere | Medium |  |
| 51 | Theme color variables | Define colors in Tailwind theme and use directly | bg-primary text-success border-cta | bg-[var(--color-primary)] text-[var(--color-success)] | bg-primary | bg-[var(--color-primary)] | Medium | https://tailwindcss.com/docs/customizing-colors |
| 52 | Use bg-linear-to-* for gradients | Tailwind v4 uses bg-linear-to-* syntax for gradients | bg-linear-to-r bg-linear-to-b | bg-gradient-to-* (deprecated in v4) | bg-linear-to-r from-blue-500 to-purple-500 | bg-gradient-to-r from-blue-500 to-purple-500 | Medium | https://tailwindcss.com/docs/background-image |

## Spacing

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 23 | Consistent spacing scale | Use Tailwind spacing scale consistently | p-4 m-6 gap-8 | Arbitrary pixel values | p-4 (1rem) | p-[15px] | Low | https://tailwindcss.com/docs/customizing-spacing |
| 24 | Negative margins | Use sparingly for overlapping effects | -mt-4 for overlapping elements | Negative margins for layout fixing | -mt-8 for card overlap | -m-2 to fix spacing issues | Medium |  |
| 25 | Space between | Use space-y-* for vertical lists | space-y-4 on flex/grid column | Margin on each child | space-y-4 | Each child has mb-4 | Low | https://tailwindcss.com/docs/space |

## Forms

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 26 | Focus states | Always show focus indicators | focus:ring-2 focus:ring-blue-500 | Remove focus outline | focus:ring-2 focus:ring-offset-2 | focus:outline-none (no replacement) | High |  |
| 27 | Input sizing | Consistent input dimensions | h-10 px-3 for inputs | Inconsistent input heights | h-10 w-full px-3 | Various heights per input | Medium |  |
| 28 | Disabled states | Clear disabled styling | disabled:opacity-50 disabled:cursor-not-allowed | No disabled indication | disabled:opacity-50 | Same style as enabled | Medium |  |
| 29 | Placeholder styling | Style placeholder text appropriately | placeholder:text-gray-400 | Dark placeholder text | placeholder:text-gray-400 | Default dark placeholder | Low |  |

## Responsive

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 30 | Mobile-first approach | Start with mobile styles and add breakpoints | Default mobile + md: lg: xl: | Desktop-first approach | text-sm md:text-base | text-base max-md:text-sm | Medium | https://tailwindcss.com/docs/responsive-design |
| 31 | Breakpoint testing | Test at standard breakpoints | 320 375 768 1024 1280 1536 | Only test on development device | Test all breakpoints | Single device testing | High |  |
| 32 | Hidden/shown utilities | Control visibility per breakpoint | hidden md:block | Different content per breakpoint | hidden md:flex | Separate mobile/desktop components | Low | https://tailwindcss.com/docs/display |

## Buttons

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 33 | Button sizing | Consistent button dimensions | px-4 py-2 or px-6 py-3 | Inconsistent button sizes | px-4 py-2 text-sm | Various padding per button | Medium |  |
| 34 | Touch targets | Minimum 44px touch target on mobile | min-h-[44px] on mobile | Small buttons on mobile | min-h-[44px] min-w-[44px] | h-8 w-8 on mobile | High |  |
| 35 | Loading states | Show loading feedback | disabled + spinner icon | Clickable during loading | <Button disabled><Spinner/></Button> | Button without loading state | High |  |
| 36 | Icon buttons | Accessible icon-only buttons | aria-label on icon buttons | Icon button without label | <button aria-label='Close'><XIcon/></button> | <button><XIcon/></button> | High |  |

## Cards

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 37 | Card structure | Consistent card styling | rounded-lg shadow-md p-6 | Inconsistent card styles | rounded-2xl shadow-lg p-6 | Mixed card styling | Low |  |
| 38 | Card hover states | Interactive cards should have hover feedback | hover:shadow-lg transition-shadow | No hover on clickable cards | hover:shadow-xl transition-shadow | Static cards that are clickable | Medium |  |
| 39 | Card spacing | Consistent internal card spacing | space-y-4 for card content | Inconsistent internal spacing | space-y-4 or p-6 | Mixed mb-2 mb-4 mb-6 | Low |  |

## Accessibility

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 40 | Screen reader text | Provide context for screen readers | sr-only for hidden labels | Missing context for icons | <span class='sr-only'>Close menu</span> | No label for icon button | High | https://tailwindcss.com/docs/screen-readers |
| 41 | Focus visible | Show focus only for keyboard users | focus-visible:ring-2 | Focus on all interactions | focus-visible:ring-2 | focus:ring-2 (shows on click too) | Medium |  |
| 42 | Reduced motion | Respect user motion preferences | motion-reduce:animate-none | Ignore motion preferences | motion-reduce:transition-none | No reduced motion support | High | https://tailwindcss.com/docs/hover-focus-and-other-states#prefers-reduced-motion |

## Performance

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 43 | Configure content paths | Tailwind needs to know where classes are used | Use 'content' array in config | Use deprecated 'purge' option (v2) | content: ['./src/**/*.{js,ts,jsx,tsx}'] | purge: [...] | High | https://tailwindcss.com/docs/content-configuration |
| 44 | JIT mode | Use JIT for faster builds and smaller bundles | JIT enabled (default in v3) | Full CSS in development | Tailwind v3 defaults | Tailwind v2 without JIT | Medium |  |
| 45 | Avoid @apply bloat | Use @apply sparingly | Direct utilities in HTML | Heavy @apply usage | class='px-4 py-2 rounded' | @apply px-4 py-2 rounded; | Low | https://tailwindcss.com/docs/reusing-styles |

## Plugins

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 46 | Official plugins | Use official Tailwind plugins | @tailwindcss/forms typography aspect-ratio | Custom implementations | @tailwindcss/forms | Custom form reset CSS | Medium | https://tailwindcss.com/docs/plugins |
| 47 | Custom utilities | Create utilities for repeated patterns | Custom utility in config | Repeated arbitrary values | Custom shadow utility | shadow-[0_4px_20px_rgba(0,0,0,0.1)] everywhere | Medium |  |

## Interactivity

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 49 | Group and Peer | Style based on parent/sibling state | group-hover peer-checked | JS for simple state interactions | group-hover:text-blue-500 | onMouseEnter={() => setHover(true)} | Low | https://tailwindcss.com/docs/hover-focus-and-other-states#styling-based-on-parent-state |

## Customization

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 50 | Arbitrary Values | Use [] for one-off values | w-[350px] for specific needs | Creating config for single use | top-[117px] (if strictly needed) | style={{ top: '117px' }} | Low | https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values |
