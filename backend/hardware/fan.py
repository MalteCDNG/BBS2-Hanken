from hardware.util import is_raspberrypi

if is_raspberrypi():
    import RPi.GPIO as GPIO


class DHT:
    running = True
    gpio = 0

    def __init__(self, gpio: int):
        self.gpio = gpio

        if not is_raspberrypi():
            return

        GPIO.setmode(GPIO.BCM)
        GPIO.setup(gpio, GPIO.OUT)

        if GPIO.input(gpio):
            running = True
        else:
            running = False

    def on(self):
        self.running = True
        GPIO.output(self.gpio, GPIO.HIGH)

    def off(self):
        self.running = False
        GPIO.output(self.gpio, GPIO.LOW)

    def toggle(self):
        if self.running:
            self.off()
        else:
            self.on()

        return self.running
