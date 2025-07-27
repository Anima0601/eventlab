
from flask import Blueprint, request, jsonify
from backend.models import db
from backend.models.event import Event
from backend.models.user import User
from backend.models.attendee import Attendee
from datetime import datetime, timezone
from sqlalchemy import or_ 

events_bp = Blueprint('events', __name__)


def get_current_user(request_data):
    user_id = request_data.get('user_id')
    if user_id:
        return User.query.get(user_id)
    return None

@events_bp.route('/events', methods=['GET'])
def get_events():
 
    search_query = request.args.get('q', '').strip() 
    filter_location = request.args.get('location', '').strip()

    events_query = Event.query


    if search_query:
        events_query = events_query.filter(
            or_(
                Event.title.ilike(f'%{search_query}%'), 
                Event.description.ilike(f'%{search_query}%')
            )
        )


    if filter_location:
        events_query = events_query.filter(Event.location.ilike(f'%{filter_location}%'))

    events = events_query.order_by(Event.event_date, Event.event_time).all()

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
        return jsonify({'message': 'Event not found'}), 404
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
    title = data.get('title')
    description = data.get('description')
    event_date_str = data.get('date')
    event_time_str = data.get('time')
    location = data.get('location')
    created_by_user_id = data.get('user_id')

    if not all([title, event_date_str, location, created_by_user_id]):
        return jsonify({'message': 'Missing required fields'}), 400

    try:
        event_date = datetime.strptime(event_date_str, '%Y-%m-%d').date()
        event_time = datetime.strptime(event_time_str, '%H:%M:%S').time() if event_time_str else None
    except ValueError:
        return jsonify({'message': 'Invalid date or time format. Use YYYY-MM-DD and HH:MM:SS.'}), 400

    user = User.query.get(created_by_user_id)
    if not user:
        return jsonify({'message': 'User not found or not authorized to create event'}), 403 # Changed to 403

    new_event = Event(
        title=title,
        description=description,
        event_date=event_date,
        event_time=event_time,
        location=location,
        created_by_user_id=created_by_user_id
    )
    db.session.add(new_event)
    db.session.commit()
    return jsonify({'message': 'Event created successfully', 'event_id': new_event.id}), 201

@events_bp.route('/events/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'message': 'Event not found'}), 404

    data = request.get_json()
    user_id = data.get('user_id') 

    if event.created_by_user_id != user_id:
        return jsonify({'message': 'You are not authorized to update this event'}), 403


    event.title = data.get('title', event.title)
    event.description = data.get('description', event.description)
    event.location = data.get('location', event.location)

    event_date_str = data.get('date')
    if event_date_str:
        try:
            event.event_date = datetime.strptime(event_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    event_time_str = data.get('time')
    if event_time_str is not None:
        try:
            event.event_time = datetime.strptime(event_time_str, '%H:%M:%S').time() if event_time_str else None
        except ValueError:
            return jsonify({'message': 'Invalid time format. Use HH:MM:SS.'}), 400

    event.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify({'message': 'Event updated successfully'}), 200

@events_bp.route('/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'message': 'Event not found'}), 404

    data = request.get_json()
    user_id = data.get('user_id') 

    if event.created_by_user_id != user_id:
        return jsonify({'message': 'You are not authorized to delete this event'}), 403

    db.session.delete(event)
    db.session.commit()
    return jsonify({'message': 'Event deleted successfully'}), 200


@events_bp.route('/events/<int:event_id>/attend', methods=['POST'])
def attend_event(event_id):
    data = request.get_json()
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'message': 'User ID is required'}), 400

    event = Event.query.get(event_id)
    if not event:
        return jsonify({'message': 'Event not found'}), 404

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    attendee = Attendee.query.filter_by(user_id=user_id, event_id=event_id).first()
    if attendee:
        return jsonify({'message': 'You are already attending this event'}), 409 # Conflict

    new_attendee = Attendee(user_id=user_id, event_id=event_id)
    db.session.add(new_attendee)
    db.session.commit()
    return jsonify({'message': 'Successfully registered to attend event'}), 200

@events_bp.route('/events/<int:event_id>/attendees', methods=['GET'])
def get_event_attendees(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'message': 'Event not found'}), 404

    attendees = Attendee.query.filter_by(event_id=event_id).all()
    attendee_list = []
    for attendee in attendees:
        user = User.query.get(attendee.user_id)
        if user:
            attendee_list.append({
                'user_id': user.id,
                'username': user.username,
                'email': user.email
            })
    return jsonify(attendee_list), 200