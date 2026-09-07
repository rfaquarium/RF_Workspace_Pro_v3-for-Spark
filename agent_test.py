import asyncio
import os
import sys
from pathlib import Path
from google.antigravity import Agent, LocalAgentConfig, Image

# Nhập Agent Thẩm định Chuyên sâu Rich Fish
from rf_qc_agent import RichFishQCAgent

async def test_basic_connection():
    """Kiểm tra kết nối text cơ bản với gemini-3.6-flash"""
    print("\n--- [TEST 1: KIỂM TRA KẾT NỐI GEMINI-3.6-FLASH] ---")
    config = LocalAgentConfig(model="gemini-3.6-flash")
    async with Agent(config) as agent:
        response = await agent.chat("Xin chào Antigravity SDK! Hãy xác nhận bạn đã sẵn sàng bằng 1 câu ngắn gọn.")
        text_out = await response.text()
        print("Phản hồi:", text_out.strip())

async def test_multimodal_qc():
    """Kiểm tra tính năng thẩm định ảnh sản xuất / đóng gói"""
    print("\n--- [TEST 2: THẨM ĐỊNH ẢNH SẢN XUẤT ĐA PHƯƠNG THỨC (MULTIMODAL QC)] ---")
    qc_agent = RichFishQCAgent(model_name="gemini-3.6-flash")
    
    # Kiểm tra tệp ảnh mẫu
    img_path = Path("icon.png")
    if not img_path.exists():
        print("⚠️ Chưa có tệp icon.png để test ảnh.")
        return

    sample_order = {
        "id": "PROD_2026_0905_DEMO",
        "orderId": "RF-ORD-9999",
        "name": "Bể kính siêu trong 60x40x40 8mm mài vát vi tính",
        "type": "Bể Kính",
        "phase": "phase2",
        "worker_name": "Nguyễn Hoàng Dương",
        "note": "Kiểm tra kỹ độ trong của kính và đường keo mép đáy",
        "target_reward_vnd": 35000,
    }

    print(f"Gửi ảnh '{img_path.name}' lên Agent thẩm định...")
    result = await qc_agent.inspect_production_phase(
        production_info=sample_order,
        photo_paths=[img_path],
    )
    
    print("\n🎯 KẾT QUẢ ĐÁNH GIÁ CỦA AI QC INSPECTOR:")
    print(f"- Khớp chủng loại sản phẩm: {'✅ ĐÚNG' if result.product_match else '❌ SAI'}")
    print(f"- Trạng thái QC:             {result.qc_status}")
    print(f"- Điểm số chất lượng:        {result.qc_score}/100")
    print(f"- Điều kiện duyệt KPI:       {'🟢 ĐẠT (CHO PHÉP DUYỆT)' if result.allow_kpi_approval else '🔴 CHƯA ĐẠT (TỪ CHỐI)'}")
    print(f"- Đánh giá kỹ thuật:         {result.qc_note}")
    if result.detected_defects:
        print(f"- Các lỗi phát hiện:         {', '.join(result.detected_defects)}")
    if result.repair_guidelines:
        print(f"- Hướng dẫn sửa chữa:        {result.repair_guidelines}")

async def main():
    if not os.environ.get("GEMINI_API_KEY"):
        print("❌ LỖI: Chưa có biến môi trường GEMINI_API_KEY.")
        print("💡 Chạy lệnh PowerShell: $env:GEMINI_API_KEY=\"AIza...\" trước khi chạy test.")
        return

    # 1. Test Text
    await test_basic_connection()

    # 2. Test Multimodal Vision
    await test_multimodal_qc()

if __name__ == "__main__":
    asyncio.run(main())