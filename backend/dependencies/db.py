import os

from pymongo import AsyncMongoClient

uri = f"mongodb://{os.environ['MONGODB_USER']}:{os.environ['MONGODB_PASS']}@{os.environ['MONGODB_ADDRESS']}/?authSource=admin"
client = AsyncMongoClient(uri)

database = client.get_database(os.environ["MONGODB_DATABASE"])
