# 🏛️ HIẾN PHÁP KIẾN TRÚC & DESIGN SYSTEM: RF_WORKSPACE_PRO v3.0

> **Kim chỉ nam bắt buộc áp dụng toàn diện cho toàn bộ dự án từ phiên bản 3.0 trở đi.**
> Mọi phân hệ khi tái cấu trúc hoặc phát triển mới bắt buộc phải tuân thủ 100% các điều khoản dưới đây.

---

## PHẦN I: BẢNG CHUẨN HÓA LOGIC NGHIỆP VỤ CỐT LÕI (CORE LOGIC FOUNDATION)

### 1. Phân Hệ Nhân Sự: "1 Chạm — Không Cày Cấp Ảo — Kỷ Luật Minh Bạch"

* **Bỏ hoàn toàn hệ thống RPG & Level ảo:**
  * Xóa bỏ danh hiệu Cấp 73 Thần Thoại, Cấp 2 Tân Thủ, thanh điểm EXP 2 tỷ.
  * Trọng tâm nhân sự quay về **giá trị thực tế**: **Số giờ làm việc thực tế** (Chấm công) và **Sản lượng đạt chuẩn KCS** (Sản xuất).

* **Cơ chế Chấm công 1 chạm (Zero-Friction Check-in):**
  * Nhân viên mở app $\rightarrow$ Hệ thống tự động so khớp ca làm việc $\rightarrow$ Chỉ hiển thị duy nhất **1 nút bấm lớn theo ca hiện tại**: `[ 👉 VÀO CA SÁNG ]` hoặc `[ 🔴 KẾT THÚC CA ]`. Bấm xong là hoàn tất, không bắt chọn ca hay xác nhận rườm rà.

* **Quy chuẩn Kỷ luật & Phạt vi phạm Minh bạch:**
  * Công khai bảng quy chế vi phạm chung (Đi trễ, vi phạm quy cách đóng gói, bỏ vị trí).
  * **Cơ chế ghi nhận:** Tự động tính toán ngầm và tổng hợp vào cột `Khấu trừ vi phạm` trong bảng lương cuối tháng. Không bêu rếu lý do cá nhân trên màn hình điều hành hàng ngày.

---

### 2. Phân Hệ Kho Hàng: "Trị Tận Gốc Bệnh Lệch Kho 96%"

* **Chuẩn hóa Đơn Vị Tính Quy Đổi (UOM Conversion Table):**
  * **Kính:** Nhập vào theo $m^2$ hoặc Tấm lớn ($180 \times 200\text{cm}$) $\rightarrow$ Định mức xuất theo chiếc bể cụ thể phải quy đổi qua công thức diện tích tiêu hao:
    $$\text{Diện tích tiêu hao} = (D \times R + 2 \times D \times C + 2 \times R \times C) \times 1{,}05 \text{ (Hao hụt 5\%)}$$
  * **Keo silicone:** Nhập theo Thùng (24 chai) $\rightarrow$ Xuất theo chai/ml.

* **Sửa dứt điểm Logic Hoàn Hàng (Reverse Logistics Reversal):**
  * **LỖI CŨ:** Khi đơn hàng bị sàn báo hủy/hoàn $\rightarrow$ Hệ thống tự động cộng ngược tồn kho ngay lập tức trên máy tính $\rightarrow$ Trong khi hàng thực tế còn đang trôi dạt 15 ngày trên xe vận chuyển hoặc đã vỡ nát!
  * **LOGIC MỚI:** Đơn hàng hoàn về sàn $\rightarrow$ Chỉ đưa vào trạng thái `Chờ Kiểm Định Hàng Hoàn`. **TUYỆT ĐỐI KHÔNG TỰ ĐỘNG CỘNG TỒN KHO.** Chỉ khi thủ kho nhận kiện hàng vật lý tại xưởng, rạch thùng kiểm tra đạt chuẩn thì mới bấm nút `[Nhập Lại Kho Thành Phẩm]` hoặc `[Thanh Lý Phế Liệu]`.

---

### 3. Phân Hệ Tài Chính: "Mô Hình Dòng Tiền Hai Tầng (Two-Tier Treasury)"

* **Tầng 1 — Vốn Lưu Động Xưởng (Operating Cash Flow):**
  * Màn hình Tab Tài Chính điều hành hàng ngày **CHỈ THEO DÕI DUY NHẤT VỐN LƯU ĐỘNG XƯỞNG (~32 triệu VNĐ)**:
    $$\text{Tiền Khả Dụng} = \text{TK Công Ty} + \text{TK Kế Toán} + \text{Két Sắt Xưởng} + \text{Ví Shopee (Đã đối soát)}$$
  * Tự động tính chỉ số sinh tử:
    $$\text{Số ngày cầm cự (Cash Runway)} = \frac{\text{Tiền Khả Dụng}}{\text{Chi phí trung bình ngày}}$$

* **Tầng 2 — Quỹ Tài Sản Đầu Tư Dài Hạn (Treasury & Investment Vault):**
  * Tách riêng khoản **689 triệu VNDC và danh mục đầu tư tích lũy** sang một phân hệ độc lập mang tên `Tài Sản & Đầu Tư (Vault)`. Không để số tiền này làm nhiễu loạn báo cáo chu chuyển tiền mặt của xưởng.

* **Khoản cho vay nhân sự:** Hạch toán chính xác vào tài khoản `Phải thu nội bộ (Asset)`, cấm đưa vào `Chi phí vận hành (OPEX)`.

---

### 4. Phân Quyền Bảo Mật Dữ Liệu Tuyệt Đối (Role-Based Data Masking)

* **Đối với Thợ Xưởng / Thủ Kho / CTV:**
  * **Khóa và ẩn 100%:** Cột `Giá vốn (COGS)`, `Giá nhập nguyên vật liệu`, và `Tỷ lệ lãi gộp (75%)` trên toàn bộ các tab Kho Hàng, Đơn Hàng và Sản Xuất.
  * Thợ và thủ kho chỉ được phép thấy **Đơn vị vật lý**: *Số tấm kính, số lọ keo, số lượng bể tồn (cái/bộ).*

* **Đối với Tài Khoản Tối Cao & Kế Toán:** Toàn quyền truy cập số liệu tài chính P&L.

---

## PHẦN II: DESIGN SYSTEM "HALLMARK ROYAL WORKBENCH" (UI STANDARD)

Mọi giao diện trong hệ thống bắt buộc phải tuân theo bộ quy chuẩn thiết kế sau:

### 1. Bảng Màu Chuẩn (Color Palette & Tokens)

* **Nền tảng (Backgrounds):**
  * App Background: `#09090b` (Deep Obsidian - Đen tuyền sang trọng, không dùng màu xám nhờ nhờ).
  * Card / Container: `#121214` (Dark Charcoal).
  * Popover / Modal / Tooltip: `#18181b` (Elevated Surface) với hiệu ứng kính mờ `backdrop-blur-xl`.

* **Màu Điểm Nhấn (Accents):**
  * **Gold Hoàng Gia (`#d4af37`):** Dành riêng cho trạng thái Active, Badge quan trọng, Viền điểm nhấn tinh tế.
  * **Emerald (`#10b981`):** Trạng thái thành công, Check-in, Hoàn thành KCS.
  * **Rose (`#f43f5e`):** Cảnh báo trễ SLA, Vi phạm kỷ luật, Lệch kho.
  * **Muted Zinc (`#71717a`):** Nhãn chữ phụ, đường kẻ phân cách mờ `border-white/[0.06]`.

---

### 2. Quy Tắc Trị "Hội Chứng Hộp Lồng Hộp" (The Box-in-Box Rule)

* **CẤM:** Không bọc viền border và đổi màu nền cho từng khối text nhỏ.
* **THAY BẰNG:** Sử dụng **Khoảng trắng (Whitespace: `space-y-3`, `gap-4`) và Cấp bậc Cỡ chữ (Typography Hierarchy)** để phân chia nội dung.
* Bỏ toàn bộ các đường viền dày `border-2`, `border-[#333]`. Tất cả viền phân cách nếu có chỉ dùng `border-white/[0.06]`.

---

### 3. Bộ Thành Phần Chuẩn (Core UI Primitives)

#### A. Segmented Control Phẳng (Thay thế cho các hàng tab cồng kềnh)
* Nền xám đen mờ: `bg-[#121214] p-1 rounded-xl border border-white/[0.06]`.
* Tab được chọn: `bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 font-bold shadow-sm`.
* Tab không chọn: `text-zinc-400 hover:text-zinc-200 transition-colors`.

#### B. High-Density Data Row (Dạng Dòng Nén Mật Độ Cao)
* Đơn Hàng, Kho Hàng, Bảng Lương: Mặc định hiển thị **1 dòng duy nhất cho mỗi đối tượng** (chiều cao `h-12` đến `h-14`).
* Không bao giờ bung hết 15 dòng dữ liệu ra màn hình.
* Khi nhấp vào dòng $\rightarrow$ Trượt mở **Side Drawer (Ngăn kéo chi tiết bên phải)** hoặc Accordion nén phẳng để xem và thao tác.

#### C. Smart Context Action Card (Thẻ Hành Động Ngữ Cảnh)
* Thay vì bày sẵn 5–6 nút bấm tĩnh, thẻ tự động nhận diện trạng thái và chỉ hiển thị **1 nút hành động chính xác nhất cho thời điểm đó** (Check-in, Kết thúc ca, Gom đơn sản xuất).
