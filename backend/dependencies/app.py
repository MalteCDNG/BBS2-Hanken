from contextlib import asynccontextmanager

from beanie import init_beanie
from fastapi import FastAPI, WebSocket
from fastapi_crons import Crons, get_cron_router

import dependencies.globals
import hardware.util
from dependencies.db import database
from dependencies.models import Reading, State, Settings


@asynccontextmanager
async def lifespan(fastapi_app: FastAPI):
    await init_beanie(database=database, document_models=[Reading, State, Settings])
    db_settings = await Settings.find_all().to_list()

    if len(db_settings) == 0:
        new_settings = Settings(
            dht22_indoor_address="",
            dht22_outdoor_address="",
            data_cron="*/30 * * * *"
        )
        await new_settings.insert()
        dependencies.globals.settings = new_settings
    if len(db_settings) == 1:
        print("populating settings")
        print(db_settings[0])
        dependencies.globals.settings = db_settings[0]
    if len(db_settings) > 1:
        raise RuntimeError("Settings could not be determined. Amount Settings: "+str(len(db_settings)))

    yield
    hardware.util.shutdown()

app = FastAPI(lifespan=lifespan)
crons = Crons(app)
app.include_router(get_cron_router(), prefix="/crons")


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


wsmanager = ConnectionManager()
