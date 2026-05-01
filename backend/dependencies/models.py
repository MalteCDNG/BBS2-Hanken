from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class BaseRavenDoc(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    Id: Optional[str] = Field(None)

class Reading(BaseRavenDoc):
    timestamp: datetime
    indoor_temp: float = Field(validation_alias="indoorTemp", serialization_alias="indoorTemp")
    outdoor_temp: float = Field(validation_alias="indoorTemp", serialization_alias="outdoorTemp")
    indoor_humidity: float = Field(validation_alias="indoorHumidity", serialization_alias="indoorHumidity")
    outdoor_humidity: float = Field(validation_alias="outdoorHumidity", serialization_alias="outdoorHumidity")

class ReadingWithDewPoint(Reading):
    dew_point_indoor: float = Field(validation_alias="dewPointIndoor", serialization_alias="dewPointIndoor")
    dew_point_outdoor: float = Field(validation_alias="dewPointOutdoor", serialization_alias="dewPointOutdoor")

class State(BaseRavenDoc):
    timestamp: datetime
    fan_running: bool
    fan_override: datetime | None

class FanStatus(BaseRavenDoc):
    running: bool
    updatedAt: datetime

class Settings(BaseRavenDoc):
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
