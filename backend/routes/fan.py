from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks

import hardware.fan
import hardware.util
from dependencies import raven_db
from dependencies.app import wsmanager
from dependencies.models import State, FanStatus
from dependencies.raven_db import get_state

router = APIRouter()

#fan = hardware.fan.Fan(int(os.environ["FAN_GPIO"]))

@router.get("/")
async def fan_status():
    state = await get_state()
    return FanStatus(Id=state.Id, running=state.fan_running, updatedAt=state.timestamp)

@router.post("/toggle/")
async def fan_toggle(background_tasks: BackgroundTasks) -> FanStatus:
    # noinspection PyTypeChecker
    state = await get_state()

    new_state = State(
        timestamp=datetime.now(tz=timezone.utc),
        fan_running=not state.fan_running,
        fan_override=datetime.now(tz=timezone.utc),
    )
    await raven_db.store_object(new_state)

    fan_state = FanStatus(running=new_state.fan_running, updatedAt=new_state.timestamp)

    background_tasks.add_task(hardware.util.sync_state, state)

    await wsmanager.broadcast(new_state)

    return fan_state

#TODO: Endpunkt für Aufhebung des Overrides
