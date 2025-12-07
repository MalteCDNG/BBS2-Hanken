import io

from dependencies.models import State


def is_raspberrypi():
    try:
        with io.open('/sys/firmware/devicetree/base/model', 'r') as m:
            if 'raspberry pi' in m.read().lower(): return True
    except Exception: pass
    return False

def sync_state(state: State):
    # TODO: implement function to sync new state to hardware
    print("Syncing state to hardware.")

def shutdown():
    # TODO: Add function to run on shutdown to clear hardware stuff
    print("Shutting down hardware")
