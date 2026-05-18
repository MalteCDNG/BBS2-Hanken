# BBS2-Hanken

BBS2-Hanken ist eine Webanwendung zur Überwachung von Innen- und Außenklima. Das Projekt sammelt Temperatur- und Luftfeuchtigkeitswerte von zwei Messstationen, berechnet die Taupunkte, zeigt aktuelle Werte und Verlaufskurven an und ermöglicht die manuelle Steuerung eines Lüfters.

## Schnellstart mit Docker

Voraussetzung ist docker mit compose Unterstützung (getestet mit compose Plugin).

1. Repository klonen
2. `backend.env` sowie `frontend.env` im Root Verzeichnis des Repo erstellen
   1. `cp backend/.env.example backend.env`
   2. `cp frontend/.env.example frontend.env`
3. Beide env Dateien mit Werten füllen (s.h. unten)
4. Container starten mit `docker compose up -d`

Diese Vorgehensweise builded die Images für Frontend und Backend lokal und startet drei Container: Frontend, Backend, RavenDB

Das Frontend ist dann erreichbar unter `http://<IP>`

## Konfiguration

Nach dem ersten Start müssen im Frontend die URLs der Messstationen hinterlegt werden.
Außerdem sollte nach Test der Umgebung eine RavenDB Lizenz installiert werden.
Das RavenDB Studio ist unter `http://<IP>:8080` erreichbar.

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
│   ├── measure_station.py    # Kleines Skript, dass die Messstationen hostet
│   └── requirements.txt      # Python-Abhängigkeiten
└── frontend/                # React/Vite-Frontend
    ├── src/                  # UI, Hooks und API-Service
    ├── mock-server.cjs       # Lokales Mock-Backend für Frontend-Entwicklung
    ├── package.json          # npm-Skripte und Frontend-Abhängigkeiten
    └── vite.config.ts        # Vite-Konfiguration
```

## Voraussetzungen

- Docker inkl. Compose Plugin

oder

- Node.js und npm
- Python 3.11 oder neuer
- RavenDB Instanz

---
Folgende Komponenten können für den Test/Entwicklungsbetrieb weggelassen werden.
- Raspberry Pi: getestet auf Version 4 Model B
- 2x DHT22 Sensor + Verkabelung
- Lüfter (externe Stromversorgung) + Relais zur Ansteuerung
- Optional: Separater Raspberry Pi für die Messstationen innen und außen 

# Manueller Start der Dienste

## Frontend

Zuerst abhängigkeiten installieren: `npm i`

Das Frontend kann wahlweise als Development Umgebung gestartet werden mit `npm run dev` oder <br>
gebaut und manuell gehostet werden: `npm run build` &rarr; Frontend als HTML, CSS, und JS werden unter `./dist` bereitgestellt <br>
Beachten, dass Umgebungsvariablen vor dem Build gesetzt werden müssen, da der Build nicht auf `.env` zugreift.

Das Frontend ist danach unter `http://localhost` (bzw. unter der IP Adresse des Servers) erreichbar.
Standardmäßig wird die API unter `http://localhost:8000` erwartet. Die URL kannst du über eine `.env` im Projektroot überschreiben:

```env
VITE_API_BASE_URL=http://localhost:8000
```
Hier ist die Adresse anzugeben, die für die Clients erreichbar ist.

## Backend

```bash
cd backend  # Backend Ordner betreten
python3 -m venv .venv  # Python virtual environment erstellen
source .venv/bin/activate  # venv aktivieren
pip install -r requirements.txt  # Abhängigkeiten installieren
pip install -r requirements-rpi.txt  # Verpflichtend auf Raspberry Pi: Abhängigkeiten installieren
```

Das Backend läuft standardmäßig unter `http://localhost:8000`. Die automatisch erzeugte FastAPI-Dokumentation ist unter `http://localhost:8000/docs` erreichbar.

### Backend-Umgebungsvariablen

Lege im Ordner `backend/` eine `.env`-Datei an oder setze die Variablen in deiner Umgebung:

```env
# Daten des Datenbankservers
RAVEN_ADDRESS=http://127.0.0.1:8080
RAVEN_DATABASE=Deltataupunkt

# Daten für das Admin Konto
INIT_ADMIN_USER=CHANGEME
INIT_ADMIN_PASS=CHANGEME

# Zugangs Token für Messstation sowie GPIO PINs (Board Format) der DHT Sensoren.
# Werte für JoyPi vorkonfiguriert.
# Gleiche .env Datei kann für alle Messstationen und den Haupt-Pi genutzt werden.
MEASURE_STATION_AUTHENTICATION=CHANGEME
MEASURE_STATION_INDOOR_GPIO=4
MEASURE_STATION_OUTDOOR_GPIO=26

# Welcher PIN (Board Format) angesteuert wird, um das Relais des Lüfters zu schließen.
# Es wird von einer NO (normally open) Schaltung ausgegangen.
FAN_GPIO=21

HOTSPOT_ENABLED=true
HOTSPOT_SSID=BBS2-Hanken
HOTSPOT_PASSWORD=change-me-hotspot
HOTSPOT_INTERFACE=wlan0
HOTSPOT_CONNECTION_NAME=bbs2-hotspot
HOTSPOT_ADDRESS=10.42.0.1/24

# Daten zur Generierung der JWT Tokens. Sicheres Secret erzeugen und setzen!
JWT_SECRET=CHANGEME
JWT_ALGO=HS256

```

---
Nach dem Setzen der Variablen kann die App gestartet werden:

```bash
uvicorn main:app --host "0.0.0.0" --port 8000  # App mit uvicorn Server starten
```

Beim Start initialisiert das Backend die RavenDB Datenbank und legt den Admin Nutzer aus der `.env` Datei einmalig an.
Sofern ein Admin Nutzer vorhanden ist, wird dieser nicht angepasst. Nach dem ersten Start können (und sollten) die Zugangsdaten aus der `.env` Datei entfernt werden.

Auf einem Raspberry Pi versucht das Backend beim Start zusätzlich, per `nmcli` einen WLAN-Hotspot zu aktivieren. `HOTSPOT_SSID` und `HOTSPOT_PASSWORD` steuern Name und WPA-Kennwort, `HOTSPOT_PASSWORD` muss mindestens 8 Zeichen lang sein. Mit `HOTSPOT_ADDRESS` wird die feste Adresse des Raspberry Pi im Hotspot-Netz gesetzt, standardmäßig `10.42.0.1/24`. NetworkManager übernimmt mit `ipv4.method=shared` DHCP für verbundene Geräte, sodass das Backend im Hotspot z. B. unter `http://10.42.0.1:9000` erreichbar ist. Lokal oder auf Nicht-Pi-Systemen wird der Hotspot-Start übersprungen.

## Frontend starten

```bash
cd frontend
npm install
npm run dev
```

Das Frontend nutzt standardmäßig `http://localhost:8000` als API-Basis-URL. Bei Bedarf kann die URL überschrieben werden:

Direkt im Bash befehl:
```bash
VITE_API_BASE_URL=http://localhost:4000 npm run dev
```
Oder permanent in der `.env` Datei.

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
- Auf echter Hardware wird die Lüftersteuerung nur auf einem Raspberry Pi über `RPi.GPIO` ausgeführt.
- Das Frontend sollte gegen die öffentliche Backend-URL gebaut werden, z. B. mit `VITE_API_BASE_URL=https://api.example.org npm run build`.
