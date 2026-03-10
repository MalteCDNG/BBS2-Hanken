from fastapi import APIRouter

from dependencies.models import Reading

router = APIRouter()


@router.post("/")
async def insert_data(reading: Reading):
    await reading.insert()
    return "OK"
