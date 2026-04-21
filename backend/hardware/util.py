import os

from dotenv import load_dotenv

from dependencies.models import State
from hardware.check_rpi import is_raspberrypi
from hardware.fan import Fan

load_dotenv()

fan_gpio = os.getenv("FAN_GPIO")
try:
    fan_gpio = int(fan_gpio)
except ValueError:
    print("Fan GPIO must be an integer.")
    exit(1)

fan = Fan(fan_gpio)

if is_raspberrypi():
    import RPi.GPIO as GPIO

def sync_state(state: State):
    print("Syncing state to hardware.")
    if state.fan_running:
        fan.on()
    else:
        fan.off()

def shutdown():
    print("Shutting down hardware")

    if is_raspberrypi():
        GPIO.cleanup()
