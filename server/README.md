# khoprompt-server
## Requirements

- Python 3.11+
- PostgreSQL 16+
- Poetry

## Setup

```bash
cd server
poetry install
cp .env.example .env
```

## Migrations

```bash
cd server
poetry run alembic upgrade head
```

## Run API

```bash
cd server

Bước 1: Stop & xoá volume
docker compose down -v

Bước 2: Start lại
docker compose up -d

poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Seed from `client/src/data/mockPrompts.js`

```bash
cd server
poetry run python -m app.scripts.seed_mock_prompts
```
