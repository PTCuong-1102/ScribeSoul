# ✅ Pre-Deployment Checklist - ScribeSoul

**Before deploying to production, ensure all items are checked.**

## 🗄️ Database

- [ ] Neon PostgreSQL account created
- [ ] `pgvector` extension enabled: `CREATE EXTENSION IF NOT EXISTS vector;`
- [ ] Database backups configured
- [ ] Connection pooling optimized (Neon pooler enabled)
- [ ] Database indexes created for frequently queried columns
- [ ] Row Level Security (RLS) policies in place (if needed)
- [ ] Migrations tested in staging
- [ ] Database size monitoring set up

**SQL Checks**:
```sql
-- Verify pgvector is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables WHERE schemaname != 'pg_catalog';

-- Verify indexes
SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public';
```

## 🔐 Security

- [ ] All API keys and secrets rotated
- [ ] `NEXTAUTH_SECRET` is cryptographically secure (32+ chars, random)
- [ ] No hardcoded credentials in codebase
- [ ] Environment variables validated on startup (lib/env.ts)
- [ ] HTTPS enforced (Vercel default)
- [ ] CORS headers configured correctly
- [ ] Rate limiting enabled and tested
- [ ] Input validation on all API endpoints
- [ ] XSS protection verified on editor content
- [ ] SQL injection prevention (using parameterized queries with Drizzle)
- [ ] CSRF tokens in forms if not using SameSite cookies
- [ ] Sensitive data encryption (if applicable)

**Security Audit**:
```bash
npm audit
npm audit fix
```

## 🌐 Environment Configuration

- [ ] `DATABASE_URL` points to production database
- [ ] `NEXTAUTH_URL` matches production domain
- [ ] OAuth credentials updated for production
- [ ] OpenAI API key is correct and has sufficient credits
- [ ] Upstash Redis configured (or rate limiting disabled gracefully)
- [ ] `NODE_ENV=production`
- [ ] All required env vars set on Vercel
- [ ] No development credentials in production environment

## ⚡ Performance

- [ ] API response time < 2s (check via lighthouse)
- [ ] Database queries optimized (no N+1 problems)
- [ ] Images optimized and lazy-loaded
- [ ] CSS/JS minified (Next.js automatic)
- [ ] Code splitting working (bundle analysis done)
- [ ] Caching strategy implemented
- [ ] CDN configured for static assets
- [ ] Database connection pooling working

**Performance Check**:
```bash
npm run build
npm run start
# Test at http://localhost:3000
```

## ✨ Features - Complete & Tested

### Core Features
- [ ] User authentication works (signup, login, logout)
- [ ] Document CRUD operations work
- [ ] Block editor saves and loads correctly
- [ ] Document tree/hierarchy works
- [ ] Document types (Character, Setting, Plot) work

### AI Features
- [ ] Chat API functional and streams responses
- [ ] Vector embeddings generate without errors
- [ ] Semantic search returns relevant results
- [ ] RAG context properly formatted in prompts
- [ ] Citations display correctly
- [ ] Autocomplete/Refine functions work

### UI/UX
- [ ] Dark mode toggle works
- [ ] Toast notifications appear for actions
- [ ] Loading states show while data fetches
- [ ] Empty states show with guidance
- [ ] Error messages are helpful and clear
- [ ] No console errors in production build
- [ ] Keyboard shortcuts documented and work

## 🚀 Deployment

- [ ] Build succeeds: `npm run build`
- [ ] No build warnings/errors
- [ ] ESLint passes: `npm run lint`
- [ ] All tests pass (if applicable)
- [ ] Staging environment tested fully
- [ ] Vercel deployment configured
- [ ] GitHub Actions CI/CD (if configured)
- [ ] Monitoring/error tracking set up (Sentry, etc.)

**Build Check**:
```bash
npm run build
npm run lint
# Check output for warnings/errors
```

## 📊 Monitoring & Analytics

- [ ] Error tracking configured (Sentry, Datadog, etc.)
- [ ] Application performance monitoring (APM) setup
- [ ] Database monitoring/alerts configured
- [ ] API endpoint logging enabled
- [ ] User session tracking (if applicable)
- [ ] Error rate thresholds set
- [ ] Uptime monitoring active
- [ ] Alert channels configured (email, Slack, etc.)

## 📝 Documentation

- [ ] API documentation updated
- [ ] README.md current and accurate
- [ ] DEVELOPMENT_SETUP.md tested
- [ ] Known issues documented
- [ ] Environment variable guide complete
- [ ] Database schema documented

## 🔄 Post-Deployment

- [ ] Verify application loads at production URL
- [ ] Test authentication flow
- [ ] Create test document and verify sync
- [ ] Verify embeddings generate for new content
- [ ] Test semantic search
- [ ] Check error logs for issues
- [ ] Monitor database performance
- [ ] Verify rate limiting is working

### Production Testing Script:
```bash
# 1. Sign up new user
# 2. Create document titled "Test Document"
# 3. Edit content and verify "Đã lưu" message
# 4. Refresh page and verify content persists
# 5. Open chat and ask a question
# 6. Verify response is received
# 7. Switch to dark mode and back
# 8. Check browser console for errors
```

## 🚨 Rollback Plan

- [ ] Database backup before deployment
- [ ] Previous version can be deployed
- [ ] Rollback procedure documented
- [ ] Communication plan if issues occur

---

## 📞 Emergency Contacts

- **Database Issues**: Neon Support
- **Deployment Issues**: Vercel Support  
- **API Issues**: OpenAI Support
- **Auth Issues**: Auth.js Issues

---

## ✍️ Sign-Off

- [ ] Tested by: _________________ Date: _______
- [ ] Approved by: ________________ Date: _______

---

**Last Updated**: May 6, 2026

**Notes**:
- Review this checklist regularly
- Update as new features are added
- Keep monitoring active for 48 hours post-deploy
