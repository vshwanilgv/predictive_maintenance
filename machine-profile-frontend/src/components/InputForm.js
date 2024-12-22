import React, { useState } from "react";
import axios from "axios";


function InputForm() {
  const [formData, setFormData] = useState({
    pressure: "",
    temperature: "",
    vibration: "",
    volume_flow: "",
    motor_power: "",
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", formData);
      setResult(response.data);
    } catch (err) {
      setError("Error fetching prediction. Check backend or inputs.");
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <label>
          Pressure:
          <input
            type="number"
            step="0.01"
            name="pressure"
            value={formData.pressure}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Temperature:
          <input
            type="number"
            step="0.01"
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Vibration:
          <input
            type="number"
            step="0.01"
            name="vibration"
            value={formData.vibration}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Volume Flow:
          <input
            type="number"
            step="0.01"
            name="volume_flow"
            value={formData.volume_flow}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Motor Power:
          <input
            type="number"
            step="0.01"
            name="motor_power"
            value={formData.motor_power}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit">Get Prediction</button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <h3>Prediction Results:</h3>
          <p>Cooler Condition: {result.cooler_condition}</p>
          <p>Internal Pump Leakage: {result.internal_pump_leakage}</p>
          <p>Hydraulic Accumulator: {result.hydraulic_accumulator}</p>
          <p>Stable Flag: {result.machine_stability}</p>
        </div>
      )}
    </div>
  );
}

export default InputForm;
