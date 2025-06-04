import React, { useState } from "react";
import axios from "axios";

function App() {
  const [mode, setMode] = useState("");
  const [id, setId] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state

  const handleSubmit = async () => {
    if ((mode === "enroll" || mode === "delete") && !id) {
      alert("Please enter an ID");
      return;
    }

    setLogs([]);
    setLoading(true);

    try {
      let response;
      if (mode === "enroll") {
        response = await axios.post("http://localhost:5000/enroll", { id });
      } else if (mode === "delete") {
        response = await axios.post("http://localhost:5000/delete", { id });
      } else if (mode === "search") {
        response = await axios.get("http://localhost:5000/search");
      }

      setLogs(response.data.messages || ["No response"]);
    } catch (err) {
      setLogs(["Error connecting to backend"]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Fingerprint Manager
        </h1>

        <div className="flex justify-around mb-4">
          <button
            onClick={() => setMode("enroll")}
            className={`px-4 py-2 rounded ${
              mode === "enroll" ? "bg-blue-500 text-white" : "bg-blue-100"
            }`}
          >
            Enroll
          </button>
          <button
            onClick={() => setMode("delete")}
            className={`px-4 py-2 rounded ${
              mode === "delete" ? "bg-red-500 text-white" : "bg-red-100"
            }`}
          >
            Delete
          </button>
          <button
            onClick={() => setMode("search")}
            className={`px-4 py-2 rounded ${
              mode === "search" ? "bg-green-500 text-white" : "bg-green-100"
            }`}
          >
            Search
          </button>
        </div>

        {(mode === "enroll" || mode === "delete") && (
          <input
            type="number"
            placeholder="Enter ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full border p-2 rounded mb-4"
            disabled={loading}
          />
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white py-2 rounded mb-4"
          disabled={loading}
        >
          {loading ? "Processing..." : "Send Command"}
        </button>

        <div className="bg-gray-50 p-4 rounded h-48 overflow-y-auto border text-sm">
          {logs.length === 0 && !loading && <div>No logs yet.</div>}
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
          {loading && <div className="italic text-gray-500">Loading...</div>}
        </div>
      </div>
    </div>
  );
}

export default App;
