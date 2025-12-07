import os

from beanie import init_beanie
from pymongo import AsyncMongoClient

from dependencies.models import *
from routes.auth import User


async def init():
    uri = f"mongodb://{os.environ['MONGODB_USER']}:{os.environ['MONGODB_PASS']}@{os.environ['MONGODB_ADDRESS']}/?authSource=admin"
    client = AsyncMongoClient(uri)
    database = client.get_database(os.environ["MONGODB_DATABASE"])

    await init_beanie(database=database, document_models=[Reading, State, Settings, User])
