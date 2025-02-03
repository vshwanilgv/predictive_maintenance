import React, { useState, useEffect } from "react";
import axios from "axios";

const MachineMonitoring = () => {
  const [manualInput, setManualInput] = useState({
    pressure: "",
    temperature: "",
    vibration: "",
    volume_flow: "",
    motor_power: "",
  });
  const [iotData, setIotData] = useState(null);
  const [manualData, setManualData] = useState(null);

  useEffect(() => {
    const fetchIotData = () => {
      axios
        .get("http://127.0.0.1:5000/latest")
        .then((response) => setIotData(response.data))
        .catch((error) => console.error("Error fetching IoT data:", error));
    };

    fetchIotData();
    const interval = setInterval(fetchIotData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://127.0.0.1:5000/manual", manualInput)
      .then((response) => setManualData(response.data))
      .catch((error) => console.error("Error submitting manual data:", error));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setManualInput((prevInput) => ({ ...prevInput, [name]: value }));
  };

  // const mapCoolerCondition = (value) => {
  //   switch (value) {
  //     case 3:
  //       return "Close to total failure";
  //     case 20:
  //       return "Reduced efficiency";
  //     case 100:
  //       return "Full efficiency";
  //     default:
  //       return "Unknown condition";
  //   }
  // };

  // const mapInternalPumpLeakage = (value) => {
  //   switch (value) {
  //     case 0:
  //       return "No leakage";
  //     case 1:
  //       return "Weak leakage";
  //     case 2:
  //       return "Severe leakage";
  //     default:
  //       return "Unknown condition";
  //   }
  // };

  // const mapHydraulicAccumulator = (value) => {
  //   switch (value) {
  //     case 130:
  //       return "Optimal pressure";
  //     case 115:
  //       return "Slightly reduced pressure";
  //     case 100:
  //       return "Severely reduced pressure";
  //     case 90:
  //       return "Close to total failure";
  //     default:
  //       return "Unknown condition";
  //   }
  // };

  // const mapStableFlag = (value) => {
  //   switch (value) {
  //     case 0:
  //       return "Conditions were stable";
  //     case 1:
  //       return "Static conditions might not have been reached yet";
  //     default:
  //       return "Unknown flag";
  //   }
  // };

  const getStatusBadge = (status) => {
    let color = "bg-blue"; 
    let text = "Unknown";

    if (status === "Normal") {
      color = "bg-green-500";
      text = "✅ Normal";
    } else if (status === "Warning") {
      color = "bg-yellow-500";
      text = "⚠️ Warning";
    } else if (status === "Critical") {
      color = "bg-red-500";
      text = "❌ Critical";
    }

    return <span className={`px-8 py-1 text-blue-800 rounded-lg ${color}`}>{text}</span>;
  };

  const mapCoolerCondition = (value) => {
    if (value === 100) return { label: "Full efficiency", status: "Normal" };
    if (value === 20) return { label: "Reduced efficiency", status: "Warning" };
    if (value === 3) return { label: "Close to total failure", status: "Critical" };
    return { label: "Unknown condition", status: "Unknown" };
  };

  const mapInternalPumpLeakage = (value) => {
    if (value === 0) return { label: "No leakage", status: "Normal" };
    if (value === 1) return { label: "Weak leakage", status: "Warning" };
    if (value === 2) return { label: "Severe leakage", status: "Critical" };
    return { label: "Unknown condition", status: "Unknown" };
  };

  const mapHydraulicAccumulator = (value) => {
    if (value === 130) return { label: "Optimal pressure", status: "Normal" };
    if (value === 115) return { label: "Slightly reduced pressure", status: "Warning" };
    if (value === 100) return { label: "Severely reduced pressure", status: "Critical" };
    if (value === 90) return { label: "Close to total failure", status: "Critical" };
    return { label: "Unknown condition", status: "Unknown" };
  };
 
  const mapStableFlag = (value) => {
    if (value === 0) return { label: "Conditions were stable", status: "Normal" };
    if (value === 1) return { label: "Static conditions might not have been reached yet", status:"Warning"};
    return { label: "Unknown condition", status:"Unknown"};
  };

  const renderPredictions = (predictions) => (
    <div>
      <p>
        <strong>Cooler Condition: </strong>
        {mapCoolerCondition(predictions.cooler_condition)} ({predictions.cooler_condition})
      </p>
      <p>
        <strong>Internal Pump Leakage: </strong>
        {mapInternalPumpLeakage(predictions.internal_pump_leakage)} ({predictions.internal_pump_leakage})
      </p>
      <p>
        <strong>Hydraulic Accumulator: </strong>
        {mapHydraulicAccumulator(predictions.hydraulic_accumulator)} ({predictions.hydraulic_accumulator})
      </p>
      <p>
        <strong>Stable Flag: </strong>
        {mapStableFlag(predictions.stable_flag)} ({predictions.stable_flag})
      </p>
    </div>
  );

  return (
    <div className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl my-4 p-4">

      <section >
        <div className="text-blue-800 text-xl">IoT Sensor Data</div>
        {iotData && iotData.sensor_data ? (
          <div  className="my-2 mx-5 py-5"> 
            <div>Sensor Data</div>
            <pre style={{ backgroundColor: "#f0f0f0", padding: "10px" }}>
              {JSON.stringify(iotData.sensor_data, null, 2)}
            </pre>
            {/* <div className="my-2">Predictions</div>
            {renderPredictions(iotData.predictions)} */}
            <div className="my-2 mx-8 py-5">
            <div className="mb-4">
              <strong>Cooler Condition:</strong> {mapCoolerCondition(iotData.predictions.cooler_condition).label}{" "}
              {getStatusBadge(mapCoolerCondition(iotData.predictions.cooler_condition).status)}
            </div>
            <div className="mb-4">
              <strong>Internal Pump Leakage:</strong> {mapInternalPumpLeakage(iotData.predictions.internal_pump_leakage).label}{" "}
              {getStatusBadge(mapInternalPumpLeakage(iotData.predictions.internal_pump_leakage).status)}
            </div>
            <div className="mb-4">
              <strong>Hydraulic Accumulator:</strong> {mapHydraulicAccumulator(iotData.predictions.hydraulic_accumulator).label}{" "}
              {getStatusBadge(mapHydraulicAccumulator(iotData.predictions.hydraulic_accumulator).status)}
            </div>
            <div className="mb-4">
              <strong>Stability:</strong> {mapStableFlag(iotData.predictions.stable_flag).label}{" "}
              {getStatusBadge(mapStableFlag(iotData.predictions.stable_flag).status)}
            </div>
          </div>

          </div>
        ) : (
          <p>No data received from sensors yet.</p>
        )}
      </section>

      {/* <section style={{ marginBottom: "40px" }}>
        <div className="text-blue-900">Manual Data Entry</div>
        <form onSubmit={handleSubmit}>
          {Object.keys(manualInput).map((key) => (
            <div key={key} style={{ marginBottom: "10px", display: "flex", marginLeft: "25px", marginTop: "10px" }}>
              <label style={{ marginRight: "10px" }}>{key}:</label>
              <input
                className="rounded-lg"
                type="number"
                name={key}
                value={manualInput[key]}
                onChange={handleInputChange}
                style={{ padding: "5px", width: "200px" }}
              />
            </div>
          ))}
          <button
            type="submit"
            className="rounded-lg mx-40"
            style={{
              padding: "10px 10px",
              backgroundColor: "#007BFF",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Submit
          </button>
        </form>
      </section>

      <section>
        <div className="mx-8">Manual Data Predictions</div>
        {manualData && manualData.sensor_data ? (
          <div>
            <h3>Sensor Data</h3>
            <pre style={{ backgroundColor: "#f0f0f0", padding: "10px" }}>
              {JSON.stringify(manualData.sensor_data, null, 2)}
            </pre>
            <h3>Predictions</h3>
            {renderPredictions(manualData.predictions)}
          </div>
        ) : (
          <div className="mx-8" >No manual data submitted yet.</div>
        )}
      </section> */}
    </div>
  );
};

export default MachineMonitoring;
