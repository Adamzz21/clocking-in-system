import serial

try:
    ser = serial.Serial('COM4', 9600, timeout=5)
    print("✅ Successfully opened COM4")
    ser.close()
except Exception as e:
    print("❌ Failed:", e)
