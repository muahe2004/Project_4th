import os
import httpx
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

UNICORE_API_URL = os.getenv("UNICORE_API_URL", "http://localhost:8386")
UNIUSERS_PREFIX = os.getenv("UNIUSERS_PREFIX", "uniusers/api")

TEACHER_API_URL = f"{UNICORE_API_URL}/{UNIUSERS_PREFIX}/teachers"

def get_teacher_by_id(teacher_id: str) -> Optional[dict]:
    url = f"{TEACHER_API_URL}/{teacher_id}"
    try:
        response = httpx.get(url, timeout=5)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError:
        return None


def get_all_teachers() -> list[dict]:
    try:
        response = httpx.get(TEACHER_API_URL, timeout=5)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError:
        return []
