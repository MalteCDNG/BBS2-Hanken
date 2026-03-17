import os
from datetime import datetime

import requests
from dotenv import load_dotenv
from fastapi import WebSocket
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketDisconnect

from dependencies.app import app, crons_app, wsmanager
from dependencies.models import Reading
from hardware import dht22
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

@crons_app.cron("*/30 * * * *", name="get-data")
async def get_data_cron():
    print("Daten werden geholt")

    indoor = requests.get(os.environ["MEASURE_STATION_URL_INDOOR"]+"?auth="+os.environ["MEASURE_STATION_AUTHENTICATION"]).json()
    outdoor = requests.get(os.environ["MEASURE_STATION_URL_OUTDOOR"]+"?auth="+os.environ["MEASURE_STATION_AUTHENTICATION"]).json()

    reading = Reading(
        timestamp=datetime.now(),
        indoorTemp=indoor["temp"],
        outdoorTemp=outdoor["temp"],
        indoorHumidity=indoor["humid"],
        outdoorHumidity=outdoor["humid"],
    )
    await reading.insert()

@app.websocket("/ws/")
async def websocket_endpoint(websocket: WebSocket):
    await wsmanager.connect(websocket)
    while True:
        try:
            await websocket.receive()
        except WebSocketDisconnect:
            wsmanager.disconnect(websocket)
