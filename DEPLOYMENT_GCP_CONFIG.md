# BẢNG ĐẶC TẢ CẤU HÌNH VÀ HƯỚNG DẪN TRIỂN KHAI GOOGLE CLOUD
## Dịch Vụ 7 Agent Tự Động Vận Hành Độc Lập (RF_Workspace_Pro)

> **LƯU Ý AN TOÀN**: Tuân thủ nghiêm ngặt chỉ đạo của người dùng: **Chưa tự tạo tài nguyên trả phí, chưa cấp quyền IAM và chưa deploy production trước khi trình phương án này cho người dùng duyệt.**

---

### 1. KIẾN TRÚC VẬN HÀNH KHÔNG PHỤ THUỘC MÁY CÁ NHÂN (24/7)

```
                       [Google Cloud 24/7 Serverless]
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
     [Cloud Scheduler]                             [Frontend / Quản Đốc]
 (Lịch định kỳ: 1h/lần)                         (App_Main.html / Components)
       │ (OIDC Auth Token)                                   │ (Internal / Proxy)
       ▼                                                     ▼
 ┌─────────────────────────────────────────────────────────────────┐
 │ Cloud Run: rf-agents-service                                    │
 │ - Authentication: IAM REQUIRED (--no-allow-unauthenticated)     │
 │ - Service Account: rf-agent-runner                              │
 ├─────────────────────────────────────────────────────────────────┤
 │ 7 Independent Agents Engine:                                    │
 │  1. CSO (Chiến Lược) ──┐                                        │
 │  2. CFO (Tài Chính)   ──┼─> Gọi song song Vertex AI Gemini      │
 │  3. KHO (Tồn Kho)     ──┤   (Mỗi agent 1 prompt, 1 call riêng) │
 │  4. SX  (Sản Xuất)    ──┤                                        │
 │  5. HR  (Nhân Sự)     ──┘                                        │
 │  6. COO (Vận Hành)    ────> Đọc receipts của 5 Specialist       │
 │  7. BAODONG (Giám Sát)───> Đọc cảnh báo & phân bổ rủi ro        │
 ├─────────────────────────────────────────────────────────────────┤
 │ Persistent Storage & Concurrency:                               │
 │ - Distributed Lease Lock (600s TTL) chống chạy đè (idempotency) │
 │ - Firestore / MemoryStore: Lưu runs, tasks, handoff receipts    │
 └─────────────────────────────────────────────────────────────────┘
```

---

### 2. DỰ TOÁN CHI PHÍ HÀNG THÁNG (PROJECT: `inlaid-woods-448512-j0`)

| Thành phần dịch vụ | Hạn mức sử dụng hàng tháng | Bậc miễn phí (Free Tier) | Chi phí ước tính (VNĐ) |
| :--- | :--- | :--- | :--- |
| **Cloud Run** (vCPU 1, RAM 512MB) | 720 lượt chạy (1 lần/giờ x 720h)<br>Thời gian chạy ~3s/lần = 2.160s | Miễn phí 2.000.000 requests/tháng<br>Miễn phí 360.000 vCPU-seconds | **0 VNĐ** (Nằm 100% trong Free Tier) |
| **Cloud Scheduler** | 1 cron job (chạy 720 lần/tháng) | Miễn phí 3 jobs đầu tiên/tháng | **0 VNĐ** (Miễn phí hoàn toàn) |
| **Cloud Firestore** | ~5.000 lượt đọc/ghi mỗi tháng | Miễn phí 50.000 reads, 20.000 writes/ngày | **0 VNĐ** (Dưới 1% hạn mức miễn phí) |
| **Vertex AI Gemini** (`gemini-2.5-flash`) | 7 agents x 720 lần = 5.040 API calls<br>~3.5 triệu Input tokens, ~1 triệu Output tokens | Giá: $0.075 / 1M input tokens<br>$0.30 / 1M output tokens | ~0.26$ + 0.30$ = **0.56$ (~14.000 VNĐ / tháng)** |
| **TỔNG CỘNG HÀNG THÁNG** | **Hệ thống tự chạy 24/7 độc lập** | **Toàn bộ hạ tầng Cloud** | **< 15.000 VNĐ / THÁNG** |

---

### 3. ĐẶC TẢ TÀI KHOẢN DỊCH VỤ VÀ PHÂN QUYỀN (LEAST PRIVILEGE IAM)

Hệ thống cần 2 Service Account riêng biệt, tuyệt đối không dùng quyền `Owner` hay `Editor`:

1. **`rf-agent-runner@inlaid-woods-448512-j0.iam.gserviceaccount.com`** (Identity của Cloud Run container):
   - `roles/aiplatform.user`: Quyền gọi mô hình Vertex AI Gemini (`gemini-2.5-flash`).
   - `roles/datastore.user`: Quyền đọc/ghi Firestore Collections (`rf_agent_tasks`, `rf_agent_runs`, `rf_agent_leases`).
   - `roles/sheets.editor` (hoặc cấp quyền trực tiếp email SA này vào Google Sheets qua nút Chia sẻ).

2. **`rf-scheduler-invoker@inlaid-woods-448512-j0.iam.gserviceaccount.com`** (Identity của Cloud Scheduler):
   - `roles/run.invoker`: Quyền duy nhất là kích hoạt Cloud Run service qua giao thức HTTPS có xác thực OIDC.

---

### 4. CÁC LỆNH TRIỂN KHAI CỤ THỂ (DÀNH CHO NGƯỜI DÙNG DUYỆT)

#### Bước 1: Kích hoạt các API cần thiết trên Google Cloud (Chạy 1 lần)
```bash
gcloud services enable \
  run.googleapis.com \
  cloudscheduler.googleapis.com \
  aiplatform.googleapis.com \
  firestore.googleapis.com \
  --project inlaid-woods-448512-j0
```

#### Bước 2: Tạo 2 Service Account
```bash
# 1. Service Account thực thi của Cloud Run
gcloud iam service-accounts create rf-agent-runner \
  --description="Service account for RF 7 Agents Cloud Run Service" \
  --display-name="RF Agent Runner" \
  --project inlaid-woods-448512-j0

# Cấp quyền gọi Vertex AI và Firestore
gcloud projects add-iam-policy-binding inlaid-woods-448512-j0 \
  --member="serviceAccount:rf-agent-runner@inlaid-woods-448512-j0.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding inlaid-woods-448512-j0 \
  --member="serviceAccount:rf-agent-runner@inlaid-woods-448512-j0.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

# 2. Service Account cho Cloud Scheduler
gcloud iam service-accounts create rf-scheduler-invoker \
  --description="Service account for triggering RF Agents Cloud Scheduler" \
  --display-name="RF Scheduler Invoker" \
  --project inlaid-woods-448512-j0
```

#### Bước 3: Build và Deploy Cloud Run (TUYỆT ĐỐI KHÔNG DÙNG `--allow-unauthenticated`)
```bash
# Build container image
gcloud builds submit --tag gcr.io/inlaid-woods-448512-j0/rf-agents-service:v1 \
  --project inlaid-woods-448512-j0

# Triển khai Cloud Run với IAM bắt buộc
gcloud run deploy rf-agents-service \
  --image gcr.io/inlaid-woods-448512-j0/rf-agents-service:v1 \
  --region asia-southeast1 \
  --no-allow-unauthenticated \
  --service-account rf-agent-runner@inlaid-woods-448512-j0.iam.gserviceaccount.com \
  --set-env-vars GOOGLE_CLOUD_PROJECT=inlaid-woods-448512-j0,RF_GEMINI_MODEL=gemini-2.5-flash \
  --memory 512Mi \
  --concurrency 10 \
  --min-instances 0 \
  --max-instances 2 \
  --project inlaid-woods-448512-j0

# Cấp quyền cho Scheduler Invoker gọi Cloud Run service
gcloud run services add-iam-policy-binding rf-agents-service \
  --region asia-southeast1 \
  --member="serviceAccount:rf-scheduler-invoker@inlaid-woods-448512-j0.iam.gserviceaccount.com" \
  --role="roles/run.invoker" \
  --project inlaid-woods-448512-j0
```

#### Bước 4: Tạo Cloud Scheduler Job chạy định kỳ có OIDC Token
```bash
# Lấy URL của Cloud Run service
SERVICE_URL=$(gcloud run services describe rf-agents-service --region asia-southeast1 --format='value(status.url)' --project inlaid-woods-448512-j0)

# Tạo Job kích hoạt mỗi 1 tiếng (0 * * * *)
gcloud scheduler jobs create http rf-agents-hourly-audit \
  --schedule="0 * * * *" \
  --time-zone="Asia/Ho_Chi_Minh" \
  --uri="${SERVICE_URL}/run" \
  --http-method=POST \
  --headers="Content-Type=application/json" \
  --message-body='{"request_id":"cron_hourly_auto","question":"Kiểm tra vận hành dây chuyền sản xuất, SLA giao hàng và rà soát tồn kho vật tư","actor":"cloud_scheduler"}' \
  --oidc-service-account-email="rf-scheduler-invoker@inlaid-woods-448512-j0.iam.gserviceaccount.com" \
  --oidc-token-audience="${SERVICE_URL}" \
  --project inlaid-woods-448512-j0
```

---

### 5. CƠ CHẾ CHỐNG LỖI VÀ BẢO ĐẢM TOÀN VẸN NGHIỆP VỤ

1. **Không che lỗi**: Nếu Vertex AI quá tải hoặc trả về lỗi, hệ thống ghi nhận chính xác mã lỗi vào lịch sử `runs`, không sinh ra các câu thoại mẫu giả định.
2. **Chống chạy trùng (Idempotency)**: Mỗi request có `request_id`. Nếu Scheduler gửi trùng trong vòng 10 phút (600s), hệ thống trả về kết quả đang chạy hoặc kết quả đã lưu mà không gọi thêm Gemini.
3. **Phân quyền tuyệt đối**:
   - Frontend không giữ service account key hay token nhạy cảm.
   - Frontend chỉ gọi qua các endpoint được bảo vệ hoặc qua Google Apps Script backend proxy.
4. **An toàn dữ liệu**:
   - 7 Agent hoạt động ở chế độ Đọc (Read-only) dữ liệu sản xuất và tạo công việc đề xuất (`create_work_item`).
   - Tuyệt đối không tự ý phạt/thưởng, không sửa lương, không đổi tiền và không hủy đơn hàng. Mọi quyết định thay đổi trạng thái đều cần xác nhận có thẩm quyền.
