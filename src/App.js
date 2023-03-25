import React from "react";
import "./App.css";
import AudioRecording from "./components/AudioRecording";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Ai passenger</h1>
      </header>
      <main className="App-main">
        <AudioRecording />
      </main>
    </div>
  );
}

export default App;
