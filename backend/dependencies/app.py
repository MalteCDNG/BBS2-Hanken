from contextlib import asynccontextmanager
from datetime import datetime

from croniter import croniter
from fastapi import FastAPI, WebSocket
from fastapi_crons import Crons, get_cron_router

import dependencies.globals
import hardware.util
from dependencies import raven_db


async def update_get_data_cron():
    get_data_job = crons_app.get_job("get-data")
    get_data_job.expr = dependencies.globals.settings.data_cron
    get_data_job._cron_iter = croniter(get_data_job.expr, datetime.now())
    get_data_job.update_next_run()
    await crons_app.stop()
    await crons_app.start()

@asynccontextmanager
async def lifespan(fastapi_app: FastAPI):
    await raven_db.init()
    db_settings = await raven_db.get_create_app_settings()
    print("populating settings")
    print(db_settings)
    dependencies.globals.settings = db_settings

    await update_get_data_cron()

    yield
    hardware.util.shutdown()

app = FastAPI(lifespan=lifespan)
crons_app = Crons(app)
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
