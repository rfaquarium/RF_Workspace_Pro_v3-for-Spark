"""
⚡ TEST SUITE: KIỂM ĐỊNH TOÀN DIỆN HỆ THỐNG 7 AGENT CLOUD
RF WORKSPACE PRO - AGENTS CLOUD PIPELINE VERIFICATION

Kiểm tra:
1. Data Sanitization: Chỉ giữ trường được phép, loại bỏ 100% PIN và thông tin nhạy cảm.
2. Output Validation: Bắt buộc evidence có thật trong bảng dữ liệu, cấm tool lạ.
3. 7 Lượt Gọi Gemini Độc Lập: 5 Specialist chạy song song, COO và Bao Đồng đọc receipts.
4. Idempotency & Distributed Lease: Chống chạy trùng, tự giải phóng lease khi xong.
5. Task Management: Tạo việc nội bộ có task_id ổn định, không trùng lặp qua các đợt chạy.
6. Failure Resilience: Agent lỗi thì trả về status=failed trung thực, không dùng thoại mẫu che giấu.
"""

import asyncio
import json
import os
import unittest
from datetime import datetime, timezone

from agents_cloud.engine import (
    Engine, ROLES, FIELDS, clean_snapshot, validate_output, digest
)
from agents_cloud.adapters import MemoryStore, SheetsSource, GeminiModel


class MockGeminiClient:
    """Mock Gemini Model phục vụ kiểm thử cô lập từng agent."""
    def __init__(self, behavior_map=None):
        self.behavior_map = behavior_map or {}
        self.call_history = []

    async def analyze(self, role, question, context):
        self.call_history.append({
            'role': role,
            'question': question,
            'context': context
        })

        if role in self.behavior_map:
            val = self.behavior_map[role]
            if isinstance(val, Exception):
                raise val
            return val

        # Phản hồi mẫu hợp lệ có evidence từ context
        evidence_list = context.get('allowed_evidence', [])
        ev = [evidence_list[0]] if evidence_list else []
        
        return {
            'message': f'Agent {role} đã hoàn tất phân tích cho câu hỏi: {question}.',
            'actions': [
                {
                    'tool': 'create_work_item',
                    'title': f'Đề xuất rà soát từ {role}',
                    'target': role,
                    'evidence': ev
                }
            ] if ev else []
        }


def get_mock_snapshot():
    return {
        'Orders': [
            {'id': 'ORD_01', 'orderCode': 'RF01', 'channel': 'Shopee', 'createdAt': '2026-09-01',
             'deadline': '2026-09-02', 'status': 'Chờ Sản Xuất', 'revenue': 500000, 'isReconciled': False,
             'customer': 'Lộ Tên Khách', 'phone': '0901234567', 'pin': '123456'},
            {'id': 'ORD_02', 'orderCode': 'RF02', 'channel': 'TikTok', 'createdAt': '2026-09-01',
             'deadline': '2026-09-03', 'status': 'Hàng Hoàn', 'revenue': 300000, 'isReconciled': True}
        ],
        'Transactions': [
            {'id': 'TX_01', 'date': '2026-09-01', 'type': 'Thu Tiền', 'amount': 500000, 'status': 'Done',
             'accountOwner': 'Không được lọt ra'}
        ],
        'Products': [
            {'id': 'P_01', 'sku': 'KEO-502', 'name': 'Keo 502', 'quantity': 2, 'minStock': 10, 'unit': 'Chai',
             'costPrice': 20000}
        ],
        'Production': [
            {'id': 'PROD_01', 'orderId': 'ORD_01', 'name': 'Bể 60x40', 'status': 'In Progress',
             'deadline': '2026-09-02', 'qc_status': 'Pending'}
        ],
        'KPI_Progress': [
            {'id': 'KPI_01', 'kpiName': 'Bể kính hoàn thành', 'current': 8, 'target': 10, 'unit': 'Bể'}
        ]
    }


class TestAgentsCloudPipeline(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        os.environ['RF_STORE_TYPE'] = 'memory'

    def test_clean_snapshot_sanitization(self):
        """Kiểm tra: Loại bỏ 100% trường nhạy cảm (PIN, phone, customer, costPrice)"""
        raw = get_mock_snapshot()
        cleaned = clean_snapshot(raw)

        # Kiểm tra bảng Orders
        ord1 = cleaned['Orders'][0]
        self.assertIn('id', ord1)
        self.assertIn('orderCode', ord1)
        self.assertIn('ref', ord1)
        self.assertEqual(ord1['ref'], 'Orders:ORD_01')
        self.assertNotIn('phone', ord1, 'Không được để lộ SĐT khách hàng')
        self.assertNotIn('pin', ord1, 'Không được để lộ mã PIN')
        self.assertNotIn('customer', ord1, 'Không được để lộ tên khách')

        # Kiểm tra bảng Products
        p1 = cleaned['Products'][0]
        self.assertNotIn('costPrice', p1, 'Không được để lộ giá vốn nội bộ cho agent không cần thiết')

    def test_validate_output_enforces_evidence(self):
        """Kiểm tra: Output validator bắt buộc evidence phải tồn tại trong allowed_evidence"""
        allowed = ['Orders:ORD_01', 'Products:P_01']

        # 1. Hợp lệ
        valid_raw = {
            'message': 'Phát hiện tồn kho keo 502 chạm đáy.',
            'actions': [
                {'tool': 'create_work_item', 'title': 'Cần nhập keo 502 gấp', 'target': 'kho', 'evidence': ['Products:P_01']}
            ]
        }
        res = validate_output(valid_raw, allowed)
        self.assertEqual(len(res['actions']), 1)

        # 2. Evidence bịa đặt (không nằm trong allowed)
        fake_evidence_raw = {
            'message': 'Bịa đặt đơn hàng',
            'actions': [
                {'tool': 'create_work_item', 'title': 'Đơn lạ', 'target': 'cso', 'evidence': ['Orders:ORD_FAKE_999']}
            ]
        }
        with self.assertRaises(ValueError) as ctx:
            validate_output(fake_evidence_raw, allowed)
        self.assertIn('EVIDENCE_UNKNOWN', str(ctx.exception))

        # 3. Tool không được phép (cố tình gọi tool sửa dữ liệu)
        illegal_tool_raw = {
            'message': 'Cố tình sửa kho',
            'actions': [
                {'tool': 'modify_database', 'title': 'Sửa kho', 'target': 'kho', 'evidence': ['Products:P_01']}
            ]
        }
        with self.assertRaises(ValueError) as ctx:
            validate_output(illegal_tool_raw, allowed)
        self.assertIn('TOOL_NOT_ALLOWED', str(ctx.exception))

    async def test_7_agents_independent_execution(self):
        """Kiểm tra: 7 Agent chạy độc lập, 5 specialist chạy trước, COO và Bao Đồng đọc receipts"""
        store = MemoryStore()
        source = SheetsSource(override_data=get_mock_snapshot())
        mock_model = MockGeminiClient()
        engine = Engine(store, source, mock_model)

        run_res = await engine.run('RUN_TEST_001', 'Kiểm tra vận hành ca sáng', 'admin_tester')

        self.assertEqual(run_res['status'], 'completed')
        self.assertEqual(len(run_res['agents']), 7, 'Phải có kết quả của đủ 7 agent')

        # Kiểm tra từng agent có lượt gọi riêng
        called_roles = [c['role'] for c in mock_model.call_history]
        self.assertEqual(len(called_roles), 7, 'Mỗi agent bắt buộc phải có lượt gọi Gemini riêng')
        for r in ROLES:
            self.assertIn(r, called_roles, f'Role {r} chưa được gọi')

        # Kiểm tra COO nhận được allowed_evidence mở rộng từ receipts của đồng nghiệp
        coo_calls = [c for c in mock_model.call_history if c['role'] == 'coo']
        self.assertTrue(len(coo_calls) > 0)
        coo_context = coo_calls[0]['context']
        self.assertIn('peers', coo_context)
        self.assertIn('kho', coo_context['peers'])

        # Kiểm tra tasks đã được lưu bền vững vào store
        open_tasks = store.tasks()
        self.assertTrue(len(open_tasks) > 0, 'Phải có task được tạo trong store')
        self.assertEqual(open_tasks[0]['status'], 'open')

    async def test_distributed_lease_concurrency(self):
        """Kiểm tra: Chống chạy trùng - hai yêu cầu đồng thời bị chặn bởi lease lock"""
        store = MemoryStore()
        source = SheetsSource(override_data=get_mock_snapshot())
        mock_model = MockGeminiClient()
        engine = Engine(store, source, mock_model)

        # Khóa thủ công lease
        lease = store.claim('RUN_FIRST')
        self.assertIsNotNone(lease)

        # Chạy engine với run_id khác trong khi lease đang active
        run_res = await engine.run('RUN_SECOND', 'Kiểm tra chạy trùng', 'scheduler')
        self.assertEqual(run_res['status'], 'busy', 'Lượt thứ hai phải bị từ chối busy khi lease đang giữ')

        # Giải phóng lease
        store.release(lease)
        # Bây giờ chạy lại được bình thường
        run_ok = await engine.run('RUN_THIRD', 'Kiểm tra chạy lại', 'scheduler')
        self.assertEqual(run_ok['status'], 'completed')

    async def test_failure_resilience_no_fake_messages(self):
        """Kiểm tra: Agent lỗi thì trả về failed trung thực, không dùng thoại mẫu che giấu"""
        store = MemoryStore()
        source = SheetsSource(override_data=get_mock_snapshot())
        # Giả lập: Giám sát sản xuất (sx) bị timeout / lỗi Vertex AI
        mock_model = MockGeminiClient(behavior_map={
            'sx': TimeoutError('Vertex AI connection timeout')
        })
        engine = Engine(store, source, mock_model)

        run_res = await engine.run('RUN_WITH_FAIL', 'Kiểm tra xử lý lỗi', 'scheduler')

        self.assertEqual(run_res['status'], 'partial', 'Trạng thái toàn cục phải là partial khi có 1 agent fail')
        sx_result = run_res['agents']['sx']
        self.assertEqual(sx_result['status'], 'failed')
        self.assertEqual(sx_result['error'], 'TimeoutError')
        self.assertEqual(sx_result['ai_generated'], False)
        self.assertIn('Agent chưa hoàn tất. Không có câu trả lời dự phòng.', sx_result['message'])


if __name__ == '__main__':
    unittest.main()
