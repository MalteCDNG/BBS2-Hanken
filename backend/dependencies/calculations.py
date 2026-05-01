import math

from dependencies.models import Reading, ReadingWithDewPoint


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
    try:
        return math.log10(dampfdruck(temp, humid) / 6.1078)
    except ValueError:
        print(temp, humid)
        raise ValueError

def taupunkt(temp, humid) -> float:
    a, b = params(temp)
    res = b*v(temp, humid) / (a-v(temp, humid))
    return round(res, 2)

def append_dew_points(data: Reading) -> ReadingWithDewPoint:
    reading_with_dewpoint = ReadingWithDewPoint(
        dew_point_indoor=taupunkt(data.indoor_temp, data.indoor_humidity),
        dew_point_outdoor=taupunkt(data.outdoor_temp, data.outdoor_humidity),
        **data.__dict__,
    )
    return reading_with_dewpoint

def should_fan_run(indoor_taupunkt, outdoor_taupunkt):
    return indoor_taupunkt > outdoor_taupunkt
