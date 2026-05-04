import os
from contextlib import asynccontextmanager
from datetime import datetime

from croniter import croniter
from fastapi import FastAPI, WebSocket
from fastapi_crons import Crons, get_cron_router

import dependencies.globals
import hardware.util
from dependencies import raven_db
from dependencies.models import State
from routes import auth
from routes.auth import User


async def update_get_data_cron():
    get_data_job = crons_app.get_job("get-data")
    get_data_job.expr = dependencies.globals.settings.data_cron
    get_data_job._cron_iter = croniter(get_data_job.expr, datetime.now())
    get_data_job.update_next_run()
    await crons_app.stop()
    await crons_app.start()

async def update_fan_override_cron(state: State):
    fan_override_job = crons_app.get_job("fan-override")

    if state.fan_override:
        expression = state.fan_override.strftime('%M %H %d %m %w')
    else:
        expression = "* * * * *"

    fan_override_job.expr = expression
    fan_override_job._cron_iter = croniter(fan_override_job.expr, datetime.now())
    fan_override_job.update_next_run()

@asynccontextmanager
async def lifespan(fastapi_app: FastAPI):
    await raven_db.init()
    db_settings = await raven_db.get_create_app_settings()
    print("populating settings")
    print(db_settings)
    dependencies.globals.settings = db_settings

    hardware.util.start_hotspot()

    await update_get_data_cron()

    with raven_db.store.open_session() as session:
        amount_users = session.query(object_type=User).count()
        if amount_users == 0:
            await raven_db.add_user(
                os.environ.get("INIT_ADMIN_USER"),
                auth.password_hash.hash(os.environ.get("INIT_ADMIN_PASS")),
                "Default User",
                "",
            )

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
