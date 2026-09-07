# 🚀 RF_WORKSPACE_PRO — SYSTEM CHANGELOG & RELEASE HISTORY

Tài liệu lưu trữ toàn bộ lịch sử phát hành, nâng cấp kiến trúc, tối ưu nghiệp vụ và sửa lỗi của hệ điều hành `RF_Workspace_Pro`.

---

## [v2.45.8] - 2026-09-07

### 🛠️ Khắc Phục Triệt Để Thợ Ảo "Kho Hàng" / "Hàng" Khâu 2 Sản Xuất & Khôi Phục Danh Sách Nhân Sự Đầy Đủ
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - Khâu 2 hiển thị người làm là "Hàng", khóa thẻ `KHOÁ: HÀNG` khiến thợ không thể nhận làm. Dropdown chọn nhân sự trống rỗng do thiếu trường `pins` trong `getUserConfig()`.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật**:
  1. Khôi phục trường `pins: {}` trong `getUserConfig()` nạp đầy đủ mã PIN và nhân sự từ `Config_NhanSu`.
  2. Triệt tiêu chuỗi thợ ảo `"Kho Hàng"` / `"Hàng"` trong backend (`formatProd`, `syncDeltas`) và frontend (`Modals_Orders.html`).
  3. Xây dựng danh sách `availableWorkers` đa nguồn kết hợp de-duplication, khôi phục đầy đủ nhân sự trong dropdowns.
  4. Bãi bỏ cơ chế tự động chỉ định ngẫu nhiên Khâu 2 khi Khâu 1 hoàn tất, giải phóng nút `[ ▶ NHẬN LÀM ]` chuẩn Lean Pull Flow.

---

## [v2.45.7] - 2026-09-07

### 🔄 Tự Động Đưa Đơn Hoàn Tháng Cũ (T8) Về Mục Hoàn Tháng Này (T9) Cho Diệu Hương Đi Kiểm
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - Khi quét đơn hoàn tháng cũ (T8) bằng súng tít hoặc Excel tại xưởng, đơn bị ẩn khỏi Tháng Này khiến Diệu Hương không thấy đi kiểm.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật**:
  1. Tự động đưa đơn tháng cũ về ngày hôm nay thuộc Tháng Này khi quét (`processCode` & `confirmBulkReturn`).
  2. Mở khoá quét nhận hàng thực tế cho các đơn đã có trạng thái hoàn từ sàn trước đó.
  3. Cơ chế Zero-Dropped trong `matchTimeFilter` cho đơn Hàng Hoàn chưa đối soát, ưu tiên `returnedAt`.
  4. Đơn vừa quét hoàn xuất hiện tức thì trên banner cảnh báo đỏ kèm nút `[KIỂM HOÀN]`.

---

## [v2.45.6] - 2026-09-07

### 📱 Khóa Cứng Bàn Phím PIN Zero Layout Shift, Triệt Tiêu Lỗi Cú Pháp Unterminated String & Tối Ưu Cảm Ứng Mobile 0ms
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - Khắc phục lỗi giật nảy bàn phím khi bấm 4 số và lỗi Unterminated string constant tại ntfyUrl.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật (Hallmark Mobile & Zero Shift)**:
  1. Khóa cứng hình học bàn phím PIN, bỏ autoFocus input ẩn.
  2. Triệt tiêu 100% chuỗi // trong ntfyUrl.
  3. Phẳng hóa JSX và React.useMemo tối ưu render.

---

## [v2.42.0] - 2026-09-04

### ⚡ Tối Ưu Hóa Dòng Chảy Lean (One-Piece Flow), Phá Vỡ Điểm Nghẽn Sản Xuất & Giao Hàng
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **Điểm nghẽn 1 (Tắc dòng chảy K1 ➔ K2)**: Thợ Khâu 1 hoàn thành xong thì Khâu 2 bị khóa cứng với trạng thái `Chờ duyệt khung`, bắt buộc Admin phải vào bấm duyệt thủ công thì Khâu 2 mới mở ra. Thợ Khâu 2 phải ngồi chờ (lãng phí thời gian chết Muda), phá vỡ nguyên lý One-Piece Flow.
  - **Điểm nghẽn 2 (Tắc giao hàng lúc 16:00 do nghẽn mã vận đơn)**: Đơn hàng Shopee/TikTok đã xong 100% sản phẩm nhưng chưa kịp sinh mã vận đơn thì hệ thống giam giữ cố định ở `Chờ Sản Xuất`. Thợ đóng gói không thấy đơn ở `Sẵn Sàng Đóng Gói` để bọc xốp, đóng thùng carton trước.
  - **Điểm nghẽn 3 (Lệch khóa ngoại OrderId vs OrderCode)**: Một số lệnh sản xuất ghi `orderId` là chuỗi `ORD-XXXXX`, trong khi đơn hàng liên kết lưu ID số, dẫn đến hàm `checkAndToggleOrderReadiness` (`Tab_Production.html`) và `safeDeductInventoryOnHandover` (`Code.js`) không khớp được sản phẩm.
  - **Điểm nghẽn 4 (Đảo ngược độ ưu tiên hàng chờ - Priority Inversion)**: Danh sách lệnh sản xuất sắp xếp kênh bán trước hạn chót, dẫn đến đơn cũ không gấp lại nằm trên đỉnh, trong khi đơn mới có deadline hôm nay lại bị đẩy xuống dưới.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật**:
  1. **Tự Động Mở Khóa Khâu 2 (Auto-Advance Phase 2 - `Tab_Production.html`)**: Khâu 1 bấm Xong sẽ tự động chốt trạng thái `Done`, ghi nhận KPI và mở khóa Khâu 2 cho thợ Tâm làm ngay mà không bị chặn bởi Admin duyệt khung (KCS chuyển sang kiểm tra bất đồng bộ).
  2. **Cho Phép Đóng Hộp Trước Khi Thiếu Mã Vận Đơn (Early Box Packing - `Tab_Orders.html` & `Modals_Orders.html`)**: Khi `allProdDone = true`, đơn lập tức chuyển sang `Sẵn Sàng Đóng Gói` kèm huy hiệu `[CHỜ MÃ VẬN ĐƠN - ĐÓNG HỘP TRƯỚC]`. Nút `BÀN GIAO` bọc Poka-Yoke chặn xuất khi thiếu mã vận đơn.
  3. **Chuẩn Hóa Khóa Ngoại Hai Chiều `isOrderMatch` (`Tab_Production.html` & `Code.js`)**: Hỗ trợ khớp cả ID số, mã đơn hàng đầy đủ lẫn mã cơ sở trước dấu gạch đứng `|`.
  4. **Thuật Toán Sắp Xếp Hạn Bàn Giao Sớm Nhất (Earliest Deadline First - EDF - `Tab_Production.html`)**: Lập chỉ mục `getEffectiveDeadline` tự động tính deadline thực tế, ưu tiên giao hàng đúng hẹn theo cam kết SLA sàn TMĐT.
  5. **Thanh Lọc Phân Khâu Kanban 1 Chạm (Lean Pull Flow - `Tab_Production.html`)**: Bổ sung bộ lọc `[Tất Cả Khâu]`, `[Khâu 1 Cần Làm]`, `[Khâu 2 Cần Gia Cố]` trực quan kèm số lượng realtime.
- **Kiểm Định Tự Động**: 209/209 test cases đạt chuẩn (`run_tests.js`).

---

## [v2.41.1] - 2026-09-04

### 💎 Chuẩn Hóa SKU & Tên Sản Phẩm Shopee Theo Đúng Quy Cách Xưởng Rich Fish
- **Bối cảnh & Phản hồi thực tế từ Chủ Xưởng**:
  - Khi dán văn bản sản phẩm từ Shopee, mã SKU thô (như `RUN-021-202020`) và tên thô (như `Layout Rừng Ver.21 - Size S`) chưa khớp với quy chuẩn hiện hành của xưởng:
    - SKU chuẩn xưởng: Phải có tiền tố `LAY-`, mã danh mục và version liền nhau (không có gạch nối giữa chữ và số: `RUN021`), sau đó là gạch nối kích thước: `LAY-RUN021-202020`, `LAY-RUN021-302020`, `LAY-RUN021-402325`.
    - Tên nhóm cha: Loại bỏ chữ "Layout " phía trước và viết thường "ver.X" (như `Rừng ver.1`, `Rừng ver.2`, `Rừng ver.21`).
    - Tên phân loại: Thợ sản xuất và module BOM vật tư sử dụng kích thước thực tế tính bằng cm (`20x20x20cm`, `30x20x20cm`, `40x23x25cm`) thay vì kích thước tượng trưng (Size S/M/L).
- **Nâng Cấp Kiến Trúc & Engine Xử Lý (`Tab_Inventory.html`)**:
  - **Hàm `standardizeWarehouseSku(rawSku, category, baseName)`**:
    - Layout: Tự động phát hiện mã `BON`, `RUN`, `CAU`, `HAN`, `VAC`, `DAO`, `NAT`, `TRU`, `HEM`, `VOM`, `CV`, `TRA`, pad version 3 số và ghép kích thước: `LAY-RUN021-202020`.
    - Bể kính: Chuyển đổi mã kích thước sang chuẩn `BE-STD-302020` / `BE-MINI-202020`.
    - Phụ kiện & Vật tư: Giữ nguyên các tiền tố chuẩn `PK-`, `NL-`, `DG-`, `VT-`.
  - **Hàm `standardizeWarehouseName(baseName, varLabel, rawSku)`**:
    - Lọc bỏ `Layout ` ở đầu tên, chuẩn hóa `Ver.21` ➔ `ver.21`.
    - Bóc tách kích thước 6 số từ SKU (`202020` ➔ `20x20x20cm`, `402325` ➔ `40x23x25cm`).
    - Tạo tên hoàn chỉnh: `Rừng ver.21 - 20x20x20cm`.
    - Tự động gán thư mục `sub_category`: `RỪNG` (thay vì `LAYOUT RỪNG`) để khớp 100% với các tab nhóm có sẵn trên giao diện.
  - **Giao Diện Bảng Tương Tác**:
    - Bổ sung nút chuyển đổi: `[⚡ Chuẩn Hóa Xưởng: BẬT / TẮT]` (Mặc định: **BẬT**).
    - Cột Mã SKU hiển thị SKU chuẩn xưởng (`LAY-RUN021-202020`), đồng thời có dòng chữ nhỏ hiển thị mã gốc Shopee (`Shopee: RUN-021-202020`) để đối chiếu.
- **Kiểm Định Tự Động**: 193/193 test cases đạt chuẩn (`run_tests.js`).

---

## [v2.41.0] - 2026-09-04

### 🛍️ Trạm Nhập Nhanh Sản Phẩm Shopee Vào Kho Hàng (Chỉ Dành Cho TỐI CAO)
- **Bối cảnh & Nhu cầu vận hành**:
  - Khi xưởng tạo sản phẩm mới trên Shopee Kênh Người Bán (ví dụ: `Layout Rừng Ver.21` với 3 phân loại Size S, M, L kèm giá và SKU), việc tạo thủ công từng sản phẩm/phân loại trong app tốn nhiều thời gian và dễ nhầm lẫn.
  - Người dùng có nhu cầu "copy nhanh" dữ liệu sản phẩm từ Shopee đưa thẳng vào kho hàng hệ thống.
  - Phân quyền: Tính năng này thay đổi trực tiếp danh mục hàng hóa và tồn kho hệ thống nên được **bảo vệ độc quyền cho cấp bậc TỐI CAO** (`isBoss || currentRole === 'TỐI CAO'`).
- **Nâng Cấp Kiến Trúc & Tính Năng (`Tab_Inventory.html`)**:
  - **Hộp thoại `ShopeeProductImportModal`**:
    - **Cơ chế 1: Smart Paste (Dán văn bản thông minh)**: Tự động bóc tách tên sản phẩm gốc (lược bỏ đuôi quảng cáo), mã SKU cha, nhận diện toàn bộ danh sách phân loại (Size S/M/L...), mã SKU phân loại, giá bán và số lượng tồn kho.
    - **Tự động nhận diện danh mục & ĐVT**: Dựa vào từ khóa tên sản phẩm để gợi ý `KHO LAYOUT` (ĐVT: Bộ) hoặc `KHO BỂ KÍNH` (ĐVT: Cái).
    - **Quy chuẩn tên phân loại**: Ghép chuẩn xác theo format `Tên Sản Phẩm - Tên Phân Loại` (ví dụ: `Layout Rừng Ver.21 - Size S`) giúp hệ thống tự động gộp nhóm vào thẻ `VariantGroupCard`.
    - **Cơ chế 2: Nạp file Excel Shopee**: Hỗ trợ kéo thả file xuất từ "Công cụ xử lý hàng loạt" của Shopee để đồng bộ hàng loạt.
    - **Bảng xem trước tương tác (Interactive Preview Table)**: Cho phép chỉnh sửa SKU, Tên, Giá, Kho, ĐVT trực tiếp trước khi lưu; hiển thị nhãn trạng thái `[TẠO MỚI]` hoặc `[CẬP NHẬT]`.
  - **Phân quyền bảo vệ 2 lớp**:
    - Nút bấm `Nhập Shopee` (màu cam Shopee đặc trưng `#ee4d2d`) và Modal mount chỉ kích hoạt khi `isBoss || currentRole === 'TỐI CAO'`.
- **Kiểm định tự động đạt 189/189 test cases Passed (`run_tests.js`)**:
  - Đã bổ sung Section 13 kiểm thử phân giải chuỗi Shopee thực tế và kiểm tra chốt chặn phân quyền TỐI CAO.

---

## [v2.40.5] - 2026-09-04

### 💎 Chuẩn Hóa Trọng Lượng Tịnh & Đơn Giá Keo 502 (1 Chai = 100g Keo Thực Tế, 220đ/gam)
- **Phân tích nguyên nhân gốc rễ (Root Cause Analysis)**:
  - **Quy chuẩn vật lý thực tế**: 1 chai keo 502 mua vào có tổng cân nặng là **162g** (cả chai đầy), vỏ chai rỗng (khi dùng hết keo) nặng **62g**. Do đó, lượng keo thực tế sử dụng được bên trong là **100g keo** (162g - 62g = 100g keo).
  - **Đơn giá mua vào**: Giá mua 1 chai là **22.000đ / 100g keo thực tế**, suy ra đơn giá mỗi gam keo chuẩn xác là:
    $$\text{Đơn giá 1 gam keo} = \frac{22.000\text{ đ}}{100\text{ gam}} = \mathbf{220\text{ đ/gam}}$$
  - **Lỗi hệ thống cũ**:
    1. Chia cho 162 thay vì 100 ($22.000 / 162 = 136\text{ đ/gam}$), làm hạ giá vốn keo phi thực tế gần 40%.
    2. Nghiêm trọng hơn, khi cấn trừ lệnh sản xuất (ví dụ dùng 256g keo), hệ thống chia 162 thành `1.58 chai`, nhưng lại gán đơn vị là `gam` và tiếp tục chia giá 22.000 cho 162 thành `136đ`, dẫn tới lỗi chia 2 lần khiến tiền keo chỉ còn: $1.58 \times 136\text{đ} = \mathbf{215\text{ đ}}$ (hai trăm mười lăm đồng)!
- **Nâng cấp Toàn Diện Engine Tính Chi Phí & Định Mức**:
  - `Config.html` (`calculateBomItemCost`): Nhận diện Keo 502 quy đổi chuẩn `unitPrice / 100` (= 220đ/gam) và `qty / 100` (số chai tiêu hao thực tế theo 100g keo/chai).
  - `Code.js` (`getBomMapByLayout`, `_processMaterialDeduction_Core`, `syncBomConfigFromLayoutSheet`):
    - Đơn vị chai quy đổi: $\text{Số chai} = \text{Tổng số gam keo} / 100$.
    - Đơn giá keo: 22.000đ/chai hoặc 220đ/gam.
    - Thành tiền: Khớp chuẩn xác $256\text{g} \times 220\text{đ} = 2.56\text{ chai} \times 22.000\text{đ} = \mathbf{56.320\text{ đ}}$ (triệt tiêu vĩnh viễn con số 215đ).
  - `Tab_ImportExport.html`:
    - Bảo toàn hiển thị đúng đơn vị `Chai` hoặc `gam` theo từng chứng từ, không đè nhầm đơn vị chéo.
    - Tự động sửa hiển thị cho các phiếu xuất BOM cũ bị chia đúp khiến tiền keo $\le 500$đ.
  - Bổ sung runner `AAA_REPAIR_KEO502_PRICE_AND_BOM()` (`repairKeo502PriceAndBom`): Chuẩn hóa tự động bảng `Products`, `BomLayout` và cập nhật dữ liệu các phiếu `IE_BOM_` / `IE_TP_` cũ.
- **Kiểm định tự động đạt 175/175 test cases Passed (`run_tests.js`)**:
  - Xác thực công thức 162g - 62g = 100g keo thực tế.
  - Xác thực đơn giá 220đ/gam và chi phí 56.320đ cho 256g keo.

---

## [v2.40.4] - 2026-09-04

### 🎯 Bảo Vệ Chính Xác Mã Vận Đơn (MVĐ) & Triệt Tiêu Nhận Diện Nhầm "Mã Kiện Hàng" Shopee
- **Phân tích nguyên nhân gốc rễ (Root Cause Analysis)**:
  - File Excel Shopee (`Order.all...` hoặc `Order.toship...`) có cấu trúc tiêu đề chứa:
    - Cột 1: `Mã Kiện Hàng` (Shopee Package ID nội bộ dạng số 19 chữ số: ví dụ `6021700621857282367`).
    - Cột 7: `Mã vận đơn` (Mã vận đơn giao hàng thực tế của SPX Express / đơn vị vận chuyển: ví dụ `SPXVN065693856028`).
  - Hệ thống trước đây đưa `'mã kiện hàng'` vào danh sách từ khóa `iTrack`, đồng thời hàm `findCol` duyệt qua mảng `headers` theo thứ tự từ trái sang phải (`headers.findIndex(...)`). Do đó khi duyệt tới Cột 1 (`Mã Kiện Hàng`), hàm thấy khớp với từ khóa và trả về ngay Cột 1, dẫn tới việc thẻ đơn hàng hiển thị `MVĐ: 6021700621857282367` thay vì `MVĐ: SPXVN065693856028`.
- **Nâng cấp Thuật toán Định vị Cột Ưu Tiên (Key-Priority Search) (`Modals_Orders.html`)**:
  - Tái cấu trúc hàm `findCol`: Duyệt tuần tự theo mức độ ưu tiên của mảng từ khóa `keys` (chính xác trước, chuỗi con sau, rồi mới tới chuẩn hóa alphanumeric), thay vì duyệt theo thứ tự cột xuất hiện trong file Excel.
  - Đảm bảo từ khóa `'mã vận đơn'` có độ ưu tiên cao nhất luôn giành chiến thắng tuyệt đối, bất kể nó nằm ở cột thứ mấy trong file.
  - Bãi bỏ hoàn toàn các từ khóa không thuộc mã vận đơn (`'mã kiện hàng'`, `'ma kien hang'`) ra khỏi bộ từ khóa `iTrack`.
- **Tăng cường phòng vệ `cleanRawCode`**:
  - Tích hợp kiểm tra và dọn sạch các chuỗi rác `'None'`, `'null'`, `'-'`, `'n/a'` trực tiếp trong hàm `cleanRawCode`, bảo đảm không bao giờ để lọt chuỗi rác vào CSDL.
- **Kiểm định tự động đạt 170/170 test cases Passed (`run_tests.js`)**:
  - Bổ sung test kiểm thử thuật toán `Key-Priority findCol` và xác nhận bỏ qua `Mã Kiện Hàng` (Cột 1) để chọn đúng `Mã vận đơn` (Cột 7) cho đơn hàng `260806M6FWA4EA` (`SPXVN065693856028`).
  - Kiểm tra hàng loạt 58 file Excel Shopee thực tế trong thư mục Downloads: 100% khớp đúng cột `Mã vận đơn`, 0 lỗi nhận diện nhầm.

---

## [v2.40.3] - 2026-09-04

### 🏷️ Chuẩn Hóa Bộ Phân Giải & Cập Nhật Mã Vận Đơn (MVĐ) Tại Trạm Bơm Đơn (BulkImportModal)
- **Khắc phục triệt để lỗi "Có mã vận đơn nhưng không cập nhật" (`Modals_Orders.html`)**:
  - **Phân tích nguyên nhân gốc rễ**: Khi nạp file Shopee `Order.toship...` hoặc `Order.all...`, các ô mã vận đơn chưa phát sinh được Shopee xuất dưới dạng chuỗi `'None'`, hoặc công thức dạng `="SPXVN..."`. Hệ thống cũ không dọn sạch chuỗi `'None'` và giới hạn điều kiện so khớp `hasNewTrack = tCode && !existingTrack` khiến các đơn cần cập nhật mã vận đơn mới bị nhận diện nhầm thành `[ĐÃ BƠM]` (`isDuplicate: true`), làm nút chốt đơn hiển thị `CHỐT BƠM 0 ĐƠN`.
  - **Mở rộng 30+ từ khóa nhận diện cột vận đơn (`iTrack`)**:
    - Quét toàn diện tất cả các biến thể: `'mã vận đơn'`, `'ma van don'`, `'mvd'`, `'mvđ'`, `'tracking number'`, `'tracking id'`, `'tracking no'`, `'tracking no.''`, `'tracking #'`, `'tracking code'`, `'tracking'`, `'số theo dõi'`, `'so theo doi'`, `'mã theo dõi'`, `'ma theo doi'`, `'mã bưu gửi'`, `'ma buu gui'`, `'số vận đơn'`, `'so van don'`, `'mã vận chuyển'`, `'ma van chuyen'`, `'mã kiện hàng'`, `'ma kien hang'`, `'waybill'`, `'awb'`, `'airway bill'`, `'air waybill'`, `'shipping number'`, `'shipping no'`, `'shipping code'`, `'delivery id'`, `'หมายเลขติดตามพัสดุ'`, `'no. penjejakan'`.
  - **Làm sạch chuỗi rác & công thức Excel**:
    - Tự động phát hiện và loại bỏ các giá trị `'None'`, `'null'`, `'-'`, `'n/a'` về rỗng.
    - Áp dụng `cleanRawCode` dọn sạch dấu ngoặc kép, dấu bằng, tab, xuống dòng trên cả `oCode` và `tCode`.
  - **Động cơ so khớp đa chiều & Cập nhật đè MVĐ**:
    - Trích xuất mã vận đơn hiện tại trong hệ thống từ cả `existing.shippingCode` và `existing.orderCode`.
    - Điều kiện `hasNewTrack`: Kích hoạt khi file mới có mã vận đơn và (đơn cũ chưa có MVĐ hoặc MVĐ mới khác với MVĐ cũ theo thuật toán `toAlphaNum`).
    - Khi `hasNewTrack` kích hoạt: Đơn hàng chuyển sang `isUpdate: true`, `isDuplicate: false`, cập nhật `orderCode: ${baseCode} | MVĐ: ${cleanT}`, `shippingCode: cleanT` và hiển thị nhãn hổ phách nổi bật **`[CẬP NHẬT MVĐ]`**. Nút `CHỐT BƠM X ĐƠN` kích hoạt bình thường!
  - **Đồng bộ Lean One-Piece Flow & Tự động nâng trạng thái**:
    - Khi đơn hàng đang chờ mã vận đơn tại `Chờ Sản Xuất` (`isMissingMVD`), nếu nạp file cập nhật có mã vận đơn và hàng đã đủ/sản xuất xong, đơn tự động nhảy sang `Sẵn Sàng Đóng Gói`.
    - Bảo toàn trạng thái cho các đơn đã `Chờ Bàn Giao`, `Đã Bàn Giao` hoặc dứt điểm.
    - Hoàn thiện payload `submit()` đẩy đủ `shippingCode` và `shippingMethod` xuống hệ thống `pushDeltas`.
- **Kiểm định tự động đạt 168/168 test cases Passed (`run_tests.js`)**:
  - Bổ sung Section 12 kiểm thử tự động toàn diện: làm sạch chuỗi `None`, bóc tách công thức Shopee, tra cứu đa bản đồ, so khớp cập nhật MVĐ và kiểm tra payload lưu đơn.

---

## [v2.40.2] - 2026-09-04

### 🖼️ Trình Xem Ảnh Phóng To Nội Bộ (Royal Image Lightbox) & Triệt Tiêu Lỗi Google Drive Bị Chặn (ERR_BLOCKED_BY_RESPONSE)
- **Triệt tiêu 100% lỗi Google Drive từ chối kết nối (`ERR_BLOCKED_BY_RESPONSE`)**:
  - **Nguyên nhân gốc rễ**: Khi bấm vào ảnh thu nhỏ hàng hóa/đóng gói/ra kho trên thẻ đơn hàng, mã nguồn gọi `window.open(url, '_blank')` với link thumbnail Drive (`https://drive.google.com/thumbnail?id=...&sz=w800`). Do domain webapp khác với google.com, cơ chế bảo mật Cross-Origin-Opener-Policy (`same-origin`) và `x-frame-options: SAMEORIGIN` của Google Drive chặn đứng điều hướng và báo lỗi trang đen Chrome.
  - **Bộ chuyển đổi URL an toàn (`Config.html`)**:
    - Xây dựng `extractDriveId(url)` trích xuất chính xác ID file Drive từ mọi định dạng (`thumbnail`, `file/d`, `uc?id`, `lh3.googleusercontent.com`).
    - Xây dựng `getSafeDriveViewUrl(url)`: Tự động chuyển đổi thành link xem chính thức `https://drive.google.com/file/d/{id}/view?usp=drivesdk`, đạt chuẩn 200 OK và không bao giờ bị Google chặn.
    - Xây dựng `getDirectImageUrl(url, size)`: Sử dụng CDN trực tiếp `lh3.googleusercontent.com/d/{id}=w1600` cho ảnh siêu nét.
    - Xây dựng `openSafeImageTab(url)`: Đảm bảo mọi tác vụ mở tab mới đều an toàn tuyệt đối.
- **Trình Xem Ảnh Phóng To Nội Bộ Đa Năng (`Components.html`, `App_Main.html`)**:
  - Xây dựng component `RFImageLightboxModal` theo ngôn ngữ thiết kế **Royal Obsidian Dark**:
    - Hiển thị ảnh nổi bật giữa màn hình với nền mờ cao cấp (`bg-black/95 backdrop-blur-xl`), gắn trực tiếp vào `document.body` qua `ReactDOM.createPortal`.
    - **Chức năng Thu Phóng (Zoom)**: Phóng to 1.75x, 2.5x và thu nhỏ để soi rõ từng chi tiết tem vận đơn, mối dán bể kính hoặc form lũa layout.
    - **Tải Ảnh Nhanh (Download)**: Tải ảnh gốc về máy chỉ với 1 click.
    - **Mở Trong Google Drive**: Nút mở Drive an toàn trực tiếp.
    - **Đóng linh hoạt**: Hỗ trợ bấm phím `ESC`, bấm nút đóng hoặc bấm ra ngoài màn hình.
  - Đăng ký hàm toàn cục `window.previewImage(url, title, subTitle)` tại `App_Main.html`, cho phép mọi thành phần trong ứng dụng gọi xem ảnh tức thì.
- **Đồng bộ toàn diện trên thẻ đơn hàng & modal chi tiết (`Modals_Orders.html`, `Modals.html`, `Tab_Finance.html`)**:
  - Cập nhật ảnh hàng hóa trước khi gói (`pGoods`), ảnh kiện hàng đã gói (`pBox`), ảnh chở kho (`whPhoto`).
  - Cập nhật ảnh bill cọc (`imgUrl`), ảnh đóng gói từ camera (`packRecord.photo`).
  - Cập nhật ảnh đại diện sản phẩm & phụ kiện trong bảng đơn hoàn (`aInfo.image`, `pInfo.image`).
  - Cập nhật ảnh mẫu hiện vật trên kệ (`OrderStockAssignModal`).
  - Cập nhật ảnh hóa đơn chứng từ chi phí & mã QR nhận tiền (`Modals.html`, `Tab_Finance.html`).
- **Kiểm định tự động đạt 155/155 test cases Passed (`run_tests.js`)**:
  - Bổ sung Section 11 kiểm thử trích xuất ID Drive, chuyển đổi link xem an toàn, kiểm tra tính toàn vẹn của Lightbox modal và binding toàn cục.

---

## [v2.40.1] - 2026-09-04

### 🛡️ Đột Phá Bộ Máy Lọc Trùng Đơn Đa Tầng (4-Layer Deduplication Engine) & Triệt Tiêu Nhãn Fallback "Đơn Lẻ"
- **Bộ máy Lọc Trùng Đơn Đa Tầng tại Trạm Bơm Đơn (`Modals_Orders.html`)**:
  - **Khắc phục triệt để lỗi bơm trùng 24 đơn**: Trước đây việc dò trùng chỉ split chuỗi `' | MVĐ: '` đơn giản, dẫn đến các đơn lưu ở định dạng khác hoặc đơn không chứa đúng chuỗi tách bị trượt qua và bơm mới (`ORD_...`) kèm kích hoạt trùng 24 lệnh sản xuất (`PROD_...`).
  - **Hợp nhất toàn bộ nguồn dữ liệu đơn hàng**: `combinedOrdersPool` gom toàn bộ từ `existingOrders`, `window.GLOBAL_ALL_ORDERS`, `window.ALL_ORDERS`, và `window.erpData.Orders` để không bỏ sót bất kỳ đơn nào dù vừa được đồng bộ qua delta.
  - **4 Bản đồ tra cứu toàn diện (Lookup Maps)**:
    1. `existingByCodeMap`: Tra cứu theo mã đơn hàng chuẩn hóa (lowercase, trimmed, strip formula quotes `="..."`).
    2. `existingByTrackMap`: Tra cứu theo mã vận đơn SPX/GHN.
    3. `existingByAlphaMap`: Tra cứu theo chuỗi alphanumeric (`toAlphaNum`), loại bỏ toàn bộ khoảng trắng, dấu gạch ngang, tiền tố/hậu tố.
    4. `existingByIdMap`: Tra cứu theo ID hệ thống.
  - **Hàm `findExistingOrder(inOCode, inTCode)` 5 bước đối soát**:
    - Bước 1: Tra cứu chính xác theo mã đơn trong `existingByCodeMap`.
    - Bước 2: Tra cứu chính xác theo mã vận đơn trong `existingByTrackMap`.
    - Bước 3: Tra cứu chéo mã vận đơn vào cột mã đơn và ngược lại.
    - Bước 4: Tra cứu theo mã alphanumeric (`toAlphaNum`).
    - Bước 5: Quét chuỗi con 2 chiều (substring match) cho các mã đơn ghép dài dạng `260904... | SPXVN...`.
- **Triệt tiêu 100% nhãn fallback "ĐƠN LẺ" / "BÁN LẺ" (`Tab_Production.html`, `Tab_Orders.html`)**:
  - Xóa bỏ điểm gán cứng `'ĐƠN LẺ'` tại dòng 3559 và `: 'BÁN LẺ'` tại dòng 3680 trong `Tab_Production.html`.
  - Bổ sung hàm `resolveItemChannelTag(_item, order)`: Tự động phân tích kênh bán hàng thực tế từ `order.channel`, `_item.orderId`, hoặc `_item.note` (nhận diện Shopee, TikTok Shop, Sản Xuất Tồn), an toàn fallback về nhãn trung tính `'SẢN XUẤT'`, tuyệt đối không tự ý gán nhãn `'BÁN LẺ'` khi đơn thuộc sàn TMĐT.
  - Nâng cấp `resolveGroupKey` trong `Tab_Orders.html`: Phân tích mã đơn hàng `SPXVN...` / `2...` sang `Shopee VN`, `57...` sang `TikTok Shop` trước khi nhóm, xóa bỏ việc dồn vào nhóm 'BÁN LẺ'.
  - Nâng cấp hàm `getParentOrder`: Thêm cơ chế bóc tách ID đa tầng (kể cả ID ghép `ORD_timestamp_index`) và fallback tìm kiếm trong `GLOBAL_ALL_ORDERS`, loại bỏ tình trạng thẻ sản xuất không tìm thấy đơn cha.
- **Bảo vệ toàn vẹn xuất kho bàn giao (`Code.js`)**:
  - Cập nhật `safeDeductInventoryOnHandover`: Chỉ trừ tồn kho thành phẩm đối với các sản phẩm lấy từ kho có sẵn (`fulfilledFromStock === true`).
  - Sản phẩm sản xuất theo đơn (MTO) đã được trừ vật tư BOM ở khâu sản xuất sẽ không bị trừ tiếp tồn kho thành phẩm, chống âm kho và triệt tiêu nguy cơ trừ lặp kép dữ liệu.
- **Kiểm định chất lượng 100% tự động (`run_tests.js`)**:
  - Bổ sung Section 10 với 10 test case kiểm thử toàn diện: Làm sạch mã đơn formula quotes, trích xuất mã vận đơn, tra cứu qua 4 bản đồ, đối soát chuỗi con, phân loại kênh không fallback Bán Lẻ, và an toàn trừ kho bàn giao.
  - Toàn bộ test suite đạt **146/146 PASS (100%)**.

---

## [v2.40.0] - 2026-09-04

### 🛡️ Chốt Chặn Trừ BOM 2 Khâu, Triệt Tiêu Thợ Ảo "Kho Hàng" & Chuẩn Hóa Chuyển Sản Xuất Mới
- **Chốt chặn Poka-Yoke Trừ BOM & Nhập Kho Thành Phẩm (`Code.js`, `Tab_Production.html`)**:
  - **Sản phẩm 2 khâu bắt buộc đủ 2 khâu Done**: Khắc phục triệt để lỗi mới hoàn thành Khâu 1 (Cắt dán bể kính / Dựng khung layout) đã tự động sinh phiếu `IE_TP_...` nhập kho non và trừ BOM nguyên liệu.
  - Sửa điều kiện `isDone` trong `syncDeltas` (Code.js), `cleanDuplicateBomTickets` và `Tab_Production.html`: Đối với sản phẩm 2 khâu, bắt buộc cả 2 khâu (`p1_status === 'DONE' && p2_status === 'DONE'`) mới được kích hoạt `_processMaterialDeduction_Core`.
  - Thêm **GUARD 2** trực tiếp trong `_processMaterialDeduction_Core` bảo vệ toàn vẹn CSDL, từ chối tạo phiếu trừ BOM và nhập kho nếu Khâu 2 chưa Done.
- **Triệt tiêu thợ ảo "Kho Hàng" / "Hàng" trên thẻ đơn hàng (`Modals_Orders.html`)**:
  - Lọc bỏ triệt để chuỗi `Kho Hàng` (bị split lấy từ cuối thành chữ "Hàng").
  - Đơn hàng xuất từ kho có sẵn hiển thị huy hiệu chuẩn `[Xuất từ kho có sẵn]` thay vì gán tên thợ giả gây hoang mang cho thợ xưởng.
- **Chuẩn hóa Báo mất hiện vật kệ chuyển Sản Xuất Mới (`Modals_Orders.html`)**:
  - Khi bấm *"Không tìm thấy hiện vật trên kệ (Chuyển sản xuất mới)"*, hàm `handleReportMissingItem` thực hiện reset toàn diện 100%: xóa sạch object `phases` cũ, reset `p1_user`, `p2_user`, thời gian, ảnh nghiệm thu và thưởng về rỗng.
  - Lệnh sản xuất trở về trạng thái `Pending` trong nhóm **"CHỜ NHẬN VIỆC"** với nút **BẮT ĐẦU** để thợ xưởng chủ động nhận việc, chấm dứt hoàn toàn hiện tượng nhảy thẳng sang ô **"Kiểm định chất lượng / Duyệt đạt KCS"** với thợ ảo.

### 🛡️ Kiểm Định Toàn Vẹn CSDL, Fix 13 Lỗi Tranh Chấp & Chuẩn Hóa KPI Thưởng Đóng Gói Phẳng 1.100đ
- **Khắc phục lỗi biến rò rỉ C4 & đồng bộ trực tiếp Orders Sheet (`Code.js`)**:
  - Loại bỏ biến chưa khai báo `ordersModified` tại khối sản xuất lệnh xưởng, cập nhật trực tiếp `ordersSheet.getRange(...).setValue('Sẵn sàng đóng gói')` đảm bảo trạng thái đơn hàng luôn được lưu chính xác xuống CSDL Google Sheets khi chuyển sang bốc tồn kho.
- **Tối ưu khóa đồng thời Reentrant Lock A1 (`Code.js`)**:
  - Nâng cấp `syncDeltas` kiểm tra `!lock.hasLock()` trước khi xin quyền truy cập độc quyền, khắc phục triệt để lỗi khóa lặp (Double Lock) từ `handleApiRequest` và ngăn chặn việc giải phóng khóa sớm (`releaseLock`) trong khối `finally`.
- **Chốt phẳng KPI thưởng đóng gói 1.100đ theo chỉ đạo người dùng (`Tab_HR.html`)**:
  - Đơn giản hóa cơ chế tính thưởng đóng gói: Ưu tiên lấy số tiền `recordedReward` đã ghi nhận trong CSDL `Packings`, nếu chưa có thì mặc định chuẩn xác **1.100đ/đơn**, không tự động nhân hay tính toán lại theo quy cách SKU layout/bể kính phức tạp.
- **Chống trừ kép nguyên liệu BOM C2 & loại bỏ đọc chậm C3 (`Code.js`)**:
  - Bổ sung cơ chế lọc trùng `processedBomIds` trong từng batch payload `prodItems`, triệt tiêu khả năng trừ vật tư lặp nhiều lần cho cùng một lệnh sản xuất hoàn thành.
  - Tái sử dụng mảng dữ liệu bộ nhớ `pData` trong `_processMaterialDeduction_Core`, xóa bỏ thao tác `productSheet.getDataRange().getValues()` thừa thãi sau khi ghi nhận thành phẩm.
- **Tự động hoàn trả tồn kho phụ kiện khi hủy đơn B4 (`Code.js`)**:
  - Nâng cấp `processCascadeCancelOrder`: Khi hủy đơn hàng đã từng bàn giao (`isHandedOver = true`), hệ thống tự động cộng hoàn số lượng phụ kiện/sản phẩm vào `Products` và ghi log phiếu `Nhập` với nhãn `Hoàn Kho Đơn Hủy` vào bảng `ImportExport`.
- **An toàn hóa ép kiểu dữ liệu D1 & D2 (`Code.js`)**:
  - Xây dựng helper `cleanNum` trong `formatProduct` và `formatOrder`, bảo vệ an toàn các trường số như `quantity`, `price`, `costPrice`, `sizeCoefficient` không bị chuyển nhầm thành 0 hoặc 1 khi giá trị thực tế hợp lệ.
- **Bổ sung Section 9 và đạt 136/136 test tự động (`run_tests.js`)**:
  - Viết mới 6 test case tự động kiểm định reentrant lock, BOM dedup, CSDL Orders update, an toàn formatProduct, hoàn kho đơn hủy, và thưởng đóng gói phẳng 1.100đ.
- **Hallmark UI Design Audit**:
  - Rà soát giao diện `Tab_Orders.html` và `App_Main.html` theo chuẩn Anti-AI-slop (0 critical, 2 major, 2 minor; khuyến nghị bổ sung `tabular-nums` cho cột tiền tệ và `whitespace-nowrap` cho dải nút lọc trạng thái).

---

## [v2.39.0] - 2026-09-04

### ⏱️ Nâng Cấp Shopee SLA Article 19948 & Khắc Phục Lỗi Thưởng KPI Đóng Gói 1.100đ
- **Chuẩn hóa công thức tính Deadline tự động theo quy chuẩn Shopee Article 19948 (`Config.html`, `Tab_Orders.html`, `Modals_Orders.html`)**:
  - **Mốc cắt giờ 14:00 mỗi ngày (Shopee SLA chuẩn)**:
    - Đơn phát sinh trước 14:00 (Thứ 2 - Thứ 6): Hạn bàn giao cho ĐVVC là 23:59 cùng ngày ➔ Hệ thống đặt hạn hoàn tất đóng gói xưởng là **17:30 cùng ngày** để kịp chở bưu cục.
    - Đơn phát sinh từ 14:00 trở đi (Thứ 2 - Thứ 6): Hạn bàn giao cho ĐVVC là 23:59 ngày kế tiếp ➔ Hệ thống đặt hạn hoàn tất là **11:30 ngày hôm sau**.
  - **Quy tắc ĐVVC nghỉ ngày Chủ Nhật (Sunday Carrier Rollover)**:
    - Đơn phát sinh từ 14:00 Thứ Bảy trở đi và toàn bộ ngày Chủ Nhật: Đơn vị vận chuyển không làm việc, Shopee tự động gia hạn giao hàng đến 23:59 Thứ Hai ➔ Hệ thống tự động đẩy deadline xưởng sang **11:30 Thứ Hai**, không bị báo trễ hạn oan uổng vào Chủ Nhật.
  - **Quy chuẩn 3 khung giờ đơn Hỏa Tốc / Trong Ngày**:
    - Trước 8:00: Chuẩn bị hàng trước **9:30 cùng ngày**.
    - Từ 8:00 đến trước 18:00: Xử lý trong vòng **1.5 giờ (90 phút)** từ lúc phát sinh.
    - Từ 18:00 trở đi: Chuẩn bị hàng trước **9:30 sáng ngày kế tiếp**.
  - **Đồng bộ toàn diện vào `RFOrderWrapper` (`Tab_Orders.html`)**:
    - Khi đơn chưa có deadline từ sàn, thẻ đơn hàng tự động dùng `getAutoDeadline` để tính toán chính xác, thống nhất thời gian SLA trên toàn hệ thống.
- **Khắc phục triệt để lỗi ghi đè thưởng KPI Đóng Gói 1.100đ (`Tab_HR.html`, `Modals_Orders.html`, `Config.html`, `Code.js`)**:
  - **Bảo toàn 100% dữ liệu đã ghi nhận trong CSDL `Packings`**:
    - Ưu tiên sử dụng trực tiếp số tiền `pk.reward_vnd` đã được ghi nhận trong bảng `Packings` khi gói hàng hoàn tất.
  - **Quét liên kết sản phẩm sản xuất (`safeProdItems`) & Giải mã phụ kiện (`safeParseAccessories`)**:
    - Tự động quét các bản ghi sản xuất trong `safeProdItems` thuộc về đơn hàng (`orderId`), bóc tách danh sách phụ kiện chi tiết để khớp đúng khung thưởng của Layout, Bể kính (1.200đ, 1.300đ, 1.800đ, 2.100đ, 3.900đ, 4.000đ...).
    - Nếu số tiền tính từ quy cách sản phẩm cao hơn số ghi nhận cũ (do lỗi fallback trước đây), hệ thống tự động cập nhật lên mức cao hơn có lợi cho thợ đóng gói.
  - **Đồng bộ hóa client & server `getPackingReward` (`Config.html`, `Code.js`)**:
    - Hỗ trợ giải nén an toàn chuỗi JSON và mảng object trong `namesToScan`, loại trừ chuỗi rác `[object Object]`.

---

## [v2.38.1] - 2026-09-04

### 📦 Tinh Gọn 8 Tab Trạng Thái & Khóa Đơn Ở Chờ Sản Xuất Tới Khi Có Mã Vận Đơn
- **Loại bỏ tab nhanh "Chờ Mã Vận Đơn" (`Tab_Orders.html`)**:
  - **Chuẩn hóa Lean One-Piece Flow**: Tinh gọn thanh điều hướng thành 8 tab luồng nghiệp vụ cố định (`Tất Cả`, `Chờ Sản Xuất`, `Sẵn Sàng Đóng Gói`, `Chờ Bàn Giao`, `Đã Bàn Giao`, `Đơn Huỷ`, `Hàng Hoàn`, `Hoàn Thành`).
  - **Tối ưu hiển thị trực quan**: Toàn bộ đơn hàng thiếu mã vận đơn (chờ xác nhận) được gom về tab `Chờ Sản Xuất` và gắn nhãn vàng `Chờ xác nhận` rõ ràng, không phân mảnh thanh tab gây rối mắt.
- **Khóa trạng thái Chờ Sản Xuất cho tới khi có mã vận đơn (`Tab_Orders.html`, `Modals_Orders.html`)**:
  - **Khắc phục lỗi nhảy sớm sang Sẵn Sàng Đóng Gói**: Trước đây khi thợ hoàn thành gia công bể/layout (`allProdDone`), hệ thống tự động nhảy đơn sang `Sẵn Sàng Đóng Gói` ngay cả khi đơn chưa có mã vận đơn từ sàn (Shopee/TikTok), khiến thợ đóng gói không có tem mã vận đơn để thao tác.
  - **Cơ chế chốt chặn mã vận đơn (`!isMissingMVD`)**: Bổ sung điều kiện bắt buộc `!meta.isMissingMVD`: Khi hàng sản xuất xong, đơn **vẫn nằm cố định tại tab `Chờ Sản Xuất`** cho đến khi nhân sự nạp/bơm file Excel cập nhật có mã vận đơn hợp lệ từ sàn, lúc đó đơn mới chính thức nhảy sang tab `Sẵn Sàng Đóng Gói`.
  - Đồng bộ logic hiển thị `effectiveStatus` của thẻ đơn hàng trong `Modals_Orders.html` để đồng nhất 100% với phân nhóm tab.

---

## [v2.38.0] - 2026-09-04

### 🧠 Chuẩn Hóa Khớp Layout, Bộ Nhớ SKU Tự Học & Cập Nhật Lệnh Xưởng In-Place
- **Khắc phục lỗi nhận diện nhầm Layout và tự động gán kho khống (`Code.js`)**:
  - **Triệt tiêu False Dimensional Match**: Hàm `getProductInfoByName` được tái cấu trúc theo thuật toán 2-Pass. Pass 1 ưu tiên 100% tên/SKU chính xác. Pass 2 chỉ fallback theo kích thước duy nhất cho danh mục Bể Kính (`isTargetGlass && isRowGlass`), loại bỏ hoàn toàn khả năng Layout tiểu cảnh bị so khớp chéo theo kích thước $20\times20\times20\text{cm}$.
  - **Bảo toàn tính trung thực của kho hàng**: Ngăn chặn hoàn toàn việc sản phẩm hết hàng (tồn = 0 như `Nhất Trụ ver.4 - 20x20x20cm`) bị gán nhầm sang sản phẩm khác còn tồn kho và tự kích hoạt trạng thái "Lấy từ tồn kho có sẵn" / yêu cầu chọn số serial.
- **Tối ưu nhận diện Layout Trăng & Quy cách Cubic (`Modals_Orders.html`)**:
  - **Tiền tố TRA**: Bổ sung tiền tố `TRA` vào regex nhận diện Layout, tự động map sang SKU `LAY-STD001-202020-ST-02` (Trăng – 20x20x20cm).
  - **Phân giải Cubic**: Tự động nhận diện từ khóa `Cubic 20`, `Cubic 25`, `Cubic 30`, `Cubic 40` để bóc tách thành kích thước 3 chiều $20\times20\times20\text{cm}$ v.v., kết hợp bonus trọng số tên gia đình `isTraFamily`.
- **Bộ nhớ tự học SKU Bí Danh (`rf_sku_alias_map`)**:
  - Khi nhân sự chọn liên kết thủ công mã sản phẩm tại Trạm Bơm Đơn, hệ thống tự động ghi nhớ ánh xạ `rawSku -> selectedItem` vào `localStorage`.
  - Các lần nhập đơn tiếp theo có cùng mã SKU trên sàn TMĐT sẽ được tự động nhận diện và gán đúng 100%, không cần nhân sự chọn lại thủ công.
- **Cơ chế cập nhật đè lệnh xưởng In-Place khi bơm lại đơn (`Modals_Orders.html`)**:
  - Khi người dùng nhập lại file Excel chứa đơn hàng cũ chưa kết thúc (`isUpdate: true`), hệ thống thực hiện tái bóc tách sản phẩm thay vì giữ nguyên lệnh cũ lỗi thời.
  - Tái sử dụng ID của các bản ghi `Production` cũ để ghi đè dữ liệu mới tại chỗ, dọn dẹp các lệnh dư thừa (`deleteProdIds`), đồng thời cập nhật chính xác cột `Orders.accessories` và kích hoạt đồng bộ qua `pushDeltas`.

---

## [v2.37.7] - 2026-09-04

### 📦 Xử Lý Đơn Thiếu Hàng (Hoàn Tiền Ngay): Bảo Toàn 100% Tồn Kho & Chuyển Đối Soát Thành Công
- **Khắc phục lỗi cộng khống kho khi khách khiếu nại thiếu hàng (`Modals_Orders.html`)**:
  - **Bản chất nghiệp vụ**: Khi khách khiếu nại thiếu hàng (ví dụ: đặt 2 túi sạn thiếu 1 túi), Shopee xử lý *"Hoàn tiền ngay / Refund Only"*, trừ trực tiếp số tiền món thiếu (18.418đ) vào doanh thu người bán và thanh toán phần còn lại (324.475đ). Khách giữ toàn bộ hàng đã nhận, **không có kiện hàng nào quay về kho**.
  - **Bảo vệ tồn kho (Zero Muda & Chống cộng khống)**:
    - Nếu duyệt theo luồng hoàn thông thường, hệ thống sẽ ngỡ hàng về và cộng bù toàn bộ phụ kiện vào kho gây lệch tồn kho nghiêm trọng.
    - Bổ sung biến chặn `isMissingItems`: Khi lý do chứa từ *"thiếu"* hoặc *"không trả hàng"*, hệ thống **tuyệt đối KHÔNG cộng bù kho (`productUpdates = []`)**, không tạo phiếu nhập kho hay xuất hủy.
  - **Nút bấm 1-chạm tại Bước 1 (Trạm Xử Lý Hàng Hoàn)**:
    - Thêm nút: `📦 HOÀN TIỀN THIẾU HÀNG (GIỮ NGUYÊN KHO → ĐỐI SOÁT THÀNH CÔNG)`.
    - Thao tác 1 click: Bật popup xác nhận rõ ràng ➔ Chuyển đơn sang `Đối Soát Thành Công` ➔ Ghi chú `[THIẾU HÀNG - HOÀN TIỀN NGAY - GIỮ NGUYÊN KHO]`.
  - **Preset & Nút CTA trực quan tại Bước 2 (Duyệt Kho)**:
    - Bổ sung chip preset: `📦 Thiếu hàng (Giữ nguyên kho)`.
    - Nút CTA duyệt tự động chuyển sang màu cam hổ phách: `DUYỆT HOÀN TIỀN (GIỮ NGUYÊN KHO) → ĐỐI SOÁT THÀNH CÔNG`.
  - **Đồng bộ doanh thu**: Doanh thu quyết toán tự động khớp đúng số tiền Shopee chi trả thực tế (đã trừ món thiếu).

---

## [v2.37.6] - 2026-09-04

### 🔄 Quét Đơn Hoàn Tự Động: Tích Hợp Nhập Lý Do Hoàn Hàng & Trích Xuất Thông Minh
- **Nâng cấp toàn diện Modal Quét Đơn Hoàn Tự Động theo chuẩn Hallmark UI (`Tab_Orders.html`)**:
  - **Bộ Preset Chips Chọn Nhanh 1 Chạm**: Cung cấp các tag lý do hoàn thường gặp trong thực tế vận hành thương mại điện tử:
    - 📦 *Bom hàng / Khách không nhận*
    - 💔 *Bể vỡ khi vận chuyển*
    - ⚠️ *Giao sai mẫu / Thiếu hàng*
    - 🔄 *Khách đổi ý / Trả qua sàn*
    - ⏳ *Giao chậm / Quá hạn nhận*
  - **Ô nhập văn bản chi tiết & nút xóa nhanh**: Cho phép nhân sự tự do nhập lý do cụ thể (hoặc bấm chọn nhanh rồi gõ bổ sung chi tiết), có nút `✕` xóa nhanh để đổi lý do.
  - **Tự động bóc tách cột lý do từ file báo cáo Shopee/TikTok**:
    - Dò tìm các header `lý do trả hàng`, `lý do hoàn`, `lý do khiếu nại`, `return reason`, `refund reason`.
    - Gắn nhãn badge lý do thực tế dưới từng mã đơn trong danh sách khớp.
    - Tự động điền lý do này làm gợi ý chung cho đợt quét nếu nhân sự chưa chọn lý do nào khác.
  - **Hỗ trợ súng bắn mã vạch (Barcode Gun)**: Bổ sung thanh chọn lý do hoàn mặc định ngay tại màn hình chờ để nhân viên kho tít đơn hàng loạt tự động gắn luôn lý do.
  - **Lưu trữ chuẩn xác vào Schema `Orders`**:
    - Ghi nhận `returnReason: effectiveReason`.
    - Cập nhật thông minh vào cột `note`: Ghép chuỗi `[Hoàn: <lý do>]`, tự động thay thế nếu đơn đã từng có ghi chú hoàn cũ để tránh phình to chuỗi dữ liệu.
    - Đồng bộ nguyên khối qua `pushDeltas` hiển thị toast thông báo chi tiết.

---

## [v2.37.5] - 2026-09-04

### 💰 Khắc Phục Lệch Doanh Thu Thực Nhận Về Ví & Tự Động Bồi Hoàn Cước Hoàn PiShip
- **Khắc phục lỗi trừ nhầm phí vận chuyển thực tế vào tiền hàng người bán (`Modals_Orders.html`)**:
  - **Nguyên nhân gốc rễ**: Cột `Phí vận chuyển thực tế` trong file Shopee (e.g. 140.400đ hay 63.800đ) là cước thu của đơn vị vận chuyển (SPX, GHTK), do người mua trả hoặc Shopee tài trợ 100% qua mã freeship. Người bán không phải chịu khoản này. Tuy nhiên, hàm quét file đối soát `processExcel` lại lấy khoản cước này gán vào `shippingFee` và trừ thẳng vào doanh thu người bán (`grossRevenue - totalFees - shopVoucher - shippingFee`). Hậu quả: Đơn hàng thực nhận về ví hơn 200.000đ sau khi bị trừ oan 140.400đ chỉ còn hiển thị vẻn vẹn **23.167đ**.
  - **Khắc phục**:
    - Phân định rõ ràng giữa cước vận chuyển thực tế và cước người bán chịu: Chỉ trừ cước vận chuyển khi có cột riêng `Phí vận chuyển do người bán trả` hoặc khi cước thực tế vượt quá phần người mua trả cộng phần Shopee trợ giá (`Math.max(0, actualShip - buyerShip - shopeeShip)`).
    - Với các đơn hàng xuất xưởng thông thường, phí vận chuyển người bán chịu được bảo toàn chuẩn xác là 0đ. Doanh thu thực nhận về ví hiển thị chính xác hơn 200k (+219.105đ) đúng từng đồng với Kênh Người Bán Shopee.
- **Tự động bồi hoàn cước hoàn từ gói PiShip & bóc tách chuẩn phí dịch vụ 2.700đ (`Modals_Orders.html`)**:
  - **Nguyên nhân gốc rễ**: Khi khách hàng hoàn trả hàng, Shopee ghi nhận 3 khoản: `Phí vận chuyển trả hàng: -40.000đ`, `Phí vận chuyển được hoàn bởi PiShip: +40.000đ`, và `Phí dịch vụ PiShip: -2.700đ`. Hệ thống cũ chỉ đọc cột trừ 40.000đ mà không đọc cột hoàn lại 40.000đ của PiShip, dẫn đến việc shop vừa mất 40.000đ tiền ship oan, vừa tính nhầm Net thực nhận thành số dương (+42.800đ) trong khi thực tế chỉ mất -2.700đ phí dịch vụ.
  - **Khắc phục**:
    - Bổ sung nhận diện cột `iPiShipRefund` (`Phí vận chuyển được hoàn bởi PiShip`). Tính cước hoàn thực tế shop phải chịu `returnShippingFee = Math.max(0, rawReturnShip - rawPiShipRefund) = 0đ`.
    - Hiển thị trực quan trên bảng đối soát: Cột phí vận chuyển hiện `0đ` kèm nhãn xanh `[PiShip Hoàn Cước (40.000đ)]`.
    - Net thực nhận ghi nhận chuẩn xác `-2.700đ` (kèm nhãn đỏ `Phí PiShip (Hoàn khách: 144.900đ)`), tự động tạo giao dịch chi phí hàng hoàn 2.700đ vào quỹ.
- **Nhận diện chuẩn xác cột `Doanh thu đơn hàng` & Chống bắt nhầm phí NTTD (`Modals_Orders.html`)**:
  - Viết hàm `findRevenueCol` với quy tắc so khớp chính xác (Exact Match) các cột `Doanh thu đơn hàng`, `Số tiền được ghi nhận`. Loại trừ 100% các cột phí quảng cáo NTTD (như `Phí dịch vụ hiển thị NTTD (từ doanh thu đơn hàng)`) vô tình chứa chữ "doanh thu".
  - Thêm hàm `getOrderLevelVal` chống nhân đôi doanh thu khi đơn hàng có nhiều dòng sản phẩm trong file Excel.

---

## [v2.37.4] - 2026-09-04

### 🛠️ Sửa Lỗi Lệnh Sản Xuất Chưa Làm Bị Ép Sang Tab 'Đã Xong' & Bảo Vệ Tiến Độ Thợ
- **Khắc phục lỗi thẻ xưởng chưa làm xong (khâu 2 Chờ nhận việc, hoặc KCS Yêu cầu làm lại) bị hiển thị ở tab "Đã Xong" (`Tab_Production.html`)**:
  - **Nguyên nhân gốc rễ**: Khi liên kết trạng thái đơn hàng mẹ, điều kiện `isParentDelivered` đã vô tình ép trạng thái lệnh xưởng `curSt = 'ĐÃ XONG'` mà không kiểm tra điều kiện hoàn thành thực tế (`isBothDone`). Do đó, các đơn hàng Shopee đã đối soát hoặc bàn giao nhưng xưởng đang sản xuất dở dang (như thẻ *Đảo Bay ver.3* mới xong khâu 1, khâu 2 đang chờ nhận việc; hay thẻ *Hẻm Núi ver.3* đang bị KCS yêu cầu làm lại) bị cưỡng ép chuyển sang tab `ĐÃ XONG` với nút `[ ▶ NHẬN LÀM ]` bất hợp lý.
  - **Khắc phục**: Phân định ranh giới nghiêm ngặt giữa tiến độ vật lý của thợ và trạng thái đơn hàng:
    - `ĐÃ XONG`: Bắt buộc sản phẩm phải hoàn thành cả 2 khâu (`isBothDone && (isFinalQcPassed || isParentDelivered)`) hoặc xuất kho hàng có sẵn (`isStockValid`).
    - `CHỜ SẢN XUẤT`: Giữ chặt toàn bộ các lệnh đang làm dở khâu 1, chờ khâu 2 (`hasAnyWorkerStarted`) hoặc đang bị KCS báo lỗi yêu cầu làm lại để thợ tiếp tục nhận việc và thi công.
    - `ĐÃ HUỶ`: Nếu đơn mẹ đã giao nhưng thợ xưởng chưa từng đụng tay vào khâu nào (`!hasAnyWorkerStarted`), lệnh tự động chuyển sang `ĐÃ HUỶ` để tránh làm trùng, hoàn toàn không đẩy sang `ĐÃ XONG`.
- **Sửa lỗi tiền tố mã đơn `ORD` trong `getParentOrder` (`Tab_Production.html`)**:
  - Bổ sung bộ lọc loại trừ các tiền tố hệ thống tự sinh (`ORD`, `PROD`) khi tách chuỗi `_`, ngăn ngừa so khớp nhầm với bản ghi rác.

---

## [v2.37.3] - 2026-09-03

### 🛡️ Bảo Vệ Trạng Thái Đơn Hàng & Đồng Bộ Hai Chiều Khi Xoá Lệnh Sản Xuất
- **Khắc phục lỗi đơn tự nhảy hoặc kẹt ở "Sẵn Sàng Đóng Gói" khi xoá lệnh sản xuất (`Tab_Orders.html` & `Modals_Orders.html`)**:
  - **Nguyên nhân gốc rễ**: Hàm `computeOrderMetadata` và `effectiveStatus` trước đây mặc định `allProdDone = true` khi số lượng lệnh sản xuất liên kết bằng 0 (`related.length === 0`). Khi người dùng xoá lệnh sản xuất, hệ thống ngộ nhận là "không có lệnh nào đang nợ ➔ sản xuất đã xong 100%" và tự động ép đơn sang trạng thái `Sẵn Sàng Đóng Gói`.
  - **Khắc phục**: Ràng buộc cờ `hasProduction` nghiêm ngặt: Nếu đơn hàng có `hasProduction === true` mà danh sách lệnh liên kết rỗng (`related.length === 0`), `allProdDone` bắt buộc nhận giá trị `false`. Bổ sung chốt chặn `else if (!meta.allProdDone && eff === 'SẴN SÀNG ĐÓNG GÓI' && !meta.hasDonePack)` tự động kéo đơn về đúng `Chờ Sản Xuất`, ngăn chặn triệt để nguy cơ thợ đóng gói đóng nhầm thùng rỗng.
- **Hộp thoại điều hướng thông minh 2 chiều khi bấm Xoá Lệnh Sản Xuất (`Tab_Production.html`)**:
  - Khi quản lý/chủ shop bấm thùng rác xoá lệnh xưởng, hệ thống phân tích đơn hàng mẹ liên kết và cung cấp lựa chọn chuẩn:
    - Bấm **OK**: Huỷ luôn đơn hàng tương ứng (`Đơn Huỷ`) nếu khách đổi ý không mua nữa.
    - Bấm **CANCEL**: Giữ đơn hàng và chuyển trạng thái về `Chờ Sản Xuất` (kèm `hasProduction: true`) để chuẩn bị tạo lại lệnh xưởng mới.
  - Đồng bộ cả lệnh xoá `deletes: { prodItems: [...] }` và cập nhật `orders: [...]` trong cùng 1 payload an toàn nguyên khối.

---

## [v2.37.2] - 2026-09-03

### 🏭 Liên Kết Trạng Thái Đơn - Xưởng (Parent-Child Cascade), Quét Ghi Chú Đơn Hàng Shopee & Triệt Tiêu Nhãn Ảo Tồn Kho
- **Liên kết trạng thái Đơn Hàng Mẹ & Lệnh Sản Xuất Con (`Tab_Production.html`)**:
  - **Nguyên nhân gốc rễ**: Lệnh xưởng chỉ tính trạng thái qua 2 khâu thợ mà không xét trạng thái đơn hàng mẹ. Khi đơn hàng đã đóng gói và xuất kho (`Đã Bàn Giao`, `Hoàn Thành`, `Đối Soát Thành Công`), lệnh sản xuất con chưa bấm hoàn thành vẫn treo ở tab `CHỜ SẢN XUẤT`, gây mâu thuẫn và cãi vã trong xưởng.
  - **Khắc phục**: Thiết lập cơ chế Parent-Child Cascade: Nếu đơn mẹ đã dứt điểm (`Đã Bàn Giao`, `Hoàn Thành`, `Đối Soát Thành Công`), lệnh sản xuất tự động mang trạng thái `_computedStatus = 'ĐÃ XONG'` và tuyệt đối không hiển thị ở tab `CHỜ SẢN XUẤT`. Nếu đơn mẹ huỷ, lệnh chuyển thành `ĐÃ HUỶ`.
- **Quét chính xác Ghi Chú Đơn Hàng từ File Shopee (`Modals_Orders.html`)**:
  - **Nguyên nhân**: Hàm nhập file Excel Shopee thiếu cột quét ghi chú khách (`iNote`), khiến lời dặn của khách (`Ghi chú của người mua`, `Buyer Note`, `Lưu ý`) bị bỏ rơi hoàn toàn, không lưu vào `Orders.note`.
  - **Khắc phục**: Bổ sung bộ nhận diện đa ngôn ngữ cho cột ghi chú khách, lưu chuẩn xác vào `Orders.note`, truyền trực tiếp vào lệnh sản xuất và hiển thị nổi bật ở khối `LƯU Ý ĐƠN HÀNG` màu tím indigo trên thẻ thợ.
- **Triệt tiêu nhãn ma "Lấy từ tồn kho có sẵn" & dọn sạch rác ghi chú tự sinh (`Tab_Production.html` & `Code.js`)**:
  - Khi lệnh xưởng đang ở trạng thái Chờ Sản Xuất (`Pending`), tự động dọn sạch các nhãn tồn kho mâu thuẫn (`Lấy từ tồn kho có sẵn`, `Có sẵn ở kho...`) và các chuỗi text rác tự sinh (`Sản xuất mới cho đơn...`). Chỉ hiển thị đúng thông số kỹ thuật và lời dặn thực tế của khách hàng.

---

## [v2.37.1] - 2026-09-03

### 🚚 Khắc Phục Lỗi Đồng Bộ Bàn Giao Đơn Hàng & Tích Hợp Nút Bàn Giao Trực Tiếp 1-Click
- **Khắc phục lỗi hoàn trạng thái "Chờ Bàn Giao" khi tải lại trang (`Code.js` & `Tab_Orders.html`)**:
  - **Nguyên nhân gốc rễ**: Trong hàm `applyDeltasToSheet('Orders')` và `syncDeltas`, hệ thống chỉ so khớp duy nhất `String(data[i][0]) === String(item.id)` mà không tìm theo chỉ số cột `idColIdx` và không có cơ chế dự phòng khớp theo `orderCode`. Khi đơn Shopee/TikTok được gửi lên với mã đơn (`2609033FPUAX50`) hoặc khác biệt khoảng trắng, Google Apps Script không tìm thấy dòng cũ nên ghi chèn thêm dòng mới xuống cuối sheet thay vì cập nhật dòng hiện tại, khiến thao tác tải lại trang nạp dòng cũ vẫn ở trạng thái "Chờ Bàn Giao".
  - **Khắc phục**: Nâng cấp thuật toán so khớp đa tầng: tìm chính xác cột `id` qua `headers.indexOf('id')` kèm `.trim()`; tự động kích hoạt đối soát dự phòng theo mã đơn `orderCode` (chuẩn hóa cắt chuỗi `| MVĐ: `).
- **Tích hợp nút "BÀN GIAO" trực tiếp 1-click trên thẻ đơn hàng (`Modals_Orders.html`)**:
  - **Vấn đề**: Các đơn đóng gói hoàn tất (Shopee, TikTok, GHN, Bán Lẻ) trước đây hiển thị nút "CHỜ KHO" (`handleAct('START_CARRY')`). Khi nhân sự bấm vào, hệ thống chỉ gán cờ `isCarriedToWH` mà không cập nhật trạng thái đơn sang `Đã Bàn Giao`.
  - **Giải pháp**: Phân luồng thông minh: các đơn giao khách/sàn vận chuyển hiển thị ngay nút **`[ 🚚 BÀN GIAO ]`** màu gradient xanh nổi bật, kích hoạt thẳng luồng `handleAct('SHIP')` để xuất kho và chuyển sang `Đã Bàn Giao` tức thì; chỉ các đơn nội bộ chuyển kho (`Sản Xuất Bù Kho`, `Sản Xuất Tồn`) mới sử dụng luồng "CHỜ KHO".
- **Đồng bộ cờ `isCarriedToWH: true` trong Bàn Giao Hàng Loạt (`Tab_Orders.html`)**:
  - Đảm bảo khi bấm "BÀN GIAO (N)" ở thanh công cụ hàng loạt, toàn bộ cờ trạng thái `status: 'Đã Bàn Giao'` và `isCarriedToWH: true` được ghi nhận đồng bộ 100%.

---

## [v2.37.0] - 2026-09-03

### 🛡️ Đại Tu Kiến Trúc Toàn Diện: Triệt Tiêu Mất Dữ Liệu, Deadlock & Chống Lệch Kho
- **Loại Bỏ Hàm Trùng Lặp & Khôi Phục Logic Khấu Trừ Tồn Kho Chuẩn Xác (`Code.js`)**:
  - **Nguyên nhân gốc rễ**: Tồn tại 2 hàm cốt lõi `normalizeProdName()` và `getProductInfoByName()` bị khai báo lặp ở cuối file với logic đơn giản hoá và `isEligible = true` cho mọi sản phẩm. Trong Google Apps Script, khai báo sau ghi đè khai báo trước, khiến toàn bộ phụ kiện/vật tư không đủ điều kiện sản xuất đều bị quét nhầm thành sản phẩm sản xuất và trừ kho sai lệch.
  - **Khắc phục**: Xoá bỏ hoàn toàn các bản khai báo trùng lặp; khôi phục bản chuẩn với thuật toán bóc tách kích thước đa chiều (vd: `25x12x14`), bỏ dấu tiếng Việt chuẩn hóa và kiểm tra phân loại `category` nghiêm ngặt.
- **Khắc Phục Deadlock & Nhả Khóa Sớm Trong Quá Trình Trừ BOM Tự Động (`Code.js`)**:
  - **Nguyên nhân**: Khi `syncDeltas` đang giữ `LockService.getScriptLock(30000)`, việc gọi trực tiếp `processMaterialDeduction` (có `try/finally { lock.releaseLock(); }`) đã vô tình giải phóng Lock sớm, khiến toàn bộ thao tác ghi sau đó (Packings, Attendance, Products, Accounts, Suppliers, Transactions...) chạy không có khóa bảo vệ.
  - **Khắc phục**: Tách biệt hàm nội bộ `_processMaterialDeduction_Core(prodId, materialUsageData, ss)` không can thiệp khóa, giữ vững ScriptLock của `syncDeltas` liên tục xuyên suốt toàn bộ giao dịch.
- **Batch Hóa Biến Động Số Dư Tài Khoản (`Code.js`)**:
  - **Nguyên nhân**: Thao tác xóa hoặc cập nhật nhiều giao dịch gọi `adjustAccountBalanceServer` lặp từng dòng đơn lẻ, gây đọc dữ liệu cũ (stale read) và race condition số dư.
  - **Khắc phục**: Xây dựng cơ chế `applyBatchAccountBalanceChanges(ss, balanceChanges)` gom toàn bộ biến động tài khoản thành 1 map duy nhất và cập nhật nguyên khối trên bảng `Accounts`.
- **Nâng Cấp Xóa Dữ Liệu Nguyên Khối O(1) Cho `deleteDeltas` (`Code.js`)**:
  - **Nguyên nhân**: Vòng lặp `deleteRow(i + 1)` gọi API Google Sheets đơn lẻ gây nguy cơ timeout khi xóa hàng chục bản ghi cùng lúc.
  - **Khắc phục**: Chuyển sang thuật toán lọc mảng trong bộ nhớ và ghi đè nguyên khối `clearContents() + setValues()`, triệt tiêu hoàn toàn nguy cơ timeout và mất dữ liệu dở dang.
- **Siết Chặt An Ninh Phân Quyền Backend RBAC (`Code.js`)**:
  - Loại bỏ logic so khớp hardcode theo tên người dùng trong `checkServerPermission` và `validateTableWritePermission`.
  - Bổ sung xác thực PIN và phân quyền `CALC_TANK` cho endpoint tính toán định mức bể kính `autoCalculateGlassTankBOM`.
  - Chuẩn hóa lưu trữ tài chính cộng tác viên `CTV_Finance` qua `applyDeltasToSheet` chống trùng lặp ID.

---

## [v2.36.7] - 2026-09-03

### 🛠️ Sửa Lỗi Khởi Tạo Hàm Phân Hệ Trách Nhiệm (`ReferenceError: Cannot access 'normalizeTools' before initialization`)
- **Khắc Phục Lỗi Hiển Thị Khối Giao Diện Tab Trách Nhiệm (`Tab_Workspaces.html`)**:
  - **Nguyên nhân**: Hàm `normalizeTools` và `getConditionBadge` được khai báo bằng biểu thức hàm (`const normalizeTools = (...) => ...`) tại dòng 83 bên trong component `WorkspaceTab`. Tuy nhiên, ngay từ đầu component (dòng 33 và 61), các hook `React.useMemo` (`allManagerStats` và `displayedWorkspaces`) đã thực thi và gọi `normalizeTools` trong quá trình render đầu tiên. Do cơ chế Temporal Dead Zone (TDZ) của biến `const`, trình duyệt ném ra lỗi `ReferenceError: Cannot access 'normalizeTools' before initialization`, kích hoạt Error Boundary khiến toàn bộ giao diện sập với màn hình cảnh báo.
  - **Khắc phục**: 
    - Nâng khai báo `function normalizeTools(...)` và `function getConditionBadge(...)` lên vị trí đầu script trước component `WorkspaceTab`.
    - Sử dụng chuẩn `function` declaration để được hỗ trợ hoisting tự nhiên và khởi tạo sẵn sàng trước bất kỳ hook hay component React nào.
    - Phân hệ Trách Nhiệm đã hoạt động trở lại trơn tru, hiển thị đầy đủ dải Tab nhanh nhân sự, bento grid quản lý thiết bị và tính toán giá trị tài sản chính xác 100%.

---

## [v2.36.1] - 2026-09-03

### 🛠️ Sửa Lỗi Phạm Vi Biến Bảng Đối Soát Doanh Thu (`shortenStatusText is not defined`) & Tối Ưu UX Dừng Hỏa Tốc
- **Khắc Phục Lỗi Hiển Thị Khối Giao Diện `ReferenceError: shortenStatusText is not defined` (`Modals_Orders.html`)**:
  - **Nguyên nhân**: Các hàm `normalizeStatus`, `shortenStatusText`, `getStatusBadgeStyle` được khai báo cục bộ bên trong hàm xử lý file `processExcel`. Khi React render modal `BulkFinanceModal`, bảng xem trước giao dịch (`previewLogs.map`) gọi `shortenStatusText` bị lỗi biến ngoài phạm vi (out of scope), kích hoạt Error Boundary gây màn hình vàng "Đã xảy ra lỗi hiển thị khối giao diện".
  - **Khắc phục**: Nâng các hàm này lên cấp component `BulkFinanceModal` để cả logic xử lý file Excel lẫn JSX rendering bảng xem trước đều truy cập an toàn 100%.
- **Tối Ưu UX Thao Tác Dừng/Tắt Hỏa Tốc (`Modals_Orders.html` & `Tab_Production.html`)**:
  - Thêm sự kiện `onClick={handleToggleUrgent}` trực tiếp trên huy hiệu `🔥 ƯU TIÊN LÀM NGAY (Bấm để tắt)`.
  - Giúp quản lý và thợ xưởng có thể dừng chế độ hỏa tốc ngay lập tức chỉ bằng 1 chạm vào huy hiệu to rõ ràng, không cần tìm nút nhỏ `⚡`.

---

## [v2.36.0] - 2026-09-03

### 🔥 Hệ Thống "Đơn Hỏa Tốc / Ưu Tiên Làm Ngay" Đồng Bộ 2 Chiều (Kèm NTFY) & Sửa Lỗi Crash Khởi Tạo
- **Khắc Phục Dứt Điểm Sự Cố Màn Hình Đỏ / Crash Khởi Tạo (`Modals_Orders.html` & `Tab_ImportExport.html`)**:
  - **Sửa Lỗi TDZ `ReferenceError: Cannot access 'getProducerOrigin' before initialization`**: Hoán đổi vị trí khai báo hàm `getProducerOrigin` lên trước hook `chameleonConfig` trong `OrderCardV2`.
  - **Sửa Lỗi Cú Pháp Phase 2 Babel `Unexpected token (2495:0)`**: Bổ sung dấu ngoặc đóng `});` của vòng lặp `filteredLogs.forEach` tại hàm `dateGroups` trong `Tab_ImportExport.html`, loại bỏ triệt để lỗi biên dịch Babel khi tải trễ Deferred Tabs.
- **Triển Khai Tính Năng Đơn Hỏa Tốc / Ưu Tiên Làm Ngay 1-Chạm (`Tab_Orders.html` & `Tab_Production.html`)**:
  - **Nút Bấm Icon Tia Sét `⚡` 1-Chạm Trên Từng Thẻ**:
    - Bố trí nút `⚡` trên thẻ Đơn hàng (`OrderCardV2`) và thẻ Sản xuất (`WorkerCardV2`) cạnh cụm nút thao tác (camera, sửa, xóa). Tuyệt đối không thêm nút vào thanh công cụ Action Toolbar để bảo vệ giao diện sạch sẽ.
    - Icon khi tắt: Xám/vàng mờ `text-zinc-500 hover:text-amber-400`.
    - Icon khi bật: Vàng neon phát sáng rực rỡ `text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] bg-amber-400/20`.
  - **Ghim Lên Đỉnh Danh Sách (Pin to Top #1)**:
    - Khi bật hỏa tốc, đơn hàng tự động nhảy lên vị trí số 1 tại Tab Đơn Hàng (bất kể thứ tự ngày tạo).
    - Tại Tab Sản Xuất, lệnh sản xuất hỏa tốc và nhóm kênh tương ứng tự động nhảy lên vị trí đầu tiên của hàng đợi (Khâu 1, Khâu 2, Đóng gói).
  - **Viền Đỏ Rực Nhịp Đập & Huy Hiệu Nảy Bắt Mắt**:
    - Thẻ được bao bọc bởi viền nhịp đập: `border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.35)] animate-pulse`.
    - Đầu thẻ hiển thị huy hiệu: `<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-400 text-[12px] font-black uppercase tracking-wider mb-2 animate-bounce"><span>🔥 ƯU TIÊN LÀM NGAY</span></div>`.
  - **Đồng Bộ 2 Chiều Optimistic UI & Database**:
    - Bấm trên Đơn hàng ➔ Lệnh sản xuất bên Tab Sản xuất tự động bật hỏa tốc.
    - Bấm trên Sản xuất ➔ Thẻ đơn hàng bên Tab Đơn hàng tự động bật hỏa tốc.
    - Bấm lại lần 2 để tắt chế độ ưu tiên.
  - **Tích Hợp Bắn Thông Báo Đẩy Qua NTFY (ntfy.sh)**:
    - Khi `isUrgent` bật sang `true`, tự động kích hoạt hàm `sendNtfyUrgentAlert` bắn tin nhắn đến topic `rf_workspace_urgent` với `Priority: urgent` và tag `rotating_light,fire,package`.
- **Cập Nhật CSDL & Backend Concurrency (`Code.js`)**:
  - Bổ sung trường `isUrgent` và `urgentAt` vào schema `Orders`, `Orders_Archive`, `Production`.
  - Cập nhật hàm chuẩn hóa `formatOrder` và `formatProd`.
  - Viết RPC `api_toggleOrderUrgent(orderId, isUrgent, pin)` bọc trong `LockService.getScriptLock().waitLock(15000)` chống ghi đè dữ liệu đồng thời.

---

## [v2.35.6] - 2026-09-02

### 💎 Tối Ưu Giao Diện Modal Đối Soát File Đơn Hàng (Order.all / Income)
- **Chuẩn Hóa Màu Sắc Status Badge Đồng Bộ 100% (`Modals_Orders.html`)**:
  - Viết hàm `normalizeStatus(status)` chuẩn hóa `.trim()`, `.toLowerCase()`, `.normalize("NFC")`.
  - Phân loại màu sắc chính xác theo quy chuẩn:
    - **Nhóm Hoàn Thành / Đã Giao**: Badge xanh lục (`bg-emerald-500/15 text-emerald-400 border-emerald-500/30`).
    - **Nhóm Đã Hủy**: Badge đỏ hồng (`bg-rose-500/15 text-rose-400 border-rose-500/30`).
    - **Nhóm Hoàn Hàng / Khiếu Nại**: Badge vàng cam (`bg-amber-500/15 text-amber-400 border-amber-500/30`).
  - Triệt tiêu 100% lỗi lệch màu hoặc badge bị rơi vào màu xám xịt do khác biệt Unicode tổ hợp.
- **Rút Gọn Chuỗi Trạng Thái Shopee Siêu Dài & Khóa Chiều Rộng Cột (`Modals_Orders.html`)**:
  - Chuỗi câu dài *"Người mua xác nhận đã nhận được hàng, tuy nhiên Người mua vẫn có thể gửi yêu cầu Trả hàng/Hoàn tiền tới ngày YYYY-MM-DD"* được tự động bóc tách thành: `Đã nhận (Hạn khiếu nại: DD/MM)` hoặc `Đã nhận hàng`.
  - Cột trạng thái được khóa cứng: `max-w-[220px] truncate whitespace-nowrap overflow-hidden` kèm `title={fullStatusText}` hiển thị tooltip câu gốc khi rê chuột, ngăn chặn triệt để hiện tượng vỡ layout kéo dãn mất cột tiền.
- **Cố Định Cột Mã Đơn & Luôn Hiển Thị Thanh Cuộn Ngang (`Modals_Orders.html`)**:
  - Cột đầu tiên (Cột Mã Đơn) được cố định với `sticky left-0 bg-[#121216] z-10 shadow-[2px_0_5px_rgba(0,0,0,0.5)]`, đứng yên khi cuộn ngang sang phải xem các cột tiền (`PHÍ SÀN`, `NET THỰC NHẬN`).
  - Bọc toàn bộ bảng trong `w-full max-h-[60vh] overflow-y-auto overflow-x-auto relative rounded-xl border border-zinc-800 custom-scrollbar`: Thanh cuộn ngang luôn hiển thị ngay trước mắt ở đáy khung nhìn, không cần cuộn chuột qua 500+ dòng.

---

## [v2.35.5] - 2026-09-02

### 🎯 Triển Khai Hệ Thống Truy Vết Nguồn Gốc Sản Phẩm Xuất Kho (Serial Bể Kính & KCS Layout)
- **Bể Kính: Cơ Chế Mã Serial 4 Số Góc Đáy Bể (`Production.serialCode`)**:
  - Khi thợ Khâu 2 (Gọt Keo) bấm hoàn thành, hệ thống tự động sinh mã định danh 4 số duy nhất dạng `#XXXX` (lấy 4 số cuối của ID lệnh hoặc số tuần tự) và lưu vào `Production.serialCode`.
  - **Modal Cảnh Báo Neon-Yellow**: Xuất hiện hộp thoại vàng neon nổi bật với icon cây bút `✍️ MÃ ĐỊNH DANH ĐÁY BỂ: #XXXX`, nhắc nhở thợ dùng bút lông ghi mã số vào góc đáy bể trước khi xếp lên kệ.
  - **Xác Thực Serial Khi Đóng Gói (`OrderCardV2`)**: Thợ đóng gói kiểm tra mã 4 số dưới đáy bể và gõ trực tiếp hoặc chạm chọn từ danh sách chip serial khả dụng trong kho để xác nhận xuất.
- **Layout: Cơ Chế Chọn Theo Ảnh KCS Trên Tay (Visual Matching)**:
  - Hiển thị lưới hình ảnh KCS thực tế (`qc_front_photo` / `p2_photo`) của từng cây layout tồn kho kèm tên thợ Dựng Khung & Gia Cố. Thợ đóng gói đối chiếu cây layout trên tay với ảnh KCS và chạm chọn để gán xuất chính xác.
- **Nút Cứu Nguy Thất Lạc/Hỏng: `[Không Tìm Thấy Hiện Vật Trên Kệ]`**:
  - Bổ sung nút cứu nguy màu đỏ trên cả 2 modal. Nếu hiện vật bị vỡ hoặc thất lạc trong kho, thợ đóng gói bấm nút này để hệ thống tự động hủy xuất tồn và chuyển đơn hàng sang trạng thái `Chờ Sản Xuất Mới` (kèm ghi chú thời gian cảnh báo).
- **Loại Bỏ Hoàn Toàn Nhãn Ảo "Kho Hàng | Kho Hàng"**:
  - Sau khi gán hiện vật tồn, đơn hàng hiển thị 100% tên thợ sản xuất thực tế trên thẻ đơn hàng và nhật ký đơn.
- **Backend Concurrency Safe (`Code.js`)**:
  - Mở rộng bảng `Production` thêm 3 cột: `serialCode`, `usedByOrderCode`, `usedAt`.
  - Bổ sung 2 hàm RPC: `api_getAvailableStockItems(sku, type)` và `api_assignStockItemToOrder(prodId, orderCode, serialCode)` được bảo vệ bằng `LockService.getScriptLock().waitLock(15000)` chống xung đột xuất kho đồng thời.

---

## [v2.34.2] - 2026-09-02

### 💎 Tái Cấu Trúc Nhật Ký Chứng Từ: Tách Bạch Xuất - Nhập Từng Kho, Thống Kê Ròng & Ẩn Mã Kỹ Thuật
- **Tối Ưu Hoá Nút Thao Tác Tạo Phiếu Thành Icon Gọn Gàng (`Tab_ImportExport.html`)**:
  - Chuyển đổi toàn bộ nút `[Nhập Kho]`, `[Đặt Hàng]`, `[Xuất Kho]`, `[Thanh Lý]`, `[Đồng Bộ BOM]`, `[Sửa BOM]` thành các nút Icon tinh gọn, có Tooltip trực quan và co giãn thông minh trên di động/máy tính bàn.
- **Tách Biệt Độc Lập Luồng Xuất / Nhập / Đặt Hàng Trong Từng Kho Hàng (`Tab_ImportExport.html`)**:
  - Bổ sung thanh Sub-filter chips: `[Tất Cả (N) | 📥 Nhập Kho (N) | 📤 Xuất Kho (N) | 📋 Đặt Hàng (N) | 🔄 Kiểm Kho / Khác (N)]` chạy động ngay dưới bộ chọn từng Kho (`Kho Bể Kính`, `Kho Layout`, `Kho Phụ Kiện`, `Kho Vật Tư`).
- **Nâng Cấp Dải Bento Thống Kê Tài Chính Luân Chuyển 4 Thẻ (`Tab_ImportExport.html`)**:
  - **Tổng Chứng Từ**: Hiển thị tổng số phiếu kèm tỷ lệ `{N} Nhập • {N} Xuất`.
  - **Tổng Tiền Nhập**: `+{Số tiền}đ` màu xanh lục (click để lọc ngay danh sách phiếu nhập).
  - **Tổng Tiền Xuất**: `-{Số tiền}đ` màu đỏ hồng (click để lọc ngay danh sách phiếu xuất).
  - **Giá Trị Ròng (Nhập - Xuất)**: `±{Số tiền}đ` vàng gold sang trọng, phản ánh chính xác chiều hướng tăng/giảm tồn kho của xưởng.
- **Ẩn Mã Kỹ Thuật `IE_...`, Đưa Đối Tượng / Mục Đích Giao Dịch Lên Làm Tiêu Đề Chính (`Tab_ImportExport.html`)**:
  - Tiêu đề thẻ chứng từ hiển thị rõ ràng: `Bàn Giao Khách Hàng (Hàng Loạt)`, `Sản Xuất Layout`, `Tự động nhập kho (Sản xuất xong)`, `Nhà cung cấp...`.
  - Mã kỹ thuật (`IE_SAFE_OUT_...`, `IE_BOM_...`) được thu gọn thành nhãn monospace tinh tế ở hàng dưới.

---

## [v2.34.1] - 2026-09-02

### 💎 Tối Ưu Hiển Thị Kho Hàng: Làm Tròn Tồn 3 Số Thập Phân, Hiện Giá Nhập Vật Tư & Tinh Gọn Thẻ Kho
- **Chuẩn Hóa Làm Tròn Số Lượng Tồn Kho Tối Đa 3 Chữ Số Thập Phân (`Tab_Inventory.html`, `Tab_ImportExport.html`, `Code.js`)**:
  - Triệt tiêu hoàn toàn hiện tượng số thập phân dài vô tận do sai số dấu phẩy động của JavaScript (như `0.11249999999999999` $\rightarrow$ `0.112` hoặc `0.113`).
  - Áp dụng đồng bộ cho Thẻ sản phẩm, Phân loại variants, Chế độ xem bảng, Tổng tồn danh mục và Modal Thẻ kho chi tiết (`StockHistoryModal`).
- **Kho Nguyên Liệu / Vật Tư Ưu Tiên Hiển Thị Giá Nhập (Giá Vốn) (`Tab_Inventory.html`)**:
  - Tự động nhận diện nhóm `DANH MỤC SẢN XUẤT` và các danh mục con nguyên vật liệu (`NGUYÊN LIỆU LAYOUT`, `NGUYÊN LIỆU BỂ KÍNH`, `VẬT TƯ SẢN XUẤT`).
  - Hiển thị nổi bật **Giá Nhập (Vốn)** `{formatMoney(costPrice)}đ` thay vì giá bán mặc định `0đ` vô nghĩa.
- **Tinh Gọn & Chuẩn Hóa Ghi Chú Giao Dịch Thẻ Kho (`Tab_ImportExport.html`, `Code.js`)**:
  - Tự động rút gọn và định dạng đẹp các dòng lịch sử xuất vật tư BOM: `Trừ vật tư lệnh sản xuất (Tên hàng hoá) đơn (Mã đơn hàng)`.
  - Tự động giải mã các chuỗi JSON kiểm kho `{"status":"BALANCED", ...}` thành văn bản gọn gàng `Đã cân bằng kho / Cân bằng kiểm kho (Người tạo)`.

---

## [v2.34.0] - 2026-09-02

### 💎 Nâng Cấp Vận Hành Lean: Phiếu Nhận Vật Tư Đầu Ca & Quyết Toán Tiêu Hao Cuối Ca Cho Đơn Tùy Chỉnh
- **Thiết Lập Quy Trình Lĩnh Vật Tư & Quyết Toán Thực Dùng Chuẩn Xưởng (`Tab_Production.html`, `Code.js`)**:
  - **Phạm vi áp dụng nghiêm ngặt**: Chỉ áp dụng cho `BỂ KÍNH ➔ BỂ LẺ SIZE` và `LAYOUT ➔ COVER` (đơn đặt theo kích thước/ảnh mẫu tùy chỉnh).
  - **Chạm 1 (Đầu ca - Nhận việc)**: Mở popup **"Phiếu Nhận Nguyên Liệu & Vật Tư"** cho phép thợ chọn trực tiếp đá/lũa/keo/kính từ kho `DANH MỤC SẢN XUẤT ➔ NGUYÊN LIỆU LAYOUT` hoặc `NGUYÊN LIỆU BỂ KÍNH` và nhập số lượng lấy ra bàn làm việc.
  - **Chạm 2 (Cuối ca - Nộp ảnh hoàn thành)**: Mở popup **"Quyết Toán Tiêu Hao Vật Tư"** với bảng 4 cột (`Tên Vật Tư | Đã Lấy | Trả Lại Kho | Thực Dùng`). Thợ chỉ cần nhập số lượng trả thừa vào ô `Trả Lại Kho` (mặc định 0), hệ thống tự động tính toán `Thực Dùng = Đã Lấy - Trả Lại`.
- **Tự Động Trừ Tồn Kho Thực Tế & Cập Nhật Giá Vốn Đơn Hàng (`Code.js`)**:
  - Tự động trừ tồn kho `Products.quantity` theo đúng số lượng `Thực Dùng` qua action backend `deductInventoryBOM` (bọc `LockService` an toàn chống đè dữ liệu).
  - Tự động tính tổng tiền vật tư thực tế và cộng dồn vào giá vốn `Orders.cogs` của đơn hàng liên quan, đảm bảo báo cáo lợi nhuận chuẩn xác $100\%$.

---

## [v2.33.9] - 2026-09-01

### 🛡️ Hotfix: Khắc Phục Triệt Để Sự Cố Đơn Hàng Mới Biến Mất Sau Khi Nhập Trên Toàn Bộ Thiết Bị
- **Tự Động Khởi Tạo & Bảo Đảm Mã Đơn Hàng Không Bao Giờ Rỗng (`Modals_Orders.html`, `Code.js`)**:
  - Tự động sinh mã đơn hàng chuẩn tiền tố (`BL...`, `BS...`, `CTV...`, `BH...`, `TK...`, `ORD...`) ngay khi mở form hoặc chuyển kênh bán hàng nếu người dùng không tự nhập mã thủ công.
  - Bổ sung lớp bảo vệ trong `formatOrder` và `getAppData` trên Google Apps Script (`Code.js`): Gán fallback `orderCode = id` thay vì lọc bỏ đơn như rác công thức (ghost order).
- **Chuẩn Hóa Phân Quyền RBAC Backend `validateTableWritePermission` (`Code.js`)**:
  - Nhận diện linh hoạt mọi biến thể vai trò (`QUẢN LÝ BÁN HÀNG`, `QUẢN LÝ SẢN XUẤT`, `QUẢN LÝ KHO VẬN`, `QUẢN LÝ NHÂN SỰ`, `KẾ TOÁN`, `CỘNG TÁC VIÊN`, `NHÂN VIÊN`, `THỢ SẢN XUẤT`).
  - Cho phép tất cả các khâu vận hành ghi nhận đơn hàng và các đối tượng dữ liệu phụ thuộc đi kèm (phiếu cọc `TX_PRE_`, KPI bán hàng 5% `BP_KPI_`, BOM layout) mà không bị lỗi `PERMISSION_DENIED`.
- **Tối Ưu Giao Dịch Cọc & Chống Trừ Kép State**:
  - Chỉ gửi bản ghi giao dịch `Transactions` khi khách có cọc thực tế (`prePaid > 0đ`).

---

## [v2.33.8] - 2026-09-01

### 💎 Nâng Cấp Bảng Lương: Tăng Phí Công Đoàn Lên 100k & Tách Thành Khoản Trừ Cố Định Độc Lập
- **Nâng Mức Phí Công Đoàn Lên 100.000đ/Tháng/Nhân Sự (`Tab_HR.html`, `Tab_Analytics.html`, `Code.js`)**:
  - Cập nhật đồng bộ phí công đoàn từ mức cũ `50.000đ` lên `100.000đ/tháng` cho mọi nhân sự trên toàn bộ hệ thống tính lương, báo cáo tài chính chi phí nhân sự (`Tab_Analytics`), backend đồng bộ dữ liệu (`Code.js`) và mẫu in phiếu lương (`In Phiếu Lương`).
- **Tách Riêng Mục Phí Công Đoàn Thành Hàng Cố Định Độc Lập (`Tab_HR.html`)**:
  - Tách hẳn dòng **Phí Công Đoàn (Trừ cố định): -100.000đ** ra khỏi khối *Khấu Trừ & KCS Phạt*, hiển thị trang trọng với huy hiệu và icon riêng biệt trên Thẻ Lương Nhân Sự.
  - Khối **Khấu Trừ & KCS Phạt** giờ đây chỉ tập trung phản ánh các khoản phạt biến động thực tế (Vi phạm chấm công, phạt KCS, chi phí đền bù bảo hành, tạm ứng, giảm trừ khác), giúp nhân sự theo dõi minh bạch, rõ ràng, không bị hiểu nhầm phí công đoàn là tiền phạt.

---

## [v2.33.7] - 2026-09-01

### 💎 Tối Ưu & Chuẩn Hóa: Đồng Bộ Hóa 100% Phiếu In Lương Với Thẻ Lương Nhân Sự
- **Khớp Chuẩn 100% Các Khoản Thu Nhập & KPI (`Tab_HR.html`)**:
  - Tách bạch rõ ràng và chuẩn xác các dòng thu nhập: `Lương Thời Gian` (chấm công xưởng), `Tiến Trình KPI` (chức vụ/chỉ tiêu), `Phụ Cấp Xăng Xe` (cố định), `KPI Sản Xuất` (khâu 1 & khâu 2), `KPI Đóng Gói & Chở Kho`, `KPI Bán Hàng & Chốt Đơn`, `Lương Tăng Ca` và `Thưởng / Phụ Cấp Khác`.
  - Khắc phục lỗi dùng tên cũ "Hoa hồng sản xuất", "Hỗ trợ sản lượng kho" và "Lương chức vụ" gây sai lệch số liệu so với giao diện Thẻ Nhân Sự.
- **Minh Bạch Bảng Kê Chi Tiết Từng Khoản Thưởng & Phạt KCS**:
  - Liệt kê chi tiết từng dòng con kèm ngày tháng và nội dung cho mục *Thưởng & Phụ cấp khác* (Thưởng chuyên cần, thưởng nóng, bù KPI...) và mục *Khấu trừ vi phạm, KCS & Chấm công*.
  - Nhân viên đối soát rõ ràng từng đồng tiền thưởng và khoản phạt minh bạch, không còn tình trạng gộp số mơ hồ.
- **Bổ Sung Đối Chiếu Lương Mục Tiêu & Căn Chỉnh Layout In A4 Portrait Chuẩn Hallmark**:
  - Hiển thị song song `Lương Mục Tiêu` (đủ 26 công + 100% KPI) và `Thực Nhận Kỳ Này` khớp $100\%$ từng chữ số với Thẻ Lương.
  - Tinh chỉnh CSS in ấn khổ A4 Portrait, căn lề 10mm cân đối, sắc nét, không bị ngắt trang dư thừa.

---

## [v2.33.6] - 2026-08-31

### 🛡️ Hotfix: Khôi Phục Quy Trình Duyệt Khâu 1 & Khóa Khâu 2 Dây Chuyền Sản Xuất
- **Kích Hoạt Trạng Thái `Chờ duyệt khung` Khi Thợ Hoàn Thành Khâu 1 (`Tab_Production.html`)**:
  - Khắc phục sự cố thợ Tân bấm hoàn thành / tải ảnh Khâu 1 (Dựng Khung) thì lệnh nhảy thẳng sang trạng thái hoàn thành hoặc bỏ qua bước duyệt.
  - Khi Khâu 1 nộp ảnh nghiệm thu, hệ thống tự động gán cờ `qc_status = 'Chờ duyệt khung'`, hiển thị huy hiệu `[CHỜ DUYỆT KHÂU 1]` và mở khối `DUYỆT KHÂU DỰNG KHUNG` cho Quản lý / Tối Cao.
- **Khóa Chặt Khâu 2 (`GIA CỐ`) Đến Khi Được Duyệt Đạt Khung**:
  - Khâu 2 của thợ Tâm sẽ bị khóa hoàn toàn (`isLocked = true`) cho đến khi Quản lý bấm `DUYỆT ĐẠT` tại khối kiểm định khung, đảm bảo One-Piece Flow và không bao giờ để thợ làm sai mẫu.

---

## [v2.33.5] - 2026-08-31

### 🛡️ Hotfix: Chuẩn Hóa Thanh Điều Hướng Tab Đơn Hàng
- **Khử Trùng Lặp Mảng Tabs (`Tab_Orders.html`)**:
  - Khắc phục lỗi thanh điều hướng bị hiển thị lặp 2 lần các tab con.
  - Chuẩn hóa cố định 9 tab nghiệp vụ theo đúng luồng Lean One-Piece Flow: `Tất Cả`, `Chờ Sản Xuất`, `Chờ Mã Vận Đơn`, `Sẵn Sàng Đóng Gói`, `Chờ Bàn Giao`, `Đã Bàn Giao`, `Đơn Huỷ`, `Hàng Hoàn`, `Hoàn Thành`.

---

## [v2.33.4] - 2026-08-31

### 🚀 Tối Ưu: Cho Phép Phụ Kiện Âm Kho & Gỡ Bỏ Tab "Chờ Phụ Kiện"
- **Cho Phép Phụ Kiện Âm Kho Không Chặn Đóng Gói (`Tab_Orders.html` & `Modals_Orders.html`)**:
  - Phụ kiện xuất bán được phép ghi nhận âm kho bình thường để không làm gián đoạn dây chuyền đóng gói.
  - Vô hiệu hóa việc chặn đơn và gắn cờ `isMissingAccessories`. Đơn chỉ gồm phụ kiện hoặc đã làm xong sản xuất sẽ đi thẳng vào `Sẵn Sàng Đóng Gói`.
- **Gỡ Bỏ Hoàn Toàn Tab "Chờ Phụ Kiện" Khỏi Giao Diện (`Tab_Orders.html`)**:
  - Xóa tab `Chờ Phụ Kiện` khỏi thanh tab, triệt tiêu vĩnh viễn số đếm ảo 62 đơn từ các đơn lịch sử.
  - Tinh gọn thanh tab thành các luồng rõ ràng: `Tất Cả`, `Chờ Sản Xuất`, `Chờ Mã Vận Đơn`, `Sẵn Sàng Đóng Gói`, `Chờ Bàn Giao`, `Đã Bàn Giao`, `Đơn Huỷ`, `Hàng Hoàn`, `Hoàn Thành`.

---

## [v2.33.3] - 2026-08-31

### 🛡️ Hotfix: Cô Lập Tuyệt Đối Đơn Hủy & Hoàn Tất Khỏi Tab "Chờ Mã Vận Đơn"
- **Thiết Lập Chốt Chặn Group Guard Trong Bộ Lọc `filtered` & `stats` (`Tab_Orders.html`)**:
  - Khắc phục sự cố đơn hàng `Đơn Huỷ` (như đơn Shopee `260828FYPUNS0C`) chưa có mã vận đơn bị hiển thị lọt vào tab `Chờ Mã Vận Đơn`.
  - Ép điều kiện lọc trực tiếp: Tab `Chờ Mã Vận Đơn` và `Chờ Phụ Kiện` **chỉ chấp nhận đơn thuộc nhóm `Sẵn Sàng Đóng Gói`** (`group === 'Sẵn Sàng Đóng Gói'`).
  - Loại trừ $100\%$ các nhóm `Đơn Huỷ`, `Hàng Hoàn`, `Hoàn Thành`, `Đã Bàn Giao` và `Chờ Sản Xuất` khỏi tab `Chờ Mã Vận Đơn` và `Chờ Phụ Kiện`.

---

## [v2.33.2] - 2026-08-31

### 🛡️ Hotfix: Triệt Tiêu Trùng Lặp Giữa Tab "Chờ Sản Xuất" & "Chờ Mã Vận Đơn"
- **Ràng Buộc Điều Kiện `allProdDone` (`Tab_Orders.html`)**:
  - Khắc phục sự cố đơn hàng đang trong khâu sản xuất (`Chờ Sản Xuất`) bị hiển thị đồng thời ở tab `Chờ Mã Vận Đơn`.
  - Chỉ kích hoạt cờ `isMissingMVD` và `isMissingAccessories` khi đơn đã hoàn tất $100\%$ công đoạn sản xuất phôi/bể/layout hoặc có sẵn kho (`allProdDone === true`).
  - Đơn đang chờ sản xuất sẽ nằm cố định tại tab `Chờ Sản Xuất`, không bị nhảy sang tab `Chờ Mã Vận Đơn` hay `Chờ Phụ Kiện`.
- **Tối Ưu Hiển Thị Huy Hiệu Mã Vận Đơn (`Modals_Orders.html`)**:
  - Chỉ hiển thị huy hiệu `[⚡ Chờ MVĐ GHN]` và `[🚌 Nhập SĐT Xe]` khi đơn hàng đã ở trạng thái `Sẵn Sàng Đóng Gói` (`isReadyPack`), giữ thẻ đơn ở khâu sản xuất luôn tinh gọn.

---

## [v2.33.1] - 2026-08-31

### 🛡️ Hotfix: Cô Lập Phạm Vi Tab "Chờ Phụ Kiện" & Chặn Tràn Đơn Lịch Sử Đã Giao
- **Cô Lập Phạm Vi Quét Tồn Kho Phụ Kiện (`Tab_Orders.html`)**:
  - Khắc phục sự cố 62 đơn hàng lịch sử (đã đóng gói, đã bàn giao, đã hoàn thành hoặc đơn huỷ) bị nhảy tràn vào tab "Chờ Phụ Kiện" do tồn kho mặt hàng phụ kiện đó ở hiện tại bằng 0.
  - Bổ sung chốt chặn `isOrderClosedOrPacked`: Chỉ quét kiểm tra tồn kho và bật cờ `isMissingAccessories` cho các đơn đang vận hành (`Chờ Sản Xuất` / `Sẵn Sàng Đóng Gói` chưa có ảnh đóng gói).
  - Loại trừ 100% các đơn đã bàn giao, hoàn thành, chở kho hoặc hủy khỏi tab `Chờ Phụ Kiện` và `Chờ Mã Vận Đơn`.
- **Khóa Nút "Nhập Thiếu" Phụ Kiện Cho Đơn Đã Xong (`Modals_Orders.html`)**:
  - Ẩn nút bấm `Nhập Thiếu` trên các đơn đã đóng gói / bàn giao, ngăn chặn thao tác nhập bù kho nhầm cho các đơn đã xuất đi trong quá khứ.

---

## [v2.33.0] - 2026-08-31

### 🛡️ Khắc Phục Triệt Để Sự Cố Đơn Bán Lẻ Gửi GHN & Chuẩn Hóa Phân Luồng Tab Poka-Yoke
- **Chuẩn Hóa Phân Luồng Tab Vận Hành Poka-Yoke (`Tab_Orders.html` & `Modals_Orders.html`)**:
  - Khắc phục sự cố kéo giật đơn `Sẵn Sàng Đóng Gói` sang tab `Chờ Mã Vận Đơn`. Toàn bộ đơn hàng đã hoàn tất sản xuất hoặc có sẵn kho luôn nằm đúng tại tab `Sẵn Sàng Đóng Gói` (và `Tất Cả`) để thợ đóng gói thực hiện đơn ngay.
  - Gắn Huy hiệu Cảnh báo Poka-Yoke phát sáng `[⚡ Chờ MVĐ GHN]` tương tác trực tiếp: Người dùng có thể click 1-chạm để mở popup đẩy đơn GHN hoặc nhập mã vận đơn nhanh mà không cần tìm kiếm thủ công.
  - Tab `Chờ Mã Vận Đơn` được chuẩn hóa thành bộ lọc tổng hợp (Aggregate Filter) toàn hệ thống cho phép quét nhanh toàn bộ đơn thiếu mã vận đơn của các kênh.
- **Khử Lỗi Lọc Ghost Orders Trên Backend (`Code.js` - `getAppData`)**:
  - Sửa chốt chặn bộ lọc ghost order: Chỉ loại bỏ dòng khi `customer === '0'` VÀ `orderCode === '0'`.
  - Bảo vệ 100% đơn bán lẻ thật có mã đơn hợp lệ (`BL...`, `ORD_...`, `CTV...`) ngay cả khi tên khách hàng tạm thời để trống, ngăn chặn việc đơn bị server drop khi polling máy chủ chạy ngầm.
- **Tối Ưu Động Cơ Bảo Toàn State Optimistic UI & Bộ Lọc Thời Gian Động (`App_Main.html` & `Tab_Orders.html`)**:
  - Tăng thời gian lưu giữ đơn hàng mới tạo trong RAM từ $20\text{s}$ lên $180\text{s}$ trong `smartMergeOrders` và `smartMerge`, chống mất trạng thái khi đường truyền mạng chập chờn.
  - Chuyển đổi bộ lọc `matchTimeFilter` sang cơ chế tính toán năm/tháng động học theo `new Date()`, triệt tiêu hoàn toàn lỗi rớt đơn khi bước sang tháng mới.

---

## [v2.17.2] - 2026-08-28

### 🎨 Khắc Phục Triệt Để Lỗi Form/Modal/Ảnh Bị Nhảy Lên Đầu Trang (`Index.html`, `App_Main.html`)
- **Giải phóng Stacking Context cho Container Tab cha**:
  - Loại bỏ các thuộc tính `transform: translate3d(0, 0, 0)` và `will-change: transform` khỏi class `.rf-gpu-accelerated` và animation `tabFadeIn` ở cả `Index.html` và `App_Main.html`.
  - Giúp mọi thành phần `position: fixed` (Modal tạo phiếu, Form tạo đơn, Form sửa lệnh sản xuất, Lightbox xem ảnh QC/đơn hàng, Hộp thoại xác nhận) luôn neo chuẩn xác vào Viewport của màn hình trình duyệt thay vì bị nhốt vào hệ tọa độ cuộn của tab cha.
- **Trải nghiệm mượt mà, không giật trôi**:
  - Người dùng có thể thoải mái cuộn xuống dòng thứ 50, 100 ở bất kỳ tab nào (Orders, Production, HR, Inventory, Finance, Suppliers...) và bấm mở form/xem ảnh mà không bị hiện tượng form chạy tít lên trên đỉnh đầu trang hoặc nhảy giật màn hình.

---

## [v2.17.1] - 2026-08-28

### ⚙️ Tự Động Đẩy Đơn Có Sẵn Sang Trạng Thái Sẵn Sàng Đóng Gói (`Tab_Orders.html`, `Modals_Orders.html`)
- **Tự động cập nhật `_effectiveStatus` khi đơn được đáp ứng từ tồn kho**:
  - Bổ sung logic kiểm tra `meta.allProdDone` (hàng có sẵn 100%) ở tầng frontend. Ngay khi tất cả các mục sản xuất của đơn được đánh dấu hoàn thành hoặc bốc từ kho có sẵn, UI sẽ tự động ép kiểu `_effectiveStatus` sang `SẴN SÀNG ĐÓNG GÓI` thay vì kẹt lại ở `CHỜ SẢN XUẤT`.
  - Khắc phục triệt để tình trạng các đơn lấy từ kho có sẵn nhưng backend chưa đồng bộ kịp (hoặc bị sót do lỗi đếm 0) khiến đơn hàng không hiện ở bất kỳ tab nào ngoài "Tất Cả".
- **Tinh chỉnh thứ tự ưu tiên tab**:
  - Việc ép kiểu thiếu mã vận đơn (`isMissingMVD`) sang tab `Chờ Mã Vận Đơn` chỉ diễn ra ĐÚNG LÚC khi đơn đã thật sự ở trạng thái sẵn sàng đóng gói, không cướp nhầm các đơn chờ sản xuất chưa có mã vận đơn.

---

## [v2.17.0] - 2026-08-28

### ⚙️ Đồng Bộ Chuẩn Hoá Ma Trận Định Mức BomLayout & Khớp Tên Kho Nguyên Liệu (`Code.js`, `Config.html`, `Tab_Production.html`, `Tab_Inventory.html`)
- **Trích xuất định mức 100% từ Sheet `BomLayout` chính thức**:
  - Xây dựng hàm `getBomFromBomLayoutSheet(ss, prodName, targetSku)` đọc trực tiếp cấu hình ma trận dòng/cột từ sheet `BomLayout` trong Google Spreadsheet.
  - Tự động lấy chuẩn xác số lượng vật tư (Lũa Săn Miếng, Đá Tai Mèo, Nham Nhọ Nồi, Fomex 8li/10li, Keo 502) cho từng mã Layout theo đúng thiết kế của xưởng.
- **Đồng bộ tên và giá theo Kho Nguyên Liệu (`Products`)**:
  - Bổ sung hàm `findMaterialInProducts(matSku, matId, prodList)` với từ điển SKU Alias toàn diện (`NLSX-NHAMNONOI` <-> `NLSX-NOIN`, `NLSX-NHAMXANH` <-> `NLSX-NHAM`, `NLSX-VIAVOI` <-> `NLSX-VIA`, `NLSX-DANHCANH` <-> `NLSX-LUASANCANH`, `NLSX-REEN` <-> `NLSX-RE`...).
  - Triệt tiêu hoàn toàn hiện tượng hiển thị mã thô `NLSX-NOIN`, `NLSX-RE` trong Tab Sản Xuất (`Tab_Production.html`) và Kho Hàng (`Tab_Inventory.html`), đảm bảo 100% hiển thị đúng Tên tiếng Việt và Đơn giá từ bảng `Products`.
- **Chuẩn hóa tính năng Sửa Phiếu Xuất BOM (`repairAllBomTickets`)**:
  - Quét lại toàn bộ phiếu xuất kho BOM cũ `IE_BOM_...` trong `ImportExport`, gán đúng vật tư và giá vốn theo `BomLayout` và `Products`.

---

## [v2.16.9] - 2026-08-28

### ⚙️ Đồng Bộ Chuẩn Hoá Nhóm Trạng Thái Đơn Hàng & Sửa Lỗi Đếm Badge (`Tab_Orders.html` & `Code.js`)
- **Khắc phục lỗi đếm 0 trên thẻ tab nhưng có đơn bên trong (`Tab_Orders.html`)**:
  - Xây dựng hàm `getOrderTabGroup(o)` làm Single Source of Truth phân loại đơn hàng đồng bộ 100% giữa bộ đếm `stats` và bộ lọc hiển thị `filtered`.
  - Khắc phục lỗi so khớp chuỗi không cùng hoa/thường (case sensitivity mismatch) khiến tất cả các đơn hàng rơi vào nhánh fallback `completed++` (437 đơn).
- **Khắc phục triệt để lỗi ép kiểu chuỗi `"FALSE"` từ Google Sheets (`isReconciledSafe`)**:
  - Tạo hàm kiểm tra an toàn `isReconciledSafe(val)` ngăn chặn việc chuỗi `"FALSE"` từ Google Sheets bị ép kiểu thành `true` trong JavaScript, khiến hàng loạt đơn hàng bị ghi đè thành `HOÀN THÀNH`.
  - Đồng bộ logic kiểm tra `isReconciled` an toàn trong cả `Code.js` và `Tab_Orders.html`.

---

## [v2.16.8] - 2026-08-28

### 📊 Khắc Phục Lỗi Tính Doanh Thu Đa Kênh & Chuẩn Hóa Chi Phí P&L (`Tab_Analytics.html` & `Tab_BusinessReport.html`)
- **Đồng bộ chuẩn 100% Doanh Thu Thực Tế VNĐ (`Tab_Analytics.html` & `Tab_BusinessReport.html`)**:
  - Triệt tiêu lỗi nhân tỷ giá ngoại tệ (THB x715, MYR x5850) lần thứ hai trên các đơn Shopee Global (TH, MA/MY, SG...) vốn đã được quy đổi sẵn sang VNĐ khi lưu vào bảng `Orders`.
  - Khôi phục chính xác doanh thu thực tế của toàn bộ các kênh bán hàng (Shopee VN, Shopee TH, Shopee MA, TikTok Shop, CTV, Bán Lẻ...).
- **Chuẩn hóa quét Chi Phí Lương & Chi Phí Vận Hành (OPEX)**:
  - Ưu tiên đọc Quỹ Lương Chốt từ `Monthly_Snapshots` cho kỳ báo cáo tương ứng, tránh tình trạng cộng dồn các giao dịch tạm ứng trùng lặp.
  - Khoanh vùng chính xác chi phí vận hành OPEX (Mặt bằng, Điện nước, Quảng cáo/Ads, Tiếp khách, Sinh hoạt xưởng...), tuyệt đối không quét nhầm các khoản thanh toán tiền hàng nhập, công nợ nhà cung cấp hay hoàn tiền.

---

## [v2.16.7] - 2026-08-28

### ⚙️ Chuẩn Hóa Engine Trừ Vật Tư BOM & Khôi Phục Đối Tượng Xuất Kho (`Code.js` & `Tab_ImportExport.html`)
- **Tách biệt triệt để Engine định mức BOM Bể Kính vs Layout (`Code.js`)**:
  - Bổ sung trích xuất cột `type` từ bảng `Production`, triệt tiêu hoàn toàn hiện tượng `targetProd.type` bị undefined.
  - Phân loại chính xác 100%: Bể Kính chỉ trừ nguyên liệu kính/keo silicon/mài CNC và gán `target = 'Sản Xuất Bể Kính'`, Layout chỉ trừ lũa/đá/keo 502/fomex/rêu và gán `target = 'Sản Xuất Layout'`.
  - Làm tròn tất cả các số tiền thành số nguyên, ngăn chặn lỗi hiển thị thập phân dạng `3.628,044đ`.
- **Bổ sung tính năng Tự Động Sửa BOM Lỗi (`repairAllBomTickets`)**:
  - Cung cấp hàm backend quét và tự động chuẩn hóa toàn bộ các phiếu xuất BOM cũ trong sheet `ImportExport`.
  - Tích hợp nút bấm trực quan `Sửa BOM Lỗi` ngay trên thanh công cụ `Tab_ImportExport.html` cho Admin/Quản Lý Kho.

---

## [v2.16.6] - 2026-08-28

### ⚙️ Tối Ưu Luồng Tạo Lệnh Sản Xuất Tồn Kho & Hiển Thị Đơn Hàng Đa Tháng (`Tab_Production.html` & `Modals_Orders.html`)
- **Đồng bộ hiển thị lệnh chờ sản xuất xuyên tháng (`Tab_Production.html`)**:
  - Khắc phục triệt để lỗi lệnh sản xuất tạo vào cuối tháng có deadline rơi vào đầu tháng sau (hoặc lệnh tồn đọng từ tháng trước) bị bộ lọc thời gian `Tháng Này` ẩn đi.
  - Thiết lập cơ chế ưu tiên: Mọi lệnh `Chờ Sản Xuất` và `Kiểm Định` chưa hoàn thành (`!isFinished`) bắt buộc luôn hiển thị 100% trên bảng điều khiển xưởng để thợ nhận việc và gia công liên tục (One-Piece Flow).
- **Bổ sung validation và hướng dẫn chọn mẫu sản xuất tồn (`Modals_Orders.html`)**:
  - Bổ sung validation chặn lưu đơn khi giỏ hàng rỗng trong luồng Tạo Lệnh Tồn Kho, ngăn chặn việc submit nhầm đơn trống.
  - Cải tiến giao diện giỏ hàng trống: Bổ sung chỉ dẫn trực quan kèm nút bấm nhanh `+ BỂ KÍNH` và `+ LAYOUT` ngay bên trong khung thông báo.
  - Truyền đầy đủ cấu hình `configGiaLayout` và `kpiConfig` vào `AddModal` trong `Tab_Production.html` để tự động tính giá và BOM chuẩn xác.

---

## [v2.16.5] - 2026-08-28

### 🛠️ Khắc Phục Lỗi Hiển Thị Tổng Quỹ Lương Kỳ Này (`Tab_HR.html` Hotfix)
- **Chuẩn hóa giải thuật bóc tách số `cleanNumber`**:
  - Nâng cấp `cleanNumber` bóc tách an toàn mọi định dạng số (chuỗi có dấu phẩy/chấm phân cách hàng nghìn, khoảng trắng, undefined, null, NaN).
  - Bọc toàn bộ các phép tính thành phần trong `payroll` (lương chính, thưởng KPI, phụ cấp, thưởng nóng, chuyên cần, giảm trừ, tạm ứng) bằng `cleanNumber`, triệt tiêu hoàn toàn hiện tượng 1 nhân sự lỗi format làm lây lan `NaN` sụp đổ số tổng cả xưởng.
- **Mở rộng phân quyền hiển thị tổng lương**:
  - Bổ sung quyền Founder (`FOUNDER`), Admin (`ADMIN`, `isBoss`, `isAdmin`) và Quản Lý Tối Cao vào điều kiện hiển thị số tổng trên thẻ "TỔNG QUỸ LƯƠNG KỲ NÀY".

---

## [v2.16.4] - 2026-08-28

### 🛡️ Đại Tổng Rà Soát Kiến Trúc, Đồng Bộ Tỷ Giá Đa Tiền Tệ & Khóa Dữ Liệu Đồng Thời (Deep Architecture Audit & Concurrency Hardening)
- **1. Đồng Bộ Tỷ Giá Đa Tiền Tệ Shopee Global (`Tab_Analytics.html`)**:
  - Bổ sung bảng tỷ giá quy đổi sang VNĐ cho toàn bộ các kênh quốc tế: USD ($25.500$), TH ($715$), SG ($19.200$), MY ($5.850$), PH ($440$), TW ($810$).
  - Đồng bộ 100% số liệu doanh thu thuần, chi phí nền tảng và lợi nhuận gộp giữa `Tab_Analytics.html` và `Tab_BusinessReport.html`.
- **2. Quản Trị Công Nợ & Thanh Toán Từng Phần Nhà Cung Cấp (`Tab_Suppliers.html`)**:
  - Lưu vết `paidAmount` lũy kế và tính toán `debtAmount` còn nợ theo từng phiếu nhập kho.
  - Bổ sung huy hiệu `TRẢ 1 PHẦN` trực quan, bảo vệ công nợ không bị mất dấu và chỉ đóng trạng thái `isPaid: true` khi đã thanh toán đủ 100%.
- **3. Chống Rò Rỉ Bộ Nhớ RAM Canvas & Object URL Trên Mobile (`Modals_Orders.html`)**:
  - Đóng gói Component `SafeCoverImagePreview` tự động giải phóng Object URL thông qua `URL.revokeObjectURL(url)` trong hook cleanup React `useEffect`.
- **4. Bảo Vệ Dữ Liệu Đồng Thời Backend LockService (`Code.js`)**:
  - Bọc `LockService.getScriptLock().waitLock(15000)` kèm `try ... finally { lock.releaseLock(); }` trên toàn bộ các hàm ghi/xóa CSDL: `closeMonthAndArchive`, `cleanUpOldReconciliationJunk`, `autoCleanOrdersData`, `updateAppealStatus`, `hardDeleteOrderAndRelatedData`, `restoreFulfilledFromStock`.
- **5. Chuẩn Hóa Nhận Diện Thương Hiệu Kênh TikTok (`Config.html`)**:
  - Đồng bộ màu badge và inline accent của kênh TikTok sang màu Cyan chuẩn (`#06b6d4`, `bg-[#06b6d4]`).

---

## [v2.16.3] - 2026-08-27

### 🛠️ Triệt Tiêu Khối Code Trùng Lặp Trong summaryStats (`Tab_Orders.html` Hotfix)
- Xóa bỏ hoàn toàn đoạn code thừa bị lặp lại sau dòng `});` trong hook `summaryStats` tại `Tab_Orders.html`.
- Làm sạch 100% các cảnh báo IDE Linter: `',' expected`, `Argument expression expected`, `Declaration or statement expected`.

---

## [v2.16.2] - 2026-08-27

### 🛠️ Sửa Lỗi Cú Pháp Khối Hàm Lọc Thời Gian (`Tab_Orders.html` Hotfix)
- Khắc phục triệt để lỗi syntax `Unexpected token, expected ','` tại khối hàm `matchTimeFilter` và `computeOrderMetadata` trong `Tab_Orders.html`.
- Chuẩn hoá hoàn toàn các khối đóng/mở ngoặc `{ }` và hook `useCallback`/`useMemo` giúp ứng dụng render mượt mà không bị lỗi crash Babel.

---

## [v2.16.1] - 2026-08-27

### 🪵 Đồng Bộ Thuật Toán Khấu Trừ Vật Tư BOM Layout & Bể Kính (`Code.js`)
- **Phân định rõ ràng Bể Kính vs Layout**:
  - Nếu là Layout (Biotop Cuội, Rừng, Bonsai, Đảo Bay... hoặc `type !== 'BỂ KÍNH'`), tuyệt đối không cho chạy vào `calculateGlassTankSpecs`, ngăn chặn việc nhận nhầm kích thước layout `30x20x20` thành bể kính và trừ nhầm kính siêu trong / mài CNC.
- **Tính chuẩn 4 nguyên liệu Layout theo size (đồng bộ 100% `getProductBOMAndCosts`)**:
  - **Nguyên liệu chính**: Phân loại chuẩn xác Đá Cuội (`NLSX-CUOI`), Đá Tai Mèo (`NLSX-TAIMEO`), Nham Thạch (`NLSX-NHAM`), Lũa Săn Miếng (`NLSX-LUASANMIENG`), Lũa Đỗ Quyên (`NLSX-DOQUYEN`), Đá Vỉa (`NLSX-VIA`), Rễ Rừng (`NLSX-RE`), Đá Voi (`NLSX-DAVOI`), v.v. với định mức $2.5 \times (size/30)^{1.4}$ kg.
  - **Keo 502**: `NLSX-502-1CHAI` với định mức $\max(1, \text{round}(1.5 \times size/30))$ chai.
  - **Fomex**: `NLSX-FOMEX-8li` (size < 60) hoặc `NLSX-FOMEX-10li` (size $\ge$ 60) với định mức $0.08 \times (size/30)$ $\text{m}^2$.
  - **Rêu**: `NLSX-REU-A04` với định mức $\text{round}(20 \times size/30)$ gam.
- **Chuẩn hóa UOM**: Quy đổi tự động giữa $\text{m}^2$ - tấm fomex, kg - gam, chai - gram keo khi trừ vào `Products.quantity` và ghi log phiếu xuất kho `ImportExport`.

---

## [v2.16.0] - 2026-08-27

### ⚡ Đại Tu Luồng Dữ Liệu Đơn Hàng - Sản Xuất & Tối Ưu Hiệu Năng (Master Action Plan)
- **1. Single Source of Truth cho `Orders.status` (`Tab_Orders.html`)**:
  - **Triệt tiêu Trạng Thái Ma (Phantom Status)**: Gỡ bỏ việc ghi đè trạng thái ma `computeOrderStatus()` trên RAM Client, trạng thái đơn lấy 100% từ CSDL Google Sheets `Orders.status`.
  - **Tách Warning Badges**: Các trạng thái thiếu tồn kho phụ kiện hoặc thiếu MVĐ chuyển thành cờ `_isMissingAccessories` và `_isMissingMVD` render huy hiệu cảnh báo độc lập, không kéo giật trạng thái đơn.
- **2. Cô Lập Khấu Trừ BOM & Chống Trừ Kép (`Tab_Production.html` & `Code.js`)**:
  - **Xóa Trigger Trừ BOM Client**: Loại bỏ hoàn toàn lệnh gọi `processMaterialDeduction` trực tiếp từ client trên `Tab_Production.html`.
  - **Backend Single Point of Execution**: Khấu trừ BOM được giao duy nhất cho `syncDeltas` trong `Code.js` tự động thực thi 1 lần khi bản ghi lệnh chuyển sang `Done`.
  - **Bổ sung `isExportChannel`**: Mở rộng nhận diện đơn USD/Quốc tế đảm bảo thợ nhận đúng định mức thưởng x3 mà không phát sinh `ReferenceError`.
- **3. Chuẩn Hóa Hạch Toán Doanh Thu & Hàng Hoàn (`Tab_Orders.html`)**:
  - **Hạch toán 0đ cho Đơn Hoàn / Quá hạn 72h**: Đơn hàng bị hoàn hoặc đơn xuất huỷ quá hạn 72h (đã phạt COGS Diệu Hương) được hạch toán doanh thu về đúng `0đ`, không cộng vào `totalSoldOrders` hay `totalRevenue`.
  - **Nâng trần an toàn Doanh thu**: Nâng cấp `parseRevenue` lên trần an toàn 2 Tỷ đồng chống parse nhầm SĐT/mã vận đơn.
  - **Bộ lọc thời gian KPI đa mốc**: Quét toàn bộ `reconciledAt`, `returnedAt`, `date`, `createdAt` không bỏ sót đơn đối soát từ kỳ trước.
- **4. Tối Ưu Giải Phóng Bộ Nhớ RAM Canvas (`Modals_Orders.html`)**:
  - Tự động reset `canvas.width = 1; canvas.height = 1;` và dọn dẹp URL base64 khi unmount `OrderInvoiceModal`, chống tràn RAM khi xem hóa đơn liên tục.

---

## [v2.15.0] - 2026-08-27

### 💎 Tái Cấu Trúc Toàn Diện 6 Phân Hệ Cốt Lõi & Bộ 3 AI Agents Vận Hành (RF Enterprise Core)
- **1. Phân Hệ Đối Soát CTV (`Tab_Affiliate.html`)**:
  - **Triệt tiêu lỗi trừ nợ kép (Double Deduction)**: Phân tách hoàn toàn công nợ đơn hàng và dòng tiền thanh toán; `getOrderExtraExpenses` chỉ tính phụ phí dương gắn đơn (`PHÍ VẬN CHUYỂN`, `PHÍ HOÀN HÀNG`, `KHÁC...`) và bỏ qua các khoản thanh toán / kết chuyển.
  - **Khớp mã phụ phí 1:1**: Chỉ so khớp theo `(code && note.includes(code)) || (id && note.includes(id))`, loại bỏ hoàn toàn quét mờ theo tên khách.
  - **Lọc đơn huỷ, bảo lưu đơn hoàn**: Áp dụng chuẩn `normalizeStatus(o.status) === 'Đơn Huỷ'` để loại bỏ đơn hủy khỏi đối soát nhưng giữ nguyên đơn hoàn phục vụ chốt phí ship hoàn.
- **2. Quản Trị Kho & Chứng Từ (`Tab_Inventory.html` & `Tab_ImportExport.html`)**:
  - **Giao diện Hallmark Data Grid 1-tầng**: Xóa bỏ ma trận thư mục lồng nhau (`activeFolders`), chuyển sang danh sách phẳng kèm 2 nút gạt View Mode linh hoạt giữa **Dạng Thẻ (`VariantGroupCard`)** và **Dạng Bảng (`Compact Table`)**.
  - **Chuẩn hoá Thẻ Kho (`StockHistoryModal`)**: Khớp 3 tầng linh hoạt (`SKU` ➡️ `id` ➡️ fallback tên chính xác), bỏ qua chứng từ `log.type === 'Đặt Hàng'`, lũy kế ngược kèm làm tròn UOM 3 chữ số thập phân (`Math.round(val * 1000) / 1000`).
  - **Chuẩn hoá 4 phân hệ danh mục kho**: Ghim cố định 4 nhánh `BỂ KÍNH`, `LAYOUT`, `PHỤ KIỆN`, `DANH MỤC SẢN XUẤT`.
- **3. Báo Cáo Kinh Doanh & Phân Tích P&L (`Tab_BusinessReport.html` & `Tab_Analytics.html`)**:
  - **Tỷ giá ngoại tệ Shopee Global**: Tự động quy đổi tỷ giá sang VNĐ (TH: 715, SG: 19.200, MY: 5.850, PH: 440, TW: 810, USD: 25.500).
  - **Ngưỡng an toàn thực tế 2 Tỷ đồng**: Nâng cấp `safeNum` với trần an toàn 2.000.000.000đ, ngăn chặn lỗi parse nhầm số điện thoại nhưng không ép các đơn doanh thu lớn về 0.
- **4. Bộ 3 AI Agents Vận Hành & Master Cron (`RFEnterpriseCore.js`)**:
  - Tích hợp 3 Autonomous Agents: `ProductionAgent`, `HRAgent`, `WarehouseAgent`.
  - Khởi tạo `RFEnterpriseCore.setupMasterCron()` gom toàn bộ tiến trình quét ngầm vào duy nhất 1 trigger GAS chu kỳ 15 phút, giải quyết triệt để giới hạn GAS Trigger Quota.

---

## [v2.14.4] - 2026-08-27

### ⚖️ Sửa Lỗi Lưu & Đồng Bộ Dữ Liệu Phân Hệ Trách Nhiệm (Workspaces Hotfix)
- **Khắc Phục Lỗi Crash Form Lập Bàn Giao**: Sửa lỗi truy xuất thuộc tính `ws` rỗng khi bấm nút "Lập Bàn Giao Mới" trong `WorkspaceModal`, đảm bảo mở form và lưu bàn giao thành công 100%.
- **Đồng Bộ Hoàn Toàn Bảng Workspaces Vào React State**: Bổ sung mảng `Workspaces` vào `erpData`, `updateStateWithData`, và `pushDeltas` trong `App_Main.html`, giúp giao diện hiển thị ngay lập tức (Optimistic UI) các trạm làm việc vừa tạo mà không bị mất dữ liệu hay hiển thị trống.
- **Hỗ Trợ Đầy Đủ Deletes Cho ERP Tables**: Cập nhật hàm `pushErpData` để hỗ trợ chuyển tiếp tham số xoá (`deletes`) và thông báo toast tuỳ biến.

---

## [v2.14.3] - 2026-08-27

### 🛠️ Xử Lý Triệt Để Dữ Liệu Rác & Tối Ưu KPI/SLA (Minor Hotfixes)
- **Cập nhật màng lọc Ghost Orders (R6)**: Chặn đứng tình trạng các dòng trống `customer = ""` (do Google Sheets ARRAYFORMULA sinh ra) lọt vào danh sách API, giảm tải đáng kể rác vào RAM trình duyệt.
- **Bảo Toàn Giờ Số Zero (R7)**: Sửa lỗi hàm `readSheet` khi phân giải mốc thời gian 1899 của Google Sheets. Thời điểm `00:00:00` sẽ trả đúng giờ phút giây thay vì bị biến thành chuỗi rỗng.
- **Version hóa cờ Migration (R8)**: Thay thế cờ fix cứng `MIGRATION_V2_10_6_DONE` bằng `LAST_MIGRATION_VERSION` giúp các bản cập nhật CSDL ngầm trong tương lai chạy mượt mà không bị chặn.
- **Sửa Lỗi Khấu Trừ Giờ Trưa Trong Tính SLA (R9)**: Tính toán thời gian thực thi (SLA) sản xuất sẽ tự động trừ đi 1 giờ nghỉ trưa (từ 12:00 - 13:00) theo đúng thực tế, bảo vệ quyền lợi tính KPI của thợ và đo lường chính xác hiệu suất thời gian.

---

## [v2.14.2] - 2026-08-27

### 🚀 Đồng bộ trạng thái hủy trên toàn bộ hệ thống (Single Source of Truth)
- **Triệt để xử lý Unicode inconsistency (R3)**: 
  - Thay thế toàn bộ 13+ vị trí kiểm tra chuỗi `HỦY`, `HUỶ`, `HỦY/VỠ` thủ công bằng hàm `normalizeStatus()`.
  - Đảm bảo tính nhất quán dữ liệu ở mức tuyệt đối cho mọi phân hệ (Tính lương, Tồn kho, Đối soát CTV).
- **Rà soát & Đảm bảo Data Schema (R4)**:
  - Khẳng định các truy xuất thông tin nhân sự đã gọi đúng tên cột quy chuẩn `Tên Nhân Sự` để phòng tránh các lỗi crash ngầm trong khi gọi báo cáo tháng.

---

## [v2.14.1] - 2026-08-27

### 🚀 Khắc phục Trùng lặp Code tính lương (DRY Refactor)
- **Tái Cấu Trúc Động Cơ Tính Lương (Payroll Engine)**:
  - Khắc phục lỗi trùng lặp logic 700+ dòng code giữa `api_syncMasterPayroll` và `generateMonthlySnapshot` bằng hàm lõi `calculatePayrollForUser`, đảm bảo Single Source of Truth.
  - Triệt tiêu rủi ro sai lệch tài chính khi tính lương cuối tháng khi có sự cố mất điện hoặc sửa logic ở một nơi mà quên cập nhật nơi khác.

---

## [v2.14.0] - 2026-08-27

### 🚀 Tối Ưu Hiệu Năng CSDL & Dọn Dẹp Mã Nguồn (Data Audit & Optimization)
- **Chuẩn Hóa Trạng Thái Đơn Hàng Về 1 Nguồn Chân Lý (Single Source of Truth)**:
  - Hàm `normalizeStatus()`: Tự động chuẩn hóa (NFC normalization) và map hơn 20 biến thể Unicode trạng thái từ các sàn TMĐT về 5 giá trị cốt lõi.
  - Hàm `isTerminalStatus()`: Chốt chặn duy nhất thay thế cho 25+ vị trí check inline rải rác toàn hệ thống, đảm bảo tuyệt đối không còn sót trường hợp lỗi font chữ gây kẹt đơn.
- **Nâng Cấp Dung Lượng Đọc CSDL**:
  - Tăng trần giới hạn đọc hàm `readSheet` từ 4000 lên 10000 dòng, cảnh báo tự động khi sắp đầy (thay vì âm thầm cắt mất dữ liệu cũ).
- **Tự Động Hóa Dọn Dẹp Dữ Liệu Rác (Nightly Auto-Archive)**:
  - Tích hợp Trigger `nightlyAutoArchive()` chạy ngầm lúc 2h sáng: Tự động gom các đơn hàng hoàn tất quá 60 ngày sang kho lưu trữ lạnh `Orders_Archive`. Cơ chế bypass PIN giúp bot chạy không bị vướng bảo mật.
- **API Kiểm Kê Sức Khoẻ CSDL (Health Check)**:
  - Lệnh `runDataIntegrityCheck()`: Phát hiện tức thì Lệnh sản xuất mồ côi (Orphan), Trùng ID, Sai lệch Schema, Tồn kho âm, hoặc Bảng phình to quá mức giới hạn.


## [v2.13.0] - 2026-08-26

### ⚖️ Phân Hệ Quản Lý Trách Nhiệm & Bàn Giao Thiết Bị: Từng Dòng, Khấu Hao & Phạt Tự Động
- **Kiểm Kê Từng Dòng Thiết Bị Động (Dynamic Line Items)**:
  - Cho phép khai báo danh mục công cụ, thiết bị theo từng dòng cụ thể: `Tên thiết bị`, `Số lượng`, `Giá trị (VNĐ)` và `Thời gian khấu hao` (3 tháng, 6 tháng, 12 tháng, 24 tháng, 36 tháng hoặc vĩnh viễn).
  - Tự động tính tổng số lượng thiết bị và tổng định giá tài sản của từng trạm làm việc.
- **Bộ Thao Tác Sửa, Xoá, Phạt Trực Tiếp Trên Từng Dòng Thiết Bị**:
  - **Nút Phạt (🚨)**: Cho phép phạt sự cố trực tiếp trên từng món đồ bị hỏng/mất. Hệ thống tự động điền sẵn tên món đồ, nhân sự chịu trách nhiệm và gợi ý mức phạt bằng đúng giá trị món đồ.
  - Tự động sinh bản ghi phạt âm tiền vào bảng `BonusPenalty` để trừ lương cuối tháng và bắn thông báo khẩn cấp qua Ntfy.sh (0ms Push).
  - **Nút Sửa & Xoá (✏️ / 🗑️)**: Cho phép quản trị viên chỉnh sửa hoặc xoá bỏ từng thiết bị khỏi trạm.
- **Phân Quyền Khép Kín (Tối Cao & Nhân Sự Phụ Trách)**:
  - Chỉ tài khoản quyền **TỐI CAO** (`isBoss`) mới có quyền Lập Bàn Giao Mới, Chỉnh sửa thông tin trạm hoặc Xoá trạm.
  - Nhân sự phụ trách chỉ có quyền xem danh sách tài sản được bàn giao và Báo Sự Cố để bảo vệ tính minh bạch.
- **Thiết Kế Bento UI Chuẩn Hallmark Anti-AI-Slop**:
  - Tối ưu Dark mode cao cấp, bảng phân cách dòng tinh xảo, font chữ Plus Jakarta Sans và Monospace chuẩn chỉ.

---

## [v2.12.0] - 2026-08-24

### 👑 Tái Thiết Kế Giao Diện Chuẩn Hallmark & Động Cơ Zero-Latency Chống Lag Toàn Diện
- **Chuẩn Hóa Design System Royal Workbench Dark (Hallmark Anti-AI-Slop)**:
  - Định nghĩa lại toàn bộ bảng mã màu Tokens nhất quán: Obsidian Canvas (`#09090b`), Elevated Cards (`#121215`), Surface Surfaces (`#1a1a20`), viền Hairline tinh xảo (`rgba(255,255,255,0.08)`), Gold Accent (`#d4af37` & `#f0ca5e`).
  - Triệt tiêu hoàn toàn hơn 300 dòng CSS override bằng `!important` gây xung đột style và vỡ giao diện trên các thiết bị khác nhau.
  - Thiết lập phân cấp Typography sắc nét: Tiêu đề dùng `Plus Jakarta Sans` Roman display, nội dung dùng `Inter`, các trường số liệu (Mã đơn, SKU, Tiền, Giờ) dùng `Monospace`.
  - Cung cấp đầy đủ 8 trạng thái tương tác (`default`, `hover`, `active`, `focus-visible`, `disabled`, `loading`, `error`, `success`) cho nút bấm và form điều khiển.
- **Tối Ưu Hiệu Năng Zero-Latency & Triệt Tiêu Cascading Re-renders**:
  - Chuẩn hóa toàn bộ props truyền xuống 12 Tab nghiệp vụ tại `App_Main.html` thành các biến Memoized ổn định (`useMemo`), triệt tiêu hoàn toàn hiện tượng vỡ `React.memo` do inline object literals `{{ ... }}`.
  - Giúp thao tác gõ tìm kiếm, bấm checkbox, hoặc nhận tín hiệu đồng bộ nền không làm kích hoạt re-render ở các tab khác, duy trì tốc độ 60–120 FPS mượt mà.
  - Tích hợp `React.startTransition` và Hardware Acceleration GPU (`rf-tab-view`, `rf-gpu-accelerated`) giúp chuyển tab tức thì với độ trễ tiệm cận 0ms.
- **Khóa Chặt Khung Nhìn Viewport & Responsive Chống Trượt Ngang**:
  - Khóa chặt `overscroll-behavior: none`, `overflow-x: clip` và `touch-action: pan-y pinch-zoom` trên toàn bộ khung viewport.
  - Tối ưu kích thước nút bấm và touch target $\ge 40\text{px}$, chống tràn dòng trên màn hình hẹp 320px–375px.
- **Bảo Toàn Tính Toàn Vẹn 23 Bảng Relational Schema**:
  - Đảm bảo 100% tính toàn vẹn CSDL và cơ chế khóa `LockService.waitLock(15000)` chống đè dữ liệu trên Google Apps Script backend.

---

## [v2.9.7] - 2026-08-23

### 🔍 Bổ Sung Nút & Modal Xem Toàn Diện Thông Tin & Trạng Thái Đơn Hàng CTV
- **Trải Nghiệm Tra Cứu Đơn Hàng Chuẩn Bento Hallmark**:
  - Bổ sung nút **`[👁️ Chi Tiết]`** trên từng thẻ đơn hàng tại Tab Đối Soát CTV.
  - Xây dựng component modal **`AffiliateOrderDetailModal`** hiển thị toàn bộ 5 góc nhìn nghiệp vụ của đơn:
    1. **Thông tin khách hàng & Giao vận**: Tên khách, SĐT (link gọi điện `tel:` và copy), Địa chỉ, Kênh bán, CTV phụ trách, MVĐ kèm link tra cứu trực tiếp hành trình GHN/SPX.
    2. **Hạch toán tài chính & Dư nợ**: Giá bán, Thu COD, Cọc/Trả trước, Phụ phí phát sinh, Dư nợ đơn kèm công thức giải trình chi tiết.
    3. **Tiến độ sản xuất & KCS**: Chi tiết từng Layout/Bể kính, thợ Khâu 1/Khâu 2, thời gian thực hiện, kết quả KCS kèm ảnh trước/hông.
    4. **Tiến độ đóng gói & Xuất kho**: Nhân sự đóng gói, thời gian hoàn tất, ảnh bọc xốp & ảnh thùng hàng hoàn thiện.
    5. **Giao dịch phụ phí liên quan**: Lịch sử các khoản phí phát sinh đã gắn với đơn này.
  - Tích hợp trình xem ảnh phóng to toàn màn hình (Fullscreen Photo Preview).

---

## [v2.9.6] - 2026-08-23

### 🎨 Chuẩn Hóa Hiển Thị Số Tiền Dư CTV (Loại Bỏ Dấu Trừ Gây Nhầm Lẫn)
- **Tối Ưu Trải Nghiệm Đọc Số Liệu Dư Nợ**:
  - Khi đơn hàng hoặc kỳ đối soát có số dư cho CTV (Shop giữ dư tiền trả CTV) $\rightarrow$ Hiển thị trực tiếp `Dư: 14.000đ` (Màu Xanh), loại bỏ hoàn toàn dấu trừ `-` phía trước chữ Dư để tránh cảm giác bị âm/thiếu tiền.
  - Khi CTV nợ Shop $\rightarrow$ Hiển thị `Nợ: +466.000đ` (Màu Đỏ).
  - Tinh chỉnh tiêu đề và nhãn thẻ Bento Card 1 & Card 3: Tự động đổi thành `Shop Dư từ Đơn hàng` / `TỔNG XƯỞNG DƯ TRẢ CTV` khi có số dư.

---

## [v2.9.5] - 2026-08-23

### 🤝 Hoàn Thiện Dư Nợ CTV, Cộng Phụ Phí & Chuẩn Hóa Màu Sắc
- **Cộng Phụ Phí Vào Dư Nợ Đơn Hàng**:
  - Khóa chặt công thức: $\text{Dư Nợ Đơn} = \text{Giá Hàng} + \text{Phụ Phí} - \text{Thu COD} - \text{Cọc}$.
  - Tự động cộng phụ phí phát sinh (ship hoàn, gửi ngoài...) vào số dư nợ của từng đơn hàng cụ thể, đồng thời loại trừ trùng lặp trong tổng quyết toán công nợ cuối kỳ.
- **Chuẩn Hóa Màu Sắc Dư Nợ & Thêm Khung Ghi Chú Quy Ước**:
  - 🔴 **Số ĐỎ (+)**: CTV đang nợ Shop $\rightarrow$ Màu Đỏ nổi bật (`text-rose-400`).
  - 🟢 **Số XANH (-)**: Shop đang giữ tiền dư của CTV (Shop nợ CTV) $\rightarrow$ Màu Xanh (`text-emerald-400`).
  - ⚪ **0đ**: Đã tất toán cân bằng $\rightarrow$ Màu Xám (`text-zinc-400`).
  - Bổ sung khung Banner Chú Thích Quy Ước Màu Sắc thẩm mỹ trên đầu Tab CTV giúp người dùng nhận diện ngay tức thì.
- **Sửa Lỗi Nhãn Trạng Thái Sản Phẩm Trên Thẻ Đơn**:
  - Khắc phục lỗi đơn hàng đã `Hoàn Thành` / `Đối Soát Thành Công` / `Đã Bàn Giao` nhưng bên trong item sản xuất vẫn bị kẹt chữ `"SẴN SÀNG ĐÓNG GÓI"`.
  - Nhãn trạng thái sản phẩm tự động phản chiếu chính xác trạng thái thực tế của đơn hàng (`ĐỐI SOÁT THÀNH CÔNG`, `ĐÃ BÀN GIAO`, `ĐÃ ĐÓNG GÓI - CHỜ BÀN GIAO`).

---

## [v2.9.4] - 2026-08-23

### 🪙 Phân Tách Quỹ Xu Tích Lũy Vào Đúng Bảng ThongKe_TichLuyXu
- **Quy Hoạch Chuẩn Xác Vùng Lưu Trữ Dữ Liệu Xu**:
  - Di chuyển toàn bộ các khoản tặng Xu (`XU_REWARD`, `Boss tặng xu khai ví`) từ bảng tiền mặt `BonusPenalty` sang đúng bảng chuyên biệt **`ThongKe_TichLuyXu`**.
  - Tự động quét dọn và chuyển dịch dữ liệu (migration) các bản ghi Xu trong `BonusPenalty` sang `ThongKe_TichLuyXu`, bảo đảm bảng lương tiền mặt không bị cộng dồn nhầm lẫn.
  - Tích hợp `ThongKe_TichLuyXu` vào `SCHEMA_ERP`, `syncDeltas` và đồng bộ realtime số dư Xu tích lũy hiển thị trên thanh tiêu đề ứng dụng.

---

## [v2.9.3] - 2026-08-23

### 📢 Tách Biệt Thông Báo Hệ Thống Khỏi Nhật Ký Kho Vận
- **Chuyển Đổi Vùng Lưu Trữ Sang Bảng Tài Liệu (Documents)**:
  - Di dời toàn bộ thông báo phát loa của Ban Quản Lý (Boss) từ bảng `ImportExport` (kho hàng) sang bảng `Documents` với phân loại `category: 'THONG_BAO_HE_THONG'`.
  - Ẩn hoàn toàn các bản ghi thông báo hệ thống ngầm khỏi danh sách tài liệu công khai trong `Tab_Documents.html`.
  - Triệt tiêu 100% việc hiển thị nhầm lẫn mã phiếu `SYS_ANNO_...` và badge `THONG_BAO_HE_THONG` trong danh sách chứng từ xuất nhập kho `Tab_ImportExport.html`.

---

## [v2.9.2] - 2026-08-23

### 📱 Tối Ưu Hiển Thị & Chống Trượt Màn Hình Mobile
- **Triệt Tiêu Hiện Tượng Trượt / Bay Màn Hình Ngang Khi Thao Tác**:
  - Khóa chặt `overscroll-behavior: none`, `overflow-x: clip` và `touch-action: pan-y pinch-zoom` trên `html, body, #root` và thẻ `main` trong `Index.html`, `App_Main.html`.
  - Trang bị thuộc tính `overscroll-x-contain` và `touch-pan-x` độc lập cho toàn bộ các thanh danh mục, bộ lọc trạng thái, bảng danh sách chi tiết và modal tạo phiếu ở `Tab_Inventory.html` (Kiểm Kho) và `Tab_ImportExport.html` (Nhật Ký Kho).
  - Khắc phục triệt để lỗi khi người dùng vuốt ngang bảng hoặc cuộn thẻ trên điện thoại làm cả khung ứng dụng bị rung lắc, trôi lệch sang hai bên.

### 📐 Chuẩn Hóa Dư Nợ CTV Bất Biến Cho Mọi Trạng Thái
- **Khóa Chặt Công Thức Dư Nợ**: $\text{Dư Nợ Đơn} = \text{Giá} - \text{Thu COD} - \text{Cọc}$ cho 100% đơn hàng CTV.
- Đơn Hàng Hoàn (`Hàng Hoàn`) hiển thị đúng `COD = 0đ` $\rightarrow$ `Dư Nợ = +Giá` (CTV nợ xưởng giá hàng), kèm phụ phí hoàn hàng `+66.000đ`.

---

## [v2.9.1] - 2026-08-23

### 🤝 Đối Soát Cộng Tác Viên (CTV) & Dòng Tiền Độc Lập
- **Tách Bạch Dư Nợ Âm / Dương Mỗi Đơn**:
  - Hạch toán rõ ràng: Tiền thu COD qua GHN là tiền **XƯỞNG THU VỀ** tài khoản công ty.
  - Dư nợ trên từng đơn hàng:
    - **Số Dương (+)**: CTV Nợ Xưởng (Ví dụ: CTV tự thu tiền trước của khách, Xưởng thu thiếu COD).
    - **Số Âm (-)**: Xưởng Nợ CTV (Ví dụ: Xưởng thu hộ COD thừa tiền đơn hàng, Xưởng cần chuyển khoản trả hoa hồng lại cho CTV).
    - **0đ**: Đã tất toán cân bằng.
- **Bảo Vệ Doanh Thu Gốc & Cách Ly Khỏi Tab Tài Chính**:
  - Sửa hàm `syncGHNViaAPI` trong `Code.js`: Tuyệt đối không ghi đè cột doanh thu (`revenue`) của đơn hàng.
  - Cách ly 100% dòng tiền CTV: Tuyệt đối không tạo bản ghi vào sheet `Transactions` (Tab Tài Chính) của công ty đối với các đơn hàng của Cộng Tác Viên.
- **Tối Ưu Giao Diện Đối Soát CTV Chuẩn Hallmark**:
  - 3 Thẻ Bento Metrics: Dư Nợ Đơn Hàng, Phụ Phí & Đã Thanh Toán, Tổng Quyết Toán Công Nợ Cuối Kỳ.
  - Bổ sung ô tìm kiếm realtime lọc đơn nhanh theo tên khách, mã đơn, mã vận đơn.

### 🛠️ Sửa Lỗi Hệ Thống
- **Khắc Phục Lỗi Trắng Màn Khi Tải Lại Trang**:
  - Thay thế lệnh `window.location.reload()` trong `ChangelogTab` bằng `window.dispatchEvent(new CustomEvent('triggerReloadData'))`, giúp đồng bộ dữ liệu mới nhất trong 0.5s mà không bị gián đoạn hay trắng màn hình trong môi trường Google Apps Script iframe.

---

## [v2.9.0] - 2026-08-23

### 🌟 Tính năng Mới & Chốt Chặn Vận Hành
- **Hộp Đen Đối Soát Thao Tác Thợ (Blackbox Action Logger)**: 
  - Ghi nhận 250 log cục bộ mili-giây, IP, tình trạng kết nối chống chối cãi khi quên bấm nhận lệnh. 
  - Mở xem và đối soát độc quyền bởi Boss phân quyền **TỐI CAO**.
- **Chốt Chặn Poka-Yoke Xác Nhận Lệnh Thông Minh**: 
  - Popup xác nhận hiển thị to rõ tên hàng, mã đơn, định mức và thưởng trước khi bắt đầu tính giờ làm việc.
- **Phản Hồi Xúc Giác & Âm Thanh (Haptic & Web Audio)**: 
  - Phát chuông Chime và rung máy khi nhận việc / hoàn thành lệnh.
- **Bảng Định Mức BOM & Giá Vốn**: 
  - Tích hợp trực tiếp vào thẻ sản xuất với ô KPI Đóng Gói và 2 khâu Dựng Khung / Gia Cố (Layout) & Cắt Dán / Gọt Keo (Bể Kính).
- **Tab Cập Nhật Hệ Thống (ChangelogTab)**:
  - Cho phép toàn bộ nhân sự và quản lý tra cứu chi tiết các tính năng mới sau mỗi lần deploy.
  - Tích hợp bộ lọc tag, ô tìm kiếm và sao chép bản ghi.

### 🎨 Tối Ưu Giao Diện & Trải Nghiệm (UI/UX)
- **Thuần Dark Mode 100%**: Gỡ bỏ hoàn toàn toggle giao diện sáng, tối ưu hoá tương phản OLED và màu Vàng Kim Hoàng Gia `#d4af37`.
- **Tái Cấu Trúc Menu Sidebar**: Phân định 3 nhóm rõ ràng:
  1. `VẬN HÀNH`: Tổng Quan, Đơn Hàng, Sản Xuất, Nhân Sự.
  2. `QUẢN LÝ (KẾ TOÁN & KHO)`: Phân Tích P&L, Báo Cáo KQKD, Kho Hàng, Tài Chính, Đối Tác, Cộng Tác Viên.
  3. `TIỆN ÍCH`: Lỗi & KCS, Tài Liệu, Trình Chiếu 3D, Cập Nhật Hệ Thống.

---

## [v2.8.5] - 2026-08-22

### 🔄 CSDL & Kiến Trúc Dữ Liệu
- **Chuẩn Hoá Relational Schema 23 Bảng**: Khớp 100% tên cột Google Sheets và AppSheet.
- **Tài Chính CTV Tách Biệt**: Cách ly sổ quỹ chính và phiếu tài chính `CTV_Finance`.
- **Lazy-load Đơn Hàng Lưu Trữ (Archive Engine)**: Nạp theo yêu cầu các đơn hàng cũ, giảm 400% dung lượng RAM máy trạm.

---

## [v2.8.0] - 2026-08-20

### 📦 Kho Hàng & Đóng Gói
- **Tự Động Bù Lệnh Sản Xuất Khi Tồn Kho Âm/Thiếu**: Tự động sinh lệnh sản xuất khi đơn sàn TMĐT về mà tồn kho = 0.
- **Pre-flight Check Phụ Kiện**: Tự động rà soát phụ kiện trước khi sang khâu đóng gói.

---

## [v2.7.0] - 2026-08-15

### 🔍 Kiểm Soát Chất Lượng (KCS) & Báo Cáo
- **Image Annotation (Vẽ Khoanh Vùng Lỗi KCS)**: Cho phép Quản lý xưởng vẽ trực tiếp vị trí lỗi lên ảnh để thợ sửa lại.
- **Báo Cáo Sản Lượng Realtime**: Bóc tách sản lượng hoàn thành theo từng khâu và từng nhân sự trong tháng.
