# Crypto Intraday Radar V3 Web

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend:app --host 127.0.0.1 --port 8000
```

Open http://127.0.0.1:8000

The runtime is driven by backend.py; frontend.html is included as a standalone copy of the embedded UI.

No API key is required. V3 uses FastAPI, browser WebSocket, Bybit public WebSocket, REST rate limiting, technical scoring, CVD/aggressive flow, order-book imbalance and spread.

This is a research scanner, not an automated trading system.

## PythonAnywhere

This application uses WebSocket connections for the live Binance feed and the
start/stop controls. Deploy it as an **Always-on Task** running Uvicorn; a
regular WSGI web app will serve the page but cannot provide the live scanner.

1. Upload and extract `crypto_intraday_radar_v3_web.zip` in PythonAnywhere.
2. Open a Bash console and run:

```bash
cd ~/crypto_intraday_radar_v3_web
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

3. Create an Always-on Task with this command:

```bash
cd ~/crypto_intraday_radar_v3_web && . .venv/bin/activate && uvicorn backend:app --host 0.0.0.0 --port 8000
```

Use the public URL and port assigned by your PythonAnywhere setup. If your
account does not include Always-on Tasks or WebSocket support, the live feed
cannot run there unchanged; use a VPS or another ASGI-capable host.
