from contextlib import asynccontextmanager

from beanie import init_beanie
from fastapi import FastAPI, WebSocket
from fastapi_crons import Crons, get_cron_router

from dependencies.db import database
from dependencies.models import Reading


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_beanie(database=database, document_models=[Reading])
    yield
    # TODO: Add function to run on shutdown to clear hardware stuff


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
