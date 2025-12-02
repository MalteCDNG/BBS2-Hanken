import math

# https://www.wetterochs.de/wetter/feuchte.html

def params(t):
    if t >= 0:
        a = 7.5
        b = 237.3
    else:
        a = 7.6
        b = 250.7

    return a, b

def saettigungsdampfdruck(temp):
    a, b = params(temp)

    return 6.1078 * ( 10**((a*temp) / (b+temp)) )

def dampfdruck(temp, humid):
    return (humid / 100) * saettigungsdampfdruck(temp)

def v(temp, humid):
    return math.log10(dampfdruck(temp, humid) / 6.1078)

def taupunkt(temp, humid) -> float:
    a, b = params(temp)
    return b*v(temp, humid) / (a-v(temp, humid))
