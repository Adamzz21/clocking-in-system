import React, { useEffect, useState } from "react";
import axios from "axios";

function IdlePage() {
  const [userInfo, setUserInfo] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get("http://localhost:5000/search");
        setLogs(response.data.messages || []);
        setUserInfo(response.data.info || null);
      } catch (err) {
        setLogs(["Error communicating with backend."]);
        setUserInfo(null);
      }
    }, 6000); // every 6 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Idle Fingerprint Scanner</h1>

      <div className="bg-gray-100 p-3 rounded h-40 overflow-y-auto mb-4">
        {logs.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      {userInfo ? (
        <div className="bg-green-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Matched User</h2>
          <p>
            <strong>Name:</strong> {userInfo.name}
          </p>
          <p>
            <strong>Email:</strong> {userInfo.email}
          </p>
          <p>
            <strong>Birthdate:</strong> {userInfo.birthdate}
          </p>
          <p>
            <strong>Scanned at:</strong> {userInfo.scanned_at}
          </p>
        </div>
      ) : (
        <p className="text-gray-600">No user matched yet.</p>
      )}
    </div>
  );
}

export default IdlePage;
