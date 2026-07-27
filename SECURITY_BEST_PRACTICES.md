# ED Retail Security Best Practices Guide

This document outlines critical security practices for developing and maintaining the ED Retail application.

---

## 🔐 Environment Variables & Secrets

### Do's ✅
- Store all sensitive configuration in `.env` files
- Use `.env.example` as a template (commit this, not actual `.env`)
- Rotate credentials regularly (especially after security audits)
- Use secrets manager for production deployments
- Keep `.env` in `.gitignore`

### Don'ts ❌
- Never commit `.env` to version control
- Never hardcode API keys in source code
- Never expose secrets in error messages or logs
- Never include secrets in frontend configuration (unless using anon keys)
- Never share credentials via email or chat

### Setup
```bash
# 1. Copy template
cp .env.example .env

# 2. Add your Supabase credentials (from Supabase console)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 3. Never commit this file!
# Verify it's in .gitignore
```

---

## 🛡️ User Input Validation & Sanitization

### Phone Number Validation
```typescript
// ✅ GOOD: Using sanitisePhone
const sanitisedPhone = sanitisePhone(userInput);
if (!/^\d+$/.test(sanitisedPhone) || sanitisedPhone.length < 10) {
  // Invalid phone
}

// ❌ BAD: No validation
const phone = userInput; // Directly use without checking
```

### Text Input Escaping
```typescript
// ✅ GOOD: Escape special characters
const safeName = escapeMessageText(userInput);

// ❌ BAD: Direct interpolation
const message = `Hello ${userInput}`; // Could contain injection attacks
```

### Validation Rules
- **Name:** 2-100 characters, no special formatting characters
- **Phone:** 10+ digits international format
- **Location:** 3-200 characters, no newlines or extreme special chars

---

## 🔍 Error Handling & Logging

### Development vs Production

```typescript
// ✅ GOOD: Check environment
if (import.meta.env.DEV) {
  console.error('Detailed error:', error, context);
} else {
  // Production: minimal info
  console.error('Application error occurred');
  // Send to error tracking service
}

// ❌ BAD: Always log details
console.error('Database error:', dbError); // Exposed in production!
```

### What to Log
- ✅ Generic error messages (safe for user display)
- ✅ Error codes or IDs (for tracking in monitoring service)
- ✅ Non-sensitive context (user action, page)

### What NOT to Log
- ❌ API keys or tokens
- ❌ User PII (names, emails, phone numbers)
- ❌ SQL queries or database schema
- ❌ Stack traces in production
- ❌ Request/response bodies with sensitive data

---

## 🔒 Supabase & Database Security

### Authentication
```typescript
// ✅ GOOD: Check auth before sensitive operations
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  // Require authentication
  return;
}

// ❌ BAD: Allow unauthenticated writes
await supabase.from('sales').insert(data); // No auth check!
```

### Row Level Security (RLS)
- ✅ Always enable RLS on tables with sensitive data
- ✅ Define policies: who can read, write, update, delete
- ✅ Test RLS policies before deployment

### Data Encryption
- ✅ Encrypt PII at rest (use Supabase pgcrypto)
- ✅ Use HTTPS/TLS for all data in transit (handled by Supabase)
- ✅ Consider field-level encryption for sensitive data

---

## 🚀 API & Request Security

### Rate Limiting
```typescript
// ✅ GOOD: Throttle on client-side
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  if (isSubmitting) return; // Already submitting
  setIsSubmitting(true);
  // ... API call
};

// ❌ BAD: No throttling
const handleClick = () => {
  api.call(); // Can be called 1000x per second
};
```

### CORS & Headers
- ✅ Configure CORS to allow only trusted origins
- ✅ Set Content-Security-Policy headers
- ✅ Enable HTTPS-only (HSTS)
- ✅ Set X-Frame-Options to prevent clickjacking

---

## 🛒 Checkout Security

### Customer Data Handling
```typescript
// ✅ GOOD: Don't persist PII to localStorage
// Store only items and favorites
useCartStore((s) => ({ 
  items: s.items,        // Product data only
  favourites: s.favourites, // Product IDs only
}));

// ❌ BAD: Storing customer PII
localStorage.setItem('customer', JSON.stringify({
  name, phone, email // Never do this!
}));
```

### Order Creation
```typescript
// ✅ GOOD: Validate before insert
const errors = validateCustomer(name, phone, location);
if (errors) return;

const { error } = await supabase.from('sales').insert({
  customer_name: escapeMessageText(name),
  customer_phone: sanitisePhone(phone),
  customer_location: escapeMessageText(location),
  // ... other fields
});

// ❌ BAD: No validation
await supabase.from('sales').insert({
  customer_name: name, // Raw input!
  customer_phone: phone, // Could be malicious!
});
```

---

## 👤 Authentication & Admin Panel

### Password Handling
```typescript
// ✅ GOOD: Use Supabase auth
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// ❌ BAD: Storing passwords
const user = { email, password }; // Never store!
```

### Session Management
- ✅ Use Supabase session tokens (auto-managed)
- ✅ Implement logout on token expiry
- ✅ Add rate limiting to login attempts
- ✅ Consider adding 2FA for admin accounts

---

## 🧪 Testing Security

### What to Test
- ✅ Input validation boundaries (too short, too long, special chars)
- ✅ XSS prevention (inject `<script>` tags in inputs)
- ✅ SQL injection (use parameterized queries - Supabase does this)
- ✅ CSRF tokens on state-changing operations
- ✅ Rate limiting effectiveness
- ✅ Permission boundaries (unauthenticated vs authenticated)

### Test Cases
```typescript
// Test validation
expect(validateCustomer('', '', '')).toHaveProperty('name');
expect(validateCustomer('John', '0712345678', 'Dar es Salaam')).toEqual({});

// Test escaping
expect(escapeMessageText('John*_~\\')).toBe('John\\*\\_\\~\\\\');
```

---

## 📋 Pre-Deployment Checklist

- [ ] `.env` is in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] Error logging doesn't expose sensitive data
- [ ] All user inputs are validated
- [ ] All user inputs are escaped/sanitized
- [ ] Database has RLS enabled
- [ ] Admin authentication is working
- [ ] Rate limiting is configured
- [ ] HTTPS is enforced
- [ ] CSP headers are set
- [ ] Error monitoring is configured (Sentry)
- [ ] All dependencies are up-to-date (`npm audit`)

---

## 🚨 Incident Response

### If credentials are exposed:
1. **Immediately** rotate the exposed keys in Supabase console
2. **Check** git history for sensitive data
3. **Force push** if needed to remove from history
4. **Audit** access logs for unauthorized access
5. **Document** incident for compliance

### If data breach is suspected:
1. **Isolate** affected systems
2. **Notify** users within required timeframe (GDPR 72 hours)
3. **Preserve** forensic evidence
4. **Communicate** with security team
5. **Review** incident and update procedures

---

## 🔗 External Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [Supabase Security Docs](https://supabase.com/docs/guides/security)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html)
- [NPM Security Advisories](https://www.npmjs.com/advisories)

---

## Questions?

Contact the security team or open an issue on the internal wiki.

**Last Updated:** 2026-07-27  
**Next Review:** 2026-08-27
