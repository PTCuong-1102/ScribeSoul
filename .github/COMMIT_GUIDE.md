# 🔗 Git Hooks & Commit Guide

## Overview

ScribeSoul sử dụng Git hooks để tự động validate code trước khi commit/push. Điều này giúp đảm bảo:

- ✅ Mọi commit đều pass ESLint checks
- ✅ TypeScript không có lỗi type
- ✅ Push chỉ được phép khi project build thành công
- ✅ Tự động fix các lỗi ESLint có thể fix được

---

## 🎯 Hooks được cài đặt

### 1. **Pre-commit Hook** (`.husky/pre-commit`)

Chạy **trước khi commit** được tạo.

**Các kiểm tra:**
- 📝 **ESLint** trên các files bị thay đổi → tự động fix nếu có thể
- 📦 **TypeScript type check** (non-blocking)

**Nếu lỗi:**
- Commit sẽ bị **từ chối**
- Hãy sửa lỗi và commit lại

**Bypass hook (khẩn cấp):**
```bash
git commit --no-verify -m "message"  # ⚠️ Không nên dùng thường xuyên
```

### 2. **Pre-push Hook** (`.husky/pre-push`)

Chạy **trước khi push** lên remote.

**Các kiểm tra:**
- 📦 TypeScript type check
- 📝 ESLint trên **tất cả files**
- 🔨 **Full production build**

**Nếu lỗi:**
- Push sẽ bị **từ chối**
- Hãy sửa lỗi cục bộ trước khi push

**Bypass hook (khẩn cấp):**
```bash
git push --no-verify
```

---

## 📋 Workflow hàng ngày

### Lần đầu tiên clone repo:

```bash
npm install      # Cài đặt dependencies + Husky
```

### Commit code:

```bash
# 1. Thay đổi code
vim src/components/MyComponent.tsx

# 2. Stage changes
git add src/components/MyComponent.tsx

# 3. Commit (pre-commit hook tự động chạy)
git commit -m "feat: Add new component"

# ✨ Nếu pass: commit được tạo
# ❌ Nếu fail: commit bị hủy, sửa lỗi rồi commit lại
```

### Push code:

```bash
git push origin feature/my-feature

# 🔨 Pre-push hook chạy:
#   1. TypeScript type check
#   2. ESLint full check
#   3. Full build
# ✨ Nếu pass: push thành công
# ❌ Nếu fail: push bị hủy
```

---

## 🐛 Xử lý lỗi

### ESLint errors

```bash
# Tự động fix các lỗi có thể fix được:
npx eslint src --fix

# Hoặc commit lại để pre-commit hook tự động fix
git commit --amend -m "same message"
```

### TypeScript errors

```bash
# Check lỗi type:
npx tsc --noEmit

# Sửa lỗi trong editor (thường là type annotations)
vim src/myfile.ts

# Commit lại
git commit --amend -m "same message"
```

### Build errors

```bash
# Test build cục bộ:
npm run build

# Xem lỗi chi tiết và sửa
# Commit lại
git commit --amend -m "same message"
```

---

## ⚙️ Cấu hình Hooks

### Chỉnh sửa pre-commit hook:

```bash
vim .husky/pre-commit
```

- Thêm/bỏ kiểm tra theo nhu cầu
- Uncomment `npm run build` nếu muốn check build trước commit (sẽ chậm hơn)

### Chỉnh sửa pre-push hook:

```bash
vim .husky/pre-push
```

- Thay đổi logic kiểm tra
- Thêm các step kiểm tra tùy chỉnh

### Chỉnh sửa lint-staged config:

```bash
# File: package.json
# Tìm section "lint-staged" và edit
{
  "lint-staged": {
    "src/**/*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "eslint"
    ]
  }
}
```

---

## 🚀 Tips & Tricks

### 1. **Kiểm tra trước commit:**
```bash
npx lint-staged           # Simulate pre-commit
npx tsc --noEmit          # TypeScript check
npm run build             # Full build check
```

### 2. **Tạm dừng hooks (dev mode):**
```bash
rm -rf .husky            # Tắt Husky
npm run prepare          # Bật lại
```

### 3. **Skip specific check:**
```bash
# Nếu hook chạy lâu, có thể tách thành stages khác nhau
# Ví dụ: pre-commit chỉ ESLint, pre-push thêm build
```

### 4. **CI/CD integration:**

Hooks cục bộ giúp catch lỗi sớm, nhưng `.github/workflows` vẫn là source of truth cho CI/CD.

---

## 📚 Tài liệu liên quan

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [ESLint Guide](https://eslint.org/docs/rules/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## ❓ FAQ

**Q: Hook chạy quá lâu?**
- A: Điều này là bình thường với build check. Có thể uncomment build check trong pre-commit để tránh, và chỉ check build ở pre-push.

**Q: Làm sao để skip hook tạm thời?**
- A: Dùng `--no-verify` nhưng chỉ trong trường hợp khẩn cấp. Ví dụ: `git commit --no-verify`.

**Q: Hook không chạy?**
- A: Chạy `npm run prepare` để reinstall Husky, hoặc check `.git/hooks/pre-commit` có executable không.

**Q: Phải làm gì nếu lỗi ESLint khó fix?**
- A: Dùng `// eslint-disable-next-line rule-name` nếu lỗi là false positive, hoặc refactor code.

---

**Cập nhật lần cuối:** 2026-05-15  
**Phiên bản:** 1.0
