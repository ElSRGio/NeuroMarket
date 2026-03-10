"""
Flask Application Factory
"""
from flask import Flask, jsonify
from flask_cors import CORS
from .routes import register_routes


def create_app():
    app = Flask(__name__)
    CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])

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
