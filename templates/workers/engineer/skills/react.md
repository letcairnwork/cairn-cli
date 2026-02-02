# React Skill

## Component Patterns

**Keep components small and focused**
- One responsibility per component
- Extract reusable logic to hooks
- Props over global state

**Composition over inheritance**
```tsx
// Good - compose smaller components
<Card>
  <CardHeader title="..." />
  <CardBody>...</CardBody>
</Card>

// Bad - monolithic component with many props
<Card title="..." body="..." footer="..." />
```

## Hooks Best Practices

**useState**
- Initialize with function for expensive computations
- Group related state
- Use multiple states for independent data

**useEffect**
- One effect per concern
- Always include dependencies
- Return cleanup function for subscriptions

**Custom Hooks**
- Extract reusable logic
- Start with `use` prefix
- Return only what's needed

```tsx
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
}
```

## Performance

**Memoization**
```tsx
// Memoize expensive computations
const result = useMemo(() => expensiveOperation(data), [data]);

// Memoize callbacks passed to children
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize components
const MemoizedChild = React.memo(Child);
```

**Avoid Common Pitfalls**
- Don't define components inside components
- Don't create inline objects/arrays as props
- Don't use index as key for dynamic lists

## State Management

**When to lift state up:**
- Multiple components need the same data
- Components need to synchronize state

**When to use Context:**
- Data needed by many components at different levels
- Theme, auth, language preferences

**When to use external state (Zustand, Redux):**
- Complex state logic
- Need to access state outside React
- Performance critical (frequent updates)

## Forms

**Controlled Components**
```tsx
const [value, setValue] = useState('');

<input 
  value={value} 
  onChange={(e) => setValue(e.target.value)} 
/>
```

**Uncontrolled Components** (for simple forms)
```tsx
const inputRef = useRef<HTMLInputElement>(null);

<input ref={inputRef} defaultValue="..." />
// Access: inputRef.current?.value
```

## Error Handling

**Error Boundaries**
```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## Testing

**What to test:**
- Component renders without crashing
- Conditional rendering works
- User interactions trigger expected behavior
- Props affect output correctly

**Use React Testing Library:**
```tsx
import { render, screen, fireEvent } from '@testing-library/react';

test('button click increments counter', () => {
  render(<Counter />);
  const button = screen.getByRole('button');
  fireEvent.click(button);
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

## References
- [React Docs](https://react.dev/)
- [React Patterns](https://reactpatterns.com/)
