"""
=============================================================================
🤖 RICH FISH AQUARIUM - RF WORKSHOP ASSISTANT AGENT (QUẢN ĐỐC ẢO XƯỞNG)
Hệ thống: RF_Workspace_Pro
Module: agent_assistant.py
Chức năng:
  1. Hướng dẫn kỹ thuật gia công bể kính, dán giấu keo, mài vát, tỉ lệ layout thủy sinh
  2. Phân tích nguyên nhân & hướng dẫn khắc phục chi tiết khi AI KCS trả về 'Need_Repair'
  3. Nhắc nhở an toàn lao động (vác kính, mài đá lũa, thông gió hóa chất)
  4. Hỗ trợ thợ giải đáp định mức vật liệu và quy trình sản xuất tức thời
=============================================================================
"""

import os
from pathlib import Path
from typing import Optional
from pydantic import BaseModel, Field

# =============================================================================
# TỰ ĐỘNG NẠP BIẾN MÔI TRƯỜNG TỪ .env
# =============================================================================
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

# =============================================================================
# SYSTEM PROMPT: VAI TRÒ QUẢN ĐỐC KỸ THUẬT SỐ XƯỞNG RICH FISH
# =============================================================================
SYSTEM_INSTRUCTION = """
Bạn là Quản Đốc Ảo kiêm Kỹ Sư Trưởng Hướng Dẫn Kỹ Thuật tại xưởng sản xuất của Rich Fish Aquarium (RF_Workspace_Pro).
Bạn đồng hành trực tiếp cùng các anh em thợ (Duy Tân, Hoàng Dương, Diệu Hương, v.v.).

NHIỆM VỤ CỐT LÕI:
1. HƯỚNG DẪN QUY CHUẨN KỸ THUẬT:
   - Bể kính: Kỹ thuật dán giấu keo không bọt khí, mài xiết cạnh vi tính, mài vát kim cương 45 độ, căn khe keo 1-2mm chịu lực, keo Silicon Wacker 121 / Dow Corning.
   - Layout & Hardscape: Tỉ lệ vàng 1/3, kỹ thuật khoét hang hốc giấu mối ghép, kỹ thuật làm thác cát chống kẹt cát, giấu keo 502 bằng mùn cưa và bột đá cùng màu, kỹ thuật buộc/dán rêu weeping, mini taiwan.
2. XỬ LÝ LỖI KCS (NEED_REPAIR):
   - Khi nhận thông báo lỗi từ hệ thống kiểm tra chất lượng (KCS), lập tức phân tích nguyên nhân gốc rễ và đưa ra giải pháp khắc phục cụ thể theo từng bước:
     + Bọt khí góc keo: Dùng dao cạo kính khoét vát 45 độ vị trí bọt, lau sạch cồn 90 độ, vuốt bù keo và gạt phẳng.
     + Sứt mẻ cạnh kính nhẹ: Đánh giá vị trí có chịu lực không, mài mịn lại bằng giấy ráp nước hoặc đá mài tay; nếu sứt góc chịu lực thì yêu cầu thay tấm kính mới để đảm bảo an toàn.
     + Layout lung lay / yếu chân: Bổ sung thanh chống chịu lực ẩn phía sau, gia cố bằng bông gòn + keo 502 phủ mùn đá.
3. AN TOÀN LAO ĐỘNG & VỆ SINH XƯỞNG:
   - Luôn nhắc nhở: Đeo găng tay chống cắt cấp 5 khi bốc vác kính lớn, đeo kính bảo hộ khi cắt mài đá lũa, mở quạt thông gió khi dán keo 502 khối lượng lớn, vệ sinh sạch mặt bàn tránh vụn kính gây xước phôi.
4. PHONG CÁCH GIAO TIẾP:
   - Thân thiện, thực tế, vững chuyên môn như một người đàn anh thợ lành nghề lâu năm.
   - Ngắn gọn, súc tích, trình bày gạch đầu dòng rõ ràng, tập trung vào giải pháp hành động ngay.
"""

# =============================================================================
# DATA MODELS
# =============================================================================
class AssistantRequest(BaseModel):
    message: str = Field(..., description="Câu hỏi hoặc tình huống cần hỗ trợ từ thợ xưởng")
    employee_name: Optional[str] = Field("Thợ xưởng", description="Tên thợ (vd: Hoàng Dương, Duy Tân...)")
    context_phase: Optional[str] = Field("Chung", description="Công đoạn đang làm (vd: Phase 1 Cắt dán, Phase 2 Gọt keo, Layout...)")
    product_name: Optional[str] = Field("", description="Tên sản phẩm đang làm (nếu có)")
    defect_note: Optional[str] = Field("", description="Ghi chú lỗi KCS nếu đang xử lý Need_Repair")


# =============================================================================
# CORE INFERENCE ENGINE
# =============================================================================
async def ask_assistant(request: AssistantRequest) -> str:
    """
    Thực thi trả lời câu hỏi của thợ xưởng.
    Hỗ trợ linh hoạt cả Google GenAI Client lẫn Google Antigravity SDK
    để đảm bảo tính sẵn sàng 100% trong mọi cấu hình môi trường.
    """
    prompt_parts = []
    if request.employee_name:
        prompt_parts.append(f"Nhân viên: {request.employee_name}")
    if request.context_phase:
        prompt_parts.append(f"Công đoạn đang thực hiện: {request.context_phase}")
    if request.product_name:
        prompt_parts.append(f"Sản phẩm: {request.product_name}")
    if request.defect_note:
        prompt_parts.append(f"Lỗi KCS ghi nhận: {request.defect_note}")
    prompt_parts.append(f"Câu hỏi / Tình huống: {request.message}")

    full_prompt = "\n".join(prompt_parts)

    # 1. Thử dùng Google GenAI Client (nếu cấu hình API key tiêu chuẩn)
    try:
        from google.genai import Client, types
        client = Client()
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=full_prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.4,
            )
        )
        if response and response.text:
            return response.text.strip()
    except Exception:
        # Tự động chuyển sang Antigravity SDK nếu GenAI Client không khả dụng
        pass

    # 2. Fallback sang Google Antigravity SDK (nền tảng cốt lõi của RF_Workspace_Pro)
    from google.antigravity import Agent, LocalAgentConfig
    config = LocalAgentConfig(
        model="gemini-3.6-flash",
        system_instructions=SYSTEM_INSTRUCTION
    )
    async with Agent(config) as agent:
        resp = await agent.chat(full_prompt)
        text_out = await resp.text()
        return text_out.strip()
