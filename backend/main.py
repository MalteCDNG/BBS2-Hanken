from datetime import datetime

from dotenv import load_dotenv
from fastapi import WebSocket
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketDisconnect

from dependencies.app import app, crons_app, wsmanager
from dependencies.models import Reading
from hardware import dht22
from routes import readings, fan, settings, auth

load_dotenv()

auth.init()

app.include_router(readings.router, prefix="/readings")
app.include_router(fan.router, prefix="/fan")
app.include_router(settings.router, prefix="/settings")
app.include_router(auth.router, prefix="/auth")

origins = [
    "http://localhost",
    "http://localhost:5173",
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
    indoor = await dht22.get_data_indoor()
    outdoor = await dht22.get_data_outdoor()

    reading = Reading(
        timestamp=datetime.now(),
        indoorTemp=indoor[0],
        outdoorTemp=outdoor[0],
        indoorHumidity=indoor[1],
        outdoorHumidity=outdoor[1],
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
