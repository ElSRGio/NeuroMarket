FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 10000

# Render inyecta $PORT; fallback a 10000
CMD gunicorn --bind 0.0.0.0:${PORT:-10000} --workers 1 --timeout 120 main:app
