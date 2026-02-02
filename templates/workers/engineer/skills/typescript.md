# TypeScript Skill

## Type Safety Best Practices

**Avoid `any`**
- Use `unknown` for truly unknown types
- Use generics for reusable type-safe code
- Use union types for known possibilities

**Strict Mode**
- Always enable `strict: true`
- Enable `noUncheckedIndexedAccess`
- Enable `noImplicitOverride`

## Common Patterns

**Discriminated Unions**
```typescript
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
```

**Type Guards**
```typescript
function isError(result: Result<T>): result is { success: false; error: string } {
  return !result.success;
}
```

**Utility Types**
- `Partial<T>` - all properties optional
- `Pick<T, K>` - subset of properties
- `Omit<T, K>` - exclude properties
- `Record<K, V>` - object with keys K and values V

## Error Handling

Prefer explicit error types over throwing:
```typescript
async function fetchData(): Promise<Result<Data>> {
  try {
    const data = await api.get('/data');
    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
```

## References
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Type Challenges](https://github.com/type-challenges/type-challenges)
