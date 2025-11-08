import time
import threading
from flask import Flask
from datetime import datetime, timedelta
from config import Config
from extensions import db, cors
from models import User, MonitoredSite
from utils import check_sites_background
from routes import routes_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": "http://localhost:5174"}}, supports_credentials=True)

    # Register blueprints
    app.register_blueprint(routes_bp)

    return app


# Create app instance
app = create_app()

# Background monitoring thread
monitor_thread = threading.Thread(target=check_sites_background, args=(app,), daemon=True)
monitor_thread.start()


def cleanup_guests(app):
    """Remove guest sites older than 24 hours periodically."""
    with app.app_context():
        while True:
            cutoff = datetime.utcnow() - timedelta(hours=24)
            MonitoredSite.query.filter(
                MonitoredSite.session_id.isnot(None),
                MonitoredSite.created_at < cutoff
            ).delete()
            db.session.commit()
            time.sleep(3600)  # every hour


if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # ✅ Now safely within app context

    # Start cleanup thread
    cleanup_thread = threading.Thread(target=cleanup_guests, args=(app,), daemon=True)
    cleanup_thread.start()

    # Run Flask app
    app.run(host="0.0.0.0", port=8000, debug=True)
