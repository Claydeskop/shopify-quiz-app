# Create Frontend Component
Create reusable frontend component with modern patterns.

## Requirements:
- TypeScript interfaces
- Tailwind CSS styling
- Responsive design
- Accessibility features
- Props validation
- JSDoc documentation

## Component Structure:
```tsx
interface Props {
  // Define props
}

export function ComponentName({ ...props }: Props) {
  return (
    <div className="...">
      {/* Component content */}
    </div>
  )
}