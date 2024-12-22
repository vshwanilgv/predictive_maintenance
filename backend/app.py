from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Load models and preprocessing tools using joblib
models = {
    "cooler_condition": joblib.load("models/cooler_condition_model.pkl"),
    "valve_condition": joblib.load("models/machine_stability_model.pkl"),
    "internal_pump_leakage": joblib.load("models/internal_pump_leakage_model.pkl"),
    "hydraulic_accumulator": joblib.load("models/hydraulic_accumulator_model.pkl"),
}
scaler = joblib.load("models/scaler.pkl")  # Load the same scaler used during training
label_encoder = joblib.load("models/label_encoder.pkl")  # Ensure correct label encoding

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Extract input data from JSON
        data = request.json
        inputs = np.array([[data["pressure"], data["temperature"], data["vibration"], 
                            data["volume_flow"], data["motor_power"]]])

        # Ensure the inputs are converted to floats
        inputs = inputs.astype(float)

        # Scale the inputs using the trained scaler
        scaled_inputs = scaler.transform(inputs)

        # Make predictions using each model
        results = {
            "cooler_condition": int(models["cooler_condition"].predict(scaled_inputs)[0]),
            "valve_condition": int(models["valve_condition"].predict(scaled_inputs)[0]),
            "internal_pump_leakage": int(models["internal_pump_leakage"].predict(scaled_inputs)[0]),
            "hydraulic_accumulator": int(models["hydraulic_accumulator"].predict(scaled_inputs)[0]),
        }

        # Add stability flag logic (adjust thresholds as necessary)
        results["stable_flag"] = int(
            results["internal_pump_leakage"] == 0 and results["hydraulic_accumulator"] < 150
        )

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
