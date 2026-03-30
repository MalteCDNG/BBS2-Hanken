import random
from datetime import datetime, timedelta, timezone
from typing import List

import pymongo
from fastapi import APIRouter, HTTPException, status

import dependencies.calculations
import hardware.util
from dependencies.models import Reading, ReadingWithDewPoint

router = APIRouter()

@router.get("/current/")
async def current() -> ReadingWithDewPoint:
    # noinspection PyTypeChecker
    data: list[Reading] = await Reading.find().sort([
        (Reading.timestamp, pymongo.DESCENDING)
    ]).limit(1).to_list()

    if len(data) < 1:
        raise HTTPException(
            status_code=status.HTTP_204_NO_CONTENT,
            detail="No measurement taken yet."
        )
    reading = ReadingWithDewPoint(
        dewPointIndoor=dependencies.calculations.taupunkt(data[0].indoorTemp, data[0].indoorHumidity),
        dewPointOutdoor = dependencies.calculations.taupunkt(data[0].outdoorTemp, data[0].outdoorHumidity),
        **data[0].__dict__,
    )

    return reading

@router.get("/history/")
async def history(start: datetime, end: datetime) -> List[ReadingWithDewPoint]:
    if not hardware.util.is_raspberrypi():
        new_reading = Reading(
            timestamp=datetime.now(tz=timezone.utc),
            indoorTemp=random.randint(-10, 30),
            outdoorTemp=random.randint(-10, 30),
            indoorHumidity=random.randint(1, 100),
            outdoorHumidity=random.randint(1, 100),
        )
        await Reading.insert(new_reading)

    query = {
        "timestamp": {"$gt": start, "$lt": end}
    }
    _data = await Reading.find(query).sort([
        ("Reading.timestamp", pymongo.DESCENDING)
    ]).to_list()

    readings: list[ReadingWithDewPoint] = []
    for data in _data:
        reading = ReadingWithDewPoint(
            dewPointIndoor=dependencies.calculations.taupunkt(data.indoorTemp, data.indoorHumidity),
            dewPointOutdoor=dependencies.calculations.taupunkt(data.outdoorTemp, data.outdoorHumidity),
            **data.__dict__,
        )
        readings.append(reading)

    print(len(readings))
    return readings

@router.get("/history/delta/")
async def history_delta(end: datetime, days: int) -> List[ReadingWithDewPoint]:
    start = end - timedelta(days=days)
    end = end + timedelta(days=1)
    return await history(start, end)
