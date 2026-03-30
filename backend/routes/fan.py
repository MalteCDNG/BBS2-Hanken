import os
from datetime import datetime, timezone

import pymongo
from fastapi import APIRouter, HTTPException, BackgroundTasks
from starlette import status

import hardware.fan
import hardware.util
from dependencies.models import State, FanStatus

router = APIRouter()

#fan = hardware.fan.Fan(int(os.environ["FAN_GPIO"]))

@router.get("/")
async def fan_status():
    # noinspection PyTypeChecker
    state = await State.find().sort([
        (State.timestamp, pymongo.DESCENDING)
    ]).limit(1).to_list()

    try:
        state = state[0]
    except IndexError:
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT, detail="No active state")

    return FanStatus(running=state.fan_running, updatedAt=state.timestamp)

@router.post("/toggle/")
async def fan_toggle(background_tasks: BackgroundTasks) -> FanStatus:
    # noinspection PyTypeChecker
    state = await State.find().sort([
        (State.timestamp, pymongo.DESCENDING)
    ]).limit(1).to_list()

    try:
        state = state[0]
        running = state.fan_running
    except IndexError:
        running = False

    new_state = State(
        timestamp=datetime.now(tz=timezone.utc),
        fan_running=not running,
        fan_override=datetime.now(tz=timezone.utc),
    )
    await new_state.insert()

    fan_state = FanStatus(running=new_state.fan_running, updatedAt=new_state.timestamp)

    background_tasks.add_task(hardware.util.sync_state, state)

    return fan_state
