import React from "react";
import MachineMonitoring from "./components/MachineMonitoring";
import "./App.css";

function App() {
  return (
    <div className="relative min-h-screen p-4  bg-gray-200  py-10 px-10">
      <div className="text-lg font-bold tracking-tight text-gray-900 sm:text-3xl my-4 text-center text-blue-950">Machine Profile Predictor</div>
      <MachineMonitoring />
    </div>
  );
}

export default App;

