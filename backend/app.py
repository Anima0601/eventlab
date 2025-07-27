from flask import Flask, jsonify, request
from flask_cors import CORS
from backend.config import Config 
from backend.models import db 
from backend.models.user import User 
from backend.models.event import Event 
from backend.models.attendee import Attendee 
from backend.api.auth import auth_bp
from backend.api.events import events_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config) 

   
    db.init_app(app) 
    CORS(app)

    with app.app_context():
        db.create_all() 
        
    app.register_blueprint(auth_bp, url_prefix='/api/auth') 
    app.register_blueprint(events_bp, url_prefix='/api') 

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)