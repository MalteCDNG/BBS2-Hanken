from datetime import datetime, timedelta
from typing import List

import pymongo
from fastapi import APIRouter, HTTPException, status

from dependencies.models import Reading

router = APIRouter()

@router.get("/current/")
async def current() -> Reading:
    # noinspection PyTypeChecker
    data = await Reading.find().sort([
        (Reading.timestamp, pymongo.DESCENDING)
    ]).limit(1).to_list()

    if len(data) < 1:
        raise HTTPException(
            status_code=status.HTTP_204_NO_CONTENT,
            detail="No measurement taken yet."
        )
    return data[0]

@router.get("/history/")
async def history(start: datetime, end: datetime) -> List[Reading]:
    query = {
        "timestamp": {"$gt": start, "$lt": end}
    }
    data = await Reading.find(query).sort([
        ("Reading.timestamp", pymongo.DESCENDING)
    ]).to_list()
    return data

@router.get("/history/delta/")
async def history_delta(end: datetime, days: int) -> List[Reading]:
    start = end - timedelta(days=days)
    end = end + timedelta(days=1)
    return await history(start, end)
