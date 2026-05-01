import random
from datetime import datetime, timedelta, timezone
from typing import List

from fastapi import APIRouter, HTTPException
from starlette import status

import dependencies.calculations
import hardware.check_rpi
import hardware.util
from dependencies import raven_db
from dependencies.models import Reading, ReadingWithDewPoint

router = APIRouter()

@router.get("/current/")
async def current() -> ReadingWithDewPoint:
    with raven_db.store.open_session() as db:
        try:
            data = db.query(object_type=Reading).order_by_descending("timestamp").first()
        except IndexError:
            raise HTTPException(status_code=status.HTTP_204_NO_CONTENT)

    reading = ReadingWithDewPoint(
        dew_point_indoor=dependencies.calculations.taupunkt(data.indoor_temp, data.indoor_humidity),
        dew_point_outdoor = dependencies.calculations.taupunkt(data.outdoor_temp, data.outdoor_humidity),
        **data.__dict__,
    )

    return reading.model_dump(by_alias=True)

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
        reading = ReadingWithDewPoint(
            dew_point_indoor=dependencies.calculations.taupunkt(data.indoor_temp, data.indoor_humidity),
            dew_point_outdoor=dependencies.calculations.taupunkt(data.outdoor_temp, data.outdoor_humidity),
            **data.__dict__,
        )
        readings.append(reading.model_dump(by_alias=True))

    return readings

@router.get("/history/delta/")
async def history_delta(days: int, end: datetime=datetime.now()) -> List[ReadingWithDewPoint]:
    start = end - timedelta(days=days)
    end = end + timedelta(days=1)
    return await history(start, end)
