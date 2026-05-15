# 📋 HOOK SETUP SUMMARY

## ✅ Đã hoàn thành

Đã cài đặt và cấu hình Git hooks cho dự án **ScribeSoul**:

### 1. **Pre-commit Hook** (`.husky/pre-commit`)
   - ✅ ESLint kiểm tra & tự động fix trên files bị thay đổi
   - ✅ TypeScript type check (non-blocking)
   - ✅ Ngăn commit nếu lỗi

### 2. **Pre-push Hook** (`.husky/pre-push`)
   - ✅ Full TypeScript type check
   - ✅ Full ESLint check trên toàn bộ project
   - ✅ Full production build check
   - ✅ Ngăn push nếu bất kỳ step nào fail

### 3. **Cấu hình Lint-staged**
   - ✅ `package.json` cập nhật với `lint-staged` config
   - ✅ Chỉ lint files bị thay đổi (hiệu suất tốt)

### 4. **Hướng dẫn & Scripts**
   - ✅ `.github/COMMIT_GUIDE.md` - Hướng dẫn chi tiết cho developers
   - ✅ `scripts/manage-hooks.sh` - Utility để quản lý hooks

---

## 🚀 Cách sử dụng

### Commit bình thường (pre-commit hook tự động chạy):
```bash
git add src/components/MyComponent.tsx
git commit -m "feat: Add new component"
```

### Push to remote (pre-push hook tự động chạy):
```bash
git push origin my-feature
```

### Kiểm tra status hooks:
```bash
./scripts/manage-hooks.sh status
```

### Tắt hooks tạm thời (khẩn cấp):
```bash
git commit --no-verify -m "message"  # Skip pre-commit
git push --no-verify                 # Skip pre-push
```

---

## 📦 Dependencies cài đặt

```bash
npm install -D husky lint-staged
```

**Versions:**
- husky: ^9.1.7
- lint-staged: ^17.0.4

---

## 🔧 Cấu trúc files

```
ScribeSoul/
├── .husky/
│   ├── pre-commit      # Pre-commit hook (ESLint + TypeScript)
│   └── pre-push        # Pre-push hook (Full build check)
├── scripts/
│   └── manage-hooks.sh # Hook management utility
├── .github/
│   └── COMMIT_GUIDE.md # Developer guide
└── package.json        # Updated with lint-staged config
```

---

## 📖 Workflow

```
Developer
    ↓
[Stage files] → git add
    ↓
[Commit] → git commit
    ↓
🔗 PRE-COMMIT HOOK:
   1. ESLint --fix (tự động fix nếu có thể)
   2. ESLint check
   3. TypeScript check
    ↓
✅ Pass → Commit tạo
❌ Fail → Commit bị từ chối, sửa & retry
    ↓
[Push] → git push origin
    ↓
🔗 PRE-PUSH HOOK:
   1. TypeScript check
   2. ESLint full check
   3. Full build check
    ↓
✅ Pass → Push thành công
❌ Fail → Push bị từ chối, fix locally & retry
    ↓
📍 Remote
```

---

## 🎯 Lợi ích

- ✅ **Catch lỗi sớm** - Trước khi commit/push
- ✅ **Auto-fix** - ESLint tự động sửa những lỗi có thể fix
- ✅ **Build validation** - Đảm bảo code build được trước push
- ✅ **Consistent quality** - Tất cả dev đều tuân thủ cùng rules
- ✅ **Fast feedback** - Dev biết ngay lỗi chỗ nào
- ✅ **Easy management** - Script để enable/disable/reinstall

---

## ⚙️ Tùy chỉnh

### Thêm/bỏ kiểm tra trong pre-commit:
```bash
vim .husky/pre-commit
```

Ví dụ: Uncomment `npm run build` để check build trước commit (sẽ chậm):
```bash
echo "🔨 Building project..."
if npm run build; then
  echo "✅ Build passed"
else
  echo "❌ Build failed"
  exit 1
fi
```

### Thay đổi lint-staged patterns:
```json
// package.json
"lint-staged": {
  "src/**/*.{ts,tsx,js,jsx}": [
    "eslint --fix",
    "eslint"
  ]
}
```

---

## 🐛 Troubleshooting

### Hooks không chạy?
```bash
# Reinstall hooks
npm run prepare
./scripts/manage-hooks.sh reinstall
```

### Lỗi "permission denied"?
```bash
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### ESLint fix không hoạt động?
```bash
# Manual fix
npx eslint src --fix
# Commit lại
git commit --amend -m "same message"
```

### Build fail mà khó debug?
```bash
# Local build test
npm run build

# Type check
npx tsc --noEmit

# Lint check
npm run lint
```

---

## 📚 Tài liệu tham khảo

- **Husky Guide:** `.github/COMMIT_GUIDE.md`
- **Husky Docs:** https://typicode.github.io/husky/
- **lint-staged:** https://github.com/okonet/lint-staged
- **ESLint Config:** `eslint.config.mjs`

---

## 🎓 Tiếp theo

1. **Mỗi dev** trong team cần chạy `npm install` lần đầu (Husky sẽ tự install)
2. **Read** `.github/COMMIT_GUIDE.md` để hiểu quy trình
3. **Test** bằng cách commit một file thử nghiệm
4. **Nếu cần customize**, edit `.husky/pre-commit` hoặc `.husky/pre-push`

---

**Cài đặt:** 2026-05-15  
**Status:** ✅ Production Ready

