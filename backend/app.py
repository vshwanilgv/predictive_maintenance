from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np


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

@app.route("/predict", methods=["POST"])
def predict():
    try:

        data = request.json
        inputs = np.array([[data["pressure"], data["temperature"], data["vibration"], 
                            data["volume_flow"], data["motor_power"]]])

       
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

        results = {
            "cooler_condition": cooler_condition,
            "internal_pump_leakage": internal_pump_leakage,
            "hydraulic_accumulator": hydraulic_accumulator,
            "stable_flag": machine_stability,
        }

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
