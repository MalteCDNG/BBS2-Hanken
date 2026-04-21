from hardware.check_rpi import is_raspberrypi

if is_raspberrypi():
    import RPi.GPIO as GPIO


class Fan:
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
        if is_raspberrypi():
            GPIO.output(self.gpio, GPIO.HIGH)

    def off(self):
        self.running = False
        if is_raspberrypi():
            GPIO.output(self.gpio, GPIO.LOW)

    def toggle(self):
        if self.running:
            self.off()
        else:
            self.on()

        return self.running
