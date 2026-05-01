from fastapi import APIRouter

from dependencies import raven_db
from dependencies.models import Reading

router = APIRouter()


@router.post("/")
async def insert_data(reading: Reading):
    await raven_db.store_object(reading)
    return "OK"
