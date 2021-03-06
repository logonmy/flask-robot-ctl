from threading import Lock

from flask import Flask, session, request
from flask_socketio import SocketIO, emit, join_room, rooms, leave_room, close_room, disconnect

from robot_ctl import model, api, login_manager
from robot_ctl.page import robot_blueprint

thread = None
thread_lock = Lock()

app = Flask(__name__)


app.config['ALLOWED_EXTENSIONS'] = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])
app.config['UPLOAD_PATH'] = 'upload'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://tester:1234@localhost:3306/robot_ctl'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['UPLOADS_DEFAULT_DEST'] = app.config['UPLOAD_PATH']
app.config['UPLOADS_DEFAULT_URL'] = 'http://127.0.0.1:9000/'

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.secret_key = 'aHR0cDovL3d3dy53YW5kYS5jbi8='

app.register_blueprint(robot_blueprint, static_folder='static')

app.config['SECRET_KEY'] = 'secret!'

model.init_app(app)

api.init_api(app)

login_manager.init_app(app)

socketio = SocketIO(app)


@socketio.on('my_event', namespace='/test')
def test_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': message['data'], 'count': session['receive_count']})


@socketio.on('my_broadcast_event', namespace='/test')
def test_broadcast_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': message['data'], 'count': session['receive_count']},
         broadcast=True)


@socketio.on('join', namespace='/test')
def join(message):
    join_room(message['room'])
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': 'In rooms: ' + ', '.join(rooms()),
          'count': session['receive_count']})


@socketio.on('leave', namespace='/test')
def leave(message):
    leave_room(message['room'])
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': 'In rooms: ' + ', '.join(rooms()),
          'count': session['receive_count']})


@socketio.on('close_room', namespace='/test')
def close(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response', {'data': 'Room ' + message['room'] + ' is closing.',
                         'count': session['receive_count']},
         room=message['room'])
    close_room(message['room'])


@socketio.on('my_room_event', namespace='/test')
def send_room_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': message['data'], 'count': session['receive_count']},
         room=message['room'])


@socketio.on('disconnect_request', namespace='/test')
def disconnect_request():
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': 'Disconnected!', 'count': session['receive_count']})
    disconnect()


@socketio.on('my_ping', namespace='/test')
def ping_pong():
    emit('my_pong')


@socketio.on('connect', namespace='/test')
def test_connect():
    global thread
    print('Client connected', request.sid)
    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(target=background_thread)
    emit('my_response', {'data': 'Connected', 'count': 0})


@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected', request.sid)


def background_thread():
    """Example of how to send server generated events to clients."""
    count = 0
    while True:
        socketio.sleep(10)
        count += 1
        socketio.emit('my_response',
                      {'data': 'Server generated event', 'count': count},
                      namespace='/test')


if __name__ == '__main__':
    socketio.run(app, port=9000, host='0.0.0.0')
