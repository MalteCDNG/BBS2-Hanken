import os
from datetime import datetime, timezone, timedelta

import requests
from dotenv import load_dotenv
from fastapi import WebSocket
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketDisconnect

import hardware
from dependencies import raven_db, calculations
from dependencies.app import app, crons_app, wsmanager, update_fan_override_cron
from dependencies.models import Reading, State, ReadingWithDewPoint
from routes import readings, fan, settings, auth, insert

load_dotenv()

auth.init()

app.include_router(readings.router, prefix="/readings")
app.include_router(fan.router, prefix="/fan")
app.include_router(settings.router, prefix="/settings")
app.include_router(auth.router, prefix="/auth")
app.include_router(insert.router, prefix="/insert")

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"Hello": "World"}

async def generate_fan_state(reading: ReadingWithDewPoint):
    run_fan = calculations.should_fan_run(reading.dew_point_indoor,
                                          reading.dew_point_outdoor)

    new_state = State(
        timestamp=datetime.now(tz=timezone.utc),
        fan_running=run_fan,
        fan_override=None,
    )
    await raven_db.store_object(new_state)
    hardware.util.sync_state(new_state)
    await update_fan_override_cron(new_state)

@crons_app.cron("*/30 * * * *", name="get-data")
async def get_data_cron():
    print("Daten werden geholt")

    db_settings = await raven_db.get_app_settings()

    indoor = requests.get(db_settings.dht22_indoor_address+"?auth="+os.environ["MEASURE_STATION_AUTHENTICATION"]).json()
    outdoor = requests.get(db_settings.dht22_outdoor_address+"?auth="+os.environ["MEASURE_STATION_AUTHENTICATION"]).json()

    reading = Reading(
        timestamp=datetime.now(tz=timezone.utc),
        indoor_temp=indoor["temp"],
        outdoor_temp=outdoor["temp"],
        indoor_humidity=indoor["humid"],
        outdoor_humidity=outdoor["humid"],
    )
    await raven_db.store_object(reading)

    state = await raven_db.get_state()
    if state.fan_override is None or not state.fan_override:
        reading_with_dew_point = calculations.append_dew_points(reading)
        await generate_fan_state(reading_with_dew_point)

@crons_app.cron("* * * * *", name="fan-override")
async def fan_override_cron():
    state = await raven_db.get_state()
    if state.fan_override is None:
        return
    if state.fan_override.timestamp() < (datetime.now(tz=timezone.utc) + timedelta(seconds=10)).timestamp():
        current = await readings.current()
        await generate_fan_state(current)

@app.websocket("/ws/")
async def websocket_endpoint(websocket: WebSocket):
    await wsmanager.connect(websocket)
    while True:
        try:
            await websocket.receive()
        except WebSocketDisconnect:
            wsmanager.disconnect(websocket)
