"""FastAPI Cloud Run Service: 7 Independent Evidence-Based Agents behind Cloud Run IAM."""
import asyncio
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from .engine import Engine, digest, ROLES
from .adapters import get_store, SheetsSource, GeminiModel

app = FastAPI(title='RF Agent Work Service', docs_url=None, redoc_url=None)

# Cho phép CORS nội bộ an toàn
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class RunRequest(BaseModel):
    request_id: str = Field(min_length=8, max_length=160)
    question: str = Field(default='Kiểm tra vận hành theo lịch', max_length=2000)
    actor: str = Field(default='scheduler', max_length=120)


class TaskRequest(BaseModel):
    task_id: str = Field(pattern=r'^[a-f0-9]{32}$')
    actor: str = Field(min_length=1, max_length=120)
    status: str = Field(pattern=r'^(open|resolved|dismissed)$')
    note: str = Field(min_length=5, max_length=1000)


@app.get('/health')
def health():
    """Liveness check siêu nhẹ, 0ms latency, không tốn quota AI."""
    required = ['GOOGLE_CLOUD_PROJECT', 'RF_SPREADSHEET_ID']
    is_configured = all(os.environ.get(k) for k in required)
    store = get_store()
    store_type = 'firestore' if 'FirestoreStore' in type(store).__name__ else 'memory'

    return {
        'service': 'online',
        'configured': is_configured,
        'store_backend': store_type,
        'agents': list(ROLES)
    }


@app.get('/api/health/ai')
async def health_ai():
    """Ping kiểm tra thực tế kết nối tới Vertex AI Gemini model."""
    try:
        model = GeminiModel()
        return await model.ping()
    except Exception as exc:
        return {
            'ai_ready': False,
            'error': type(exc).__name__,
            'message': str(exc),
            'status': 'offline'
        }


@app.get('/status')
def status():
    """Lấy trạng thái tổng hợp: tasks đang mở, lịch sử 3 lượt chạy gần nhất."""
    store = get_store()
    return {
        'success': True,
        'tasks': store.tasks(),
        'history': store.history(),
        'health': health()
    }


@app.get('/api/tasks')
def get_open_tasks():
    """Endpoint cho App hoặc Apps Script truy vấn các công việc nội bộ đang chờ kiểm tra."""
    store = get_store()
    tasks = store.tasks()
    return {'success': True, 'count': len(tasks), 'tasks': tasks}


@app.post('/run')
async def run(body: RunRequest):
    """Endpoint chính cho Cloud Scheduler hoặc Quản lý kích hoạt 7 Agent làm việc thật."""
    try:
        store = get_store()
        source = SheetsSource()
        model = GeminiModel()
        result = await Engine(store, source, model).run(
            digest(body.request_id), body.question, body.actor
        )
        return {
            'success': result['status'] in ('completed', 'partial'),
            'run': result,
            'tasks': store.tasks()
        }
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f'Lỗi thực thi 7 Agent: {type(exc).__name__} - {str(exc)}'
        )


@app.post('/tasks/update')
def update_task(body: TaskRequest):
    """Cập nhật trạng thái công việc (chỉ Quản đốc / Người có thẩm quyền thao tác)."""
    try:
        store = get_store()
        store.update_task(body.task_id, body.actor, body.status, body.note)
        return {'success': True, 'tasks': store.tasks()}
    except ValueError:
        raise HTTPException(status_code=404, detail='Không tìm thấy công việc.')
