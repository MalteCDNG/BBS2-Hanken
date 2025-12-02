import random
import time

from hardware.util import is_raspberrypi

if is_raspberrypi():
    import board
    import adafruit_dht
    # TODO: Create second sensor for outdoor
    sensor = adafruit_dht.DHT22(board.D4)

async def get_data_indoor():
    if not is_raspberrypi():
        return random.randint(15, 30), random.randint(60, 100)

    for i in range(10):
        try:
            temperature = sensor.temperature
            humidity = sensor.humidity
            return temperature, humidity
        except Exception as e:
            print("Warn: DHT22 Error:", e.args)
        time.sleep(1)

    raise Exception("Kommunikation mit dem DHT22 fehlgeschlagen.")

# TODO: Change function to other DHT
async def get_data_outdoor():
    if not is_raspberrypi():
        return random.randint(15, 30), random.randint(60, 100)

    for i in range(10):
        try:
            temperature = sensor.temperature
            humidity = sensor.humidity
            return temperature, humidity
        except Exception as e:
            print("Warn: DHT22 Error:", e.args)
        time.sleep(1)

    raise Exception("Kommunikation mit dem DHT22 fehlgeschlagen.")

