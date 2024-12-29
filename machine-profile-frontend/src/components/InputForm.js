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

  const mapCoolerCondition = (value) => {
    switch (value) {
      case 3:
        return "Close to total failure";
      case 20:
        return "Reduced efficiency";
      case 100:
        return "Full efficiency";
      default:
        return "Unknown condition";
    }
  };

  const mapInternalPumpLeakage = (value) => {
    switch (value) {
      case 0:
        return "No leakage";
      case 1:
        return "Weak leakage";
      case 2:
        return "Severe leakage";
      default:
        return "Unknown condition";
    }
  };

  const mapHydraulicAccumulator = (value) => {
    switch (value) {
      case 130:
        return "Optimal pressure";
      case 115:
        return "Slightly reduced pressure";
      case 100:
        return "Severely reduced pressure";
      case 90:
        return "Close to total failure";
      default:
        return "Unknown condition";
    }
  };

  const mapStableFlag = (value) => {
    switch (value) {
      case 0:
        return "Conditions were stable";
      case 1:
        return "Static conditions might not have been reached yet";
      default:
        return "Unknown flag";
    }
  };

  return (
    <div className="form-container items-center">
      <form onSubmit={handleSubmit} className=" mx-10 px-10">
        <label className="block text-gray-950 text-sm font-bold mb-2 pr-8">
          Pressure:
          <input
            className="border border-gray-200 p-1 rounded-md mx-1" 
            type="number"
            step="0.01"
            name="pressure"
            value={formData.pressure}
            onChange={handleChange}
            required
          />
        </label>
        <label className="block text-gray-950 text-sm font-bold mb-2">
          Temperature:
          <input
            className="border border-gray-200 p-1 rounded-md mx-1"
            type="number"
            step="0.01"
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
            required
          />
        </label>
        <label className="block text-gray-950 text-sm font-bold mb-2">
          Vibration:
          <input
            className="border border-gray-200 p-1 rounded-md mx-1"
            type="number"
            step="0.01"
            name="vibration"
            value={formData.vibration}
            onChange={handleChange}
            required
          />
        </label>
        <label className="block text-gray-950 text-sm font-bold mb-2"> 
          Volume Flow:
          <input
            className="border border-gray-200 p-1 rounded-md mx-1"
            type="number"
            step="0.01"
            name="volume_flow"
            value={formData.volume_flow}
            onChange={handleChange}
            required
          />
        </label>
        <label className="block text-gray-950 text-sm font-bold mb-2 mr-8 ">
          Motor Power:
          <input
            className="border border-gray-200 p-1 rounded-md mx-1"
            type="number"
            step="0.01"
            name="motor_power"
            value={formData.motor_power}
            onChange={handleChange}
            required
          />
        </label>
        <button className="bg-blue-400 text-white font-bold py-2 px-4 rounded items-center my-10" type="submit">Get Prediction</button>
      </form>

      {error && <p className="error">{error}</p>}


      {result && (
        <div className="result my-2 mx-20">
          <div className="text-lg my-5">Prediction Results:</div>
          <p>
            <strong>Cooler Condition:</strong> {mapCoolerCondition(result.cooler_condition)} 
            (Code: {result.cooler_condition})
          </p>
          <p>
            <strong>Internal Pump Leakage:</strong> {mapInternalPumpLeakage(result.internal_pump_leakage)} 
            (Code: {result.internal_pump_leakage})
          </p>
          <p>
            <strong>Hydraulic Accumulator:</strong> {mapHydraulicAccumulator(result.hydraulic_accumulator)} 
            (Code: {result.hydraulic_accumulator})
          </p>
          <p>
            <strong>Stable Flag:</strong> {mapStableFlag(result.stable_flag)} 
            (Code: {result.stable_flag})
          </p>
        </div>
      )}

<div className="guidance my-5 mx-10 p-4 border rounded bg-gray-100 text-sm">
        <h3 className="font-bold mb-2">Guidance for Target Condition Values:</h3>
        <p><strong>Cooler condition / %:</strong></p>
        <ul>
          <li>3: Close to total failure</li>
          <li>20: Reduced efficiency</li>
          <li>100: Full efficiency</li>
        </ul>
        <p><strong>Internal pump leakage:</strong></p>
        <ul>
          <li>0: No leakage</li>
          <li>1: Weak leakage</li>
          <li>2: Severe leakage</li>
        </ul>
        <p><strong>Hydraulic accumulator / bar:</strong></p>
        <ul>
          <li>130: Optimal pressure</li>
          <li>115: Slightly reduced pressure</li>
          <li>100: Severely reduced pressure</li>
          <li>90: Close to total failure</li>
        </ul>
        <p><strong>Stable flag:</strong></p>
        <ul>
          <li>0: Conditions were stable</li>
          <li>1: Static conditions might not have been reached yet</li>
        </ul>
      </div>
      

      {/* {result && (
        <div className="result">
          <h3>Prediction Results:</h3>
          <p>Cooler Condition: {result.cooler_condition}</p>
          <p>Internal Pump Leakage: {result.internal_pump_leakage}</p>
          <p>Hydraulic Accumulator: {result.hydraulic_accumulator}</p>
          <p>Stable Flag: {result.stable_flag}</p>
        </div>
      )} */}
    </div>
  );
}

export default InputForm;
