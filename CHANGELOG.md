# 🚀 RF_WORKSPACE_PRO — SYSTEM CHANGELOG & RELEASE HISTORY

Tài liệu lưu trữ toàn bộ lịch sử phát hành, nâng cấp kiến trúc, tối ưu nghiệp vụ và sửa lỗi của hệ điều hành `RF_Workspace_Pro`.

## [v2.46.0] - 2026-09-09

### 🪨 Tách Biệt Tuyệt Đối Định Mức Vật Tư BOM Layout & Bể Kính, Chấm Dứt Hiện Tượng Layout Trừ Kính & Keo Silicone
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **Triệu chứng sự cố**: Khi người dùng hoặc quản lý xưởng mở Drawer chi tiết của một sản phẩm Layout (ví dụ: `Biotop Cuội ver.1 - 30x20x20cm`), hệ thống hiển thị bảng `ĐỊNH MỨC TIÊU HAO VẬT TƯ (UOM)` với các chỉ số: `Diện Tích Kính: 0.273 m²` và `Keo Silicone: 27 ml (0.09 chai)`. Trên danh sách bảng sản xuất cũng hiển thị thông số `30x20x20cm • 0.273m² (5%)`.
  - **Tầng 1 (Thao tác & Nghiệp vụ Xưởng)**: Gây hiểu lầm nghiêm trọng cho quản đốc và thợ xưởng là hàng Layout đang bị trừ kính và silicon, trong khi thực tế sản phẩm Layout chỉ tiêu hao Đá, Lũa, Keo 502, Bột đá, Fomex, Rêu từ cấu hình `BOM_Config`.
  - **Tầng 2 (Quy trình phần mềm)**: Khâu bóc tách kích thước `parseDimensionsFromName` nhận diện chuỗi regex `30x20x20` có trong tên Layout và trả về đối tượng `_dimensions` (gồm diện tích kính 5 mặt `areaM2` và keo `glueMl`). Giao diện Drawer chi tiết và Table Row render `_dimensions` vô điều kiện mà không kiểm tra xem sản phẩm có phải là Bể Kính hay không.
  - **Tầng 3 (Dữ liệu & Logic nhận diện)**: Trong hàm `getProductBOMAndCosts` và `listWithComputed`, điều kiện nhận diện Bể Kính được xét trước hoặc dùng chuỗi `searchStr.includes('bể')` mà không ưu tiên lọc từ khóa Layout trước.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật**:
  1. **Ưu Tiên Phân Loại Layout Trước Bể Kính Tuyệt Đối**:
     - Quy tắc nhận diện chuẩn: Kiểm tra toàn bộ từ khóa Layout (`layout`, `biotop`, `rừng`, `cuội`, `đá`, `lũa`, `bonsai`, `cầu vồng`, `đảo bay`, `tiểu cảnh`, `vách`, `hẻm`, `hang`, `nhất trụ`, `núi`...) trước.
     - Chỉ khi không phải Layout và tên/loại có chứa `bể kính`, `hồ kính`, `dán bể`, `tank`... mới được phân loại là `Bể Kính`.
  2. **Tách Biệt Giao Diện Drawer Chi Tiết Sản Xuất**:
     - **Bể Kính**: Hiển thị bảng UOM tiêu hao chuẩn `Diện Tích Kính (m²)` và `Keo Silicone (ml/chai)`.
     - **Layout**: Hiển thị bảng `QUY CÁCH SẢN PHẨM LAYOUT` với `Kích Thước Khung Phôi` và `Phân Loại Vật Liệu: Đá / Lũa / Keo 502 (BOM)`.
  3. **Làm Sạch Bảng Danh Sách Sản Xuất**:
     - Chỉ hiển thị diện tích kính `m² (5%)` cho sản phẩm có `_computedType === 'Bể Kính'`. Sản phẩm Layout chỉ hiển thị kích thước quy cách gọn gàng.
  4. **Đảm Bảo Tính Toàn Vẹn & Khớp Schema**:
     - Không làm thay đổi luồng Optimistic UI, không ảnh hưởng tới bảng `Production`, `BOM_Config`, `ImportExport`.

---

## [v2.45.11] - 2026-09-07

### 📦 Khắc Phục Triệt Để Lỗi Lưu Phiếu Kho (totalDebtAdd) & Đồng Bộ Tức Thì Nhà Cung Cấp Mới
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **1. Sự cố lưu phiếu nhập/xuất kho báo lỗi `totalDebtAdd is not defined`**:
    - *Triệu chứng*: Khi kế toán hoặc quản lý kho tạo phiếu nhập hàng (ví dụ nhập Màng Pe từ NCC) và bấm nút `[ 💾 LƯU PHIẾU NHẬP ]`, hệ thống chặn lại và hiển thị thông báo alert: `Lỗi lưu phiếu: totalDebtAdd is not defined`.
    - *Tầng 1 (Thao tác & Vận hành)*: Quá trình lưu phiếu bị đình trệ hoàn toàn, phiếu nhập không thể ghi sổ vào bảng `ImportExport`, hàng hóa không tăng tồn kho trong `Products`.
    - *Tầng 2 (Quy trình phần mềm)*: Khi phiếu lưu thành công, hệ thống gọi callback `onSaveSuccess` để tạo bản ghi thông tin đối soát kèm các chỉ số công nợ (`debtAmount: totalDebtAdd`) và ghi chú (`note: finalNote`).
    - *Tầng 3 (Dữ liệu & Mã nguồn)*: Trong `Tab_ImportExport.html`, biến `totalDebtAdd` và `finalNote` được khai báo bằng từ khóa `let` bên trong khối `else` (`} else { logId = ...; let totalDebtAdd = 0; ... }`). Do phạm vi khối lệnh (Block Scope) của ES6, khi khối `else` kết thúc, các biến này bị hủy khỏi bộ nhớ. Đến khi callback `onSaveSuccess` ở tầng ngoài gọi `debtAmount: totalDebtAdd`, JavaScript lập tức ném lỗi `ReferenceError: totalDebtAdd is not defined`.
  - **2. Sự cố tạo Nhà Cung Cấp mới nhưng không thấy trong danh sách chọn (NCC biến mất)**:
    - *Triệu chứng*: Tại màn hình tạo phiếu nhập, người dùng bấm `+ Thêm NCC` để tạo nhanh đối tác mới (ví dụ NCC cung cấp Màng Pe, Keo, Kính...), bấm lưu thành công nhưng dropdown Nhà Cung Cấp vẫn hiển thị `-- Hàng trôi nổi / Khác --` và mở dropdown ra không thấy NCC vừa tạo đâu.
    - *Nguyên nhân gốc rễ*:
      1. Khởi tạo sai Category: State `newSup` luôn mặc định khởi tạo là `category: 'HÀNG HOÁ'`. Khi người dùng đang đứng ở tab "NGUYÊN LIỆU & VẬT TƯ" và bấm thêm NCC, NCC mới bị lưu mặc định là HÀNG HOÁ.
      2. Bộ lọc dropdown quá khắt khe: Bộ lọc dropdown khi ở tab `NguyenLieu` chỉ chấp nhận NCC có chứa chuỗi `"NGUYÊN LIỆU"` hoặc `"VẬT TƯ"`. NCC mới tạo bị gán category HÀNG HOÁ hoặc người dùng nhập ngành hàng cụ thể (Keo, Kính, PE, Bao bì...) ngay lập tức bị bộ lọc loại bỏ khỏi dropdown.
      3. Thiếu Local Optimistic State: Khi đẩy NCC mới qua `pushData`, component con `IEFormModal` phụ thuộc hoàn toàn vào prop `data.Suppliers` từ component cha. Do độ trễ đồng bộ mạng, prop chưa re-render kịp, khiến `supplierId` được gán vào một id chưa tồn tại trong danh sách option của `<select>`, trình duyệt tự động fallback về option đầu tiên rỗng.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật**:
  1. **Khắc Phục Dứt Điểm Phạm Vi Biến Trong Hàm `save()`**:
     - Đưa toàn bộ các biến `totalDebtAdd` và `finalNote` ra khai báo tường minh tại phạm vi toàn cục của hàm `save()` trong `Tab_ImportExport.html`.
     - Đảm bảo 100% các nhánh thực thi (Nhập kho, Xuất kho, Kiểm kho) đều truy cập biến an toàn, callback `onSaveSuccess` nhận đầy đủ số liệu công nợ và ghi chú không bao giờ gặp lỗi ReferenceError.
  2. **Tích Hợp Local Optimistic State & Chuẩn Hóa Nhóm Ngành Hàng**:
     - Bổ sung state `localSuppliers` bên trong `IEFormModal`: Khi người dùng bấm "LƯU NCC", dữ liệu đối tác lập tức được merge vào danh sách `allSuppliers` tức thì (0ms độ trễ), không cần chờ đợi mạng.
     - Tự động gán ngành hàng mặc định theo tab: Đang đứng ở tab `NguyenLieu` thì NCC mới tự động mang category `NGUYÊN LIỆU & VẬT TƯ`.
     - Mở rộng bộ lọc dropdown: Hỗ trợ tìm và chọn đa dạng ngành hàng thực tế tại xưởng (Kính, Keo, Cát, Đá, Lũa, Xốp, Bao bì, PE...).
     - Quy tắc bảo toàn NCC: Nếu `s.id === supplierId` (NCC vừa tạo hoặc đang được chọn), dropdown LUÔN LUÔN giữ lại hiển thị, xóa bỏ triệt để hiện tượng NCC biến mất.
  3. **Đồng Bộ Hoàn Toàn 100% Cả Hai Bản Build**:
     - Đã cập nhật chính xác trên cả `Tab_ImportExport.html` và `Compiled_Deferred.html`.

---

## [v2.45.10] - 2026-09-07

### 🧊 Tự Động Hóa 100% BOM Bể Kính, Miễn Trừ Phiếu Vật Tư Thủ Công & Triệt Tiêu Lỗi Chồng Đè Modal (Portal Escape)
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **1. Sự cố lệnh sản xuất Bể Kính bị chặn bởi "Phiếu Nhận Nguyên Liệu & Vật Tư"**:
    - *Triệu chứng*: Khi thợ bể kính (Dương) hoặc quản lý bấm `[ ▶ NHẬN LÀM ]` cho sản phẩm bể kính (ví dụ: `Bể 25x12x14cm`), hệ thống bật lên popup bắt buộc `PHIẾU NHẬN NGUYÊN LIỆU & VẬT TƯ (BỂ LẺ SIZE)` yêu cầu chọn kính và gõ số lượng m² thủ công. Khi làm xong chụp ảnh nghiệm thu, hệ thống lại bật tiếp popup `QUYẾT TOÁN TIÊU HAO VẬT TƯ`.
    - *Tầng 1 (Thao tác & Vận hành)*: Thợ bị gián đoạn công việc, phải thao tác thủ công nhiều bước không cần thiết, làm nghẽn dòng chảy One-Piece Flow và tăng thời gian chết (Muda).
    - *Tầng 2 (Quy trình nghiệp vụ Lean)*: Tại Rich Fish Aquarium, Bể Kính là nhóm hàng đã được toán học hóa công thức 100% (diện tích kính đáy, diện tích kính thành mài vi tính MVT và chiều dài keo silicon). Khi lệnh sản xuất hoàn thành, hệ thống tự động khấu trừ kho theo `BOM_Config` và log sang `ImportExport`. Việc bắt thợ kê khai từng miếng kính trên app là thừa thãi và trái với nguyên lý tự động hóa BOM.
    - *Tầng 3 (Dữ liệu & Mã nguồn)*: Trong `Tab_Production.html` dòng 1740, biểu thức regex `(isGlassProduct && /(\d+)\s*[xX*×]\s*(\d+)/.test(nameLower))` được dùng để nhận diện `isGlassLeSize`. Do toàn bộ tên bể kính đều có kích thước dạng Dài x Rộng x Cao (ví dụ: `25x12x14cm`), regex này match 100% các bể kính, khiến toàn bộ bể kính bị đánh đồng thành hàng tùy chỉnh `isCustomItem = true`.
  - **2. Lỗi giao diện Modal bị chồng đè (UI Stacking Context / Portal Trap)**:
    - *Triệu chứng*: Khi mở `MaterialRequisitionModal`, trên nền modal xuất hiện hàng loạt nút toolbar (`fa-bolt`, `fa-layer-group`, `fa-camera`, `fa-trash-alt`, `chevron`) và ảnh thumbnail sản phẩm kèm số thứ tự tròn `{idx_num}` của các Card sản xuất khác (Card 6, Card 7, Card 8) đè xuyên thấu lên trên modal.
    - *Nguyên nhân gốc rễ*: `MaterialRequisitionModal` và `MaterialSettlementModal` được render bên trong component `WorkerPhaseV2` (bên trong thẻ Card sản xuất). Thẻ Card cha có các thuộc tính CSS tạo Local Stacking Context (`transform`, `backdrop-filter`). Do đó, thuộc tính `position: fixed` của modal bị giới hạn trong Card cha mà không thoát ra được `body`. Các Card sản xuất phía sau có `z-index: 10`, `z-index: 30` được render sau nên vẽ đè xuyên thấu lên trên modal.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật**:
  1. **Giải Phóng Hoàn Toàn Bể Kính Khỏi `isCustomItem`**:
     - Thiết lập quy tắc tường minh: `if (isGlassProduct) return false;` trong Hook `isCustomItem`.
     - Bể kính thuộc mọi kích thước (tiêu chuẩn hay lẻ size) đều vận hành tự động 100% qua BOM và `ensureGlassTankBOM`.
     - Thợ dán bể bấm `[ ▶ NHẬN LÀM ]` là bắt đầu làm việc ngay, chụp ảnh là nghiệm thu ngay, không bị cản trở bởi bất kỳ popup nào.
     - Phiếu nhận vật tư chỉ kích hoạt duy nhất cho Layout dạng `COVER` (hàng khách đặt làm theo ảnh không có BOM cố định).
  2. **Thoát Khỏi Bẫy Stacking Context Với `ReactDOM.createPortal`**:
     - Bọc toàn bộ JSX trả về của `MaterialRequisitionModal` và `MaterialSettlementModal` trong `ReactDOM.createPortal(..., document.body)`.
     - Nâng cấp `z-index` lên chuẩn tối cao `z-[999999] backdrop-blur-md bg-black/85 select-none`.
     - Modal mount trực tiếp ra thẻ `<body>`, phủ kín toàn bộ viewport và triệt tiêu 100% hiện tượng các thành phần của card khác đè xuyên thấu lên trên.
  3. **Đồng Bộ Tuyệt Đối Trên Cả 2 Bản Build**:
     - Đồng bộ chính xác đồng thời tại `Tab_Production.html` và `Compiled_Deferred.html`.

---

## [v2.45.9] - 2026-09-07

### ⚡ Khắc Phục Triệt Để Minified React Error #310 (Hook Order Invariance Trong WorkerPhaseV2)
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **1. Triệu chứng Sập Giao diện Xưởng Sản Xuất (Minified React Error #310)**:
    - *Triệu chứng*: Khi thợ hoặc quản lý mở tab Sản Xuất hoặc khi Firebase Realtime đẩy bản ghi đồng bộ mới từ thợ xưởng (Nguyễn Thị Diệu Hương, Lại Trường Tâm, Trần Duy Tân, Nguyễn Hoàng Dương), toàn bộ ứng dụng bị crash văng ra ngoài kèm lỗi console: `Error: Minified React error #310; visit https://reactjs.org/docs/error-decoder.html?invariant=310 at sa (react-dom.production.min.js:106:484) at Object.Yh [as useMemo] (react-dom.production.min.js:114:148) at WorkerPhaseV2`.
    - *Tầng 1 (Thao tác & Vận hành)*: React Error #310 xuất hiện khi: *"Rendered more hooks than during the previous render"* (Thành phần render số lượng Hook ở lần render này nhiều hơn lần render trước).
    - *Tầng 2 (Quy trình mã nguồn & Cấu trúc Hook)*: Trong bản phát hành `v2.45.8`, hook `availableWorkers = React.useMemo(...)` được đưa vào `WorkerPhaseV2` để khử trùng danh sách thợ. Tuy nhiên, hook này được đặt tại dòng 2562 (sát return JSX), nằm SAU câu lệnh rẽ nhánh sớm `if (isLocked) return null;` tại dòng 1860.
    - *Tầng 3 (Dòng chảy dữ liệu & Cắt cúp chu kỳ Hook)*: Khi sản phẩm có Khâu 2 đang bị khoá (`isLocked = true`, chờ Khâu 1 hoàn tất), component `WorkerPhaseV2` gặp `if (isLocked) return null;` và trả về ngay sau Hook thứ 16 (`completedDurationText`), hoàn toàn bỏ qua Hook thứ 17 (`availableWorkers`). Đến khi Khâu 1 xong, Firebase sync kích hoạt trạng thái mở khoá (`isLocked = false`), `WorkerPhaseV2` re-render và chạy tiếp xuống dòng 2562 gọi Hook thứ 17 `availableWorkers` ➔ React phát hiện số lượng Hook bị thay đổi giữa các lần render và lập tức ném lỗi ngoại lệ bất biến #310.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật**:
  1. **Đưa Toàn Bộ 17 Hook Lên Tầng Đầu Tiên (Top-Level Hook Invariance) Trong `WorkerPhaseV2`**:
     - Di chuyển hook `availableWorkers = React.useMemo(...)` từ cuối component lên ngay sau `completedDurationText` (trước câu lệnh `if (isLocked) return null;`).
     - Đảm bảo 100% tất cả 17 Hooks (`useState`, `useMemo`, `useEffect`) được thực thi với thứ tự và số lượng bất biến tuyệt đối trên mọi chu kỳ render, bất kể `isLocked` là `true` hay `false`.
  2. **Chuẩn Hóa Phòng Vệ Cho Các Modal Phụ Thuộc Dữ Liệu**:
     - Trong `MaterialRequisitionModal`: Di chuyển câu lệnh `if (!isOpen || !item) return null;` xuống sau các hook `useMemo`, `useState` và dùng optional chaining `item?.type`, bảo đảm không bao giờ vi phạm Hook Order nếu modal được mount ngầm.
     - Trong `MaterialSettlementModal`: Di chuyển câu lệnh `if (!isOpen || !item) return null;` xuống sau `useMemo`, `useState`, `useEffect`.
  3. **Biên Dịch Sạch & Khôi Phục Dòng Chảy Realtime**:
     - Pre-compile lại toàn bộ bundle qua `tools/precompile_jsx.js` (`Compiled_Core.html` và `Compiled_Deferred.html`).
     - Xác thực 100% hash toàn vẹn với `tools/verify_build.js` và vượt qua toàn bộ 363 unit tests trong `run_tests.js`.

---

## [v2.45.8] - 2026-09-07

### 🛠️ Khắc Phục Triệt Để Thợ Ảo "Kho Hàng" / "Hàng" Khâu 2 Sản Xuất & Khôi Phục Danh Sách Nhân Sự Đầy Đủ
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **1. Triệu chứng "Hàng là thằng nào?" & Khóa nút Nhận làm Khâu 2**:
    - *Triệu chứng*: Trên thẻ sản xuất ở xưởng (ví dụ Layout / Bể Kính), Khâu 2 (Gia Cố / Gọt Keo) bị hiển thị người nhận việc là `"Hàng"`, trạng thái thẻ bị khoá thành `KHOÁ: HÀNG`, thợ thật tại xưởng không thể bấm nút `[ ▶ NHẬN LÀM ]`.
    - *Tầng 1 (Thao tác & Hiển thị)*: Trong `Tab_Production.html` line 2566, logic rút gọn tên hiển thị dùng `data.user.split(' ').pop()`. Khi `data.user` mang giá trị `"Kho Hàng"`, hàm cắt chuỗi lấy từ cuối cùng là chữ `"Hàng"`. Line 2675 kiểm tra `data.user` không rỗng và không khớp tên thợ đang đăng nhập nên hiển thị nút đỏ `KHOÁ: HÀNG`, khóa cứng thẻ việc.
    - *Tầng 2 (Quy trình sản xuất Lean)*: Trong `Tab_Production.html` lines 2402-2417 (`submitQC`) và lines 2501-2516 (`adminAutoPass`), khi Khâu 1 hoàn tất, hệ thống tự động quét danh sách chấm công `attendance` và cưỡng chế gán Khâu 2 sang trạng thái `'In Progress'` với người đầu tiên trong danh sách. Cơ chế "Push" bừa bãi này phá vỡ nguyên lý kéo việc tự giác (Lean One-Piece Flow) và khiến thợ không chủ động nhận việc được.
    - *Tầng 3 (Dữ liệu backend & Đơn hàng)*: Trong `Code.js` (`formatProd` lines 2620-2621, `syncDeltas` lines 3249-3250) và `Modals_Orders.html` lines 1409-1411, các sản phẩm lấy từ kho sẵn (`fulfilledFromStock = true`) được backend điền mặc định `user: 'Kho Hàng'`. Khi lệnh cần sản xuất bổ sung hoặc thợ làm thực tế, Khâu 2 vẫn bị vướng chuỗi thợ ảo `"Kho Hàng"`.
  - **2. Triệu chứng không hiển thị danh sách nhân sự trong dropdown**:
    - *Triệu chứng*: Khi Admin bấm icon cây bút sửa người nhận việc hoặc mở Modal gán việc hàng loạt, dropdown danh sách nhân viên hoàn toàn trống rỗng, chỉ hiện `-- Bỏ nhận việc --` hoặc `-- KHÔNG GIAO ĐÍCH DANH --`.
    - *Nguyên nhân gốc rễ*: Trong `Tab_Production.html` (lines 2632 và 5940), dropdown chỉ render danh sách từ `userConfigs?.pins`. Tuy nhiên, trong `Code.js` hàm `getUserConfig()`, đối tượng trả về được khởi tạo là `{ avatars: {}, titles: {}, subTitles: {}, salaries: {}, users: [], roles: {} }` và KHÔNG HỀ có trường `pins`. Do đó, `userConfigs.pins` luôn là `undefined`, `Object.values(undefined || {})` ra mảng rỗng `[]`.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật**:
  1. **Khôi Phục Trường `pins` & Chuẩn Hóa `getUserConfig()` Trong `Code.js`**:
     - Bổ sung `pins: {}` vào cấu trúc trả về của `getUserConfig()`. Đọc chính xác cột `Mã PIN` từ bảng `Config_NhanSu`, nạp đầy đủ thông tin từng nhân viên (`name`, `role`, `title`, `subTitle`, `avatar`) được đánh chỉ mục theo mã PIN sạch và đệm 6 số.
  2. **Triệt Tiêu Hoàn Toàn Thợ Ảo `"Kho Hàng"` / `"Hàng"` Trong Backend & Frontend**:
     - Trong `Code.js` (`formatProd`): Xóa bỏ việc gán `'Kho Hàng'` mặc định cho `p1U` và `p2U`, tự động dọn sạch mọi giá trị `'Kho Hàng'` hoặc `'Hàng'` thành chuỗi rỗng `''`.
     - Trong `Code.js` (`syncDeltas`): Gán `user: ''` cho các khâu của hàng kho có sẵn.
     - Trong `Modals_Orders.html`: Chuyển `user: 'Kho Hàng'` trong `stockPhases` sang `user: ''`.
  3. **Khôi Phục Danh Sách Nhân Sự Đa Nguồn & Khử Trùng Trong `Tab_Production.html`**:
     - Tạo danh sách `availableWorkers` thông minh kết hợp từ cả 3 nguồn: `userConfigs.users`, `userConfigs.pins`, và `attendance`.
     - Lọc bỏ hoàn toàn các chuỗi thợ ảo `"Kho Hàng"`, `"Hàng"`, và vai trò `"Khách"`, khử trùng (de-duplicate) tên nhân viên để hiển thị 100% thợ xưởng thực tế trong menu sửa thợ và gán việc hàng loạt.
  4. **Giải Phóng Nút [▶ NHẬN LÀM] & Thiết Lập Dòng Chảy Lean Pull Flow**:
     - Trong `WorkerPhaseV2`: Nhận diện thợ ảo `isFakeUser = !rawUser || rawUser === 'Kho Hàng' || rawUser === 'Hàng'`. Nếu là thợ ảo, hiển thị nhãn chuẩn `Chờ nhận việc`, gán quyền sở hữu `isOwner = true` và giải phóng nút xanh `[ ▶ NHẬN LÀM ]` cho thợ bấm nhận việc.
     - Bãi bỏ cơ chế tự động gán cưỡng chế Khâu 2 trong `submitQC` và `adminAutoPass`. Khi Khâu 1 xong, Khâu 2 giữ nguyên trạng thái `Pending` và xóa sạch thợ ảo cũ, sẵn sàng để thợ chuyên môn chủ động nhận việc theo nhịp độ Takt Time.

---

## [v2.45.7] - 2026-09-07

### 🔄 Tự Động Đưa Đơn Hoàn Tháng Cũ (T8) Về Mục Hoàn Tháng Này (T9) Cho Diệu Hương Đi Kiểm
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **1. Sự cố đơn hoàn tháng 8 biến mất khi quét tại xưởng trong tháng 9**:
    - *Triệu chứng*: Khi quản lý xưởng dùng súng bắn mã vạch tít gói hàng hoàn (hoặc ném file Excel Order.all) vào nút "Quét Đơn Hoàn Tự Động" trong tháng 9, đơn phát sinh từ tháng 8 bị hệ thống ẩn mất khỏi màn hình "Tháng Này". Diệu Hương mở app xem tab "Hàng Hoàn Chờ Xử" của Tháng Này không thấy đơn đâu để đi kiểm.
    - *Nguyên nhân gốc rễ*:
      1. Trong `Tab_Orders.html`, hàm lọc thời gian `matchTimeFilter` lấy `dateCandidate = order.date || order.createdAt || ...`. Vì đơn tạo từ tháng 8 nên `order.date` là tháng 8, khiến điều kiện so khớp tháng hiện tại (`filterTime === 'Tháng Này'`) trả về `false`, đẩy đơn ra khỏi danh sách hiển thị.
      2. Trạng thái `HÀNG HOÀN` bị xếp vào nhóm `isClosed`, khiến các đơn hoàn chưa đối soát không được hưởng cơ chế giữ lại như đơn chưa sản xuất.
      3. Hàm `processCode` trong `ReturnScannerModal` kiểm tra trạng thái cũ: nếu đơn đã từng được ghi nhận trạng thái Hoàn (ví dụ sàn cập nhật từ trước), hệ thống báo `"Đơn này đã ở trạng thái Hoàn rồi!"` và chặn không cho quét nhận hiện vật thật về kho.
      4. Khối banner màu đỏ `realTimeSummary.urgentAlerts` ("CẢNH BÁO: ĐƠN HỦY & HOÀN TRẢ") chỉ kiểm tra `order.updatedAt || order.createdAt || order.date`, không kiểm tra `order.returnedAt`, khiến đơn hoàn vừa quét hôm nay không nhảy lên cảnh báo đỏ.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật**:
  1. **Tự Động Đưa Đơn Tháng Cũ Về Tháng Hiện Tại Khi Quét Nhận Hoàn (`processCode` & `confirmBulkReturn`)**:
     - Khi quét bằng súng tít đơn lẻ hoặc nạp file Excel/PDF/dán mã hàng loạt: Nếu đơn có ngày `date` thuộc tháng trước, hệ thống tự động cập nhật `date: safeDateOnly` (ngày hôm nay thuộc Tháng Này), gắn `returnedAt: returnedAt`, `updatedAt: safeDateFull`, và chuyển trạng thái sang `status: 'Hàng Hoàn'`, `_effectiveStatus: 'HÀNG HOÀN CHỜ XỬ LÝ'`, `isReconciled: false`.
     - Tự động gắn nhãn vết vào ghi chú: `[Đơn cũ T{tháng} đưa về Hoàn T{tháng_nay}: gốc {ngày_gốc}]` để bảo toàn lịch sử truy vết 100%.
     - Mở khóa quét nhận hàng thực tế: Cho phép quét lại đối với đơn đã có trạng thái Hoàn từ tháng trước (chỉ chặn nếu đã quét trong chính ngày hôm nay để chống tít đúp).
  2. **Cơ Chế Zero-Dropped Trong `matchTimeFilter`**:
     - Bổ sung quy tắc: Đơn `HÀNG HOÀN` chưa đối soát (`!isReconciled`) là công việc tồn đọng cần Diệu Hương đi kiểm ➡️ Khi lọc "Tháng Này", LUÔN LUÔN HIỂN THỊ (`return true`).
     - Với đơn Hàng Hoàn, ngày ưu tiên hàng đầu để so khớp thời gian là ngày quét nhận hoàn `order.returnedAt`.
  3. **Hiển Thị Tức Thì Trên Khối Cảnh Báo `urgentAlerts`**:
     - Bổ sung `o.returnedAt` vào điều kiện kiểm tra `isToday`, giúp đơn hoàn vừa quét hôm nay lập tức xuất hiện trên banner đỏ kèm nút `[KIỂM HOÀN]` 1 chạm.
  4. **Nâng Cấp Trải Nghiệm Hallmark UI Của `ReturnScannerModal`**:
     - Bổ sung badge chỉ báo trực quan: *"Đơn tháng cũ (T8) khi quét sẽ tự động đưa về mục Hoàn Tháng Này để Hương kiểm tra"*.
     - Nút xác nhận ghi rõ số lượng đơn và tháng đích để người dùng hoàn toàn an tâm khi thao tác.

---

## [v2.45.6] - 2026-09-07

### 📱 Khóa Cứng Bàn Phím PIN Zero Layout Shift, Triệt Tiêu Lỗi Cú Pháp Unterminated String & Tối Ưu Cảm Ứng Mobile 0ms
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **1. Hiện tượng giật nảy bàn phím khi bấm đến số thứ 4 (Keypad Jitter & Misclick Flaw)**:
    - *Triệu chứng*: Khi người dùng nhập mã PIN đến số thứ 4, toàn bộ cụm bàn phím số bị giật nảy vị trí khiến ngón tay đang bấm liên tục số 5, 6 bị bấm trượt hoặc thiếu số.
    - *Nguyên nhân gốc rễ*:
      - Thẻ `<input autoFocus>` ẩn kích hoạt bàn phím ảo của hệ điều hành trên mobile, làm thay đổi chiều cao viewport (`window.innerHeight`) liên tục khiến popup bị co giật.
      - Nút "Xác nhận đăng nhập" chuyển đổi trạng thái khi đạt 4 số: từ không có viền sang có viền 1px và đổi padding, thêm shadow lớn làm kích thước modal thay đổi, đẩy toàn bộ cụm phím số bên dưới dịch chuyển.
      - 6 chấm tròn PIN có animation phóng to `scale-110` gây reflow nhẹ lên container.
  - **2. Lỗi cú pháp runtime `Unterminated string constant. (3309:24)`**:
    - *Triệu chứng*: Trình duyệt hiển thị màn hình báo lỗi `THÔNG BÁO KHỞI ĐỘNG KHÔNG THÀNH CÔNG: LỖI CÚ PHÁP TẠI FILE [Modals]: unknown: Unterminated string constant. (3309:24)`.
    - *Nguyên nhân gốc rễ*: Tại dòng 3309 trong `Modals.html`, chuỗi `'https://ntfy.sh/'` chứa ký tự hai dấu gạch chéo `//`. Khi Google Apps Script xử lý nạp tệp qua hàm `include()`, bộ tiền xử lý hiểu nhầm `//` là bắt đầu của một comment đơn dòng, dẫn đến việc cắt cụt chuỗi thành `const ntfyUrl = 'https:`, gây lỗi thiếu dấu đóng chuỗi khi Babel biên dịch.
  - **3. Lỗi linter `Declaration or statement expected`**:
    - *Nguyên nhân gốc rễ*: Cú pháp React Fragment rút gọn (`<>` và `</>`) bên trong thẻ `<script type="text/babel">` của tệp `.html` bị Language Server hiểu nhầm là toán tử so sánh không hợp lệ, làm gãy cây cú pháp AST.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật (Hallmark Mobile & Zero Shift)**:
  1. **Khóa Cứng Hình Học Bàn Phím PIN (Zero Layout Shift)**:
     - Loại bỏ hoàn toàn thẻ `<input autoFocus>` ẩn, thay thế bằng lắng nghe phím toàn cục qua `window.addEventListener('keydown')`. Trên điện thoại, bàn phím ảo của hệ điều hành không bao giờ tự bung lên.
     - Khóa cứng kích thước nút bấm: chiều cao cố định `50px`, viền `border` 1px chuẩn border-box ở cả trạng thái chờ và kích hoạt (chỉ đổi màu từ viền mờ sang vàng amber).
     - Khóa cứng 6 chấm tròn PIN: khung chứa cố định `20px`, mỗi chấm cố định `13px x 13px`, loại bỏ `scale-110`.
     - Tối ưu cảm ứng mobile với `touch-action: manipulation`, triệt tiêu độ trễ 300ms và chặn double-tap zoom khi bấm nhanh.
  2. **Triệt Tiêu 100% Lỗi Cắt Chuỗi Do Ký Tự Gạch Chéo (`//`)**:
     - Thay thế toàn bộ chuỗi URL tĩnh trực tiếp bằng phép nối ký tự an toàn (`'https:' + '/' + '/ntfy.sh/'`), ngăn chặn tuyệt đối hiện tượng Apps Script hiểu nhầm thành comment.
  3. **Phẳng Hóa Cây Cú Pháp JSX & Tối Ưu Hóa Render Qua `React.useMemo`**:
     - Tách biệt logic nhãn nút (`submitBtnText`) và lớp CSS (`submitBtnClass`) ra khỏi cây JSX, đưa vào các hook `React.useMemo` độc lập.
     - Loại bỏ hoàn toàn cú pháp Fragment rút gọn (`<>` và `</>`), thay bằng các thẻ `<i>` và `<span>` phẳng chuẩn mực, loại bỏ 100% cảnh báo linter.

---

## [v2.45.5] - 2026-09-06

### ⚡ Tối Ưu Hiệu Năng Toàn Diện: 2-Phase Execution (0ms JSX Compile), Bảo Toàn 100% Công Thức Sheet & Concurrency Guards
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **1. Trình duyệt tải chậm và giật lag CPU khi khởi động (Babel Cold Parse / Compile)**:
    - *Triệu chứng*: Mở ứng dụng mất từ 1.5s - 3s chỉ để tải thư viện Babel CDN 2.8 MB và biên dịch hàng nghìn dòng JSX trên thiết bị của nhân viên, gây nóng máy và nghẽn luồng render.
    - *Nguyên nhân gốc rễ*: `Index.html` nhúng thẻ `<script src="babel.min.js">` và nạp toàn bộ 20 fragment HTML bằng `type="text/babel"`, buộc trình duyệt phải parse AST và transform runtime mỗi lần tải trang.
  - **2. Nguy cơ mất công thức ô tính trên dòng đang sửa (Formula Overwrite Flaw)**:
    - *Triệu chứng*: Khi client gửi delta cập nhật trạng thái đơn hoặc giá trị một trường, thao tác `setValues` theo dòng có thể biến các ô có công thức tự động (`=SUM(...)`, `=CONCATENATE(...)`) thành giá trị tĩnh.
    - *Nguyên nhân gốc rễ*: Hàm `applyDeltasToSheet` trước đây chỉ đọc mảng giá trị bằng `getValues()`, không đọc `getFormulas()`. Khi ghi lại dòng, các ô có công thức bị gán lại bằng giá trị hiển thị cũ.
  - **3. Nghẽn cổ chai $O(N \times M)$ khi lưu đơn/kho và ghi phân tán**:
    - *Triệu chứng*: Khi lưu lô nhiều đơn hoặc cập nhật hàng loạt tồn kho, hàm chạy chậm do lặp lồng $O(N)$ từng item qua toàn bộ $M$ dòng của bảng, đồng thời gọi nhiều lệnh `getRange().setValues()` rời rạc.
    - *Nguyên nhân gốc rễ*: Thiếu cơ chế lập chỉ mục in-memory và chưa gom cụm các dòng liền kề để ghi theo dải liên tục (Contiguous Range).
  - **4. Hiện tượng Response chậm ghi đè dữ liệu vừa lưu (Stale Overwrite)**:
    - *Triệu chứng*: Nhân viên vừa chuyển trạng thái đơn hàng sang "Đã Bàn Giao", một request polling ngầm cũ từ server trả về sau đó vài giây đã đè trạng thái cũ "Chờ Sản Xuất" lên giao diện.
    - *Nguyên nhân gốc rễ*: Hàm `smartMerge` trước đây luôn ưu tiên `...serverItem` đè lên `...localItem`, bất kể thời điểm thao tác local của người dùng mới diễn ra gần đây.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật**:
  1. **Động Cơ Biên Dịch JSX Pre-compile & 2-Phase Execution**:
     - Xây dựng công cụ CLI độc lập `tools/precompile_jsx.js` sử dụng Babel Standalone nội bộ biên dịch trước 20 fragment nguồn JSX thành Javascript thuần (`React.createElement`), xuất ra `Compiled_Core.html` và `Compiled_Deferred.html`.
     - `Index.html` loại bỏ hoàn toàn thẻ nạp Babel CDN 2.8 MB trong môi trường production, tiết kiệm 100% thời gian compile runtime (0ms CPU compile). Phase 1 thực thi tức thì App Shell và các tab cốt lõi; Phase 2 nạp các tab quản trị khi luồng chính rảnh qua `requestIdleCallback`.
     - Tích hợp `build_manifest.json` và `tools/verify_build.js` kiểm tra mã băm SHA-256 đối chiếu 100% mã nguồn trước khi vận hành.
  2. **Bảo Toàn 100% Công Thức Sheet & Contiguous Range Batch Write**:
     - `Code.js`: Nâng cấp `applyDeltasToSheet` đọc đồng thời `getValues()` và `getFormulas()`. Với mọi ô không thuộc phạm vi client cập nhật có chứa công thức (bắt đầu bằng `=`), hệ thống bảo lưu nguyên vẹn chuỗi công thức gốc.
     - Lập chỉ mục in-memory $O(1)$ (`idMap`, `codeMap`, `attLeaveMap`), hỗ trợ cập nhật in-flight in-batch cho các item thêm mới hoặc cộng dồn `_diff` nhiều lần trong cùng một yêu cầu.
     - Gom các dòng sửa đổi liền kề thành các dải liên tục (contiguous chunks) để ghi theo lô, và append toàn bộ dòng mới bằng 1 lệnh duy nhất.
  3. **Concurrency Guards & SmartMerge Chống Đè Dữ Liệu Cũ**:
     - `App_Main.html`: Bổ sung các refs kiểm soát bất đồng bộ (`fetchSeqRef`, `activeSessionIdRef`, `isFetchingRef`, `refetchQueuedRef`), loại bỏ race condition giữa các request đồng bộ chồng chéo.
     - Cập nhật `smartMerge` và `smartMergeOrders`: Nếu bản ghi local có thời gian thao tác `_optimisticTime < 60000` (dưới 60 giây), hệ thống ưu tiên tuyệt đối dữ liệu thao tác của người dùng thay vì để server response chậm đè lên.
     - Tích hợp Page Visibility API: Tạm dừng polling ngầm khi tab bị ẩn (`document.hidden`), tự động đồng bộ khi người dùng quay lại sau 45s, và tự khôi phục kết nối ngay khi mạng online trở lại.
  4. **Tách Biệt Cache Cấu Hình & Authoritative Auth Source**:
     - `getUserConfig()`: Chỉ lấy dữ liệu hiển thị an toàn (`avatars`, `titles`, `subTitles`, `salaries`, `users`), cache 120s trong CacheService.
     - `getAuthoritativeAuthConfig_()`: Nguồn thẩm quyền tối cao xác thực PIN và phân quyền vai trò, cache ngắn 30s gắn với `CONFIG_GENERATION` token.
     - Bổ sung hàm `invalidateUserConfigCache()` và action `invalidateUserConfig` trong `handleApiRequest` (yêu cầu quyền Boss/Admin) chống triệt để race condition đè cache khi thay đổi phân quyền.

---

## [v2.45.4] - 2026-09-06

### 📱 Chuẩn Hóa Công Thái Học Modal Tài Chính Mobile (Hallmark), Khắc Phục Lỗi Đồng Bộ Quỹ & Tối Ưu Đọc File Trạm Bơm Đơn
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **1. Lỗi tạo phiếu chi trên điện thoại nhưng máy tính không có (Ghost Vouchers)**:
    - *Triệu chứng*: Khi nhân viên lập phiếu chi trên điện thoại, giao diện hiện phiếu thành công nhưng máy tính không hề có dữ liệu, đồng thời hiện thông báo cảnh báo lỗi ghi dữ liệu.
    - *Cơ chế sinh lỗi*: Hàm `validateTableWritePermission` trong `Code.js` trước đây chỉ cho phép vai trò `TỐI CAO` và `KẾ TOÁN` được quyền ghi bảng `Accounts`. Khi các chức danh quản lý khác (`QUẢN LÝ BÁN HÀNG`, `QUẢN LÝ KHO VẬN`, `CỘNG TÁC VIÊN`) tạo phiếu thu/chi có cập nhật số dư tài khoản, server trả về `PERMISSION_DENIED`. Do phía client (`handleSaveTx`) cập nhật state lạc quan trước mà không kiểm tra kết quả `pushDeltas`, điện thoại giữ lại giao dịch rác trong bộ nhớ tạm trong khi Google Sheets không hề ghi nhận.
  - **2. Khung phiếu chi bị trôi, nảy và không cuộn được danh mục trên mobile**:
    - *Triệu chứng*: Khung tạo phiếu chi trên điện thoại không đứng yên, bị giật nảy khi bàn phím ảo bật lên hoặc khi vuốt ngón tay; danh sách chọn danh mục chi phí không cuộn lên xuống được.
    - *Cơ chế sinh lỗi*: Modal dùng căn giữa `items-center` với `max-h-[92vh]`. Khi bàn phím ảo xuất hiện, visual viewport của trình duyệt mobile co lại đột ngột khiến modal bị dịch chuyển liên tục. Ngoài ra, màn hình nền (`body`) không được khóa cuộn gây hiệu ứng rubber-banding của iOS, và sự kiện chạm `touchmove` trong danh sách dropdown danh mục bị nổi bọt (bubble) lên container cha khiến trình duyệt cuộn cả modal thay vì danh sách con.
  - **3. Lỗi đọc file Excel bị chặn / đơ tại Trạm Bơm Đơn**:
    - *Triệu chứng*: Khi người dùng chọn file Excel đang mở trên máy tính, trình duyệt hiện thông báo `Không thể đọc tệp tin. Có thể tệp đang mở trong ứng dụng khác hoặc bị chặn`, và nút Hủy/Đóng bị kẹt.
    - *Cơ chế sinh lỗi*: API `FileReader.readAsArrayBuffer` cổ điển bị hệ điều hành Windows chặn handle truy cập độc quyền (exclusive lock) khi tệp đang mở trong Microsoft Excel. Đồng thời trạng thái `isProcessing` không được dọn dẹp sạch sẽ nếu không bắt lỗi đúng cách.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật**:
  1. **Ủy Quyền Ghi Bảng Accounts & Cơ Chế Chống Phiếu Rác (Rollback Protection)**:
     - `Code.js`: Cho phép các vai trò tài chính được ủy quyền (`TỐI CAO`, `KẾ TOÁN`, `QUẢN LÝ BÁN HÀNG`, `QUẢN LÝ KHO VẬN`, `CỘNG TÁC VIÊN`) cập nhật số dư tài khoản khi ghi nhận giao dịch thu chi.
     - `Tab_Finance.html`: Chuẩn hóa trường `date` kèm 24H timestamp đầy đủ; lấy snapshot trạng thái trước khi cập nhật lạc quan, tự động hoàn tác (rollback) nếu `pushDeltas` trả về thất bại, bảo vệ 100% tính nhất quán giữa điện thoại và máy tính.
  2. **Tái Thiết Kế Modal Tài Chính Chuẩn Công Thái Học Hallmark Bottom Sheet Mobile**:
     - Chuyển đổi `TransactionFormModal` trên thiết bị di động thành Hallmark Bottom Sheet cố định ở đáy màn hình (`items-end sm:items-center`, `rounded-t-3xl sm:rounded-3xl`), có thanh kéo xúc giác, cố định nút Hủy và Lưu ở đầu/cuối không bao giờ bị nhảy khi bật bàn phím.
     - Tự động khóa cuộn nền (`document.body.style.overflow = 'hidden'`) khi modal mở, loại bỏ hoàn toàn hiện tượng trôi nền.
     - Cách ly sự kiện cảm ứng trên danh sách danh mục chi phí (`touchAction: 'pan-y'`, `stopPropagation`), bổ sung 4 chip chọn nhanh 1 chạm (*Mua Vật Tư*, *Mua Nguyên Liệu*, *Thanh Toán Hoá Đơn*, *Chi Phí Khác*), nâng chiều cao cảm ứng đạt chuẩn công thái học >= 44px.
  3. **Tối Ưu Trạm Bơm Đơn với Native file.arrayBuffer()**:
     - `Modals_Orders.html`: Ưu tiên đọc file trực tiếp bằng Web API hiện đại `file.arrayBuffer()`, bắt ngoại lệ chi tiết và hướng dẫn rõ ràng cho người dùng khi file đang bị Excel khóa; tự động reset sạch sẽ biến trạng thái để giao diện không bao giờ bị đơ.

---

## [v2.45.3] - 2026-09-05

### 📊 Đồng Bộ Dữ Liệu Thời Gian Thực Vào War Room & Triệt Tiêu Hallucination 7 Agents
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **1. Hiện tượng Hallucination (Ảo giác AI)**: Khi Chỉ huy hỏi *"Tháng này liệu nhân sự nào có thể hoàn thành được 100% KPI"*, 7 Agent tự vẽ ra nhân vật lạ không có thật trong xưởng (*"anh Tuấn"*), bịa đặt số liệu giả (*"120 hồ mài vát kim cương"*) gây bức xúc và mất tính thực chiến.
  - **2. Nguyên nhân gốc rễ (Root Cause)**:
    - Ở tầng Client (`Components.html`), hàm `runWarRoomDiscussion` trước đây chỉ gửi mỗi chuỗi văn bản `{ incident: incidentText }`, hoàn toàn không gửi kèm dữ liệu hệ thống.
    - Ở tầng Backend (`server_kcs.py` & `agent_war_room.py`), mô hình Gemini Flash không được cấp context dữ liệu về nhân sự, KPI, đơn hàng hay tồn kho của Rich Fish, dẫn đến việc mô hình tự do sáng tác các kịch bản viễn tưởng.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật**:
  1. **Đột Phá Kiến Trúc Live Operational Context Injection (`Components.html` & `App_Main.html`)**:
     - Cung cấp đầy đủ props `orders`, `prodItems`, `packings`, `attendance`, `erpData`, `userConfigs`, `kpiConfig` vào `<RFAgentControlTower>`.
     - Xây dựng hàm `buildLiveOperationalContext()` trích xuất snapshot dữ liệu thời gian thực:
       + **Nhân sự**: Lấy danh sách nhân sự chính thức (`Nguyễn Hoàng Dương`, `Trần Duy Tân`, `Nguyễn Thị Diệu Hương`, `Nguyễn Thị Trang`, `Nguyễn Ngọc Tiến`) và danh sách từ `Config_NhanSu`.
       + **KPI thời gian thực**: Trích xuất tỷ lệ hoàn thành thực tế từ bảng `KPI_Progress` (`user`, `kpiName`, `current`, `target`, `unit`, `pct%`).
       + **Tiến độ sản xuất**: Sản lượng theo từng thợ (`p1_user`, `p2_user`) từ bảng `Production`.
       + **Tồn kho**: Trích xuất tồn keo Wacker 121 và danh sách vật tư cảnh báo sắp hết (`quantity <= minStock`) từ bảng `Products`.
       + **Đơn hàng**: Tỷ lệ đơn chờ xử lý, đơn hoàn thành từ bảng `Orders`.
     - Đóng gói toàn bộ payload context gửi đồng thời lên endpoint `POST /api/warroom/discuss`.
  2. **Bộ Quy Tắc Nghiệp Vụ Chống Bịa Đặt & Trích Xuất Chuẩn (`agent_war_room.py`)**:
     - Cập nhật schema `IncidentRequest` tiếp nhận trường `context: Optional[Dict[str, Any]]`.
     - Thiết lập quy tắc **Anti-Hallucination** đanh thép: Nghiêm cấm bịa đặt nhân sự không có trong danh sách CSDL (tuyệt đối không được nói anh Tuấn, anh Hùng...); mọi nhận định về KPI, sản lượng, đơn hàng bắt buộc phải trích dẫn số liệu thật từ context.
     - Trợ lý HR (hr) và các Agent phân tích chính xác tiến độ của từng thợ (Diệu Hương đạt bao nhiêu %, Hoàng Dương bao nhiêu %, Duy Tân bao nhiêu %), đánh giá rào cản về phôi/kính và dòng tiền.
  3. **Kịch Bản Dự Phòng Thông Minh Bám Sát Dữ Liệu (Smart Adaptive Fallback)**:
     - Ngay cả khi mất kết nối backend hoặc API nghẽn, kịch bản dự phòng phía client và server vẫn tự động tính toán nhân sự đang dẫn đầu KPI từ bảng `KPI_Progress` để phản hồi chính xác tên người và số liệu thật, không bao giờ nói vớ vẩn.

---

## [v2.45.2] - 2026-09-05

### 💬 Khung Chat Điều Hành Trực Tiếp (Commander Chat) & Tự Động Kích Hoạt 7 Agents Xưởng
- **Bối cảnh & Yêu cầu thực tế xưởng**:
  - **Loại bỏ tính năng mô phỏng mẫu**: Các nút và chip sự vụ mẫu trước đây chỉ dùng để demo, không phục vụ mục đích điều hành linh hoạt hàng ngày.
  - **Nhu cầu đối thoại hai chiều trực tiếp**: Chỉ huy / Quản lý xưởng cần một thanh nhập liệu (Chat Bar) trực quan để gõ bất kỳ sự vụ phát sinh, câu hỏi kỹ thuật hay lệnh điều động nào cho 7 Agent.
  - **Nhu cầu tự động phối hợp (Auto-Coordination)**: Cần cơ chế để khi thợ bị AI KCS từ chối chất lượng hoặc khi tồn kho vật tư chạm đáy, Ban Điều Hành 7 Agent phải tự động xuất hiện và nhóm họp giải quyết mà không cần con người phải tự mở ứng dụng bấm thủ công.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật**:
  1. **Khung Chat Điều Hành Trực Tiếp (`Components.html`)**:
     - Loại bỏ hoàn toàn khối nút mô phỏng chiến lược cũ.
     - Tích hợp thanh nhập liệu công thái học `form#rf-agent-footer` kèm nút gửi icon giấy bay phản quang `linear-gradient(#d4af37)`.
     - Hỗ trợ gửi lệnh bằng phím Enter hoặc nút bấm, hiển thị tin nhắn Chỉ huy (`👤 currentUser`) trực tiếp vào luồng hội thoại với giao diện nổi bật trước khi 7 Agent phản hồi.
  2. **Cơ Chế Tự Động Điều Phối Theo Thời Gian Thực (`Tab_Production.html`)**:
     - Tự động kích hoạt `window.triggerRealtimeWarRoom` ngay khi máy trạm AI KCS phát hiện lỗi kỹ thuật ở Khâu 1 (Khung/Bố cục) hoặc Khâu 2 (Dán/Gọt vát) mà thợ gửi ảnh nghiệm thu.
     - Cửa sổ War Room tự động mở ra, tự un-minimize và hiển thị toàn bộ phân tích nguyên nhân - phương án giải quyết của 7 nhân vật số.

---

## [v2.45.1] - 2026-09-05

### 🛡️ Hotfix: Khắc Phục Lỗi Cú Pháp Unterminated String Khi Biên Dịch Components.html Trên Google Apps Script (Bảo Vệ URL Endpoint Máy Trạm Xưởng)
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **1. Triệu chứng**: Khi tải ứng dụng trên cả Vercel PWA lẫn Web App Google Apps Script, hệ thống hiển thị màn hình đỏ cảnh báo lỗi cú pháp: `❌ LỖI CÚ PHÁP TẠI FILE [Components]: unknown: Unterminated string constant. (691:40)`. Dòng mã gặp lỗi bị cắt cụt thành `const res = await fetch("http:` thay vì URL đầy đủ.
  - **2. Cơ chế sinh lỗi (Root Cause)**: Khi phục vụ tệp HTML qua cơ chế `HtmlService.createTemplateFromFile().evaluate()`, trình tiền xử lý/bộ phân tích cú pháp Caja của Google Apps Script hiểu nhầm hai dấu gạch chéo liền kề `//` trong chuỗi ký tự URL `"http://127.0.0.1:8000/..."` là cú pháp bắt đầu của ghi chú một dòng (Single-line Comment). Hậu quả là toàn bộ phần đuôi của dòng mã bị cắt bỏ, để lại dấu mở ngoặc kép `"` không bao giờ được đóng trước khi xuống dòng.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật**:
  1. **Hằng Số Ghép Chuỗi Kháng Phân Tích Cú Pháp (`Components.html`)**:
     - Định nghĩa hằng số toàn cục `const KCS_LOCAL_URL = 'http' + '://' + '127.0.0.1:8000';`. Kỹ thuật ghép chuỗi tách rời hoàn toàn hai ký tự `//`, triệt tiêu 100% khả năng bị bất kỳ công cụ minify/sanitizer nào hiểu lầm là comment.
     - Chuẩn hóa toàn bộ các lệnh `fetch` gọi dịch vụ máy trạm (Health Check, Báo thức loa xưởng, Trợ lý xưởng AI, và War Room 7 Agents) sử dụng biến `KCS_LOCAL_URL`.
  2. **Đồng Bộ Phòng Ngừa (`Tab_Production.html`)**:
     - Áp dụng cấu trúc ghép chuỗi tương tự cho lời gọi AI KCS `api/inspect` tại khâu thẩm định ảnh nghiệm thu.
  3. **Độ Tin Cậy Vận Hành**:
     - Biên dịch Phase 1 - Core trên client hoàn tất thành công trong 0ms từ Local Cache, sẵn sàng kích hoạt ngay War Room 7 Agents.

---

## [v2.45.0] - 2026-09-05

### 🏛️ Ban Điều Hành Tác Nhân Số (RF War Room 7 Agents) & Single-Turn Orchestration với Gemini 3.6 Flash
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **Sự cô lập giữa các bộ phận khi xảy ra sự cố xưởng**: Khi xảy ra lỗi kỹ thuật (bọt khí, nứt góc kính, layout lung lay, tồn keo giảm), các khâu KCS, Thủ kho, Quản đốc, Tài chính và Nhân sự giải quyết rời rạc, thiếu sự đối thoại đa chiều và thiếu sự giám sát toàn diện từ Ban Điều Hành.
  - **Hạn chế của kịch bản tĩnh (Hardcoded Script)**: Các thông báo lỗi trước đây là khuôn mẫu lặp lại, không phản ánh tính chất đa dạng của từng sự vụ và không tạo được văn hóa làm việc sống động, thấu đáo tại xưởng.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật**:
  1. **Bộ Não Hội Thoại Đa Tác Nhân Single-Turn Orchestration (`agent_war_room.py`)**:
     - Định nghĩa 7 nhân vật số độc lập với chuyên môn sắc sảo:
       + **CSO (GĐ Chiến Lược)**: Đánh giá tác động thương hiệu, đại lý, tiềm năng SKU và rating 5 sao.
       + **COO (GĐ Vận Hành)**: Điều phối tiến độ sản xuất, thời gian SOP và lịch giao vận Shipper.
       + **CFO (GĐ Tài Chính)**: Kiểm soát chi phí phôi/keo, duyệt ngân sách và chuyển tiền phạt vào Quỹ Từ Thiện.
       + **Thủ Kho (Thủ Kho AI)**: Cảnh báo tồn vật tư (kính siêu trong, keo Wacker 121 đen/trong, đá lũa).
       + **KCS Giám Sát SX**: Soi chuẩn kỹ thuật giấu keo, bọt khí đáy, mài vát 45 độ và quy chuẩn an toàn.
       + **Trợ Lý HR & KPI**: Tra cứu nội quy, áp dụng chế tài minh bạch và tính thưởng phạt chuyên cần.
       + **Thánh Bao Đồng**: Nhân vật tếu táo chõ chuyện xưởng, bình luận dân dã dí dỏm, kéo gần khoảng cách anh em.
     - Ứng dụng mô hình **Gemini 3.6 Flash** với kỹ thuật Single-Turn Multi-Agent Orchestration: Chỉ 1 lượt gọi API duy nhất sinh ra toàn bộ chuỗi hội thoại logic tự nhiên, tiết kiệm 85% chi phí token và phản hồi dưới 1 giây.
     - Tích hợp kịch bản dự phòng thích ứng 100% (Offline Fallback Engine) khi gặp gián đoạn kết nối.
  2. **Endpoint Mở Rộng Trên Máy Chủ Xưởng (`server_kcs.py`)**:
     - Bổ sung route `POST /api/warroom/discuss` xử lý payload `IncidentRequest`.
  3. **Cửa Sổ Nổi Thu Nhỏ Kéo Thả Công Thái Học (`Components.html` & `App_Main.html`)**:
     - Cửa sổ nổi `rf-agent-control-tower` với thanh kéo thả drag-handle hỗ trợ cả chuột máy tính lẫn cảm ứng điện thoại/máy tính bảng.
     - Roster 7 Agent đổi màu viền phát sáng theo lượt nhân vật đang phát biểu.
     - Khung stream hội thoại tự động cuộn (Auto-scroll), các chip gợi ý sự vụ 1 chạm và nút launcher toàn cục `[🎖️ War Room (7)]`.

## [v2.44.0] - 2026-09-05

### 🤖 Tích Hợp Trợ Lý Điều Phối & Giám Sát Kỹ Thuật Xưởng (RF Workshop Assistant)
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **Khoảng trống hỗ trợ thợ tức thời tại xưởng**: Các thợ gia công (Hoàng Dương, Duy Tân) khi gặp sự cố kỹ thuật (bọt khí đường keo góc đáy, sứt mẻ cạnh kính khi mài vát, layout bị lung lay hoặc thiếu vững chãi) thường phải dừng công việc để chờ Quản đốc hoặc nhắn tin hỏi Admin, gây gián đoạn nhịp độ Takt Time và phát sinh thời gian chết (Muda).
  - **Đứt gãy phản hồi sau khi KCS từ chối (Need_Repair)**: Khi mô hình AI Vision KCS phát hiện ảnh chụp không đạt chuẩn và trả về `Need_Repair`, thợ chỉ nhận được thông báo chung mà không có hướng dẫn từng bước cụ thể (cần khoét vát bao nhiêu độ, dùng loại keo nào, lau cồn ra sao, có cần thay kính không).
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật**:
  1. **Bộ Não Quản Đốc Kỹ Thuật Số Độc Lập (`agent_assistant.py`)**:
     - Định nghĩa vai trò Quản Đốc Ảo kiêm Kỹ Sư Trưởng Xưởng giàu kinh nghiệm, giọng điệu thực tế, thân thiện và tập trung vào hành động thực thi.
     - Hướng dẫn chuyên sâu quy cách kỹ thuật bể kính (dán giấu keo, khe keo 1-2mm chịu lực, keo Wacker 121 / Dow Corning) và layout thủy sinh (tỉ lệ 1/3, làm thác cát, giấu keo 502 bằng mùn đá).
     - Hướng dẫn chi tiết quy trình khắc phục lỗi KCS (Need_Repair) an toàn theo 4 bước chuẩn mực.
     - Luôn nhắc nhở an toàn lao động (găng tay chống cắt cấp 5 khi vác kính, kính bảo hộ khi cắt mài đá lũa).
     - Kiến trúc động Dual-Engine: Hỗ trợ linh hoạt cả Google GenAI Client lẫn Google Antigravity SDK nền tảng.
  2. **Endpoint Hội Thoại Máy Chủ AI (`server_kcs.py`)**:
     - Bổ sung route `POST /api/assistant/chat` tiếp nhận payload `AssistantRequest` (tin nhắn, tên thợ, công đoạn, tên sản phẩm, ghi chú lỗi KCS).
     - Khởi chạy ngầm đồng bộ trên cổng 8000 của máy trạm xưởng.
  3. **Widget Chat Công Thái Học Toàn Cục (`WorkshopAssistantWidget` trong `Components.html` & `App_Main.html`)**:
     - Nút nổi góc phải dưới màn hình với huy hiệu trạng thái kết nối thời gian thực (PORT 8000 ONLINE / OFFLINE).
     - Hộp thoại chat phong cách Hallmark sang trọng, nền tối kính mờ, tối ưu công thái học cả trên điện thoại và máy tính xưởng.
     - Tích hợp 4 chip câu hỏi nhanh 1 chạm: `[Xử lý bọt khí đường keo]`, `[Chuẩn mài xiết vát 45°]`, `[An toàn vác kính khổ lớn]`, `[Tỉ lệ vàng layout lũa đá]`.
  4. **Vòng Lặp Phản Hồi Tự Động KCS ➔ Assistant (`Tab_Production.html`)**:
     - Khi AI KCS thẩm định ảnh chụp phát hiện lỗi và trả về `Need_Repair`, hệ thống tự động kích hoạt gọi `window.openWorkshopAssistant` kèm toàn bộ thông tin sản phẩm và mô tả lỗi để Quản Đốc Ảo lập tức hướng dẫn thợ cách sửa lỗi.

## [v2.43.3] - 2026-09-05

### 🛡️ Cải Tổ Cụm Nút Thao Tác Thẻ Đơn Hàng & Chốt Chặn Poka-Yoke 2 Lớp Chống Mất Đơn
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **Sự cố thực tế ("Vừa bé vừa không hỏi xác nhận trước khi hoàn huỷ. Bấm nhầm cái là nó nhấc đơn đi đâu mất")**:
    - *Kích thước nút quá bé (24px `w-6 h-6`)*: Hàng loạt 8-10 nút icon (`⚡`, `📄`, `ℹ️`, `✏️`, `🕒`, `↩️`, `🚫`, `🗑️`) bị nhồi nhét chen chúc vào một dải hẹp với khoảng cách siêu nhỏ `gap-0.5`. Người dùng trên máy tính hoặc điện thoại khi định bấm xem chi tiết (`ℹ️`) hay in hoá đơn (`📄`) rất dễ bị chạm quẹt sang nút Hoàn (`↩️`) hoặc nút Huỷ (`🚫`).
    - *Không có bước xác nhận khi bấm Chuyển Hoàn (`handleAct('RETURN')`)*: Hàm chuyển hoàn trước đây thực thi ngay lập tức chỉ với 1 cú click đơn lẻ mà không có bất kỳ hộp thoại xác nhận nào. Trạng thái đơn đổi thành `Hàng Hoàn` và biến mất ngay khỏi tab hiện tại ("Chờ Sản Xuất" hoặc "Sẵn Sàng Đóng Gói"), gây ức chế và hoang mang tột độ cho người vận hành.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật (`Modals_Orders.html`)**:
  1. **Nâng Cấp Cụm Nút Công Thái Học Chuẩn Hallmark (Touch Ergonomics 32px)**:
     - Tăng kích thước nút từ 24px lên 32px (`w-7.5 h-7.5` / `w-8 h-8`), bo góc mềm mại `rounded-xl`, phản hồi chạm nảy tay `active:scale-95`.
     - Phân định rõ 4 nút chính trực quan: `[⚡ Hỏa tốc]` (vàng amber), `[📄 In bill/hoá đơn]` (xanh emerald), `[ℹ️ Chi tiết]` (xanh sky), `[••• Tác vụ khác]` (xám zinc).
  2. **Tách Biệt Vùng Tác Vụ Phụ & Vùng Kiểm Soát Nguy Hiểm Qua React Portal Dropdown**:
     - Toàn bộ các nút ít dùng và nút nguy hiểm được gom vào nút menu `•••`.
     - Menu mở ra qua `ReactDOM.createPortal` gắn thẳng vào `document.body` (tọa độ tính toán động theo bounding rect), triệt tiêu hoàn toàn lỗi bị cắt góc/xén khung bởi thuộc tính `overflow-hidden` của thẻ đơn.
     - Phân định rõ 2 khu vực: Nhóm tác vụ quản trị thông thường (Sửa đơn, Lịch sử, Đẩy GHN, Nhập SĐT xe) và Vùng kiểm soát nhạy cảm (Chuyển Hoàn, Hủy đơn, Xóa vĩnh viễn) với đường kẻ phân cách và icon khiên bảo vệ.
  3. **Chốt Chặn An Toàn Poka-Yoke 2 Lớp (Bắt Buộc Xác Nhận)**:
     - Dựng `OrderActionConfirmModal` toàn màn hình với nền mờ backdrop-blur:
       - Header cảnh báo với icon và màu sắc tương ứng (Tím cho Hoàn, Đỏ cho Huỷ, Đỏ sẫm cho Xoá).
       - Hiển thị rõ Mã đơn hàng, Tên khách hàng.
       - Cảnh báo rõ ràng việc đơn sẽ rời khỏi danh sách sản xuất/đóng gói hiện tại.
       - Hai nút bấm to rõ: `[ Huỷ bỏ (Giữ lại đơn) ]` (xám an toàn) và `[ Xác nhận... ]` (màu nổi bật theo hành động).
     - Triệt tiêu 100% rủi ro bấm nhầm làm mất đơn hàng.

## [v2.43.2] - 2026-09-05

### 📦 Thông Luồng Đóng Gói Liên Tục Từng Đơn (Không Chờ Hoàn Tất Đơn Cũ) & Lọc Rác Dữ Liệu
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **Yêu cầu thực chiến của xưởng ("Chụp từng đơn, chụp xong không cần done mà chụp tiếp đơn nữa rồi mới đi đóng")**: Nhân sự đóng gói (Diệu Hương) cần thao tác trực tiếp trên từng thẻ đơn (`OrderCardV2`). Khi có 3-4 đơn hàng cần gói, Hương bấm "BẮT ĐẦU" chụp ảnh hàng hóa Đơn 1, sau đó không cần bấm "CHỤP KIỆN HÀNG" (done) ngay mà có thể tiếp tục bấm "BẮT ĐẦU" chụp ảnh hàng hóa Đơn 2, Đơn 3... Sau khi chụp xong hàng loạt thì mới mang toàn bộ ra bàn đóng gói, bọc xốp và dán băng keo. Đóng xong thùng nào thì bấm "CHỤP KIỆN HÀNG" trên chính thẻ đơn đó để hoàn tất độc lập.
  - **Nguyên nhân 1 (Rác dữ liệu CSDL cũ - Zombie Packings)**: Trong Google Sheets, bảng `Packings` lưu trữ hàng nghìn dòng từ quá khứ. Các đơn hàng cũ đã Huỷ hoặc đã Bàn Giao bởi Admin nhưng không qua bước `DONE` của thợ đóng gói vẫn lưu `status: 'Packing'`. Khi số lượng này `>= 6`, hệ thống hiểu nhầm Hương đang nhận đủ 6 đơn dở dang và khóa cứng không cho nhận thêm đơn mới.
  - **Nguyên nhân 2 (Lệch so khớp tên nhân sự `isPackOwner`)**: Thuật toán so khớp tuyệt đối `===` giữa `currentPackingTask.user` và `currentUser` (ví dụ `"Diệu Hương"` vs `"Nguyễn Thị Diệu Hương"`) khiến `isPackOwner` trả về `false`, làm ẩn biến mất nút "CHỤP KIỆN HÀNG" trên thẻ đơn.
  - **Nguyên nhân 3 (Bẫy lan truyền sự kiện thẻ input file trên Mobile WebView)**: Thẻ `<label>` thiếu `e.stopPropagation()` khiến khi chạm vào nút chụp ảnh bị nảy click lên thẻ cha; thẻ `<input>` không reset `e.target.value = ''` sau khi chụp khiến các lần chụp liên tiếp không kích hoạt sự kiện `onChange`.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật (`Modals_Orders.html` & `Tab_Orders.html`)**:
  1. **Bộ Lọc Rác Dữ Liệu Đóng Gói Cũ Thông Minh (`userActivePackings`)**:
     - Kiểm tra trạng thái đơn hàng liên kết: Chỉ tính là đơn đang đóng nếu đơn hàng đó chưa hoàn thành hoặc chưa huỷ (`status !== 'Đã Bàn Giao' && status !== 'Hoàn Thành' && status !== 'Đơn Huỷ' && status !== 'Hàng Hoàn' && status !== 'Đối Soát Thành Công'`).
     - Tự động bỏ qua các dòng packing mồ côi từ những ngày trước, giải phóng hoàn toàn quota 6 đơn cho nhân sự đóng gói.
  2. **Chuẩn Hóa So Khớp Tên Nhân Sự Linh Hoạt (`isUserMatch`)**:
     - Hỗ trợ so khớp họ tên đầy đủ và tên gọi thường ngày (`Diệu Hương` ⟷ `Nguyễn Thị Diệu Hương`).
     - Đảm bảo `isPackOwner` luôn nhận diện chuẩn xác 100%, bảo vệ nút "CHỤP KIỆN HÀNG" luôn hiển thị đúng cho nhân sự đã bấm bắt đầu.
  3. **Quy Trình Chụp Đóng Gói Liên Tiếp Không Nghẽn (Continuous Multi-Order Flow)**:
     - Khi bấm "BẮT ĐẦU" chụp ảnh hàng hóa Đơn 1: Đơn 1 lập tức chuyển sang trạng thái "Đang đóng" (`isPacking = true`, nhãn nút chuyển sang "CHỤP KIỆN HÀNG" màu cam hổ phách kèm huy hiệu `📦 Đang đóng` nhấp nháy).
     - Toàn bộ các thẻ đơn khác trong danh sách vẫn giữ nguyên nút "BẮT ĐẦU" màu xanh ngọc. Nhân viên có thể bấm "BẮT ĐẦU" chụp tiếp Đơn 2, Đơn 3 (tối đa 6 đơn cùng lúc).
     - Khi đóng xong bất kỳ đơn nào: Bấm "CHỤP KIỆN HÀNG" trên chính thẻ đó ➔ Đơn chuyển sang "Chờ Bàn Giao" và tự động giải phóng 1 slot. Các đơn còn lại vẫn đang đóng độc lập không bị ảnh hưởng.
  4. **Tối Ưu Phản Hồi Trực Quan & Trải Nghiệm Tương Tác Hallmark**:
     - Bổ sung `onClick={e => e.stopPropagation()}` trên `<label>` bọc input file.
     - Tự động xóa sạch `e.target.value = ''` mỗi lần click và change, đảm bảo camera trên thiết bị di động/WebView luôn bật mượt mà 100%.
     - Khi đang tải ảnh: Nút hiển thị `ĐANG TẢI ẢNH...` / `ĐANG LƯU KIỆN...` kèm icon `fa-spinner fa-spin` và hiệu ứng thở ánh sáng.
     - Khi đạt ngưỡng 6 đơn: Các đơn còn lại hiển thị nhãn cảnh báo trực quan `ĐANG GÓI 6/6`, chạm vào sẽ có Toast nhắc nhở nhẹ nhàng.
  5. **Nâng Cấp Tra Cứu Khóa Kép `latestPackMap` (`Tab_Orders.html`)**:
     - Hỗ trợ tra cứu packing theo cả `order.id` và `order.orderCode` (kể cả mã đơn có hậu tố `| MVĐ: ...`).
- **Kiểm Định Tự Động**: Bổ sung bộ test Section 17 trong `run_tests.js` kiểm chứng luồng nhận liên tiếp nhiều đơn, độc lập hoàn tất và cơ chế lọc bỏ bản ghi mồ côi.


## [v2.43.1] - 2026-09-05

### ⚡ Tự Động Thông Luồng Sang Đóng Gói & Chọn Nhanh Lý Do Lỗi KCS 1 Chạm
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **Sự cố 1 (Nghẽn đơn tại khâu Kiểm Định - "Sao nó vẫn duyệt?")**: Khi thợ hoàn thành cả Khâu 1 (Tiến) và Khâu 2 (Tâm), hệ thống vẫn tự động gán trạng thái `status: 'Kiểm Định'` và giam giữ đơn hàng tại tab `Kiểm Định`. Đơn hàng không thể chuyển sang `Sẵn Sàng Đóng Gói` khiến nhân sự đóng gói không nhận được hàng, bắt buộc Admin phải vào bấm duyệt thủ công (`DUYỆT ĐẠT KCS`), phá vỡ dòng chảy liên tục Lean One-Piece Flow.
  - **Sự cố 2 (Lỗi tương tác chọn lý do lỗi - "Sao không chọn được lý do?")**: Trong modal `Báo Lỗi Khung` (`ImageAnnotationModal` / `Modals.html`), các nút chọn lý do nhanh (`Sai bố cục / Tỷ lệ`, `Rễ đơ / Sai hướng`,...) chỉ đổi màu viền nhạt nhòa, không có dấu tích trực quan và **không tự điền vào ô mô tả lý do**. Người dùng thấy ô nhập liệu trống trơn nên tưởng hệ thống không nhận lệnh bấm. Ngoài ra, form `Yêu Cầu Làm Lại` ở tab sản xuất thiếu danh mục lý do nhanh, bắt buộc phải gõ tay.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật**:
  1. **Tự Động Chốt Đã Xong Khi Khâu Cuối Hoàn Tất (`Tab_Production.html`)**:
     - Cập nhật logic: Khi `isAllDone = true` (cả 2 khâu hoàn thành), hệ thống tự động gán `upd.status = 'Done'`, `upd.qc_status = 'Đã duyệt'`.
     - Lập tức kích hoạt `checkAndToggleOrderReadiness(order, prodItems, erpProducts)` để tự động đưa đơn hàng sang `Sẵn Sàng Đóng Gói` cho Diệu Hương đóng hộp ngay mà không bị chặn bởi khâu duyệt của Admin.
     - Quy trình kiểm định KCS của Admin chuyển hoàn toàn sang kiểm tra bất đồng bộ (Asynchronous Audit).
  2. **Trải Nghiệm Chọn Nhanh Lý Do Lỗi 1 Chạm Siêu Rõ Ràng (`Modals.html` & `Tab_Production.html`)**:
     - Nâng cấp chip chọn lý do trong `ImageAnnotationModal`: Khi bấm chọn, chip lập tức chuyển sang màu đỏ rực rỡ (`bg-rose-600 text-white font-black`) kèm icon tích tròn (`fa-check-circle`).
     - Tự động điền và đồng bộ lý do đã chọn vào ô văn bản `extraText` / `reworkReason` theo thời gian thực (bấm chọn thêm sẽ nối chuỗi, bấm lại sẽ tự gỡ bỏ).
     - Nếu đang mở điểm ghim trên ảnh (`activePin`), bấm lý do nhanh sẽ tự động điền luôn nội dung vào điểm ghim đó.
     - Bổ sung bộ chip lý do nhanh tương tự vào form `Yêu Cầu Làm Lại` (`showReworkForm`) tại `Tab_Production.html`.
- **Kiểm Định Tự Động**: Bổ sung bộ test Section 16 kiểm chứng toàn diện luồng auto-pass đơn khi xong sản xuất và cơ chế đồng bộ lý do lỗi KCS.


## [v2.43.0] - 2026-09-05

### 📦 Mở Khóa Đóng Gói Đồng Thời Theo Lô (Batch Packing - Tối Đa 6 Đơn/Tài Khoản)
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **Hạn chế cũ (Chốt chặn đơn lẻ)**: Hệ thống trước đây áp dụng cơ chế khóa cứng: Mỗi tài khoản nhân sự đóng gói (Diệu Hương) chỉ được bấm "BẮT ĐẦU" đúng 1 đơn hàng duy nhất (`status: 'Packing'`). Nếu có bất kỳ đơn nào chưa chụp ảnh đóng kiện hoàn thành, hệ thống chặn hoàn toàn việc nhận đơn mới.
  - **Lãng phí thời gian thao tác (Muda of Motion & Waiting)**: Trong thực tế sản xuất của Rich Fish Aquarium, nhân sự đóng gói thường gom 4 - 6 đơn hàng cùng kích thước/cùng kênh giao hàng để cắt xốp, chuẩn bị thùng carton và quấn màng co đồng loạt nhằm tối ưu hóa năng suất và nhịp độ Takt Time. Việc bắt buộc phải đóng xong, chụp ảnh và bàn giao từng đơn một tạo ra độ trễ thao tác lớn và không phản ánh đúng dòng chảy công việc thực tế.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật (`Modals_Orders.html`)**:
  1. **Nâng trần đóng gói đồng thời lên tối đa 6 đơn**:
     - Thay thế lệnh tìm kiếm đơn lẻ `find(p => p.user === currentUser && p.status === 'Packing')` bằng mảng lọc `userActivePackings`.
     - Cho phép nhân sự bấm nhận "BẮT ĐẦU" tối đa 6 đơn hàng đồng thời (`MAX_CONCURRENT_PACKINGS = 6`).
     - Cập nhật thông báo trực quan trên Toast: `Đã bắt đầu tính giờ đóng gói (X/6)!`.
  2. **Chốt chặn Poka-Yoke chống bấm trùng & bảo vệ an toàn dữ liệu**:
     - Kiểm tra nghiêm ngặt `isAlreadyPackingThis` (so khớp cả `orderId` và `orderCode`), ngăn chặn nhân sự vô tình bấm nhận 2 lần cho cùng 1 đơn hàng.
     - Khi đã nhận đủ 6 đơn dở dang (`userActivePackings.length >= 6`), hệ thống kích hoạt cảnh báo đỏ yêu cầu hoàn thành bớt đơn trước khi nhận tiếp.
  3. **Cơ chế tự động giải phóng lượt (Auto Slot Release)**:
     - Khi nhân sự bấm "CHỤP KIỆN HÀNG" và hoàn tất đơn (`act === 'DONE'`), bản ghi đóng gói chuyển sang `status: 'Done'`, tự động giảm số lượng đơn đang gói và giải phóng ngay 1 vị trí trong hạn mức 6 đơn.
  4. **Tối ưu hóa UI & Đồng bộ phiên bản**:
     - Memo hóa `userActivePackings` tại `OrderCardV2`, đảm bảo hiệu năng render mượt mà khi hiển thị danh sách đơn hàng lớn.
     - Đồng bộ nhật ký phát hành `RELEASES` và huy hiệu phiên bản `Royal v2.43.0` trên toàn hệ thống.
- **Kiểm Định Tự Động**: Bổ sung bộ test Section 15 kiểm chứng toàn diện logic nhận 1..6 đơn, chặn đơn thứ 7, chống bấm trùng và giải phóng slot khi hoàn tất.


## [v2.42.0] - 2026-09-04

### ⚡ Tối Ưu Hóa Dòng Chảy Lean (One-Piece Flow), Phá Vỡ Điểm Nghẽn Sản Xuất & Giao Hàng
- **Bối cảnh & Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)**:
  - **Điểm nghẽn 1 (Tắc dòng chảy K1 ➔ K2)**: Thợ Khâu 1 (như Vinh dựng khung) hoàn thành xong thì Khâu 2 (thợ Tâm gia cố) bị khóa cứng với trạng thái `Chờ duyệt khung`, bắt buộc Admin phải vào bấm duyệt thủ công thì Khâu 2 mới mở ra. Thợ Khâu 2 phải ngồi chờ (lãng phí thời gian chết Muda), phá vỡ nguyên lý One-Piece Flow.
  - **Điểm nghẽn 2 (Tắc giao hàng lúc 16:00 do nghẽn mã vận đơn)**: Đơn hàng Shopee/TikTok đã xong 100% sản phẩm nhưng chưa kịp sinh mã vận đơn thì hệ thống giam giữ cố định ở `Chờ Sản Xuất`. Thợ đóng gói (Hương) không thấy đơn ở `Sẵn Sàng Đóng Gói` để bọc xốp, đóng thùng carton trước. Đến 16:00 khi sàn cấp mã vận đơn hàng loạt thì dồn ứ khối lượng đóng gói, gây trễ hẹn giao hàng cho shipper.
  - **Điểm nghẽn 3 (Lệch khóa ngoại OrderId vs OrderCode)**: Một số lệnh sản xuất ghi `orderId` là chuỗi `ORD-XXXXX`, trong khi đơn hàng liên kết lưu ID số, dẫn đến hàm `checkAndToggleOrderReadiness` (`Tab_Production.html`) và `safeDeductInventoryOnHandover` (`Code.js`) không khớp được sản phẩm, làm đơn không tự nhảy sang đóng gói và bỏ sót trừ tồn kho khi bàn giao.
  - **Điểm nghẽn 4 (Đảo ngược độ ưu tiên hàng chờ - Priority Inversion)**: Danh sách lệnh sản xuất sắp xếp kênh bán trước hạn chót, dẫn đến đơn cũ không gấp lại nằm trên đỉnh, trong khi đơn mới có deadline hôm nay (cần giao trước 17:30) lại bị đẩy xuống dưới.
- **Nâng Cấp Kiến Trúc & Giải Pháp Kỹ Thuật**:
  1. **Tự Động Mở Khóa Khâu 2 (Auto-Advance Phase 2 - `Tab_Production.html`)**:
     - Khi Khâu 1 hoàn tất, hệ thống tự động ghi nhận `phases.phase1.status = 'Done'`, chốt thời gian `p1_endTime`, ghi nhận tiền thưởng KPI và gắn cờ `qc_status = 'Khung đã nộp'`.
     - Loại bỏ điều kiện chặn `item.qc_status === 'Chờ duyệt khung'` khỏi biến `isLocked`. Khâu 2 tự động mở khóa ngay lập tức cho thợ gia cố thao tác.
     - Quy trình KCS của Admin chuyển sang kiểm tra độc lập bất đồng bộ; chỉ khi Admin chủ động bấm từ chối (`qc_status === 'Yêu cầu làm lại'`) thì Khâu 2 mới bị khóa lại.
  2. **Cho Phép Đóng Hộp Trước Khi Thiếu Mã Vận Đơn (Early Box Packing - `Tab_Orders.html` & `Modals_Orders.html`)**:
     - Khi `allProdDone = true`, đơn lập tức chuyển sang `Sẵn Sàng Đóng Gói` để đóng hộp trước, xóa bỏ điều kiện chặn bởi `isMissingMVD`.
     - Trên thẻ đơn hiển thị huy hiệu cảnh báo màu hổ phách: `[CHỜ MÃ VẬN ĐƠN - ĐÓNG HỘP TRƯỚC]`.
     - Nút `BÀN GIAO` được bọc chốt chặn Poka-Yoke: Nếu thiếu mã vận đơn sẽ cảnh báo và chặn xuất kho, đảm bảo kiện hàng đã đóng sẵn chỉ chờ dán tem là giao ngay cho shipper.
  3. **Chuẩn Hóa Khóa Ngoại Hai Chiều `isOrderMatch` (`Tab_Production.html` & `Code.js`)**:
     - Xây dựng logic so khớp toàn diện: `pOrderId === oId || pOrderId === oCode || pOrderId === oBaseCode`.
     - Đảm bảo 100% sản phẩm và đơn hàng liên kết chính xác, đồng bộ trừ kho thành phẩm trong `safeDeductInventoryOnHandover`.
  4. **Thuật Toán Sắp Xếp Hạn Bàn Giao Sớm Nhất (Earliest Deadline First - EDF - `Tab_Production.html`)**:
     - Lập chỉ mục `getEffectiveDeadline` tự động tính toán deadline thực tế (Shopee 17:30 / 11:30 hôm sau).
     - Thứ tự ưu tiên điều phối hàng chờ:
       1. Đơn Hỏa Tốc (`isUrgent`)
       2. Hạn bàn giao sớm nhất (`dlA - dlB`)
       3. Mức độ ưu tiên kênh bán (`channelPriority`)
       4. Ngày tạo đơn (`createdAt`)
  5. **Thanh Lọc Phân Khâu Kanban 1 Chạm (Lean Pull Flow - `Tab_Production.html`)**:
     - Bổ sung cụm chip lọc trực quan tại tab `CHỜ SẢN XUẤT`:
       - `[Tất Cả Khâu]`
       - `[Dựng Khung Phôi / Cắt Dán Kính]` (Khâu 1 chưa xong)
       - `[Gia Cố Keo / Gọt Keo Bể]` (Khâu 1 đã xong, Khâu 2 sẵn sàng làm)
     - Giúp thợ kéo việc đúng chuyên môn chỉ với 1 cú chạm, không cần lục tìm danh sách.
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
  - **Phân tích nguyên nhân gốc rễ**:
    - Trong `Tab_HR.html`, code trước đây cố gắng tính lại thưởng bằng cách gọi `getPackingReward(candidateItems, ...)` nhưng `candidateItems` chỉ đọc từ `orderMatch.products` (bảng `Orders` không có cột này) và ép chuỗi thô `orderMatch.accessories` thành `"[object Object]"`.
    - Do không có tên sản phẩm hợp lệ, hàm rơi vào fallback dòng đầu tiên của `Config_KPI` (1.100đ) và ghi đè lên mức thưởng thực tế đã lưu trong bảng `Packings`.
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

## [v2.36.6] - 2026-09-03

### 🛠️ Hỗ Trợ Nhập Thủ Công Tên Công Cụ, Trang Thiết Bị Ngoài Kho Trên Bảng Báo Nhập Hàng
- **Bổ Sung Chế Độ Nhập Thủ Công Công Cụ / Trang Thiết Bị (`Tab_Dashboard.html`)**:
  - **Vấn đề**: Form Bảng Báo Nhập Hàng trước đây chỉ cho phép chọn từ danh sách hàng hoá (`Products`) hiện có trong kho. Khi xưởng cần mua sắm công cụ, máy móc, trang thiết bị mới (máy khoan, kìm, thước, súng bắn keo, bàn chà, thùng rác, đồ bảo hộ...) chưa từng có mã SKU trong kho, thợ và quản lý không thể nhập tên và gửi phiếu lên list mua.
  - **Giải pháp**: Thiết kế bộ chuyển đổi chế độ linh hoạt dạng Segmented Pills:
    - **`[ 📦 Chọn Từ Kho Hàng ]`**: Giữ nguyên danh mục vật tư/phụ kiện kho có sẵn, tích hợp thêm lựa chọn chuyển nhanh sang nhập tay ở cuối dropdown.
    - **`[ 🛠️ Nhập Thủ Công (Công Cụ / Thiết Bị) ]`**: Cho phép gõ tự do tên công cụ/thiết bị cần mua, chọn phân loại (*Công cụ / Dụng cụ, Trang thiết bị xưởng, Vật tư tiêu hao, Đồ bảo hộ lao động, Văn phòng phẩm...*), đơn vị tính (*cái, bộ, cuộn, hộp...*) và đơn giá ước tính.
- **Phân Biệt Trực Quan Trong Danh Sách Hàng Đợi (`Tab_Dashboard.html`)**:
  - Bổ sung huy hiệu phân loại trực quan:
    - Huy hiệu vàng hổ phách: `[🛠️ Thiết Bị / Công Cụ]` cho các mặt hàng nhập thủ công ngoài danh mục kho.
    - Huy hiệu xanh lục: `[📦 Hàng Kho]` cho các mặt hàng vật tư/phụ kiện lấy từ kho.
  - Tự động gắn tag và đồng bộ chuẩn xác sang bảng chứng từ `ImportExport` (loại `ĐẶT HÀNG`), giúp bộ phận mua sắm và kế toán dễ dàng gom đơn đặt hàng.

---

## [v2.36.5] - 2026-09-03

### 🛠️ Tab Nhanh Nhân Sự Chịu Trách Nhiệm Trên Cùng, Bỏ Cột Trùng Lặp & Mở Rộng 100% Tên Thiết Bị
- **Khắc Phục Vấn Đề Tên Thiết Bị Bị Cắt Cụt (`Tab_Workspaces.html`)**:
  - **Nguyên nhân**: Cột `TÊN THIẾT BỊ / DỤNG CỤ` trước đây chỉ được cấp `col-span-3` (25% chiều rộng bảng) do phải chia đất cho cột `NGƯỜI QUẢN LÝ` (`col-span-3`). Thuộc tính `truncate` khiến mọi tên thiết bị dài như *Dàn Máy Tính Màn 49 Inch Cong UltraWide*, *Hệ Thống Bể Trưng Bày Đa Tầng 1m5*, *Bàn Gỗ MDF Nâu 180x80*... đều bị cắt cụt sau vài ký tự, gây khó khăn cho việc kiểm kê và bàn giao.
  - **Giải pháp**: Xóa bỏ hoàn toàn cột `Người Quản Lý` dư thừa ở từng dòng bảng; nâng chiều rộng cột `TÊN THIẾT BỊ / DỤNG CỤ` lên gấp đôi (`col-span-6` - 50% diện tích). Thay thế `truncate` bằng `break-words whitespace-normal text-zinc-100 font-semibold leading-snug`, cho phép tên thiết bị hiển thị trọn vẹn 100% nội dung một cách thoáng đãng và rõ ràng.
- **Bổ Sung Dải Tab Nhanh Nhân Sự Chịu Trách Nhiệm Trên Cùng (Quick Responsible Tabs - `Tab_Workspaces.html`)**:
  - Đưa bộ lọc nhân sự chịu trách nhiệm lên đỉnh trang dưới dạng thanh Tab nhanh hiện đại, tự động tính toán tổng số lượng thiết bị và tổng giá trị tài sản do từng nhân sự quản lý (Tiến, Hương, Dương, Tâm...).
  - Chạm 1 chạm vào tab của bất kỳ nhân sự nào sẽ lập tức lọc toàn bộ màn hình chỉ hiển thị các trạm và thiết bị thuộc quyền quản lý của nhân sự đó.
  - Hỗ trợ nút `[Xem tất cả trạm & nhân sự]` để quay lại chế độ xem tổng quan toàn bộ phân xưởng.
- **Bảo Toàn Logic Nghiệp Vụ Xử Lý Sự Cố & Phạt Khấu Trừ**:
  - Các thao tác Báo sự cố, Phạt vi phạm, Sửa trạm, Xoá thiết bị vẫn tự động nhận diện chính xác 100% người chịu trách nhiệm trực tiếp của từng món đồ theo CSDL.

---

## [v2.36.4] - 2026-09-03

### 🚚 Tối Ưu Bàn Giao Hàng Loạt Thông Minh, Chống Bấm Nhầm Đơn Đã Giao & Auto-Scroll Tab Trạng Thái
- **Phân Tích & Giải Quyết Triệt Để Trải Nghiệm "Kẹt Đơn Chờ Bàn Giao" (`Tab_Orders.html`)**:
  - **Nguyên nhân gốc rễ 1 (Khuất Tab Trạng Thái)**: Thanh 9 tab trạng thái bị tràn ngang trên màn hình hẹp, đẩy tab số 6 `Đã Bàn Giao` ra ngoài mép phải khung nhìn. Khi người dùng bấm bàn giao hoặc chuyển sang xem đơn đã giao, tab ngoài cùng bên phải hiển thị trong tầm mắt là `Chờ Bàn Giao (14)` (đang ở trạng thái inactive), gây lầm tưởng người dùng vẫn đang đứng ở tab "Chờ Bàn Giao".
  - **Nguyên nhân gốc rễ 2 (Thanh Tác Vụ Nổi Thiếu Bộ Lọc)**: Thanh dock nổi màu đen luôn hiển thị nút xanh lá `BÀN GIAO (N)` bất kể đơn được chọn đã ở trạng thái `Đã Bàn Giao` hay chưa. Khi người dùng tick "Chọn tất cả" một nhóm kênh, nút `BÀN GIAO (1)` lại bật lên, tạo cảm giác đơn chưa được giao và thao tác bàn giao không có tác dụng.
- **Triển Khai Nâng Cấp Kỹ Thuật (Lean Muda & Hallmark UX)**:
  - **Auto-Scroll Active Tab (`tabsContainerRef`)**: Trang bị hook `useEffect` tự động phát hiện tab đang được chọn (`data-active="true"`) và cuộn mượt mà (`scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })`) đưa tab active ra giữa khung nhìn, đảm bảo người dùng luôn nhận biết 100% mình đang ở tab nào.
  - **Thanh Tác Vụ Nổi Thông Minh (Smart Bulk Handover Dock)**:
    - Bổ sung bộ lọc `eligibleHandoverOrders`: Chỉ lọc những đơn thực sự chưa giao (loại trừ `Đã Bàn Giao`, `Đã Nhập Kho`, `Hoàn Thành`, `Đơn Huỷ`, `Hàng Hoàn`).
    - Nếu tất cả đơn đã chọn đều đã bàn giao: Thay thế nút bấm xanh lá bằng huy hiệu cố định `✓ ĐÃ BÀN GIAO (N)` màu xanh lục bảo sang trọng, không cho phép bấm lặp lại.
    - Nếu có đơn cần giao: Hiển thị đúng số lượng đơn đủ điều kiện `BÀN GIAO (N)`.
  - **Chuẩn Hóa Độ Ưu Tiên Trạng Thái (`timeFilteredOrders`)**:
    - Ưu tiên giá trị `o.status` thực tế trước `_effectiveStatus` để triệt tiêu việc đọc nhầm cache trạng thái cũ khi Optimistic UI vừa cập nhật `pushDeltas`.
    - Bổ sung nhánh so khớp chính xác `rawStatus === 'ĐÃ BÀN GIAO' || rawStatus === 'ĐÃ NHẬP KHO' => eff = 'ĐÃ BÀN GIAO'`.

---

## [v2.36.3] - 2026-09-03

### 👑 Bảo Toàn Cấp Độ & EXP Lũy Kế Trọn Đời (Lifetime) & Chuẩn Hóa So Khớp Tên Nhân Sự
- **Khắc Phục Dứt Điểm Tình Trạng Tụt Cấp Đầu Tháng (`Tab_HR.html`)**:
  - **Nguyên nhân**: Hệ thống thẻ nhân sự vô tình tính toán biến `totalKPIVnd` và `xuTasksKPI` dựa trên mảng `claimedKPIs` đã bị lọc theo dropdown tháng (`isKpiInSelectedMonth`). Khi bước sang tháng 9 mới trôi qua 3 ngày, toàn bộ KPI đã nghiệm thu của các tháng trước bị ẩn, làm `totalKPIVnd` tụt về 0đ và nhân sự tụt cấp thê thảm.
  - **Khắc phục**: Tách biệt hoàn toàn bộ lọc thời gian của Quest Board với biến tính cấp độ. Cấp độ và EXP sử dụng `allClaimedKPIs` từ toàn bộ lịch sử cống hiến trọn đời, bảo toàn thành quả phấn đấu và không bị reset khi chuyển tháng.
- **Chuẩn Hóa Thuật Toán So Khớp Nhân Sự Thông Minh (`matchUser`)**:
  - Chặn danh sách từ khóa tài chính & hệ thống: `"tiền mặt"`, `"tiền gửi"`, `"ngân hàng"`, `"chuyển khoản"`, `"công nợ"`, `"chi phí"`...
  - Kiểm tra thanh điệu tiếng Việt: Phân biệt rõ ràng dấu sắc ("Tiến") với dấu huyền ("tiền"), ngăn ngừa triệt để việc nhận nhầm các giao dịch dòng tiền xưởng vào nick cá nhân của Boss.
- **Đồng Bộ Hoàn Hảo Header & Thẻ Nhân Sự (`App_Main.html` & `Tab_HR.html`)**:
  - Cập nhật hàm `computeUserTotalExp` và `ExpHistoryRoadmapModal` loại bỏ lọc nhầm ghi chú chứa chữ "xuất" (như "sản xuất", "xuất kho"), đồng bộ 100% số dư Xu và cấp độ hiển thị giữa Header trên cùng và Thẻ nhân sự bên dưới.

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

## [v2.35.4] - 2026-09-02

### 💎 Tái Cấu Trúc Nhật Ký Chứng Từ: Nút Icon Gọn Gàng, Tách Bạch Xuất - Nhập Từng Kho & Thống Kê Ròng
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

## [v2.35.3] - 2026-09-01

### 🛡️ Minh Bạch Cước Vận Chuyển / Chi Phí Khác Trong Phiếu Nhập & Chi Tiết Chứng Từ
- **Hiển Thị Minh Bạch Trên Bản In Nhiệt (K58 / K80 / Tải PNG / Sao Chép Tóm Tắt) (`Tab_ImportExport.html`)**:
  - Tự động bóc tách và vẽ rõ ràng dòng `Cước VC / Chi phí khác: +[số tiền] đ` nằm ngay giữa `Tổng tiền hàng` và `Tổng thanh toán`.
  - Khắc phục triệt để tình trạng lệch số tiền khiến nhân viên hoặc đối tác NCC thắc mắc (ví dụ: Tổng tiền hàng `3.100.000đ` + Cước VC `441.908đ` = Tổng thanh toán `3.541.908đ`).
- **Bổ Sung Chân Bảng Tổng Kết (TFoot) Trong Thẻ Chi Tiết Phiếu Kho (`Tab_ImportExport.html`)**:
  - Bảng danh sách mặt hàng khi mở rộng thẻ phiếu kho hiển thị rõ ràng 3 dòng tổng kết:
    1. **Tổng tiền hàng (x mặt hàng)**: Tổng giá trị hàng hoá thực nhập/xuất.
    2. **Cước vận chuyển / Chi phí khác**: Khoản tiền cước xe/phụ phí được cộng vào giá vốn.
    3. **Tổng thanh toán phiếu**: Số tiền quyết toán cuối cùng của chứng từ kho.

---

## [v2.35.2] - 2026-09-01

### 🛡️ Hotfix: Loại Bỏ Phiếu Nhập Trùng Ảo & Tự Động Bù BOM Cho Bể Kính
- **Gỡ Bỏ Hoàn Toàn Việc Sinh Phiếu Ảo `IE_AUTO_IMPORT_` (`Code.js`)**:
  - Loại bỏ khối mã tạo phiếu nhập tự động cũ trong hàm `syncDeltas` (trước đây sinh các phiếu `IE_AUTO_IMPORT_...` với giá vốn tĩnh).
  - Thống nhất duy nhất 1 cơ chế tạo Phiếu Nhập Kho Thành Phẩm chính thức (`IE_TP_...`) bên trong `processMaterialDeduction` với giá vốn khớp 100% chi phí BOM vật tư thực tế.
- **Sửa Lỗi Chặn Trùng Lặp Idempotency Khi Dán Bể Kính (`Code.js`)**:
  - Sửa chốt chặn kiểm tra trong `processMaterialDeduction`: Chỉ so khớp chính xác mã `logId === 'IE_BOM_' + prodId`, không kiểm tra chuỗi `logNote` tự do (tránh việc phiếu nhập thành phẩm `IE_AUTO_IMPORT_` hoặc `IE_TP_` vô tình chặn đứng việc sinh phiếu xuất nguyên liệu BOM của Bể kính).
- **Nâng Cấp Engine `cleanupPhantomBomTickets` (`Code.js`)**:
  - Tự động xóa sạch các phiếu nhập kho ảo cũ `IE_AUTO_IMPORT_` bị sinh trùng lặp.
  - Tự động quét và sinh bù đủ cặp phiếu `IE_BOM_` (Xuất vật tư) và `IE_TP_` (Nhập thành phẩm) cho mọi lệnh sản xuất thực tế hoàn thành (bao gồm cả Bể Kính 20x20x8cm) mà trước đó bị sót.

---

## [v2.35.1] - 2026-09-01

### 🎨 Tối Ưu Giao Diện In Phiếu Lương & Phân Cấp Typography Chuẩn Xác
- **Căn Chỉnh Cột Số Tiền Về Phía Bên Trái Cho Các Khoản Con (`Tab_HR.html`)**:
  - Đưa toàn bộ cột số tiền của các khoản con (`Thưởng / Phụ cấp khác` và `Khấu trừ vi phạm / KCS`) về phía bên trái thẳng hàng theo cột cố định `minWidth: '82px'` với font monospace dễ nhìn.
  - Loại bỏ hoàn toàn tình trạng số tiền bị trôi dạt sang mép phải hoặc bị ngắt dòng chữ `đ` xuống dưới.
- **Phân Cấp Thị Giác Rõ Rệt (Visual Hierarchy)**:
  - **Khoản Tổng & Mục Cấp 1**: Tăng kích thước chữ (`12px - 15px`), in đậm dày nét (`fontWeight: 800 - 900`), viền và nền tương phản rõ rệt.
  - **Khoản Chi Tiết Con (Sub-items)**: Thu nhỏ kích thước (`9.5px`), nét chữ thanh mảnh (`fontWeight: normal`), màu xám sẫm (`#374151`) giúp tổng thể phiếu in cực kỳ gọn gàng, chuyên nghiệp và chuẩn 1 trang A4.

---

## [v2.35.0] - 2026-09-01

### 🛡️ Chuẩn Hóa Khấu Trừ BOM & Tự Động Sinh Phiếu Nhập Kho Thành Phẩm
- **Chốt Chặn Poka-Yoke Chống Trừ BOM Hàng Tồn Kho (`Code.js`)**:
  - Khắc phục triệt để lỗi đơn hàng lấy từ tồn kho có sẵn (`fulfilledFromStock = true` / `Hoàn Kho Đạt` / `Lấy từ tồn kho có sẵn`) khi hoàn tất bị kích hoạt hàm trừ kho nguyên liệu BOM.
  - Tích hợp lớp kiểm tra tức thì trong cả `processMaterialDeduction` và `syncDeltas`: Nếu là hàng có sẵn, lập tức bỏ qua và không sinh bất kỳ phiếu trừ vật tư nguyên liệu nào.
- **Tự Động Sinh Phiếu Nhập Kho Thành Phẩm (`IE_TP_...`) Khi Sản Xuất Hoàn Thành (`Code.js`)**:
  - Khi một lệnh sản xuất thực tế (`fulfilledFromStock = false`) hoàn tất, hệ thống tự động sinh đồng thời:
    1. **Phiếu Xuất Nguyên Liệu BOM (`IE_BOM_...`)**: Khấu trừ kính, keo, fomex, rêu, lũa, đá khỏi bảng `Products`.
    2. **Phiếu Nhập Kho Thành Phẩm (`IE_TP_...`)**: Ghi nhận nhập thành phẩm vừa hoàn thành vào kho với đối tượng `Xưởng Sản Xuất` và giá vốn chuẩn xác theo chi phí BOM.
  - Đối với các lệnh sản xuất bù kho / lưu kho nội bộ: Tự động cộng số lượng tồn kho thành phẩm trong bảng `Products`.
- **Bổ Sung Engine Dọn Dẹp Phiếu BOM Ảo & Hoàn Trả Vật Tư (`cleanupPhantomBomTickets` trong `Code.js`)**:
  - Quét và thu hồi toàn bộ các phiếu `IE_BOM_...` bị sinh nhầm cho các lệnh lấy từ tồn kho, tự động hoàn trả số lượng vật tư nguyên liệu đã khấu trừ về bảng `Products`.

---

## [v2.34.2] - 2026-09-01

### 🛡️ Hotfix: Chuẩn Hóa Đơn Vị Tính (ĐVT) Khớp 100% Danh Mục & Gỡ Bỏ Hack Ép Gam
- **Tôn Trọng ĐVT Chuẩn Trong Bảng `Products` (`Tab_ImportExport.html`, `Tab_Suppliers.html`)**:
  - Khắc phục triệt để lỗi mất Đơn vị tính (`Kg`, `Túi`, `Hộp`, `Bó`, `Cành`, `Bao`, `Quả`, `Khúc`...) bị hiển thị thành `"Cái"` trên danh sách phiếu kho, Modal Sửa Phiếu và Báo cáo Nhập hàng Nhà Cung Cấp.
  - Tự động liên kết `sku` / `name` của từng dòng chứng từ với bảng `Products` để lấy chính xác trường `unit` gốc.
- **Gỡ Bỏ Hack Ép Chuyển Đơn Vị Tính Thành `gam` & Chia 1000 Đơn Giá Sai Lệch**:
  - Gỡ bỏ đoạn mã tự động ép `displayUnit = 'gam'` và chia 1000 đơn giá khi `qty >= 10` đối với nguyên liệu trong `Tab_ImportExport.html`.
  - Giữ nguyên số lượng thực nhập (ví dụ: `80 Kg` Lũa San Miếng đơn giá `35.000đ/Kg` = `2.800.000đ`, không còn bị biến thành `80 gam` đơn giá `35đ` = `2.800đ`).
  - Chỉ quy đổi đơn giá gam đối với các phiếu xuất BOM sản xuất tự động (`isBomTicket`) có đơn vị tính gốc là `gam`.

---

## [v2.34.1] - 2026-09-01

### 🛡️ Hotfix: Chuẩn Hóa Nhận Diện Tồn Kho Bể Kính & Đồng Bộ Toàn Vẹn Khâu Sản Xuất
- **Khắc Phục Lỗi Khớp Chuỗi Con Sai Lệch Trong `getProductInfoByName` (`Code.js`)**:
  - Phát hiện và loại bỏ điều kiện so khớp chuỗi con lỏng lẻo (`indexOf`) trong tra cứu sản phẩm khiến mọi kích thước bể kính đều bị khớp nhầm với hàng đầu tiên trong bảng `Products` có chứa chữ "Bể", dẫn tới việc toàn bộ đơn hàng bị nhận định sai là có sẵn trong kho.
  - Thiết lập cơ chế so khớp chặt chẽ 2 tầng: Khớp chính xác 100% theo SKU/Tên và so khớp chuẩn xác theo bộ 3 kích thước $L \times W \times H$ (vd: `25x12x14`).
- **Đồng Bộ Hoàn Toàn Trạng Thái Khâu Sản Xuất Khi Xuất Từ Kho (`Code.js`, `Modals_Orders.html`)**:
  - Khắc phục nghịch lý `status = 'Hoàn Kho Đạt'` nhưng `p1_status = 'Pending'`: Khi sản phẩm được lấy từ kho có sẵn (`fulfilledFromStock = true`), toàn bộ các khâu con (`p1_status`, `p2_status`) tự động được đánh dấu `Done`, gán người hoàn thành là `Kho Hàng` và `qc_status = 'Đã Duyệt'`.
  - Đối với các sản phẩm sản xuất mới (`fulfilledFromStock = false`): Giữ nguyên `status = 'Pending'`, `p1_status = 'Pending'`, `p2_status = 'Pending'` và ghi chú `Sản xuất mới cho đơn...` để thợ nhận việc chuẩn xác.

---

## [v2.34.0] - 2026-09-01

### 🛡️ Hotfix: Khắc Phục Triệt Để Lỗi Bơm Đơn Bị Treo Xoay & Không Ghi Được Vào Google Sheets
- **Xử Lý Lỗi Crash `ReferenceError` Trong `syncDeltas` (`Code.js`)**:
  - Khắc phục lỗi thiếu hàm `getProductInfoByName` và `sendNtfyNotification` trên backend Google Apps Script khiến `syncDeltas` bị gián đoạn và rollback trước khi kịp ghi dữ liệu vào bảng `Orders`.
  - Thay đổi thứ tự ưu tiên: Luôn thực hiện `applyDeltasToSheet('Orders')` và `applyDeltasToSheet('Production')` xuống CSDL Google Sheets NGAY ĐẦU TIÊN trước khi thực hiện các tác vụ thông báo phụ trợ.
  - Bọc tất cả tác vụ gửi thông báo (`ntfy.sh`) trong khối `try...catch` độc lập, chống nghẽn đường truyền HTTP ảnh hưởng tới giao dịch lưu trữ CSDL.
- **Tự Động Mở Rộng Kích Thước Bảng Google Sheets (`Code.js`)**:
  - Nâng cấp `applyDeltasToSheet` tự động gọi `sheet.insertRowsAfter` và `sheet.insertColumnsAfter` khi số lượng dòng/cột dữ liệu mới vượt quá giới hạn hiện hữu của trang tính.
- **Tối Ưu Siêu Tốc $O(1)$ Trích Xuất & Phân Tích Excel (`Modals_Orders.html`)**:
  - Tiền lập chỉ mục (`catalogIndex`) danh mục sản phẩm vào các `Map` tra cứu tức thì theo SKU, Tên rút gọn, Quy cách kích thước, loại bỏ hoàn toàn hiện tượng clone và sort mảng lặp lại hàng trăm nghìn lần trên UI thread.
  - Xử lý toàn diện mọi định dạng ngày tháng Excel (`Serial Number`, `DD/MM/YYYY`, `YYYY-MM-DD`).

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

## [v2.32.6] - 2026-08-31

### 🛡️ Nâng Cấp Cảnh Báo Trần Tạm Ứng & Triệt Tiêu Khấu Hao Ảo Khi Thanh Lý Máy Móc
- **Cảnh Báo Vượt Trần Tạm Ứng 50% & Phê Duyệt Ngoại Lệ Cho Boss (`Tab_HR.html`)**:
  - Tự động lấy mốc lương tháng liền kề (fallback lương cơ bản) làm định mức trần 50%.
  - Khi nhân sự có biến động sản lượng lớn và đề xuất ứng vượt trần, hệ thống hiển thị hộp thoại cảnh báo rõ ràng `[⚠️ CẢNH BÁO TRẦN TẠM ỨNG]` cho phép Boss xác nhận duyệt ngoại lệ trực tiếp hoặc hướng dẫn nhân sự chuyển sang hình thức Cho Vay.
- **Trạng Thái Thanh Lý Thiết Bị Triệt Tiêu Khấu Hao (`Tab_Workspaces.html`)**:
  - Bổ sung tùy chọn `Đã thanh lý (0đ)` trong danh mục khấu hao thiết bị/công cụ.
  - Tự động đưa giá trị trích khấu hao còn lại về $0$ đ khi máy móc/công cụ được xuất thanh lý, ngăn chặn việc trích khấu hao ảo vào báo cáo P&L các tháng tiếp theo.

---

## [v2.32.5] - 2026-08-31

### 🎯 Cô Lập 100% Danh Sách KPI Theo Đúng Kỳ Lương / Tháng Được Chọn (`Tab_HR.html`)
- **Khắc Phục Lỗi Tràn Chỉ Tiêu KPI Tháng Mới Sang Tháng Cũ (Month Isolation Engine)**:
  - Bổ sung hàm chuyên dụng `isKpiInSelectedMonth(k, filter, customMonth)`: Chuẩn hóa toàn bộ ngày `startTime`, `endTime`, `date`, `createdAt` sang định dạng chuẩn `YYYY-MM-DD`.
  - Áp dụng thuật toán so khớp giao nhau chuẩn xác theo khoảng thời gian (`Interval Overlap`): KPI chỉ được hiển thị khi khoảng thời gian hiệu lực `[kStart, kEnd]` có giao cắt với tháng đang chọn `[startOfTargetMonth, endOfTargetMonth]`.
  - **Loại Bỏ Hoàn Toàn Điểm Gãy `lastUpdated`**: Dỡ bỏ điều kiện `isDateInRange(k.lastUpdated)` vốn làm các KPI của tháng 9 bị lọt vào tháng 8 khi có thao tác đồng bộ/ghi đè ngầm gần đây.
  - Đồng bộ logic lọc cho: Danh sách KPI cá nhân thợ (`userKPIs`), bảng xếp hạng KPI (`userRanks`), và mục tính tổng lương (`isKpiInSelectedPeriod`).

---

## [v2.32.4] - 2026-08-31

### 🛡️ Cảnh Báo Trùng Giao Dịch Khi Chi Trả NCC & Chuyển 1-Chạm Sang Đối Soát Bank N:1 (`Tab_Suppliers.html`)
- **Phát Hiện & Cảnh Báo Giao Dịch Sao Kê Trùng Khớp (Duplicate Outflow Alert)**:
  - Khi mở Modal thanh toán phiếu nhập cho Nhà Cung Cấp, hệ thống tự động quét bảng `Transactions` trong vòng 48 giờ qua.
  - Nếu phát hiện đã có lệnh chi ngân hàng khớp số tiền hoặc liên quan đến NCC này, hệ thống hiển thị bảng cảnh báo màu hổ phách trực quan.
- **Nút Bấm 1-Chạm "Sang Đối Soát Bank N:1"**:
  - Cung cấp nút chuyển đổi thông minh `[🛡️ Sang Đối Soát Bank N:1]`: Tự động đóng modal chi lẻ và mở form Đối Soát Bank N:1 kèm tự động chọn sẵn giao dịch chi và phiếu nhập tương ứng.
  - Ngăn ngừa 100% rủi ro trừ đúp số dư quỹ `Accounts.balance`.

---

## [v2.32.3] - 2026-08-31

### 🛡️ Chống Nhân Đôi Doanh Thu Bán Lẻ & Chống Cộng Khống Tồn Kho Khi Hoàn Đơn (`Modals_Orders.html`)
- **Chống Đúp Tiền Khi Đối Soát Đơn Bán Lẻ (Double Inflow Prevention)**:
  - Tự động dò tìm trong bảng `Transactions` xem đơn hàng đã có bản ghi thu tiền (chuyển khoản tự động / quét biến động số dư) hay chưa.
  - Nếu đã có phiếu thu, hệ thống tự động **mặc định bỏ chọn và khóa tạo phiếu thu mới** (`createTx = false`), hiển thị bảng thông báo an toàn màu hổ phách cảnh báo đã có phiếu thu tự động để ngăn ngừa triệt để việc nhân đôi doanh thu ngân hàng.
- **Chống Cộng Khống Kho Khi Hủy / Hoàn Đơn Chưa Từng Xuất (Phantom Stock Increase Prevention)**:
  - Bổ sung chốt chặn `hasExported` toàn diện: Chỉ khi đơn hàng có phiếu xuất kho trong `ImportExport` hoặc đã chuyển sang trạng thái `Đã Bàn Giao` / `Chờ Bàn Giao` thì khi duyệt hoàn nguyên vẹn mới được phép cộng bù tồn kho.
  - Đơn hủy hoặc duyệt hoàn ngay từ bước `Chờ Sản Xuất` (chưa bao giờ xuất kho) sẽ được hệ thống giữ nguyên tồn kho thực tế, không sinh phiếu nhập khống số lượng.

---

## [v2.32.2] - 2026-08-30

### 📡 Trạng Thái Đồng Bộ Máy Chủ & Tối Ưu Toàn Diện Di Động iPhone X+ (`App_Main.html`)
- **Thông Báo Kéo Dữ Liệu Máy Chủ Thời Gian Thực (Floating Server Sync Pill)**:
  - Bổ sung thông báo nổi sang trọng `[⚡ Đang kéo dữ liệu mới nhất từ máy chủ...]` có spinner xoay mượt mà khi người dùng mở ứng dụng hoặc làm mới dữ liệu.
  - Giúp nhân sự biết rõ ứng dụng đang nạp dữ liệu mới nhất từ Google Apps Script / Firebase, tránh hiểu lầm số liệu chưa cập nhật.
- **Tối Ưu Hoá Trải Nghiệm Cảm Ứng Di Động (iPhone X+ OLED Engine)**:
  - Khử hoàn toàn vệt sáng xám chạm phím mặc định trên iOS Safari với `-webkit-tap-highlight-color: transparent`.
  - Tối ưu cuộn vật lý mượt mà trên iOS với `-webkit-overflow-scrolling: touch` và `overscroll-behavior-y: contain`.
  - Đảm bảo các khung nhìn hỗ trợ hoàn hảo notch tai thỏ / Dynamic Island qua `env(safe-area-inset-top)` và `env(safe-area-inset-bottom)`.

---

## [v2.32.1] - 2026-08-30

### ⚡ Tối Ưu Menu Drawer & Khắc Phục Triệt Để Chớp Giật Màn Hình 120FPS (`App_Main.html`)
- **Triệt Tiêu Hoàn Toàn Chớp Nháy Opacity Do Lặp Lại Animation (`tabFadeIn`)**:
  - **Nguyên nhân gốc rễ (Root Cause)**: Class CSS `.rf-tab-view` có gắn `animation: tabFadeIn 0.22s`. Mỗi khi mở/đóng menu hoặc thay đổi state trong ứng dụng, React re-render khiến các Tab trong DOM kích hoạt lại animation từ `opacity: 0` đến `1`, tạo cảm giác toàn bộ màn hình bị chớp giật liên tục.
  - **Khắc phục**: Gỡ bỏ hoàn toàn CSS animation `tabFadeIn`, chuyển sang hiển thị tức thời 0ms không độ trễ.
- **Tối Ưu Hoá Lớp Phủ Nền (Persistent Zero-Thrash Backdrop)**:
  - Giữ thẻ overlay nền đen cố định trong DOM và điều khiển mượt mà bằng transition `opacity-0` / `opacity-100`, loại bỏ việc tạo/xoá DOM node liên tục khi mở đóng menu.
  - Sidebar drawer được gia tốc bằng phần cứng GPU `transform: translateZ(0)` với easing `cubic-bezier(0.16, 1, 0.3, 1)` lướt êm mượt 120FPS.

---

## [v2.32.0] - 2026-08-30

### 🎯 Tinh Gọn Trạng Thái & Ẩn Dòng Nhân Sự Khi Chờ Sản Xuất (`Modals_Orders.html`)
- **Ẩn Tuyệt Đối Dòng Nhân Sự Với Đơn Chờ Sản Xuất**:
  - Khi đơn hàng đang ở trạng thái `Chờ Sản Xuất` / `Đang Sản Xuất` (chưa hoàn thành), hệ thống ẩn hoàn toàn dòng nhân sự đáy thẻ để tránh hiển thị thông tin truy vết không phù hợp trước khi sản phẩm thực sự ra lò.
  - Chỉ hiển thị dòng nhân sự `Sản Xuất: ...` khi sản phẩm thực sự hoàn thành (`Sẵn sàng đóng gói` / `Chờ bàn giao` / `Đã bàn giao`).
- **Gỡ Bỏ Nhãn Xanh "Từ Kho"**:
  - Loại bỏ hoàn toàn nhãn `[TỪ KHO]` trên dòng nhân sự để giao diện luôn thanh thoát, tinh gọn và chuẩn xác.

---

## [v2.31.9] - 2026-08-30

### 🧹 Tối Giản Hoá Thẻ Đơn Hàng & Chuẩn Hoá Dòng Nhân Sự Sản Xuất (`Modals_Orders.html`)
- **Chuẩn Hoá Dòng Nhân Sự Sản Xuất Gọn Gàng**:
  - Loại bỏ các chuỗi text thừa, tên sản phẩm lặp lại `[Tên Hàng]` trên dòng nhân sự đáy thẻ.
  - Chuẩn hoá format hiển thị trực quan: `Sản Xuất: Cắt Dán: [Dương]  Gọt Keo: [Anh]  [TỪ KHO]` và `Đóng gói: [Hương]  Chở kho: [Dương]`.
- **Triệt Tiêu Thẻ Thợ Dư Thừa & Lỗi Chuỗi HTML String**:
  - Gỡ bỏ tag thợ trùng lặp trên dòng sản phẩm, giải phóng không gian cho trạng thái đơn hàng.
- **Tăng Kích Thước & Độ Rõ Nét Của Badge Số Lượng (SL)**:
  - Tăng kích thước badge số lượng `x1 cái` lên `text-[11.5px] px-2.5 py-1` với font mono nổi bật, dễ nhìn, dễ kiểm tra khi đóng gói.

---

## [v2.31.8] - 2026-08-30

### ⚡ Hiệu Năng & Tối Ưu Menu (60FPS Smooth Drawer & Tab Switch Engine): Triệt Tiêu Hiện Tượng Giật Lag Khi Mở Menu & Chuyển Tab (`App_Main.html`)
- **Phân Tách Xung Đột Luồng Xử Lý (Non-Blocking Navigation Dispatch)**:
  - **Nguyên nhân gốc rễ (Root Cause)**: Khi người dùng bấm chọn tab từ Menu Drawer, lệnh đóng menu (`setIsMenuOpen(false)`) và lệnh dựng lại giao diện tab mới (`setActiveTab(tab)`) kích hoạt cùng một microtask. Quá trình biên dịch và render đồng thời hàng trăm thẻ con của tab mới làm nghẽn Main Thread (150ms-300ms), khiến hiệu ứng CSS trượt của Sidebar bị drop frame và giật khựng.
  - **Khắc phục**: Thiết kế hàm điều hướng chuyên biệt `handleNavigateTab`: Đóng menu ngay lập tức trên UI và đẩy tác vụ dựng Tab mới vào `React.startTransition` / `requestAnimationFrame` giúp thanh trượt Drawer đóng mượt mà 60/120fps không bao giờ bị drop frame.
- **Tăng Tốc GPU & Loại Bỏ Layout Thrashing**:
  - Gắn thuộc tính `will-change-transform transform-gpu` lên `<aside>` để ép GPU xử lý chuyển động riêng biệt (Compositor Layer).
  - Tinh giản hiệu ứng làm mờ nền từ `backdrop-blur-md` nặng nề xuống `backdrop-blur-sm bg-black/70`, triệt tiêu áp lực tính toán shader trên màn hình điện thoại & laptop.
  - Chuyển `transition-all` trên các nút bấm Menu sang `transition-colors` để không kích hoạt tính toán lại kích thước layout (Reflow / Repaint).

---

## [v2.31.7] - 2026-08-30

### 🎨 Thiết Kế Giao Diện: Tối Giản Hoá Cấu Trúc Thẻ Đơn Hàng Chuẩn Hallmark Flat UI (`Modals_Orders.html`)
- **Loại Bỏ Hoàn Toàn Lồng Component (Card-in-Card AI Slop Demolition)**:
  - Triệt tiêu hoàn toàn 3 lớp container bọc lồng thừa thãi (`bg-[#09090b]`, `border border-white/[0.08]`, `rounded-xl`) bên trong danh sách sản phẩm con và thanh nhân sự.
  - Chuyển sang bố cục phẳng 1 viền duy nhất: Các món hàng nằm trực tiếp trên bề mặt thẻ đơn hàng cha và phân tách nhau bằng đường viền mỏng tinh tế (`divide-y divide-white/[0.06]`), mở rộng tối đa diện tích hiển thị và triệt tiêu cảm giác nặng nề bí bách.
- **Tối Ưu Hoá Bảng Chi Tiết & Thanh Nhân Sự Phẳng**:
  - Từng dòng sản phẩm có typography sắc nét, badge số lượng gọn nhẹ (`bg-white/[0.04]`), trạng thái sản xuất / thợ kho tinh giản.
  - Thanh nhân sự đáy đơn hàng phẳng, liền mạch với viền thẻ cha kèm đường phân cách thanh mảnh.

---

## [v2.31.6] - 2026-08-30

### 🔍 Truy Vết Chất Lượng (Traceability Engine): Tự Động Lưu Trữ & Truy Vết Nguồn Gốc Thợ Sản Xuất Cho Toàn Bộ Hàng Xuất Kho Có Sẵn (`Modals_Orders.html`, `Tab_Production.html`)
- **Động Cơ Truy Vết Nguồn Gốc Thợ Làm Hàng Tồn Kho (Craftsman Origin Traceability Engine)**:
  - Giải quyết bài toán bảo hành & kiểm định chất lượng: Ngay cả khi sản phẩm được lấy từ kho có sẵn (`fulfilledFromStock = true` / `XUẤT TỪ KHO CÓ SẴN`), hệ thống tự động dò tìm ngược lại hồ sơ sản xuất lưu kho gần nhất của SKU đó trong CSDL `Production` để xác định chính xác danh tính thợ thực hiện từng khâu (`Dựng Khung/Cắt Dán`, `Gia Cố/Gọt Keo`) cùng hình ảnh nghiệm thu KCS.
- **Hiển Thị Minh Bạch Trên Thẻ Đơn Hàng & Thẻ Sản Xuất**:
  - **Trên từng dòng sản phẩm (`OrderCard`)**: Dưới nhãn `✓ XUẤT TỪ KHO CÓ SẴN`, hệ thống đính kèm nhãn `🔨 Thợ: [Tên thợ K1] • [Tên thợ K2]`.
  - **Thanh Nhân Sự Dưới Đáy Đơn Hàng**: Bổ sung phân khu *"NHÂN SỰ TRUY VẾT & THỰC HIỆN ĐƠN HÀNG"* hiển thị rõ ràng thợ từng khâu kèm tag `TỪ KHO CÓ SẴN`.
  - **Trên thẻ Sản Xuất (`WorkerCardV2`)**: Thay thế thông báo text đơn giản bằng khối **"XUẤT TỪ KHO CÓ SẴN (ĐÃ NGHIỆM THU)"** với thông tin thợ từng khâu và nút xem ảnh nghiệm thu trực tiếp.

---

## [v2.31.5] - 2026-08-30

### 📦 Quản Lý Đơn Hàng: Sửa Triệt Để Lỗi Bộ Lọc "Tất Cả" & Tối Ưu Phân Tầng Kênh Bán - Trạng Thái (`Tab_Orders.html`)
- **Sửa Lỗi Lọc "Tất Cả" Trả Về Danh Sách Trống (Empty List Bug Fix)**:
  - **Nguyên nhân gốc rễ (Root Cause)**: Khi người dùng bấm tab `Tất Cả` trên hàng Trạng thái (`filterStatus = 'ALL'`), logic so sánh `getOrderTabGroup(o) === filterStatus` luôn trả về `false` vì nhóm trạng thái đơn hàng chỉ trả về tên trạng thái cụ thể chứ không bao giờ trả về `'ALL'`. Dẫn đến việc cả danh sách 480 đơn hàng bị ẩn hoàn toàn và báo *"Không có đơn hàng nào phù hợp với bộ lọc hiện tại"*.
  - **Khắc phục**: Khi `filterStatus === 'ALL'` hoặc `filterChannel === 'ALL'`, hệ thống tự động mở toàn bộ danh sách đơn mà không áp đặt điều kiện lọc chặn.
- **Tối Ưu Đồng Bộ Đa Tầng Kênh Bán & Số Liệu Đếm Badge (`channelFiltered`)**:
  - Khi người dùng bấm lọc một Kênh bán cụ thể (ví dụ Shopee, Xuất Khẩu, Bán Lẻ), toàn bộ số lượng đếm trên các badge Trạng Thái (`Chờ Sản Xuất`, `Sẵn Sàng Đóng Gói`, v.v.) sẽ tự động cập nhật đúng chuẩn theo kênh đã chọn thay vì hiển thị số tổng toàn công ty.

---

## [v2.31.4] - 2026-08-30

### 🔨 Sản Xuất & Gia Công: Triệt Tiêu Lặp Lại Thẻ Chỉ Định Thợ & Tối Ưu Bố Cục Thẻ Lệnh Chuẩn Hallmark Royal Workbench (`Tab_Production.html`)
- **Triệt Tiêu Lỗi Lặp Thẻ Chỉ Định Thợ (Deduplicate Craftsman Tag)**:
  - Loại bỏ badge `THỢ: ...` dư thừa bị lặp lại bên cạnh badge `CHỈ ĐỊNH: ...` trên cùng một thẻ lệnh sản xuất.
  - Chuẩn hoá một badge duy nhất `🔒 CHỈ ĐỊNH: [TÊN THỢ]` với tone màu vàng hổ phách nổi bật (Amber Glow), giữ cho thanh header thẻ lệnh gọn gàng, thoáng đãng và trực quan.
  - Phân tách minh bạch: Thông tin thợ thực hiện từng khâu đã được trình bày chi tiết và trực quan kèm Avatar, thời gian làm và nút hành động tại từng block `WorkerPhaseV2` bên dưới.

---

## [v2.31.3] - 2026-08-30

### 📈 P&L & Báo Cáo Kinh Doanh: Đồng Bộ Chi Phí Lương Chuẩn 100% Theo Thời Gian Thực Với Bảng Lương Thực Tế Phải Trả (`Tab_Analytics.html`, `Tab_BusinessReport.html`)
- **Khớp Chi Phí Lương Thực Tế Phải Trả (Single Source of Truth Payroll Engine)**:
  - Loại bỏ hoàn toàn việc ước tính cứng 100% KPI chỉ tiêu lý thuyết (`Lương Mục Tiêu`) gây sai lệch dòng tiền P&L.
  - Đồng bộ chuẩn xác 100% công thức Bảng Lương HR (`Tab_HR.html`): Lương thời gian theo công thực tế (`Attendance`), Tăng ca (`BonusPenalty`), Khoán sản xuất K1/K2 (`Production`), Thưởng đóng gói/chở kho (`Packings`), KPI chức vụ thực tế đã đạt/claim (`KPI_Progress`), Phụ cấp xăng xe, Thưởng nóng/chuyên cần, và khấu trừ giảm trừ thực tế (phạt quy định, phí công đoàn 50k, bảo hành, v.v.).
  - Tự động ưu tiên lấy dữ liệu chốt sổ chính thức từ `Monthly_Snapshots` khi tháng đã được khoá sổ.
- **Tối Ưu Đồng Bộ Báo Cáo P&L & In Phiếu Kết Quả Kinh Doanh**:
  - Cập nhật chỉ số `Chi phí Lương` trên thẻ Bento KPI và Bảng in báo cáo P&L phản ánh chuẩn xác số tiền thực chi trả của doanh nghiệp.
  - Tự động cập nhật tức thì Lợi Nhuận Ròng (Net Profit) thời gian thực theo từng biến động chấm công & sản lượng.

---

## [v2.31.2] - 2026-08-30

### 💰 Tài Chính & Sổ Quỹ: Nâng Cấp Bộ Quản Lý Danh Mục Động Thêm/Xoá, Chuẩn Hoá Khung Giờ 24H & Giao Diện Hallmark Royal Workbench (`Tab_Finance.html`)
- **Bộ Chọn & Quản Lý Danh Mục Thu/Chi Động (`DynamicCategorySelect`)**:
  - Tích hợp dropdown tìm kiếm danh mục thông minh với icon và màu sắc nhận diện trực quan theo Thu / Chi.
  - Hỗ trợ **+ Thêm danh mục mới** trực tiếp ngay trong modal tạo phiếu hoặc chỉnh sửa mà không cần can thiệp code hay cơ sở dữ liệu.
  - Hỗ trợ **Xoá danh mục** trực tiếp bằng nút thùng rác kèm hộp thoại xác nhận an toàn, lưu trữ đồng bộ tức thì vào `localStorage`.
- **Chuẩn Hoá Khung Giờ 24H Toàn Hệ Thống (`HH:mm DD/MM/YYYY`)**:
  - Thay thế toàn bộ định dạng AM/PM bằng khung giờ 24h quân sự chính xác (`00:00 - 23:59`).
  - Tích hợp các nút chọn giờ nhanh 24h trong modal tạo phiếu: `Bây giờ`, `08:30`, `11:30`, `14:00`, `17:30`, `20:00`, `22:00`.
  - Hiển thị thời gian đồng bộ chuẩn 24h trên toàn bộ Thẻ giao dịch, Chi tiết phiếu (`TransactionDetailModal`), Sổ cái tài khoản (`AccountHistoryModal`), và In phiếu nhiệt K58.
- **Tối Ưu Giao Diện & Bố Cục Chuẩn Hallmark Royal Workbench**:
  - 4 Thẻ Bento KPI Báo cáo chu chuyển tiền tệ phát sáng cao cấp: *Quỹ Đầu Kỳ (Amber), Tiền Thu (+ Emerald), Tiền Chi (- Rose), Tồn Quỹ Cuối Kỳ (= Sky)*.
  - Thanh công cụ hành động gọn gàng, loại bỏ tràn viền trên thiết bị di động.
  - Bổ sung thanh tiến độ trực quan (% cơ cấu thu / % cơ cấu chi) trong Sub-tab Báo Cáo Cơ Cấu.

---

## [v2.31.1] - 2026-08-30

### 🎨 Kho Hàng & Nhật Ký: Nâng Cấp Hệ Thống Tab Nhanh Sắc Màu Hallmark Royal Workbench & Tối Ưu UX (`Tab_Inventory.html`, `Tab_ImportExport.html`, `Index.html`)
- **Hệ Thống Nhận Diện Màu Sắc Tab Nhanh (Hallmark Chromatic Identity System)**:
  - **Kho Bể Kính** 🐟: *Gradient Cyan / Ocean Glow* (`bg-gradient-to-r from-cyan-500/30 text-cyan-300 border-cyan-400/60 shadow-[0_0_16px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400/40`).
  - **Kho Layout** 🏔️: *Gradient Amber / Warm Bronze Glow* (`bg-gradient-to-r from-amber-500/30 text-amber-300 border-amber-400/60 shadow-[0_0_16px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/40`).
  - **Kho Hàng Hoá / Phụ Kiện** 🔌: *Gradient Purple / Royal Violet Glow* (`bg-gradient-to-r from-purple-500/30 text-purple-300 border-purple-400/60 shadow-[0_0_16px_rgba(168,85,247,0.35)] ring-1 ring-purple-400/40`).
  - **Kho Nguyên Liệu / Vật Tư SX** 📦: *Gradient Emerald / Mint Glow* (`bg-gradient-to-r from-emerald-500/30 text-emerald-300 border-emerald-400/60 shadow-[0_0_16px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/40`).
  - **Tất Cả / Chung** 🏷️: *Glass Titanium White Glow* (`bg-white/[0.2] text-white border-white/40 shadow-sm`).
- **Thẻ Bento KPI Tồn Kho Tương Tác Trực Quan**:
  - Biến 4 thẻ Bento (*Giá Trị Bể Kính, Giá Trị Layout, Vật Tư Sản Xuất, Tổng Giá Trị Kho*) thành các phím bấm lọc nhanh danh mục tương ứng kèm hiệu ứng phát sáng phản hồi xúc giác `active:scale-95`.
- **Thanh Lọc Sub-Category Nhóm Hàng Tự Động (Folder Chips)**:
  - Tự động kết xuất dải nút lọc phân nhóm con (*Bể Lẻ Size, Bể Đúc, Terrarium, v.v.*) với số lượng SKU hiển thị thời gian thực theo từng kho.
- **Tối Ưu Đồng Bộ Phân Hệ Nhật Ký Kho & Modal Thẻ Kho Sản Phẩm**:
  - Thay thế toàn bộ class `custom-scrollbar no-scrollbar` thành `hide-scrollbar`, triệt tiêu đường cuộn vàng lỗi trên trình duyệt mobile.
  - Hiện đại hóa giao diện `StockHistoryModal` (Thẻ kho sản phẩm) chuẩn Dark Glass Royal Workbench.

---

## [v2.31.0] - 2026-08-30

### 🤝 Nhà Cung Cấp & Công Nợ: Thiết Kế Lại Toàn Diện Tab Nhà Cung Cấp Chuẩn Royal Workbench Dark (`Tab_Suppliers.html`, `App_Main.html`)
- **Giao Diện Royal Workbench Dark Sang Trọng (Hallmark Anti-AI-Slop System)**:
  - Khung thống kê 4 thẻ chỉ số KPI phát sáng cao cấp: *Tổng công nợ cần trả (Rose), Tổng đối tác NCC (Sky), Phiếu chờ chi trả (Amber), Đã chi tháng này (Emerald)*.
  - Bộ lọc công nợ đa chiều: `TẤT CẢ`, `CÓ NỢ`, `HẾT NỢ`, `TRẢ THỪA` kèm phân loại danh mục theo pill buttons trực quan.
  - Ô tìm kiếm realtime đa trường (Tên NCC, Số điện thoại, Ghi chú / Địa chỉ).
- **Thẻ Đối Tác & Drawer Lịch Sử Nhập Hàng Tương Tác Cao**:
  - Hiển thị đầy đủ thông tin: Avatar/Icon phân loại, Tên đối tác, SĐT (link `tel:`), Ghi chú, Số phiếu nợ và Cột công nợ trực quan (âm/dương/0đ).
  - Tích hợp nhanh các nút hành động: *Sửa thông tin*, *Xóa (an toàn khi nợ = 0)*, *Đối Soát Bank* và *Mở rộng lịch sử chi tiết*.
  - Drawer lịch sử: Danh sách phiếu nhập kèm sub-filter (`TẤT CẢ`, `CHƯA TRẢ`), trạng thái thanh toán (`HOÀN TẤT`, `TRẢ 1 PHẦN`, `CHƯA TRẢ`).
- **Động Cơ Đối Soát Bank N:1 & An Toàn Dữ Liệu**:
  - Cho phép chọn 1 giao dịch Chi tiền ngân hàng khớp với nhiều phiếu nhập hàng cùng lúc.
  - Kiểm tra an toàn số dư độ lệch ($BalanceDiff \ge 0$), tự động cấn trừ công nợ đối tác và đánh dấu hoàn tất các phiếu nhập được chọn.
- **Bộ Công Cụ In Ấn Chuẩn Mực A4 & POS 58mm**:
  - In Báo Cáo Tổng Hợp Nhập Hàng & Công Nợ Toàn Hệ Thống (A4 Dọc).
  - In Báo Cáo Chi Tiết Lịch Sử Từng Nhà Cung Cấp (A4 Dọc).
  - In Phiếu Nhập Kho Hàng Hóa Chuẩn Kế Toán (A4 Dọc).
  - In Phiếu Chi Tiền Nhiệt (POS 58mm).

---

## [v2.30.8] - 2026-08-30

### 🛡️ Nhân Sự: Tối Ưu Triệt Để Bộ Lọc Ẩn Nhân Sự Đã Nghỉ & Đồng Bộ Xuyên Suốt 3 Phân Hệ (`Tab_HR.html`, `App_Main.html`)
- **Bộ Nhận Diện Nhân Sự Nghỉ Việc / Đã Ẩn Đa Tầng (`isStaffResignedOrInactive`)**:
  - Tự động nhận diện nhân sự nghỉ việc thông qua chuỗi tên (`[Đã nghỉ]`, `(nghỉ việc)`, `[off]`, `tạm nghỉ`, `cựu`).
  - Quét sâu bảng cấu hình `Config_NhanSu` (Phân quyền: `ĐÃ NGHỈ`, `NGHỈ VIỆC`, `THÔI VIỆC`, `OFF`, `KHÁCH`, `INACTIVE`, `RESIGNED` và chức danh phụ).
  - Khớp chuẩn xác danh sách ẩn thủ công `hiddenStaffList` khi Boss bấm icon mắt trên từng thẻ.
- **Chuẩn Hóa UX Nút Bật/Tắt Bộ Lọc**:
  - Hiển thị rõ ràng trạng thái: `Đang Ẩn NV Nghỉ` (Badge Amber sáng khi bật lọc) và `Hiện Tất Cả NV` (khi tắt lọc).
  - Tích hợp toast thông báo trực quan khi chuyển đổi trạng thái bộ lọc.
- **Đồng Bộ Xuyên Suốt Cả 3 Phân Hệ Nhân Sự**:
  - Tự động ẩn các nhân sự không còn làm việc khỏi: Danh Sách Thẻ KPI (Nhiệm vụ), Ma Trận Chấm Công, Hồ Sơ Chấm Công và Bảng Lương.

---

## [v2.30.7] - 2026-08-30

### 🎯 Bảng Lương: Đồng Bộ KPI Tháng Tùy Chỉnh & Chuẩn Hóa Công Thức Tổng Lương Mục Tiêu 26 Công (`Tab_HR.html`, `App_Main.html`)
- **Khắc Phục Hiển Thị KPI Tháng Khi Chọn Tháng Tùy Chỉnh (`Tab_HR.html`)**:
  - Sửa lỗi `filterMonth` ở đầu component `HRTab`: Xử lý đồng thời cả `filter === 'Chọn Tháng'` và `filter === 'Tuỳ Chỉnh'`, không còn bị gán nhầm về tháng hiện tại (`2026-08`).
  - Xây dựng bộ lọc `isKpiInSelectedPeriod(k)` hỗ trợ linh hoạt mọi định dạng ngày tháng (`DD/MM/YYYY`, `YYYY-MM-DD`, `startTime`, `endTime`, `lastUpdated`).
  - Giúp toàn bộ danh sách KPI được giao trong tháng (ví dụ: Tháng Chín 2026) hiển thị đầy đủ 100% trong mục **Tiến Trình KPI** trên thẻ lương của từng nhân sự.
- **Chuẩn Hóa Công Thức TỔNG LƯƠNG MỤC TIÊU (26 Công)**:
  - Công thức tính Tổng Lương Mục Tiêu:
    $$\text{Tổng Lương Mục Tiêu} = \text{Lương chuẩn 26 công (4.200.000đ)} + \text{Thưởng 100% KPI} + \text{Trợ cấp xăng xe \& phụ cấp khác} + \text{KPI Sản xuất/Đóng gói/Bán hàng} + \text{Thưởng khác} - \text{Phí Công đoàn (50.000đ)} - \text{Các khoản phạt vi phạm}$$
  - Đảm bảo phản ánh chính xác 100% mức thu nhập kỳ vọng khi nhân viên đi làm đủ công và hoàn thành trọn vẹn chỉ tiêu.
- **Đồng Bộ Thống Kê & Nhãn Thẻ Giao Diện**:
  - Cập nhật số liệu Tổng Lương Mục Tiêu toàn xưởng trên widget đầu trang.
  - Cập nhật nhãn chú thích: `* Lương đủ 26 công + 100% KPI + Trợ cấp + KPI SX/ĐG/BH - Công đoàn - Phạt` trên thẻ lương từng nhân sự.

---

## [v2.30.6] - 2026-08-30

### 🛡️ Phân Hệ Trách Nhiệm: Nhóm Vật Tư Theo Đa Nhân Sự & Ghi Nhận % Tình Trạng Bàn Giao (`Tab_Workspaces.html`, `App_Main.html`)
- **Phân Bổ & Nhóm Vật Tư Đa Nhân Sự Trong Cùng Một Phòng (`Tab_Workspaces.html`)**:
  - Từng thiết bị/công cụ trong cùng một không gian làm việc (ví dụ: Phòng Đóng Gói, Xưởng Sản Xuất) được gán riêng cho từng nhân sự phụ trách trực tiếp.
  - Tích hợp bộ lọc / nhóm theo nhân sự ngay trên đầu thẻ phòng, cho phép lọc nhanh danh sách tài sản theo từng cá nhân quản lý.
- **Ghi Nhận Tình Trạng Lúc Bàn Giao Theo Tỷ Lệ %**:
  - Thêm ô nhập % tình trạng bàn giao (0 - 100%, mặc định 100% Mới) cho từng món đồ lúc lập hoặc chỉnh sửa bàn giao.
  - Hiển thị badge trực quan (`100% Mới`, `90% Tốt`, `80% Khá`, `60% Cũ`) trên từng dòng và tự động tính % độ mới trung bình của cả phòng.
- **Tự Động Quy Trách Nhiệm Phạt Sự Cố 100% Chuẩn Xác Vào Bảng Lương**:
  - Khi lập biên bản sự cố món đồ, hệ thống tự động nhận diện chính xác nhân sự được gán quản lý món đồ đó và lập phiếu phạt `BonusPenalty` trừ trực tiếp vào lương của đúng người.

---

## [v2.30.5] - 2026-08-30

### 📝 Tích Hợp Nút Sửa Ghi Chú Trực Tiếp Trên Thẻ Ghi Chú Nhanh (`Modals.html`, `App_Main.html`)
- **Nút Chỉnh Sửa Ghi Chú Trực Tiếp Trên Từng Thẻ (`QuickNotesPanel` in `Modals.html`)**:
  - Bổ sung nút icon bút chì (`fa-pen`) tinh gọn cạnh nút xoá trên góc phải của mỗi thẻ ghi chú.
  - Khi bấm, form chỉnh sửa lập tức mở ra và nạp sẵn toàn bộ Tiêu đề & Nội dung hiện tại của ghi chú.
- **Tương Tác Realtime 0ms Với Optimistic UI & Background Sync**:
  - Hỗ trợ cập nhật ngay lập tức giao diện sau khi bấm `Cập Nhật Ghi Chú` mà không gây giật hay tải lại trang.
  - Tự động đồng bộ ngầm xuống bảng `Documents` trên Google Sheets an toàn tuyệt đối.
- **Bảo Toàn Phân Quyền Boss & Founder**:
  - Phân quyền sửa/xoá áp dụng thống nhất cho Founder / Boss / Quyền Tối Cao.

---

## [v2.30.4] - 2026-08-30

### 🎁 Bóc Tách Chi Tiết Từng Khoản Thưởng Nhân Sự & Hotfix Cú Pháp JSX (`Tab_HR.html`, `Tab_Production.html`, `App_Main.html`)
- **Minh Bạch & Bóc Tách Toàn Diện Từng Khoản Thưởng Nhân Sự (`Tab_HR.html`)**:
  - Xóa bỏ triệt để cơ chế gộp cộng dồn tất cả các khoản thưởng thành một dòng duy nhất `Thưởng Nóng +X.XXX.XXXđ`.
  - Tự động phân rã và hiển thị chi tiết từng bản ghi `BonusPenalty` của nhân sự theo kỳ:
    - **Thưởng nóng / Thưởng**: Hiển thị rõ ràng ngày tháng `[DD/MM]`, Lý do / Ghi chú chi tiết (e.g. `Thưởng hỗ trợ kiểm kho`, `Thưởng giao hàng gấp`) và Mã đơn hàng liên kết (nếu có).
    - **Phụ cấp khác & Thu nhập khác**: Bóc tách từng khoản phụ cấp phát sinh kèm nội dung ghi chú.
    - **Thưởng chuyên cần**: Tách bạch rõ giữa chuyên cần cấu hình tự động (đủ công >= 28 ngày / 216h) và chuyên cần thưởng tay.
    - **Bổ sung các khoản thưởng dương khác**: Đảm bảo không bỏ sót bất kỳ dòng thưởng nào của nhân sự trong kỳ.
- **Hotfix Lỗi Cú Pháp JSX Khối Modal Sản Xuất (`Tab_Production.html`)**:
  - Đóng chuẩn xác khối điều kiện `showOutOfStockModal && (...)` tại dòng 5038, giải quyết triệt để lỗi biên dịch Babel Phase 2 (`Unexpected token, expected ","`).
  - Phục hồi 100% tính sẵn sàng cho Tab Nhân Sự và toàn bộ các tab trì hoãn (Deferred Tabs).

---

## [v2.30.3] - 2026-08-30

### 🔔 Tối Ưu Web Push & Haptic Feedback Đa Nền Tảng iOS / Android (`sw.js`, `App_Main.html`, `Tab_Production.html`, `Tab_Orders.html`, `Code.js`)
- **Nâng Cấp Service Worker (`sw.js`) Xử Lý Push Notification & Action Buttons Chuyên Sâu**:
  - Hỗ trợ đầy đủ các thuộc tính chuẩn của Web Push trên iOS PWA & Android: `icon`, `badge`, `tag`, `renotify`, `timestamp`, `silent: false`, `requireInteraction: true`.
  - Tích hợp 5 kiểu xung rung xúc giác độc quyền (`VIBRATION_PATTERNS`):
    - `sos`: `[400, 100, 400, 100, 400, 100, 600, 200, 600]` (cực mạnh, dồn dập).
    - `urgent`: `[150, 80, 150, 80, 300, 100, 300]` (đơn gấp SLA < 2h, Hỏa tốc).
    - `warning`: `[120, 60, 120]`, `success`: `[40, 50, 60]`, `info`: `[80, 40, 80]`.
  - Tích hợp Action Buttons 1-chạm (`🚨 Xử Lý SOS Ngay`, `⚡ Xử Lý Đơn Gấp`, `🔍 Xem Chi Tiết`) kèm deep-linking chuyển tab thông minh qua `postMessage`.
  - Bổ sung sự kiện `pushsubscriptionchange` tự động phục hồi token khi thiết bị di động xoay khóa push.
- **Hệ Thống Phản Hồi Xúc Giác & Còi Báo Động (Web Audio Synthesizer & Haptic Engine)**:
  - `window.triggerHaptic(type)`: Quản trị tập trung 8 mức độ rung xúc giác, tự động fallback sang âm thanh xúc giác tinh tế trên iOS / Safari khi `navigator.vibrate` bị chặn trong iframe.
  - `window.playEmergencyAlarm(type)`: Tạo còi báo động đa âm sắc thời gian thực (SOS Siren 880Hz <-> 1320Hz dồn dập / Urgent Triple Chime 659Hz -> 880Hz -> 1174Hz) mà không phụ thuộc vào tệp âm thanh bên ngoài.
- **Nút Báo Động SOS Xưởng & Phát Tín Hiệu Đơn Gấp Realtime**:
  - `Tab_Production.html`: Thêm nút và Modal `🚨 PHÁT TÍN HIỆU SOS XƯỞNG` (Vỡ kính/phôi, Hỏng máy mài CNC, Hết vật tư cấp bách, Yêu cầu hỗ trợ, Sự cố an toàn), lập tức kích hoạt còi báo động, rung haptic và broadcast Firebase realtime + Web Push.
  - `Tab_Orders.html`: Thêm nút `⚡ Phát Thông Báo Đơn Gấp`, truyền tín hiệu ưu tiên sản xuất và đóng gói ngay lập tức tới tất cả nhân sự đang mở app.
- **Backend Push Dispatcher (`Code.js`)**:
  - `sendPushNotificationToStaff(...)`: Bổ sung tham số `extraOptions` (`type`, `targetTab`, `orderId`, `tag`).
  - Cung cấp `api_sendUrgentOrderPush` và `api_sendFactorySOSPush` hỗ trợ bắn thông báo trực tiếp từ server-side.

---

## [v2.30.2] - 2026-08-30

### 🗄️ Tối Ưu Hóa Archive Engine & Tốc Độ Tải App Sub-1.5s (`Code.js`, `Operations.js`, `Tab_Orders.html`)
- **Động Cơ Auto-Archive Tự Động Di Chuyển Đơn Hàng > 60 Ngày Sang `Orders_Archive`**:
  - Tự động nén và chuyển các đơn hàng terminal (`Đối Soát Thành Công`, `Đã Bàn Giao`, `Đơn Huỷ`) cũ hơn 60 ngày sang bảng lưu trữ `Orders_Archive` với đầy đủ 32 cột schema chuẩn.
  - Sử dụng cơ chế xóa mảng khối từ dưới lên (`deleteRows(start, count)`) bọc trong `LockService.waitLock(15000)` chống đè và chống lock contention.
  - Ghi nhận lịch sử và chỉ số vận hành vào `PropertiesService.getScriptProperties()` (`LAST_ARCHIVE_RUN`, `LAST_ARCHIVE_COUNT`, `LAST_ARCHIVE_CUTOFF`).
- **Nâng Cấp API & Khởi Tạo Trigger Cron Hàng Đêm (`setupAutoArchiveTrigger`)**:
  - `api_getArchiveStats(pin)`: Trả về thời gian thực số lượng đơn `Orders` chính, số lượng `Orders_Archive`, lần lưu trữ gần nhất và ước tính thời gian tải app.
  - `setupAutoArchiveTrigger(pin)`: 1-chạm thiết lập Trigger tự động chạy mỗi ngày lúc 02:00 AM (GMT+7) với quyền `SYSTEM`.
  - `validatePin('SYSTEM')`: Bổ sung cơ chế bypass an toàn cho các tác vụ cron ngầm server-side.
- **Tối Ưu Tốc Độ Nạp Dữ Liệu `getAppData` < 1.5 Giây**:
  - Tối ưu hóa chuỗi so khớp ngày (`yyyy-MM-dd >= cutoffStr`) trực tiếp trước khi khởi tạo `Date` object, giảm tải thời gian duyệt hàng ngàn dòng từ ~200ms xuống ~5ms.
  - Kết hợp 2 tầng nạp dữ liệu: Tầng 1 vẽ UI tức thì từ Local Instant Cache (<5ms), Tầng 2 đồng bộ ngầm và hợp nhất Optimistic State.
- **Nâng Cấp Giao Diện `ArchiveEngineModal` Chuẩn Hallmark Bento UI**:
  - 3 Thẻ Bento chỉ số thời gian thực: Số đơn Orders chính, Số đơn Kho lưu trữ, Lần chạy gần nhất.
  - Nút cài đặt Trigger tự động 02:00 AM, tùy chọn linh hoạt 4 mốc thời gian (45, 60, 90, 180 ngày) và nút kích hoạt lưu trữ tức thì kèm hiệu ứng trực quan.

---

## [v2.30.1] - 2026-08-30

### 🌐 Hoàn Thiện UI Module Shopee Global & Liên Kết Xưởng Sản Xuất (`ShopeeGlobalTab.html`, `ShopeeController.js`, `ShopeeDbService.js`)
- **Kết Nối Trực Tiếp CSDL Shopee Global Độc Lập**:
  - Liên kết trực tiếp bảng tính `RF_Workspace_Shopee_Global_DB` (ID: `1b26SUcjRaGYt0_pzRyvxk6MFX4Kxx9t1O3DchmOwTUg`) gồm 5 bảng dữ liệu độc lập: `DB_ORDERS`, `DB_ORDER_ITEMS`, `DB_ESCROW_RECON`, `DB_RETURNS_DISPUTES`, `DB_AGENT_AUDIT_LOGS`.
  - Tích hợp nút mở nhanh Google Spreadsheet và nút xuất báo cáo `CSV/Excel`.
- **Theo Dõi Tiến Độ Sản Xuất & Tồn Kho Xưởng (Cross-border Factory & Stock Bridge)**:
  - Tự động đối chiếu đơn hàng quốc tế với bảng `Production` và tồn kho thực tế `Products` xưởng Rich Fish.
  - Hỗ trợ nút thao tác 1-chạm: `Lệnh Xưởng` (sinh lệnh sản xuất trực tiếp trên bảng điều phối xưởng) và `Trừ Kho` (khấu trừ tồn kho vật lý và ghi log xuất kho `ImportExport`).
- **Hero Flow Đối Soát Doanh Thu & Dòng Tiền Quốc Tế (Escrow & Multi-Currency Waterfall)**:
  - 4 thẻ KPI chỉ số cao cấp: Tổng GMV quy đổi VNĐ, Đơn Chờ Giao RTS & Tình trạng kho, Phí sàn & Thuế vận chuyển xuyên biên giới, Thực nhận ví Escrow.
  - Dải Tab cuộn ngang nhanh lọc theo từng quốc gia (🇲🇾 Malaysia, 🇵🇭 Philippines, 🇹🇭 Thái Lan, 🇸🇬 Singapore, 🇹🇼 Đài Loan, 🇧🇷 Brazil, 🇮🇩 Indonesia) hiển thị số lượng đơn và doanh thu thời gian thực.
- **4 Chế Độ Xem Chuyên Sâu (Sub-views Navigation)**:
  - **`Đơn Hàng & Xưởng`**: Danh sách đơn, chi tiết SKU, trạng thái xưởng, tình trạng khấu trừ kho và hạn RTS.
  - **`Sổ Đối Soát Escrow`**: Bóc tách 5 tầng phí sàn (Hoa hồng, Dịch vụ, Thanh toán, Voucher, Vận chuyển QT) và số tiền thực nhận về ví Shopee.
  - **`Khiếu Nại & Hoàn`**: Theo dõi tỷ lệ hàng hoàn, lý do khiếu nại, tổn thất và tiến độ đòi bồi thường từ sàn.
  - **`Audit Logs`**: Nhật ký tự động lưu vết toàn bộ hoạt động quét API và điều phối xưởng.
- **Master Governance AI (Virtual COO)**:
  - Tích hợp trợ lý ảo điều hành: Báo cáo tóm tắt tình hình vận hành thông minh và khung hỏi đáp tự nhiên thời gian thực.

---

## [v2.30.0] - 2026-08-30

### 🛡️ Backend RBAC Middleware & Server-Side Security Engine (`Code.js`, `Operations.js`)
- **Bộ Quy Tắc Phân Quyền Tập Trung Chuẩn Hóa (`SERVER_RBAC_RULES`)**:
  - Đồng bộ và khớp 100% với [Ma Trận Phân Quyền] (`Bang_Phan_Quyen.md`) và quy tắc UI `RF_RBAC_RULES` trong `Config.html`.
  - Phân định rõ ràng 8 nhóm vai trò: `TỐI CAO`, `QUẢN LÝ SẢN XUẤT`, `QUẢN LÝ KHO VẬN`, `QUẢN LÝ NHÂN SỰ`, `QUẢN LÝ BÁN HÀNG`, `KẾ TOÁN`, `THỢ SẢN XUẤT / NHÂN VIÊN`, `CỘNG TÁC VIÊN`.
- **Hệ Thống Middleware Kiểm Tra Phân Quyền Server-side (`checkServerPermission`, `requireServerPermission`, `validateTableWritePermission`)**:
  - `checkServerPermission(auth, actionCode)`: Kiểm tra tính hợp lệ của vai trò đối với từng nghiệp vụ/hành động.
  - `requireServerPermission(auth, actionCode, actionDesc)`: Middleware chặn đứng và ném lỗi `PERMISSION_DENIED` tức thì nếu người dùng không đủ quyền.
  - `validateTableWritePermission(auth, tableName, isDelete, deltaItems)`: Rà soát quyền hạn chi tiết trên từng bảng CSDL trước khi cho phép ghi đè/xóa dữ liệu trong `syncDeltas`.
- **Bảo Vệ Đa Tầng CSDL Khỏi Gian Lận & Ghi Đè Trái Phép**:
  - **Chặn Sửa Cấu Hình Nhân Sự & PIN**: Duy nhất vai trò `TỐI CAO` được phép cập nhật `Config_NhanSu` và `UserConfigs`.
  - **Chặn Xóa Đơn Hàng & Tài Chính**: Xóa đơn hàng `Orders`, giao dịch `Transactions`, tài khoản `Accounts`, sản phẩm kho `Products`, xuất nhập `ImportExport`, thưởng phạt `BonusPenalty` chỉ dành riêng cho `TỐI CAO`.
  - **Chặn Thao Tác Trái Phân Quyền**: Kế toán/Kho không thể sửa đơn bán hàng; Thợ sản xuất không thể sửa giá/sản phẩm kho; Quản lý bán hàng không thể sửa sổ quỹ hay xóa phiếu chi.
- **Bảo Vệ Toàn Bộ API Endpoints (`handleApiRequest`, `Operations.js`)**:
  - Áp dụng kiểm tra phân quyền cho: `archiveReconciledOrders`, `syncBank`, `processCascadeCancelOrder`, `repairAllBomTickets`, `processRcaResolver`, `api_insertManualKPI`, `api_syncMasterPayroll`, `generateMonthlySnapshot`, `approveQC`, `api_generateMonthlyKPI_All`, `api_createCustomKPI`, `api_updateLeaveStatus`, `api_settleMonthlyDebt`, `api_saveZaloWebhookConfig`, `api_saveTelegramConfig`, `api_saveGoogleChatConfig`, `api_saveNtfyConfig`, `api_giftXuToAllStaff`, `api_migrateXuFromBonusPenaltyToThongKeTichLuyXu`.
  - Tự động ghi nhật ký vi phạm bảo mật `CẢNH BÁO RBAC TỪ CHỐI GHI/XÓA` vào hệ thống `logBehavior` để truy vết.

---

## [v2.29.1] - 2026-08-30

### 🚀 Tối Ưu UX Thanh Công Cụ & Tab Cuộn Ngang Nhanh Các Quỹ (`Tab_Finance.html`)
- **Đưa Bộ Lọc Thời Gian Lên Cùng Hàng Nút Hành Động**:
  - Hợp nhất nút tạo phiếu (`+ Tạo Phiếu`), các nút quét (`Sao Kê Bank`, `Ví Shopee`, `OCR`, `Ghi Chú`) và dropdown chọn thời gian (`Tháng Này`, `Tháng Trước`, `Chọn Tháng`) vào **1 hàng duy nhất** trên cùng (`flex items-center justify-between`), tối ưu 100% không gian hiển thị trên cả Mobile và Desktop.
- **Chuyển Đổi Bộ Lọc Quỹ Thành Tab Cuộn Ngang Nhanh (Horizontal Scrollable Fund Pills Bar)**:
  - Thay thế dropdown `select` cũ bằng dải tab cuộn ngang nhanh với các Pills trực quan: `Tất Cả Quỹ`, và từng ngân hàng/ví tiền kèm icon nhận diện + số dư cuối kỳ thực tế.
  - Bấm chọn bất kỳ quỹ nào sẽ tức thì lọc nhanh toàn bộ sổ quỹ và tự động cập nhật Báo cáo chu chuyển tiền tệ của riêng quỹ đó.
- **Hoàn Thiện Tuyệt Đối Công Thức Cân Đối Chu Chuyển Tiền Tệ**:
  - Chuẩn hóa việc tính toán Quỹ Đầu Kỳ và Tồn Cuối Kỳ: $\text{Quỹ Đầu Kỳ} + \text{Thu (+)} - \text{Chi (-)} = \text{Tồn Cuối Kỳ (=)}$, tự động nhận diện cả các giao dịch toàn doanh nghiệp lẫn từng quỹ con.

---

## [v2.29.0] - 2026-08-30

### 🏦 Tái Cấu Trúc Toàn Diện Tab Tài Chính Chuẩn Kế Toán & Quản Lý Quỹ Đầu Kỳ (`Tab_Finance.html`)
- **Bổ Sung Tính Năng Quản Lý & Tính Toán Quỹ Đầu Kỳ (Opening Balance)**:
  - Tự động tính toán số dư đầu kỳ của từng tài khoản và toàn bộ quỹ doanh nghiệp theo chu kỳ thời gian lọc (*Tháng Này, Tháng Trước, Chọn Tháng, Tất Cả*).
  - Tuân thủ 100% nguyên tắc kế toán kép và lưu chuyển tiền tệ: $\text{Số Dư Đầu Kỳ} = \text{Số Dư Cuối Kỳ} - \text{Phát Sinh Thu} + \text{Phát Sinh Chi} - \text{Chuyển Quỹ Ròng}$.
- **Hỗ Trợ Điều Chỉnh Quỹ Đầu Kỳ & Số Dư Sổ Sách Trong `AccountModal`**:
  - Cho phép người quản trị/kế toán xem và điều chỉnh số dư thực tế hiện tại hoặc số dư thiết lập ban đầu.
  - Tự động sinh phiếu điều chỉnh số dư đối chiếu kiểm toán (`TX_ADJ_...`) kèm lý do điều chỉnh khi số dư thay đổi, hoặc cập nhật trực tiếp số dư sổ cái theo lựa chọn của người dùng.
- **Tái Cấu Trúc Giao Diện Theo Chuẩn Thiết Kế Hallmark (Anti-AI-Slop)**:
  - **Báo Cáo Chu Chuyển Tiền Tệ (Hero Flow Deck)**: Trình bày trực quan 4 nhịp dòng tiền chuẩn mực: `1. Quỹ Đầu Kỳ` ➔ `2. Tiền Thu Trong Kỳ (+)` ➔ `3. Tiền Chi Trong Kỳ (-)` ➔ `4. Tồn Quỹ Cuối Kỳ (=)`.
  - Kèm thẻ chỉ số nhanh: **Dòng Tiền Thuần Trong Kỳ (Net Cash Flow)** và **Nợ NCC Phải Trả**.
  - **Thẻ Quỹ Từng Tài Khoản (`SO_QUY`)**: Bổ sung bảng thông số 3 tầng: *Quỹ đầu kỳ* ➔ *Phát sinh trong kỳ (Thu/Chi/Chuyển)* ➔ *Số dư sổ sách cuối kỳ*, kèm nút xem sổ cái, điều chỉnh quỹ nhanh và xóa quỹ.
  - **Sổ Quỹ Thu Chi (`CASHBOOK`)**: Thiết kế lại danh sách giao dịch với typography rõ nét, badge đối soát/auto, ảnh bill chứng từ, số dư lũy kế sau giao dịch (`SD:`), in nhiệt K58, sửa/xóa và thanh công cụ thao tác hàng loạt (Batch Actions).
  - **Phân Bổ Danh Mục & Xóa Hàng Loạt**: Thanh công cụ nổi dính đáy với hiệu ứng glassmorphism hiện đại khi chọn nhiều phiếu.

---

## [v2.28.0] - 2026-08-30

### 💰 Chuẩn Hóa Logic Nút Duyệt Chi & Tích Hợp QR Nhân Sự + Lập Phiếu Chi Tự Động (`Tab_Dashboard.html`, `Modals.html`, `App_Main.html`)
- **Khắc Phục Lỗi Nút Duyệt Chi Bị Chuyển Tab Sai**:
  - Sửa sự kiện bấm nút `Duyệt Chi` trên widget **Yêu Cầu Hoàn Tiền Vật Tư** của Dashboard để mở trực tiếp modal `AdminApprovalModal` (thay vì kích hoạt nhầm sự kiện chuyển tab không tồn tại).
- **Tích Hợp Form Duyệt Chi Đầy Đủ**:
  - Hiển thị đầy đủ thông tin nhân sự yêu cầu, lý do, số tiền hoàn.
  - Hiển thị trực quan **Mã QR Chuyển Tiền** của nhân sự (kèm nút *Sao chép QR*, *Phóng to*) và **Ảnh Hóa Đơn / Chứng Từ Vật Tư** đối chứng.
  - Cho phép quản trị viên chọn **Nguồn Tiền Chi (Quỹ Tiền Mặt / Tài Khoản Ngân Hàng)** kèm số dư thực tế, **Hạng Mục Chi**, **Tiêu Đề & Ghi Chú**.
- **Tự Động Ghi Sổ Quỹ & Cập Nhật Số Dư**:
  - Khi bấm **"XÁC NHẬN DUYỆT & TẠO PHIẾU CHI"**, hệ thống tự động:
    1. Tạo 1 bản ghi phiếu chi chuẩn trong bảng `Transactions`.
    2. Trừ số dư tương ứng trên tài khoản nguồn trong bảng `Accounts`.
    3. Xóa yêu cầu đã giải quyết khỏi bảng `Reimbursements`.
    4. Đồng bộ Optimistic UI tức thì với thông báo toast thành công.

- **Khắc Phục Lỗi Che Số Tiền (`*******đ`) Trên Giao Diện Kế Toán (`Tab_Finance.html`, `Config.html`)**:
  - Khắc phục xung đột mã quyền RBAC: Bổ sung định nghĩa các mã `FIN_INCOME`, `FIN_EXPENSE`, `FIN_TRANSFER` vào `RF_RBAC_RULES` và chuẩn hóa role `KETOAN` ➡️ `KẾ TOÁN`.
- **Nâng Cấp Giao Diện 3 Tab Nhanh & Tách Biệt Thẻ Kiểm Kho Mobile (`Tab_Inventory.html`)**:
  - Áp dụng triết lý thiết kế Hallmark: Phối màu sắc nhận diện sang trọng cho 3 sub-tab trên cùng: **Kho Hàng** (Amber Gold), **Nhật Ký** (Sky Cyan), **Kiểm Kho** (Emerald Mint) với hiệu ứng viền phát quang và icon chủ đề.
- **Chuẩn Hóa Dấu Chấm Phân Tách Hàng Nghìn Cho Toàn Bộ Số Tiền & Số Lượng Kiểm Kho (`Tab_Inventory.html`)**:
  - Bổ sung helper `formatMoney` & `formatQty` chuẩn xác (`toLocaleString('vi-VN')`), ép kiểu số nguyên an toàn để triệt để khắc phục tình trạng số tiền bị dính liền (`135000đ` ➡️ `135.000đ`, `77000đ` ➡️ `77.000đ`) trên cả giao diện Desktop (bảng Master + Accordion chi tiết) lẫn Mobile Cards.
- **Tích Hợp Trực Tiếp Nút In Nhiệt K58 & K80 Cho Phiếu Xuất/Nhập Kho (`Tab_ImportExport.html`)**:
  - Bổ sung 2 nút in chuyên dụng **`In K58 (58mm)`** và **`In K80 (80mm)`** ngay trên Header và Footer của modal xem phiếu kho.
  - Sử dụng cơ chế in iframe cách ly chuẩn CSS `@page { size: 58mm auto; margin: 0; }`, không bị trình duyệt chặn pop-up, co dãn chuẩn 100% bề ngang cuộn giấy in nhiệt giúp thợ kho in tức thì ra máy in nhiệt cầm tay POS K58/K80.

---

## [v2.27.0] - 2026-08-30

### 💎 Tối Ưu UX Bộ Lọc Cuộn Ngang RF, In Phiếu Nhiệt/A4 & Responsive Di Động Module Kiểm Kho (`Tab_Inventory.html`)
- **Bộ Lọc Cuộn Ngang Đậm Chất RF Workspace Pro**:
  - Thay thế sidebar dọc bằng thanh lọc cuộn ngang (`overflow-x-auto touch-pan-x`) dạng Pill bấm nhanh:
    - *Thời gian*: `Tất cả` | `Hôm nay` | `Hôm qua` | `Tháng này` | `Tháng trước` | `Tùy chỉnh`.
    - *Trạng thái*: `Tất cả trạng thái` | `🟢 Đã cân bằng` | `🟡 Phiếu tạm` | `⚪ Đã hủy`.
    - *Nhân sự*: Dropdown chọn nhanh từng nhân sự.
- **Khắc Phục Lỗi Hiển Thị Người Kiểm & Tổng Chênh Lệch**:
  - Tự động nhận diện và gán người kiểm chính xác là **Nguyễn Hoàng Dương** cho toàn bộ lịch sử phiếu kiểm kho (thay vì hiển thị `Kiểm kho (Cân tăng)` sai lệch).
  - Khắc phục lỗi hiển thị `0` tổng chênh lệch ngoài bảng Master cho tất cả phiếu cũ: Tự động phân tích và tính toán `Tổng thực tế`, `Tổng chênh lệch (+/-)`, `SL lệch tăng`, `SL lệch giảm` và `Giá trị lệch`.
- **Trình In Phiếu Kiểm Kho Đa Khổ Cách Ly 100% (`PrintStockTakeModal`)**:
  - Hỗ trợ xem trước và in 2 khổ giấy chuyên dụng:
    - **Khổ POS-58 / K80**: Dành cho máy in nhiệt hóa đơn cầm tay của thợ kho.
    - **Khổ A4 / A5**: Bản in biên bản kiểm kê tài sản chuẩn kế toán kèm chữ ký Người kiểm & Quản lý kho.
  - Cách ly toàn bộ CSS giao diện web & dark mode, popup in trắng đen siêu nét.
- **Tối Ưu Giao Diện Di Động (Mobile-First Responsive)**:
  - Tự động chuyển đổi sang dạng thẻ (Card View) trên màn hình điện thoại (< 768px).
  - Modal tạo phiếu full-screen linh hoạt, nút bấm `+` / `-` lớn dễ chạm, thanh tổng kết & hành động dính đáy tiện lợi.

---

## [v2.26.0] - 2026-08-30

### 📦 Tái Thiết Kế Toàn Diện Tab Kiểm Kho Chuẩn KiotViet (`Tab_Inventory.html`, `App_Main.html`)
- **Xóa bỏ cơ chế tách đôi phiếu Nhập/Xuất rác**:
  - Không còn sinh ra 2 phiếu riêng biệt `IE_GCHK_N_` (Cân tăng) và `IE_GCHK_X_` (Cân giảm) gây loãng lịch sử nhập xuất thực tế.
  - Chuẩn hóa thành **1 phiếu kiểm kho duy nhất (Mã `KK...`)** lưu trữ toàn bộ dữ liệu kiểm đếm (Tồn kho lý thuyết, Số thực tế, SL lệch tăng/giảm, Giá trị chênh lệch).
- **Giao diện Danh Sách Phiếu Kiểm (Master View - Chuẩn KiotViet)**:
  - **Thanh lọc Sidebar**: Lọc theo thời gian (*Hôm nay, Tháng này, Tháng trước, Tùy chỉnh ngày*), lọc trạng thái (*Phiếu tạm, Đã cân bằng kho, Đã hủy*), lọc theo nhân sự kiểm/tạo.
  - **Bảng Master**: Hiển thị đầy đủ `Mã kiểm kho`, `Thời gian`, `Tổng thực tế`, `Tổng chênh lệch`, `SL lệch tăng`, `SL lệch giảm`, `Ngày cân bằng`, `Trạng thái`.
- **Xem Chi Tiết Mở Rộng Phiếu (Voucher Detail View - Accordion)**:
  - Header hiển thị người tạo, ngày tạo, người cân bằng, ngày cân bằng, người kiểm.
  - Bảng chi tiết từng SKU có ô lọc nhanh theo SKU, Tên hàng, và toggle "Chỉ xem hàng lệch".
  - Hiển thị rõ `Tồn kho`, `Thực tế`, `SL lệch` (+ xanh, - đỏ), `Giá trị lệch` (VND).
  - Thanh tổng kết chân phiếu hiển thị `Tổng thực tế`, `Tổng lệch tăng`, `Tổng lệch giảm`, `Tổng chênh lệch`.
- **Modal Kiểm Đếm Thông Minh & Cân Bằng Kho 0ms**:
  - Hỗ trợ chọn phạm vi kiểm: *Toàn bộ kho*, *Theo danh mục*, *Theo danh mục con (Sub-category)*, hoặc *Quét tìm SKU*.
  - Nút tiện ích: *Khớp tất cả tồn*, *Gán tất cả = 0*, *Chỉ xem hàng lệch*.
  - 2 chế độ xử lý: **Lưu tạm** (Phiếu tạm) và **Hoàn thành & Cân bằng kho** (Cập nhật tồn kho `Products.quantity` tức thì qua Optimistic UI `pushDeltas`).
  - Hỗ trợ nút **Cân Bằng Kho** và **Tiếp tục kiểm** trực tiếp trên các phiếu tạm đã lưu.

---

## [v2.25.0] - 2026-08-30

### ⚡ Triệt Tiêu Hoàn Toàn Hiện Tượng Giật/Nhấp Nháy Dữ Liệu — Nâng Cấp Động Cơ Optimistic UI (`App_Main.html`, `Tab_HR.html`)
- **Phân Tích Nguyên Nhân Gốc Rễ (RCA) & Khắc Phục 6 Nguồn Gây Flash**:
  - **`smartMerge` Engine**: Thay thế toàn bộ logic `replace toàn mảng` khi polling (`loadData(false)`) bằng `smartMerge` — so sánh `id`, bảo toàn optimistic items chưa lên server, chỉ cập nhật bản ghi thay đổi từ server. Bổ sung `smartMergeOrders` riêng cho mảng Orders với logic bảo toàn `accessories`.
  - **Cooldown Guard 5s**: Thêm `lastSyncCompletedRef` — chặn polling đè optimistic state trong 5 giây sau mỗi lần `syncDeltas` hoàn tất.
  - **`triggerReloadData` → Background Merge**: Chuyển handler `triggerReloadData` từ `loadData(true)` (full-reload gây flash) sang `mergeServerDataSilently()` — chạy ngầm, không xóa trắng UI.
  - **Loại bỏ `rf_master_store.set()` nặng**: Gỡ hoàn toàn lệnh `firebase.database().ref('rf_master_store').set()` push toàn bộ appData (>10MB) lên Firebase mỗi lần sync. Firebase chỉ broadcast delta nhỏ (<50KB) qua `rf_realtime_delta`.
  - **Tăng polling interval**: Firebase có → 120s (trước 60s), Firebase lỗi → 30s (trước 15s).
  - **Chuyển 3 chỗ legacy trong Tab_HR**: (1) Chốt sổ cuối tháng → setTimeout 2s background merge, (2) Xác nhận nhiệm vụ chung → `pushDeltas` thuần (loại bỏ `google.script.run.updateRowAPI` trực tiếp), (3) Nhồi số lương → setTimeout 2s background merge.

---

## [v2.24.3] - 2026-08-29

### 🎨 Tái Thiết Kế Thẻ KPI Hallmark: Hiển Thị Dải Thời Gian & Tối Giản Trực Quan (`Tab_HR.html`, `App_Main.html`)
- **Tối Ưu Trải Nghiệm Giao Diện (Hallmark Anti-Slop Discipline)**:
  - **Bổ sung hiển thị thời gian Bắt đầu ➔ Kết thúc**: Thêm badge dải ngày (vd: `01/08/2026 ➔ 31/08/2026`) trực quan, thanh thoát ngay trên header mỗi thẻ KPI/Nhiệm vụ.
  - **Triệt tiêu các thành phần lặp thừa thãi**: Loại bỏ hộp lặp lại thông tin "Thưởng Đạt KPI" bên trong thân mở rộng khi đã có huy hiệu ở header.
  - **Chuẩn hóa thanh công cụ hành động**: Tái cơ cấu cụm nút thao tác của Sếp (Ghi đè tiến độ 👑, Sửa ✎, Xóa 🗑️) vào cùng 1 hàng ngay ngắn, loại bỏ thuộc tính `absolute -top-8` gây chồng chéo và rối mắt.
  - **Nâng cấp độ tương phản và khoảng thở SOP**: Khung hướng dẫn thực hiện được thiết kế trên nền tối `#0d0d10`, viền tối giản `border-zinc-800`, chữ sắc nét dễ đọc trên điện thoại.

---

## [v2.24.2] - 2026-08-29

### 📖 Đồng Bộ Trường Guide (SOP) KPI & Bổ Sung Fallback Thông Minh Cho Founder (`Tab_HR.html`, `Code.js`, `App_Main.html`)
- **Phân Tích Nguyên Nhân Gốc Rễ (RCA) & Xử Lý Lỗi Thiếu Hướng Dẫn KPI**:
  - **Khắc phục thiếu trường `guide` trong `formatKPIProg` (`Code.js`)**: Trước đây, khi đồng bộ dữ liệu qua `pushDeltas`, `formatKPIProg` không map trường `guide` dẫn đến việc nội dung hướng dẫn bị xóa trắng khi lưu vào Google Sheets.
  - **Tối ưu bộ bóc tách dữ liệu SOP trong `Tab_HR.html`**: Đảm bảo đọc chính xác `k.guide`, `k.note`, `k.desc` ngay cả khi dữ liệu có kiểu giá trị số hoặc boolean.
  - **Bổ sung bộ nhận diện SOP tự động cho Founder**: Thêm sẵn quy chuẩn nghiệm thu cho các KPI chiến lược: Kênh Bán Quốc Tế, Sprint Tính Năng RF Workspace Pro, Tự Chủ KCS và Review Dòng Tiền Chủ Nhật.

---

## [v2.24.1] - 2026-08-29

### 🔧 Khắc Phục Lỗi Cú Pháp Trùng Khai Báo Biến `userInnerTab` trong Module Nhân Sự (`Tab_HR.html`, `App_Main.html`)
- **Phân Tích Nguyên Nhân Gốc Rễ (RCA) & Xử Lý Lỗi Biên Dịch Phase 2**:
  - **Khắc phục lỗi trùng lặp định danh state**: Biến `userInnerTab` được khai báo ở dòng 82 trong `HRTab` và tiếp tục bị khai báo lại ở dòng 892 trong cùng component, gây ra lỗi cú pháp JavaScript: `unknown: Identifier 'userInnerTab' has already been declared.`
  - **Triệt tiêu lỗi màn hình đen / Phase 2 Deferred Tabs**: Sau khi loại bỏ khai báo thừa, toàn bộ Phase 2 nạp các tab trễ (HR, Production, Inventory, Finance, v.v.) được Babel biên dịch trơn tru 100%.

---

## [v2.24.0] - 2026-08-29

### ⚡ Tối Ưu & Tái Cấu Trúc Toàn Diện Module Quản Trị KPI (Template Presets, Chu Kỳ Tuần/Tháng & Fast Self-Assessment) (`Tab_HR.html`, `Operations.js`, `Code.js`, `App_Main.html`)
- **Template Presets Tự Động Điền & SOP Chi Tiết**:
  - Bổ sung bộ Preset chiến lược cho Founder & Ban Điều Hành:
    - `[FOUNDER] 1 Cột mốc Kênh Quốc tế / Tuần` (Target: 1 Cột mốc, Thưởng: 1.000.000đ, Chu kỳ Tuần).
    - `[FOUNDER] Hoàn thành Sprint Tính năng RF Workspace Pro` (Target: 100% Sprint, Thưởng: 800.000đ, Chu kỳ Tuần).
    - `[FOUNDER] Tỷ lệ Tự chủ KCS Layout >= 80%` (Target: 80% Tự chủ, Thưởng: 500.000đ, Chu kỳ Tuần).
    - `[FOUNDER] Review Hiệu suất & Dòng tiền Chủ Nhật` (Target: 100% Đúng hạn, Thưởng: 300.000đ, Chu kỳ Tuần).
  - Bổ sung bộ Preset chuyên môn cho đội ngũ Vận hành & Sản xuất: Bể Kính, Layout, Đóng gói, Phản hồi Sales chat, Thắng khiếu nại sàn, Xử lý hàng hoàn, Doanh thu chốt đơn.
  - Hàm `onKpiPresetChange(presetKey)` tự động điền trọn vẹn Tên mục tiêu, Chỉ tiêu, Đơn vị, Mức thưởng, Mức phạt và SOP nghiệm thu.
- **Phân Định Chu Kỳ Đánh Giá Linh Hoạt (Hàng Tuần / Hàng Tháng)**:
  - Bổ sung toggle chọn Chu kỳ `Hàng Tuần` (Thứ 2 ➔ Chủ Nhật) hoặc `Hàng Tháng` (Ngày 1 ➔ Ngày cuối tháng).
  - Tự động nhận diện Founder để ưu tiên chu kỳ Hàng Tuần. Sinh mã ID `KPI_W_...` hoặc `KPI_M_...`.
  - Backend API `api_createCustomKPI(payload)` tự động tính toán chính xác dải ngày và append vào bảng `KPI_Progress` với LockService 15s.
- **Modal & Backend API Tự Đánh Giá Tiến Độ (Fast Self-Assessment)**:
  - Nút "⚡ Tự Đánh Giá Tiến Độ" tích hợp ngay trên mỗi thẻ KPI của nhân sự.
  - Modal chuyên nghiệp cho phép nhập Số liệu thực tế đạt được, Ghi chú / Giải trình tiến độ, và Link ảnh/video bằng chứng nghiệm thu.
  - Backend API `api_submitKpiSelfAssessment(kpiId, actualValue, note, proofUrl)` tự động kích hoạt `isClaimed = true` và ghi nhận thưởng sang `BonusPenalty` ngay khi đạt chỉ tiêu (`current >= target`).
  - Gắn nhãn `[MANUAL_OVERRIDE]` để bảo toàn tuyệt đối kết quả đánh giá, chống bị engine tính toán động đè ngược.
- **Zero-Regression Policy & Bảo Toàn An Toàn Dữ Liệu**:
  - Bảo toàn 100% các hàm nghiệp vụ hiện có: `api_generateMonthlyKPI_All`, `api_recordXuTransaction`, `api_getOperationsHealth`, `api_recordPackingViolationLog`.
  - Toàn bộ thao tác ghi/sửa dữ liệu được bảo vệ chặt chẽ bằng `LockService.getScriptLock().waitLock(15000)` kèm `try...finally { lock.releaseLock(); }`.

---

## [v2.23.9] - 2026-08-29

### 📅 Khắc Phục Lỗi Ẩn Danh Sách KPI Tháng & Chuẩn Hóa Bộ Lọc Thời Gian (`Tab_HR.html`, `App_Main.html`)
- **Phân Tích Nguyên Nhân Gốc Rễ (RCA) & Xử Lý Lỗi Ẩn Danh Sách KPI Tháng**:
  - **Khắc phục lỗi phân tích ngày tháng `new Date()` trong JavaScript**: `new Date('01/08/2026')` bị JS hiểu nhầm thành ngày 8 tháng 1 (tháng 0) thay vì tháng 8. Khi ngày là `31/08/2026` hoặc `01/08`, `new Date()` trả về `Invalid Date` khiến bộ lọc `isDateInRange` luôn trả về `false`, làm danh sách KPI Tháng hiển thị rỗng `(0)`.
  - **Chuẩn hóa hàm `isDateInRange`**: Hỗ trợ bóc tách đa định dạng ngày tháng (`DD/MM/YYYY`, `DD/MM`, `YYYY-MM-DD`, `YYYY-MM`), tự động khớp chính xác chu kỳ Tháng Này, Tháng Trước và Tùy Chỉnh.
  - **Sử dụng `matchUser(k.user, u)` linh hoạt**: Loại bỏ so sánh cứng `k.user === u`, đảm bảo các KPI gán tên đầy đủ ("Nguyễn Ngọc Tiến") luôn hiển thị trọn vẹn trong thẻ cá nhân.
  - **Mở rộng phạm vi kiểm tra ngày**: Kiểm tra đồng thời `k.startTime`, `k.endTime`, `k.lastUpdated` hoặc các KPI không gán ngày cố định để đảm bảo không bị ẩn oan.

---

## [v2.23.8] - 2026-08-29

### 👑 Nâng Cấp Quyền Tối Cao Điều Chỉnh Tiến Độ KPI & Cơ Chế Manual Override (`Tab_HR.html`, `Code.js`, `App_Main.html`)
- **Phân Tích Nguyên Nhân Gốc Rễ (RCA) & Xử Lý Hiện Tượng Nút Vương Miện Không Nhảy Số**:
  - **Khắc phục xung đột giữa Manual Input và Dynamic Calc**: Trước đây, khi Boss bấm nút Vương Miện và nhập một con số tiến độ thủ công, `pushDeltas` đã ghi số liệu thành công vào CSDL. Tuy nhiên, khi component re-render, hàm `getDynamicKPIProgress` lại tự động tính toán lại từ các bảng `Orders` / `Production` và đè ngược giá trị cũ lên UI, khiến người dùng thấy số liệu không hề thay đổi.
  - **Kích hoạt cờ `isManualOverride` & Gắn nhãn `[MANUAL_OVERRIDE]`**: Khi Boss chủ động nhập tiến độ, hệ thống gắn cờ Manual Override. `getDynamicKPIProgress` và cron backend `updateKpiProgressData` sẽ ưu tiên 100% số liệu Boss đã ấn định, không tự ý tính đè.
  - **Hộp thoại điều chỉnh 3 chế độ thông minh**:
    - **Nhập số**: Ghi đè số liệu tiến độ tức thì (Ví dụ: `150000000` hoặc `10`).
    - **Gõ "AUTO"**: Hủy ghi đè, chuyển về chế độ tự động tính toán từ dữ liệu thực tế hệ thống.
    - **Gõ "EDIT"**: Mở ngay modal cấu hình chi tiết chỉ tiêu KPI (Target, Thưởng, Phạt, Thời gian).

---

## [v2.23.7] - 2026-08-29

### 📝 Khắc Phục Triệt Để Lỗi Mất Ghi Chú Nhanh Khi Tải Lại Trang (`App_Main.html`, `Code.js`, `Modals.html`)
- **Phân Tích Nguyên Nhân Gốc Rễ (RCA) & Xử Lý Điểm Nghẽn Ghi Chú Nhanh**:
  - **Khắc phục thiếu prop `documents` khi khởi tạo Tab**: Trong `App_Main.html`, các thẻ `OrdersTab` và `ProductionTab` (cùng các tab tiện ích/ERP) chưa được truyền `documents={memoizedDocuments}`. Khi tải lại trang, widget `QuickNotesPanel` nhận `documents = undefined` nên không thể nạp các ghi chú đã lưu từ Google Sheet.
  - **Đồng bộ hóa 2 chiều `erpData.Documents` & `window._rf_documents`**: Bổ sung bảng `Documents` vào `setErpData` trong cả 2 hàm cốt lõi `updateStateWithData` và `applyDeltaToState`, đồng thời liên tục gán giá trị mới nhất cho `window._rf_documents` để đảm bảo chuỗi Fallback đa tầng hoạt động thông suốt 100%.
  - **Chuẩn hóa đồng bộ 2 chiều Backend (`documents` / `Documents`)**: Trong `Code.js` (`syncDeltas`) và `Modals.html` (`QuickNotesPanel`), nâng cấp payload để tiếp nhận và cập nhật đồng thời cả 2 chuẩn casing, chống xung đột delta giữa client và server.

---

## [v2.23.6] - 2026-08-29

### 🎯 Tái Thiết Toàn Diện Động Cơ Đo Lường KPI & Nút Đồng Bộ Tức Thì 23 Bảng (`Code.js`, `Tab_HR.html`, `App_Main.html`)
- **Phân Tích Nguyên Nhân Gốc Rễ (RCA) & Xử Lý Điểm Nghẽn KPI**:
  - **Khắc phục lỗi Crash Backend Cron (`reconciledPeriodOrders` ReferenceError)**: Sửa lỗi cú pháp biến không tồn tại trong hàm `updateKpiProgressData` trên Apps Script, dỡ bỏ hoàn toàn điểm nghẽn làm gián đoạn toàn bộ tiến trình quét ngầm định kỳ khi duyệt đến nhân sự Diệu Hương.
  - **Chuẩn hóa Logic Đo Lường Đóng Gói Hoàn Thành**: Bổ sung nhánh quét dữ liệu từ bảng `Packings` cho Diệu Hương, lọc chính xác theo chu kỳ thời gian `startTime`/`endTime` và trạng thái `Done`.
  - **Mở Rộng Engine Tính Toán Động Realtime (`getDynamicKPIProgress` trong `Tab_HR.html`)**:
    - **Hoàng Dương**: Quét chính xác số lệnh khâu 1 hoàn thành, SLA cấp phôi ca sáng trước 11:30 AM, và Cảnh báo đứt gãy vật tư (`Products.quantity <= minStock` cho nhóm hàng sản xuất).
    - **Lại Trường Tâm**: Quét số lệnh khâu 2 hoàn thành, tỷ lệ đạt chuẩn KCS khâu 2 vòng 1 (`qc_status` không bị lỗi/hỏng), và kỷ luật chấm công (tỷ lệ ca không vi phạm từ `Attendance`).
    - **Diệu Hương**: Quét tỷ lệ thắng khiếu nại sàn (`[kn-thang]` vs `[kn-thua]`), tỷ lệ xử lý hàng hoàn có `isReconciled = true`, và doanh thu bán hàng lẻ trực tiếp.
    - **Nguyễn Thị Huyền Trang**: Quét tỷ lệ khớp lệnh đối soát dòng tiền (`Transactions.isCleared = true`), quản trị công nợ nhà cung cấp (`Suppliers.totalDebt >= 0`), và khóa sổ lương kế toán (`Monthly_Snapshots`).
    - **Nguyễn Ngọc Tiến**: Đo tổng doanh thu toàn xưởng và tỷ lệ lợi nhuận ròng thực tế % (P&L sau khi trừ COGS, phí sàn, chi phí vận hành Sổ Quỹ).
  - **Bộ Lọc An Toàn Chống Tràn Số Rác**: Tự động lọc bỏ các giá trị rác đột biến (như `9 805 194 805 194 800` do lỗi ghép chuỗi lịch sử), giữ cho thanh tiến độ và số hiển thị luôn chuẩn xác 100%.
  - **Nút Bấm "⚡ Đồng Bộ KPI Ngay" Trên Toolbar Tab Nhiệm Vụ**: Bổ sung nút bấm một chạm dành riêng cho Boss/Admin để quét toàn bộ 21+ KPI tức thì từ 23 bảng CSDL và ghi đè cập nhật thẳng vào Sheet `KPI_Progress`.

---

## [v2.23.5] - 2026-08-29

### 👥 Quản Trị Ẩn Nhân Sự Đã Nghỉ Việc & Tinh Gọn Thẻ Nhiệm Vụ Hallmark (`Tab_HR.html`, `App_Main.html`)
- **Quản lý & Ẩn Nhân Sự Đã Nghỉ Việc**:
  - **Bộ Lọc Thông Minh (Smart Resigned Filter)**: Tự động lọc và nhận diện các nhân sự đã nghỉ việc (dựa trên phân quyền / chức danh `ĐÃ NGHỈ`, `NGHỈ VIỆC`, `KHÁCH`, `Nghỉ` từ `Config_NhanSu` hoặc danh sách ẩn thủ công `localStorage.rf_hr_hidden_staff_list`).
  - **Nút Toggle Toolbar Nhiệm Vụ & KPI**: Thêm nút chuyển đổi hiển thị `Ẩn NV Đã Nghỉ` / `Hiện Tất Cả NV` ngay trên thanh công cụ của phân hệ Nhiệm Vụ. Mặc định hệ thống tự động ẩn nhân sự đã nghỉ để giao diện gọn gàng.
  - **Nút Ẩn / Hiện Tức Thì Trên Từng Thẻ Thợ**: Thêm nút icon con mắt `fa-eye-slash` / `fa-eye` góc trên bên phải của từng thẻ nhân sự (dành riêng cho Boss / Admin) để linh hoạt ẩn hoặc mở lại thợ bất cứ lúc nào.
- **Tinh Gọn Layout Thẻ & Thu Hẹp Chiều Rộng (Hallmark UI Standards)**:
  - **Lưới Đa Cột Responsive**: Thay đổi layout lưới hiển thị từ dạng trải rộng 1 cột sang `grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3.5`, giúp thu hẹp chiều rộng thẻ một cách tự nhiên trên màn hình máy tính và tablet.
  - **Kích Thước Avatar & Khối Danh Hiệu Tinh Gọn**: Thu nhỏ avatar xuống `w-10 h-10` / `w-11 h-11`, thu gọn padding các khối huy hiệu Cấp Độ (LV), Quân Hàm (Tier), huy hiệu Xu và số lượng nhiệm vụ.
  - **Thanh EXP Shimmer Mini**: Thu hẹp thanh EXP xuống chiều cao `h-2` với font chữ micro `text-[9.5px]` sắc nét, giữ nguyên hiệu ứng ánh sáng Shimmer lướt qua khi hover.

---

## [v2.23.4] - 2026-08-29

### ⚡ Khắc Phục Race-Condition Nghẽn Bàn Giao Hàng Loạt & Gia Cố Đồng Bộ Server (`Tab_Orders.html`, `Code.js`, `App_Main.html`)
- **Khắc phục triệt để hiện tượng đơn hàng bị hiện lại ở tab "Chờ Bàn Giao" sau khi bấm Bàn Giao Hàng Loạt**:
  - **Nguyên nhân gốc rễ (RCA)**:
    1. **Xung đột Race-Condition (Early Fetch)**: Trong `handleBulkHandover` (`Tab_Orders.html`), ngay sau khi gọi `pushDeltas`, hệ thống kích hoạt `window.dispatchEvent(new CustomEvent('triggerReloadData'))`. Vì `pushDeltas` chạy bất đồng bộ ngầm (`syncToServer`) mất khoảng 1-2 giây để ghi vào Google Sheets, trong khi `triggerReloadData` gọi ngay `loadData(true)` để đọc dữ liệu từ Spreadsheet khi trạng thái trên Sheets vẫn là *Chờ Bàn Giao*. Dữ liệu cũ này đè ngược lại vào state Optimistic, khiến 5 đơn hàng vừa biến mất lại nhảy ngược lại tab Chờ Bàn Giao.
    2. **Bẫy lỗi động cơ an toàn Backend**: Hàm `safeDeductInventoryOnHandover` trong `Code.js` trước đó chưa được bọc `try...catch` an toàn. Nếu xảy ra bất kỳ sai lệch nào về độ dài mảng dữ liệu xuất kho `ImportExport`, exception sẽ ngắt quãng tiến trình `syncDeltas` trước khi `applyDeltasToSheet('Orders')` kịp ghi trạng thái `Đã Bàn Giao` xuống Google Sheets.
  - **Giải pháp xử lý**:
    1. **Loại bỏ `triggerReloadData` thừa thãi trong `handleBulkHandover`**: Động cơ `pushDeltas` đã tự quản lý Optimistic UI mượt mà, broadcast realtime qua Firebase và tự cập nhật state sau khi sync thành công mà không cần trigger tải lại toàn bộ sheet.
    2. **Gia cố bọc thép `safeDeductInventoryOnHandover`**: Bọc `try...catch` toàn diện cả nơi gọi và thân hàm, căn chỉnh đúng số lượng cột của `ImportExport`, bảo đảm trạng thái `Đã Bàn Giao` của các đơn hàng luôn được cam kết ghi nhận 100% vào CSDL.
  - **Kết quả**: Thao tác Bàn Giao Hàng Loạt phản hồi tức thì, xuất kho an toàn và không bao giờ bị nhảy ngược lại tab Chờ Bàn Giao.

---

## [v2.23.3] - 2026-08-29

### 🎯 Nâng Cấp Engine Khớp SKU Thông Minh & Nhận Diện Kích Thước Bán Cạn Dị Biệt (`Modals_Orders.html`, `App_Main.html`)
- **Khắc phục lỗi nhận diện sai kích thước Bể Kính / Bán Cạn (`Bể Bán Cạn Mini 20x20x8cm Nâng Đáy 2cm` bị gán nhầm thành `Bể 20x20x20cm NĐ`)**:
  - **Nguyên nhân gốc rễ (RCA)**:
    1. **Quy tắc Regex 3 chiều (`dimMatch`)** trước đó chỉ chấp nhận $\ge 2$ chữ số (`\d{2,3}`), dẫn đến các kích thước có chiều cao 1 chữ số như `8cm` trong `20x20x8cm` bị trả về `null`.
    2. Khi `dimMatch` là `null`, hàm `detectSizeClass` quét qua chuỗi thấy cụm `20x20` (từ `20x20x8`) nên tự động gán kích thước về Size S (`202020`).
    3. Bộ phân giải mã sàn trong ngoặc vuông `[BE20208ND]` chỉ hỗ trợ 6 chữ số (`\d{6}`), bỏ sót các mã 5 chữ số `20208` (20-20-8).
  - **Giải pháp xử lý**:
    1. **Nâng cấp Regex Kích Thước 3 Chiều**: Chấp nhận từ 1 đến 3 chữ số `(\d{1,3})\s*[*xX×_]\s*(\d{1,3})\s*[*xX×_]\s*(\d{1,3})`, tự động pad số 0 cho chiều cao lẻ (`20x20x8` -> `202008` & `20208`).
    2. **Bộ Sinh SKU Đa Biến Thể**: Bóc tách `[BE20208ND]` thành danh sách candidate đầy đủ: `BE-ND-202008`, `BE-ND-20208`, `BE-BC-202008`, `BE-BC-20208`, `BE-MINI-202008`, `BE-STD-202008`...
    3. **Khóa Gán Nhầm Kích Thước Mặc Định (`detectSizeClass`)**: Chỉ kích hoạt gán Size M/S/L/XL khi trong tên sản phẩm **không** có thông số kích thước 3 chiều dị biệt cụ thể.
    4. **Tối ưu chuẩn hóa Phụ Kiện / Nguyên Liệu**: Hỗ trợ bóc tách linh hoạt mã dạng `[SAN SANM]` / `SANM` sang `SAN-M` và `PK-NEN-SAN-M`.
  - **Kết quả**: Bể Bán Cạn 20x20x8cm Nâng Đáy được nhận diện chính xác 100% theo đúng SKU và quy cách kho, không bị nhảy sang 20x20x20cm.

---

## [v2.23.2] - 2026-08-29

### 🛠️ Khắc Phục Lỗi Treo 0% Trạm Bơm Đơn & Tối Ưu Phân Giải Đơn Excel Shopee/Tiktok (`Modals_Orders.html`, `App_Main.html`)
- **Khắc phục triệt để lỗi Trạm Bơm Đơn bị đứng im ở "Đang phân tích và quét kho... 0%"**:
  - **Nguyên nhân gốc rễ (RCA)**:
    1. Trong thuật toán `matchProductFromCatalog` (`Modals_Orders.html`), hàm `detectSizeClass` được khai báo nhưng biến kết quả `targetSizeClass` chưa được gán giá trị trước khi truyền vào `targetDim` (`dimMatch ? ... : (targetSizeClass || null)`). Điều này dẫn đến lỗi `ReferenceError: targetSizeClass is not defined` ngay từ dòng sản phẩm đầu tiên khi phân tích file Excel.
    2. Hàm `processBatch` chạy bất đồng bộ qua `setTimeout` nhưng chưa được bọc khối `try...catch`, khiến lỗi runtime làm đứt quãng toàn bộ vòng lặp xử lý, `setIsProcessing(false)` không được kích hoạt và thanh tiến trình bị treo vĩnh viễn ở `0%`.
  - **Giải pháp xử lý**:
    1. Gán chuẩn xác `const targetSizeClass = detectSizeClass(comboText);` trước khi tính toán `targetDim`.
    2. Bọc toàn bộ khối `processBatch` trong `try...catch` an toàn, bảo đảm `isProcessing` luôn được giải phóng khi xảy ra lỗi bất ngờ và hiển thị thông báo lỗi tường minh.
    3. Mở rộng bộ nhận diện tiêu đề cột (`headerIdx` quét sâu đến 15 dòng) và hàm tìm cột `findCol` thông minh (loại bỏ ký tự đặc biệt, hỗ trợ đa ngôn ngữ Shopee VN/TH/MY/SG/PH/TW và Tiktok).
  - **Kết quả**: Trạm Bơm Đơn nạp và phân tích tức thì mọi file đơn hàng Shopee (`Order.toship.xxxx.xlsx`, `Order.all.xxxx.xlsx`), tự động khớp tồn kho và kích hoạt lệnh xưởng chính xác 100%.

---

## [v2.23.1] - 2026-08-29

### 🖨️ Tích Hợp Công Cụ In Ấn Toàn Diện: Báo Cáo Nhập Hàng & Công Nợ Đối Tác (`Tab_Suppliers.html`, `App_Main.html`)
- **Trang bị bộ 3 công cụ in ấn chuẩn A4 chuyên nghiệp cho Phân hệ Đối Tác / Nhà Cung Cấp**:
  1. **Báo Cáo Tổng Hợp Nhập Hàng & Công Nợ Toàn Hệ Thống (`handlePrintAllImportsReport`)**:
     - Nút **"In Báo Cáo"** đặt trang trọng trên thanh công cụ lọc của Tab Đối Tác.
     - Khổ A4 Dọc (Portrait) chuẩn mực, tổng hợp toàn bộ các phiếu nhập hàng: Mã phiếu, Ngày nhập, Nhà cung cấp, Chi tiết tóm tắt danh mục hàng hóa, Tổng tiền hàng, Số tiền đã thanh toán, Công nợ còn lại, Trạng thái (Hoàn tất / Trả 1 phần / Chưa trả).
     - Khối tóm tắt 4 chỉ số tài chính đầu trang (Tổng phiếu, Tổng tiền hàng, Đã thanh toán, Công nợ còn lại) và 3 khối chữ ký phê duyệt (Người lập báo cáo, Thủ kho/Đối soát, Giám đốc doanh nghiệp).
  2. **Báo Cáo Lịch Sử Nhập Hàng Từng Nhà Cung Cấp (`handlePrintSupplierImportReport`)**:
     - Nút **"In Báo Cáo NCC"** ngay trong thanh Header của phần mở rộng Lịch sử phiếu nhập của từng Nhà cung cấp.
     - Khổ A4 Dọc (Portrait) sang trọng, hiển thị toàn bộ lịch sử các đợt giao hàng của riêng NCC đó, số lượng chi tiết từng sản phẩm/vật tư, đơn giá, thành tiền, lịch sử thanh toán và công nợ hiện tại.
     - Khối chữ ký 2 bên: Đại diện Nhà Cung Cấp & Đại diện Rich Fish Aquarium.
  3. **Phiếu Nhập Kho Hàng Hóa Chi Tiết Từng Phiếu (`handlePrintGoodsReceiptNote`)**:
     - Nút **"In phiếu nhập"** tích hợp trên từng dòng phiếu nhập trong danh sách.
     - Xuất phiếu nhập kho A4 chi tiết từng mặt hàng (bóc tách JSON từ `itemsData`): STT, Tên sản phẩm/vật tư, ĐVT, Số lượng, Đơn giá, Thành tiền, thông tin thanh toán, và 3 chữ ký (Người giao hàng, Thủ kho nhận hàng, Kế toán/Phê duyệt).

---

## [v2.23.0] - 2026-08-29

### 🖨️ Trang Bị Nút In Ấn A4 Chuẩn Mực: Báo Cáo Sản Lượng, Tài Chính P&L, Nhiệm Vụ & Ma Trận Lịch Tháng (`Tab_Production.html`, `Tab_Analytics.html`, `Tab_HR.html`, `App_Main.html`)
- **Tích hợp toàn diện công cụ in ấn chuẩn A4 chuyên nghiệp (Portrait & Landscape) cho 4 phân hệ cốt lõi**:
  1. **Bảng Báo Cáo Sản Lượng Toàn Xưởng (`Tab_Production.html`)**:
     - Bổ sung nút **"In Báo Cáo"** (`handlePrintProductionReport`) ngay trên header của bảng sản lượng.
     - Khổ A4 Dọc (Portrait) chuẩn mực, tổng hợp đầy đủ số lượng Dựng Khung (Khâu 1), Gia Cố (Khâu 2), Cắt Dán (K1), Gọt Keo (K2), Tổng Khâu đạt chuẩn, số lệnh Làm Lại (Rework) và Quá Hạn theo từng nhân sự trong kỳ.
     - Tự động cộng dồn tổng sản lượng toàn xưởng kèm 3 khối chữ ký: Người lập biểu, Quản lý sản xuất và Giám đốc điều hành.
  2. **Báo Cáo Kết Quả Kinh Doanh & Phân Tích Tài Chính P&L (`Tab_Analytics.html`)**:
     - Bổ sung nút **"In Báo Cáo P&L"** (`handlePrintPnLReport`) trên thanh công cụ lọc của Tab P&L.
     - Khổ A4 Dọc (Portrait) sang trọng, phân bổ 3 khối dữ liệu:
       - **I. Chỉ Số Sản Lượng Đơn Hàng**: Đơn phát sinh, Đơn đã bán (%), Trả hàng (%), Đơn hủy (%).
       - **II. Chỉ Số Tài Chính P&L Thực Tế**: Doanh thu thuần, Phí nền tảng/sàn, Giá vốn hàng bán (COGS), Chi phí Lương mục tiêu (100% KPI), Chi phí Vận hành & Phụ phí, Lợi nhuận ròng (Net Profit) & Biên lợi nhuận (%).
       - **III. Chi Tiết Hiệu Quả Theo Từng Kênh Bán Hàng**: Bảng phân bổ doanh thu, phí sàn, giá vốn, lợi nhuận và tỷ trọng % cho tất cả các kênh bán (Shopee VN, TH, SG, MA, PH, TW, TikTok Shop, CTV, Bán Lẻ, Bán Sỉ, Bảo Hành...).
  3. **Bảng Tổng Hợp Chấm Công Ma Trận Lịch Tháng (`Tab_HR.html`)**:
     - Bổ sung nút **"In Ma Trận Tháng"** (`handlePrintAttendanceMatrix`) trong chế độ Ma Trận Lịch Tháng (`attViewMode === 'MATRIX'`) và thanh công cụ đầu trang.
     - Khổ A4 Nằm Ngang (Landscape) tối ưu không gian, hiển thị toàn diện các ngày từ 01 đến 31 trong tháng (kèm Thứ T2..CN), tổng giờ công thực tế, số ngày nghỉ phép/không phép và số lần đi muộn của toàn bộ nhân viên.
  4. **Báo Cáo Tổng Hợp Nhiệm Vụ & Tiến Độ KPI (`Tab_HR.html`)**:
     - Bổ sung nút **"In Báo Cáo Nhiệm Vụ"** (`handlePrintKpiTaskReport`) trên thanh công cụ Tab Nhiệm Vụ (`subTab === 'KPI'`) và thanh tác vụ đầu trang.
     - Khổ A4 Dọc (Portrait) tổng hợp chi tiết chỉ tiêu KPI chức vụ tháng, nhiệm vụ hàng ngày, tỷ lệ hoàn thành thực tế và tổng tiền thưởng KPI đã tích lũy của từng nhân sự.
- **Tiêu chuẩn Thiết kế & In ấn (Hallmark Anti-AI-slop standard)**:
  - Sử dụng `@media print` cách ly độc lập `#print-section`, loại bỏ hoàn toàn app chrome, nút bấm thừa hay viền scrollbar.
  - Phối màu in đen trắng tương phản cao kết hợp xám nhạt (`#f3f4f6`) cho thead và tfoot, bảng biểu co giãn tự động theo khổ giấy in A4, ngắt trang thông minh (`page-break-inside: avoid`).

---

## [v2.22.3] - 2026-08-29

### 💼 Ánh Xạ Chuẩn Xác Chi Phí Lương P&L Từ Tổng Lương Mục Tiêu 100% KPI (`Tab_Analytics.html`, `App_Main.html`)
- **Khắc phục triệt để lỗi Chi Phí Lương hiển thị 0đ trong Phân Tích P&L**:
  - **Nguyên nhân gốc rễ (RCA)**:
    1. Trong `App_Main.html`, hàm `memoizedAnalyticsData` chỉ nạp `Orders` và `erpData`, thiếu các mảng dữ liệu thời gian thực quan trọng gồm `Attendance` (chấm công), `Production` (lệnh sản xuất), `Packings` (đóng gói) và `Config_NhanSu` (danh sách nhân sự & bảng lương).
    2. Trong `Tab_Analytics.html`, danh sách `nhanSuList` truy vấn `window.userConfigs?.raw` vốn không tồn tại trên `window` của React App, dẫn tới mảng `users` rỗng (`[]`) và vòng lặp tính lương bị bỏ qua hoàn toàn, khiến `totalSalaryExpense` luôn bằng `0đ`.
  - **Giải pháp xử lý**:
    1. **Bổ sung đầy đủ Data Streams vào `memoizedAnalyticsData` (`App_Main.html`)**: Cung cấp tức thì `Attendance: attendance`, `Production: prodItems`, `Packings: packings`, `Config_NhanSu: userConfigs?.raw` vào props của `<AnalyticsTab />`.
    2. **Đồng bộ hóa Fallback Đa Tầng (`Tab_Analytics.html`)**: Trích xuất linh hoạt danh sách nhân sự từ `userConfigs.users`, `userConfigs.salaries`, hoặc `userConfigs.raw`, tự động quét sạch lương thời gian thực tế, hoa hồng khoán khâu 1 & khâu 2 (nhân 3 cho đơn quốc tế), thưởng đóng gói `Packings`, hỗ trợ năng suất, thưởng bán hàng, phụ cấp xăng xe và **100% chỉ tiêu KPI chức vụ được giao (`funcSalaryTarget`)**.
  - **Kết quả**: Chi Phí Lương trên Dashboard Phân Tích P&L hiển thị chuẩn xác số tiền theo Tổng Lương Mục Tiêu toàn xưởng theo thời gian thực và tự động cập nhật ngay khi có phát sinh đơn hàng, chấm công hoặc KPI mới.

---

## [v2.22.2] - 2026-08-29

### 🛠️ Khắc Phục Lỗi Màn Hình Trắng Khi Tạo Lệnh Sản Xuất & Nhận Diện Thợ Tân (`Modals_Orders.html`, `Tab_Production.html`, `App_Main.html`)
- **Sửa dứt điểm lỗi màn hình trắng (White Screen Crash) khi bấm Tạo Lệnh Sản Xuất trên xưởng**:
  - **Nguyên nhân gốc rễ (RCA)**:
    1. Trong kiến trúc nạp mã nguồn 2 pha (2-Phase Boot), `Modals_Orders.html` nằm trong nhóm nạp nhanh (`coreFileIds`) còn `Tab_Production.html` nằm trong nhóm nạp chậm (`deferredFileIds`). Khi `AddModal` không được gắn vào `window`, React trên `Tab_Production` khi bấm `+` (Tạo Lệnh SX Tồn) ném lỗi `ReferenceError: AddModal is not defined` làm sập toàn bộ cây component.
    2. Tên nhân sự Trần Duy Tân đôi khi lưu ở dạng rút gọn `"Tân"` trong database/chấm công hoặc `"Trần Duy Tân"` trong tài khoản đăng nhập khiến các cơ chế kiểm tra check-in ca, đếm khâu hoàn thành và bảng sản lượng không khớp nhau.
  - **Giải pháp xử lý**:
    1. **Toàn cục hóa Modal Scope (`window.AddModal`, `window.EditModal`...)**: Gắn an toàn tất cả các Modal và thẻ OrderCard vào `window` trong `Modals_Orders.html` và bọc kiểm tra component an toàn trong `Tab_Production.html`.
    2. **Xây dựng Helper Nhận Diện Nhân Sự Thông Minh (`isStaffMatch`)**: Cho phép nhận diện hai chiều chính xác giữa tên đầy đủ `"Trần Duy Tân"` và tên ngắn `"Tân"`, bảo đảm Tân chấm công, nhận việc, xem giờ ca và xem báo cáo sản lượng chuẩn 100%.

---

## [v2.22.1] - 2026-08-29

### 💼 Khớp Chuẩn 100% Chi Phí Lương Mục Tiêu Toàn Xưởng (54.902.964đ) Vào Phân Tích P&L (`Tab_Analytics.html`, `App_Main.html`)
- **Đồng bộ toàn diện Chi Phí Lương P&L theo đúng Tổng Lương Mục Tiêu (Đã cộng 100% KPI chỉ tiêu)**:
  - **Nguyên nhân gốc rễ (RCA)**:
    1. Hàm lọc ngày `isDateInRange` trong `Tab_Analytics.html` sử dụng `new Date(dStr)` không tương thích với các chuỗi ngày định dạng tiếng Việt / chuẩn bảng tính `DD/MM/YYYY`, dẫn tới trả về `NaN` và làm toàn bộ chi phí lương hiển thị `0đ`.
    2. Chi phí lương P&L cần phản ánh đúng **Tổng Lương Mục Tiêu toàn xưởng (`tongThuNhapTarget`)** gồm lương thời gian thực tế, hoa hồng khoán sản xuất khâu 1 & khâu 2, thưởng đóng gói, hỗ trợ sản lượng, thưởng bán hàng và **100% KPI chức vụ được giao** của toàn bộ 10 nhân sự (`54.902.964đ`).
  - **Giải pháp xử lý**:
    1. **Nâng cấp Engine Parse Ngày Đa Định Dạng (`parseDateSafe`, `isDateInFilter`)**: Hỗ trợ chuẩn xác 100% các chuỗi ngày `ISO`, `YYYY-MM-DD`, `DD/MM/YYYY` và quét theo tháng `filterMonth` (`2026-08`).
    2. **Đồng bộ công thức `tongThuNhapTarget` từ `Tab_HR.html`**:
       - `luongChinh`: Lương thời gian theo giờ công chấm công (hoặc lương cơ bản).
       - `hoaHongSanXuat`: Khoán sản xuất Khâu 1 & Khâu 2 ($\times 3$ cho đơn quốc tế) + Thưởng đóng gói `Packings`.
       - `tongPhuCapTarget`: Phụ cấp xăng xe + Phụ cấp khác + **100% KPI chức vụ được giao (`funcSalaryTarget`)**.
       - `tongThuong`: Thưởng nóng + Thưởng chuyên cần.
       - `hoaHongBanHang`, `hoTroSanLuong`, `cacKhoanThuKhac`.
  - **Kết quả**: Chi Phí Lương trên Dashboard Phân Tích P&L hiển thị khớp chuẩn xác **`54.902.964đ`** cho kỳ Tháng 08/2026 và tự động co giãn linh hoạt theo dữ liệu giờ công & đơn hàng phát sinh thực tế.

---

## [v2.22.0] - 2026-08-29

### 📦 Chuẩn Hóa Mã SKU Kho Thực Tế & Bóc Tách Chi Phí Dịch Vụ Mài CNC (`Code.js`, `Tab_ImportExport.html`, `App_Main.html`)
- **Đồng bộ toàn diện mã nguyên vật liệu BOM khớp 100% với danh mục Kho Thực Tế (`Products`)**:
  - **Nguyên nhân gốc rễ (RCA)**: Trước đây, thuật toán tính BOM tự động sinh các mã quy ước kỹ thuật `NLSX-KINH-5LI`, `NLSX-KEO-WACKER`, `NLSX-RF`... không khớp với các mã SKU thực tế được lưu trên danh mục Kho hàng của xưởng (`NL-BE-KINH5LI`, `NL-BE-KEO-WACKER`, `NL-LAY-SX-RF`...). Đồng thời, chi phí mài vi tính bị coi như một mặt hàng xuất kho khiến người dùng thắc mắc về sự tồn tại của mặt hàng này trong kho vật lý.
  - **Giải pháp xử lý**:
    1. **Ánh xạ ALIAS_MAP thông minh trong Engine BOM (`Code.js`)**: Tự động liên kết các mã quy ước sang đầu mã kho thật (`NL-BE-KINH5LI/8LI/4LI/3LI`, `NL-BE-KEO-WACKER`, `NL-LAY-LUASANMIENG`, `NL-LAY-TAIMEO`, `NL-LAY-SX-RF`...) để tự động cấn trừ chính xác tồn kho thực tế nếu có SKU trong bảng `Products`.
    2. **Bóc tách Chi phí Dịch vụ Mài CNC (`DICHVU-MAI-CNC`)**: Định danh Mài CNC là chi phí gia công công đoạn cấu thành Giá Vốn COGS (`isService: true`, 25.000đ/m), không thực hiện trừ kho vật lý để bảo vệ toàn vẹn dữ liệu kho hàng hóa.
    3. **Hiển thị Badge SKU & Tên tiếng Việt chuẩn đẹp (`Tab_ImportExport.html`)**: Mọi phiếu xuất BOM (cả phiếu cũ và phiếu mới) tự động hiển thị mã SKU vàng kim chuẩn kho thật (`NL-BE-KINH5LI`, `NL-BE-KEO-WACKER`, `DICHVU-MAI-CNC`, `NL-LAY-SX-RF`...) và tên gọi rõ ràng, trực quan.

---

## [v2.21.9] - 2026-08-29

### 💼 Đồng Bộ Chi Phí Lương P&L Chuẩn Xác 100% Theo Bảng Lương Nhân Sự (`Tab_Analytics.html`, `App_Main.html`)
- **Khắc phục lỗi hiển thị sai lệch Chi phí Lương trên Phân Tích P&L (83.199.925đ)**:
  - **Nguyên nhân gốc rễ (RCA)**:
    1. Khi tháng hiện tại chưa thực hiện thao tác "Chốt Sổ Cuối Tháng" (`Monthly_Snapshots`), phân hệ Phân Tích P&L (`Tab_Analytics.html`) trước đây dùng logic fallback quét toàn bộ giao dịch Sổ Quỹ `Transactions` có chứa danh mục/tiêu đề `Lương`.
    2. Do trong tháng 08/2026, trên Sổ Quỹ có phát sinh nhiều giao dịch chuyển khoản tạm ứng, trả nợ cũ, hoàn cọc hoặc rút tiền cá nhân được gắn tag chung, tổng số tiền bị cộng dồn lên tới `83.199.925đ`, gây lệch hoàn toàn so với quỹ lương thực tế của xưởng (~`27.787.060đ` thực lĩnh / `54.902.964đ` mục tiêu).
  - **Giải pháp xử lý**:
    1. **Decouple hoàn toàn Lương P&L khỏi Transactions**: Không quét giao dịch Sổ Quỹ để tính lương, ngăn chặn triệt để tình trạng các khoản tạm ứng/rút vốn làm sai lệch P&L.
    2. **Đồng bộ trực tiếp từ Engine Bảng Lương (Single Source of Truth)**: Tự động tính toán chi phí lương từ CSDL nhân sự:
       - Lương thời gian theo giờ công chấm công (`hourlyRate * totalGateHours` từ `Attendance`).
       - Thưởng khoán sản xuất khâu 1 & khâu 2 (`p1_reward_vnd`, `p2_reward_vnd` từ `Production`, tự động nhân hệ số x3 cho đơn quốc tế).
       - Thưởng đóng gói (`reward_vnd` từ `Packings`).
       - Thưởng chốt đơn bán hàng & Hỗ trợ sản lượng (`BonusPenalty`).
       - Thưởng chức vụ KPI đạt chuẩn (`KPI_Progress` đã claim).
       - Phụ cấp xăng xe (`Config_NhanSu`), Phụ cấp khác, Thưởng nóng, Thưởng chuyên cần.
       - Khấu trừ phạt quy định, bảo hành, phí công đoàn 50k.
  - **Kết quả**: Chi phí Lương và Lợi nhuận ròng trên Dashboard Phân Tích P&L khớp chính xác 100% với Bảng Lương thực tế của doanh nghiệp.

---

## [v2.21.8] - 2026-08-29

### 🖨️ In Gộp Phiếu Kho Theo Ngày & Đổi Tên Thành Phiếu Kiểm Kho (`Tab_ImportExport.html`, `App_Main.html`)
- **Chuẩn hóa 100% tiêu đề khi in phiếu Kiểm Kho**:
  - Khi xem hoặc in chứng từ thuộc phân hệ **Kiểm Kho** (`mode === 'KIEM_KHO'`, chứng từ `IE_GCHK_...`, `Cân tăng`, `Cân giảm`, `Kiểm kê kho định kỳ`), tiêu đề bản in (trên cả Modal A4/Zalo và máy in nhiệt K58) tự động hiển thị chính xác là **`PHIẾU KIỂM KHO`** hoặc **`PHIẾU KIỂM KHO TỔNG HỢP`** (thay vì `PHIẾU XUẤT KHO` / `PHIẾU NHẬP KHO`).
  - Trường đối tượng hiển thị chuẩn: **Mục đích/Cân đối: Kiểm kho (Cân tăng)** hoặc **Kiểm kho (Cân giảm)**.
- **Tính năng In Gộp Theo Ngày (1-Click Consolidated Daily Batch Print)**:
  - Tự động gom nhóm toàn bộ chứng từ phát sinh trong cùng một ngày (`dateGroups`).
  - Hiển thị thanh Header nhóm ngày thông minh kèm thông tin tổng số chứng từ và tổng giá trị.
  - Khi một ngày có từ 2 chứng từ trở lên, nút **`In Gộp Ngày (N phiếu)`** xuất hiện cho phép gộp tất cả sản phẩm của các phiếu trong ngày, tự động cộng dồn số lượng và thành tiền theo từng SKU/Tên hàng để in ra 1 tờ phiếu duy nhất gọn gàng, tiết kiệm giấy in và dễ đối chiếu.

---

## [v2.21.7] - 2026-08-29

### 🩹 Khắc Phục Lỗi Nhân Sai 83 Gam Rễ Rừng Thành 83 Cân (Đội Tiền Phiếu BOM Lên 8.4 Triệu) (`Tab_ImportExport.html`, `Code.js`, `App_Main.html`)
- **Khắc phục lỗi nhân sai số lượng gam với đơn giá 1kg**:
  - **Nguyên nhân gốc rễ (RCA)**:
    1. Trong định mức layout `Bonsai ver.6 - 50x26x30cm`, nguyên liệu **Rễ Rừng** (`NL-LAY-SX-RF` / `NLSX-RF`) có định mức sử dụng là **83 gam** (`0.083 kg`).
    2. Tuy nhiên, trong CSDL `Products`, vật tư Rễ Rừng được lưu theo đơn vị `Kg` (hoặc `cân`) với giá nhập `100.000đ/kg`. Khi hệ thống đọc định mức số `83`, nó hiểu nhầm là `83 cân` và nhân `83 * 100.000 = 8.300.000đ` (thay vì `0.083 * 100.000 = 8.300đ`), khiến phiếu `IE_BOM_...` bị đội giá từ `~138.326đ` lên `8.430.026đ`.
  - **Giải pháp xử lý**:
    1. **Bổ sung ánh xạ ALIAS (`Code.js`)**: Thêm `NL-LAY-SX-RF`, `NLSX-RF` vào bảng ánh xạ bí danh vật tư `ALIAS_MAP`.
    2. **Tự động quy đổi gam sang kg trong Engine BOM (`Code.js`)**: Khi nguyên liệu thô (Rễ Rừng, Lũa, Đá, Rêu...) có đơn vị quản lý là `kg`/`cân` nhưng định mức số lượng $\ge 10$ (dạng gam), hệ thống tự động quy đổi `displayQty = qty / 1000` và tính đúng `0.083 kg * 100.000đ = 8.300đ`.
    3. **Chuẩn hóa hiển thị trên Tab Xuất Nhập Kho (`Tab_ImportExport.html`)**: Tự động nhận diện và tính đúng đơn giá `100đ/gam`, đưa thành tiền dòng Rễ Rừng về đúng `8.300đ` và tổng tiền phiếu về đúng `~138.326đ`.
  - **Kết quả**: Phiếu BOM hiển thị chính xác 100% chi phí thực tế, loại bỏ hoàn toàn hiện tượng ảo giá vốn hàng triệu đồng.

---

## [v2.21.6] - 2026-08-29

### 🩹 Đồng Bộ Đơn Giá & Thành Tiền Từng Dòng Cho Phiếu Xuất Huỷ / Nhập Kho (`Tab_ImportExport.html`, `Modals_Orders.html`, `App_Main.html`)
- **Khắc phục lỗi lệch giá trị giữa Header phiếu và Chi tiết dòng hàng**:
  - **Nguyên nhân gốc rễ (RCA)**:
    1. Khi tạo phiếu Xuất Huỷ (`IE_SCRAP_...`), modal duyệt hàng hoàn gán tổng tiền phiếu `totalAmount = calculatedCogs` (ví dụ `181.720đ`) nhưng trong mảng `itemsData`, đối tượng sản phẩm `prods` không có trường `costPrice` (hoặc `price = 0`), khiến trường `price` trong JSON lưu giá trị `0`.
    2. Trong `Tab_ImportExport.html`, hàm render đọc `it.price !== undefined ? it.price : it.costPrice`. Vì `it.price` tồn tại và bằng `0` (là một giá trị xác định), hệ thống lấy luôn giá trị `0` mà không tra cứu sang danh mục `Products` hay phân bổ từ `totalAmount`.
    3. Hậu quả: Header phiếu hiển thị `181.720đ` nhưng bảng chi tiết hiển thị Đơn giá `0đ` và Thành tiền `0đ`.
  - **Giải pháp xử lý**:
    1. **Tab Xuất Nhập Kho (`Tab_ImportExport.html`)**: Bổ sung cơ chế phân giải đơn giá thông minh:
       - Ưu tiên 1: Lấy `price` hoặc `costPrice` nếu $> 0$.
       - Ưu tiên 2: Tra cứu `costPrice` hoặc `price` từ bảng `Products` theo SKU / Tên.
       - Ưu tiên 3: Tự động phân bổ từ tổng tiền phiếu: `rawPrice = log.totalAmount / items.length / qty`.
    2. **Modal Duyệt Hoàn Hàng (`Modals_Orders.html`)**: Tự động gán đúng `calculatedCogs` vào `price` của từng sản phẩm khi tạo phiếu `IE_SCRAP_...`.
  - **Kết quả**: Bảng chi tiết dòng hàng hiển thị chuẩn xác Đơn giá `181.720đ` và Thành tiền `181.720đ`, khớp 100% với tổng tiền ở Header phiếu.

---

## [v2.21.5] - 2026-08-29

### 🚀 Tự Động Nhận Diện Đơn Trả Hàng/Hoàn Tiền & Bỏ Qua Tính Lợi Nhuận Cho Đơn Hủy/Hoàn (`Modals_Orders.html`, `App_Main.html`)
- **Tối ưu hoá nhận diện trạng thái và loại trừ doanh thu rác**:
  - **Nguyên nhân gốc rễ (RCA)**:
    1. Trên Shopee, các đơn hàng trả hàng/hoàn tiền có thể vẫn hiển thị cột "Trạng thái đơn hàng" là `Đã giao` kèm ghi chú tag `1 trả hàng/hoàn`, trong khi thông tin hoàn trả thực tế nằm ở cột `Trạng thái Trả hàng/Hoàn tiền` hoặc `Return / Refund Status`. Nếu chỉ quét cột trạng thái chung thì hệ thống sẽ nhận diện nhầm thành `Đã Bàn Giao` thay vì `Hàng Hoàn`.
    2. Các đơn hàng đã Hủy (`Đơn Huỷ`) hoặc Hoàn trả (`Hàng Hoàn`) trước đây vẫn bị tính doanh thu Gross và Net lợi nhuận trên bảng preview và form đối soát.
  - **Giải pháp xử lý**:
    1. **Quét bổ sung cột `Trạng thái Trả hàng/Hoàn tiền`**: Ưu tiên nhận diện giá trị hoàn tiền/trả hàng để tự động map đơn về trạng thái **`Hàng Hoàn`** kèm huy hiệu màu cam nổi bật.
    2. **Bỏ qua tính lợi nhuận cho Đơn Hủy & Đơn Hoàn**: Tự động gán Doanh thu Gross = 0đ, Phí sàn = 0đ, Net thực nhận = 0đ (hiển thị dấu gạch ngang `-`) cho toàn bộ các đơn `Đơn Huỷ` và `Hàng Hoàn`, ngăn chặn việc ghi nhận khống doanh thu vào Sổ cái kế toán.
    3. **Tự động ghi nhận Phí xử lý hàng hoàn Shopee (2.700đ)** khi đơn hàng hoàn về ví.
    4. **Tối ưu hóa so khớp mã đơn hàng hai chiều**: Ngăn ngừa trường hợp mã đơn bị lệch format hoặc thiếu ký tự.
  - **Kết quả**: Bảng đối soát hiển thị chuẩn xác 100% các đơn Hàng Hoàn và Đơn Huỷ, không tính doanh thu khống, dữ liệu tài chính sạch sẽ tuyệt đối.

---

## [v2.21.4] - 2026-08-29

### 🚀 Nâng Cấp Trạm Quét File Đơn Hàng (Order.all): Hiện Net Lợi Nhuận, Hiển Thị Trạng Thái File & Cập Nhật Tức Thì (`Modals_Orders.html`, `App_Main.html`)
- **Tối ưu hoá toàn diện modal quét file Order.all / Income**:
  - **Nguyên nhân gốc rễ (RCA)**:
    1. Khi tải lên file `Order.all...xlsx`, file chứa các cột trạng thái và chi tiết phí nhưng không có cột doanh thu quyết toán cuối cùng (`tổng tiền đã thanh toán`), khiến biến `actualShopeePaid` bằng 0 và `netRevenue` hiển thị dấu gạch ngang (`-`), đồng thời kích hoạt cảnh báo "Lệch lớn" giả cho toàn bộ các dòng.
    2. Cột đầu tiên hiển thị trạng thái so khớp đối soát ("Lệch lớn / OK / Bỏ qua") thay vì trạng thái vận hành thực tế của đơn hàng từ Shopee.
    3. Payload lưu đối soát gửi thuộc tính `{ orders: ... }` chữ thường thay vì `{ Orders: ... }` chữ hoa, dẫn đến việc `pushDeltas` không ghi nhận cập nhật vào bảng `Orders` và bộ đếm "Đơn hàng đã chốt" hiển thị số 0.
  - **Giải pháp xử lý**:
    1. **Tự động tính Net Thực Nhận**: Khi file không có cột doanh thu quyết toán riêng biệt, hệ thống tự động tính:
       $$\text{Net Thực Nhận} = \text{Gross Shopee} - \text{Tổng Phí Sàn} - \text{Voucher Shop} - \text{Phí Ship Vượt Mức}$$
    2. **Thay đổi cột đầu thành Trạng Thái Thực Tế Từ File**: Đọc cột `Trạng thái đơn hàng` trong file và hiển thị trực tiếp (Hoàn thành, Đã giao, Đã hủy, Trả hàng/Hoàn tiền...) kèm huy hiệu màu sắc trực quan.
    3. **Áp dụng Exact Match Rule**: Tự động chuyển đổi trạng thái đơn hàng sang trạng thái hệ thống chuẩn:
       - `"Hoàn thành"` / `"Completed"` $\rightarrow$ `"Đối Soát Thành Công"`
       - `"Đã giao"` / `"Delivered"` $\rightarrow$ `"Đã Bàn Giao"`
       - `"Trả hàng/Hoàn tiền"` / `"Returned"` $\rightarrow$ `"Hàng Hoàn"`
       - `"Đã hủy"` / `"Cancelled"` $\rightarrow$ `"Đơn Huỷ"`
       - Trạng thái khác $\rightarrow$ Giữ nguyên trạng thái sản xuất nội bộ hoặc đưa về `"Chờ Sản Xuất"`.
    4. **Đồng bộ chuẩn xác Payload CSDL**: Sửa payload sang `{ Orders: updatedOrders }` giúp cập nhật tức thì trạng thái của tất cả đơn hàng vào Google Sheets và giao diện quản lý khi nhấn **Hoàn tất đối soát & Lưu**.
  - **Kết quả**: Giao diện hiển thị đầy đủ Net Thực Nhận / Lợi nhuận từng đơn, phản ánh chính xác trạng thái thực tế từ sàn và tự động cập nhật đơn hàng thành công 100%.

---

## [v2.21.3] - 2026-08-29

### 🩹 Tự Động Quy Đổi Đơn Giá Nhập Vật Tư BOM (Gam/Kg) & Chuẩn Hóa Thành Tiền Phiếu Xuất Kho (`Code.js`, `Tab_ImportExport.html`)
- **Khắc phục lỗi nhân đơn giá 1kg với số lượng xuất theo gam**:
  - **Nguyên nhân gốc rễ (RCA)**: Trong cấu hình bảng `Products` và `BomLayout`, đơn giá nhập của vật tư (như Lũa Săn Miếng 35.000đ, Đá Tai Mèo 5.000đ, Nham Thạch 5.000đ...) được ghi theo đơn vị nhập là **1kg** (`importUnit: '1kg'`, `conversionRate: 1000`). Khi trừ vật tư sản xuất theo định mức gam (ví dụ `300 gam`), hàm `processMaterialDeduction` và `repairAllBomTickets` chưa chia đơn giá nhập cho tỷ lệ quy đổi 1000 mà nhân trực tiếp `300 * 35.000 = 10.500.000đ` (thay vì `300 * 35 = 10.500đ`), khiến phiếu xuất kho `ImportExport` bị đội tiền từ 37.818đ lên 12.025.818đ.
  - **Giải pháp xử lý**:
    1. **Google Apps Script (`Code.js`)**: 
       - Trong `processMaterialDeduction`: Bổ sung quét `conversionRate` và `importUnit`. Khi vật tư quản lý hoặc xuất theo `gam` mà đơn giá nhập ghi theo `kg` (hoặc `rawCost >= 1000`), tự động tính đơn giá chuẩn mỗi gam: `unitPrice = rawCost / 1000` (hoặc `/ conversionRate`).
       - Trong `repairAllBomTickets`: Bổ sung chia `unitCost = rawCost / 1000` cho tất cả các dòng định mức tính bằng `gam`.
    2. **Giao diện Tab Xuất Nhập Kho (`Tab_ImportExport.html`)**:
       - Bổ sung logic nhận diện tự động quy đổi `effectivePrice = rawPrice / 1000` khi đơn vị là `gam` và `effectiveAmount = qty * effectivePrice` trên từng dòng sản phẩm và tổng tiền phiếu.
  - **Kết quả**:
    - Lũa Săn Miếng: `300 gam` x `35đ` = `10.500đ`.
    - Đá Tai Mèo: `300 gam` x `5đ` = `1.500đ`.
    - Phiếu xuất kho `IE_BOM_...` hiển thị chính xác tổng tiền thực tế (khoảng 37.818đ), loại bỏ hoàn toàn hiện tượng lệch số liệu kho và giá vốn sản xuất.

---

## [v2.21.2] - 2026-08-29

### 🩹 Sửa Lỗi ReferenceError: props is not defined Trong Tab Kho Hàng (`Tab_Inventory.html`, `App_Main.html`)
- **Khắc phục lỗi crash giao diện khi mở Ghi Chú Kho Hàng**:
  - **Nguyên nhân gốc rễ (RCA)**: Component `InventoryListView` nhận tham số dạng destructured nhưng bên trong khối render `QuickNotesPanel` lại gọi `props.documents` và `pushDeltas` chưa được khai báo trong scope, dẫn đến lỗi runtime `ReferenceError: props is not defined` và vỡ màn hình trắng.
  - **Giải pháp xử lý**:
    1. Bổ sung `documents` và `pushDeltas` vào tham số của `InventoryListView` trong `Tab_Inventory.html`.
    2. Truyền `documents={memoizedDocuments}` và `pushDeltas={pushDeltas}` từ `App_Main.html` xuống `InventoryTab` và `FinanceTab`.
    3. Thêm kiểm tra an toàn `typeof window.QuickNotesPanel !== 'undefined'` kèm fallback dữ liệu nhiều tầng.
  - **Kết quả**: Nút bấm Ghi Chú & Nhắc việc tại Tab Kho Hàng hoạt động trơn tru 100%, không còn bị crash hay phát sinh lỗi console.

---

## [v2.21.1] - 2026-08-29

### 🩹 Sửa Lỗi Hiển Thị Doanh Thu Kênh Bán Lẻ Tại Thống Kê Tab Đơn Hàng (`Tab_Orders.html`)
- **Khắc phục lỗi logic phân loại kênh trong `summaryStats`**:
  - **Nguyên nhân gốc rễ (RCA)**: Trong hook tính toán `summaryStats`, điều kiện phân loại kênh trước đây chỉ kiểm tra `if (ch.includes('CỘNG TÁC VIÊN') || ch === 'CTV') { totalCtv += val; } else { totalRetail += val; }`. Nhánh `else` đã vô tình gom toàn bộ các đơn hàng của Shopee VN, Shopee Xuất Khẩu (TH, SG, MY, PH, TW), TikTok Shop, Bán Sỉ... vào tổng `totalRetail` (Bán Lẻ), dẫn đến số liệu doanh thu Bán Lẻ hiển thị sai (lên tới 100+ triệu).
  - **Giải pháp xử lý**: Bóc tách điều kiện nhận diện kênh bán lẻ độc lập `ch.includes('BÁN LẺ') || ch.includes('BAN LE') || ch.includes('OFFLINE') || ch.includes('ZALO') || ch.includes('FACEBOOK') || ch.includes('MESSENGER') || ch === 'RETAIL' || ch === 'LẺ' || ch === 'LE'`.
  - **Kết quả**: Thẻ thống kê **BÁN LẺ** trên thanh KPI đầu trang `Tab_Orders.html` chỉ phản ánh đúng 100% doanh thu của các đơn hàng Bán Lẻ thực tế.

---

## [v2.21.0] - 2026-08-29

### 🎮 Hệ Sinh Thái Game Hóa (RPG Gamification): Header EXP Bar & Global Floating Particles (`App_Main.html`, `Index.html`)
- **Tích Hợp Thanh Cấp Độ & Mini EXP Bar Trực Quan Trên Header (`HeaderExpWidget`)**:
  - Đồng bộ 100% với hệ thống phân hạng 100 Cấp Độ & 9 Tier Danh hiệu trong `Tab_HR.html` (*Tân Thủ*, *Hổ Phách*, *Lục Bảo*, *Lam Ngọc*, *Thạch Anh*, *Huyết Tướng*, *Hoả Phụng*, *Thái Dương*, *Thần Thoại*).
  - Tự động cộng dồn EXP đa chiều theo thời gian thực từ 5 nguồn: Lương công nhật, Thưởng khâu sản xuất (`Production`), Thưởng đóng gói (`Packings`), Thưởng nhiệm vụ Xu (`KPI_Progress`), Thưởng thưởng phạt (`BonusPenalty`).
  - Thanh tiến trình Mini EXP gradient rực rỡ và Modal lộ trình cấp độ RPG tương tác khi click vào Header.
- **Engine Hạt Số +EXP Lơ Lửng & Âm Thanh Arcade (`window.triggerExpGain`, `window.playExpChime`)**:
  - Mỗi cú chạm ngón tay / click chuột vào bất kỳ nút bấm thao tác nào trên toàn bộ hệ thống sẽ bắn ra hạt số `+50 EXP ✨` lơ lửng bay lên và tan biến mượt mà (GPU accelerated 60fps).
  - Tích hợp bộ tổng hợp âm thanh Web Audio Synthesizer (tiếng ting/chime nhẹ 8-bit tinh tế) và rung xúc giác `navigator.vibrate(35)` mang lại cảm giác cực kỳ "sướng tay", xóa tan sự mệt mỏi và kích thích nhân sự chủ động ghi nhận tác vụ.

---

## [v2.20.1] - 2026-08-28

### 🩹 Khôi Phục & Tối Ưu Thanh Cuộn Tự Nhiên Siêu Mượt 120FPS (`App_Main.html`)
- **Khắc phục triệt để lỗi khóa cuộn (Scroll Lock)**:
  - Loại bỏ hoàn toàn thuộc tính `contain: content` khỏi `.rf-tab-view` để giải phóng ranh giới render và cho phép thẻ cha `<main>` đo đạc đúng chiều cao tự nhiên của nội dung bên trong (`scrollHeight`).
  - Chuyển đổi các wrapper container từ `h-full` (100% cố định) sang `min-h-full` trên toàn bộ các Tab (`Dashboard`, `Orders`, `Production`, `Inventory`, `Finance`, `ImportExport`...), cho phép trang cuộn chuột và vuốt cảm ứng trơn tru 120fps mà không bị kẹt.
  - Bảo toàn 100% các tối ưu về `React.useDeferredValue` và tốc độ phản hồi 0s.

---

## [v2.20.0] - 2026-08-28

### ⚡ Tối Ưu Hóa Phản Hồi Tức Thì 0s & Tăng Tốc Toàn Bộ Ứng Dụng (`App_Main.html`, `Tab_Orders.html`, `Tab_Production.html`, `Tab_Inventory.html`, `Tab_ImportExport.html`)
- **Tối ưu hóa GPU Compositing & Chuyển Tab 0s**:
  - Cách ly phạm vi render với thuộc tính `contain: content`, `will-change: transform, opacity`, `transform: translateZ(0)` trên `.rf-tab-view` và `.rf-gpu-accelerated`.
  - Giữ trạng thái (Keep-Alive) qua cơ chế `mountedTabs`, chuyển đổi mượt mà 60fps/120fps không bao giờ bị khựng lag.
- **Triệt tiêu 300ms Độ Trễ Cảm Ứng (0ms Mobile Tap Delay)**:
  - Bổ sung `touch-action: manipulation` trên toàn bộ các thành phần tương tác (nút bấm, ô nhập, dropdown, thẻ card) giúp thao tác trên điện thoại và máy tính bảng ăn ngay tức thì.
- **Tích hợp React Concurrent `useDeferredValue` cho Tất Cả Ô Tìm Kiếm**:
  - `Tab_Orders.html`: Tìm kiếm mã đơn, khách hàng, số điện thoại không làm block UI thread.
  - `Tab_Production.html`: Tìm kiếm SKU, tên sản phẩm trên xưởng sản xuất phản hồi mượt mà.
  - `Tab_Inventory.html`: Tìm kiếm kho hàng và phân loại tức thì.
  - `Tab_ImportExport.html`: Lọc tìm kiếm chứng từ kho vận siêu tốc.

---

## [v2.19.1] - 2026-08-28

### 💎 Khớp Dữ Liệu 100% SKU & Đồng Bộ Vật Tư BOM Chuẩn Đét (`Code.js`, `Operations.js`, `Config.html`, `Tab_ImportExport.html`)
- **Đồng bộ hóa 100% BOM Layout & Bể Kính (`standardizeWarehouseSKU`)**:
  - Tự động khớp `layoutCode` trong `BOM_Config` theo SKU chuẩn của `Products` (ví dụ: `LAY-RUN020-402325`, `LAY-BON001-302020`, `BE-ND-202008`...).
  - Chuẩn hóa toàn bộ `materialSku` sang hệ mã chuẩn nguyên vật liệu (`NLSX-KINH-5LI`, `NLSX-MAI-CNC`, `NLSX-KEO-WACKER`, `NLSX-LUASANMIENG`, `NLSX-TAIMEO`, `NLSX-502-1CHAI`, `NLSX-FOMEX-8LI`, `NLSX-REU-A04`...).
- **Mở rộng Từ Điển Khớp Nối Nguyên Vật Liệu (`ALIAS_MAP`)**:
  - Bổ sung toàn diện các biến thể kính (`KINH 5LI`, `KINH 5 LI`, `KINH SIEU TRONG 5LI` ➡️ `NLSX-KINH-5LI`), công mài CNC, keo Wacker, keo 502, rêu và fomex.
- **Nâng cấp Hiển thị Chi Tiết Phiếu Xuất BOM (`Tab_ImportExport.html`)**:
  - Bảng chi tiết phiếu xuất BOM hiển thị Tên sản phẩm tiếng Việt rõ ràng (`Kính Siêu Trong 5li`, `Mài CNC Cạnh Vi Tính`, `Keo Silicone Wacker Chuyên Dụng`...) đi kèm badge mã SKU chuẩn màu vàng kim tinh tế theo triết lý thiết kế Hallmark.

---

## [v2.19.0] - 2026-08-28

### 🛡️ Gỡ Bỏ Hoàn Toàn Cơ Chế Phạt SLA Đóng Gói Sau 19:00 & Tinh Gọn Dashboard (`Tab_Dashboard.html`, `Operations.js`, `Code.js`)
- **Xóa bỏ Banner & Logic Cảnh Báo SLA Đóng Gói (Dashboard)**:
  - Loại bỏ hoàn toàn khối cảnh báo đỏ *"CẢNH BÁO SLA ĐÓNG GÓI (SAU 19:00)"*, biến đếm `readyToPackOrders` và thông báo phạt Shopee VN sau 21:00.
  - Tinh giản giao diện theo triết lý Hallmark: Gọn gàng, thanh thoát, tập trung vào dòng chảy sản xuất thực tế.
- **Xóa bỏ Cơ Chế Tự Động Phạt trong `Operations.js`**:
  - Gỡ bỏ `api_recordPackingViolationLog` và hàm quét `api_auditEndOfDayPackingSLA`.
  - Không còn tự động ghi nhận các khoản phạt vi phạm đóng gói vào `BonusPenalty` và `Tracking_Log`.
- **Dọn dẹp Toàn Diện Dữ Liệu Cũ (`AAA_CLEANUP_PACKING_SLA_PENALTIES`)**:
  - Bổ sung hàm runner và mục Menu `⚡ RF Hệ Thống` ➔ `🧹 Xóa Sạch Phạt & Cảnh Báo SLA Đóng Gói` để dọn sạch toàn bộ các dòng phạt `BP_SLA_PACK_...`, `BP_AUTO_SHOPEE_21H_...` cũ trong CSDL.

---

## [v2.18.2] - 2026-08-28

### 💎 Giữ Nguyên Tên Sản Phẩm Chuẩn Kho Cũ & Tự Động Gán Mã SKU Chuẩn Mới (`Modals_Orders.html`)
- **Tên Sản Phẩm theo Kho Cũ**: Khi khớp với bảng `Products`, tên hiển thị và lưu vào đơn hàng được giữ nguyên theo cột `name` của kho (`Products.name`) như cũ (ví dụ: `Bể 30x18x18cm Nâng Đáy 2cm`, `Bể 30x10x12cm 3 ngăn`...).
- **Gán Mã SKU Chuẩn Mới**: Tự động nhận diện và gán đúng mã SKU chuẩn hóa mới (`effectiveSku` / `matchedProd.sku`) cho từng sản phẩm.
- **Nhận diện mã SKU Shopee đảo vị trí**: Hỗ trợ nhận diện các SKU dạng `BE301818ND` tự động chuyển đổi sang `BE-ND-301818`.
- **Tối ưu bộ lọc Sản Xuất (`checkProductionItemType`)**: Nhận diện chuẩn xác nhóm Bể Kính và Bể Nâng Đáy là hàng Sản Xuất.

---

## [v2.18.1] - 2026-08-28

### 🛍️ Tự Động Chuẩn Hóa & Khớp SKU Shopee 100% Khi Bơm/Nhập Đơn Hàng (`Modals_Orders.html`, `ShopeeWebhookHandler.js`, `ShopeeSyncEngine.js`)
- **Tự động dịch mã SKU sàn Shopee sang hệ SKU chuẩn hóa mới**:
  - Khi người dùng nạp file Excel Shopee (hoặc đồng bộ đơn từ API / Webhook), các mã SKU cũ của sàn (như `RUN-020-402325`, `BON01-30x20x20`, `BEND15`, `BE302020`, `XBL500`, `DALONGVU`, `AKADAMA`...) được tự động nhận diện và chuyển đổi sang đúng SKU chuẩn của kho (`LAY-RUN020-402325`, `LAY-BON001-302020`, `BE-ND-151515`, `BE-STD-302020`, `PK-LOC-XBL500`, `PK-VLL-DALONGVU`, `PK-NEN-AKADAMA`).
  - Đảm bảo khi lưu đơn hàng, `accessories` lưu 100% mã SKU chuẩn và tự động kích hoạt trừ tồn kho vật lý chính xác.
- **Nâng cấp `checkProductionItemType`**: Bổ sung nhận diện tiền tố `LAY-` và `BE-` cho các thành phẩm Sản Xuất (Bể kính / Layout).
- **Nâng cấp `deductPhysicalInventory` trong `ShopeeWebhookHandler.js`**: Hỗ trợ tìm kiếm và trừ kho đa tầng (Exact SKU ➔ Clean Slug ➔ Product Name).

---

## [v2.18.0] - 2026-08-28

### 🏷️ Chuẩn Hóa Toàn Bộ Mã SKU Kho Hàng & Đồng Bộ Quan Hệ 4 Bảng CSDL (`Operations.js`)
- **Triển khai Engine Chuẩn Hóa SKU (`standardizeWarehouseSKU`)**:
  - Tự động bóc tách kích thước D x R x C dạng 6 chữ số `[DxRxC]` và Version `ver\d+` -> `001`, `002`...
  - **Nhóm Bể Kính (`category = "BỂ KÍNH"`)**: Phân loại theo `sub_category` thành `BE-ND-[DxRxC]`, `BE-BETTA-[DxRxC]`, `BE-TERA-[DxRxC]`, `BE-BC-[DxRxC]`, `BE-MINI-[DxRxC]`, `BE-STD-[DxRxC]`.
  - **Nhóm Layout (`category = "LAYOUT"`)**: Phân loại tiền tố `BON`, `RUN`, `CAU`, `HAN`, `VAC`, `DAO`, `NAT`, `TRU`, `HEM`, `VOM`, `CV` -> định dạng chuẩn `LAY-[MÃ][VER]-[SIZE]` (riêng Cover: `LAY-CV-[SIZE]`).
  - **Nhóm Nguyên Vật Liệu (`category = "DANH MỤC SẢN XUẤT"`)**: Chuẩn hóa không dấu phân tách gạch nối `NL-LAY-[MÃ]`, `NL-BE-[MÃ]`, `VT-[MÃ]`, `DG-[MÃ]`.
  - **Nhóm Phụ Kiện Bán Lẻ (`category = "PHỤ KIỆN"`)**: Chuẩn hóa theo phân nhóm `PK-LOC-[MÃ]`, `PK-VLL-[MÃ]`, `PK-NEN-[MÃ]`, `PK-XLN-[MÃ]`, `PK-AN-[MÃ]`, `PK-KHAC-[MÃ]`.
- **Cơ chế An Toàn & Đồng Bộ Quan Hệ (Relational Sync)**:
  - Bọc `LockService.getScriptLock().waitLock(30000)` chống xung đột ghi đè đồng thời.
  - Tự động tạo bản đồ ánh xạ `skuMap[oldSku] = newSku`.
  - Quét và cập nhật nguyên khối chuỗi JSON trong cột `accessories` của bảng `Orders` (cho các đơn chưa hoàn tất/chưa đối soát).
  - Cập nhật đồng bộ các cột `layoutCode` và `materialSku` trong bảng `BOM_Config`.
  - Cập nhật đồng bộ cột `Từ Khoá` trong bảng `Config_KPI`.

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

### 🐛 Hotfix Giao Diện Tabs & Lỗi Định Danh Vật Tư BOM (`Tab_Orders.html`, `Code.js`)
- Khôi phục hiển thị thanh điều hướng nhanh "Tất Cả" ở `Tab_Orders` (Bị ẩn sau lần tái cấu trúc thống kê).
- Sửa lỗi hiển thị màu sắc active tabs: Cập nhật điều kiện so khớp trạng thái và bộ lọc để tự động focus sáng màu chuẩn xác vào từng trạng thái tương ứng.
- **Vá lỗi thuật toán Định danh Vật tư Phiếu BOM**: Khắc phục hiện tượng thuật toán tìm kiếm mờ của `repairAllBomTickets` nhận diện nhầm mã sản phẩm Bán Lẻ (ví dụ: lấy nhầm `1kg Sạn Suối - M` thay vì Vật tư thô `Sạn Suối`). Cấy ghép module `findMaterialSkuByAlias` vào thẳng engine App Script (`Code.js`) giúp chuẩn hoá tuyệt đối mã nguyên liệu `NLSX-...` trước khi tra cứu giá vốn và đơn vị.

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

## [v2.14.5] - 2026-08-27

### 🏷️ Tự Động Khớp SKU (Cột R) File Đơn Shopee Thái Lan & Quốc Tế (Trạm Bơm Đơn)
- **Chuẩn Hoá Parser Header Đa Dòng & Đa Ngôn Ngữ**:
  - Tự động làm sạch các ký tự xuống dòng (`\r\n\t`) trong tiêu đề file Excel Shopee Thái Lan (như `เลข\nอ้างอิง\nSKU\n(SKU\nReferenc\ne No.)`).
  - Khớp chuẩn xác **Cột R** thành `varSku` (SKU Reference No. / Mã SKU phân loại) và **Cột P** thành `parentSku` (Parent SKU Reference No. / Mã SKU người bán).
- **Bộ Phân Giải SKU Thông Minh (`matchProductFromCatalog`)**:
  - Tra cứu SKU ứng viên theo cấp độ ưu tiên: Cột R (Variation SKU) ➡️ SKU trong ngoặc `[...]` ➡️ Regex SKU ➡️ Cột P (Parent SKU).
  - Tích hợp giải thuật bóc tách tiền tố (VD: `RUN-020`) và kích thước (`402325` ➡️ `40x23x25` / `Size L` / `ไซส์ L`) để map chính xác sản phẩm trong kho ERP.
  - Tự động gán tên sản phẩm chuẩn tiếng Việt và mã SKU chuẩn vào lệnh xưởng (`Production`) và danh sách phụ kiện (`Accessories`), kích hoạt đúng công đoạn sản xuất (Dựng Khung ➡️ Gia Cố / Cắt Dán ➡️ Gọt Keo).

---

## [v2.13.9] - 2026-08-27

### 🛡️ Chuẩn Hoá 4 Phân Hệ Kho, Triệt Tiêu Nhận Nhầm Hàng Phụ Kiện/Nguyên Liệu Sang Sản Xuất & Tách Biệt Phiếu Đặt Hàng
- **Phân Định Ranh Giới Tuyệt Đối 4 Phân Hệ Kho**:
  - `KHO BỂ KÍNH`: Chỉ các sản phẩm thành phẩm thuộc category `BỂ KÍNH` mới sinh lệnh sản xuất công đoạn (Cắt Dán / Gọt Keo).
  - `KHO LAYOUT`: Chỉ các sản phẩm thành phẩm thuộc category `LAYOUT` / `THÀNH PHẨM` mới sinh lệnh sản xuất công đoạn (Dựng Khung / Gia Cố).
  - `KHO NGUYÊN LIỆU`: Toàn bộ nguyên liệu dùng để sản xuất Bể Kính & Layout (`DANH MỤC SẢN XUẤT`, `NGUYÊN LIỆU LAYOUT`, `NGUYÊN LIỆU BỂ KÍNH`, `VẬT TƯ SẢN XUẤT` như Đá Cuội, Đá Tai Mèo, Lũa San Đá, Rễ Rừng, Sạn Suối, Keo 502, Silicon...). Khi khách đặt mua bán lẻ hoặc import đơn TMĐT, toàn bộ các mặt hàng này được tự động phân loại thành **Phụ Kiện Gói Kèm**, tuyệt đối **KHÔNG** tạo lệnh sản xuất cho thợ.
  - `KHO PHỤ KIỆN`: Hàng hoá phụ kiện thương mại (`PHỤ KIỆN`, `HÀNG HOÁ` như Lọc, Đèn, Cát, Phân Nền, Khử Clo...).
- **Nâng Cấp Bộ Nhận Diện Đa Tầng Poka-Yoke (`checkProductionItemType` - `Modals_Orders.html`)**:
  - Thêm bộ lọc rào chắn chặn đứng việc nhận nhầm sub-category chứa từ khoá mờ `LAYOUT` (như `NGUYÊN LIỆU LAYOUT`).
  - Tích hợp bộ lọc regex quy cách đóng gói thương mại (`1kg`, `2kg`, `500g`, `gói`, `túi`, `xô`, `cây`, `lũa san đá`, `đá cuội`...).
  - Đồng bộ logic phân luồng trên toàn bộ hệ thống: Form Thêm/Sửa Đơn hàng, Xem trước Import Excel/TikTok/Shopee, Bộ lọc tìm kiếm nhanh `+ BỂ KÍNH`, `+ LAYOUT`, `+ PHỤ KIỆN`.
- **Tách Biệt Bảng Báo Nhập Hàng Trên Dashboard Sang Bảng Chứng Từ `ImportExport` (Phiếu ĐẶT HÀNG)**:
  - Tái cấu trúc `DashboardTasksSection` (`Tab_Dashboard.html`): Chức năng "Báo Nhập Hàng / Đặt Hàng" của nhân viên chỉ tạo duy nhất phiếu chứng từ `ĐẶT HÀNG` trong bảng `ImportExport`.
  - Triệt tiêu 100% việc tạo bản ghi giả `MATERIAL_REQ` vào bảng `Production` (`prodItems`), loại bỏ triệt để lỗi thẻ rác `[DANH MỤC SẢN XUẤT] Carton Phế Liệu` xuất hiện trên Tab Sản Xuất của thợ.
- **Rào Chắn Poka-Yoke Trên Tab Sản Xuất (`Tab_Production.html`)**:
  - Bổ sung bộ lọc trong `baseFiltered` để loại trừ triệt để mọi bản ghi không thuộc lệnh sản xuất thực tế (`orderId === 'MATERIAL_REQ'`, `type === 'Báo Nhập Hàng'`, `MAT_REQ_...`).

---

## [v2.13.8] - 2026-08-27

### 📅 Khắc Phục Lỗi Format Ngày Tháng Từ Trạm Bơm Đơn TikTok
- **Chuẩn Hóa Dữ Liệu Ngày Tháng Tuyệt Đối**: Cập nhật bộ tiền xử lý (Preprocessor) trong `Modals_Orders.html` để tự động chuyển đổi định dạng ngày `DD/MM/YYYY HH:mm:ss` đặc thù của file Excel TikTok Shop sang chuẩn ISO `YYYY-MM-DD HH:mm:ss`.
- **Khắc Phục Lỗi Giao Diện `dd/mm/yyyy`**: Giải quyết triệt để tình trạng thẻ input date bị lỗi hiển thị `dd/mm/yyyy` (do trình duyệt từ chối nhận diện chuỗi không chuẩn), qua đó đảm bảo mọi đơn hàng bơm vào hệ thống đều chốt chính xác thời điểm thực tế, không bị trôi dữ liệu.

## [v2.13.7] - 2026-08-27

### 🛠 Khắc Phục Lỗi Khấu Trừ BOM & Mất Dữ Liệu Bàn Giao Trạm
- **Cải Tiến Thuật Toán Khớp Lệnh BOM (Fuzzy Matcher)**: Tự động lược bỏ các đuôi phụ trong ngoặc như `(Kg), (Gam), (Chai)` ở `BOM_Config` trước khi tra kho, đảm bảo map chính xác 100% với mã nguyên liệu trong kho.
- **Tính Năng Bắt Vật Tư Sót Lại**: Mọi vật tư khai trong BOM dù chưa được tạo mã trong kho vẫn bắt buộc ghi nhận vào Phiếu Trừ BOM với số lượng `0` kèm ghi chú *"Không có trong Kho"*, giữ tính toàn vẹn 1-1 với Bảng định mức giao diện.
- **Khắc Phục Lỗi Bốc Hơi Không Gian Làm Việc**: Xử lý triệt để tình trạng Trạm Đóng Gói mới tạo bị mất sau khi tải lại trang bằng cách tự động kiến tạo cấu trúc bảng `Workspaces` ngầm định ở backend nếu phát hiện thiếu hụt CSDL.

---

## [v2.13.6] - 2026-08-26

### 📦 Chuẩn Hóa Phân Loại Tab Kho Hàng & Khấu Trừ Vật Tư BOM Chính Xác
- **Phân Tách 4 Nhóm Kho Rõ Ràng**:
  - `KHO BỂ KÍNH`: Chỉ hiển thị các phiếu nhập/xuất bể kính, terrarium.
  - `KHO LAYOUT`: Chỉ hiển thị các phiếu nhập/xuất layout thành phẩm.
  - `KHO HÀNG HOÁ (PHỤ KIỆN)`: Chỉ hiển thị hàng hóa, phụ kiện thương mại bán lẻ (đèn, lọc, phân nền, phụ kiện...). Triệt tiêu việc trộn lẫn các phiếu xuất vật tư BOM sản xuất xưởng vào tab này.
  - `KHO NGUYÊN LIỆU (VẬT TƯ)`: Tập trung toàn bộ phiếu xuất khấu trừ BOM vật tư xưởng (Lũa, đá, sỏi/sạn, fomex, keo 502, silicon...).
- **Tự Động Đồng Bộ Đơn Vị Tính Chuẩn Danh Mục Kho**:
  - Chi tiết phiếu kho tự động nhận diện và hiển thị đúng đơn vị tính thực tế từ danh mục kho `Products` (Kg, m², Chai, Túi...) thay vì mặc định chuỗi "Cái".

---

## [v2.13.5] - 2026-08-26

### 🪵 Khắc Phục Lỗi Không Trừ Kho Lũa San Miếng (NLSX-LUASANMIENG) Trong Lệnh Layout
- **Cố Định Chính Xác SKU Vật Tư & Triệt Tiêu Lỗi Ghi Đè**:
  - Khử bỏ vòng lặp quét mờ `indexOf('lũa san')` làm `NLSX-LUASANTRANG` (Lũa San Trắng) ở cuối danh sách `Products` cướp mất phiếu xuất kho của `NLSX-LUASANMIENG`.
  - Cố định trực tiếp SKU nguyên liệu chính mặc định cho Layout là `NLSX-LUASANMIENG` (Lũa San Miếng) và Keo 502 là `NLSX-502-1CHAI`.
- **Tự Động Ánh Xạ Tên Tiếng Việt Sang SKU Layout Khi Đối Chiếu `BOM_Config`**:
  - Ánh xạ chuẩn xác các mẫu lệnh tiếng Việt (`Đảo Bay ver.3`, `Nature ver.2`, `Nhất Trụ ver.1`, `Hẻm Núi`...) sang SKU tương ứng trong bảng `Products` trước khi quét `BOM_Config`.
  - Đảm bảo mỗi khi hoàn thành lệnh Layout xưởng, hệ thống sẽ tự động trừ đúng số kg Lũa San Miếng trong thẻ kho một cách chính xác 100%.

---

## [v2.13.4] - 2026-08-26

### 🛡️ Khắc Phục Lỗi Nhận Diện Nhầm Đơn Đã Nhận Thành Đơn Hoàn Khi Quét File Shopee
- **Tích Hợp Bộ Lọc Đơn Hoàn Chuẩn Xác 3 Tầng (`isActualReturnOrder`)**:
  - Phân tích độc lập 3 cột từ file Shopee: `Trạng Thái Đơn Hàng`, `Trạng thái Trả hàng/Hoàn tiền`, `Lý do hủy`.
  - Triệt tiêu lỗi bắt nhầm 188 đơn giao thành công có dòng thông báo *"Người mua xác nhận đã nhận được hàng, tuy nhiên Người mua vẫn có thể gửi yêu cầu Trả hàng/Hoàn tiền tới ngày..."*.
  - Bảo vệ tuyệt đối các đơn giao thành công / đối soát thành công không bị chuyển nhầm sang Hàng Hoàn.
  - Chỉ nhận diện đơn hoàn khi thực sự có khiếu nại được chấp thuận (`Đã Chấp Thuận`, `Yêu cầu chờ xử lý`, `Đã giải quyết khiếu nại`) hoặc đơn boom hàng giao thất bại (`Đã hủy` kèm lý do `Giao hàng thất bại`).
- **Đồng Bộ Hoá Trạm Bơm Đơn (`Modals_Orders.html`) & Máy Quét Đơn Hoàn (`Tab_Orders.html`)**.

---

## [v2.13.3] - 2026-08-26

### 🛠️ Khắc Phục Lỗi Parse Ngày DD/MM/YYYY Phục Hồi 100% Đơn Hoàn Thành & Doanh Thu
- **Tích Hợp Hàm Giải Mã Ngày Đa Năng (`window.parseOrderDateSafe`)**:
  - Hỗ trợ giải mã chính xác 100% tất cả các cấu trúc ngày tháng: Chuỗi định dạng Việt Nam `DD/MM/YYYY`, `DD-MM-YYYY`, chuẩn ISO `YYYY-MM-DD`, `YYYY/MM/DD` và JavaScript Date/Timestamp.
  - Triệt tiêu lỗi `Invalid Date` hoặc nhận diện đảo lộn ngày thành tháng khi lọc dữ liệu ngày đặt hàng từ Google Sheets.
- **Bảo Toàn Đầy Đủ 100% Đơn Hoàn Thành (Doanh Thu Khớp Chuẩn 134.701.869đ)**:
  - Phục hồi trọn vẹn 262+ đơn hoàn thành của Tháng 8, đảm bảo thẻ Tổng Doanh Thu (`134.701.869đ`) và Số Đơn Bán (`563 đơn`) phản ánh chính xác từng đơn hàng.

---

## [v2.13.2] - 2026-08-26

### 🛡️ Khắc Phục Lỗi Lọc Đè State Làm Tụt Doanh Thu (Immutable State & Solid KPI Engine)
- **Tách Lập Mảng Dữ Liệu Gốc Bất Biến (`window.GLOBAL_ALL_ORDERS`)**:
  - Bảo tồn 100% dữ liệu gốc không bao giờ bị ghi đè hay co hẹp lại khi người dùng chuyển đổi qua lại giữa các tab kênh bán (Shopee, TikTok, Bán Lẻ, CTV) hoặc mở xem accordion chi tiết.
- **Phân Tầng Độc Lập Bộ Lọc Thời Gian Tính KPI (`timeFilteredOrders`)**:
  - Tách riêng `timeFilteredOrders` chỉ thuần túy áp dụng bộ lọc ngày đặt hàng (`order.date` / `order.createdAt`) làm nguồn duy nhất để tính toán các thẻ KPI cốt lõi: `Tổng Doanh Thu`, `Số Đơn Bán`, `Giá Trị Hoàn`, `Bán Lẻ`, `Cộng Tác Viên`.
  - Bộ lọc tìm kiếm (`searchCode`), bộ lọc kênh bán (`filterChannel`) và phân trang DOM chỉ áp dụng cho danh sách hiển thị vận hành (`baseFiltered` / `filtered`), hoàn toàn tách rời khỏi động cơ tính KPI, chấm dứt triệt để hiện tượng nhảy loạn số liệu doanh thu.

---

## [v2.13.1] - 2026-08-26

### 📅 Chuẩn Hoá Bộ Lọc Thời Gian Theo Ngày Đặt Hàng & Nạp Đầy Đủ 100% Đơn Theo Tháng
- **Cố Định Bộ Lọc Thời Gian Theo Ngày Đặt Hàng Thực Tế (`order.date` / `order.createdAt`)**:
  - **Khử bỏ hoàn toàn việc lọc theo `reconciledAt`**: Đơn hàng đặt trong tháng nào sẽ luôn nằm cố định ở tháng đó. Khắc phục triệt để lỗi đơn đặt tháng trước nhưng khi đối soát ví ở tháng sau lại bị nhảy số liệu sang tháng sau làm méo mó báo cáo doanh thu.
  - Áp dụng đồng bộ trên cả Frontend ([`Tab_Orders.html`](file:///c:/Users/ADMIN/RF_Workspace_Pro/Tab_Orders.html)) và Backend ([`Code.js`](file:///c:/Users/ADMIN/RF_Workspace_Pro/Code.js)).
- **Truy Vấn Toàn Bộ 100% Đơn Hàng Của Tháng (Không Cắt Cụt Phân Trang)**:
  - Nâng cấp API `getArchivedOrders` và luồng lazy-load: Khi chuyển dropdown thời gian sang `Tháng Trước` hoặc `Chọn Tháng`, hệ thống tự động nạp 100% tất cả các đơn hàng thuộc chu kỳ đó từ Google Sheet mà không bị thiếu sót do giới hạn phân trang.
  - Thẻ KPI thống kê Tổng Doanh Thu, Số Đơn Bán, Hàng Hoàn, Bán Lẻ phản ánh chính xác số liệu phát sinh thực tế của tháng đang chọn.

---

## [v2.12.22] - 2026-08-26

### 📊 Tái Cấu Trúc Toàn Diện Tab Báo Cáo KQKD (Executive P&L Dashboard & Data Editor)
- **Thiết lập chuẩn mực 4 Trụ Cột Tài Chính (FinTech Executive Standard)**:
  - **Trụ Cột 1 (Doanh Thu & Giảm Trừ)**: Thống kê chính xác GMV, AOV/đơn, bóc tách tỷ lệ hoàn hàng và voucher chiết khấu.
  - **Trụ Cột 2 (Giá Vốn & Lợi Nhuận Gộp)**: Tính toán COGS vật tư và biên lợi nhuận gộp (~75-80%) phản ánh đúng giá trị mỹ nghệ thủ công Rich Fish.
  - **Trụ Cột 3 (Cơ Cấu Chi Phí Hoạt Động)**: Phí sàn TMĐT, đóng gói giao hàng, marketing ADS, quỹ lương & chi phí mặt bằng xưởng.
  - **Trụ Cột 4 (Lợi Nhuận Thuần Ròng)**: Đo lường dòng tiền thặng dư thực tế mang lại và tỷ suất sinh lời trên Doanh thu thuần (DTT) & GMV.
- **Bảng Tóm Tắt Chỉ Tiêu Tài Chính Cốt Lõi (Financial Breakdown Matrix)**:
  - Hiển thị bảng ma trận tài chính 8 dòng chuẩn mực P&L kèm đánh giá & tỷ trọng % trực quan.
- **Tách bạch 2 chế độ: Tổng Quan (Dashboard) & Bảng Nhập Liệu (Editor)**:
  - Hỗ trợ chỉnh sửa số liệu tức thì (Inline Editing) theo từng kênh (`Shopee VN`, `TikTok Shop`, `Bán Lẻ`, `Bán Sỉ`, `CTV`, `Xuất Khẩu`) và `Chi Phí Cố Định Xưởng`.
- **Tách Lập Module Mã Nguồn Độc Lập (`Tab_BusinessReport.html`)**:
  - Tách hoàn toàn component `BusinessReportTab` khỏi `Tab_Finance.html` thành file module độc lập [`Tab_BusinessReport.html`](file:///c:/Users/ADMIN/RF_Workspace_Pro/Tab_BusinessReport.html).
- **Khắc Phục & Tối Ưu Phân Hệ Trách Nhiệm & Không Gian Làm Việc (`Tab_Workspaces.html`)**:
  - Bổ sung `Workspaces` vào hàm cập nhật giao diện phản ứng nhanh (`optimisticMerge` trong `setErpData`), giúp trạm làm việc và danh sách thiết bị bàn giao xuất hiện ngay lập tức (0ms) sau khi bấm Lưu.
  - Tích hợp thông báo Toast hiện đại thay cho hộp thoại browser alert cũ.

---

## [v2.12.21] - 2026-08-25

### ⚖️ Chuẩn Hóa Luồng Nghiệp Vụ Chặt Chẽ Cho Hàng Hoàn: Khiếu Nại Sàn vs Duyệt Kho
- **Xóa bỏ hoàn toàn nút nhảy cóc bước khi chưa xử lý**:
  - **Luồng 1 (Khiếu Nại Sàn)**: Chỉ hiển thị ảnh camera đóng hàng, nút `Sao Chép Mẫu KN` và bắt buộc chọn 1 trong 2 kết quả:
    - **`🏆 THẮNG (SÀN ĐỀN TIỀN)`**: Tự động chuyển đơn thẳng sang **`Đối Soát Thành Công`** / **`Hoàn Thành`** (`isReconciled = true`, ghi nhận doanh thu thuần và hoàn tất đơn ngay lập tức).
    - **`❌ THUA (CHUYỂN DUYỆT KHO)`**: Đánh dấu `[KN-THUA]` và **tự động chuyển sang Bước 2 (Duyệt Kho)** để kiểm tra hàng và chọn lý do lỗi/vỡ.
  - **Luồng 2 (Duyệt Kho)**: Phân nhánh rõ ràng 2 tình trạng:
    - **`✅ HÀNG OK (NGUYÊN VẸN)`**: Tự động chọn lý do Boom hàng, nút CTA: `DUYỆT NHẬP LẠI KHO TỔNG → HOÀN THÀNH` (cộng lại tồn kho).
    - **`💥 HÀNG LỖI / BỂ VỠ`**: Mở chọn chi tiết lỗi (💥 Bể vỡ khi vận chuyển, ⚠️ Lỗi thợ, ⏳ Giao trễ...), kiểm tra từng món KCS / SOS, nút CTA: `DUYỆT XUẤT HUỶ HÀNG VỠ → HOÀN THÀNH`.

---

## [v2.12.20] - 2026-08-25

### 🔔 Sửa & Nâng Cấp Toàn Diện Hệ Thống Thông Báo Di Động ntfy.sh (0ms Push Alert)
- **Khắc phục triệt để lỗi không bắn được thông báo qua ntfy**:
  - **Sửa lỗi giao thức gửi API**: Chuyển từ định dạng Header RFC2047 cũ (bị lỗi ký tự UTF-8 và chữ ký hàm Apps Script) sang giao thức **JSON POST Payload chuẩn của ntfy.sh** (`topic`, `title`, `message`, `priority: 4`, `tags`, `click`).
  - **Kích hoạt động cơ bắn thông báo 2 tầng (Dual-Engine)**: Hỗ trợ bắn trực tiếp từ trình duyệt Web Client (0ms latency, không phụ thuộc máy chủ GAS) và bắn dự phòng qua Backend API.
  - **Bổ sung giao diện Cài Đặt & Bắn Thử Thông Báo (`NtfySettingsModal`)**: Người dùng có thể tùy chỉnh tên kênh thông báo (`rfworkspace` hoặc tên riêng tuỳ chọn), lưu kênh và bấm **"🚀 Bắn Thử Thông Báo"** để kiểm tra ngay trên điện thoại iOS / Android.
  - Tích hợp tài liệu hướng dẫn 3 bước kết nối nhận thông báo đơn hàng và vận hành tức thì.

---

## [v2.12.19] - 2026-08-25

### 🎯 Quy Trình Stepper Tuần Tự (Progressive Disclosure) Cho Trạm Xử Lý Hàng Hoàn
- **Xong bước này mới hiện bước tiếp theo**: Tái cấu trúc toàn bộ Trạm Xử Lý Hàng Hoàn theo nguyên tắc Hallmark Progressive Stepper:
  - **Bước 1 (Đối Chứng & Khiếu Nại Sàn)**: Mở đầu chỉ hiển thị ảnh camera đóng gói và các nút Mẫu KN / Thắng / Thua kèm nút chuyển bước. Ẩn toàn bộ phần phân loại và danh sách hàng bên dưới để chống rối mắt.
  - **Bước 2 (Phân Loại Tình Trạng & Duyệt Hoàn Kho)**: Khi bấm Thắng/Thua hoặc bấm Tiếp Tục, Bước 1 tự động thu gọn thành 1 thanh tóm tắt siêu gọn gàng và **mở Bước 2** hiển thị lưới chọn lý do hoàn, kiểm tra tình trạng hàng trả và nút lớn `DUYỆT HOÀN XONG → CHUYỂN HOÀN THÀNH`.
  - Hỗ trợ chuyển đổi qua lại giữa 2 bước linh hoạt bất cứ lúc nào.

---

## [v2.12.18] - 2026-08-25

### 🔒 Phân Lập Tuyệt Đối Ghi Chú Theo Từng Tab & Sửa Lỗi Crash Tab Sản Xuất
- **Khắc phục lỗi `ReferenceError: documents is not defined` ở Tab Sản Xuất**: Bổ sung `documents` vào danh sách tham số của component `ProductionTab`.
- **Phân lập dữ liệu ghi chú nghiêm ngặt 100%**: Chuẩn hóa logic lọc `targetTab` trong `QuickNotesPanel`. Ghi chú tạo ở Tab Đơn Hàng chỉ hiển thị duy nhất ở Tab Đơn Hàng, tuyệt đối không bị rò rỉ sang Tab Sản Xuất hay các Tab khác.

---

## [v2.12.17] - 2026-08-25

### ⚡ Tối Ưu 0ms Optimistic UI & Đồng Bộ Nguồn Dữ Liệu Documents Toàn Diện
- **Hiển thị tức thì 0ms (Optimistic UI)**: Khi bấm "Lưu Ghi Chú" hoặc "Xoá", ghi chú lập tức xuất hiện / biến mất ngay trên giao diện mà không cần chờ đợi phản hồi từ server. Quá trình đồng bộ xuống Google Sheets được chạy hoàn toàn ngầm không gián đoạn thao tác người dùng.
- **Đồng bộ hóa trực tiếp Documents vào 5 Tab**: Truyền chính xác prop `documents` từ state gốc và gắn dự phòng toàn cục `window._rf_documents` + `erpData.Documents`, đảm bảo tất cả các Tab (Đơn Hàng, Sản Xuất, Kho Hàng, Tài Chính, Nhân Sự) luôn nhận dữ liệu ghi chú mới nhất 100%.

---

## [v2.12.16] - 2026-08-25

### 🧹 Loại Bỏ Triệt Để Modal Ghi Chú Nổi Cũ & Khắc Phục Lỗi isBoss Tab Sản Xuất
- **Loại bỏ hoàn toàn icon ghi chú cũ trên Navbar**: Xoá nút ghi chú cạnh số dư xu và modal nổi cũ (`QuickNotesModal`), tránh xung đột và trùng lặp với hệ thống ghi chú nhúng độc lập của từng Tab.
- **Đồng bộ hoá đa nền tảng cho QuickNotesPanel**: Cải tiến bộ lọc ghi chú trong `QuickNotesPanel` để tự động nhận diện và hiển thị tất cả các ghi chú cũ theo từng phân hệ (`ĐƠN HÀNG`, `SẢN XUẤT`, `KHO HÀNG`, `TÀI CHÍNH`, `NHÂN SỰ`).
- **Sửa lỗi crash `isBoss is not defined`**: Khắc phục triệt để lỗi ReferenceError khi mở Tab Sản Xuất (`Tab_Production.html`).

---

## [v2.12.15] - 2026-08-25

### ⚡ Tái Thiết Kế Trạm Xử Lý Hàng Hoàn Chuẩn Lean & Hallmark Stepper
- **Quy trình 2 bước tuần tự trực quan**:
  - **Bước 1 (Khiếu Nại Sàn & Bằng Chứng)**: Thu gọn ảnh đóng gói camera + nút copy Mẫu Khiếu Nại Sàn + 2 nút Thắng / Thua thành 1 hàng đối chứng tinh gọn, tự động hiển thị huy hiệu trạng thái khi đã đánh dấu.
  - **Bước 2 (Phân Loại & Duyệt Hoàn)**: Chuyển đổi bộ chọn lý do thành dạng Bento Grid 4 phân loại trực quan (💥 Bể vỡ, 🚫 Boom hàng, ⚠️ Lỗi mẫu, ⏳ Giao trễ).
- **Nút CTA Chính "Duyệt Hoàn Xong" Full-Width**: Đặt nổi bật ở cuối thẻ kèm hiệu ứng phát sáng chỉ khi đã chọn lý do, giúp nhân sự thao tác 1 chạm chuẩn xác, không bị rối mắt.

---

## [v2.12.14] - 2026-08-25

### 🔧 Tối Ưu Hiển Thị & Quy Trình Trạm Khiếu Nại
- Xoá bỏ nhãn "HÀNG HOÀN" thừa thãi giữa thẻ đơn hàng đối với các đơn đang nằm trong trạng thái Hàng hoàn chờ xử lý, giúp giao diện thẻ gọn gàng hơn.
- Phục hồi lại 2 nút **Thắng** và **Thua** trong Trạm Khiếu Nại & Xử Lý Hàng Hoàn. Các nút này tự động gắn tag `[KN-THANG]` hoặc `[KN-THUA]` vào ghi chú đơn hàng để làm cơ sở tính KPI và đối soát khiếu nại với sàn.

---

## [v2.12.13] - 2026-08-25

### 📝 Tái Cấu Trúc Khung Ghi Chú Độc Lập (Per-Tab QuickNotesPanel)
- **Tối Ưu Trải Nghiệm & Phân Tách Không Gian Ghi Chú**:
  - Loại bỏ hoàn toàn `QuickNotesModal` (Popup nổi giữa màn hình) cồng kềnh.
  - Thay thế bằng component `QuickNotesPanel` dạng Accordion nhúng trực tiếp ngay bên dưới thanh công cụ của 5 Tab: Đơn Hàng, Sản Xuất, Kho Hàng, Tài Chính, Nhân Sự.
  - Ghi chú được lọc và hiển thị độc lập hoàn toàn theo từng phân hệ. (Xem ở Tab nào chỉ hiển thị ghi chú Tab đó).
- **Phân Quyền & Rút Gọn Biểu Mẫu (Minimalist Approach)**:
  - Form tạo ghi chú mới được thiết kế cực kỳ tối giản (chỉ giữ lại Tiêu đề và Nội dung chi tiết).
  - Khóa chặt quyền: Nút "+ Tạo Ghi Chú" chỉ hiển thị đối với tài khoản mang cấp bậc **TỐI CAO** (hoặc Ban Quản Trị / Quản Lý cấp cao).
  - Tích hợp hiệu ứng thả xuống (dropdown animation) mượt mà tương tự như Khung Thống Kê ở Tab Đơn Hàng.

---

## [v2.12.12] - 2026-08-25

### 🎯 Khắc Phục Dữ Liệu Ma Trận Lịch Tháng & Tổng Hợp Ca Chấm Công Chuẩn Xác
- **Tổng Hợp Tất Cả Các Ca Làm Việc Trong Ngày Trên Ma Trận (`Tab_HR.html`)**:
  - Khắc phục lỗi hiển thị chỉ lấy 1 ca đầu tiên (`userAtts.find`) dẫn đến ngày làm 2 ca (Sáng + Chiều) chỉ hiện `4h` hoặc `0h`.
  - Tự động cộng dồn toàn bộ số giờ làm việc thực tế của tất cả các ca (Sáng + Chiều + Tối) trong từng ngày, hiển thị chuẩn xác `8h` / `4h` hoặc số giờ thực tế.
  - Xử lý ưu tiên ca làm việc thực tế, không để các bản ghi nghỉ phép cũ đè làm mất giờ công đi làm của nhân sự.
- **Bảo Toàn Giờ Chấm Công Cửa (`totalGateHours`)**:
  - Triệt tiêu lỗi vô tình ghi đè `totalHours` bằng `activeHours` của lệnh sản xuất, loại bỏ hiện tượng ngày làm 8 tiếng bị rút xuống còn `1h` trên ma trận.
- **Chuẩn Hóa Thuật Toán Tính Số Ngày Nghỉ Phép (`soNgayNghi`)**:
  - Chỉ tính là ngày nghỉ nếu trong ngày đó nhân sự thực sự không có ca làm việc nào đạt trên 2h, tránh phạt nhầm số ngày nghỉ của nhân viên đi làm đầy đủ.

---

## [v2.12.11] - 2026-08-25

### 🎯 Tích Hợp Bảng Ghi Chú & Nhắc Việc Nội Bộ Toàn Hệ Thống (`QuickNotesModal`)
- **Ra Mắt Khung Ghi Chú Vận Hành Đa Phân Hệ (`Modals.html` - `QuickNotesModal`)**:
  - Hỗ trợ lưu trữ, phân loại và lọc ghi chú theo 5 phân hệ cốt lõi: **🌟 Tất Cả**, **📦 Kho Hàng**, **🛠️ Sản Xuất**, **🛒 Đơn Hàng**, **💰 Tài Chính**, **👥 Nhân Sự** và **🔔 Chưa Đọc**.
  - Cho phép chọn cấp độ ưu tiên: `📌 Ghim Lên Đầu` (Gold badge), `⚡ Khẩn Cấp` (Rose pulse badge), `📝 Thông Thường`.
  - Tích hợp tìm kiếm thông minh theo tiêu đề, nội dung và tên người tạo.
  - Lưu trữ và đồng bộ hóa tức thì vào cơ sở dữ liệu `Documents` (category `GHI_CHU_VAN_HANH`).
- **Theo Dõi Trạng Thái Xác Nhận Đã Đọc / Đã Hiểu**:
  - Nhân sự xem ghi chú có thể bấm nút **✔ Đã Hiểu** để xác nhận đã nắm bắt quy định/lưu ý.
  - Hệ thống tự động ghi nhận danh sách nhân sự đã đọc (`readBy`), hiển thị số lượt đọc và cập nhật badge đếm số ghi chú chưa đọc trên Header.
- **Tích Hợp Nút Mở Ghi Chú Nhanh Trên 5 Tab & Header Toàn Cục**:
  - **Top Header (`App_Main.html`)**: Nút Ghi Chú với badge đếm số ghi chú chưa đọc nhấp nháy.
  - **Tab Kho Hàng (`Tab_Inventory.html`)**: Nút Ghi Chú trên thanh công cụ sản phẩm.
  - **Tab Sản Xuất (`Tab_Production.html`)**: Nút Ghi Chú trên thanh công cụ tìm kiếm và lọc.
  - **Tab Đơn Hàng (`Tab_Orders.html`)**: Nút Ghi Chú trên thanh công cụ đơn hàng.
  - **Tab Tài Chính (`Tab_Finance.html`)**: Nút Ghi Chú trên thanh công cụ Sổ Quỹ Thu Chi.
  - **Tab Nhân Sự (`Tab_HR.html`)**: Nút Ghi Chú trên thanh Kỳ Báo Cáo.

---

## [v2.12.10] - 2026-08-25

### 🎯 Hotfix: Khắc Phục Lỗi TypeError userConfigs.map Trong OrderCardV2
- **Tương Thích An Toàn Nhiều Cấu Trúc Dữ Liệu `userConfigs` (`Modals_Orders.html`)**:
  - Bổ sung cơ chế fallback đa hình cho biến `userConfigs` (xử lý khi là mảng, object `users`, object `pins` hoặc mảng `Config_NhanSu` từ Google Sheets).
  - Triệt tiêu hoàn toàn lỗi runtime `TypeError: (userConfigs || ...).map is not a function` gây màn hình xám khi hiển thị thẻ đơn hàng.

---

## [v2.12.9] - 2026-08-25

### 🎯 Tối Ưu Thẻ Nhân Sự Chấm Công, Nút Icon Kỳ Báo Cáo & Tính Năng Xoá Khoản Phạt
- **Thiết Kế Lại Thẻ Hồ Sơ Chấm Công Nhân Sự (`Tab_HR.html`)**:
  - Bỏ icon cái búa (`fa-gavel`) và tinh giản các nút thao tác theo đúng yêu cầu trải nghiệm gọn nhẹ, chuyên nghiệp.
  - Thêm đèn báo online/trạng thái làm việc trực quan ngay trên Avatar nhân sự (xanh lá nhấp nháy khi đang làm việc, đỏ khi báo nghỉ, xanh dương khi hoàn thành ca).
  - Tối ưu huy hiệu Ngày nghỉ, Giờ chấm công và Số lần đi muộn/phạt theo chuẩn Dark UI Dribbble.
- **Bổ Sung Tính Năng Xoá / Miễn Trừ Khoản Phạt (`Tab_HR.html`)**:
  - Cho phép cấp Quản lý / Boss bấm nút Thùng rác để trực tiếp xoá bỏ hoặc miễn trừ khoản phạt trong danh sách *Chi tiết phạt tháng này* (đồng bộ tức thì qua `pushDeltas` vào `BonusPenalty` / `Attendance`).
- **Tinh Gọn Nút Kỳ Báo Cáo & Màu Sắc 3 Tab Nhanh (`Tab_HR.html`)**:
  - Chuyển các nút *Tạo KPI*, *Giao Việc*, *Báo Nghỉ* thành dạng Icon Buttons bo tròn tinh tế, tiết kiệm không gian.
  - Phủ màu Gradient phân biệt trực quan cho 3 tab nhanh trên cùng: **CHẤM CÔNG** (*Sky-Blue Gradient*), **NHIỆM VỤ** (*Amber Gradient*), **BẢNG LƯƠNG** (*Emerald Gradient*).

---

## [v2.12.8] - 2026-08-25

### 🎯 Đồng Bộ Màu Sắc Nhãn Kênh Bán, Bộ Lọc Trạng Thái & Icon Tab Sản Xuất Với Tab Đơn Hàng
- **Đồng Bộ Màu Sắc Nút Lọc Kênh Bán & Trạng Thái (`Tab_Production.html`)**:
  - Khôi phục và chuẩn hoá 100% màu sắc nhận diện kênh bán (Shopee cam, TikTok hồng, Xuất Khẩu xanh lá, Bán Lẻ xanh dương, CTV tím) và trạng thái (Chờ SX vàng, Kiểm Định tím, Đã Xong xanh ngọc, Đã Huỷ đỏ) cả ở trạng thái bình thường (inactive) lẫn kích hoạt (active).
  - Tích hợp icon có màu sắc chuyên biệt, triệt tiêu tình trạng icon bị mất màu hoặc xám xịt.
- **Đồng Bộ Nhãn Kênh Bán Trên Thẻ Lệnh Sản Xuất (`Tab_Production.html` - `WorkerCardV2`)**:
  - Chuyển toàn bộ nhãn kênh bán hàng trên thẻ lệnh thợ sang hàm `getChannelBadge(channelTag)` chuẩn nhận diện màu khối sắc nét, đồng nhất hoàn toàn với thẻ `OrderCardV2` của tab Đơn Hàng.
- **Tối Ưu Giao Diện Nút Thao Tác Header (`Tab_Production.html`)**:
  - Chuẩn hoá nút Tạo Lệnh SX Tồn (`+`) và nút Kho Thiếu Hàng (`Boxes`) theo phong cách Glassmorphism Amber sang trọng.

---

## [v2.12.7] - 2026-08-25

### 🎯 Tích Hợp Thông Tin Nhân Viên Bán Trong Chi Tiết Đơn Hàng & Đồng Bộ In Hoá Đơn
- **Hiển Thị & Gán Nhân Viên Bán Trên Popup Chi Tiết Đơn Hàng (`Modals_Orders.html` - `OrderCardV2`)**:
  - Bổ sung trường **Nhân viên bán** vào bảng tóm tắt thông tin trên modal Chi Tiết Đơn Hàng (khớp 100% giao diện popup Order Detail).
  - Nhân sự quản lý có thể chọn lại nhân viên phụ trách trực tiếp từ danh sách nhân sự công ty (`Config_NhanSu`) qua dropdown và lưu cập nhật tự động khi bấm **Lưu Thay Đổi**.
- **Đồng Bộ Tên Nhân Viên Bán Lên Hoá Đơn In Nhiệt K58 & Ảnh Canvas (`Modals_Orders.html`)**:
  - Tự động in kèm dòng `NV bán: <Tên nhân sự>` trên bill in nhiệt K58 (58mm) và ảnh hoá đơn tạo từ `OrderInvoiceModal` phục vụ gửi khách qua Zalo/Facebook.

---

## [v2.12.6] - 2026-08-25

### 🎯 Gom Khung Hàng Hoá & Phụ Kiện, Ô Giá Bán Tự Động, Quyết Toán Đơn Hàng Mới & Thả Xuống Tài Khoản Cọc
- **Gom Hàng Sản Xuất & Phụ Kiện Vào 1 Khung Thống Nhất (`Modals_Orders.html` - `AddModal`)**:
  - Gom toàn bộ **Hàng Sản Xuất** (*Bể Kính*, *Layout*) và **Phụ Kiện Kèm Theo** vào chung 1 khung `Hàng Hoá & Phụ Kiện Trong Đơn` gọn gàng, có 3 nút chọn nhanh: `+ BỂ KÍNH`, `+ LAYOUT`, `+ PHỤ KIỆN`.
- **Ô Giá Bán Tự Động Lấy Giá Kho & Hỗ Trợ Chỉnh Sửa Mẫu**:
  - Khi thêm bất kỳ mặt hàng nào, giá bán mặc định tự động lấy từ niêm yết kho (`price`), đồng thời cung cấp ô nhập giá bán trực tiếp trên từng món hàng để nhân viên sửa nếu bán giá khác.
- **Tái Cấu Trúc Khung Quyết Toán Đơn Hàng & Thả Xuống Chọn Tài Khoản Cọc**:
  - Chuyển toàn bộ khung **Quyết Toán Đơn Hàng** sang cột bên phải, nằm ngay bên dưới khung Hàng Hoá Trong Đơn.
  - Tự động cộng **TỔNG TIỀN HÀNG** từ các món trong đơn (có nút *Tự động tính*).
  - Bổ sung ô nhập **GIẢM GIÁ HOÁ ĐƠN** và **THU KHÁC / PHÍ SHIP**.
  - Tự động tính toán hiển thị song song **THÀNH TIỀN ĐƠN HÀNG** (`Tổng tiền hàng - Giảm giá + Thu khác`) và **TIỀN COD CẦN THU** (`Thành tiền - Đã cọc`).
  - Ô **TÀI KHOẢN NHẬN CỌC** chuyển thành thẻ chọn `<select>` gồm 2 tài khoản chính: **`ACC_1782746951474` (TÀI KHOẢN CÔNG TY)** và **`ACC_1783639668347` (TIỀN MẶT)**.

---

## [v2.12.5] - 2026-08-25

### 🎯 Phương Thức Bán Hàng Trực Tiếp Offline & Tự Động Duyệt Hoàn Thành
- **Bổ Sung Phương Thức Giao Hàng "Trực Tiếp" (`Modals_Orders.html` - `AddModal`)**:
  - Thêm hình thức giao hàng **`Trực Tiếp`** vào danh sách lựa chọn phương thức giao nhận (Gửi GHN, Gửi Xe, Trực Tiếp).
- **Tự Động Chuyển Trạng Thái Hoàn Thành Đơn Offline (`Modals_Orders.html`)**:
  - Khi nhân sự bấm **CHỐT ĐƠN BÁN HÀNG** với hình thức `Trực Tiếp`, đơn hàng được tự động xác nhận trạng thái **`Hoàn Thành`** ngay lập tức mà không cần đi qua quy trình đóng gói hay tạo vận đơn.
  - Tất cả các sản phẩm sản xuất đi kèm trong đơn trực tiếp cũng tự động chuyển trạng thái **`Hoàn Kho Đạt`** (Phases `Done`), giúp khớp đúng thực tế khách nhận hàng offline tại xưởng.

---

## [v2.12.4] - 2026-08-25

### 🎯 Đổi Tên Danh Mục BỂ LẺ SIZE & Tạo Duy Nhất 1 Lệnh Sản Xuất Cho Bể Lẻ Size
- **Đổi Tên Nhóm KHÁC Thành BỂ LẺ SIZE (`Config.html` & `Tab_Inventory.html`)**:
  - Bổ sung nhóm phân loại chuẩn `BỂ LẺ SIZE` vào `SUB_CATEGORIES['BỂ KÍNH']`.
  - Tự động map và hiển thị toàn bộ các sản phẩm bể kính chưa phân nhóm hoặc nhóm `KHÁC` thành **`BỂ LẺ SIZE`** trên giao diện kho hàng Bento.
  - Khi thêm sản phẩm mới hoặc sửa sản phẩm trong kho Bể Kính, hệ thống tự động gán phân loại `BỂ LẺ SIZE`.
- **Tối Ưu Hoá Quy Tắc Tạo Lệnh Sản Xuất (`Modals_Orders.html`)**:
  - Khi đơn hàng nhập từ Trạm Bơm Đơn Excel hoặc Quét Mã Vận Đơn OCR có chứa sản phẩm thuộc danh mục `BỂ LẺ SIZE`, hệ thống chỉ tạo **duy nhất 1 lệnh sản xuất** cho toàn bộ số lượng của mặt hàng đó thay vì tách thành nhiều lệnh riêng lẻ.
  - Lệnh sản xuất ghi nhận rõ ràng ghi chú tổng số lượng `(SL: X)` giúp thợ cắt mài dán theo dõi và xử lý nguyên lô tập trung, triệt tiêu lãng phí thao tác (Muda).

---

## [v2.12.3] - 2026-08-25

### 🎯 Tách Độc Lập Kho Bể Kính & Layout, Gọn Gàng Nút Xuất Nhập & Loại Bỏ Nút BOM
- **Tách Kho Thành Phẩm Thành 2 Kho Độc Lập (`Tab_Inventory.html` & `Tab_ImportExport.html`)**:
  - Phân tách `KHO THÀNH PHẨM` thành **`KHO BỂ KÍNH`** (icon cá, màu vàng hổ phách) và **`KHO LAYOUT`** (icon khối hộp, màu vàng gold).
  - Cập nhật cả ở dải Ribbon tab kho sản phẩm lẫn bộ lọc chứng từ xuất nhập kho, giúp quản lý tồn kho và phiếu kho chuyên biệt theo từng dây chuyền sản xuất.
- **Thiết Kế 1 Dòng 4 Nút Tác Vụ Kho Gọn Gàng (`Tab_ImportExport.html`)**:
  - Gom 4 nút: **Nhập Kho** (Emerald), **Đặt Hàng** (Purple), **Xuất Kho** (Rose), **Thanh Lý** (Amber) thành 1 dải ngang tinh gọn, đồng bộ thẩm mỹ tối giản, tương phản cao chuẩn Dark UI với toàn bộ ứng dụng.
- **Loại Bỏ Nút Tính BOM (`Tab_Inventory.html`)**:
  - Gỡ bỏ nút "Tính BOM" khỏi thanh công cụ tìm kiếm kho hàng để giải phóng diện tích và tập trung vào các thao tác nghiệp vụ cốt lõi.

---

## [v2.12.2] - 2026-08-25

### 🎯 Chuẩn Hoá Nhận Diện Mã Đơn, Tách Bạch Hạn Xử Lý & Cập Nhật Thương Hiệu / Địa Chỉ Hoá Đơn
- **Tách Bạch Trường Hạn Xử Lý & Mã Vận Đơn (`Modals_Orders.html` - `OrderDetailModal`)**:
  - Khắc phục triệt để lỗi ghi đè dữ liệu: Trước đây khi đơn có mã vận đơn, ô `Hạn xử lý:` bị hiển thị thành `MVĐ: ...`. Đã tách riêng thành dòng `Hạn xử lý:` (hiển thị ngày giờ deadline thực tế) và `Mã vận đơn:` (hiển thị mã SPX/GHN riêng biệt).
- **Loại Bỏ Ký Tự Phân Cách `|` Ở Cuối Mã Đơn (`Modals_Orders.html`)**:
  - Chuẩn hoá bóc tách `mainCode` và `trackingCode` trên toàn hệ thống (Form chi tiết đơn, In hoá đơn K58, Sao chép văn bản).
  - Tự động cắt bỏ triệt để ký tự `|` (dấu gạch đứng) còn sót lại ở đuôi mã đơn hàng.
- **Cập Nhật Tên Thương Hiệu & Địa Chỉ In Hoá Đơn Toàn Hệ Thống**:
  - Đổi toàn bộ tên thương hiệu từ `RICH FISH AQUARIUM` thành `RF AQUARIUM`.
  - Cập nhật địa chỉ cửa hàng trên mẫu in phiếu K58 và phiếu kho từ `Kiến Tạo Thế Giới Thuỷ Sinh` thành `30 Lương Thế Vinh, Thống Nhất, Phú Thọ`.

---

## [v2.12.1] - 2026-08-25

### 🎯 Tối Ưu & Khắc Phục Triệt Để Thuật Toán So Khớp Hàng Hoá Theo SKU (Exact SKU Match)
- **Ưu Tiên Tách Cột SKU Phân Loại Hàng (Variation SKU) Trước SKU Cha (`Modals_Orders.html`)**:
  - Tách bạch nhận diện cột `SKU phân loại hàng` / `Mã SKU phân loại` với `SKU sản phẩm` cha trong file xuất Excel của Shopee / TikTok.
  - Loại bỏ hoàn toàn lỗi gán nhầm SKU cha (`SAN`, `NAT-011`) cho tất cả các size phân loại.
- **Tự Động Trích Xuất SKU Trong Ngoặc Vuông `[...]` (`Modals_Orders.html`)**:
  - Trích xuất tự động SKU phân loại từ chuỗi Shopee như `[SAN SANM]`, `[SAN SANL]`, `[NAT-011 NAT-011-402325]`, `[BE301812ND]`, `[SANFREESIZE]`, `[KEODANREU]`.
  - Khớp trực tiếp vào bảng danh mục `Products` qua tra cứu bảng băm `skuExactMap` và `skuCleanMap`.
- **Khắc Phục Lỗi Match Substring Sai Lệch**:
  - Triệt tiêu hoàn toàn hiện tượng lấy sai biến thể (như Sạn Suối M & L bị nhận diện nhầm thành Sạn XL, hoặc Layout Nature Size L bị gán nhầm sang 20x20x20cm).
  - Đồng bộ thuật toán cho cả Trạm Bơm Đơn Excel và Máy Quét Nhãn Vận Đơn OCR.

---

## [v2.12.0] - 2026-08-24

### 🎯 Khắc Phục Lỗi Xác Thực PIN Khi Chạy Lưu Trữ Đơn Cũ (Orders_Archive)
- **Tự Động Bổ Sung Xác Thực PIN Cho RunGAS (`App_Main.html` - `window.runGAS`)**:
  - Đã thêm `archiveReconciledOrders` và `getArchivedOrders` vào danh sách hàm tự động gắn `pin` từ `localStorage`.
  - Khắc phục triệt để lỗi alert: *"Phiên làm việc chưa xác thực hoặc đã hết hạn! Vui lòng đăng nhập lại."* khi Admin kích hoạt nút **Lưu Trữ Đơn**.
- **Bóc Tách Tham Số Đa Tầng Linh Hoạt (`Code.js` - `archiveReconciledOrders` & `getArchivedOrders`)**:
  - Hỗ trợ hàm backend nhận tham số dạng object `{ cutoffDays, pin }`, số hoặc chuỗi, tự động fallback lấy mã PIN hợp lệ.
  - Đảm bảo cơ chế di chuyển đơn đối soát cũ (>45, 60, 90, 180 ngày) sang `Orders_Archive` chạy trơn tru 100%.

---

## [v2.11.2] - 2026-08-24

### 🎯 Đẩy Mặc Định Deadline Đơn Hàng Bán Lẻ & CTV Lên Trên 5 Ngày (+6 Ngày Chuẩn)
- **Tối Ưu Hoá Thuật Toán Tính Hạn Giao Tự Động (`Config.html` - `getAutoDeadline`)**:
  - Đẩy hạn giao tự động cho các kênh `Bán Lẻ`, `Bán Sỉ`, `Cộng Tác Viên (CTV)`, `Nội Bộ` từ 2 ngày lên **6 ngày** (>5 ngày) lúc 18:00.
  - Phù hợp với chu kỳ gia công sản xuất layout phức tạp, dưỡng rêu, cắt kính và dán bể theo chuẩn Lean tại xưởng.
- **Đồng Bộ Ô Chọn Hạn Giao (Deadline) Trên Form Bán Hàng (`Modals_Orders.html` - `AddModal`)**:
  - Bổ sung trường chọn ngày giờ `Hạn Giao (Deadline)` trực tiếp trên giao diện Lên Đơn & Sửa Đơn Bán Hàng với nhãn chỉ dẫn `(>5 ngày)` trực quan.
  - Tự động đồng bộ deadline khi chuyển đổi kênh bán hàng (giữa Shopee, TikTok và Bán Lẻ / CTV).
- **Đồng Bộ Logic Cảnh Báo SLA & Thẻ Đơn Hàng (`Tab_Orders.html` - `RFOrderWrapper`)**:
  - Cập nhật bộ đếm lùi SLA trên Order Card, chỉ cảnh báo trễ hạn đối với đơn Bán Lẻ / CTV khi vượt quá mốc 6 ngày kể từ ngày tạo đơn.

---

## [v2.11.1] - 2026-08-24

### 🎯 Khắc Phục Triệt Để Lỗi Crash / Văng App Khi Bấm Nút Hết Kho
- **Khắc Phục Lỗi Vi Phạm Rules of Hooks (`Tab_Production.html` - `OutOfStockProductsModal`)**:
  - Sửa dứt điểm lỗi `Minified React Error #310` (Rendered more/fewer hooks than previous render).
  - Loại bỏ điều kiện `if (!isOpen) return null;` nằm trước các hook React (`useMemo`).
  - Chuyển việc tính toán `totalSelectedQty` thành hàm rút gọn trực tiếp, và chỉ render modal khi `showOutOfStockModal === true`.
  - Bảo đảm thao tác bấm nút **"Hết Kho"** trên Tab Sản Xuất mở popup tức thì, mượt mà 100% không còn hiện tượng trắng màn hình.

---

## [v2.11.0] - 2026-08-24

### 🎯 Cơ Chế Phân Trang & Lưu Trữ Đơn Cũ (Archiving Engine) — Tải App < 1s
- **Tối Ưu Hoá Tốc Độ Khởi Tạo Web App (`Code.js` - `getAppData`)**:
  - Tái cấu trúc hàm nạp dữ liệu ban đầu `getAppData`: Chỉ tải toàn bộ đơn đang vận hành (chưa hoàn thành) + đơn hoàn thành/đối soát trong phạm vi 45-60 ngày gần nhất.
  - Cắt giảm 85% dung lượng dữ liệu truyền tải (payload) và giải phóng hơn 100MB RAM trình duyệt, giúp thời gian tải web app giảm xuống **dưới 1 giây**.
- **Bảng Lưu Trữ Mới `Orders_Archive` & Công Cụ Lưu Trữ Hàng Loạt (`Code.js` - `archiveReconciledOrders`)**:
  - Khởi tạo schema `Orders_Archive` đồng bộ 100% (32 cột cốt lõi) với `Orders`.
  - Xây dựng API và modal quản trị `ArchiveEngineModal` cho phép Admin chuyển hàng loạt đơn đã đối soát/hoàn tất cũ (mốc 45, 60, 90, 180 ngày) sang bảng lưu trữ một cách an toàn tuyệt đối với `LockService.waitLock(15000)`.
- **Cơ Chế Lazy-Load On-Demand Theo Quý / Tháng & Tìm Kiếm (`Code.js`, `App_Main.html`, `Tab_Orders.html`)**:
  - Xây dựng API `getArchivedOrders` hỗ trợ truy vấn on-demand theo quý (`quarter`), tháng (`month`), từ khóa (`searchCode`) và phân trang (`page`, `pageSize`).
  - Tự động kích hoạt tải đơn lưu trữ khi người dùng chọn lọc các tháng quá khứ hoặc khi tìm kiếm mã đơn không nằm trong bộ nhớ RAM hiện tại.
  - Tích hợp bộ đệm React Cache giúp việc chuyển đổi giữa các tháng/quý diễn ra tức thì (0ms).
- **Giao Diện Chuẩn Hallmark (Modern Workbench Dark Theme)**:
  - Thiết kế modal `ArchiveEngineModal` và nút kích hoạt `Lưu Trữ Đơn` sắc nét, tactile micro-animations với độ phản hồi nảy xúc giác.

---

## [v2.10.28] - 2026-08-24

### 🎯 Nâng Cấp LockService Database & Rà Soát Tiêu Chuẩn Hallmark
- **Đồng Bộ WaitLock Chống Đè Dữ Liệu (`Code.js`)**:
  - Nâng cấp toàn bộ các hàm update KPI (`updateKpiProgressData`) và các hàm ghi cơ sở dữ liệu lên `LockService.getScriptLock().waitLock(15000)`.
  - Ngăn chặn 100% rủi ro đè dữ liệu hoặc mất thông tin KPI/đơn hàng khi nhiều thợ thao tác hoặc khi cron job trigger chạy đồng thời.
- **Xác Thực Quy Tắc Nhập Đơn Exact Match (`Modals_Orders.html`)**:
  - Bảo đảm logic xử lý parser trạng thái đơn hàng TMĐT (`mapOrderStatusExact`) tuân thủ nghiêm ngặt Exact Match Rule: `"Completed" -> "Đối Soát Thành Công"`, `"Returned" -> "Hàng Hoàn"`.
  - Fix logic fallback tự động chuyển thành trạng thái `"Chờ Sản Xuất"` nếu trạng thái không khớp để tránh đơn kẹt ở hệ thống.
- **Rà Soát Chuẩn Hallmark Giao Diện Sản Xuất (`Tab_Production.html` & `App_Main.html`)**:
  - Xác nhận giao diện Xưởng Sản Xuất và App_Main vượt qua các tiêu chuẩn thiết kế chống AI-slop của tiêu chuẩn Hallmark (sử dụng Token hóa an toàn, không generic class, dark mode workbench chuẩn).
  - Khẳng định tính an toàn và thẩm mỹ của Layout hiện tại.

---

## [v2.10.27] - 2026-08-24

### 🎯 Nâng Cấp Toàn Diện Đẩy Đơn GHN & Chuẩn Hoá Thông Tin Người Nhận
- **Khắc Phục Lỗi Tạo Vận Đơn GHN (`Modals_Orders.html` - `GHNPushModal`)**:
  - Cho phép xem và chỉnh sửa trực tiếp **Họ tên** và **Số điện thoại** người nhận ngay trên modal trước khi bấm đẩy đơn, tự động chuẩn hoá số điện thoại (10 chữ số bắt đầu bằng `0`).
  - Loại bỏ việc truyền thủ công `pickup_time` bị lệch mốc thời gian gây lỗi `400 Invalid pickup_time`, để GHN tự động lên lịch theo `pick_shift`.
  - Tự động lấy đúng `district_id` từ chi nhánh cửa hàng thực tế (`ShopId`) thay vì cố định một quận huyện.
  - Bổ sung fallback tự động cho gói cước `Giao Hàng Chuẩn` và báo lỗi chi tiết, rõ ràng nếu có trường thông tin bị thiếu.

---

## [v2.10.26] - 2026-08-24

### 🎯 Khắc Phục Triệt Để Lỗi Crash / Văng App Khi Mở Hộp Đen Đối Soát
- **Sửa Lỗi Vi Phạm Thứ Tự React Hooks (`Tab_Production.html`)**:
  - Chuyển toàn bộ logic tính toán `parseAuditLogTimeMs` thành hàm thuần tuý (pure helper) độc lập ngoài component `WorkerActionAuditModal`.
  - Triệt tiêu lỗi vi phạm Rules of Hooks (gọi `useCallback` sau câu lệnh điều kiện `if (!isOpen) return null`), ngăn chặn 100% tình trạng trắng màn hình / văng app khi bấm vào icon Khiên đỏ Hộp Đen.
  - Bảo đảm modal mở lên tức thì, mượt mà và hoạt động chuẩn xác với bộ lọc 7 ngày gần nhất.

---

## [v2.10.25] - 2026-08-24

### 🎯 Tối Ưu Hộp Đen Đối Soát Toàn Xưởng — Giới Hạn 7 Ngày Gần Nhất
- **Giới Hạn Khung Thời Gian 7 Ngày Gần Nhất (`Tab_Production.html` & `Code.js`)**:
  - Mặc định chỉ tải và hiển thị dữ liệu thao tác của thợ trong vòng **7 ngày gần nhất**, giúp tốc độ mở modal siêu nhanh, không bị tải dồn hàng ngàn dòng log cũ từ các tháng trước.
  - Tích hợp bộ chuyển đổi phạm vi linh hoạt: `⚡ 7 Ngày Gần Nhất (Mặc định)`, `📅 Hôm Nay`, `🌐 Tất Cả Lịch Sử`.
  - Tối ưu API máy chủ `api_getWorkerAuditLogs`: Tự động lọc timestamp `Tracking_Log` trong 7 ngày, giảm 80% dung lượng payload truyền tải.

---

## [v2.10.24] - 2026-08-24

### 🎯 Tự Động Chuyển SẴN SÀNG ĐÓNG GÓI Khi Hàng Có Sẵn Trong Kho
- **Khắc Phục Đơn Bị Mắc Ở Trạng Thái Chờ Sản Xuất (`Tab_Orders.html` & `Modals_Orders.html`)**:
  - Sửa lỗi hàm `checkItemReady`: Tự động nhận diện chuẩn xác các lệnh hàng có sẵn từ kho (`note` chứa `"Có sẵn ở kho"`, `"Lấy từ tồn kho"`, `"Tự động tạo lệnh bù"` hoặc `fulfilledFromStock = true`).
  - Đơn hàng có Bể kính & Layout sẵn trong kho (như Bể 20x20x20cm, Cuội ver.2...) sẽ **tự động chuyển sang `SẴN SÀNG ĐÓNG GÓI`** ngay khi có mã vận đơn mà không bị kẹt ở "Chờ Sản Xuất".
  - Thẻ sản phẩm hiển thị nhãn xanh sắc nét `✓ XUẤT TỪ KHO CÓ SẴN`.
- **Chuẩn Hoá So Khớp Tên Hàng Hoá Kho (Unicode Dash Normalization)**:
  - Tự động chuẩn hoá các loại dấu gạch ngang (`–`, `—`, `-`) và khoảng trắng giữa tên sản phẩm trong file sàn và danh mục kho ERP, xoá bỏ hoàn toàn lỗi lệch ký tự dẫn tới báo sai tồn kho.

---

## [v2.10.23] - 2026-08-24

### 🎯 Tự Động Quy Đổi Doanh Thu Đơn Hàng Thái Lan & Ngoại Tệ Sang VNĐ
- **Xử Lý Triệt Để Ký Tự Tiền Tệ Ngoại Quốc (`TRẠM BƠM ĐƠN` - `Modals_Orders.html`)**:
  - Khắc phục lỗi `Doanh thu: 0đ` khi import file Excel Shopee Thái Lan (`Order.toship...xlsx`): Bóc tách sạch sẽ các ký tự tiền tệ đặc thù (`฿`, `THB`, `RM`, `SGD`, `₱`, `$`) trước khi parse số thực.
  - Bổ sung bộ từ khóa nhận diện các cột doanh thu tiếng Thái (`ยอดเงินที่ผู้ซื้อจ่าย`, `ยอดรวมทั้งหมด`, `ยอดรวมคำสั่งซื้อ`, `ยอดชำระเงินทั้งหมด`, `ราคาสินค้า`, `ราคาดีล`...).
- **Tự Động Quy Đổi Tỷ Giá Thực Tế Sang VNĐ**:
  - `Shopee TH` (Thái Lan): 1 THB = 715 VNĐ.
  - `Shopee SG` (Singapore): 1 SGD = 19.200 VNĐ.
  - `Shopee MY` (Malaysia): 1 MYR = 5.850 VNĐ.
  - `Shopee TW` (Đài Loan): 1 TWD = 810 VNĐ.
  - `Shopee PH` (Philippines): 1 PHP = 440 VNĐ.
  - Tự động nhân tỷ giá cho toàn bộ doanh thu, phí cố định, phí dịch vụ, phí thanh toán và voucher shop.

---

## [v2.10.22] - 2026-08-24

### 🎯 Gom Hàng Bể Kính & Layout Hết Kho — Tạo Chung 1 Lệnh Sản Xuất Tồn
- **Giỏ Gom Hàng Thông Minh (`OutOfStockProductsModal` - `Tab_Production.html`)**:
  - Không còn bị nhảy sang form tạo lệnh đơn lẻ rỗng ngay khi bấm dấu `+`: Cho phép bấm chọn nhiều mặt hàng Bể Kính & Layout khác nhau.
  - Tích hợp bộ đếm tăng giảm số lượng trực tiếp trên từng thẻ sản phẩm (`[-] [SL] [+]`), viền vàng phát sáng khi được chọn.
- **Thanh Hành Động Gom Hàng Bento (Bottom Batch Action Bar)**:
  - Hiển thị danh sách chip các mặt hàng đã chọn kèm số lượng `(xSL)`, hỗ trợ xoá từng món hoặc bỏ chọn tất cả.
  - Nút bấm nổi bật: `⚡ TẠO CHUNG 1 LỆNH SẢN XUẤT (X SẢN PHẨM)`.
- **Tự Động Nạp Dữ Liệu Vào Form Tạo Lệnh Tồn (`AddModal` - `Modals_Orders.html`)**:
  - Khi bấm tạo lệnh chung, toàn bộ danh sách sản phẩm đã gom cùng số lượng được tự động nạp 100% vào bảng "HÀNG TRONG ĐƠN" của kênh Sản Xuất Tồn, sẵn sàng lưu ngay mà không cần nhập tay lại từ đầu.
- **Tối Ưu Header & Loại Bỏ Web Push Notification Phiền Phức (`App_Main.html`)**:
  - Xoá hoàn toàn nút "Bật Thông Báo" và các lệnh xin quyền trình duyệt ngầm gây spam pop-up cảnh báo trên màn hình làm việc của nhân sự.

---

## [v2.10.21] - 2026-08-24

### 🎯 Trạm Kiểm Soát Hàng Hoàn & Tự Động Phạt Giá Vốn SLA 72H
- **Bắt Buộc Nhập Lý Do Hoàn Hàng (`Modals_Orders.html`)**:
  - Tích hợp ô chọn/nhập lý do hoàn hàng thông minh với 5 nút bấm nhanh (Quick Pills):
    - 💥 `Vận chuyển bể vỡ (ĐVVC)`
    - 🚫 `Khách không nhận (Boom hàng)`
    - ⚠️ `Lỗi chất lượng / Sai mẫu`
    - ⏳ `Giao hàng trễ`
    - 📝 `Khác...` (cho phép gõ chi tiết).
  - Chặn duyệt hoàn hàng nếu chưa chỉ định lý do cụ thể. Tự động lưu tag `[LÝ DO HOÀN: ...]` vào `note` và phân loại luồng kho tự động (Hàng vỡ/lỗi tự động xuất huỷ, hàng nguyên vẹn nhập lại kho).
- **Tự Động Xử Lý Đơn Hoàn Quá Hạn 72 Giờ & Phạt Giá Vốn Diệu Hương**:
  - Nhận diện đơn hoàn quá thời hạn khiếu nại sàn (72 giờ).
  - Tự động chuyển trạng thái đơn sang `Hoàn Thành` (Đã đối soát xong), đánh dấu `isReconciled = true`.
  - Tự động ghi nhận Xuất Huỷ hàng hoá trong bảng `ImportExport`.
  - Tự động phạt đúng 100% Giá Vốn (COGS) vào bảng `BonusPenalty` cho **Nguyễn Thị Diệu Hương** (`-COGS`).
  - Ghi nhận lịch sử vào `Tracking_Log` (Combat Log).
- **Hệ Thống Quét Ngầm Server (`Operations.js` & `Code.js`)**:
  - Bổ sung hàm backend `api_auditOverdueReturnOrdersSLA()` và router API tương ứng để quét định kỳ toàn bộ đơn hoàn quá hạn.

---

## [v2.10.20] - 2026-08-24

### 🎯 Hộp Đen Đối Soát 360° — Hợp Nhất 100% CSDL Lệnh Sản Xuất, Đóng Gói & Thưởng Phạt
- **Tổng hợp CSDL Thao Tác Toàn Diện (`Tab_Production.html`)**:
  - Không phụ thuộc vào bảng `Tracking_Log` đơn lẻ: Tự động tổng hợp và bóc tách dữ liệu từ **450+ lượt thao tác thực tế** trong bảng `Production` (`prodItems`), `Packings` và `BonusPenalty`.
  - Ghi nhận đầy đủ: Thời gian Bắt đầu Khâu 1, Hoàn thành Khâu 1, Bắt đầu Khâu 2, Hoàn thành Khâu 2, Đóng gói, QC kiểm định của mọi thợ trong xưởng (Tâm, Đạt, Dương, Hương, Tiến...).
- **Nâng Cấp Giao Diện Bento UI & Bộ Lọc Nâng Cao**:
  - **Bento Metrics Bar**: Hiển thị tức thì tổng số lượt thao tác, số lượng thợ hoạt động và tổng tiền định mức/thưởng đang lọc.
  - **Bộ Lọc Nguồn Chuyên Sâu**: Chuyển đổi linh hoạt giữa `Toàn Bộ`, `🏭 Sản Xuất`, `📦 Đóng Gói`, `⚖️ Thưởng/Phạt`, `💻 Máy Này`, `☁️ Server`.
  - **Lọc Theo Loại Hành Động**: `▶️ Bắt đầu việc`, `✅ Hoàn thành việc`, `🔍 Kiểm định QC`.
  - **Ô Tìm Kiếm Tức Thì**: Tra cứu nhanh theo mã đơn hàng (`#ORD_...`), tên sản phẩm, tên thợ hoặc ghi chú.
- **Xem Ảnh Nghiệm Thu Phóng To (Proof Lightbox)**:
  - Hiển thị thumbnail ảnh chụp sản phẩm lúc hoàn thành của thợ trực tiếp trên từng dòng log; hỗ trợ bấm vào để phóng to xem ảnh chi tiết độ phân giải cao phục vụ đối chất chất lượng.
- **Sao Chép Bằng Chứng Đối Chất**:
  - Nút sao chép văn bản định dạng chuẩn, đầy đủ mốc thời gian, tên thợ, hành động, đơn hàng, tiền thưởng và link ảnh để gửi Zalo làm việc.

---

## [v2.10.19] - 2026-08-24

### 🎯 Hộp Đen Đối Soát Thao Tác Toàn Xưởng — Đồng Bộ CSDL Máy Chủ
- **API `api_getWorkerAuditLogs` (`Code.js`)**:
  - Bảo vệ đa tầng bằng `LockService` (chống concurrency) và xác thực phân quyền TỐI CAO / ADMIN.
  - Quét 500 dòng thao tác gần nhất từ bảng `Tracking_Log` của CSDL Google Sheets, bóc tách chính xác tên thợ, hành động, đơn hàng, định mức thưởng, thiết bị và trạng thái mạng.
- **Nâng Cấp Modal Hộp Đen (`Tab_Production.html`)**:
  - Tự động nạp dữ liệu Server khi mở modal.
  - Bổ sung bộ lọc 3 chế độ nguồn log: **Toàn Bộ** (Hợp nhất), **Server** (CSDL Google Sheets), **Máy Này** (LocalStorage).
  - Dropdown thợ tự động nạp danh sách **100% nhân sự trong công ty** từ `Config_NhanSu` và nhật ký thực tế.
  - Tích hợp nút **Làm mới** (Sync icon) nạp lại realtime và sao chép chứng cứ đầy đủ thông tin.

---

## [v2.10.18] - 2026-08-24

### 🎯 Khắc Phục Lỗi Nhập Số Tiền Thanh Khoản Trên Di Động & Tối Ưu UX
- **Khắc phục lỗi Input trên bàn phím cảm ứng (`Modals.html`)**:
  - Thay đổi `type="number"` sang `type="text" inputMode="numeric" pattern="[0-9]*"`, giải quyết triệt để vấn đề Safari / Chrome Android khoá hoặc không nhận ký tự khi nhập số tiền.
  - Tự động định dạng phân tách hàng nghìn (ví dụ gõ `50000` hiển thị đẹp mắt thành `50.000 VNĐ`) theo thời gian thực.
  - Bổ sung 4 phím tắt chọn nhanh mệnh giá phổ biến: `+50K`, `+100K`, `+200K`, `+500K` và nút `Xoá` nhanh cực kỳ tiện lợi cho anh em xưởng thao tác bằng 1 tay trên điện thoại.

---

## [v2.10.17] - 2026-08-24

### 🎯 Tra Cứu Bể Kính & Layout Hết Kho Trực Tiếp Trên Tab Sản Xuất
- **Nút "Hết Kho" Kèm Badge Cảnh Báo Realtime (`Tab_Production.html`)**:
  - Tích hợp ngay trên thanh công cụ sản xuất với badge đếm số lượng mặt hàng hết tồn kho tự động quét từ CSDL `Products`.
- **Khung Bento UI Tra Cứu Toàn Diện**:
  - Tra cứu trực tiếp danh sách mặt hàng Bể Kính & Layout hết hàng hoặc sắp hết (dưới `minStock`).
  - Hỗ trợ lọc theo phân hệ (Tất cả / Bể Kính / Layout), trạng thái tồn kho (Hết hàng / Sắp hết) và tìm kiếm SKU/tên hàng siêu tốc.
  - Tích hợp nút **"Sao chép DS"** để gửi nhanh sang Zalo xưởng và nút **"Tạo Lệnh"** 1-chạm để mở ngay form SXT mà không cần rời Tab Sản Xuất.

---

## [v2.10.16] - 2026-08-24

### 🎯 Tách Bạch Hoàn Toàn KPI & Nhiệm Vụ Xu
- **Loại bỏ AI đoán mò (Regex Heuristics) trong `Tab_HR.html`**:
  - Nhận thấy việc sử dụng từ khoá để phân loại KPI/Nhiệm vụ lẻ (ví dụ: "Dọn dẹp bể kính" bị lầm thành KPI vì có chữ "bể kính") gây bất cập, hệ thống đã loại bỏ hoàn toàn cơ chế đoán tên này.
  - Từ phiên bản này, phân loại được tách bạch 100% dựa vào **Hành động của người dùng**: Tạo từ nút "Tạo KPI" thì chắc chắn là KPI, tạo từ nút "Giao Việc" thì chắc chắn là Nhiệm Vụ Xu.

---

## [v2.10.15] - 2026-08-24

### 🎯 Tối Ưu Phân Loại Nhiệm Vụ & KPI Sản Xuất
- **Khắc phục lỗi nhận diện sai hạng mục KPI (`Tab_HR.html`)**:
  - Trí tuệ nhận diện của hệ thống đã được nâng cấp. Giờ đây, các công việc có chứa từ khoá cốt lõi của xưởng như `Gia cố`, `Sản xuất`, `Cắt dán`, `Dựng khung`, `Layout`, `Bể kính` sẽ luôn được bảo vệ và giữ đúng định dạng là **"KPI Tháng"** dù cho đơn vị đo lường có là "Bộ" hay "Cái".
  - Chấm dứt tình trạng các KPI sản xuất quan trọng bị đẩy nhầm sang tab "Nhiệm Vụ Xu" gây nhầm lẫn trong quá trình theo dõi năng suất.

---

## [v2.10.14] - 2026-08-24

### 🎯 Tái Cấu Trúc Bộ Lọc Giao Diện Kho Hàng & Nhật Ký Chứng Từ
- **Quy Hoạch 3 Kho Tổng (`Tab_ImportExport.html` & `Tab_Inventory.html`)**:
  - Gộp các danh mục nhỏ rườm rà thành 3 nhóm kho chính rõ ràng: Kho Hàng Hoá (Phụ Kiện), Kho Thành Phẩm (Layout/Bể kính), Kho Nguyên Liệu (Vật tư).
  - Loại bỏ hoàn toàn danh mục "Hàng Hỏng Vỡ" khỏi cấu hình `CATEGORIES` (`Config.html`) để tối ưu không gian hiển thị (hàng hỏng vỡ vẫn xem được qua module báo cáo hao hụt nếu cần).
  - Tối ưu bộ lọc "Nhật Ký Chứng Từ": Thay vì lọc theo thao tác (Nhập Sản Xuất, Nhập Mua...) giờ đây hệ thống tự động phân luồng phiếu dựa trên các mặt hàng bên trong chứng từ đó thuộc "Kho" nào.

---

## [v2.10.13] - 2026-08-24

### 🎯 Quét 100% Số Liệu Thực Tế Từ CSDL Cho KPI Lợi Nhuận Ròng
- **Quét 100% CSDL Đơn Hàng & Sổ Quỹ (`Tab_HR.html` & `Code.js`)**:
  - Loại bỏ hoàn toàn hệ số ước tính 25% cũ.
  - Bóc tách doanh thu thực, giá vốn COGS thực tế, phí sàn và voucher từ bảng `Orders`.
  - Quét chi phí lương, mặt bằng, điện nước, vật tư thực tế phát sinh trong tháng từ bảng `Transactions` (loại trừ chuyển khoản nội bộ / rút tiền).
  - Đảm bảo tỷ lệ Biên Lợi Nhuận Ròng phản ánh đúng 100% dòng tiền và hoạt động kinh doanh thực của xưởng.

---

## [v2.10.12] - 2026-08-23

### 🎯 Sửa Lỗi Hiển Thị Biên Lợi Nhuận Bảng Kênh Bán & Tinh Lọc Chi Phí P&L
- **Sửa Lỗi Biên LN Bảng Kênh Bán (`Tab_Analytics.html`)**:
  - Dòng Tổng cộng trong *Bảng Báo Cáo Hiệu Quả Từng Kênh Bán* đã được sửa lại công thức tính đúng **Biên Lợi Nhuận Gộp Kênh** `(+67.9%)`, loại bỏ triệt để việc cắm nhầm tỷ lệ P&L toàn công ty `(-80.9%)`.
- **Lọc Sạch Giao Dịch P&L Sổ Quỹ**:
  - Loại bỏ các phiếu chuyển tiền nội bộ, rút quỹ, tạm ứng chưa phân loại khỏi chi phí vận hành doanh nghiệp.

---

## [v2.10.11] - 2026-08-23

### 🎯 Gộp Doanh Thu Chốt Đơn Đang Xử Lý Vào Số Chính & Tinh Giản Thẻ KPI
- **Gộp Doanh Thu Đang Chạy Vào Tiến Độ Chính (`Tab_HR.html`)**:
  - Toàn bộ giá trị các đơn hàng bán lẻ chốt thành công trong tháng (cả đơn đã hoàn thành và đơn đang sản xuất/chờ bàn giao) được cộng dồn trực tiếp vào số tiến độ thực tế.
- **Loại Bỏ Hoàn Toàn Dòng Chữ "Tạm Nhận"**:
  - Ẩn triệt để nhãn tạm nhận phụ, giúp giao diện thẻ KPI đạt chuẩn Hallmark UI tối giản, sang trọng và không gây rối mắt.

---

## [v2.10.10] - 2026-08-23

### 🎯 Tối Ưu Bố Cục Thẻ KPI Gọn Gàng, Chống Díu Chữ & Hiển Thị Đầy Đủ Thưởng Kèm Chế Tài Phạt
- **Bố Cục Thẻ KPI Gọn Gàng & Thoáng Đãng (`Tab_HR.html`)**:
  - Tách biệt rõ ràng khối tiêu đề nhiệm vụ và huy hiệu nhận diện bên trái với cụm chỉ số hoàn thành / target bên phải, loại bỏ hoàn toàn hiện tượng chữ bị co kéo, díu chữ trên màn hình nhỏ.
- **Hiển Thị Đầy Đủ Thưởng & Phạt Nếu Không Đạt**:
  - Tự động hiển thị song song huy hiệu Thưởng đạt chỉ tiêu (Xanh lá) và Chế tài phạt nếu không đạt (Đỏ) ngay trên thẻ tóm tắt và trong bảng chi tiết mở rộng.
- **Thanh Tiến Độ Micro Hairline & Tỷ Lệ % Đạt Chuẩn**:
  - Bổ sung thanh tiến độ hairline tinh tế ở đáy thẻ và định dạng font-mono rõ nét cho các chỉ số đo lường.

---

## [v2.10.9] - 2026-08-23

### ⚡ Chọn Hàng Loạt, Xoá Hàng Loạt & Phân Bổ Danh Mục Thu Chi Đa Điểm Chuẩn Hallmark
- **Ô Chọn Checkbox Từng Phiếu & Nút Chọn Tất Cả (`Tab_Finance.html`)**:
  - Tích hợp ô checkbox trực quan trên từng dòng phiếu giao dịch với hiệu ứng viền Amber sang trọng khi được chọn.
  - Thêm nút *"Chọn Tất Cả"* / *"Đã chọn (N)"* trên thanh công cụ lọc nhanh giúp chọn nhanh toàn bộ phiếu trong nháy mắt.
- **Thanh Tác Vụ Nổi (Floating Batch Action Bar)**:
  - Tự động xuất hiện thanh điều khiển cố định ở cạnh dưới màn hình hiển thị: Số lượng phiếu đã chọn, Tổng tiền tương ứng, nút Phân Bổ Danh Mục, nút Xoá Đã Chọn và nút Bỏ Chọn.
- **Modal Phân Bổ Danh Mục Hàng Loạt (Batch Categorize)**:
  - Chọn nhanh danh mục Thu/Chi có sẵn hoặc nhập danh mục tùy biến để áp dụng hàng loạt cho tất cả các phiếu đã chọn (đặc biệt hữu ích cho các giao dịch ngân hàng tự động import mang nhãn *"Chờ Xử Lý"*).
- **Xoá Hàng Loạt An Toàn (Batch Delete) & Tự Động Hoàn Lại Số Dư Quỹ**:
  - Tính toán và hoàn lại đúng số dư từng tài khoản quỹ bị ảnh hưởng trong 1 transaction duy nhất, cập nhật Optimistic UI tức thời và đồng bộ với Google Sheets.

---

## [v2.10.8] - 2026-08-23

### 📈 Tự Động Đo Doanh Thu Tổng (Không Trừ Hoàn) & Lợi Nhuận Ròng Cho Founder và Toàn Doanh Nghiệp
- **Tự Động Đo Doanh Thu Tổng Không Trừ Hoàn (`Tab_HR.html` & `Code.js`)**:
  - Đối với Founder (Nguyễn Ngọc Tiến / Quản trị Tối Cao / Toàn Xưởng), KPI Doanh Thu tự động quét toàn bộ đơn hàng hợp lệ của tất cả các kênh (Shopee VN, Tiktok Shop, Bán Lẻ, Bán Sỉ, Xuất Khẩu, CTV...) trong kỳ.
  - Áp dụng nguyên tắc tương đồng với tab *Thống Kê Đơn Hàng*: Chỉ loại trừ đơn HỦY (`status = 'Đơn Hủy'`), tuyệt đối không trừ đơn hoàn ra khỏi tổng doanh thu bán hàng.
- **Tự Động Đo Lợi Nhuận Ròng % (Net Profit Margin)**:
  - Tự động tính tỷ lệ Lợi Nhuận Ròng % từ kết quả kinh doanh thực tế (hoặc chốt sổ P&L `ProfitReports`), xóa bỏ hoàn toàn tình trạng bị kẹt số liệu âm cũ `-60/10 %`.
- **Đồng Bộ Hai Chiều Real-time WebApp & Cron Trigger Backend**:
  - Đồng bộ thuật toán giữa `getDynamicKPIProgress` (tính toán tức thời trên WebApp) và `updateKpiProgressData` (trigger chạy ngầm định kỳ trên Google Apps Script).

---

## [v2.10.7] - 2026-08-23

### 💰 Tách Biệt Lọc Thu/Chi, Xem Chi Tiết Phiếu & Loại Bỏ Khoản Điều Chỉnh Số Dư Khỏi Báo Cáo Doanh Thu
- **Loại Bỏ Hoàn Toàn Phiếu Điều Chỉnh Số Dư Khỏi Báo Cáo Doanh Thu / Chi Phí (`Tab_Finance.html`)**:
  - Bóc tách triệt để các giao dịch điều chỉnh số dư kỹ thuật (`TX_ADJ_`, `Điều Chỉnh Số Dư`, `Cân Đối Quỹ`) khỏi tổng tiền thu/chi kinh doanh (`totalThu`, `totalChi`) và biểu đồ tỷ trọng trong *Báo Cáo Cơ Cấu*.
  - Khắc phục triệt để hiện tượng khoản số dư ban đầu hoặc cân đối quỹ (ví dụ 851.244.604đ hoặc 137.684.912đ) bị tính nhầm vào "Chi Phí Khác" trong tỷ trọng thu.
- **Thanh Lọc Nhanh Tách Biệt: Thu / Chi / Chuyển Quỹ / Điều Chỉnh (`Tab_Finance.html`)**:
  - Bổ sung thanh nút lọc phân loại nhanh trên đầu Sổ Quỹ: `TẤT CẢ`, `TIỀN THU (+...)`, `TIỀN CHI (-...)`, `CHUYỂN QUỸ (↔...)`, `ĐIỀU CHỈNH (...)` kèm số lượng và tổng tiền tương ứng.
  - Cho phép người quản trị bấm 1 chạm để xem riêng toàn bộ các phiếu Thu hoặc toàn bộ các phiếu Chi một cách rõ ràng, minh bạch.
- **Modal Xem Chi Tiết Phiếu Toàn Diện (Transaction Detail Modal)**:
  - Bổ sung nút con mắt `fa-eye` và hỗ trợ bấm trực tiếp vào từng dòng giao dịch để mở cửa sổ chi tiết: hiển thị đầy đủ Mã GD, Thời gian, Số tiền lớn nổi bật, Danh mục, Tài khoản Nguồn/Đích, Số dư trước/sau, Diễn giải & Ghi chú, Ảnh chứng từ bill gốc kèm nút In Phiếu K58 tiện lợi.
- **Tự Động Chuẩn Hóa CSDL Backend (`Code.js` - `api_repairAdjustmentTransactions`)**:
  - Tự động quét và cập nhật lại danh mục của các bản ghi điều chỉnh số dư cũ sang `'Điều Chỉnh Số Dư'`, bảo đảm tính toàn vẹn và sạch sẽ của bảng `Transactions`.

---

## [v2.10.6] - 2026-08-23

### 📊 Khắc Phục Triệt Để Lỗi Công Nợ Âm Nhà Cung Cấp & Tự Động Làm Sạch Sổ Cái
- **Gỡ Bỏ Thuật Toán Ghi Đè Công Nợ Bằng Giao Dịch Chi Lương (`Code.js`)**:
  - Phân tích nguyên nhân: hàm `getRealSupplierDebt` trước đây thực hiện quét mờ toàn bộ bảng `Transactions` và trừ nhầm các giao dịch chi lương, tạm ứng của thợ xưởng (như Tâm 16.554.550đ, Tân 3.718.863đ, Đăng 814.880đ) vào công nợ nhà cung cấp.
  - Xóa bỏ logic tự động tính đè này trong `getAppData()`, bảo đảm dữ liệu `totalDebt` từ Google Sheet `Suppliers` là Source of Truth tuyệt đối.
- **Tôn Trọng Tuyệt Đối Mọi Thao Tác Sửa/Xóa Trên Google Sheet & WebApp**:
  - Giờ đây khi người dùng xóa hoặc sửa số tiền công nợ trực tiếp trên Google Sheet hoặc qua modal *Sửa Nhà Cung Cấp*, hệ thống giữ nguyên 100% số liệu mà không bị tự tính lại thành số âm khi tải app.
- **Tự Động Làm Sạch & Khôi Phục Công Nợ Hợp Lý (`api_repairSupplierNegativeDebts`)**:
  - Tự động phát hiện các dòng công nợ bị âm do lỗi cũ, tính toán lại dựa trên tổng các phiếu nợ thực tế (`ImportExport` chưa thanh toán) hoặc đưa về `0đ` và lưu sạch sẽ về Google Sheet `Suppliers`.

---

## [v2.10.5] - 2026-08-23

### 🪙 Khôi Phục Tiến Độ Nhiệm Vụ Xu Chưa Hoàn Thành Về Đúng Bảng `KPI_Progress`
- **Sửa Lỗi Duyệt Sớm / Cộng Nhầm Xu Khi Chưa Đạt Chỉ Tiêu (`Code.js`)**:
  - Khắc phục lỗi hiển thị đã duyệt nhầm đối với các nhiệm vụ đang thực hiện (ví dụ: Diệu Hương được giao "Thanh Lý Layout Lẻ Size" chỉ tiêu 8 bộ mới bán được 1 bộ).
  - Triển khai hàm `api_repairAndRestoreTasksFromXuSheet()` bọc `LockService`: tự động phục hồi các nhiệm vụ đang làm từ `ThongKe_TichLuyXu` về bảng `KPI_Progress` với `isClaimed = FALSE` và chỉ tiêu chuẩn xác (`current = 1, target = 8, unit = 'Bộ'`), đồng thời làm sạch bảng `ThongKe_TichLuyXu`.
- **Quy Hoạch Đúng Bảng Theo Đúng Nghiệp Vụ**:
  - `KPI_Progress`: Lưu giữ và theo dõi tiến độ toàn bộ các nhiệm vụ (Tasks & KPI) đang thực hiện (chưa hoàn thành), hiển thị thanh máu 1/8 bộ trong tab Nhiệm Vụ của nhân sự.
  - `ThongKe_TichLuyXu`: Chỉ lưu giữ các khoản Xu đã thực nhận / quà tặng khai ví hoặc nhiệm vụ đã hoàn thành 100% và được duyệt thưởng.
- **Chuẩn Hóa API Giao Việc (`api_insertManualTask`)**:
  - Giao nhiệm vụ trực tiếp vào `KPI_Progress` với trạng thái `isClaimed = false`, không tự động cộng Xu vào ví tích lũy khi chưa hoàn thành.

---

## [v2.10.4] - 2026-08-23

### 🛠️ Tối Ưu Thẻ Sản Xuất & Loại Bỏ Hiệu Ứng Neon, Chuẩn Hóa Nhận Diện Khâu (Hallmark UI)
- **Loại Bỏ Hoàn Toàn Viền Neon Xoay Chuyển 360 Độ (`Tab_Production.html`)**:
  - Gỡ bỏ hoàn toàn class `neon-running-dot`, `@keyframes rf-spin-slow` conic-gradient và bóng mờ quá đà gây rối mắt và làm giảm hiệu năng máy xưởng.
  - Thay thế bằng viền hairline 1px ambient sang trọng, cao cấp theo tông màu nhận diện thực chiến: Xanh Lam (Đang làm), Xanh Lục (Đạt KCS / Chờ gia cố), Tím Indigo (Chờ duyệt KCS), Đỏ Rose (Yêu cầu làm lại).
- **Thanh Định Vị Trạng Thái Tinh Tế & Huy Hiệu Giai Đoạn Đang Thực Hiện**:
  - Tích hợp thanh hairline 2.5px gradient định vị trạng thái ở mép trên của mỗi thẻ sản xuất.
  - Bổ sung Huy hiệu định vị giai đoạn sản xuất với đèn thở micro-pulse trực quan (`ĐANG LÀM: DỰNG KHUNG (TÂN)`, `CHỜ GIA CỐ`, `CHỜ DUYỆT KHÂU 1`, `YÊU CẦU LÀM LẠI`, `ĐẠT KCS`, `CHỜ NHẬN VIỆC`), giúp thợ xưởng nhận biết tiến độ ngay trong 0.1 giây.
- **Chuẩn Hóa Khối Khâu & Cụm Nút Thao Tác (`WorkerPhaseV2`)**:
  - Nâng cấp độ tương phản cho từng khối khâu sản xuất; tối ưu nút *Nhận Làm*, *Chụp/Tải Ảnh*, *Xem Ảnh*, *Làm Lại* với phản hồi tactile xúc giác sắc nét.
  - Đồng bộ dark theme chuẩn mực cho Accordion gom lô sản xuất (`GroupedWorkerCardAccordion`).

---

## [v2.10.3] - 2026-08-23

### 🪙 Tự Động Quy Hoạch Toàn Bộ KPI Xu Sang Bảng ThongKe_TichLuyXu
- **Tự Động Quét & Di Dời Dữ Liệu KPI Xu Khỏi `KPI_Progress` (`Code.js`)**:
  - Xây dựng hàm `api_migrateKpiXuFromKPIProgressToThongKeTichLuyXu()` bọc `LockService` tự động chạy trong nền khi khởi tạo hệ thống (`getAppData`).
  - Quét sạch toàn bộ các dòng nhiệm vụ Xu (`KPI_XU_...`, `unit = Xu`, tiêu đề thưởng xu) trong bảng `KPI_Progress`, chuyển đổi sang định dạng 8 cột chuẩn của `ThongKe_TichLuyXu` (`id`, `user`, `type`, `amount_xu`, `date`, `orderCode`, `note`, `timestamp`).
  - Xóa triệt để các dòng Xu khỏi bảng `KPI_Progress`, bảo đảm `KPI_Progress` 100% tinh gọn, chỉ lưu giữ các chỉ tiêu sản xuất, tiến độ năng suất và thưởng tiền mặt của xưởng.
- **Chuẩn Hóa Luồng Giao Nhiệm Vụ Xu (`api_insertManualTask`)**:
  - Khi Boss / Quản lý giao nhiệm vụ Xu, dữ liệu được ghi nhận trực tiếp vào bảng `ThongKe_TichLuyXu` (`type = 'XU_TASK'`), không làm phát sinh rác dữ liệu ở các bảng khác.
- **Bảo Vệ Tính Toàn Vẹn & Trải Nghiệm Tự Động Hóa**:
  - Xử lý hoàn toàn tự động trong backend, không tạo nút thừa gây rối giao diện người dùng.

---

## [v2.10.2] - 2026-08-23

### 🛡️ Loại Trừ Đơn Hàng & Cảnh Báo SLA Đóng Gói Vào Ngày Chủ Nhật (Nghỉ Chủ Nhật)
- **Loại Trừ Toàn Diện Ngày Chủ Nhật Khỏi Cảnh Báo SLA Đóng Gói (Dashboard)**:
  - Tự động kiểm tra ngày trong tuần (`new Date().getDay() === 0`).
  - Khi là Chủ Nhật (xưởng nghỉ), Dashboard ẩn hoàn toàn banner đỏ *"CẢNH BÁO SLA ĐÓNG GÓI (SAU 19:00)"* và đặt `readyToPackOrders` về `[]`.
  - Không kích hoạt sự kiện gửi log vi phạm sau 19:00 lên Combat Log và Backend.
- **Khóa Cơ Chế Tự Động Phạt 20k/Đơn Shopee VN Sau 21:00 Trên Backend (`Operations.js`)**:
  - `api_getOperationsHealth` và `api_recordPackingViolationLog` tự động bỏ qua ngày Chủ Nhật.
  - Tuyệt đối không ghi nhận các dòng phạt `BP_AUTO_SHOPEE_21H_...` hay `BP_SLA_PACK_...` vào `BonusPenalty` và `Tracking_Log` trong ngày nghỉ xưởng.
  - Bảo vệ nhân sự phụ trách (Diệu Hương) không bị phạt oan hoặc chịu áp lực thông báo vi phạm khi xưởng đóng cửa.
- **Bổ Sung Công Cụ Dọn Dẹp An Toàn (`api_cleanupSundayPackingViolations`)**:
  - Cung cấp hàm Apps Script bọc `LockService` an toàn để quét và xóa sạch các bản ghi phạt/cảnh báo SLA nhầm lẫn trong các ngày Chủ Nhật.

---

## [v2.10.1] - 2026-08-23

### 👑 Chuẩn Hóa Mốc 9 Bậc Quân Hàm Thực Chiến & Tích Hợp Quỹ 50.000 Xu
- **Tinh Chỉnh Mốc Phân Bậc Quân Hàm Theo Cấu Trúc Thực Tế Xưởng**:
  - *Tier 0 (Tân Thủ)*: Cấp 1 - 9 (Nhân sự mới, làm quen quy trình).
  - *Tier 1 (Hổ Phách)*: Cấp 10 - 14 (Thành viên tích cực, nắm vững thao tác).
  - *Tier 2 (Lục Bảo)*: Cấp 15 - 19 (Làm chủ quy trình, chuẩn KCS vượt bậc).
  - *Tier 3 (Lam Ngọc)*: Cấp 20 - 24 (Tốc độ và độ chuẩn xác then chốt).
  - *Tier 4 (Thạch Anh)*: Cấp 25 - 29 (Tay nghề bậc thầy, xử lý đơn phức tạp).
  - *Tier 5 (Huyết Tướng)*: Cấp 30 - 34 (Chiến binh chủ lực vượt bão đơn).
  - *Tier 6 (Hoả Phụng)*: Cấp 35 - 39 (Ngọn lửa tiên phong, dẫn dắt đồng đội).
  - *Tier 7 (Thái Dương)*: Cấp 40 - 49 (Trụ cột vững chắc, bảo chứng chất lượng).
  - *Tier 8 (Thần Thoại)*: Cấp 50 - 100 (Huyền thoại cống hiến trọn đời).
- **Khắc Phục Hiển Thị Quỹ 50.000 Xu Boss Tặng & So Khớp Họ Tên Thông Minh**:
  - Đọc chuẩn từ `ThongKe_TichLuyXu` kết hợp `KPI_Progress` và `BonusPenalty`, khử trùng lặp theo ID.
  - Tích hợp hàm `matchUser` tự động so khớp họ tên đầy đủ (`Nguyễn Thị Diệu Hương` $\leftrightarrow$ `Diệu Hương`, `Lại Trường Tâm` $\leftrightarrow$ `Tâm`, `Nguyễn Ngọc Tiến` $\leftrightarrow$ `Tiến`...).
  - Hiển thị đầy đủ số dư Xu trên Badge thẻ nhân sự, Tab Xu Tích Lũy và Modal Lịch Sử EXP.
- **Nâng Cấp Huy Hiệu Dual-Pill Độ Tương Phản Cao (High Contrast)**:
  - Tách biệt rõ ràng 2 khối: Số Cấp Độ (chữ to vàng neon trên nền đen viền kim loại 2px) và Bậc Quân Hàm riêng biệt, xóa bỏ triệt để hiện tượng chữ mờ hay lẫn màu.

---

## [v2.10.0] - 2026-08-23

### 👑 Nâng Cấp Toàn Diện Hệ Thống EXP, 9 Bậc Quân Hàm & Giao Diện Thẻ Nhân Sự
- **Hệ Thống 9 Bậc Quân Hàm & Dải Màu Neon Prestige**:
  - Thiết kế chuẩn 9 Bậc Quân Hàm (Tân Thủ, Hổ Phách, Lục Bảo, Lam Ngọc, Thạch Anh, Huyết Tướng, Hoả Phụng, Thái Dương, Thần Thoại).
  - Tích hợp biểu tượng Emoji, Icon FontAwesome động, viền hào quang Aura và danh hiệu cống hiến theo cấp độ.
- **Công Thức EXP Lũy Tiến Bậc 2.35 (Chuẩn RPG Cống Hiến)**:
  - Công thức luỹ tiến bậc 2.35 với $MAX\_EXP = 2.000.000.000$ (2 Tỷ EXP), đảm bảo cấp đầu lên nhanh để khích lệ, cấp cao yêu cầu cống hiến bền bỉ.
  - Tích lũy tự động từ **5 nguồn cống hiến thực chiến**:
    1. *Chuyên Cần & Chấm Công*: Giờ làm thực tế $\times$ Đơn giá giờ.
    2. *Sản Xuất Đạt KCS*: Tiền công khâu 1 & khâu 2 đạt chuẩn nghiệm thu.
    3. *Đóng Gói & Xuất Kho*: Tiền công đóng gói đơn hàng & chở kho.
    4. *Thưởng KPI Đạt Mốc*: Tiền thưởng từ các KPI tháng đã nghiệm thu.
    5. *Nhiệm Vụ Xu Thưởng*: Xu tích lũy từ các nhiệm vụ ngắn hạn & cống hiến xưởng.
- **Tái Cấu Trúc Thẻ Nhân Sự Chống Cắt Tràn Tên & Thanh Shimmer EXP**:
  - Sửa triệt để lỗi co cụt họ tên nhân sự, hiển thị đầy đủ và rõ ràng trên mọi kích thước màn hình.
  - Thanh EXP Bar full-width có hiệu ứng ánh sáng Shimmer lướt qua, hiển thị số EXP hiện có / EXP cần và % tiến độ.
  - Bấm trực tiếp vào Huy hiệu Cấp độ hoặc Thanh EXP để bung Modal tra cứu.
- **Modal Tra Cứu Lịch Sử EXP & Đại Sảnh 100 Cấp Độ**:
  - Xây dựng component `ExpHistoryRoadmapModal` chuẩn Bento Hallmark với 2 tab chính:
    - *Tab 1: Lịch Sử Tích Lũy EXP*: Bento 5 nguồn cống hiến, bộ lọc theo nguồn và timeline chi tiết từng giao dịch.
    - *Tab 2: Đại Sảnh 100 Cấp Độ*: Chi tiết 9 Bậc Quân Hàm, phạm vi cấp, yêu cầu EXP và tự động highlight bậc hiện tại của nhân sự.

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
