# ✅ Git Hooks Setup Checklist

## 🎯 Mục đích
Tự động validate code trước commit/push để đảm bảo chất lượng.

---

## 📋 Danh sách hoàn thành

- [x] **Husky installed** - `npm install -D husky lint-staged`
- [x] **Pre-commit hook** - `.husky/pre-commit` (ESLint + TypeScript)
- [x] **Pre-push hook** - `.husky/pre-push` (Full build check)
- [x] **Lint-staged config** - `package.json` - Chỉ lint files bị thay đổi
- [x] **Prepare script** - `npm run prepare` - Auto-install hooks
- [x] **Management utility** - `scripts/manage-hooks.sh` - Manage hooks
- [x] **Documentation** - `.github/COMMIT_GUIDE.md` - Developer guide
- [x] **Summary** - `HOOK_SETUP_SUMMARY.md` - Tóm tắt setup

---

## 🚀 Bước setup ban đầu (cho team)

### Mỗi developer cần:

```bash
# 1. Clone repo (nếu chưa có)
git clone <repo>
cd ScribeSoul

# 2. Cài dependencies (Husky tự install hooks)
npm install

# 3. Verify hooks hoạt động
./scripts/manage-hooks.sh status

# 4. Commit một file test
echo "test" > test.txt
git add test.txt
git commit -m "test: verify hooks"
# → Pre-commit hook sẽ chạy
```

---

## 💡 Workflow hàng ngày

### Pre-commit (tự động trước commit):
1. ✅ ESLint check + auto-fix
2. ✅ TypeScript type check
3. ✅ Report nếu lỗi

### Pre-push (tự động trước push):
1. ✅ Full TypeScript check
2. ✅ Full ESLint check
3. ✅ Full production build
4. ✅ Block push nếu fail

---

## 🔨 Commands hay dùng

```bash
# Check hook status
./scripts/manage-hooks.sh status

# Reinstall hooks nếu bị corrupt
./scripts/manage-hooks.sh reinstall

# Disable hooks tạm thời
./scripts/manage-hooks.sh disable

# Enable hooks lại
./scripts/manage-hooks.sh enable

# Manual linting
npm run lint

# Manual type check
npx tsc --noEmit

# Manual build
npm run build

# Commit mà skip hooks (khẩn cấp)
git commit --no-verify -m "message"

# Push mà skip hooks (khẩn cấp)
git push --no-verify
```

---

## 🐛 Troubleshooting

### Problem: Hooks không chạy
```bash
npm run prepare
./scripts/manage-hooks.sh reinstall
```

### Problem: ESLint fail nhưng khó sửa
```bash
# Xem chi tiết lỗi
npm run lint -- src/myfile.ts

# Auto-fix nếu có thể
npx eslint src --fix
```

### Problem: Build fail
```bash
# Test build cục bộ
npm run build

# Xem lỗi chi tiết
npm run build 2>&1 | tail -50
```

### Problem: TypeScript fail
```bash
# Check lỗi type
npx tsc --noEmit

# Inspect file cụ thể
npx tsc --noEmit src/myfile.ts
```

---

## 📚 Documentation

- **Full Guide:** `.github/COMMIT_GUIDE.md`
- **Setup Summary:** `HOOK_SETUP_SUMMARY.md` (file này)
- **Hook Scripts:** `.husky/pre-commit`, `.husky/pre-push`
- **Config:** `package.json` (lint-staged section)

---

## ✨ Tips

1. **Pre-commit hook chạy nhanh** → chỉ check files bị thay đổi
2. **Pre-push hook chạy chậm** → full build check (có thể skip nếu cần)
3. **Auto-fix ESLint** → nhiều lỗi sẽ tự động sửa
4. **TypeScript non-blocking pre-commit** → không ngăn commit, chỉ warn
5. **TypeScript blocking pre-push** → ngăn push nếu type error

---

## 🎓 Onboarding mới dev

Khi dev mới join:

1. Clone repo + `npm install` → Husky tự install hooks
2. Read `.github/COMMIT_GUIDE.md`
3. Test với `git commit` lần đầu
4. Ask teammates nếu stuck

---

## ❓ FAQs

**Q: Tại sao commit chậm?**  
A: Pre-commit check bình thường nhanh (<5s). Nếu chậm, có thể là project lớn. Optimize bằng cách chỉ lint files bị thay đổi.

**Q: Có thể disable hooks?**  
A: Có, nhưng **không nên** thường xuyên. Dùng `--no-verify` chỉ khi khẩn cấp.

**Q: Hooks chạy trên CI/CD không?**  
A: Không, chỉ cục bộ. CI/CD có riêng workflows (`.github/workflows/`).

**Q: Có thể customize hooks không?**  
A: Có, edit `.husky/pre-commit` hoặc `.husky/pre-push`.

---

## 🔐 Security Notes

- Hooks chạy trên dev machine → không thay thế CI/CD checks
- Pre-commit/pre-push là first line of defense
- `.github/workflows/` là source of truth cho quality gates

---

**Last updated:** 2026-05-15  
**Status:** ✅ Production Ready
