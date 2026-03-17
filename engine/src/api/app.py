"""
Flask Application Factory
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS
from .routes import register_routes


def _allowed_origins():
    env_origins = os.getenv("ALLOWED_ORIGINS") or os.getenv("FRONTEND_URL") or ""
    parsed = [o.strip() for o in env_origins.split(",") if o.strip()]
    if parsed:
        return parsed
    return ["http://localhost:3000", "http://localhost:5173"]


def create_app():
    app = Flask(__name__)
    CORS(app, origins=_allowed_origins())

    register_routes(app)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "service": "neuromarket-engine", "version": "2.0"})

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad Request", "message": str(e)}), 400

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

    return app
