"""Seven independent Gemini workers; only audited internal work items are writable.

No network or production I/O at import time. Adapters supply source, model and store.
"""
import asyncio
import hashlib
import json
from datetime import datetime, timezone

ROLES = {
    'cso': ('Chiến lược', ['Orders'], 'Phân tích cơ cấu đơn và ưu tiên kinh doanh từ dữ liệu có thật.'),
    'cfo': ('Tài chính', ['Orders', 'Transactions'], 'Rà soát số liệu thu chi; không chuyển tiền, duyệt thưởng hay hạch toán.'),
    'kho': ('Thủ kho AI', ['Products'], 'Rà soát tồn dưới định mức và tạo việc kiểm tra bổ sung vật tư.'),
    'sx': ('Giám sát sản xuất', ['Production'], 'Rà soát hạn sản xuất và trạng thái QC; không tuyên bố đã xem ảnh.'),
    'hr': ('HR', ['KPI_Progress'], 'Rà soát độ đầy đủ dữ liệu KPI. Không xếp hạng con người, quyết định lương, thưởng hoặc phạt.'),
    'coo': ('Vận hành', ['Orders', 'Production'], 'Đọc kết quả đồng nghiệp, điều phối việc và nêu điểm còn thiếu.'),
    'baodong': ('Điều phối trao đổi', [], 'Tổng hợp kết quả đồng nghiệp thành bản tin nội bộ, câu hỏi cần trả lời và bàn giao. Không gửi ra bên ngoài.'),
}
FIELDS = {
    'Orders': ['id', 'orderCode', 'channel', 'createdAt', 'deadline', 'status', 'revenue', 'isReconciled'],
    'Transactions': ['id', 'date', 'type', 'amount', 'status'],
    'Products': ['id', 'sku', 'name', 'quantity', 'minStock', 'unit'],
    'Production': ['id', 'orderId', 'name', 'status', 'deadline', 'qc_status'],
    'KPI_Progress': ['id', 'kpiName', 'current', 'target', 'unit'],
}


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:32]


def utcnow():
    return datetime.now(timezone.utc).isoformat()


def clean_snapshot(tables):
    """Fail closed on missing/ambiguous IDs. Whitelist excludes PINs and contact data."""
    result = {}
    for table, fields in FIELDS.items():
        rows = tables.get(table)
        if not isinstance(rows, list):
            raise ValueError('SOURCE_MISSING:' + table)
        seen = set()
        result[table] = []
        for raw in rows:
            row = {key: raw[key] for key in fields if key in raw}
            identity = str(row.get('id', '')).strip()
            if not identity or identity in seen:
                raise ValueError('SOURCE_ID_INVALID:' + table)
            seen.add(identity)
            row['ref'] = table + ':' + identity
            result[table].append(row)
    return result


def validate_output(raw, allowed_refs):
    """Untrusted model output cannot choose arbitrary tools, recipients or write targets."""
    if not isinstance(raw, dict):
        raise ValueError('MODEL_SCHEMA')
    message = raw.get('message')
    if not isinstance(message, str) or not message.strip() or len(message) > 4000:
        raise ValueError('MODEL_MESSAGE')
    tools = raw.get('actions', [])
    if not isinstance(tools, list) or len(tools) > 6:
        raise ValueError('MODEL_ACTIONS')
    checked = []
    for action in tools:
        if not isinstance(action, dict) or action.get('tool') not in ('create_work_item', 'handoff'):
            raise ValueError('TOOL_NOT_ALLOWED')
        refs = action.get('evidence', [])
        if not isinstance(refs, list) or not refs or len(refs) > 8:
            raise ValueError('EVIDENCE_REQUIRED')
        if any(not isinstance(ref, str) or ref not in allowed_refs for ref in refs):
            raise ValueError('EVIDENCE_UNKNOWN')
        title = action.get('title', '')
        if not isinstance(title, str) or not title.strip() or len(title) > 300:
            raise ValueError('ACTION_TITLE')
        target = action.get('target', '')
        if target not in ROLES:
            raise ValueError('HANDOFF_TARGET')
        checked.append({'tool': action['tool'], 'title': title, 'target': target,
                        'evidence': sorted(set(refs))})
    return {'message': message, 'actions': checked}


class Engine:
    def __init__(self, store, source, model):
        self.store, self.source, self.model = store, source, model

    async def run(self, run_id, question='Kiểm tra vận hành theo lịch', actor='scheduler'):
        # Durable global lease prevents concurrent schedules and chat from duplicating work.
        lease = self.store.claim(run_id)
        if not lease:
            return self.store.get_run(run_id) or {'status': 'busy', 'message': 'Một lượt khác đang chạy.'}
        run = {'id': run_id, 'started_at': utcnow(), 'status': 'running', 'actor': actor,
               'question': question, 'agents': {}, 'source_at': None}
        try:
            snapshot = clean_snapshot(await asyncio.to_thread(self.source.read))
            run['source_at'] = utcnow()
            # No silent trimming: reject oversized context so absence is never interpreted as zero.
            if len(json.dumps(snapshot, ensure_ascii=False).encode()) > 450000:
                raise ValueError('SOURCE_TOO_LARGE')
            run['source_counts'] = {k: len(v) for k, v in snapshot.items()}
            self.store.save_run(run)
            open_tasks = self.store.tasks()
            history = self.store.history()

            async def work(role):
                peers = {k: {'status': v['status'], 'message': v.get('message'),
                             'receipts': v.get('receipts', [])} for k, v in run['agents'].items()}
                rows = [row for table in ROLES[role][1] for row in snapshot[table]]
                # Coordinators can reference evidence attached to successful peer tool receipts.
                refs = {r['ref'] for r in rows}
                if role in ('coo', 'baodong'):
                    for peer in peers.values():
                        for receipt in peer['receipts']:
                            refs.update(receipt.get('evidence', []))
                context = {'source_at': run['source_at'], 'rows': rows, 'peers': peers,
                           'open_work': open_tasks, 'recent_conversation': history,
                           'allowed_evidence': sorted(refs)}
                started = utcnow()
                try:
                    raw = await asyncio.wait_for(self.model.analyze(role, question, context), timeout=50)
                    output = validate_output(raw, refs)
                    receipts = []
                    for action in output['actions']:
                        receipts.append(self.store.execute(run_id, role, action, run['source_at']))
                    result = {'status': 'completed', 'message': output['message'], 'receipts': receipts,
                              'started_at': started, 'finished_at': utcnow(), 'ai_generated': True}
                except Exception as exc:
                    # Never expose provider response bodies, credentials or raw exception text.
                    result = {'status': 'failed', 'error': type(exc).__name__,
                              'message': 'Agent chưa hoàn tất. Không có câu trả lời dự phòng.',
                              'started_at': started, 'finished_at': utcnow(), 'ai_generated': False}
                run['agents'][role] = result
                self.store.save_run(run)

            # Each specialist performs its own inference. COO and communications read real receipts.
            await asyncio.gather(*(work(role) for role in ('cso', 'cfo', 'kho', 'sx', 'hr')))
            await work('coo')
            await work('baodong')
            failed = sum(a['status'] == 'failed' for a in run['agents'].values())
            run['status'] = 'completed' if not failed else ('failed' if failed == 7 else 'partial')
        except Exception as exc:
            run['status'] = 'failed'
            run['error'] = type(exc).__name__
            run['message'] = 'Không đọc được đầy đủ dữ liệu nguồn hoặc lưu kết quả. Chưa thể kết luận.'
        finally:
            run['finished_at'] = utcnow()
            self.store.save_run(run)
            self.store.release(lease)
        return run
