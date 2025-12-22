## CSS best practices

- **Consistent Methodology**: Apply and stick to the project's consistent CSS methodology (Tailwind, BEM, utility classes, CSS modules, etc.) across the entire project
- **Avoid Overriding Framework Styles**: Work with your framework's patterns rather than fighting against them with excessive overrides
- **Maintain Design System**: Establish and document design tokens (colors, spacing, typography) for consistency
- **Minimize Custom CSS**: Leverage framework utilities and components to reduce custom CSS maintenance burden
- **Performance Considerations**: Optimize for production with CSS purging/tree-shaking to remove unused styles

## Tailwind CSS Guidelines

### Responsive Design

Use mobile-first responsive design with Tailwind breakpoints:

```typescript
// Mobile-first: base styles apply to mobile, breakpoints add larger screen styles
<div className="w-full md:w-1/2 lg:w-1/3">
```

| Breakpoint | Min Width | Use Case |
|------------|-----------|----------|
| (default)  | 0px       | Mobile phones |
| `sm:`      | 640px     | Large phones |
| `md:`      | 768px     | Tablets |
| `lg:`      | 1024px    | Laptops |
| `xl:`      | 1280px    | Desktops |

### Dark Mode

Support dark mode using `dark:` variants:

```typescript
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

### Color Palette

Use consistent semantic colors:

| Purpose | Light Mode | Dark Mode |
|---------|------------|-----------|
| Primary actions | `blue-600` | `blue-500` |
| Success states | `green-600` | `green-500` |
| Error/danger | `red-500` | `red-400` |
| Warning | `amber-500` | `amber-400` |
| Secondary text | `gray-500` | `gray-400` |
| Borders | `gray-200` | `gray-700` |

### Accessibility

- **Tap Targets**: Minimum 44x44px for interactive elements on touch devices
- **Focus States**: Always include visible focus indicators (`focus:ring-2 focus:ring-blue-500`)
- **Color Contrast**: Ensure sufficient contrast ratios (4.5:1 for normal text)

```typescript
// Good: Large tap target with focus state
<button className="min-h-[44px] min-w-[44px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
```
