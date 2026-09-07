---
name: rf-release
description: "Quy trình tự động nâng phiên bản (Semantic Versioning) và đồng bộ nhật ký cập nhật (Changelog & Release Notes) vào mã nguồn App_Main.html và tài liệu hệ thống mỗi khi deploy tính năng mới, sửa lỗi hoặc tối ưu vận hành."
version: 1.0.0
---

# RF_Workspace_Pro Release & Auto-Changelog Engine

Skill này chuẩn hóa quy trình **Tự động cập nhật Phiên bản (Semantic Versioning)** và **Ghi nhận Nhật ký Cập nhật (Changelog / Release Notes)** cho hệ điều hành `RF_Workspace_Pro`.

---

## 1. NGUYÊN TẮC HOẠT ĐỘNG (CORE PRINCIPLES)

Mỗi khi AI thực hiện bất kỳ thay đổi nào (thêm tính năng, đổi giao diện, sửa logic Poka-Yoke, tối ưu CSDL...), AI **BẮT BUỘC** phải tự động:

1. **Xác định cấp độ nâng phiên bản (Semantic Versioning `vMAJOR.MINOR.PATCH`)**:
   - **`MAJOR` (Ví dụ: `v3.0.0`)**: Thay đổi lớn về kiến trúc hệ thống, đập đi xây lại luồng xử lý hoặc phá vỡ cấu trúc CSDL cũ.
   - **`MINOR` (Ví dụ: `v2.10.0`)**: Thêm tính năng mới, thêm modal mới, thêm tab mới, thay đổi quy trình vận hành (như Poka-Yoke, Hộp đen thợ, BOM drawer...).
   - **`PATCH` (Ví dụ: `v2.9.1`)**: Sửa lỗi giao diện, căn chỉnh font chữ/màu sắc, sửa bug nhỏ không ảnh hưởng cấu trúc.

2. **Cập nhật đồng thời vào 2 vị trí bắt buộc**:
   - **Vị trí 1: Mã nguồn [`App_Main.html`](file:///c:/Users/ADMIN/RF_Workspace_Pro/App_Main.html)**:
     - Thêm 1 object release mới vào đầu mảng `RELEASES` trong component `ChangelogTab`.
     - Cập nhật số phiên bản tại badge sidebar footer (`<span ...>vX.X.X</span>`) và banner header.
   - **Vị trí 2: File nhật ký [`CHANGELOG.md`](file:///c:/Users/ADMIN/RF_Workspace_Pro/.agents/skills/rf-release/CHANGELOG.md)**:
     - Ghi nhận chi tiết các mục kỹ thuật và hướng dẫn vận hành cho Ban Quản Trị.

---

## 2. CẤU TRÚC OBJECT RELEASE MẪU TRONG `App_Main.html`

Khi chèn release mới vào `RELEASES` của `ChangelogTab`, cấu trúc chuẩn là:

```javascript
{
    version: 'Royal v2.10.0', // Tên phiên bản mới
    date: '23/08/2026',       // Ngày phát hành (DD/MM/YYYY)
    isLatest: true,           // Luôn đặt true cho bản mới nhất (các bản cũ đặt false)
    badge: 'MỚI NHẤT',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    title: 'Tiêu đề ngắn gọn tóm tắt nâng cấp chính',
    summary: 'Mô tả chi tiết 1-2 câu về mục đích và lợi ích cho xưởng sản xuất.',
    categories: ['Sản Xuất', 'UI/UX'], // Các tag phân loại: Sản Xuất, Bảo Mật, Kho Hàng, Tài Chính, UI/UX, KCS
    items: [
        {
            icon: 'fa-shield-alt',      // FontAwesome icon
            color: 'text-rose-400',     // Màu icon nổi bật
            title: 'Tên tính năng 1',
            desc: 'Chi tiết tính năng và lợi ích mang lại...'
        },
        {
            icon: 'fa-bolt',
            color: 'text-amber-400',
            title: 'Tên tính năng 2',
            desc: 'Chi tiết tính năng...'
        }
    ]
}
```

---

## 3. CHECKLIST TRƯỚC KHI BÀN GIAO DEPLOY (`clasp push`)

Trước khi hướng dẫn người dùng chạy `clasp push` hoặc kết thúc turn, AI phải tự rà soát:
- [ ] Phiên bản mới đã được bump đúng quy tắc `MAJOR.MINOR.PATCH` chưa?
- [ ] Mảng `RELEASES` trong `ChangelogTab` của [`App_Main.html`](file:///c:/Users/ADMIN/RF_Workspace_Pro/App_Main.html) đã được thêm bản ghi mới chưa?
- [ ] Badge phiên bản ở Footer Sidebar và Hero Banner đã khớp với phiên bản mới chưa?
- [ ] File [`CHANGELOG.md`](file:///c:/Users/ADMIN/RF_Workspace_Pro/.agents/skills/rf-release/CHANGELOG.md) đã được lưu vết chưa?
