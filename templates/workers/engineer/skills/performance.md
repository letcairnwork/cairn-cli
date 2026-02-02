# Performance Skill

## Performance Budgets

**Target metrics:**
- First Contentful Paint: < 1.8s
- Time to Interactive: < 3.9s
- Largest Contentful Paint: < 2.5s
- Total bundle size: < 200KB (gzipped)

## Common Optimizations

### Bundle Size
- Code split by route
- Lazy load components below the fold
- Tree-shake unused code
- Use dynamic imports
- Audit dependencies (replace heavy libraries)

### Images
- Use modern formats (WebP, AVIF)
- Lazy load images below the fold
- Provide multiple sizes (`srcset`)
- Compress images before upload
- Use CDN for static assets

### Database
- Add indexes on frequently queried columns
- Avoid N+1 queries (use joins or batch loading)
- Use pagination for large datasets
- Cache frequently accessed data
- Use read replicas for heavy read workloads

### Network
- Minimize HTTP requests
- Use HTTP/2 or HTTP/3
- Enable compression (gzip, brotli)
- Set proper cache headers
- Use CDN for static assets

### React-Specific
- Memoize expensive computations (`useMemo`)
- Memoize callbacks (`useCallback`)
- Use `React.memo` for expensive components
- Virtualize long lists
- Avoid inline function definitions in JSX

## Measuring Performance

**Tools:**
- Chrome DevTools Performance tab
- Lighthouse
- WebPageTest
- Bundle analyzer

**What to measure:**
- Core Web Vitals (LCP, FID, CLS)
- Bundle size over time
- API response times
- Database query times

## Optimization Process

1. **Measure first** - identify the actual bottleneck
2. **Set target** - define acceptable performance
3. **Optimize** - make targeted improvements
4. **Measure again** - verify improvement
5. **Repeat** - focus on next bottleneck

Don't optimize prematurely. Make it work, make it right, make it fast - in that order.

## References
- [Web.dev Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
