# Project 4: UMS - University Management System

## Overview
UMS is a full-stack university management platform that keeps student, course, and enrollment data organized.

## Features
- Course catalog and curriculum modeling
- Student profiles with enrollment history
- Secure authentication powered by JWT
- API-first backend with FastAPI and SQLModel
- Reactive frontend built with modern tooling (see `/frontend`)
- Container-friendly setup that works with Docker Compose

## Tech stack
| Layer | Tools |
| --- | --- |
| Frontend | (add framework details if applicable) |
| Backend | FastAPI, SQLModel, SQLAlchemy, Uvicorn |
| Database | PostgreSQL |
| Dev tooling | Docker, Alembic, Git, dotenv |

## Prerequisites
- Python 3.11+ and `pip`
- Node.js 18+ and `npm`
- PostgreSQL database running locally or via Docker
- `direnv`, `poetry`, or your preferred env manager to load `.env` files

## Backend setup
1. `cd backend`
2. `python -m venv venv` (if not already created)
3. `source venv/bin/activate` (macOS/Linux) or `venv\Scripts\activate` (Windows)
4. `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and adjust any database or JWT settings
6. Run migrations (see **Database migrations** below)
7. `uvicorn app.main:app --reload`
8. (Optional) `python run.py` if the convenience script is preferred

## Frontend setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open the dev server URL shown in the terminal 

## Database migrations
1. `cd backend`
2. `alembic revision --autogenerate -m "describe change"`
3. `alembic upgrade head`
4. Repeat when models change to keep the schema in sync

## Seed data
1. `cd backend`
2. `python scripts/seed_users.py`
3. The script seeds 1 admin, 1 teacher, and 1 student with hashed passwords

## Docker (optional)
- `docker-compose -f docker-compose.local.yml up --build`
- Once containers are running, the backend should expose its port, and the frontend can target it via the env-configured base URL

## Environment variables
Make sure `.env` (backend) and the frontend environment files contain the correct API base URL, database URL, and JWT secrets. Example variables:
```
DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/ums
JWT_SECRET_KEY=change-me
FRONTEND_API_URL=http://localhost:8000
```

## Help
- Run backend: `uvicorn app.main:app --reload`
- Run frontend: `npm run dev`
- Run any custom script via `python run.py` (backend)

## Author
**Ly Van Minh**
- Created on: **05/07/2025**
- Instagram: @lyvanminh_
- Zalo: 0334266636
