# Project 4: UMS - University management system

## Description

---

##  Main

---

## Technologies

- **Frontend**:

- **Backend**:
    - FastAPI
    - SQLModel and SQLAlchemy
    - Uvicorn

- **Database**:
    - PostgreSQL

- **Other**:
    - Docker
    - Git
    - JWT
    - .env

---

## Help
# Run backend:
1. source venv/bin/activate (MacOS) source venv/Scripts/activate (Win) 
2. uvicorn app.main:app --reload
3. Can use: python3 run.py

# Run frontend:
1. npm run dev

## 👨‍💻 Author

**Ly Van Minh**

- Created on: **05/07/2025**
- Instagram: [@lyvanminh_]
- Zalo: 0334266636

# Update database
1. alembic revision --autogenerate -m "update subject model"
2. alembic upgrade head
