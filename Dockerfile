FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY index.html vite.config.ts tsconfig.json ./
COPY src ./src
ENV VITE_DATA_MODE=api
ENV VITE_API_BASE_URL=/api/v1
ENV APP_BASE_PATH=/
RUN npm run build

FROM python:3.12-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 RECLAIM_ENV=demo
WORKDIR /app
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY backend /app/backend
COPY --from=frontend-build /app/dist /app/dist
RUN useradd --system --uid 10001 --create-home reclaim \
 && mkdir -p /data/evidence \
 && chown -R reclaim:reclaim /data /app
USER reclaim
EXPOSE 8000
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
