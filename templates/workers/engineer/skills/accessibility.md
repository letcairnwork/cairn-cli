# Accessibility Skill

## Accessibility Checklist

### Keyboard Navigation
- [ ] All interactive elements accessible via keyboard
- [ ] Tab order is logical
- [ ] Focus visible on all interactive elements
- [ ] No keyboard traps
- [ ] Shortcuts don't conflict with screen readers

### Screen Readers
- [ ] Images have `alt` text
- [ ] Form inputs have labels
- [ ] Buttons have descriptive text (not just icons)
- [ ] ARIA labels for dynamic content
- [ ] Landmarks used (`nav`, `main`, `header`, `footer`)

### Visual
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for UI elements)
- [ ] Don't rely solely on color to convey information
- [ ] Text is resizable up to 200% without breaking layout
- [ ] Focus indicators visible

### Content
- [ ] Headings in logical order (h1 → h2 → h3)
- [ ] Link text is descriptive (not "click here")
- [ ] Language specified in HTML (`lang="en"`)
- [ ] Page has meaningful title

## Common Patterns

**Form Labels**
```tsx
// Bad
<input type="text" placeholder="Name" />

// Good
<label htmlFor="name">Name</label>
<input id="name" type="text" />
```

**Button Text**
```tsx
// Bad
<button><Icon /></button>

// Good
<button aria-label="Close dialog"><Icon /></button>
```

**Focus Management**
```typescript
// When opening modal, trap and restore focus
const previousFocus = document.activeElement;
modal.show();
modal.querySelector('button')?.focus();

// On close
previousFocus?.focus();
```

## Testing
- Test with keyboard only (no mouse)
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Use browser DevTools accessibility inspector
- Run automated checks (axe, Lighthouse)

## References
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [a11y Project Checklist](https://www.a11yproject.com/checklist/)
