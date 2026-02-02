# Security Skill

## Security Checklist

Before shipping code, check:

### Input Validation
- [ ] All user inputs validated and sanitized
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (escape output, use frameworks that auto-escape)
- [ ] File uploads validated (type, size, content)

### Authentication & Authorization
- [ ] User authentication required where needed
- [ ] Authorization checks on every protected action
- [ ] Session tokens secure (HttpOnly, Secure, SameSite)
- [ ] Password requirements enforced (length, complexity)

### Secrets Management
- [ ] No secrets in code (API keys, passwords, tokens)
- [ ] Environment variables for sensitive config
- [ ] Secrets rotated regularly
- [ ] `.env` in `.gitignore`

### API Security
- [ ] Rate limiting on endpoints
- [ ] CORS configured properly
- [ ] CSRF protection for state-changing operations
- [ ] API keys validated

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] HTTPS for data in transit
- [ ] PII handled according to privacy policy
- [ ] Logs don't contain sensitive data

## Common Vulnerabilities

**XSS (Cross-Site Scripting)**
```typescript
// Bad
element.innerHTML = userInput;

// Good
element.textContent = userInput;
// or use framework with auto-escaping (React, Vue)
```

**SQL Injection**
```typescript
// Bad
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// Good
db.query('SELECT * FROM users WHERE id = ?', [userId]);
```

**Insecure Direct Object References**
```typescript
// Bad
const file = await getFile(req.params.fileId);

// Good
const file = await getFile(req.params.fileId);
if (file.userId !== req.user.id) throw new Error('Unauthorized');
```

## References
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Security Headers](https://securityheaders.com/)
