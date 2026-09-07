FROM python:3.12-slim
WORKDIR /app
COPY agents_cloud/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY agents_cloud /app/agents_cloud
USER 65532:65532
CMD ["sh", "-c", "exec uvicorn agents_cloud.app:app --host 0.0.0.0 --port ${PORT:-8080}"]
