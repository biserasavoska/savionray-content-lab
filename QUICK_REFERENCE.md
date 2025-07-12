# Quick Reference - Local Development

## 🚀 Quick Start Commands

### Standard Reset (Most Common)
```bash
./scripts/dev-reset.sh
```

### Reset with Database
```bash
./scripts/dev-reset.sh --reset-db
```

### Quick Reset (No Database)
```bash
./scripts/dev-reset.sh --quick
```

## 🔧 Manual Commands

### Stop All Processes
```bash
pkill -f "next dev"
lsof -ti:3000 | xargs kill -9 2>/dev/null
```

### Clean Build Artifacts
```bash
rm -rf .next
rm -rf node_modules/.cache
```

### Reset Database
```bash
npx prisma migrate reset --force
npx prisma db seed
```

### Start Development Server
```bash
npm run dev
```

## 🧪 Test Users

### Admin
- **Email:** `admin@savionray.com`
- **Password:** `admin123`

### Client
- **Email:** `sara.zambelli@efaa.com`
- **Password:** `client123`

## 📍 Common URLs

- **App:** http://localhost:3000
- **Prisma Studio:** http://localhost:5555
- **Alternative ports:** 3001, 3002 (if 3000 is busy)

## ⚠️ Common Issues

### Vendor Chunk Errors
```bash
rm -rf .next && npm run dev
```

### Port Conflicts
```bash
lsof -ti:3000 | xargs kill -9 && npm run dev
```

### Authentication Failures
```bash
npx prisma migrate reset --force && npx prisma db seed
```

## 📋 Pre-Testing Checklist

- [ ] Run `./scripts/dev-reset.sh`
- [ ] Verify server on http://localhost:3000
- [ ] Test login with admin@savionray.com
- [ ] Check no console errors
- [ ] Verify navigation loads

## 🆘 Emergency Reset

If nothing works:
```bash
# Nuclear option
rm -rf .next node_modules package-lock.json
npm install
npx prisma generate
npx prisma migrate reset --force
npx prisma db seed
npm run dev
```

---

**📖 Full Guide:** See `LOCAL_DEVELOPMENT_TROUBLESHOOTING_GUIDE.md` for detailed explanations. 