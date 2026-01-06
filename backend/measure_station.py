import os
import sys

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from starlette import status

from hardware import dht22

load_dotenv()

if sys.argv[1] == "INDOOR":
    gpio = os.environ["MEASURE_STATION_INDOOR_GPIO"]
elif sys.argv[1] == "OUTDOOR":
    gpio = os.environ["MEASURE_STATION_OUTDOOR_GPIO"]
else:
    print("First command line argument must be INDOOR or OUTDOOR")
    exit(1)

try:
    gpio = int(gpio)
except:
    print("GPIO must be an integer")
    exit(1)

app = FastAPI()

@app.get("/get/")
async def temperature(auth: str):
    if auth != os.environ["MEASURE_STATION_AUTHENTICATION"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    temp, humid = await dht22.DHT(gpio).get_data()

    return {
        "temp": temp,
        "humid": humid
    }
