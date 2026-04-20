# 🖋️ ScribeSoul

<div align="center">
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Vercel_AI_SDK-latest-black?style=for-the-badge&logo=vercel" alt="AI SDK" />
  </p>

  <p><b>Nền tảng viết sáng tạo tích hợp AI, tối ưu hóa trải nghiệm viết sâu và quản trị tri thức thông minh.</b></p>
  
  <p>
    <a href="#tính-năng-nổi-bật">Tính năng</a> •
    <a href="#kiến-trúc--công-nghệ">Công nghệ</a> •
    <a href="#hướng-dẫn-cài-đặt">Cài đặt</a> •
    <a href="#roadmap">Roadmap</a>
  </p>
</div>

---

## 🌟 Tổng quan

ScribeSoul không chỉ là một trình soạn thảo văn bản. Đây là một hệ sinh thái hỗ trợ tư duy, nơi tri thức của bạn được kết nối và mở rộng nhờ trí tuệ nhân tạo. Dự án tập trung vào 3 trụ cột chính:

1.  **Deep Work Editor**: Giao diện tối giản, tập trung tối đa vào nội dung với trình soạn thảo block-based hiện đại.
2.  **Semantic Knowledge Base**: Quản lý ghi chú bằng Vector Database (pgvector), cho phép tìm kiếm theo ý nghĩa thay vì chỉ từ khóa.
3.  **Context-Aware AI**: Trợ lý AI có khả năng "đọc hiểu" toàn bộ kho lưu trữ của bạn để đưa ra gợi ý, tóm tắt và phản hồi chính xác nhất.

---

## ✨ Tính năng nổi bật

### 📝 Trình soạn thảo thông minh (Block-based)
- Trải nghiệm tương tự Notion với **BlockNote**.
- Tự động lưu và đồng bộ thời gian thực qua Server Actions.
- Hỗ trợ Markdown toàn diện.

### 🧠 Semantic Search & RAG
- Hệ thống **Retrieval-Augmented Generation (RAG)**: AI trả lời dựa trên nội dung bạn đã viết.
- **Command Palette (Cmd+K)** tích hợp tìm kiếm ngữ nghĩa, giúp truy xuất thông tin tức thì.

### 🕸️ Visual Knowledge Graph
- Trực quan hóa mối liên kết giữa các tài liệu.
- Quản lý **Backlinks** tự động, xây dựng mạng lưới tri thức phi tuyến tính.

### 📁 Quản lý Workspace chuyên nghiệp
- Phân loại tài liệu theo: *Document, Character, Setting, Plot*.
- Cấu trúc cây (Nested documents) linh hoạt.

---

## 🛠️ Kiến trúc & Công nghệ

### Core Stack
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Editor**: [BlockNote](https://www.blocknotejs.org/)
- **Database**: [Neon PostgreSQL](https://neon.tech/) with `pgvector`
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **AI Engine**: [Vercel AI SDK](https://sdk.vercel.ai/) & OpenAI
- **Auth**: [NextAuth.js v5](https://authjs.dev/)

### Cấu trúc thư mục
```text
src/
├── app/             # App Router (Pages, APIs, Layouts)
├── components/      # UI Components (AI, Editor, Dashboard, etc.)
├── lib/             # Shared Utilities (Database config, AI client)
├── server/          # Server-side logic (Actions, Validations)
└── doc/             # Technical Documentation & Specs
```

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js 20+
- PostgreSQL (hỗ trợ pgvector)

### Các bước triển khai

1.  **Clone repository:**
    ```bash
    git clone https://github.com/PTCuong-1102/ScribeSoul.git
    cd ScribeSoul
    ```

2.  **Cài đặt dependencies:**
    ```bash
    npm install --legacy-peer-deps
    ```

3.  **Cấu hình biến môi trường:**
    Tạo file `.env.local` và điền các thông tin sau:
    ```env
    DATABASE_URL=your_neon_postgres_url
    OPENAI_API_KEY=your_openai_api_key
    NEXTAUTH_SECRET=your_secret_key
    AUTH_GOOGLE_ID=...
    AUTH_GOOGLE_SECRET=...
    ```

4.  **Khởi tạo Database:**
    ```bash
    npx drizzle-kit push
    ```

5.  **Chạy dự án:**
    ```bash
    npm run dev
    ```

---

## 🗺️ Roadmap

- [ ] **Giai đoạn 1**: Hoàn thiện Core RAG Engine và Semantic Search (Đang thực hiện).
- [ ] **Giai đoạn 2**: Phát triển Visual Knowledge Web (Graph view) tương tác cao.
- [ ] **Giai đoạn 3**: Hỗ trợ cộng tác thời gian thực (Multiplayer editing).
- [ ] **Giai đoạn 4**: Mobile App (PWA) và Offline-first mode.

---

## 🤝 Đóng góp

Chúng tôi luôn chào đón mọi đóng góp để ScribeSoul ngày càng hoàn thiện hơn!
1. Fork dự án
2. Tạo Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở một Pull Request

---

<div align="center">
  <p>Phát triển bởi <b>PTCuong</b></p>
  <p>Dự án được phát hành dưới bản quyền MIT.</p>
</div>
