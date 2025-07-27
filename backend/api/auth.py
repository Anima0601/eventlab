from flask import Blueprint, request, jsonify
from backend.models import db
from backend.models.user import User 

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/users', methods=['GET'])
def get_user_by_username():
    username = request.args.get('username')
    if not username:
        return jsonify(message="Username parameter is required"), 400
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify(message="User not found"), 404
    return jsonify([{ 'id': user.id, 'username': user.username, 'email': user.email }]), 200


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify(message="Missing username, email, or password"), 400

    
    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify(message="User with that username or email already exists"), 409 

    new_user = User(username=username, email=email)
    new_user.set_password(password) 

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify(message="User registered successfully!"), 201 # Created
    except Exception as e:
        db.session.rollback()
        return jsonify(message=f"Error registering user: {str(e)}"), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify(message="Missing username or password"), 400

    user = User.query.filter_by(username=username).first()

    if user is None or not user.check_password(password):
        return jsonify(message="Invalid username or password"), 401 

    return jsonify(message=f"User {user.username} logged in successfully!"), 200