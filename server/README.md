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

## Seed Data

### Seed Tags (after migrations)
```bash
cd server
poetry run python -m app.scripts.seed_tags
```

### Seed Mock Prompts
```bash
cd server
poetry run python -m app.scripts.seed_mock_prompts
```


## Run API

```bash
cd server

# Bước 1: Stop & xoá volume
docker compose down -v

# Bước 2: Start lại
docker compose up -d

# Bước 3: Run server
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Reset Database (if needed)

```bash
cd server

# Drop all tables and recreate
poetry run alembic downgrade base
poetry run alembic upgrade head

# Seed data
poetry run python -m app.scripts.seed_tags
```


## Docker
```bash
(docker compose exec api poetry run alembic upgrade head)
(docker compose exec api poetry run python -m app.scripts.index_prompts)

docker compose build --no-cache api
```