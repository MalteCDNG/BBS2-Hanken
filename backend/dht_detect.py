import hardware.dht22

for pin in range(0,20):
    print("PIN", pin, ":", end="")
    dht = hardware.dht22.DHT(pin)
    print(dht.get_data())
