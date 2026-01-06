import random
import time

from hardware.util import is_raspberrypi


if is_raspberrypi():
    import machine
    import adafruit_dht

class DHT:
    def __init__(self, gpio: int):
        if not is_raspberrypi():
            return

        self.sensor = adafruit_dht.DHT22(machine.Pin(gpio, machine.Pin.IN, machine.Pin.PULL_UP))

    def get_data(self):
        if not is_raspberrypi():
            return random.randint(15, 30), random.randint(60, 100)

        for i in range(10):
            try:
                temperature = self.sensor.temperature
                humidity = self.sensor.humidity
                return temperature, humidity
            except Exception as e:
                print("Warn: DHT22 Error:", e.args)
            time.sleep(1)

        raise Exception("Kommunikation mit dem DHT22 fehlgeschlagen.")
