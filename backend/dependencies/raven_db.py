import os

from ravendb import DocumentStore, CreateDatabaseOperation
from ravendb.serverwide.database_record import DatabaseRecord

URLS = [os.environ["RAVEN_ADDRESS"]]
DB_NAME = os.environ["RAVEN_DATABASE"]

store = DocumentStore(URLS, DB_NAME)
store.initialize()

database_record = DatabaseRecord(DB_NAME)
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

    session.save_changes()
