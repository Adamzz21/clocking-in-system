from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import serial
import time
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

arduino = serial.Serial('COM4', 9600, timeout=5)
time.sleep(2)

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["clocking_system"]
users_collection = db["users"]

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
            if (
                "successfully" in line.lower()
                or "not found" in line.lower()
                or "deleted" in line.lower()
            ):
                break
    return response_lines

@app.route('/enroll', methods=['POST'])
def enroll():
    data = request.get_json()
    user_id = str(data.get('id'))
    name = data.get('name')
    birthdate = data.get('birthdate')
    email = data.get('email')

    if not user_id:
        return jsonify({'error': 'Missing ID'}), 400

    arduino.write(b'1\n')
    time.sleep(0.5)
    arduino.write((user_id + '\n').encode())
    response = send_command_with_response("")

    if any("successfully" in r.lower() for r in response):
        users_collection.update_one(
            {"_id": user_id},
            {"$set": {
                "name": name,
                "birthdate": birthdate,
                "email": email
            }},
            upsert=True
        )

    return jsonify({'status': 'ok', 'messages': response})

@app.route('/delete', methods=['POST'])
def delete():
    user_id = str(request.json.get('id'))

    if not user_id:
        return jsonify({'error': 'Missing ID'}), 400

    arduino.write(b'2\n')
    time.sleep(0.5)
    arduino.write((user_id + '\n').encode())
    response = send_command_with_response("")

    if any("deleted" in r.lower() for r in response):
        users_collection.delete_one({"_id": user_id})

    return jsonify({'status': 'ok', 'messages': response})

@app.route('/search', methods=['GET'])
def search():
    arduino.write(b'3\n')
    response = send_command_with_response("")

    found_id = None
    for line in response:
        if "id" in line.lower():
            parts = line.split(':')
            if len(parts) == 2:
                found_id = parts[1].strip()
                break

    user_info = users_collection.find_one({"_id": found_id}, {"_id": 0})

    if user_info:
        user_info["scanned_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    return jsonify({
        'status': 'ok',
        'messages': response,
        'id': found_id,
        'info': user_info
    })

if __name__ == '__main__':
    app.run(debug=False)