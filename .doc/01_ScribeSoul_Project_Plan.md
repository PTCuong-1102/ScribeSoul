```markdown

\\# 🗺️ ScribeSoul - Project Plan (MVP 10 Weeks)



\\## 🎯 Mục tiêu MVP

Xây dựng nền tảng viết \\\& quản lý tri thức với:

\\- Editor block-based (Notion-like)

\\- Liên kết hai chiều cơ bản (`\\\[\\\[ ]]`)

\\- AI RAG hiểu ngữ cảnh nhân vật/cốt truyện, hỗ trợ chat \\\& phân tích

\\- Bảo mật dữ liệu, xuất/import Markdown

\\- Thời gian: 10 tuần | Team: 1-3 dev | Ngân sách cloud: <$80/tháng



\\## 📅 Lộ trình chi tiết



| Tuần | Giai đoạn | Deliverables | Tiêu chí hoàn thành |

|------|-----------|--------------|---------------------|

| 1-2  | Foundation \\\& UI Core | Setup Next.js, Auth, NeonDB, BlockNote.js, Layout/Theme | Đăng nhập được, tạo workspace, editor render JSON block |

| 3-4  | Data Layer \\\& Linking | Schema DB, Server Actions CRUD, `\\\[\\\[ ]]` parser, Backlink UI | Link hai chiều hoạt động, export/import `.md` chuẩn |

| 5-6  | AI Pipeline (RAG) | Chunking engine, pgvector setup, LLM integration, Chat UI | AI trả lời đúng ngữ cảnh, citation link ngược, latency <3s |

| 7-8  | AI Agent \\\& Polish | Character Roleplay, Plot Checker, Loading/Streaming, Error fallback | Chat nhân vật ổn định, retention D7 >25%, bug critical = 0 |

| 9-10 | Beta \\\& Deploy | Vercel + Neon production, Analytics, Stripe trial, Onboarding flow | 50 beta testers onboarded, AI cost < $0.02/session, NPS >40 |



\\## 👥 Vai trò \\\& Trách nhiệm

\\- \\\*\\\*Fullstack Dev\\\*\\\*: Next.js, NeonDB, Server Actions, AI pipeline, Deploy

\\- \\\*\\\*UX/UI Designer\\\*\\\*: Component library, Editor UX, AI chat flow, Responsive

\\- \\\*\\\*QA/Content Tester\\\*\\\*: Prompt tuning, chunking accuracy, hallucination tracking



\\## ⚠️ Quản lý rủi ro

| Rủi ro | Xác suất | Tác động | Giải pháp |

|--------|----------|----------|-----------|

| AI hallucination | Cao | Trung bình | Strict RAG, bắt buộc citation, chế độ "Human Review" trước khi chèn |

| Chi phí token bùng nổ | Trung bình | Cao | Cache Redis, model rẻ cho draft, giới hạn context theo plan |

| Data sync conflict | Thấp | Cao | Optimistic UI + queue retry, lock version khi AI edit |

| Scope creep | Cao | Cao | Strict PRD, kill tính năng không dùng sau 2 tuần beta |



\\## 📊 KPIs thành công MVP

\\- `AI Session Rate` > 40%

\\- `Context Accuracy` > 85% (đánh giá thủ công 200 mẫu)

\\- `Time-to-First-Value` < 3 phút

\\- `Retention D7` > 30%

\\- `AI Cost/Session` < $0.015



\\## 🚀 Next Steps

1\\. Khởi tạo repo, config NeonDB + pgvector

2\\. Cài đặt `auth.js` (thay thế NeonAuth - xem Tech Spec)

3\\. Triển khai Phase 1 trong 2 tuần đầu

```



\---



