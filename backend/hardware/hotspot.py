import os
import shutil
import subprocess
from dataclasses import dataclass
from ipaddress import ip_interface

from hardware.check_rpi import is_raspberrypi


TRUE_VALUES = {"1", "true", "yes", "on"}
FALSE_VALUES = {"0", "false", "no", "off"}


@dataclass(frozen=True)
class HotspotConfig:
    enabled: bool
    ssid: str
    password: str | None
    interface: str
    connection_name: str
    address: str


def ensure_hotspot_started() -> bool:
    if not is_raspberrypi():
        print("Hotspot wird nicht gestartet: kein Raspberry Pi erkannt.")
        return False

    config = _load_config()
    if not config.enabled:
        print("Hotspot ist deaktiviert.")
        return False

    if not config.ssid:
        print("Hotspot wird nicht gestartet: HOTSPOT_SSID ist leer.")
        return False

    if not config.interface:
        print("Hotspot wird nicht gestartet: HOTSPOT_INTERFACE ist leer.")
        return False

    if not config.connection_name:
        print("Hotspot wird nicht gestartet: HOTSPOT_CONNECTION_NAME ist leer.")
        return False

    if not _is_valid_address(config.address):
        print("Hotspot wird nicht gestartet: HOTSPOT_ADDRESS muss eine CIDR-Adresse sein.")
        return False

    if not config.password or len(config.password) < 8:
        print(
            "Hotspot wird nicht gestartet: "
            "HOTSPOT_PASSWORD muss mindestens 8 Zeichen haben."
        )
        return False

    if not shutil.which("nmcli"):
        print("Hotspot wird nicht gestartet: nmcli wurde nicht gefunden.")
        return False

    try:
        _ensure_connection(config)
        _run_nmcli(["connection", "up", config.connection_name])
    except subprocess.CalledProcessError as error:
        error_message = error.stderr.strip() or str(error)
        print(f"Hotspot konnte nicht gestartet werden: {error_message}")
        return False
    except subprocess.TimeoutExpired:
        print("Hotspot konnte nicht gestartet werden: nmcli Timeout.")
        return False

    print(f"Hotspot '{config.ssid}' ist gestartet.")
    return True


def _load_config() -> HotspotConfig:
    return HotspotConfig(
        enabled=_parse_bool(os.getenv("HOTSPOT_ENABLED"), default=True),
        ssid=os.getenv("HOTSPOT_SSID", "BBS2-Hanken").strip(),
        password=os.getenv("HOTSPOT_PASSWORD"),
        interface=os.getenv("HOTSPOT_INTERFACE", "wlan0").strip(),
        connection_name=os.getenv("HOTSPOT_CONNECTION_NAME", "bbs2-hotspot").strip(),
        address=os.getenv("HOTSPOT_ADDRESS", "10.42.0.1/24").strip(),
    )


def _parse_bool(value: str | None, default: bool) -> bool:
    if value is None:
        return default

    normalized = value.strip().lower()
    if normalized in TRUE_VALUES:
        return True
    if normalized in FALSE_VALUES:
        return False

    print(
        f"Ungueltiger Boolean-Wert fuer HOTSPOT_ENABLED: "
        f"'{value}'. Nutze Standardwert."
    )
    return default


def _is_valid_address(address: str) -> bool:
    try:
        ip_interface(address)
    except ValueError:
        return False

    return True


def _ensure_connection(config: HotspotConfig) -> None:
    if not _connection_exists(config.connection_name):
        _run_nmcli([
            "connection",
            "add",
            "type",
            "wifi",
            "ifname",
            config.interface,
            "con-name",
            config.connection_name,
            "autoconnect",
            "yes",
            "ssid",
            config.ssid,
        ])

    _run_nmcli([
        "connection",
        "modify",
        config.connection_name,
        "connection.autoconnect",
        "yes",
        "connection.interface-name",
        config.interface,
        "802-11-wireless.mode",
        "ap",
        "802-11-wireless.ssid",
        config.ssid,
        "802-11-wireless.band",
        "bg",
        "ipv4.method",
        "shared",
        "ipv4.addresses",
        config.address,
        "ipv6.method",
        "disabled",
        "wifi-sec.key-mgmt",
        "wpa-psk",
        "wifi-sec.psk",
        config.password,
    ])


def _connection_exists(connection_name: str) -> bool:
    result = _run_nmcli(["-g", "NAME", "connection", "show"])
    return connection_name in result.stdout.splitlines()


def _run_nmcli(args: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["nmcli", *args],
        check=True,
        capture_output=True,
        text=True,
        timeout=20,
    )
