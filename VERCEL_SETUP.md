# Hướng dẫn cấu hình Vercel cho ScribeSoul

## Nguyên nhân không thể đăng nhập trên Vercel

Khi chạy local, ứng dụng sử dụng các giá trị fallback cho biến môi trường. Tuy nhiên, trên Vercel production, các biến này **phải được cấu hình rõ ràng**.

### Vấn đề chính:

1. **Thiếu `NEON_AUTH_BASE_URL`**: 
   - Local: dùng fallback `http://localhost:3000/auth`
   - Production: cần URL thật của Vercel (ví dụ: `https://your-app.vercel.app/auth`)

2. **Thiếu `NEON_AUTH_COOKIE_SECRET` đủ dài**:
   - Local: dùng secret tạm thời `temporary-build-secret-1234567890`
   - Production: cần secret ngẫu nhiên, ít nhất 32 ký tự

3. **Cookie domain không khớp**:
   - Auth cookies được tạo cho localhost nhưng không hoạt động trên domain Vercel

## Các bước khắc phục

### Bước 1: Tạo secret an toàn

Chạy lệnh sau để tạo secret ngẫu nhiên:

```bash
# OpenSSL
openssl rand -base64 32

# Hoặc Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Bước 2: Cấu hình biến môi trường trên Vercel

Truy cập Vercel Dashboard → Project Settings → Environment Variables

Thêm các biến sau:

| Variable | Giá trị | Môi trường |
|----------|---------|------------|
| `DATABASE_URL` | `postgresql://...` (từ Neon) | Production, Preview, Development |
| `NEON_AUTH_BASE_URL` | `https://your-app.vercel.app/auth` | Production, Preview |
| `NEON_AUTH_COOKIE_SECRET` | Secret từ Bước 1 (64+ ký tự) | Production, Preview, Development |
| `OPENAI_API_KEY` | `sk-...` | Production, Preview, Development |

**Lưu ý quan trọng:**
- `NEON_AUTH_BASE_URL` phải trùng với domain Vercel của bạn
- Nếu dùng custom domain, cập nhật thành `https://yourdomain.com/auth`
- Secret phải giống nhau giữa các môi trường để session không bị mất

### Bước 3: Deploy lại

Sau khi thêm biến môi trường:

```bash
git add .
git commit -m "fix: add auth validation and env documentation"
git push
```

Vercel sẽ tự động rebuild và deploy với biến môi trường mới.

### Bước 4: Kiểm tra logs

Nếu vẫn gặp vấn đề, kiểm tra Function Logs trên Vercel:

1. Vào Vercel Dashboard → Deployments → Chọn deployment mới nhất
2. Click vào "Function Logs"
3. Tìm lỗi liên quan đến auth hoặc environment variables

## Testing local với production config

Để test cấu hình production locally:

```bash
# Tạo file .env.local
cp .env.example .env.local

# Điền giá trị thật vào .env.local
# Sau đó chạy
npm run dev
```

## Troubleshooting

### Lỗi: "NEON_AUTH_BASE_URL is required in production"

→ Chưa set biến này trong Vercel Environment Variables

### Lỗi: "Cookie secret must be at least 32 characters"

→ Secret quá ngắn, tạo secret mới dài hơn

### Lỗi: Session không lưu sau khi redirect

→ Kiểm tra:
- `NEON_AUTH_BASE_URL` có đúng domain không
- Browser cookies có bị block không
- Secure flag có đang hoạt động (HTTPS required)

### Lỗi: "Invalid callback URL"

→ Thêm domain của bạn vào allowed domains trong Neon Auth config (nếu có)

## Tài liệu tham khảo

- [Neon Auth Documentation](https://neon.tech/docs/auth)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
