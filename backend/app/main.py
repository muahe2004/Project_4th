from fastapi import FastAPI
from sqlmodel import Session
from app.core.database import init_db, engine
from app.api.main import api_router

app = FastAPI()

@app.on_event("startup")
def on_startup():
    with Session(engine) as session:
        init_db(session)

@app.get("/")
def read_root():
    return {"message": "Zalo: 033426636"}

app.include_router(api_router)
