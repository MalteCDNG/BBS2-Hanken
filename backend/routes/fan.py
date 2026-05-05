from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, BackgroundTasks

import dependencies.app
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
    return FanStatus(Id=state.Id, running=state.fan_running, updatedAt=state.timestamp, override=state.fan_override)

@router.post("/toggle/")
async def fan_toggle(background_tasks: BackgroundTasks, duration: timedelta=timedelta(minutes=30)) -> FanStatus:
    """
    :param background_tasks: Autopopulated by fastapi
    :param duration: How long the fan should ignore calculated state.
        P[n]Y[n]M[n]DT[n]H[n]M[n]S -> PT2H30M: 2 hours and 30 minutes.
    :return:
    """
    # noinspection PyTypeChecker
    state = await get_state()

    new_state = State(
        timestamp=datetime.now(tz=timezone.utc),
        fan_running=not state.fan_running,
        fan_override=datetime.now(tz=timezone.utc) + duration,
    )
    await raven_db.store_object(new_state)

    fan_state = FanStatus(running=new_state.fan_running, updatedAt=new_state.timestamp, override=new_state.fan_override)

    background_tasks.add_task(hardware.util.sync_state, new_state)
    dependencies.app.update_fan_override_cron(new_state)

    await wsmanager.broadcast(new_state.model_dump_json(by_alias=True))

    return fan_state

#TODO: Endpunkt für Aufhebung des Overrides
