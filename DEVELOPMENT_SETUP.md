# 🚀 Setup Guide - ScribeSoul Development Environment

## ✅ Prerequisites

- Node.js 18+ (recommended 20+)
- npm or yarn
- PostgreSQL 14+ (Neon if using cloud)
- GitHub account (for OAuth)
- OpenAI API key

## 📋 Step-by-Step Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd ScribeSoul
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in all required values:

```bash
cp .env.example .env.local
```

**Required Environment Variables**:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/scribesoul

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-32+-char-secret-here

# OAuth (Optional but recommended for testing)
GITHUB_ID=your-github-app-id
GITHUB_SECRET=your-github-app-secret
GOOGLE_ID=your-google-oauth-id
GOOGLE_SECRET=your-google-oauth-secret

# AI/OpenAI
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_CHAT_MODEL=gpt-4o
OPENAI_AUTOCOMPLETE_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Rate Limiting (Optional)
UPSTASH_REDIS_REST_URL=https://your-upstash-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Environment
NODE_ENV=development
```

**Generate Secrets**:
```bash
# NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Database Setup

```bash
# Push schema to database
npm run db:push

# Generate Drizzle client
npm run db:generate

# (Optional) Seed with test data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and you should see the landing page.

---

## 🧪 Testing Checklist

### Authentication
- [ ] Can sign up with email
- [ ] Can log in with credentials
- [ ] Can log in with GitHub OAuth
- [ ] Can log in with Google OAuth
- [ ] Session persists after refresh
- [ ] Can log out

### Editor
- [ ] Can create new document
- [ ] Can edit document content
- [ ] Changes are saved (check "Đã lưu" indicator)
- [ ] Can refresh page and see saved content
- [ ] Undo/Redo works
- [ ] Can use "/" slash menu for AI commands

### AI Features
- [ ] Chat works and returns responses
- [ ] Embeddings are generated for documents
- [ ] Semantic search returns relevant results
- [ ] Citations show source documents

### UI/UX
- [ ] Dark mode toggle works
- [ ] Responsive on mobile (if supported)
- [ ] Toast notifications appear
- [ ] Error messages are clear

---

## 📦 Key NPM Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run db:push          # Push schema changes to DB
npm run db:generate      # Generate Drizzle types
npm run db:studio        # Open Drizzle Studio (DB browser)
```

---

## 🔧 Troubleshooting

### "Cannot find module" errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Database connection issues
```bash
# Test connection
psql $DATABASE_URL

# Verify schema
npm run db:studio
```

### Authentication not working
1. Check `NEXTAUTH_SECRET` is 32+ characters
2. Verify `NEXTAUTH_URL` matches your domain
3. Check OAuth credentials are correct in provider settings
4. Clear cookies and cache

### OpenAI API errors
1. Verify API key starts with `sk-`
2. Check account has sufficient credits
3. Ensure model names are correct

### Rate limiting issues
- If Upstash Redis not configured, rate limiting is disabled
- In development, you can disable rate limiting temporarily via middleware

---

## 🌐 Deployment (Vercel)

### 1. Create Vercel Project
```bash
# Connect GitHub repo to Vercel
# Or deploy via CLI:
npm install -g vercel
vercel
```

### 2. Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
- Copy all `.env.local` variables
- For production, generate new `NEXTAUTH_SECRET`
- Update `NEXTAUTH_URL` to your Vercel domain

### 3. Database on Neon
- Create Neon project
- Copy connection string to `DATABASE_URL`
- Ensure pgvector extension is enabled

### 4. Deploy
```bash
git push  # Auto-deploy via GitHub
# or
vercel --prod
```

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Guide](https://orm.drizzle.team)
- [Auth.js Setup](https://authjs.dev)
- [Vercel Deployment](https://vercel.com/docs)
- [Neon Database](https://neon.tech/docs)

---

## 🐛 Reporting Issues

If you encounter issues:
1. Check this guide first
2. Look for similar GitHub issues
3. Provide:
   - Error message/screenshot
   - Your environment (Node version, OS)
   - Steps to reproduce
   - Relevant logs

---

**Last Updated**: May 6, 2026
