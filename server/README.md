# khoprompt-server

FastAPI + PostgreSQL (async) backend for `client/src/data/mockPrompts.js`.

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
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Seed from `client/src/data/mockPrompts.js`

```bash
cd server
poetry run python -m app.scripts.seed_mock_prompts
```

