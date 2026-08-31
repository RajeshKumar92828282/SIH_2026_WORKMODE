# Production Dockerfile for APIx Worker Engine Daemon
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements & install dependencies
COPY src/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/

ENV PYTHONUNBUFFERED=1
ENV TICK_INTERVAL_SECONDS=15

CMD ["python", "-m", "src.run_worker"]
