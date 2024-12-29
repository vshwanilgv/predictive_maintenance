import React from "react";
import InputForm from "./components/InputForm";
import "./App.css";

function App() {
  return (
    <div className="relative min-h-screen p-4  bg-gray-900 bg-opacity-60 py-10">
      <div className="text-lg font-bold tracking-tight text-gray-900 sm:text-2xl my-4 text-center">Machine Profile Predictor</div>
      <InputForm />
    </div>
  );
}

export default App;

