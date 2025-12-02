from fastapi import FastAPI

from hardware import dht22

app = FastAPI()

@app.get("/get/")
async def temperature():
    temp_i, humid_i = await dht22.get_data_indoor()
    temp_o, humid_o = await dht22.get_data_outdoor()

    return {
        "temp": {"indoor": temp_i, "outdoor": temp_o},
        "humid": {"indoor": humid_i, "outdoor": humid_o}
    }
