"""
NeuroMarket 2.0 — Python Analytics Engine
Entry point for Flask API
"""
import os
from dotenv import load_dotenv
from src.api.app import create_app

load_dotenv()

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("ENGINE_PORT", 5000))
    debug = os.getenv("NODE_ENV", "development") == "development"
    print(f"[NeuroMarket Engine] Starting on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
