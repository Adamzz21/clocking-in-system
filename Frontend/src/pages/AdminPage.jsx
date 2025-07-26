import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminPage() {
  const [mode, setMode] = useState("");
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [email, setEmail] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!mode || !id) return toast.error("Select mode and provide ID");

    try {
      setLoading(true);
      let response;
      if (mode === "enroll") {
        response = await axios.post("http://localhost:5000/enroll", {
          id,
          name,
          birthdate,
          email,
        });
      } else if (mode === "delete") {
        response = await axios.post("http://localhost:5000/delete", { id });
      }
      setLogs(response.data.messages || []);
      toast.success("Operation complete");
    } catch (err) {
      toast.error("Failed to communicate with backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setMode("enroll")}
          className="bg-blue-500 px-4 py-2 text-white rounded"
        >
          Enroll
        </button>
        <button
          onClick={() => setMode("delete")}
          className="bg-red-500 px-4 py-2 text-white rounded"
        >
          Delete
        </button>
      </div>

      <input
        placeholder="ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
        className="block mb-2 p-2 border"
      />
      {mode === "enroll" && (
        <>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block mb-2 p-2 border"
          />
          <input
            placeholder="Birthdate"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="block mb-2 p-2 border"
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block mb-4 p-2 border"
          />
        </>
      )}
      <button
        onClick={handleAction}
        className="bg-green-600 px-4 py-2 text-white rounded"
        disabled={loading}
      >
        {loading ? "Processing..." : "Send Command"}
      </button>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Logs</h2>
        <div className="bg-gray-100 p-3 mt-2 rounded h-40 overflow-y-auto">
          {logs.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default AdminPage;
