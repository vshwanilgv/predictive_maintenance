import paho.mqtt.client as mqtt
import random
import time
import json

BROKER = "broker.hivemq.com"  
PORT = 1883  
TOPIC = "sensor/data" 


client = mqtt.Client()

client.connect(BROKER, PORT, 60)

def generate_sensor_data():
    return {
        "pressure": round(random.uniform(150, 180), 2),
        "temperature": round(random.uniform(30, 60), 2),
        "vibration": round(random.uniform(0.5, 1.0), 2),
        "volume_flow": round(random.uniform(5, 10), 2),
        "motor_power": round(random.uniform(2000, 3000), 2),
    }

try:
    while True:
        sensor_data = generate_sensor_data()
        client.publish(TOPIC, json.dumps(sensor_data))
        print(f"Published: {sensor_data}")
        time.sleep(2)  
except KeyboardInterrupt:
    print("Simulation stopped.")
    client.disconnect()
