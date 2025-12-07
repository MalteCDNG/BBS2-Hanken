from datetime import datetime

from beanie import Document
from pydantic import BaseModel


class Reading(Document):
    timestamp: datetime
    indoorTemp: float
    outdoorTemp: float
    indoorHumidity: float
    outdoorHumidity: float

class State(Document):
    timestamp: datetime
    fan_running: bool
    fan_override: datetime | None

class FanStatus(BaseModel):
    running: bool
    updatedAt: datetime

class Settings(Document):
    """
    Einstellungen der App

    Attributes:
        dht22_indoor_address (str): Adresse der Messstation innen
        dht22_outdoor_address (str): Adresse der Messstation außen
        data_cron (str): Cronjob Zeiteinstellung fürs Abrufen der Daten, z.B. */30 * * * *
        fan_override_duration (int): Zeit in Sekunden, für die der manuelle Modus des Lüfters gültig ist.

    """
    dht22_indoor_address: str
    dht22_outdoor_address: str
    data_cron: str
    fan_override_duration: int
