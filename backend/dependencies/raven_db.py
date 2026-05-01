import os
from datetime import datetime, timezone

from ravendb import DocumentStore, CreateDatabaseOperation
from ravendb.serverwide.database_record import DatabaseRecord

from dependencies.models import Settings, State

store: DocumentStore

class TooManySettings(Exception):
    pass
class TooFewSettings(Exception):
    pass

async def init():
    global store
    urls = [os.environ["RAVEN_ADDRESS"]]
    db_name = os.environ["RAVEN_DATABASE"]

    store = DocumentStore(urls, db_name)
    store.initialize()

    database_record = DatabaseRecord(db_name)
    create_database_operation = CreateDatabaseOperation(database_record)

    with store.open_session() as session:
        try:
            store.maintenance.server.send(create_database_operation)
            print(f"Database '{database_record.database_name}' created successfully.")
        except Exception as e:
            if "already exists" in str(e):
                print(f"Database '{database_record.database_name}' already exists. Skipping creation.")
            else:
                raise e

        try:
            state = await get_state()
            print("State found", state)
        except IndexError:
            print("Creating new state")
            state = State(
                fan_running=False,
                fan_override=None,
                timestamp=datetime.now(tz=timezone.utc),
            )
            await store_object(state)

        session.save_changes()

async def get_app_settings():
    global store
    with store.open_session() as db:
        db_settings = list(
            db.advanced.document_query(object_type=Settings)
        )
        if len(db_settings) < 1:
            raise TooFewSettings()
        if len(db_settings) > 1:
            raise TooManySettings()

        db_settings = db_settings[0]

    return db_settings

async def get_create_app_settings() -> Settings:
    global store
    try:
        settings = await get_app_settings()
    except TooFewSettings:
        settings = Settings(
            dht22_indoor_address="",
            dht22_outdoor_address="",
            data_cron="*/30 * * * *",
            fan_override_duration=0,
        )
        await store_object(settings)
    except TooManySettings:
        print("Too many settings in database.")
        raise Exception("Too many settings in database.")

    return settings

async def get_state() -> State:
    with (store.open_session() as session):
        res = (
            session.query(object_type=State)
            .wait_for_non_stale_results()
            .order_by_descending("timestamp")
            .first()
        )
        print(res)
        return res

async def store_object(db_object):
    with store.open_session() as db:
        db.store(db_object)
        db.save_changes()
