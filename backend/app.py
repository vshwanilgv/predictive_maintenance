from flask import Flask, jsonify, request
from flask_cors import CORS
import joblib
import numpy as np
import paho.mqtt.client as mqtt
import threading
import json
import pandas as pd

app = Flask(__name__)
CORS(app)

models = {
    "cooler_condition": joblib.load("models/cooler_condition_model.pkl"),
    "machine_stability": joblib.load("models/machine_stability_model.pkl"),
    "internal_pump_leakage": joblib.load("models/internal_pump_leakage_model.pkl"),
    "hydraulic_accumulator": joblib.load("models/hydraulic_accumulator_model.pkl"),
}

scalers = {
    "cooler_condition": joblib.load("models/cooler_scaler.pkl"),
    "machine_stability": joblib.load("models/stability_scaler.pkl"),
    "internal_pump_leakage": joblib.load("models/internal_pump_leakage_scaler.pkl"),
    "hydraulic_accumulator": joblib.load("models/hydraulic_scaler.pkl"),
}

encoders = {
    "cooler_condition": joblib.load("models/cooler_label_encoder.pkl"),
    "machine_stability": joblib.load("models/stability_label_encoder.pkl"),
    "internal_pump_leakage": joblib.load("models/internal_pump_leakage_label_encoder.pkl"),
    "hydraulic_accumulator": joblib.load("models/hydraulic_label_encoder.pkl"),
}

BROKER = "broker.hivemq.com"
PORT = 1883
TOPIC = "sensor/data"
latest_data = {}

def process_sensor_data(data):
    try:
        feature_names = ["pressure", "temperature", "vibration", "volume_flow", "Motor_power"]
        inputs = pd.DataFrame([[data["pressure"], data["temperature"], data["vibration"], 
                            data["volume_flow"], data["motor_power"]]],columns=feature_names)
        inputs = inputs.astype(float)
        
        cooler_condition_encoded = models["cooler_condition"].predict(scalers["cooler_condition"].transform(inputs))[0]
        machine_stability_encoded = models["machine_stability"].predict(scalers["machine_stability"].transform(inputs))[0]
        internal_pump_leakage_encoded = models["internal_pump_leakage"].predict(scalers["internal_pump_leakage"].transform(inputs))[0]
        hydraulic_accumulator_encoded = models["hydraulic_accumulator"].predict(scalers["hydraulic_accumulator"].transform(inputs))[0]

        cooler_condition = int(encoders["cooler_condition"].inverse_transform([cooler_condition_encoded])[0])
        machine_stability = int(encoders["machine_stability"].inverse_transform([machine_stability_encoded])[0])
        internal_pump_leakage = int(encoders["internal_pump_leakage"].inverse_transform([internal_pump_leakage_encoded])[0])
        hydraulic_accumulator = int(encoders["hydraulic_accumulator"].inverse_transform([hydraulic_accumulator_encoded])[0])
        
        stable_flag = int(internal_pump_leakage == 0 and hydraulic_accumulator < 150)

        global latest_data
        latest_data = {
            "sensor_data": data,
            "predictions": {
                "cooler_condition": cooler_condition,
                "machine_stability": machine_stability,
                "internal_pump_leakage": internal_pump_leakage,
                "hydraulic_accumulator": hydraulic_accumulator,
                "stable_flag": stable_flag,
            },
        }
    except Exception as e:
        print(f"Error processing sensor data: {e}")

def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT broker")
    client.subscribe(TOPIC)

def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode("utf-8")
        data = json.loads(payload)
        print(f"Received data: {data}")
        process_sensor_data(data)
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        print(f"Payload received: {msg.payload}")

def start_mqtt_client():
    client = mqtt.Client(protocol=mqtt.MQTTv311)
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(BROKER, PORT, 60)
    client.loop_forever()

@app.route("/latest", methods=["GET"])
def latest_predictions():
    return jsonify(latest_data)

@app.route("/manual", methods=["POST"])
def manual_predictions():
    try:
        data = request.json
        process_sensor_data(data)
        return jsonify(latest_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    threading.Thread(target=start_mqtt_client).start()
    app.run(debug=True)
