"""
=============================================================================
🚀 RICH FISH AQUARIUM - AI KCS INSPECTOR MICROSERVICE (FASTAPI)
Hệ thống: RF_Workspace_Pro
Kiến trúc: FastAPI + Google Antigravity SDK (Multimodal Vision Engine)
Chức năng: Nhận Webhook thẩm định ảnh thợ chụp tức thời (Realtime Inspection)
=============================================================================
"""

import asyncio
import json
import os
import re
from datetime import datetime
import ipaddress
import socket
import urllib.parse
from typing import Any, Dict, List, Optional
from io import BytesIO
from contextlib import asynccontextmanager

import httpx
import requests
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google.antigravity import Agent, LocalAgentConfig, Image, CapabilitiesConfig, BuiltinTools
from agent_assistant import AssistantRequest, ask_assistant
from agent_war_room import IncidentRequest, generate_agent_dialogue

MAX_IMAGE_SIZE = 15 * 1024 * 1024  # 15 MB
DOWNLOAD_TIMEOUT = 10.0  # 10s
RF_AI_API_KEY = os.environ.get("RF_AI_API_KEY", "rf-kcs-internal-2026").strip()

def validate_url_ssrf(url_str: str) -> str:
    """
    Phòng chống SSRF (Server-Side Request Forgery):
    - Chỉ cho phép giao thức http hoặc https.
    - Phân giải DNS và kiểm tra từng IP đích.
    - Chặn toàn bộ IP loopback, dải private (RFC1918), link-local/cloud metadata (169.254.x.x), multicast, reserved.
    """
    if not url_str or not isinstance(url_str, str):
        raise ValueError("URL ảnh không hợp lệ hoặc rỗng.")
    parsed = urllib.parse.urlsplit(url_str.strip())
    if parsed.scheme.lower() not in ("http", "https"):
        raise ValueError(f"Giao thức '{parsed.scheme}' không được hỗ trợ. Chỉ cho phép http hoặc https.")
    
    hostname = parsed.hostname
    if not hostname:
        raise ValueError("URL không chứa hostname hợp lệ.")
        
    try:
        addr_info = socket.getaddrinfo(hostname, None)
    except Exception as e:
        raise ValueError(f"Không thể phân giải DNS hostname '{hostname}': {str(e)}")
        
    for item in addr_info:
        sockaddr = item[4]
        ip_str = sockaddr[0]
        ip = ipaddress.ip_address(ip_str)
        if ip.is_loopback:
            raise ValueError(f"Truy cập IP loopback ({ip_str}) bị từ chối vì lý do bảo mật.")
        if ip.is_private:
            raise ValueError(f"Truy cập dải IP nội bộ ({ip_str}) bị từ chối vì lý do an toàn SSRF.")
        if ip.is_link_local:
            raise ValueError(f"Truy cập link-local/cloud metadata ({ip_str}) bị cấm tuyệt đối.")
        if ip.is_multicast or ip.is_reserved or ip.is_unspecified:
            raise ValueError(f"Dải IP đặc biệt ({ip_str}) không được phép truy cập.")
            
    return url_str.strip()

# Tự động nạp biến môi trường từ .env nếu chưa có trong OS
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Quản lý vòng đời ứng dụng (Lifespan handler thay thế on_event)"""
    worker_task = asyncio.create_task(morning_schedule_worker())
    yield
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="Rich Fish Aquarium - AI Inspector Service",
    description="Microservice thẩm định ảnh nghiệm thu sản xuất & đóng gói bằng Google Antigravity SDK",
    version="2.0.0",
    lifespan=lifespan
)

# Kích hoạt CORS để frontend App_Main / Tab_Production có thể gọi trực tiếp
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware xác thực API key giữa Client và Microservice
@app.middleware("http")
async def api_key_auth_middleware(request: Request, call_next):
    # Cho phép health check, OpenAPI docs, favicon và OPTIONS preflight không cần token
    if request.url.path not in ("/health", "/docs", "/openapi.json", "/favicon.ico") and request.method != "OPTIONS":
        client_key = request.headers.get("X-RF-API-KEY", "").strip() or request.query_params.get("api_key", "").strip()
        if client_key != RF_AI_API_KEY:
            return JSONResponse(
                status_code=401,
                content={"status": "error", "detail": "Unauthorized: Yêu cầu header X-RF-API-KEY hợp lệ."}
            )
    response = await call_next(request)
    return response

# =============================================================================
# DATA MODELS
# =============================================================================
class InspectRequest(BaseModel):
    orderId: str = Field(..., description="ID dòng bảng Production hoặc Orders")
    orderCode: str = Field(..., description="Mã đơn hàng, vd: ORD_29184 hoặc #29184")
    productName: str = Field(..., description="Tên sản phẩm, bể kính hoặc layout")
    size: Optional[str] = Field("Tiêu chuẩn", description="Kích thước yêu cầu")
    phase: str = Field(..., description="Phase 1, Phase 2, hoặc Đóng gói")
    specs: Optional[str] = Field("Dán keo gọn, không bọt khí, đúng tỉ lệ layout", description="Yêu cầu kỹ thuật")
    photoUrl: str = Field(..., description="Link ảnh trực tiếp hoặc link chia sẻ Google Drive")
    worker: Optional[str] = Field("", description="Tên thợ thực hiện (Hoàng Dương, Duy Tân, Diệu Hương...)")

class InspectResponse(BaseModel):
    success: bool
    orderId: str
    orderCode: str
    phase: str
    worker: str
    qc_status: Optional[str] = "Pass"
    erp_qc_status: Optional[str] = "Đã duyệt"
    inspection: Dict[str, Any]
    productionUpdatePayload: Dict[str, Any]


# =============================================================================
# HELPER: TẢI ẢNH VÀ CHUYỂN ĐỔI SANG NATIVE ANTIGRAVITY IMAGE
# =============================================================================
async def download_image_as_antigravity_image(url: str, description: str = "Ảnh nghiệm thu") -> Image:
    """
    Tải ảnh từ URL bất đồng bộ (không chặn event loop), tích hợp phòng chống SSRF,
    giới hạn kích thước tối đa 15MB và thời gian chờ 10s.
    """
    clean_url = url.strip()

    file_id = ""
    # Xử lý link Google Drive (view/sharing -> direct download stream)
    if "drive.google.com" in clean_url:
        if "/d/" in clean_url:
            file_id = clean_url.split("/d/")[1].split("/")[0].split("?")[0]
        elif "id=" in clean_url:
            file_id = clean_url.split("id=")[1].split("&")[0]
        
        if file_id:
            clean_url = f"https://lh3.googleusercontent.com/d/{file_id}"

    validated_url = validate_url_ssrf(clean_url)
    content_bytes = bytearray()
    mime_type = "image/jpeg"

    async with httpx.AsyncClient(timeout=DOWNLOAD_TIMEOUT, follow_redirects=False) as client:
        current_url = validated_url
        for _ in range(5):
            try:
                async with client.stream("GET", current_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}) as response:
                    if response.status_code in (301, 302, 303, 307, 308):
                        location = response.headers.get("Location")
                        if not location:
                            break
                        current_url = urllib.parse.urljoin(current_url, location)
                        validate_url_ssrf(current_url)
                        continue

                    if response.status_code != 200 and file_id and "googleusercontent" in current_url:
                        fallback_url = f"https://drive.google.com/uc?export=download&id={file_id}"
                        validate_url_ssrf(fallback_url)
                        current_url = fallback_url
                        continue

                    if response.status_code != 200:
                        raise ValueError(f"Không thể tải ảnh từ link (Mã phản hồi HTTP {response.status_code})")

                    content_length = response.headers.get("Content-Length")
                    if content_length and int(content_length) > MAX_IMAGE_SIZE:
                        raise ValueError(f"Dung lượng ảnh ({int(content_length)} bytes) vượt quá giới hạn 15MB.")

                    content_type = response.headers.get("Content-Type", "").lower()
                    if "jpeg" in content_type or "jpg" in content_type:
                        mime_type = "image/jpeg"
                    elif "png" in content_type:
                        mime_type = "image/png"
                    elif "webp" in content_type:
                        mime_type = "image/webp"

                    async for chunk in response.aiter_bytes(chunk_size=65536):
                        content_bytes.extend(chunk)
                        if len(content_bytes) > MAX_IMAGE_SIZE:
                            raise ValueError("Dung lượng ảnh tải về vượt quá giới hạn 15MB.")
                    break
            except httpx.TimeoutException:
                raise ValueError("Hết thời gian chờ (10s) khi tải ảnh từ máy chủ ảnh.")
            except Exception as exc:
                if isinstance(exc, ValueError):
                    raise exc
                raise ValueError(f"Không thể kết nối tới máy chủ ảnh: {str(exc)}")

    if not content_bytes:
        raise ValueError("Nội dung ảnh tải về bị rỗng.")

    if mime_type == "image/jpeg":
        if content_bytes.startswith(b"\x89PNG"):
            mime_type = "image/png"
        elif content_bytes.startswith(b"RIFF") and b"WEBP" in content_bytes[:16]:
            mime_type = "image/webp"

    return Image(
        data=bytes(content_bytes),
        mime_type=mime_type,
        description=description
    )


# =============================================================================
# CORE INSPECTOR LOGIC
# =============================================================================
async def run_ai_kcs_evaluation(payload: InspectRequest, photo_image: Image) -> Dict[str, Any]:
    """Thực thi thẩm định ảnh KCS bằng Gemini 3.6 Flash qua Antigravity SDK."""
    prompt = f"""
Bạn là chuyên gia kiểm tra chất lượng (KCS) kiêm Quản đốc xưởng bể cá Rich Fish Aquarium.
Nhiệm vụ: Thẩm định ảnh chụp nghiệm thu công đoạn do thợ hoặc nhân sự đóng gói gửi lên.

THÔNG TIN LỆNH SẢN XUẤT:
- Mã đơn hàng: {payload.orderCode} (ID: {payload.orderId})
- Tên sản phẩm: {payload.productName}
- Kích thước yêu cầu: {payload.size}
- Công đoạn kiểm tra: {payload.phase}
- Yêu cầu kỹ thuật & Dung sai: {payload.specs}
- Thợ thực hiện: {payload.worker or 'Chưa định danh'}

TIÊU CHUẨN ĐÁNH GIÁ (RUBRIC):
1. ĐỘ SẠCH KEO & ĐƯỜNG CHỈ KEO: Keo phải dán phẳng đều, không bọt khí lớn, không lem luốc mép kính.
2. ĐỘ VUÔNG GÓC & TỈ LỆ: Thành kính góc 90 độ, các cạnh mài xiết/vát kim cương bóng đẹp, không mẻ cạnh.
3. BỐ CỤC LAYOUT (Nếu là Layout/Bonsai): Đúng dáng miêu tả, cây/lũa/đá gắn kết chắc chắn, giấu keo khéo léo.
4. ĐÓNG GÓI (Nếu là khâu Đóng gói): Chèn xốp đủ 6 mặt dày tối thiểu 2-3cm, bọc màng co PE, dán băng keo niêm phong "HÀNG DỄ VỠ".

TRẢ VỀ KẾT QUẢ DƯỚI DẠNG JSON DUY NHẤT THEO SCHEMA SAU:
```json
{{
  "passed_kpi": true,
  "confidence_score": 95,
  "kcs_note": "Mép keo sắc nét, không bọt khí, góc dán 90 độ chuẩn chỉ",
  "defects_found": [],
  "rework_instructions": "",
  "qc_status": "Pass"
}}
```
Lưu ý về qc_status: 
- Nếu passed_kpi = true -> qc_status = "Pass"
- Nếu passed_kpi = false -> qc_status = "Need_Repair"
"""

    config = LocalAgentConfig(
        model="gemini-3.6-flash",
        system_instructions="Bạn là KCS Trưởng xưởng Rich Fish Aquarium, đánh giá nghiêm ngặt, chuẩn xác và công bằng theo hình ảnh thực tế."
    )

    async with Agent(config) as agent:
        # Gửi Image Object cùng Prompt vào SDK
        response = await agent.chat([
            photo_image,
            prompt
        ])
        raw_text = (await response.text()).strip()

    # Bóc tách JSON chuẩn xác
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_text, re.IGNORECASE)
    clean_text = match.group(1).strip() if match else raw_text

    try:
        parsed = json.loads(clean_text)
    except Exception:
        first_brace = clean_text.find("{")
        last_brace = clean_text.rfind("}")
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            parsed = json.loads(clean_text[first_brace:last_brace + 1])
        else:
            raise ValueError(f"Không thể phân giải JSON từ phản hồi AI: {raw_text}")

    return parsed


# =============================================================================
# API ENDPOINTS
# =============================================================================
@app.get("/health")
def health_check():
    """Kiểm tra tình trạng hoạt động của Microservice."""
    return {"status": "ONLINE", "service": "Rich Fish AI Inspector", "model": "gemini-3.6-flash"}

@app.post("/api/inspect", response_model=InspectResponse)
async def inspect_endpoint(payload: InspectRequest):
    """
    Endpoint chính tiếp nhận Webhook từ AppSheet / Google Apps Script.
    """
    # 1. Tải ảnh bất đồng bộ và bọc vào Antigravity Image
    try:
        photo_image = await download_image_as_antigravity_image(
            payload.photoUrl,
            description=f"Ảnh nghiệm thu {payload.phase} - Đơn {payload.orderCode}"
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Lỗi tải ảnh: {str(exc)}")

    # 2. Gọi Agent thẩm định
    try:
        inspection = await run_ai_kcs_evaluation(payload, photo_image)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Lỗi phân tích AI: {str(exc)}")

    # 3. Chuẩn hóa trạng thái kiểm định giữa AI và ERP (Pass/Need_Repair <-> Đã duyệt/Yêu cầu làm lại)
    qc_status = inspection.get("qc_status", "Pass" if inspection.get("passed_kpi") else "Need_Repair")
    passed = bool(inspection.get("passed_kpi") or str(qc_status).strip().lower() in ("pass", "passed", "đã duyệt", "đạt"))
    erp_qc_status = "Đã duyệt" if passed else "Yêu cầu làm lại"
    kcs_note = inspection.get("kcs_note", "Đã thẩm định qua AI KCS")
    score = inspection.get("confidence_score", 0)

    production_update = {
        "qc_status": erp_qc_status,
        "ai_qc_status": qc_status,
        "qc_note": f"[AI-KCS {score}%]: {kcs_note}"
    }

    # Tự động cập nhật trạng thái khâu nếu đạt chuẩn
    phase_lower = payload.phase.lower()
    if passed:
        if "phase 1" in phase_lower or "khâu 1" in phase_lower:
            production_update["p1_status"] = "Done"
        elif "phase 2" in phase_lower or "khâu 2" in phase_lower:
            production_update["p2_status"] = "Done"
            production_update["status"] = "Done"
    else:
        if "phase 1" in phase_lower or "khâu 1" in phase_lower:
            production_update["p1_status"] = "Need_Repair"
        elif "phase 2" in phase_lower or "khâu 2" in phase_lower:
            production_update["p2_status"] = "Need_Repair"

    return InspectResponse(
        success=True,
        orderId=payload.orderId,
        orderCode=payload.orderCode,
        phase=payload.phase,
        worker=payload.worker or "",
        qc_status=qc_status,
        erp_qc_status=erp_qc_status,
        inspection=inspection,
        productionUpdatePayload=production_update
    )


# =============================================================================
# SMART SEARCH & AQUARIUM TECHNICAL ASSISTANT ENDPOINT
# =============================================================================
class SearchRequest(BaseModel):
    query: str = Field(..., description="Câu hỏi kỹ thuật, tra cứu định mức, bệnh cá hoặc giá vật liệu")
    worker: Optional[str] = Field("", description="Tên thợ hoặc nhân sự tra cứu")

class SearchResponse(BaseModel):
    success: bool
    query: str
    answer: str
    worker: str

SEARCH_SYSTEM_PROMPT = """
Bạn là AI Kỹ thuật viên & Cố vấn Thủy sinh Trưởng (Lead Aquascaping Technical Advisor) của thương hiệu Rich Fish Aquarium.
Nhiệm vụ của bạn là giải đáp nhanh, chuẩn xác kỹ thuật và thực tế cho thợ sản xuất, nhân viên bán hàng và khách hàng về:
1. Quy cách gia công bể kính: Kính siêu trong (5mm, 8mm, 10mm, 12mm), mài xiết cạnh vi tính, mài vát kim cương, dán giấu keo, khe keo 1-2mm chịu lực, độ dày an toàn theo tỉ lệ L x W x H.
2. Thiết kế layout & Hardscape: Định mức khối lượng đá/lũa (lũa săn đá, đá da voi, tiger), tỷ lệ 1/3, kỹ thuật gắn rêu (weeping, fiss, java), kỹ thuật làm thác cát, giấu keo 502 bằng mùn cưa và bột đá.
3. Kỹ thuật chăm sóc & xử lý sự cố: Trị rêu hại (rêu tóc, rêu chùm đen BBA, khuẩn lam), bệnh cá (nấm trắng, thối vây, sình bụng), cân bằng thông số nước (pH, TDS, gH, kH, CO2).
4. Định mức tiêu hao vật liệu: Công thức tính phân nền (L x W x Độ dày nền / 1000 = lít nền), lưu lượng lọc (tối thiểu 4 - 6 lần thể tích nước/giờ).

Yêu cầu phong cách trả lời:
- Rõ ràng, súc tích, đi thẳng vào số liệu định mức và giải pháp kỹ thuật cụ thể.
- Trình bày dạng danh sách gạch đầu dòng Markdown dễ đọc trên giao diện web hoặc điện thoại.
"""

@app.post("/api/search", response_model=SearchResponse)
async def search_endpoint(payload: SearchRequest):
    """
    Endpoint tra cứu nhanh kỹ thuật, vật liệu và kiến thức thủy sinh bằng Gemini 3.6 Flash + Web Search.
    """
    clean_query = payload.query.strip()
    if not clean_query:
        raise HTTPException(status_code=400, detail="Vui lòng nhập nội dung câu hỏi tra cứu.")

    config = LocalAgentConfig(
        model="gemini-3.6-flash",
        capabilities=CapabilitiesConfig(
            enabled_tools=[BuiltinTools.SEARCH_WEB, BuiltinTools.READ_URL_CONTENT]
        ),
        system_instructions=SEARCH_SYSTEM_PROMPT
    )

    try:
        async with Agent(config) as agent:
            response = await agent.chat(clean_query)
            answer_text = (await response.text()).strip()

        return SearchResponse(
            success=True,
            query=clean_query,
            answer=answer_text,
            worker=payload.worker or ""
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Lỗi AI Search: {str(exc)}")


# =============================================================================
# WORKSHOP ASSISTANT CHAT ENDPOINT (QUẢN ĐỐC ẢO XƯỞNG)
# =============================================================================
@app.post("/api/assistant/chat")
async def assistant_chat_endpoint(payload: AssistantRequest):
    """
    Endpoint tiếp nhận hội thoại, câu hỏi quy trình, an toàn hoặc lỗi KCS từ thợ xưởng.
    """
    try:
        reply = await ask_assistant(payload)
        return {"status": "success", "reply": reply}
    except Exception as exc:
        return {"status": "error", "message": str(exc)}


# =============================================================================
# ⏰ TẦNG MÁY TRẠM: DỊCH VỤ BÁO THỨC CA SÁNG (07:45) & CHÚC CHỦ NHẬT (08:30)
# =============================================================================
async def trigger_ntfy_morning_notice(notice_type: str = "workday", custom_msg: Optional[str] = None) -> Dict[str, Any]:
    """
    Phát thông báo ntfy:
    - workday: Thứ 2 - Thứ 7 (07:45 AM) -> Báo thức vào ca (Priority: 5)
    - sunday: Chủ Nhật (08:30 AM) -> Lời chúc ngày nghỉ (Priority: 3)
    """
    topic = os.environ.get("NTFY_TOPIC", "rfworkspace").strip()

    if notice_type == "sunday":
        title = "☕ CHÚC CUỐI TUẦN VUI VẺ - RICHFISH AQUARIUM"
        default_msg = (
            "🌿 Chúc toàn thể anh em có một ngày Chủ Nhật nghỉ ngơi thật vui vẻ và trọn vẹn bên gia đình! "
            "Cứ an tâm tận hưởng nhé, anh Tiến vẫn đang miệt mài làm việc tại xưởng để chuẩn bị nhịp độ cho tuần mới!"
        )
        priority = 3
        tags = ["sparkles", "coffee", "heart", "fish"]
    else:
        title = "⏰ 07:45 RỒI ANH EM ƠI! VÀO CA SÁNG NGAY NÀO!"
        default_msg = (
            "🚨 Đã 07:45 sáng rồi anh em ơi! Dậy rửa mặt, chuẩn bị đồ nghề và bấm chấm công ngay kẻo chạm mốc 08:15 "
            "là dính phạt chuyên cần. Đeo găng tay chống cắt và giữ an toàn lao động nhé!"
        )
        priority = 5
        tags = ["alarm_clock", "warning", "hammer_and_wrench"]

    msg_to_send = custom_msg or default_msg

    try:
        payload = {
            "topic": topic,
            "title": title,
            "message": msg_to_send,
            "priority": priority,
            "tags": tags,
            "click": "https://webapp-script.vercel.app"
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post("https://ntfy.sh", json=payload)
            print(f"✅ [NTFY {notice_type.upper()}] Đã phát thông báo tới ntfy.sh/{topic} (Mã: {resp.status_code})")
            return {
                "success": True,
                "topic": topic,
                "type": notice_type,
                "status_code": resp.status_code,
                "title": title,
                "message": msg_to_send
            }
    except Exception as exc:
        print(f"❌ [NTFY ERROR] Không thể gửi tới ntfy.sh/{topic}: {exc}")
        return {"success": False, "error": str(exc)}


async def morning_schedule_worker():
    """
    Tiến trình chạy ngầm:
    - Thứ 2 đến Thứ 7 (07:45 AM): Báo thức vào ca (Priority: 5)
    - Chủ Nhật (08:30 AM): Lời chúc ngày nghỉ (Priority: 3)
    """
    print("⏰ [SCHEDULE WORKER] Đã kích hoạt tiến trình canh lịch: 07:45 (T2-T7) & 08:30 (Chủ Nhật) qua ntfy.sh...")
    last_sent_date = ""

    while True:
        try:
            now = datetime.now()
            today_str = now.strftime("%Y-%m-%d")

            # 1. Thứ 2 (0) đến Thứ 7 (5), đúng 07:45 AM
            if now.weekday() < 6 and now.hour == 7 and now.minute == 45 and last_sent_date != (today_str + "_workday"):
                print(f"⏰ [ALARM] Đúng 07:45 AM ngày {today_str}! Đang phát chuông báo thức vào ca...")
                await trigger_ntfy_morning_notice(notice_type="workday")
                last_sent_date = today_str + "_workday"

            # 2. Chủ Nhật (6), đúng 08:30 AM
            elif now.weekday() == 6 and now.hour == 8 and now.minute == 30 and last_sent_date != (today_str + "_sunday"):
                print(f"☕ [SUNDAY] Đúng 08:30 AM Chủ Nhật {today_str}! Đang gửi lời chúc ngày nghỉ...")
                await trigger_ntfy_morning_notice(notice_type="sunday")
                last_sent_date = today_str + "_sunday"

        except Exception as e:
            print(f"[SCHEDULE LOOP ERROR] {e}")

        await asyncio.sleep(25)



@app.get("/api/alarm/test")
@app.post("/api/alarm/test")
async def test_alarm_endpoint(type: str = "workday"):
    """
    Endpoint thử nghiệm phát thông báo:
    - /api/alarm/test?type=workday (Chuông báo thức 07:45 Priority 5)
    - /api/alarm/test?type=sunday (Lời chúc Chủ Nhật 08:30 Priority 3)
    """
    res = await trigger_ntfy_morning_notice(notice_type=type)
    return res


@app.post("/api/warroom/discuss")
async def warroom_discuss_endpoint(payload: IncidentRequest):
    """
    Hội thoại chéo đa tác nhân Single-Turn Multi-Agent War Room (7 Agents)
    Phân tích sự vụ tại xưởng bằng Gemini 3.6 Flash
    """
    try:
        dialogues = await generate_agent_dialogue(payload.incident, payload.context)
        return {"status": "success", "dialogues": dialogues}
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    import uvicorn
    print("\n" + "=" * 70)
    print("🚀 ĐANG KHỞI ĐỘNG RICH FISH AI INSPECTOR SERVICE TRÊN CỔNG 8000...")
    print("📍 Swagger UI: http://127.0.0.1:8000/docs")
    print("📍 Health Check: http://127.0.0.1:8000/health")
    print("📍 Workshop Assistant: http://127.0.0.1:8000/api/assistant/chat")
    print("📍 War Room Discuss: http://127.0.0.1:8000/api/warroom/discuss")
    print("📍 Test Alarm Ntfy: http://127.0.0.1:8000/api/alarm/test")
    print("=" * 70 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
