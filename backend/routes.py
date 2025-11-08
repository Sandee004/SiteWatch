from flask import Flask, request, jsonify, session, Blueprint
from dotenv import load_dotenv
from extensions import db
from models import User, MonitoredSite
from datetime import datetime


routes_bp = Blueprint('routes', __name__)
load_dotenv()

@routes_bp.route('/profile', methods=['POST'])
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


@routes_bp.route("/profile", methods=["GET"])
def get_profile():
    user_id = session.get("user_id")

    if user_id:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({
            "type": "registered",
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }), 200

    # If no user logged in → treat as guest
    guest_id = session.get("guest_id")
    if guest_id:
        return jsonify({
            "type": "guest",
            "username": f"Guest-{guest_id[:6]}",
            "email": None,
            "created_at": None
        }), 200

    # If even session not created → initialize one
    import uuid
    new_guest_id = str(uuid.uuid4())
    session["guest_id"] = new_guest_id
    return jsonify({
        "type": "guest",
        "username": f"Guest-{new_guest_id[:6]}",
        "email": None,
        "created_at": None
    }), 200


@routes_bp.route('/add_site', methods=['POST'])
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


@routes_bp.route('/sites', methods=['GET'])
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


@routes_bp.route("/delete_site/<int:site_id>", methods=["DELETE"])
def delete_site(site_id):
    session_id = session.get("guest_id")
    user_id = session.get("user_id")

    site = None
    if user_id:
        site = MonitoredSite.query.filter_by(id=site_id, user_id=user_id).first()
    elif session_id:
        site = MonitoredSite.query.filter_by(id=site_id, session_id=session_id).first()

    if not site:
        return jsonify({"error": "Site not found or unauthorized"}), 404

    db.session.delete(site)
    db.session.commit()
    return jsonify({"message": "Site deleted successfully"})
