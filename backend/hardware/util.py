import os

from dotenv import load_dotenv

from dependencies.models import State, FanStatus
from hardware.check_rpi import is_raspberrypi
from hardware.fan import Fan
from hardware.hotspot import ensure_hotspot_started

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

def sync_state(state: FanStatus|State):
    print("Syncing state to hardware.")
    print("State:", state.model_dump_json(by_alias=True))

    if isinstance(state, FanStatus):
        run = state.running
    elif isinstance(state, State):
        run = state.fan_running
    else:
        raise ValueError("Invalid state type")

    if not run:
        fan.on()
    else:
        fan.off()

def start_hotspot():
    return ensure_hotspot_started()

def shutdown():
    print("Shutting down hardware")

    if is_raspberrypi():
        GPIO.cleanup()
