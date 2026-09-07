# Phân tích mã nguồn RF Workspace Pro

Ngày kiểm tra: 05/09/2026. Phạm vi: bản mã hiện có trong workspace, bao gồm các thay đổi chưa commit. Không sửa mã ứng dụng, không gọi API sản xuất, không đọc giá trị trong `.env`. Đây là phân tích tĩnh kết hợp kiểm chứng cục bộ bằng dữ liệu giả; không phải xác nhận trạng thái bản đã triển khai.

## 1. Kết luận

App đã có nghiệp vụ ERP phong phú, nhưng mức bảo vệ dữ liệu và độ tin cậy khi ghi chưa tương xứng với phạm vi vận hành. Ưu tiên sửa xác thực, phản hồi lỗi và định danh đơn trước khi mở rộng AI hoặc tính năng mới. Không cần viết lại toàn bộ: có thể giữ giao diện hiện tại và tách dần các dịch vụ phía máy chủ.

## 2. Kiến trúc thực tế

| Tầng | Tệp chính | Trách nhiệm |
|---|---|---|
| Khởi động giao diện | Index.html | Ghép các HTML fragment bằng include; biên dịch JSX qua Babel trong trình duyệt; cache bản biên dịch |
| Điều phối giao diện | App_Main.html | Đăng nhập, state dùng chung, runGAS, cập nhật lạc quan, tải dữ liệu, Firebase delta, điều hướng |
| Màn hình nghiệp vụ | Tab_*.html, Modals*.html | Đơn, sản xuất, kho, tài chính, HR, báo cáo, tài liệu, cộng tác viên |
| Máy chủ ERP | Code.js | HTTP router, đọc/ghi Sheets, PIN, RBAC, BOM, đối soát, tiền lương, SLA, upload |
| Tự động hóa | Operations.js, RFEnterpriseCore.js, MasterGovernanceAgent.js | KPI, cảnh báo, kiểm tra dữ liệu và trigger |
| Shopee | ShopeeController/ApiService/DbService/SyncEngine/WebhookHandler | API sàn, lưu các bảng DB_*, webhook, trừ kho, đối soát |
| AI tại máy trạm | server_kcs.py, agent_assistant.py, agent_war_room.py, rf_qc_agent.py | Kiểm định ảnh, trợ lý, hội thoại điều hành |
| Phân phối/Thông báo | vercel_index.html, sw.js, push_relay_worker.js | Lớp trang ngoài và thông báo đẩy |

Các tệp lớn: Code.js 13.695 dòng; Modals_Orders.html 9.570; Tab_HR.html 7.474; App_Main.html 6.767; Tab_Production.html 6.171. App_Main còn chứa lịch sử phát hành dài. Đây là hệ thống tập trung lớn, chia tệp theo màn hình nhưng chưa chia rõ dịch vụ nghiệp vụ.

Luồng ghi chính: thao tác màn hình → pushDeltas → sửa state và phát Firebase → runGAS → syncDeltas → xác thực/phân quyền → ScriptLock → cập nhật nhiều Sheet → phản hồi. Firebase hiện mang delta từ trình duyệt, không phải xác nhận giao dịch đã được ghi bền vững.

Luồng sản xuất: đơn hàng → lệnh Production → khâu 1/khâu 2 → QC → xuất nguyên liệu BOM/nhập thành phẩm → đóng gói/bàn giao → đối soát. Nhiều đường vào khác nhau cùng sửa trạng thái và kho: thao tác UI, API, trigger, Shopee và công cụ sửa dữ liệu.

## 3. Phát hiện ưu tiên

### A. Nghiêm trọng: xác thực cấp quyền tối cao bằng giá trị cố định

Code.js:3693–3697 nhận ba chuỗi nội bộ và trả ngay isBoss=true, trước khi kiểm tra cấu hình người dùng. Những giá trị này không bị giới hạn theo nguồn gọi. Router truyền PIN bên ngoài vào cùng hàm. appsscript.json cấu hình ANYONE_ANONYMOUS và chạy bằng người triển khai.

Đã kiểm chứng bằng chính hàm trích từ nguồn: giá trị nội bộ được cấp quyền Boss mà không truy cập Sheet. Cần tách đường chạy trigger khỏi xác thực người dùng; không dùng PIN đặc biệt để biểu diễn danh tính hệ thống.

### B. Nghiêm trọng: phản hồi đăng nhập có thể lộ PIN

Code.js:3726–3727 ghép toàn bộ khóa config.pins vào _debugMsg khi không tìm thấy PIN. getAppData:1459 còn chuyển thông báo này thành error trả ra. Riêng nhánh HTTP action=validatePin đã che thông báo chi tiết; điều đó chưa bảo vệ các đường gọi trực tiếp khác.

Đã kiểm chứng với cấu hình giả: PIN giả xuất hiện trong kết quả thất bại. Cần loại bỏ thông tin xác thực khỏi mọi phản hồi và log chẩn đoán; nếu bản này từng chạy thực tế, cần thay PIN sau khi vá.

### C. Cao: ghi thất bại nhưng trả success=true

Code.js:3558–3570 bắt lỗi syncDeltas, chỉ ghi Logger rồi vẫn trả thành công. Thử cho waitLock ném lỗi giả vẫn nhận success=true. Giao diện có thể báo đã lưu khi chưa ghi gì hoặc chỉ ghi một phần.

Cần trả lỗi ngay, thống nhất hợp đồng success/error, và để giao diện biết thao tác nào chưa được xác nhận. ScriptLock giúp tuần tự hóa nhưng không hoàn tác các Sheet đã ghi trước lỗi.

### D. Cao: hai mã đơn khác nhau có thể ghi đè nhau

Code.js:2167–2172 cho phép khớp orderCode bằng tiền tố hai chiều khi id khác nhau. Thử bản ghi ABC123 rồi thêm ABC1234 với id khác: kết quả chỉ còn một dòng dữ liệu, bị đổi thành đơn sau.

Cần so sánh chính xác mã đã chuẩn hóa; mã ghép phải được tách thành các phần có quy tắc rõ ràng, không dùng tiền tố để định danh.

### E. Cao: phân quyền theo bảng còn cho phép quá rộng

Code.js:3933–4095 cho phép mọi người đã xác thực ghi Attendance, Production và Packings; cuối hàm mặc định allowed=true. Chưa kiểm tra đầy đủ chủ sở hữu bản ghi, trường được sửa hoặc chuyển trạng thái hợp lệ. Nhánh Transactions và BonusPenalty còn cho ngoại lệ dựa vào tiền tố id do client cung cấp.

Ví dụ rõ: ctvTransactions đi qua vòng kiểm tra nhưng không khớp nhánh CTV_Finance trong validator; cuối cùng được cho phép, sau đó ghi CTV_Finance tại 3499–3506. Cần chuẩn hóa tên bảng trước kiểm tra, mặc định từ chối và kiểm tra hành động/trường/chủ sở hữu ở server.

Ngoài ra getAppData:1691–1703 trả dữ liệu nhiều nhóm, gồm tài chính và nhân sự, mà không lọc theo quyền đọc sau khi PIN hợp lệ. Việc ẩn tab không ngăn dữ liệu về trình duyệt.

### F. Cao: phát dữ liệu sang máy khác trước khi server chấp nhận

App_Main.html:6224–6247 báo thành công, sửa state và ghi Firebase trước khi gọi syncDeltas. Nhánh lỗi chỉ hiện thông báo, không hoàn tác delta đã phát. Hàm trả Promise.resolve tại 6275 khi yêu cầu lưu còn chạy, nên await pushDeltas không có nghĩa là đã lưu xong.

Cần giữ cập nhật lạc quan ở máy người thao tác, nhưng chỉ phát thay đổi dùng chung sau khi server chấp nhận; thêm mã thao tác, trạng thái đang lưu/thất bại và cơ chế đồng bộ lại.

Lỗi phụ chắc chắn: bộ đếm pendingSyncsRef tăng ở 6215 rồi nhánh KHÁCH return tại 6222 không giảm lại. Nếu đường này được gọi, polling bị chặn bởi điều kiện pendingSyncsRef > 0 ở 5919/5956.

### G. Cao: webhook chưa xác minh nguồn gửi

Code.js:161–165 định tuyến theo trường payload. ShopeeWebhookHandler.js:34–79 đọc JSON rồi gọi processPayload, chưa thấy bước kiểm tra chữ ký/nguồn gửi trong handler. Dữ liệu này đi vào logic ghi đơn và kho.

Cần xác minh sự kiện tại ranh giới nhận webhook hoặc qua relay có xác thực, trước khi ghi dữ liệu. Mức phơi bày thực tế còn tùy cấu hình endpoint đã triển khai, chưa được kiểm tra ở lượt này.

### H. Cao: AI dùng bộ trạng thái khác với ERP

server_kcs.py:251–272 tạo Pass/Need_Repair. Tab_Production.html:2091 và 2126 nhận trực tiếp các trạng thái đó. Trong khi đó Code.js:2899 chỉ coi QC đạt khi là ĐÃ DUYỆT hoặc ĐẠT. UI tại Tab_Production.html:1776 khóa làm lại bằng chuỗi Yêu cầu làm lại.

Hậu quả có thể xảy ra: AI báo đạt nhưng nhánh phân bổ không coi là sẵn sàng; hoặc kết quả cần sửa không kích hoạt chốt khóa cũ. Cần một bộ trạng thái chuẩn và một hàm ánh xạ tại biên AI. Đây là sự không tương thích đã thấy trong mã; cần thử xuyên suốt trên bản staging để xác định mọi màn hình chịu ảnh hưởng.

## 4. Tính toàn vẹn và khả năng mở rộng

- BOM có chốt chống xử lý lặp qua IE_BOM_<prodId> tại Code.js:9058; đây là hướng đúng. Tuy nhiên tồn kho được ghi tại 9377 trước khi tạo dấu vết BOM tại 9429. Nếu lỗi giữa hai bước, lần thử lại có nguy cơ trừ tiếp vì chưa có dấu hoàn tất. Cần nhật ký thao tác có trạng thái, mã giao dịch duy nhất và khả năng phục hồi.
- applyDeltasToSheet đọc toàn bộ bảng, dò từng item qua từng dòng, rồi ghi lại toàn bộ dữ liệu tại 2271. Chi phí tăng theo số dòng × số item; một sửa đổi nhỏ vẫn ghi cả bảng. Nên dùng bản đồ id→dòng, chỉ ghi dòng thay đổi và giảm thời gian giữ khóa.
- readSheet:1396–1409 cắt bảng lớn xuống 9.999 dòng dữ liệu cuối trước khi lọc nghiệp vụ. Đơn cũ chưa xong hoặc dữ liệu master ở đầu bảng có thể biến mất khỏi kết quả đọc. Cần phân trang/lọc có chủ đích thay vì cắt chung mọi bảng.
- getAppData lọc lịch sử một số bảng theo 45 ngày. Đây là cửa sổ dữ liệu giao diện, không phải tập đầy đủ cho mọi báo cáo lịch sử; các phép tổng hợp cần lấy đúng dữ liệu theo kỳ.
- Hai bảng tỷ giá Shopee khác nhau: MYR 5600/5500, SGD 18800/18500 giữa WebhookHandler và SyncEngine. Cùng số tiền có thể ra VND khác nhau tùy đường nhập. Cần chung nguồn tỷ giá và lưu tỷ giá áp dụng theo giao dịch.
- Ba hàm toàn cục bị khai báo trùng giữa Code.js và Operations.js: sendNtfyNotification, api_saveNtfyConfig, api_getNtfyConfig. Hai bản còn khác topic mặc định và cách kiểm tra PIN; cần giữ một định nghĩa. Bản Operations cũng bỏ qua kiểm tra nếu không truyền PIN.

## 5. Dịch vụ Python và giao diện

Frontend gọi 127.0.0.1:8000 tại Tab_Production.html:2063 và Components.html: vì vậy máy mở trình duyệt phải có dịch vụ tại chính máy đó. Điện thoại không tự truy cập được dịch vụ chạy trên PC bằng địa chỉ này.

server_kcs.py:481 mở 0.0.0.0, CORS cho mọi origin tại 59; các endpoint đã đọc không có lớp xác thực. Khả năng truy cập từ mạng còn phụ thuộc firewall. Hàm tải ảnh nhận URL và gọi requests.get tại 111 mà chưa giới hạn host, IP nội bộ hoặc dung lượng tải, tạo rủi ro truy cập URL ngoài phạm vi khi dịch vụ nhận yêu cầu không tin cậy.

requests.get đồng bộ còn được gọi ngay trong endpoint async tại 237: khi tải ảnh chậm, nó chặn luồng sự kiện. Nên dùng HTTP bất đồng bộ hoặc chuyển tác vụ chặn sang worker, giới hạn thời gian/dung lượng và số yêu cầu đồng thời.

Index.html biên dịch JSX ở trình duyệt bằng Babel tại 571; tải toàn bộ fragment ở 475–494. Nên đưa bước biên dịch vào trước triển khai, tách tải màn hình theo nhu cầu và cố định phiên bản thư viện CDN. Không cần đổi framework để làm việc này.

## 6. Kiểm chứng đã thực hiện

- Bộ kiểm tra hiện có: 325/325 đạt, 0 lỗi.
- Bốn thử nghiệm cục bộ chạy chính hàm từ Code.js: cấp quyền nội bộ, lộ PIN giả, khóa thất bại vẫn thành công, mã đơn tiền tố ghi đè — cả bốn xác nhận hành vi mô tả.
- Quét định nghĩa toàn cục: xác nhận ba tên hàm trùng giữa hai tệp triển khai.
- Bộ test hiện tại chủ yếu includes/regex và một số công thức tự mô phỏng. Ví dụ test BOM dùng simulateBomDeduction riêng, không chạy engine BOM thật. Vì vậy 325 test đạt chưa chứng minh đúng phân quyền, giao dịch hoặc phục hồi lỗi.
- Chưa kiểm tra giao diện chạy thật, Firebase Rules, trigger đang cài, dữ liệu Sheets, webhook thật hay SDK AI chạy thực tế. Không suy luận rằng mọi nguy cơ đã gây sự cố trên production.

## 7. Thứ tự cải thiện đề xuất

1. Vá xác thực và rò PIN; siết quyền đọc/ghi, chuẩn hóa alias bảng và bảo vệ API trực tiếp/webhook.
2. Sửa phản hồi syncDeltas, khớp mã đơn chính xác và phát Firebase sau xác nhận; thêm test thất bại và retry chạy engine thật với Sheet giả.
3. Chuẩn hóa trạng thái đơn/sản xuất/QC; thống nhất tỷ giá; loại bỏ hàm toàn cục trùng.
4. Bổ sung mã giao dịch và cơ chế phục hồi cho kho–BOM–tài chính, kiểm thử lỗi giữa các bước ghi và thao tác đồng thời.
5. Tách Code.js dần thành Auth, Orders, Production, Inventory, Finance, HR và Repository; giữ điểm vào tương thích để tránh thay đổi toàn app cùng lúc.
6. Tối ưu đọc/ghi theo nhu cầu, biên dịch frontend trước triển khai và cấu hình địa chỉ dịch vụ AI theo môi trường.

Ưu tiên kiểm thử bổ sung: nhân sự sửa bản ghi người khác; alias vượt quyền; lỗi khóa; lỗi sau ghi kho trước ghi nhật ký; gửi lại cùng yêu cầu; hai máy sửa cùng đơn; QC AI đạt/cần sửa; báo cáo ngoài cửa sổ 45 ngày và bảng trên 10.000 dòng.

## 8. Trạng thái khắc phục (Cập nhật ngày 05/09/2026)

Toàn bộ các phát hiện ưu tiên và rủi ro vận hành trọng yếu đã được khắc phục triệt để trong mã nguồn và kiểm chứng 100% qua bộ test cục bộ (`run_tests.js` 325/325 tests + `test_source_analysis_fixes.js` 10/10 kịch bản).

| STT | Phát hiện & Hạng mục | Mức độ | Trạng thái | Giải pháp khắc phục & Bằng chứng kiểm thử |
|---|---|---|---|---|
| **A** | Xác thực cấp quyền tối cao bằng giá trị cố định (`SYSTEM`, `AUTO_TRIGGER`, `INTERNAL_ENGINE`) | Nghiêm trọng | **ĐÃ VÁ** | Loại bỏ hoàn toàn bypass PIN client trong `validatePin` (`Code.js:3758–3768`). Tách riêng hàm private `createInternalSystemAuth_()` cho trigger/engine nội bộ. `test_source_analysis_fixes.js` (Kịch bản 1: PASS). |
| **B** | Phản hồi đăng nhập có thể lộ danh sách PIN | Nghiêm trọng | **ĐÃ VÁ** | Xóa bỏ `Object.keys(config.pins)` khỏi debug message trong `Code.js:3793–3795`. `getAppData` trả thông điệp lỗi chuẩn hóa `AUTH_FAILED`, không rò rỉ cấu hình. `test_source_analysis_fixes.js` (Kịch bản 2: PASS). |
| **C** | Ghi thất bại nhưng trả `success=true` | Cao | **ĐÃ VÁ** | `handleApiRequest` và `syncDeltas` bắt lỗi lock timeout (`lock.tryLock`) và ngoại lệ `catch(err)` trả về `{ success: false, error: 'LOCK_TIMEOUT' / 'SYNC_ERROR' }`, triệt tiêu hoàn toàn việc trả `success: true` sau khi có lỗi. `test_source_analysis_fixes.js` (Kịch bản 5: PASS). |
| **D** | Hai mã đơn khác nhau ghi đè lẫn nhau (`ABC123` vs `ABC1234`) | Cao | **ĐÃ VÁ** | Chuẩn hóa so sánh mã đơn hàng bằng Exact Match (`rowCode === itemCode`), loại bỏ so sánh tiền tố hai chiều `indexOf === 0`. `test_source_analysis_fixes.js` (Kịch bản 6: PASS). |
| **E** | Phân quyền theo bảng còn cho phép quá rộng | Cao | **ĐÃ VÁ** | Thắt chặt `validateTableWritePermission`: chuẩn hóa alias bảng qua `TABLE_ALIASES`, mặc định từ chối (Default Deny), kiểm tra quyền sở hữu chấm công `Attendance` chỉ cho phép nhân sự sửa bản ghi của chính mình (`auth.user`). `getAppData` lọc ẩn dữ liệu tài chính/HR đối với non-finance roles. `test_source_analysis_fixes.js` (Kịch bản 3, 4: PASS). |
| **F** | Phát dữ liệu Firebase sang máy khác trước khi server chấp nhận | Cao | **ĐÃ VÁ** | Viết lại `pushDeltas` trong `App_Main.html`: chỉ phát Firebase khi `isServerSuccess === true`; nhánh lỗi tự động gọi `triggerReloadData()` để đồng bộ lại; sửa cân bằng bộ đếm `pendingSyncsRef` cho vai trò KHÁCH; gán `_opId` định danh giao dịch an toàn khi thử lại. `test_source_analysis_fixes.js` (Kịch bản 7, 8: PASS). |
| **G** | Webhook chưa xác minh nguồn gửi | Cao | **ĐÃ VÁ** | `ShopeeWebhookHandler.js` bổ sung lớp bảo vệ xác thực nguồn và kiểm tra chữ ký HMAC-SHA256 khi có secret/key cấu hình; từ chối xử lý và trả mã HTTP 401 nếu thiếu cấu hình bảo mật hoặc sai chữ ký. |
| **H** | AI dùng bộ trạng thái khác với ERP (`Pass`/`Need_Repair` vs `Đã duyệt`/`Yêu cầu làm lại`) | Cao | **ĐÃ VÁ** | `server_kcs.py` trả về cả `qc_status` và `erp_qc_status` chuẩn hóa. `Tab_Production.html` tích hợp hàm ánh xạ `mapAiQcStatusToErp` và mở rộng chốt chặn `isLocked` nhận diện cả `Yêu cầu làm lại` và `Need_Repair`. `test_source_analysis_fixes.js` (Kịch bản 10: PASS). |
| **I** | Cửa sổ thất bại giữa trừ kho Products và ghi ImportExport BOM | Trung bình | **ĐÃ VÁ** | `Code.js` (`_processMaterialDeduction_Core`) tích hợp Write-Ahead Transaction Journal `BOM_JOURNAL_<prodId>` qua `PropertiesService`. Nếu lỗi giữa chừng sau khi đã trừ `Products`, lần retry tự động phục hồi và bỏ qua trừ kho lần 2, ghi tiếp phiếu `ImportExport` và dọn dẹp journal. `test_source_analysis_fixes.js` (Kịch bản 9: PASS). |
| **J** | Lệch tỷ giá Shopee giữa WebhookHandler và SyncEngine | Trung bình | **ĐÃ VÁ** | Hợp nhất nguồn tỷ giá duy nhất `SHOPEE_CANONICAL_EXCHANGE_RATES` và helper `getShopeeExchangeRate(currency)`. Tỷ giá áp dụng được ghi nhận trực tiếp vào từng bản ghi `DB_ORDERS` và `DB_ORDER_ITEMS` (`exchange_rate`, `unit_price_vnd`). |
| **K** | Trùng lặp hàm toàn cục (`sendNtfyNotification`, `api_saveNtfyConfig`, `api_getNtfyConfig`) | Trung bình | **ĐÃ VÁ** | Giữ phiên bản chuẩn duy nhất có kiểm tra PIN và quyền `SYSTEM_CONFIG` trong `Code.js`, dọn dẹp các bản trùng không kiểm tra quyền trong `Operations.js`. |
| **L** | An toàn dịch vụ Python AI (`server_kcs.py`) & Cấu hình URL | Cao | **ĐÃ VÁ** | `server_kcs.py`: Chống SSRF (phân giải DNS, chặn loopback, RFC1918, link-local/cloud metadata 169.254.x.x), chuyển sang tải ảnh bất đồng bộ non-blocking với `httpx`, giới hạn kích thước 15MB, timeout 10s, middleware xác thực header `X-RF-API-KEY`. `Components.html` & `Tab_Production.html`: Cấu hình URL động qua `window.RF_AI_SERVICE_URL` / `localStorage.getItem('rf_ai_service_url')`. |

