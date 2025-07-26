// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import AdminPage from "./pages/AdminPage";
// import IdlePage from "./pages/IdlePage";
import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [mode, setMode] = useState("");
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [email, setEmail] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scannedIds, setScannedIds] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  const handleSubmit = async () => {
    if ((mode === "enroll" || mode === "delete") && !id) {
      toast.warning("Please enter an ID");
      return;
    }

    setLogs([]);
    setLoading(true);

    try {
      let response;

      if (mode === "enroll") {
        response = await axios.post("http://localhost:5000/enroll", {
          id,
          name,
          birthdate,
          email,
        });
        setLogs(response.data.messages || ["Enrolled successfully"]);
        toast.success("User enrolled successfully");

        setName("");
        setBirthdate("");
        setEmail("");
        setId("");
      } else if (mode === "delete") {
        response = await axios.post("http://localhost:5000/delete", { id });
        setLogs(response.data.messages || ["Deleted successfully"]);
        toast.warn("User deleted successfully");
        setId("");
      } else if (mode === "search") {
        response = await axios.get("http://localhost:5000/search");
        const foundId = response.data.id;

        if (foundId) {
          setScannedIds((prev) => [...new Set([foundId, ...prev])]);

          const info = response.data.info;
          setUserInfo(info);

          const displayName = info?.name || "Unknown";
          const scanTime = info?.scanned_at || "N/A";

          setLogs([
            `Fingerprint matched with ID: ${foundId}`,
            `Name: ${displayName}`,
            `Scanned at: ${scanTime}`,
          ]);

          toast.success(`Welcome, ${displayName}`);
        } else {
          setUserInfo(null);
          setLogs(["No fingerprint match found."]);
          toast.info("No fingerprint match found.");
        }
      }
    } catch (err) {
      setLogs(["Error connecting to backend"]);
      toast.error("Failed to connect to the backend.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // <Router>
    //   <Routes>
    //     <Route path="/" element={<IdlePage />} />
    //     <Route path="/admin" element={<AdminPage />} />
    //   </Routes>
    // </Router>
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Fingerprint Manager
        </h1>

        <div className="flex justify-around mb-4">
          <button
            onClick={() => setMode("enroll")}
            className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
              mode === "enroll"
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            Enroll
          </button>
          <button
            onClick={() => setMode("delete")}
            className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
              mode === "delete"
                ? "bg-red-600 text-white"
                : "bg-red-100 text-red-800"
            }`}
          >
            Delete
          </button>
          <button
            onClick={() => setMode("search")}
            className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
              mode === "search"
                ? "bg-green-600 text-white"
                : "bg-green-100 text-green-800"
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

        {mode === "enroll" && (
          <>
            <input
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded mb-2"
              disabled={loading}
            />
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full border p-2 rounded mb-2"
              disabled={loading}
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              disabled={loading}
            />
          </>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white py-2 rounded-full hover:bg-gray-900 transition duration-200 mb-4"
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

        {userInfo && (
          <div className="mt-6 bg-white border p-4 rounded shadow text-sm">
            <h3 className="font-semibold mb-2">Matched User Info</h3>
            <p>
              <strong>Name:</strong> {userInfo.name}
            </p>
            <p>
              <strong>Birthdate:</strong> {userInfo.birthdate}
            </p>
            <p>
              <strong>Email:</strong> {userInfo.email || "N/A"}
            </p>
            <p>
              <strong>Scanned At:</strong> {userInfo.scanned_at}
            </p>
          </div>
        )}

        {scannedIds.length > 0 && (
          <div className="mt-6 bg-white border p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Scanned Fingerprint IDs</h3>
            <ul className="list-disc list-inside text-sm">
              {scannedIds.map((sid, idx) => (
                <li key={idx}>{sid}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default App;
