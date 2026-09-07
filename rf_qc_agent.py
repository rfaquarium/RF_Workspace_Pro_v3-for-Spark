"""
=============================================================================
🤖 RICH FISH AQUARIUM - MULTIMODAL QC & KPI INSPECTOR AGENT
Hệ thống: RF_Workspace_Pro
Kiến trúc: Google Antigravity SDK (Multimodal Vision Engine)
Mục tiêu: Thẩm định ảnh sản xuất (Phase 1, Phase 2) & Đóng gói trước khi duyệt KPI
=============================================================================
"""

from __future__ import annotations

import asyncio
import json
import os
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

from google.antigravity import Agent, Image, LocalAgentConfig


# =============================================================================
# 1. TIÊU CHUẨN NGHIỆP VỤ & CHECKLIST CHẤT LƯỢNG RICH FISH AQUARIUM
# =============================================================================
QC_SYSTEM_PROMPT = """
Bạn là AI Lead Quality Control Inspector (Kỹ sư Trưởng Thẩm định Chất lượng) kiêm AI Operations Leader của thương hiệu thủy sinh cao cấp Rich Fish Aquarium.
Nhiệm vụ của bạn là thẩm định thị giác đa phương thức (Multimodal Computer Vision) đối với các bức ảnh do thợ sản xuất và nhân sự đóng gói chụp gửi lên hệ thống RF_Workspace_Pro.

BẠN CẦN KIỂM SOÁT NGHIÊM NGẶT 3 CỔNG CHẤT LƯỢNG (QUALITY GATES):

-------------------------------------------------------------------------------
CỔNG 1: XÁC THỰC CHỦNG LOẠI & SẢN PHẨM (PRODUCT IDENTITY MATCH)
-------------------------------------------------------------------------------
- Đối chiếu ảnh chụp với tên sản phẩm, loại hàng hóa và ghi chú kỹ thuật:
  + Bể kính: Kích thước tỉ lệ hình học (dài x rộng x cao), độ dày kính (5mm, 8mm, 10mm, 12mm), loại kính (Siêu trong / Kính thường), kiểu gia công (Mài xiết cạnh / Mài vát kim cương / Kính uốn).
  + Khung Hardscape / Layout Thủy Sinh: Dáng bố cục (Bonsai, Rừng Lũa, Thác Cát, Núi Đá Tam Sơn, Iwagumi), chất liệu (Lũa săn đá, đá da voi, đá tiger, rêu weeping, mini taiwan...).
  + Đóng gói: Đúng kích cỡ thùng, đối chiếu đúng sản phẩm trước khi bọc và sau khi hoàn thiện kiện hàng.
- PHÁT HIỆN GIAN LẬN: Từ chối ngay nếu thợ chụp ảnh mờ cố ý che giấu lỗi, ảnh chụp không đúng chủng loại được giao trong lệnh sản xuất, hoặc chụp góc chết không thấy toàn bộ kết cấu.

-------------------------------------------------------------------------------
CỔNG 2: TIÊU CHUẨN KỸ THUẬT THEO TỪNG KHÂU (PHASE CRITERIA)
-------------------------------------------------------------------------------
A. KHÂU 1 (PHASE 1):
   * Bể Kính - Cắt Dán:
     - 5 tấm kính được ghép vuông vắn 90 độ, mép bằng phẳng, không bị giật cấp/lệch mép quá 0.5mm.
     - Kiểm tra toàn bộ 8 góc và 12 cạnh kính: Tuyệt đối KHÔNG có vết mẻ cạnh kính (chips), nứt dăm chân chim (cracks), hay xước mặt kính nhìn thấy được.
   * Layout - Dựng Khung:
     - Khung cứng vững chắc, liên kết chân đế cân bằng, tỷ lệ cân đối với kích thước bể dự kiến.
     - Khung lũa/đá chính chịu lực tốt, đúng đường nét mỹ thuật theo mô tả (tỉ lệ vàng 1/3, độ dốc tự nhiên).

B. KHÂU 2 (PHASE 2):
   * Bể Kính - Gọt Keo & Hoàn Thiện:
     - Đường chỉ keo silicon bên trong góc bể phải thẳng tắp, bóng mịn, bề rộng chỉ keo đều từ 1mm - 2mm.
     - Tuyệt đối KHÔNG có bọt khí (air bubbles) trong khe dán chịu lực.
     - Keo thừa được gọt sạch 100%, không để lại vệt keo ố vàng hoặc lem nhem làm mờ kính.
     - Vát mép kim cương (nếu có yêu cầu) sáng bóng, sờ không đứt tay.
   * Layout - Gia Cố & Gắn Rêu/Cây:
     - Mối nối keo 502/xi măng liên kết phải được giấu kín hoàn hảo (phủ bột gỗ lũa hoặc mùn đá đồng màu).
     - Rêu/cây gắn đúng vị trí, độ phủ thẩm mỹ cao, màu sắc xanh tươi tự nhiên, không bị cháy keo hay bạc màu.

C. KHÂU ĐÓNG GÓI (PACKINGS):
   * Đối chiếu ảnh trước đóng gói (photoBefore) và kiện hàng đóng hoàn thiện (photo):
     - Sản phẩm còn nguyên vẹn 100% trước khi gói.
     - Bọc xốp nổ chống sốc tối thiểu 4 - 6 lớp kín toàn bộ các mặt.
     - Góc bể/layout có ốp mút xốp định hình chịu lực (EVA foam / EPS foam).
     - Đóng thùng carton 5 lớp cứng cáp hoặc thùng xốp chuyên dụng.
     - Băng keo niêm phong kín các mép nối, dán đầy đủ tem: "HÀNG DỄ VỠ - XIN NHẸ TAY", "HƯỚNG ĐẶT THÙNG (MŨI TÊN CHỈ LÊN)".
     - Vận đơn (Bill vận chuyển) dán phẳng phiu, mã vạch rõ nét.

-------------------------------------------------------------------------------
CỔNG 3: CỔNG CHẶN DUYỆT KPI (KPI REWARD GATEKEEPER)
-------------------------------------------------------------------------------
- Điều kiện tiên quyết để `allow_kpi_approval = true`:
  + `product_match` PHẢI là `true`.
  + `qc_status` PHẢI là `"Pass"`.
  + `qc_score` PHẢI >= 85/100.
  + Không tồn tại bất kỳ lỗi nghiêm trọng (Critical Defects) nào.
- Nếu không đạt (`Need_Repair` hoặc `Failed`):
  + Bắt buộc khóa `allow_kpi_approval = false`.
  + Ghi rõ `defects` và `repair_guidelines` để thợ biết chính xác vị trí cần chỉnh sửa lại trước khi chụp thẩm định lần 2.

ĐỊNH DẠNG TRẢ VỀ:
Bạn BẮT BUỘC phải trả về duy nhất 1 chuỗi JSON hợp lệ (có thể bọc trong khối ```json ... ```), không thêm bất kỳ văn bản chào hỏi thừa thãi nào ngoài JSON:
{
  "product_match": true,
  "product_match_confidence": 0.95,
  "qc_status": "Pass",
  "qc_score": 92,
  "detected_defects": [],
  "qc_note": "Bể dán chuẩn góc 90 độ, đường keo gọt sạch bóng mịn, không phát hiện bọt khí hay mẻ cạnh.",
  "allow_kpi_approval": true,
  "inspection_summary": "Đạt chuẩn xuất xưởng Rich Fish Grade A.",
  "repair_guidelines": "",
  "kpi_reward_action": {
    "action": "APPROVE",
    "suggested_reward_status": "APPROVED",
    "phase": "phase2"
  }
}
"""


@dataclass
class InspectionResult:
    """Kết quả thẩm định chất lượng có cấu trúc chuẩn."""
    product_match: bool
    product_match_confidence: float
    qc_status: str  # "Pass" | "Need_Repair" | "Failed"
    qc_score: int   # 0 - 100
    detected_defects: List[str]
    qc_note: str
    allow_kpi_approval: bool
    inspection_summary: str
    repair_guidelines: str
    kpi_reward_action: Dict[str, Any]
    raw_response: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "product_match": self.product_match,
            "product_match_confidence": self.product_match_confidence,
            "qc_status": self.qc_status,
            "qc_score": self.qc_score,
            "detected_defects": self.detected_defects,
            "qc_note": self.qc_note,
            "allow_kpi_approval": self.allow_kpi_approval,
            "inspection_summary": self.inspection_summary,
            "repair_guidelines": self.repair_guidelines,
            "kpi_reward_action": self.kpi_reward_action,
        }

    def to_production_schema_update(self, phase: str = "phase2") -> Dict[str, Any]:
        """
        Xuất payload khớp 100% cột CSDL Production của RF_Workspace_Pro:
        - qc_status: 'Pass' | 'Need_Repair' | 'Failed'
        - qc_note: Ghi chú đánh giá của AI Inspector
        - p1_status / p2_status: Tự động cập nhật nếu đạt
        """
        payload = {
            "qc_status": self.qc_status,
            "qc_note": f"[AI-QC {self.qc_score}/100]: {self.qc_note}",
        }
        if self.allow_kpi_approval:
            if phase == "phase1":
                payload["p1_status"] = "Done"
            elif phase == "phase2":
                payload["p2_status"] = "Done"
                payload["status"] = "Done"
        else:
            if phase == "phase1":
                payload["p1_status"] = "Need_Repair"
            elif phase == "phase2":
                payload["p2_status"] = "Need_Repair"

        return payload


class RichFishQCAgent:
    """Agent thẩm định ảnh sản xuất và đóng gói bằng Multimodal Antigravity SDK."""

    def __init__(
        self,
        model_name: str = "gemini-3.6-flash",
        api_key: Optional[str] = None,
    ):
        """
        Khởi tạo QC Inspector Agent.
        :param model_name: Tên model Gemini Multimodal (mặc định gemini-3.6-flash).
        :param api_key: GEMINI_API_KEY (nếu để None SDK sẽ tự đọc từ biến môi trường).
        """
        self.model_name = model_name
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")

        if not self.api_key:
            print("[CẢNH BÁO] Chưa tìm thấy GEMINI_API_KEY trong môi trường.")

    def _prepare_agent_config(self) -> LocalAgentConfig:
        """Tạo cấu hình kết nối LocalAgentConfig tối ưu cho Multimodal Vision."""
        return LocalAgentConfig(
            model=self.model_name,
            system_instructions=QC_SYSTEM_PROMPT,
        )

    def _load_media_images(self, photo_paths: List[str | Path]) -> List[Image]:
        """Đọc và kiểm tra các tệp ảnh đầu vào."""
        images: List[Image] = []
        for p in photo_paths:
            if not p:
                continue
            path_obj = Path(p).resolve()
            if not path_obj.is_file():
                raise FileNotFoundError(f"Không tìm thấy tệp ảnh tại: {path_obj}")
            
            # Sử dụng Image.from_file từ Antigravity SDK
            images.append(Image.from_file(path_obj, description=f"Ảnh QC: {path_obj.name}"))
        
        return images

    @staticmethod
    def _extract_json_response(raw_text: str) -> Dict[str, Any]:
        """Bóc tách và parse JSON chuẩn xác từ kết quả trả về của model."""
        clean_text = raw_text.strip()
        # Tìm khối ```json ... ``` nếu có
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", clean_text, re.IGNORECASE)
        if match:
            clean_text = match.group(1).strip()
        
        try:
            return json.loads(clean_text)
        except json.JSONDecodeError as exc:
            # Fallback nếu JSON bị lỗi nhẹ định dạng
            first_brace = clean_text.find("{")
            last_brace = clean_text.rfind("}")
            if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
                sub_str = clean_text[first_brace : last_brace + 1]
                return json.loads(sub_str)
            raise ValueError(f"Không thể parse JSON từ phản hồi AI: {raw_text}") from exc

    async def inspect_production_phase(
        self,
        production_info: Dict[str, Any],
        photo_paths: List[str | Path],
    ) -> InspectionResult:
        """
        Thẩm định chất lượng ảnh Khâu 1 (Phase 1) hoặc Khâu 2 (Phase 2).
        
        :param production_info: Thông tin lệnh sản xuất:
            - id: Mã lệnh sản xuất (Production.id)
            - orderId: Mã đơn hàng liên kết (Production.orderId)
            - name: Tên sản phẩm / layout / bể kính (Production.name)
            - type: Loại (Bể Kính / Khung/Layout / Combo / Phụ Kiện)
            - phase: 'phase1' | 'phase2'
            - worker_name: Tên thợ phụ trách (p1_user / p2_user)
            - note: Ghi chú kỹ thuật từ đơn hàng (Production.note)
            - target_reward_vnd: Mức thưởng dự kiến nếu duyệt (Config_KPI)
        :param photo_paths: Danh sách đường dẫn ảnh (p1_photo / p2_photo / qc_front_photo / qc_side_photo)
        :return: InspectionResult
        """
        if not photo_paths:
            raise ValueError("Bắt buộc phải cung cấp ít nhất 1 ảnh để thẩm định chất lượng!")

        images = self._load_media_images(photo_paths)

        phase = production_info.get("phase", "phase2").lower()
        phase_label = "Khâu 1 (Cắt Dán / Dựng Khung)" if phase == "phase1" else "Khâu 2 (Gọt Keo / Gia Cố & Gắn Rêu)"

        user_prompt_content = f"""
YÊU CẦU THẨM ĐỊNH ẢNH SẢN XUẤT:
- Mã Lệnh Sản Xuất: {production_info.get('id', 'N/A')}
- Mã Đơn Hàng: {production_info.get('orderId', 'N/A')}
- Tên Sản Phẩm: {production_info.get('name', 'N/A')}
- Phân Loại (Type): {production_info.get('type', 'Bể Kính')}
- Khâu Thẩm Định: {phase_label} ({phase})
- Thợ Thực Hiện: {production_info.get('worker_name', 'Chưa rõ')}
- Ghi Chú Đơn Hàng: {production_info.get('note', 'Không có ghi chú đặc biệt')}
- Thưởng KPI Dự Kiến: {production_info.get('target_reward_vnd', 0):,} VNĐ

HƯỚNG DẪN QUAN SÁT ẢNH:
Hãy phân tích chi tiết từng góc chụp trong ảnh đính kèm:
1. Xác thực xem ảnh có đúng là sản phẩm "{production_info.get('name')}" không.
2. Kiểm tra độ chuẩn xác kỹ thuật theo đúng tiêu chuẩn của {phase_label}.
3. Nếu phát hiện lỗi (bọt khí, lem keo, mẻ cạnh, dáng lệch, giấu keo ẩu...), hãy liệt kê chi tiết trong `detected_defects` và đưa ra hướng dẫn khắc phục cụ thể.
4. Quyết định xem có đủ điều kiện duyệt KPI (`allow_kpi_approval`) cho thợ "{production_info.get('worker_name')}" hay không.

Hãy trả về duy nhất chuỗi JSON theo đúng quy chuẩn đã giao.
"""

        # Gửi prompt kèm danh sách ảnh (multimodal content)
        chat_payload: List[Any] = [user_prompt_content]
        chat_payload.extend(images)

        config = self._prepare_agent_config()

        async with Agent(config) as agent:
            response = await agent.chat(chat_payload)
            raw_text = await response.text()

        parsed = self._extract_json_response(raw_text)

        return InspectionResult(
            product_match=bool(parsed.get("product_match", False)),
            product_match_confidence=float(parsed.get("product_match_confidence", 0.0)),
            qc_status=str(parsed.get("qc_status", "Need_Repair")),
            qc_score=int(parsed.get("qc_score", 0)),
            detected_defects=list(parsed.get("detected_defects", [])),
            qc_note=str(parsed.get("qc_note", "")),
            allow_kpi_approval=bool(parsed.get("allow_kpi_approval", False)),
            inspection_summary=str(parsed.get("inspection_summary", "")),
            repair_guidelines=str(parsed.get("repair_guidelines", "")),
            kpi_reward_action=dict(parsed.get("kpi_reward_action", {})),
            raw_response=raw_text,
        )

    async def inspect_packing(
        self,
        packing_info: Dict[str, Any],
        photo_before_path: str | Path,
        photo_after_path: str | Path,
    ) -> InspectionResult:
        """
        Thẩm định chất lượng khâu Đóng Gói (Packings):
        - So sánh tình trạng nguyên vẹn trước khi bọc (photoBefore)
        - Kiểm tra quy chuẩn bọc lót chống va đập, tem mác (photo)
        
        :param packing_info: Thông tin đơn đóng gói:
            - orderId: Mã đơn hàng (Packings.orderId)
            - user: Tên nhân sự đóng gói (Packings.user, vd: Diệu Hương)
            - shippingMethod: Đơn vị vận chuyển (GHN / ViettelPost / Hỏa tốc)
            - reward_vnd: Thưởng đóng gói (Packings.reward_vnd)
        :param photo_before_path: Đường dẫn ảnh sản phẩm trước khi bọc
        :param photo_after_path: Đường dẫn ảnh kiện hàng bọc hoàn thiện
        """
        before_img = Image.from_file(Path(photo_before_path).resolve(), description="Ảnh 1: Hàng trước khi bọc gói (photoBefore)")
        after_img = Image.from_file(Path(photo_after_path).resolve(), description="Ảnh 2: Kiện hàng hoàn thiện sau khi bọc (photo)")

        user_prompt_content = f"""
YÊU CẦU THẨM ĐỊNH ẢNH ĐÓNG GÓI (PACKINGS QC):
- Mã Đơn Hàng: #{packing_info.get('orderId', 'N/A')}
- Nhân Sự Đóng Gói: {packing_info.get('user', 'Diệu Hương')}
- Phương Thức Giao Hàng: {packing_info.get('shippingMethod', 'Vận chuyển tiêu chuẩn')}
- Thưởng Đóng Gói Dự Kiến: {packing_info.get('reward_vnd', 0):,} VNĐ

HƯỚNG DẪN ĐỐI CHIẾU 2 ẢNH:
- Ảnh 1 (photoBefore): Sản phẩm có bị nứt, vỡ, gãy cành hay móp méo TRƯỚC KHI bọc gói hay không?
- Ảnh 2 (photo): Kiện hàng có được bọc đủ 4-6 lớp xốp nổ, chèn mút 4 góc, dán băng keo niêm phong chắc chắn, tem Cảnh báo Dễ Vỡ và tem vận chuyển có đầy đủ, rõ ràng không?
- Xác định xem có cho phép duyệt thưởng đóng gói ({packing_info.get('reward_vnd', 0):,} VNĐ) cho nhân sự "{packing_info.get('user')}" hay không.

Hãy trả về duy nhất chuỗi JSON theo đúng quy chuẩn đã giao.
"""

        config = self._prepare_agent_config()

        async with Agent(config) as agent:
            response = await agent.chat([user_prompt_content, before_img, after_img])
            raw_text = await response.text()

        parsed = self._extract_json_response(raw_text)

        return InspectionResult(
            product_match=bool(parsed.get("product_match", False)),
            product_match_confidence=float(parsed.get("product_match_confidence", 0.0)),
            qc_status=str(parsed.get("qc_status", "Need_Repair")),
            qc_score=int(parsed.get("qc_score", 0)),
            detected_defects=list(parsed.get("detected_defects", [])),
            qc_note=str(parsed.get("qc_note", "")),
            allow_kpi_approval=bool(parsed.get("allow_kpi_approval", False)),
            inspection_summary=str(parsed.get("inspection_summary", "")),
            repair_guidelines=str(parsed.get("repair_guidelines", "")),
            kpi_reward_action=dict(parsed.get("kpi_reward_action", {})),
            raw_response=raw_text,
        )


# =============================================================================
# RUNNER TEST DEMO TIỆN ÍCH TRỰC TIẾP
# =============================================================================
if __name__ == "__main__":
    print("=" * 70)
    print("🐠 RICH FISH AQUARIUM - AI MULTIMODAL QC INSPECTOR AGENT")
    print("=" * 70)

    # Kiểm tra biến môi trường
    if not os.environ.get("GEMINI_API_KEY"):
        print("❌ LỖI: Chưa có biến môi trường GEMINI_API_KEY.")
        print("💡 Hãy chạy: $env:GEMINI_API_KEY=\"AIza...\" trước khi thực thi.")
        sys.exit(1)

    print("Khởi tạo Agent thẩm định với model gemini-3.6-flash...")
    qc_agent = RichFishQCAgent(model_name="gemini-3.6-flash")

    # Mẫu ảnh kiểm tra có sẵn trong workspace
    sample_image = Path("icon.png")
    if not sample_image.exists():
        print("⚠️ Không tìm thấy icon.png để chạy demo ảnh.")
        sys.exit(0)

    sample_prod_info = {
        "id": "PROD_2026_0905_01",
        "orderId": "RF-ORD-8899",
        "name": "Bể kính siêu trong 60x40x40 8mm mài vát kim cương",
        "type": "Bể Kính",
        "phase": "phase2",
        "worker_name": "Nguyễn Hoàng Dương",
        "note": "Khách dặn kiểm tra kỹ đường keo góc đáy, yêu cầu không một hạt bọt khí.",
        "target_reward_vnd": 35000,
    }

    async def run_demo():
        print(f"\n📸 Đang gửi ảnh '{sample_image.name}' lên Agent thẩm định đa phương thức...")
        try:
            result = await qc_agent.inspect_production_phase(
                production_info=sample_prod_info,
                photo_paths=[sample_image],
            )
            print("\n" + "=" * 50)
            print("📊 KẾT QUẢ THẨM ĐỊNH TỪ AI INSPECTOR:")
            print("=" * 50)
            print(f"• Khớp Sản Phẩm (Match):   {'✅ CÓ' if result.product_match else '❌ KHÔNG'}")
            print(f"• Độ Tin Cậy (Confidence): {result.product_match_confidence * 100:.1f}%")
            print(f"• Trạng Thái QC:           {result.qc_status.upper()}")
            print(f"• Điểm Chất Lượng:         {result.qc_score}/100")
            print(f"• Duyệt KPI Thợ:           {'🟢 CHO PHÉP' if result.allow_kpi_approval else '🔴 TỪ CHỐI / CẦN SỬA'}")
            print(f"• Ghi Chú QC (qc_note):    {result.qc_note}")
            
            if result.detected_defects:
                print(f"• Lỗi Phát Hiện:           {', '.join(result.detected_defects)}")
            if result.repair_guidelines:
                print(f"• Hướng Dẫn Sửa Chữa:      {result.repair_guidelines}")

            print("\n🔄 Payload Cập Nhật CSDL Production (khớp 100% Schema):")
            print(json.dumps(result.to_production_schema_update("phase2"), indent=2, ensure_ascii=False))

        except Exception as err:
            print(f"\n❌ Lỗi trong quá trình thẩm định: {err}")

    asyncio.run(run_demo())
