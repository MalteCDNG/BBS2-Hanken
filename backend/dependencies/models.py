from datetime import datetime

from beanie import Document


class Reading(Document):
    timestamp: datetime
    indoorTemp: float
    outdoorTemp: float
    indoorHumidity: float
    outdoorHumidity: float

class State(Document):
    fan_running: bool
