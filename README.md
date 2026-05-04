# BBS2-Hanken

BBS2-Hanken ist eine Webanwendung zur Überwachung von Innen- und Außenklima. Das Projekt sammelt Temperatur- und Luftfeuchtigkeitswerte von zwei Messstationen, berechnet die Taupunkte, zeigt aktuelle Werte und Verlaufskurven an und ermöglicht die manuelle Steuerung eines Lüfters.

## Funktionen

- Live-Übersicht für Innen- und Außenwerte
- Verlaufsgrafik mit Temperatur- und Taupunktdaten
- Berechnung des Taupunkts aus Temperatur und relativer Luftfeuchtigkeit
- Lüfterstatus und manuelles Umschalten über die Oberfläche
- Adminbereich für Messstations-URLs, Cron-Intervall und Lüfter-Override
- FastAPI-Backend mit MongoDB/Beanie, Cronjob und WebSocket-Endpunkt
- React/Vite-Frontend mit Mantine, Chart.js und optionalem Mock-Backend für lokale Entwicklung

## Projektstruktur

```text
.
├── backend/                 # FastAPI-App, Datenmodelle, Routen und Hardware-Anbindung
│   ├── dependencies/         # App-, Datenbank-, Modell- und Berechnungslogik
│   ├── hardware/             # Raspberry-Pi-/GPIO-Helfer für den Lüfter
│   ├── routes/               # API-Routen für Auth, Messwerte, Settings, Lüfter und Insert
│   ├── main.py               # Einstiegspunkt der Backend-App
│   └── requirements.txt      # Python-Abhängigkeiten
└── frontend/                # React/Vite-Frontend
    ├── src/                  # UI, Hooks und API-Service
    ├── mock-server.cjs       # Lokales Mock-Backend für Frontend-Entwicklung
    ├── package.json          # npm-Skripte und Frontend-Abhängigkeiten
    └── vite.config.ts        # Vite-Konfiguration
```

## Voraussetzungen

- Node.js und npm
- Python 3.11 oder neuer
- MongoDB-Instanz für das Backend
- Optional: Raspberry Pi mit GPIO-Zugriff für die echte Lüftersteuerung

## Backend starten

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Das Backend läuft standardmäßig unter `http://localhost:8000`. Die automatisch erzeugte FastAPI-Dokumentation ist unter `http://localhost:8000/docs` erreichbar.

### Backend-Umgebungsvariablen

Lege im Ordner `backend/` eine `.env`-Datei an oder setze die Variablen in deiner Umgebung:

```env
MONGODB_USER=mongo-user
MONGODB_PASS=mongo-password
MONGODB_ADDRESS=localhost:27017
MONGODB_DATABASE=bbs2_hanken

JWT_SECRET=change-me
JWT_ALGO=HS256

FAN_GPIO=17

HOTSPOT_ENABLED=true
HOTSPOT_SSID=BBS2-Hanken
HOTSPOT_PASSWORD=change-me-hotspot
HOTSPOT_INTERFACE=wlan0
HOTSPOT_CONNECTION_NAME=bbs2-hotspot
HOTSPOT_ADDRESS=10.42.0.1/24

MEASURE_STATION_URL_INDOOR=http://127.0.0.1:8000/get/
MEASURE_STATION_URL_OUTDOOR=http://127.0.0.1:8001/get/
MEASURE_STATION_AUTHENTICATION=secret
```

Beim Start initialisiert das Backend die MongoDB-Dokumente für Messwerte, Lüfterstatus, Einstellungen und Benutzer. Für den Login muss ein passender Benutzer in der Datenbank vorhanden sein.

Auf einem Raspberry Pi versucht das Backend beim Start zusätzlich, per `nmcli` einen WLAN-Hotspot zu aktivieren. `HOTSPOT_SSID` und `HOTSPOT_PASSWORD` steuern Name und WPA-Kennwort, `HOTSPOT_PASSWORD` muss mindestens 8 Zeichen lang sein. Mit `HOTSPOT_ADDRESS` wird die feste Adresse des Raspberry Pi im Hotspot-Netz gesetzt, standardmäßig `10.42.0.1/24`. NetworkManager übernimmt mit `ipv4.method=shared` DHCP für verbundene Geräte, sodass das Backend im Hotspot z. B. unter `http://10.42.0.1:9000` erreichbar ist. Lokal oder auf Nicht-Pi-Systemen wird der Hotspot-Start übersprungen.

## Frontend starten

```bash
cd frontend
npm install
npm run dev
```

Das Frontend nutzt standardmäßig `http://localhost:8000` als API-Basis-URL. Bei Bedarf kann die URL überschrieben werden:

```bash
VITE_API_BASE_URL=http://localhost:4000 npm run dev
```

## Entwicklung mit Mock-Backend

Für reine Frontend-Entwicklung kann das enthaltene Mock-Backend genutzt werden. Es erzeugt Beispieldaten, speichert sie lokal in SQLite und stellt dieselben Kernrouten bereit, die das Frontend verwendet.

```bash
cd frontend
npm install
npm run mock-server
```

Der Mock-Server läuft standardmäßig unter `http://localhost:4000`. Starte das Frontend danach mit:

```bash
VITE_API_BASE_URL=http://localhost:4000 npm run dev
```

Standard-Login im Mock-Backend:

```text
Benutzername: admin
Passwort: admin
```

Die Zugangsdaten können über `MOCK_ADMIN_USERNAME` und `MOCK_ADMIN_PASSWORD` angepasst werden.

## Wichtige API-Endpunkte

| Methode | Pfad | Beschreibung |
| --- | --- | --- |
| `GET` | `/readings/current/` | Aktuellster Messwert inklusive Taupunkt |
| `GET` | `/readings/history/?start=...&end=...` | Messwerte in einem Zeitraum |
| `GET` | `/readings/history/delta/?end=...&days=...` | Messwerte relativ zu einem Enddatum |
| `GET` | `/fan/` | Aktueller Lüfterstatus |
| `POST` | `/fan/toggle/` | Lüfterstatus umschalten |
| `POST` | `/auth/token/` | Login und JWT-Ausgabe |
| `GET` | `/auth/me/` | Aktueller Benutzer |
| `GET` | `/settings/` | Aktuelle App-Einstellungen |
| `POST` | `/settings/` | App-Einstellungen speichern |
| `POST` | `/insert/` | Messwert manuell einfügen |
| `WS` | `/ws/` | WebSocket-Verbindung für Broadcasts |

## Produktionshinweise

- `JWT_SECRET` sollte in produktiven Umgebungen lang, zufällig und geheim sein.
- Die MongoDB-Zugangsdaten gehören nicht ins Repository.
- Auf echter Hardware wird die Lüftersteuerung nur auf einem Raspberry Pi über `RPi.GPIO` ausgeführt.
- Das Frontend sollte gegen die öffentliche Backend-URL gebaut werden, z. B. mit `VITE_API_BASE_URL=https://api.example.org npm run build`.
