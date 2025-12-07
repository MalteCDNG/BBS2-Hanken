import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from starlette import status

from hardware import dht22

load_dotenv()

app = FastAPI()

@app.get("/get/")
async def temperature(auth: str):
    if auth != os.environ["MEASURE_STATION_AUTHENTICATION"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    temp_i, humid_i = await dht22.get_data_indoor()
    temp_o, humid_o = await dht22.get_data_outdoor()

    return {
        "temp": {"indoor": temp_i, "outdoor": temp_o},
        "humid": {"indoor": humid_i, "outdoor": humid_o}
    }
