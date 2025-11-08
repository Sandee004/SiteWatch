import time
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from models import db, User, MonitoredSite
from utils import check_sites_background

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'replace_with_a_secret_key'
db.init_app(app)

# For session-based guest tracking
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)

with app.app_context():
    db.create_all()

# Start background monitoring thread
import threading
monitor_thread = threading.Thread(target=check_sites_background, args=(app,), daemon=True)
monitor_thread.start()


def cleanup_guests(app):
    with app.app_context():
        while True:
            cutoff = datetime.utcnow() - timedelta(hours=24)
            MonitoredSite.query.filter(MonitoredSite.session_id != None, MonitoredSite.created_at < cutoff).delete()
            db.session.commit()
            time.sleep(3600)  # run cleanup every hour


@app.route('/profile', methods=['POST'])
def save_profile():
    data = request.json
    username = data.get('username')
    email = data.get('email')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(username=username, email=email)
        db.session.add(user)
    else:
        user.username = username

    db.session.commit()
    return jsonify({'message': 'Profile saved', 'user_id': user.id})


@app.route('/add_site', methods=['POST'])
def add_site():
    data = request.json
    url = data.get('url')
    user_id = data.get('user_id')  # Optional for registered users

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    # For guests, create session_id
    if 'guest_id' not in session:
        session['guest_id'] = str(datetime.utcnow().timestamp())

    session_id = session.get('guest_id')

    site = MonitoredSite(
        url=url,
        user_id=user_id if user_id else None,
        session_id=None if user_id else session_id
    )
    db.session.add(site)
    db.session.commit()

    return jsonify({'message': 'Site added', 'site_id': site.id})


@app.route('/sites', methods=['GET'])
def get_sites():
    user_id = request.args.get('user_id')
    if user_id:
        sites = MonitoredSite.query.filter_by(user_id=user_id).all()
    else:
        session_id = session.get('guest_id')
        sites = MonitoredSite.query.filter_by(session_id=session_id).all()

    result = []
    for s in sites:
        result.append({
            'id': s.id,
            'url': s.url,
            'last_status': s.last_status,
            'last_checked': s.last_checked.isoformat() if s.last_checked else None
        })
    return jsonify(result)


if __name__ == "__main__":
    # Start cleanup thread for guest sessions
    cleanup_thread = threading.Thread(target=cleanup_guests, args=(app,), daemon=True)
    cleanup_thread.start()

    # Run Flask app
    app.run(host="0.0.0.0", port=8000, debug=True)
