# 🚀 Quick Start - ScribeSoul Development

**Get up and running in 5 minutes**

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Neon recommended)
- OpenAI API key

## Step 1: Setup Environment (2 min)

```bash
# Copy template
cp .env.example .env.local

# Edit and add your values
nano .env.local  # or open in VS Code
```

**Minimum required**:
```env
DATABASE_URL=your_neon_postgres_url
NEXTAUTH_SECRET=run_this_command_below
OPENAI_API_KEY=sk-your-key
```

Generate secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 2: Install Dependencies (1 min)

```bash
npm install
```

## Step 3: Setup Database (1 min)

```bash
npm run db:push
```

## Step 4: Start Development Server (1 min)

```bash
npm run dev
```

Open: http://localhost:3000

## ✅ You're Ready!

- Sign up on http://localhost:3000/register
- Create a new document
- Start typing
- Changes auto-save

## 🧪 Quick Test

1. **Create Document**: Click "Tạo Bản Thảo Mới"
2. **Add Content**: Type some text
3. **Save**: Watch for "Đã lưu" status
4. **Refresh**: `Cmd+R` - content should persist
5. **Try AI**: Type `/` in editor and select "Soul Write"

## 📖 Full Guides

- **Setup Issues?** → Read `DEVELOPMENT_SETUP.md`
- **Before Deploy?** → Check `DEPLOYMENT_CHECKLIST.md`
- **What Works?** → See `IMPLEMENTATION_COMPLETE.md`
- **What's Next?** → Review `ACTION_PLAN.md` (HIGH PRIORITY section)

## 🆘 Troubleshooting

**"Cannot connect to database"**
```bash
# Test connection
psql $DATABASE_URL
```

**"Missing environment variables"**
```bash
# Check what's needed
cat .env.example
# Copy to .env.local and fill in values
```

**"Port 3000 already in use"**
```bash
npm run dev -- -p 3001
```

**"Module not found"**
```bash
rm -rf node_modules .next
npm install
```

---

**Happy coding! 🎉**
