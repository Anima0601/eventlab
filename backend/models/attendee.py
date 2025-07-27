from . import db 

class Attendee(db.Model):
    __tablename__ = 'attendees'

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    registration_date = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    __table_args__ = (db.UniqueConstraint('event_id', 'user_id', name='_event_user_uc'),)

    def __repr__(self):
        return f'<Attendee event_id={self.event_id}, user_id={self.user_id}>'