# Deployment Guide

This guide covers production deployment recommendations, a sample Docker-based workflow, and operational checklist.

## Deployment targets

- Small deployments: a single VM with Gunicorn/Uvicorn workers behind Nginx.
- Containerized: Docker + docker-compose for dev; Kubernetes for production-scale deployments.
- Managed DB: use a managed Postgres service (AWS RDS, Google Cloud SQL) for backups and high availability.

## Recommended production stack

- Build a Docker image for the backend using Python 3.11.
- Use a process manager to run Uvicorn workers (e.g., `gunicorn -k uvicorn.workers.UvicornWorker -w 4 main:app`).
- Place a reverse proxy (Nginx) in front for TLS termination, gzip, and static asset caching.

## Sample Dockerfile (backend)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt
COPY backend /app
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-w", "4", "main:app", "--bind", "0.0.0.0:8000"]
```

## docker-compose (example)

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: example
      POSTGRES_DB: handwriting_db
    volumes:
      - db_data:/var/lib/postgresql/data

  backend:
    build: .
    working_dir: /app
    environment:
      - DATABASE_URL=postgresql://app:example@db:5432/handwriting_db
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - db
    ports:
      - 8000:8000

  frontend:
    build: frontend
    ports:
      - 5173:5173

volumes:
  db_data:
```

## Operational checklist before production

- Move secrets to a secrets manager (AWS Secrets Manager, GCP Secret Manager, Kubernetes secrets).
- Configure HTTPS/TLS for the frontend and backend.
- Add health checks and readiness/liveness probes.
- Configure logging aggregation and monitoring (Prometheus + Grafana, ELK stack).
- Set up automated backups for the database and test restores.

## Scaling

- Use multiple backend replicas behind a load balancer. Ensure the database can handle concurrent connections — increase pool size or use a connection proxy (pgbouncer) where necessary.

---
End of deployment guide.
