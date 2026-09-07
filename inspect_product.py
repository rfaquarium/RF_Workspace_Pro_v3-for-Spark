import asyncio
import json
import os
import re
from pathlib import Path
from google.antigravity import Agent, LocalAgentConfig, Image

async def inspect_production_photo(image_path: str, product_info: dict) -> dict:
    """
    Thẩm định ảnh chụp công đoạn sản xuất / đóng gói của thợ.
    Trả về kết quả chuẩn hóa dạng dict (JSON).
    """
    img_file = Path(image_path)
    if not img_file.exists():
        return {"status": "ERROR", "message": f"Không tìm thấy file ảnh: {image_path}"}

    prompt = f"""
Bạn là chuyên gia kiểm tra chất lượng (KCS) của xưởng bể cá Rich Fish Aquarium.
Hãy thẩm định ảnh chụp nghiệm thu công đoạn của thợ sau đây:

THÔNG TIN ĐƠN HÀNG:
- Mã đơn: {product_info.get('orderCode', 'N/A')}
- Sản phẩm: {product_info.get('productName', 'Bể kính / Layout')}
- Kích thước yêu cầu: {product_info.get('size', 'N/A')}
- Công đoạn: {product_info.get('phase', 'Phase 1 / Phase 2 / Đóng gói')}
- Yêu cầu kỹ thuật: {product_info.get('specs', 'Dán keo gọn, không bọt khí, đúng tỉ lệ bố cục')}

TIÊU CHÍ ĐÁNH GIÁ:
1. Tính xác thực: Ảnh có chụp sản phẩm thật tại xưởng không (hay chụp màn hình, ảnh tải mạng, chụp sàn nhà/góc trống)?
2. Đúng sản phẩm: Có đúng chủng loại (Layout lũa/đá, hay Bể kính mài vi tính/giấu keo) không?
3. Chất lượng công đoạn:
   - Phase 1 (Dựng khung/cắt dán): Khung bể vuông vắn, form layout vững, đúng chiều cao/chiều dài.
   - Phase 2 (Gia cố/gọt keo): Đường keo sạch, không lem nhem bọt khí lộ liễu, bố cục layout gắn chắc.
   - Đóng gói: Có bọc xốp bóng khí (bubble wrap), góc chèn xốp tấm, đóng thùng xốp/gỗ an toàn chưa.

BẮT BUỘC TRẢ VỀ DẠNG JSON DUY NHẤT (không thêm văn bản ngoài JSON):
{{
  "is_valid_photo": true,
  "passed_kpi": true,
  "confidence_score": 90,
  "detected_product": "Mô tả ngắn sản phẩm nhìn thấy trong ảnh",
  "defects_detected": ["danh sách lỗi nếu có (bọt keo, lệch góc, thiếu xốp...)"],
  "kcs_note": "Nhận xét tóm tắt cho quản lý xưởng",
  "action_recommended": "APPROVE"
}}
"""

    config = LocalAgentConfig(
        model="gemini-3.6-flash"
    )

    # Sử dụng Image.from_file trực tiếp từ Google Antigravity SDK
    photo = Image.from_file(img_file, description=f"Ảnh nghiệm thu {product_info.get('phase')}")

    async with Agent(config) as agent:
        # Gửi kèm ảnh Image primitive và prompt thẩm định
        response = await agent.chat([
            photo,
            prompt
        ])
        raw_text = (await response.text()).strip()
        
        # Bóc tách JSON an toàn từ markdown block nếu có
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_text, re.IGNORECASE)
        clean_text = match.group(1).strip() if match else raw_text
        
        try:
            return json.loads(clean_text)
        except Exception:
            # Fallback nếu JSON bị kẹt ký tự thừa
            first_brace = clean_text.find("{")
            last_brace = clean_text.rfind("}")
            if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
                try:
                    return json.loads(clean_text[first_brace:last_brace + 1])
                except Exception:
                    pass
            return {"raw_output": raw_text}

async def main():
    # Sử dụng test_be_kinh.jpg nếu có, nếu chưa có thì fallback sang icon.png để test ngay
    sample_image = "test_be_kinh.jpg"
    if not os.path.exists(sample_image):
        if os.path.exists("icon.png"):
            print(f"💡 Chưa thấy '{sample_image}', tự động dùng 'icon.png' có sẵn trong xưởng để test mẫu:")
            sample_image = "icon.png"
        else:
            print(f"❌ Không tìm thấy tệp ảnh '{sample_image}'. Vui lòng đặt file ảnh vào thư mục dự án.")
            return
    
    # Metadata tương ứng từ Google Sheets (Orders / Production)
    sample_product_info = {
        "orderCode": "ORD_29184",
        "productName": "Bể siêu trong 60x30x30 8 li mài vi tính",
        "size": "60x30x30 cm",
        "phase": "Phase 2 (Gọt keo & Hoàn thiện)",
        "specs": "Keo dán giấu keo không đường thừa, góc mài bóng không sứt mẻ"
    }

    print(f"Đang thẩm định ảnh '{sample_image}' qua AI Agent...")
    result = await inspect_production_photo(sample_image, sample_product_info)
    print("\n--- KẾT QUẢ THẨM ĐỊNH KCS ---")
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    asyncio.run(main())