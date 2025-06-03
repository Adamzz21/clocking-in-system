from flask import Flask, request, jsonify
from flask_cors import CORS

import serial
import time

app = Flask(__name__)
CORS(app)
arduino = serial.Serial('COM4', 9600, timeout=5)
time.sleep(2)

def send_command_with_response(cmd):
    arduino.reset_input_buffer()
    arduino.write((cmd + '\n').encode())
    response_lines = []

    timeout_start = time.time()
    while time.time() < timeout_start + 10:
        if arduino.in_waiting:
            line = arduino.readline().decode().strip()
            print("Arduino:", line)
            response_lines.append(line)
            if "successfully" in line.lower() or "not found" in line.lower() or "deleted" in line.lower():
                break
    return response_lines

@app.route('/enroll', methods=['POST'])
def enroll():
    user_id = request.json.get('id')
    if user_id is None:
        return jsonify({'error': 'Missing ID'}), 400

    arduino.write(b'1\n')
    time.sleep(0.5)
    arduino.write((str(user_id) + '\n').encode())
    response = send_command_with_response("")

    return jsonify({'status': 'ok', 'messages': response})

@app.route('/delete', methods=['POST'])
def delete():
    user_id = request.json.get('id')
    if user_id is None:
        return jsonify({'error': 'Missing ID'}), 400

    arduino.write(b'2\n')
    time.sleep(0.5)
    arduino.write((str(user_id) + '\n').encode())
    response = send_command_with_response("")

    return jsonify({'status': 'ok', 'messages': response})

@app.route('/search', methods=['GET'])
def search():
    arduino.write(b'3\n')
    response = send_command_with_response("")
    return jsonify({'status': 'ok', 'messages': response})

if __name__ == '__main__':
    app.run(debug=False)
