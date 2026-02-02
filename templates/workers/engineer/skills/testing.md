# Testing Skill

## Testing Philosophy

**Write tests that catch real bugs, not tests that hit coverage metrics.**

Test behavior, not implementation details. If you refactor without changing behavior, tests should still pass.

## Test Pyramid

1. **Unit tests** (most) - pure functions, utilities, business logic
2. **Integration tests** (some) - components working together, API calls
3. **E2E tests** (few) - critical user flows only

## What to Test

**Do test:**
- Edge cases (null, undefined, empty arrays, max values)
- Error conditions (network failures, validation errors)
- Business logic and calculations
- State transitions
- User interactions

**Don't test:**
- Implementation details (internal state, private methods)
- Third-party library code
- Trivial getters/setters

## Test Structure

Use Arrange-Act-Assert pattern:
```typescript
test('adds two numbers', () => {
  // Arrange
  const a = 2, b = 3;
  
  // Act
  const result = add(a, b);
  
  // Assert
  expect(result).toBe(5);
});
```

## Test Naming

Use descriptive names that explain what's being tested:
```typescript
// Bad
test('test 1')

// Good
test('returns error when input is negative')
```

## Before Committing

- All tests must pass
- New code must have tests
- If you find a bug, write a failing test first, then fix it
