# ScribeSoul - UI/UX & User Flow Specification

## 1. Triết lý Thiết kế (Design Philosophy)
- **Minimalist & Focus-First**: Giao diện giả lập trang giấy trống (Light) hoặc không gian tối sâu thẳm (Dark). Công cụ ẩn (Hover/Slash menu).
- **Contextual AI**: AI hỗ trợ dạng Drawer hoặc Inline, không che khuất văn bản.
- **Seamless Navigation**: Keyboard-first (Cmd+K, Cmd+J, / menu).

## 2. Sơ đồ Trang (Sitemap)
- `/login`, `/register`: Auth (Split-screen).
- `/(workspace)/[id]`: Dashboard (Sidebar + Content).
- `/documents/[docId]`: Core Editor (3-column layout).
- `/chat`: AI Brainstorm (ChatGPT-style).
- `/settings`: Quản lý cá nhân.

## 3. Chi tiết Giao diện
### 3.1. Auth
- Trái: Form tối giản. Phải: Artwork/Trích dẫn văn học.
### 3.2. Dashboard
- Sidebar: Cây thư mục (Chương, Nhân vật, Bối cảnh).
- Main: Recent Drafts + Knowledge Mini-Graph (Biểu đồ mạng nhện).
### 3.3. Document Editor
- Cột 1: Sidebar.
- Cột 2: Main Editor (Max-width 800px, BlockNote, Slash Menu).
- Cột 3: AI Assistant Drawer (Cmd+J).
### 3.4. AI Chat
- Context Selector (Toàn dự án, Theo thư mục, Theo file).
- History Sidebar.

## 4. Tính năng AI UX
- **Inline AI Generator**: Bôi đen text -> Menu AI -> Stream kết quả trực tiếp.
- **Background Extraction**: Tự động nhận diện thực thể (Nhân vật, Địa điểm) và tạo link nét đứt.
- **Character Roleplay**: Chat với AI trong vai nhân vật dựa trên dữ liệu đã viết.

## 5. Luồng Tương tác Cốt lõi
- **Flow 1**: [[ -> Chọn tài liệu -> Badge link -> Hover preview.
- **Flow 2**: Đang viết -> Cmd+J -> Hỏi AI -> Tra cứu thông tin -> Đóng nhanh bằng Esc.