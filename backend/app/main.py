from fastapi import FastAPI
from sqlmodel import Session
from app.core.database import init_db, engine
from app.api.main import api_router

app = FastAPI()

app.include_router(api_router, prefix="/ums/api")

