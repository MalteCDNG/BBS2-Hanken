import random
from datetime import datetime, timedelta, timezone
from typing import List

from fastapi import APIRouter, HTTPException
from starlette import status

import hardware.check_rpi
from dependencies import raven_db, calculations
from dependencies.models import Reading, ReadingWithDewPoint

router = APIRouter()

@router.get("/current/")
async def current() -> ReadingWithDewPoint:
    with raven_db.store.open_session() as db:
        data = db.query(object_type=Reading).order_by_descending("timestamp").first()
        if data is None:
            raise HTTPException(status_code=status.HTTP_204_NO_CONTENT)

    reading = calculations.append_dew_points(data)
    return reading

@router.get("/history/")
async def history(start: datetime, end: datetime) -> List[ReadingWithDewPoint]:
    if not hardware.check_rpi.is_raspberrypi():
        new_reading = Reading(
            timestamp=datetime.now(tz=timezone.utc),
            indoor_temp=random.randint(-10, 30),
            outdoor_temp=random.randint(-10, 30),
            indoor_humidity=random.randint(1, 100),
            outdoor_humidity=random.randint(1, 100),
        )
        await raven_db.store_object(new_reading)

    with raven_db.store.open_session() as db:
        _data: List[Reading] = list(
            db.query(object_type=Reading)
            .where_between("timestamp", start, end)
            .order_by("timestamp")
        )

    readings: list[ReadingWithDewPoint] = []
    for data in _data:
        reading = calculations.append_dew_points(data)
        readings.append(reading.model_dump(by_alias=True))

    return readings

@router.get("/history/delta/")
async def history_delta(days: int, end: datetime=None) -> List[ReadingWithDewPoint]:
    if end is None:
        end = datetime.now()

    start = end - timedelta(days=days)
    end = end + timedelta(days=1)
    return await history(start, end)
