from flask import Blueprint, request, jsonify
from backend.models import db
from backend.models.event import Event
from backend.models.user import User
from datetime import datetime 

events_bp = Blueprint('events', __name__)

def get_current_user(request_data):

    user_id = request_data.get('user_id') 
    if user_id:
        return User.query.get(user_id)
    return None


@events_bp.route('/events', methods=['GET'])
def get_events():
    events = Event.query.all()
    events_data = []
    for event in events:
        events_data.append({
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'date': event.event_date.strftime('%Y-%m-%d'),
            'time': event.event_time.strftime('%H:%M:%S') if event.event_time else None,
            'location': event.location,
            'created_by_user_id': event.created_by_user_id,
            'created_at': event.created_at.isoformat(),
            'updated_at': event.updated_at.isoformat()
        })
    return jsonify(events_data), 200

@events_bp.route('/events/<int:event_id>', methods=['GET'])
def get_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify(message="Event not found"), 404

    event_data = {
        'id': event.id,
        'title': event.title,
        'description': event.description,
        'date': event.event_date.strftime('%Y-%m-%d'),
        'time': event.event_time.strftime('%H:%M:%S') if event.event_time else None,
        'location': event.location,
        'created_by_user_id': event.created_by_user_id,
        'created_at': event.created_at.isoformat(),
        'updated_at': event.updated_at.isoformat()
    }
    return jsonify(event_data), 200

@events_bp.route('/events', methods=['POST'])
def create_event():
    data = request.get_json()
    current_user = get_current_user(data) 

    if not current_user:
        return jsonify(message="Authentication required: Please provide a valid user_id"), 401

    title = data.get('title')
    description = data.get('description')
    event_date_str = data.get('date')
    event_time_str = data.get('time')
    location = data.get('location')

    if not title or not event_date_str:
        return jsonify(message="Title and Date are required"), 400

    try:
        event_date = datetime.strptime(event_date_str, '%Y-%m-%d').date()
        event_time = datetime.strptime(event_time_str, '%H:%M:%S').time() if event_time_str else None
    except ValueError:
        return jsonify(message="Invalid date or time format. Use YYYY-MM-DD for date and HH:MM:SS for time."), 400

    new_event = Event(
        title=title,
        description=description,
        event_date=event_date,
        event_time=event_time,
        location=location,
        created_by_user_id=current_user.id
    )

    try:
        db.session.add(new_event)
        db.session.commit()
        return jsonify(message="Event created successfully!", event_id=new_event.id), 201
    except Exception as e:
        db.session.rollback()
        return jsonify(message=f"Error creating event: {str(e)}"), 500

@events_bp.route('/events/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    data = request.get_json()
    current_user = get_current_user(data) 

    if not current_user:
        return jsonify(message="Authentication required: Please provide a valid user_id"), 401

    event = Event.query.get(event_id)
    if not event:
        return jsonify(message="Event not found"), 404


    if event.created_by_user_id != current_user.id:
        return jsonify(message="You are not authorized to update this event"), 403

   
    event.title = data.get('title', event.title)
    event.description = data.get('description', event.description)
    event_date_str = data.get('date')
    if event_date_str:
        try:
            event.event_date = datetime.strptime(event_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify(message="Invalid date format. Use YYYY-MM-DD."), 400
    event_time_str = data.get('time')
    if event_time_str:
        try:
            event.event_time = datetime.strptime(event_time_str, '%H:%M:%S').time()
        except ValueError:
            return jsonify(message="Invalid time format. Use HH:MM:SS."), 400
    event.location = data.get('location', event.location)

    try:
        db.session.commit()
        return jsonify(message="Event updated successfully!"), 200
    except Exception as e:
        db.session.rollback()
        return jsonify(message=f"Error updating event: {str(e)}"), 500


@events_bp.route('/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    data = request.get_json() 
    current_user = get_current_user(data) 

    if not current_user:
        return jsonify(message="Authentication required: Please provide a valid user_id"), 401

    event = Event.query.get(event_id)
    if not event:
        return jsonify(message="Event not found"), 404

    if event.created_by_user_id != current_user.id:
        return jsonify(message="You are not authorized to delete this event"), 403

    try:
        db.session.delete(event)
        db.session.commit()
        return jsonify(message="Event deleted successfully!"), 200
    except Exception as e:
        db.session.rollback()
        return jsonify(message=f"Error deleting event: {str(e)}"), 500

@events_bp.route('/events/<int:event_id>/attend', methods=['POST'])
def attend_event(event_id):
    data = request.get_json()
    user_id = data.get('user_id') 
    if not user_id:
        return jsonify(message="User ID is required to attend event"), 400

    user = User.query.get(user_id)
    event = Event.query.get(event_id)

    if not user:
        return jsonify(message="User not found"), 404
    if not event:
        return jsonify(message="Event not found"), 404


    if Attendee.query.filter_by(event_id=event_id, user_id=user_id).first():
        return jsonify(message="User is already attending this event"), 409

    new_attendance = Attendee(event_id=event_id, user_id=user_id)

    try:
        db.session.add(new_attendance)
        db.session.commit()
        return jsonify(message="Successfully registered for event!"), 201
    except Exception as e:
        db.session.rollback()
        return jsonify(message=f"Error registering for event: {str(e)}"), 500

@events_bp.route('/events/<int:event_id>/attendees', methods=['GET'])
def get_event_attendees(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify(message="Event not found"), 404

    attendees_data = []
    for attendance in event.attendees: 
        attendees_data.append({
            'user_id': attendance.user_id,
            'username': attendance.user_attendee.username, 
            'registration_date': attendance.registration_date.isoformat()
        })
    return jsonify(attendees_data), 200