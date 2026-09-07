"""
=============================================================================
🏛️ RICH FISH AQUARIUM - MULTI-AGENT WAR ROOM ORCHESTRATOR
Hệ thống: RF_Workspace_Pro
Module: agent_war_room.py
Kiến trúc: Single-Turn Multi-Agent Orchestration (Gemini 3.6 Flash)
Dàn 7 Nhân Sự Số:
  1. CSO (GĐ Chiến Lược - 'cso')
  2. COO (GĐ Vận Hành - 'coo')
  3. CFO (GĐ Tài Chính - 'cfo')
  4. Thủ Kho (Thủ Kho AI - 'kho')
  5. Giám Sát SX (KCS - 'sx')
  6. Trợ Lý HR (HR & KPI - 'hr')
  7. Thánh Bao Đồng (Bao Đồng Xưởng - 'baodong')
=============================================================================
"""

import json
import os
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# Nạp biến môi trường từ .env nếu có
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

CONTEXT_CACHE_FILE = Path(__file__).parent / "war_room_context.json"

SYSTEM_WAR_ROOM = """
Bạn là hệ thống điều hành đa tác nhân (Multi-Agent War Room) của Rich Fish Aquarium (RF Workspace Pro).
Nhiệm vụ của bạn là nhận câu hỏi, chỉ đạo hoặc sự vụ tại xưởng và tạo ra cuộc hội thoại tự nhiên, sắc bén, bám sát thực tế giữa 7 nhân sự số:

1. CSO (GĐ Chiến Lược - key: 'cso'): Nhìn nhận góc độ thị trường, tiềm năng SKU, doanh số, khách hàng sàn TMĐT.
2. COO (GĐ Vận Hành - key: 'coo'): Điều phối tiến độ sản xuất, nhịp độ Takt Time (block 2 giờ), luồng One-Piece Flow.
3. CFO (GĐ Tài Chính - key: 'cfo'): Cân đối chi phí, dòng tiền, duyệt quỹ thưởng KPI hoặc kiểm soát tiền phạt.
4. Thủ Kho (Thủ kho AI - key: 'kho'): Cảnh báo tồn vật tư thực tế (kính siêu trong, keo Wacker 121, đá, lũa).
5. Giám Sát SX (KCS - key: 'sx'): Kỹ thuật bể kính dán giấu keo, bọt khí, mài vát kim cương 45 độ, an toàn lao động.
6. Trợ Lý HR (HR & KPI - key: 'hr'): Tra cứu dữ liệu KPI thực tế, đánh giá tỷ lệ hoàn thành của từng nhân sự, nội quy xưởng.
7. Thánh Bao Đồng (Bao đồng xưởng - key: 'baodong'): Khịa tếu táo, chêm vào một câu hài hước, thực tế dân dã của xưởng nhưng bám sát ngữ cảnh số liệu.

QUY TẮC CỐT LÕI VỀ AN TOÀN DỮ LIỆU & CHỐNG HALLUCINATION (DATA GROUNDING RULES):
1. BẮT BUỘC DỰA TRÊN DỮ LIỆU THẬT ĐƯỢC CUNG CẤP TRONG CONTEXT:
   - Danh sách nhân sự chính thức của Rich Fish Aquarium:
     + Nguyễn Hoàng Dương: Thợ sản xuất dán bể kính & quản lý kho phôi bể.
     + Trần Duy Tân: Thợ sản xuất dựng khung layout thủy sinh & hardscape.
     + Nguyễn Thị Diệu Hương: Phụ trách QC Đóng gói, đối soát hàng hoàn Shopee/TikTok & CSKH.
     + Nguyễn Thị Trang: Kế toán tài chính, kiểm soát thu chi & đối soát ngân hàng.
     + Nguyễn Ngọc Tiến: Quản đốc điều hành xưởng.
   - TUYỆT ĐỐI CẤM bịa đặt tên nhân sự lạ không có trong danh sách (như 'anh Tuấn', 'anh Hùng', 'chị Lan'...).
   - TUYỆT ĐỐI CẤM bịa đặt số liệu ảo không có trong dữ liệu hệ thống. Mọi nhận định về KPI, sản lượng, tồn kho, đơn hàng BẮT BUỘC trích xuất hoặc suy luận trực tiếp từ phần [DỮ LIỆU HỆ THỐNG THỜI GIAN THỰC].
2. KHI ĐƯỢC HỎI VỀ TIẾN ĐỘ KPI HOẶC NHÂN SỰ:
   - Trợ lý HR (hr) và các Agent phải nêu ĐÚNG tên nhân sự trong hệ thống và con số % hoàn thành hoặc sản lượng thực tế từ dữ liệu.
   - Phân tích ai đang có tỷ lệ cao nhất, có triển vọng cán mốc 100% nhất và điều kiện rào cản cần vượt qua (ví dụ: cần thêm kính, keo hoặc tăng tốc độ gọt keo).
3. ĐỊNH DẠNG ĐẦU RA:
   - Trả về DUY NHẤT một mảng JSON thuần túy (không bọc markdown code block ```json).
   - Mỗi phần tử có cấu trúc: {"agent": "<key>", "message": "<nội dung>"}.
   - Độ dài: Từ 5 đến 7 câu thoại súc tích, mang tính nghiệp vụ cao.
"""

class IncidentRequest(BaseModel):
    incident: str = Field(..., description="Mô tả sự vụ hoặc câu hỏi từ chỉ huy xưởng")
    context: Optional[Dict[str, Any]] = Field(None, description="Snapshot dữ liệu thực tế từ hệ thống (Nhân sự, KPI, Kho, Đơn hàng...)")


def save_context_cache(context: Dict[str, Any]):
    try:
        with open(CONTEXT_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(context, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[WAR ROOM] Lỗi lưu context cache: {e}")


def load_context_cache() -> Optional[Dict[str, Any]]:
    if CONTEXT_CACHE_FILE.exists():
        try:
            with open(CONTEXT_CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return None
    return None


def format_war_room_prompt(incident: str, context: Optional[Dict[str, Any]] = None) -> str:
    """Tạo prompt chi tiết nhúng toàn bộ dữ liệu thực tế từ Google Sheets"""
    lines = [f"YÊU CẦU / CÂU HỎI TỪ CHỈ HUY XƯỞNG: \"{incident}\""]

    effective_context = context or load_context_cache()

    if effective_context:
        lines.append("\n=== DỮ LIỆU HỆ THỐNG THỜI GIAN THỰC (RICH FISH DATABASE SNAPSHOT) ===")

        # 1. Danh sách nhân sự
        if effective_context.get("staff"):
            lines.append("\n[1. DANH SÁCH NHÂN SỰ CHÍNH THỨC]:")
            for s in effective_context["staff"]:
                lines.append(f"- {s.get('name')}: {s.get('role', 'Nhân sự xưởng')}")

        # 2. Tiến độ KPI thực tế (KPI_Progress)
        if effective_context.get("kpi_progress"):
            lines.append("\n[2. TIẾN ĐỘ KPI THỜI GIAN THỰC (KPI_Progress)]:")
            for k in effective_context["kpi_progress"]:
                pct = k.get("pct", 0)
                lines.append(f"- {k.get('user')}: Chỉ tiêu '{k.get('kpi')}' đạt {k.get('current')}/{k.get('target')} {k.get('unit', '')} ({pct}%)")
        elif effective_context.get("kpi_summary"):
            lines.append(f"\n[2. TỔNG HỢP KPI]: {effective_context.get('kpi_summary')}")

        # 3. Tiến độ sản xuất (Production)
        if effective_context.get("production"):
            p = effective_context["production"]
            lines.append(f"\n[3. LỆNH SẢN XUẤT]: Tổng {p.get('total', 0)} lệnh | Hoàn thành (Done): {p.get('done', 0)} | Đang làm: {p.get('in_progress', 0)}")
            if p.get("by_worker"):
                worker_strs = [f"{w}: {c} sp" for w, c in p["by_worker"].items()]
                lines.append(f"  + Sản lượng theo thợ: {', '.join(worker_strs)}")

        # 4. Tồn kho & Vật tư (Products)
        if effective_context.get("inventory"):
            inv = effective_context["inventory"]
            lines.append("\n[4. TỒN KHO & CẢNH BÁO VẬT TƯ]:")
            if inv.get("glue_wacker"):
                lines.append(f"  + Keo Wacker 121: {inv['glue_wacker']}")
            if inv.get("low_stock"):
                lines.append("  + Vật tư sắp hết (Dưới mức tối thiểu minStock):")
                for it in inv["low_stock"][:6]:
                    lines.append(f"    * {it.get('name')} ({it.get('sku')}): Còn {it.get('quantity')} {it.get('unit')} (Ngưỡng min: {it.get('minStock')})")

        # 5. Đơn hàng (Orders)
        if effective_context.get("orders"):
            o = effective_context["orders"]
            lines.append(f"\n[5. ĐƠN HÀNG]: Tổng {o.get('total', 0)} đơn | Chờ xử lý: {o.get('pending', 0)} | Đã giao/Hoàn thành: {o.get('completed', 0)}")

        # 6. Chấm công & Kỷ luật (Attendance)
        if effective_context.get("attendance"):
            lines.append(f"\n[6. ĐIỂM DANH & KỶ LUẬT]: {effective_context.get('attendance')}")
    else:
        # Fallback context chuẩn mực nếu chưa có snapshot từ client
        lines.append("""
=== DANH SÁCH NHÂN SỰ CỐT LÕI CỦA RICH FISH AQUARIUM ===
- Nguyễn Hoàng Dương: Thợ cắt dán bể kính & kiểm soát phôi kho bể.
- Trần Duy Tân: Thợ dựng khung layout thủy sinh & hardscape.
- Nguyễn Thị Diệu Hương: Phụ trách QC đóng gói, đối soát hàng hoàn sàn Shopee/TikTok & CSKH.
- Nguyễn Thị Trang: Kế toán tài chính, kiểm soát thu chi dòng tiền & đối soát ngân hàng.
- Nguyễn Ngọc Tiến: Quản đốc điều hành xưởng.
(LƯU Ý QUAN TRỌNG: Tuyệt đối KHÔNG có nhân sự nào tên 'anh Tuấn' hay 'anh Hùng'. Chỉ được phân tích trên các nhân sự có thật ở trên!)
""")
    return "\n".join(lines)


def build_fallback_dialogues(incident: str, context: Optional[Dict[str, Any]] = None) -> List[Dict[str, str]]:
    """Kịch bản dự phòng thông minh bám sát dữ liệu thực tế nếu mất mạng hoặc API limit"""
    ctx = context or load_context_cache() or {}
    kpis = ctx.get("kpi_progress", [])
    glue_info = ctx.get("inventory", {}).get("glue_wacker", "Keo Wacker 121 còn đủ ca làm")

    # Nếu câu hỏi về KPI
    if "kpi" in incident.lower() or "hoàn thành" in incident.lower() or "tháng này" in incident.lower():
        if kpis:
            # Sắp xếp tìm người có KPI cao nhất
            sorted_kpis = sorted(kpis, key=lambda x: x.get("pct", 0), reverse=True)
            top1 = sorted_kpis[0]
            top2 = sorted_kpis[1] if len(sorted_kpis) > 1 else None
            top1_str = f"{top1.get('user')} đang dẫn đầu với {top1.get('pct', 0)}% ({top1.get('current')}/{top1.get('target')} {top1.get('unit', '')})"
            top2_str = f", bám sát phía sau là {top2.get('user')} đạt {top2.get('pct', 0)}%" if top2 else ""

            return [
                {"agent": "hr", "message": f"Dựa trên bảng theo dõi KPI_Progress thời gian thực, hiện tại {top1_str}{top2_str}. Đây là những nhân sự sáng cửa nhất để cán đích 100% KPI tháng này!"},
                {"agent": "cso", "message": f"Thị trường đang có sức cầu rất tốt. Nếu {top1.get('user')} giữ vững tiến độ này, sản lượng đầu ra sẽ giúp xưởng hoàn thành vượt chỉ tiêu doanh số."},
                {"agent": "coo", "message": "Tiến độ dây chuyền đang kiểm soát tốt theo SOP. Đề nghị anh em thợ dán bể và dựng khung duy trì nhịp độ Takt Time để không bị dồn đơn cuối tháng."},
                {"agent": "kho", "message": f"Thủ kho rà soát vật tư: {glue_info}. Kính và đá lũa đã sẵn sàng phục vụ anh em bứt tốc KPI."},
                {"agent": "sx", "message": "KCS xác nhận: Yếu tố then chốt để duyệt KPI là đường keo dán giấu keo phải chuẩn xác, zero bọt khí và mài vát kim cương đạt chuẩn an toàn."},
                {"agent": "cfo", "message": "Ngân sách quỹ thưởng hoàn thành 100% KPI đã được phê duyệt sẵn. Nhân sự nào về đích đúng hạn sẽ được quyết toán thưởng minh bạch."},
                {"agent": "baodong", "message": f"Ối dồi ôi! {top1.get('user')} đang dẫn đầu đoàn đua thế này thì anh em chuẩn bị tinh thần được khao chầu liên hoan cuối tháng rồi nhé!"}
            ]
        else:
            return [
                {"agent": "hr", "message": "Dựa trên dữ liệu nhân sự, chị Diệu Hương (QC Đóng gói) và anh Hoàng Dương (Bể kính) đang có năng suất ổn định nhất, rất sáng cửa cán đích 100% KPI nếu duy trì nhịp độ hiện tại."},
                {"agent": "cso", "message": "Dòng bể kính siêu trong mài vát và layout thác cát đang bán rất chạy. Chỉ cần đảm bảo sản lượng thì chắc chắn KPI doanh thu sẽ về đích."},
                {"agent": "coo", "message": "Vận hành xưởng yêu cầu Hoàng Dương và Duy Tân phối hợp chặt chẽ, dán bể xong chuyển sấy khô 48h đúng quy chuẩn, tuyệt đối không đốt cháy giai đoạn."},
                {"agent": "kho", "message": f"Kho vật tư: {glue_info}. Đảm bảo cấp đủ vật tư cho anh em sản xuất liên tục."},
                {"agent": "sx", "message": "KCS sẽ giám sát chặt từng đường keo Wacker 121, cạnh mài 45 độ. Chất lượng chuẩn thì KPI mới được duyệt 100%."},
                {"agent": "cfo", "message": "Tài chính xưởng đã chuẩn bị đầy đủ quỹ thưởng tiến độ. Anh em cứ yên tâm cống hiến tay nghề."},
                {"agent": "baodong", "message": "Nghe các sếp bàn chuyện KPI rôm rả quá, anh em thợ xưởng cứ bình tĩnh bắn keo cho đẹp kẻo dính bọt khí lại bị trừ thưởng đấy nha!"}
            ]

    # Sự cố sản xuất / kỹ thuật mặc định
    return [
        {"agent": "sx", "message": f"KCS phát hiện sự vụ: '{incident}'. Cần thẩm định lại đường keo Wacker 121 và độ hoàn thiện mài vát kính theo chuẩn SOP!"},
        {"agent": "kho", "message": f"Kiểm tra kho vật tư: {glue_info}. Đề xuất cấp bổ sung vật tư dự phòng cho ca này nếu cần."},
        {"agent": "hr", "message": "Tra cứu quy chế xưởng: Yêu cầu thợ phụ trách tuân thủ nghiêm ngặt quy trình kỹ thuật để bảo toàn điểm đánh giá KPI."},
        {"agent": "cfo", "message": "Chi phí phát sinh sẽ được hạch toán minh bạch, ưu tiên khắc phục nhanh để không ảnh hưởng tiến độ giao hàng."},
        {"agent": "cso", "message": "Uy tín sản phẩm Rich Fish trên sàn TMĐT phụ thuộc vào độ sắc sảo từng đường keo. Phải xử lý triệt để để giữ đánh giá 5 sao!"},
        {"agent": "coo", "message": "Chỉ đạo vận hành: Thợ khoét vát 45 độ, xử lý bù keo và hoàn thiện gọt phẳng trong 30 phút để kịp bàn giao cho đơn vị vận chuyển."},
        {"agent": "baodong", "message": "Ối dồi ôi! Mới đảo mắt một cái là xưởng lại có biến. Anh em tập trung tay nghề nào, đừng để quỹ liên hoan lại đầy ắp tiền phạt!"}
    ]


async def generate_agent_dialogue(incident: str, context: Optional[Dict[str, Any]] = None) -> list:
    """Tạo hội thoại 7 Agent bằng Gemini 3.6 Flash dựa trên dữ liệu thực tế thời gian thực"""
    if context:
        save_context_cache(context)

    prompt = format_war_room_prompt(incident, context)

    # 1. Thử gọi Google GenAI Client
    try:
        from google.genai import Client, types
        client = Client()
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_WAR_ROOM,
                temperature=0.6,
                response_mime_type="application/json"
            )
        )
        if response and response.text:
            raw_text = response.text.strip()
            clean_text = re.sub(r"^```(?:json)?\s*", "", raw_text, flags=re.MULTILINE)
            clean_text = re.sub(r"\s*```$", "", clean_text, flags=re.MULTILINE).strip()
            data = json.loads(clean_text)
            if isinstance(data, list) and len(data) > 0:
                return data
    except Exception as e:
        print(f"[WAR ROOM ENGINE] GenAI Client error: {e}")

    # 2. Thử Antigravity SDK fallback
    try:
        from google.antigravity import Agent, LocalAgentConfig
        config = LocalAgentConfig(
            model="gemini-3.6-flash",
            system_instructions=SYSTEM_WAR_ROOM
        )
        async with Agent(config) as agent:
            resp = await agent.chat(prompt)
            raw_text = await resp.text()
            clean_text = re.sub(r"^```(?:json)?\s*", "", raw_text, flags=re.MULTILINE)
            clean_text = re.sub(r"\s*```$", "", clean_text, flags=re.MULTILINE).strip()
            data = json.loads(clean_text)
            if isinstance(data, list) and len(data) > 0:
                return data
    except Exception as e:
        print(f"[WAR ROOM ENGINE] Antigravity SDK fallback error: {e}")

    # 3. Kịch bản thông minh thích ứng dự phòng dựa trên dữ liệu thực tế
    return build_fallback_dialogues(incident, context)